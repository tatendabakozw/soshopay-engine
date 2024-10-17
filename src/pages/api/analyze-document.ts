import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs/promises';
import OpenAI from 'openai';

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 60000; // 1 minute in milliseconds

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check rate limit
  const now = Date.now();
  if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
    return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
  }
  lastRequestTime = now;

  try {
    const form = new IncomingForm();
    const [fields, files] = await form.parse(req);

    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const content = await fs.readFile(file.filepath, 'utf8');
    
    // Truncate content if it's too long
    const maxLength = 4000; // Adjust this value as needed
    const truncatedContent = content.length > maxLength 
      ? content.slice(0, maxLength) + '...(truncated)'
      : content;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo", // Use a less expensive model
      messages: [
        { role: "system", content: "You are a helpful assistant that analyzes documents. Extract the users name and date of birth or any related fields if present." },
        { role: "user", content: `Please analyze the following document for a loan application. Provide a brief summary of key points, any red flags, and extract the client name and date of birth if present. Format your response as JSON with keys: analysis, clientName, and dob.\n\n${truncatedContent}` }
      ],
      max_tokens: 500, // Limit the response size
    });

    const rawContent = response.choices[0].message?.content || '';
    let analysisResult;
    try {
      analysisResult = JSON.parse(rawContent);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      // If parsing fails, return the raw content
      analysisResult = {
        analysis: rawContent,
        clientName: null,
        dob: null
      };
    }

    res.status(200).json(analysisResult);

    // Clean up the temp file
    await fs.unlink(file.filepath);
  } catch (error: any) {
    console.error('Error analyzing document:', error);
    if (error.response?.status === 429) {
      res.status(429).json({ error: 'OpenAI API rate limit exceeded. Please try again later.' });
    } else {
      res.status(500).json({ error: 'Error analyzing document' });
    }
  }
}