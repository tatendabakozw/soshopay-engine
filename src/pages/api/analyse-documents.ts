import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs/promises';
import OpenAI from 'openai';
import pdf from 'pdf-parse';

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new IncomingForm({ multiples: true });
    const [fields, files] = await form.parse(req);

    const fileEntries = Object.entries(files);
    if (fileEntries.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const analysisResults = await Promise.all(
      fileEntries.map(async ([key, fileArray]) => {
        const file = fileArray[0];
        const buffer = await fs.readFile(file.filepath);
        const data = await pdf(buffer);
        const content = data.text;

        const maxLength = 4000;
        const truncatedContent = content.length > maxLength 
          ? content.slice(0, maxLength) + '...(truncated)'
          : content;

        const response = await openai.chat.completions.create({
          model: "gpt-4-turbo",
          messages: [
            { role: "system", content: "You are an AI assistant specialized in analyzing loan application documents. Your task is to extract all relevant user information and provide a comprehensive analysis." },
            { role: "user", content: `Please analyze the following document for a loan application. Extract ALL relevant user information you can find, including but not limited to: full name, date of birth, contact details, address, employment information, income, existing debts, assets, and any other details that might be relevant for a loan application. Also, provide a brief summary of key points and any potential red flags.

            Format your response as JSON with the following structure:
            {
              "analysis": "Brief summary and any red flags",
              "userInfo": {
                "fullName": "",
                "dateOfBirth": "",
                "contactNumber": "",
                "emailAddress": "",
                "homeAddress": "",
                "employmentStatus": "",
                "employer": "",
                "monthlyIncome": "",
                "existingDebts": "",
                "assets": ""
              },
              "additionalInfo": {
                // Any other relevant information found in the document
              }
            }

            Here's the document content:

            ${truncatedContent}` }
          ],
          max_tokens: 500,
        });

        const analysisResult = JSON.parse(response.choices[0].message?.content || '{}');
        await fs.unlink(file.filepath);
        return analysisResult;
      })
    );

    res.status(200).json(analysisResults);
  } catch (error: any) {
    console.error('Error analyzing documents:', error);
    res.status(500).json({ error: 'Error analyzing documents' });
  }
}