import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// Define the expanded LoanDetails type to accommodate all fields
interface LoanDetails {
  clientName: string;
  nationalId: string;
  loanType: 'Cash Loan' | 'Pay-as-You-Go Loan';
  dob: string;
  contactNumber: string;
  homeAddress: string;
  loanAmount: number;
  collateral: 'Yes' | 'No';
  collateralValue: number;
  monthlyIncome: number;
  expenses: {
    grocery: number;
    rent: number;
    utilities: number;
    schoolFees: number;
  };
  fcbScore: 'Good' | 'Fair' | 'Adverse';
  runningLoans: 'Yes' | 'No';
  repaymentHistory: 'Good' | 'Fair' | 'Adverse';
  yearsInBusiness: number;
}

// Define the validation error type
interface ValidationError {
  error: string;
}

// Credit scoring rules
const CREDIT_RULES: Record<string, string> = {
  'Cash Loan': `
    - Income: 0-20 points (Higher income = Higher score)
    - Credit History: 0-30 points (Better history = Higher score)
    - Debt-to-Income Ratio: 0-20 points (Lower ratio = Higher score)
    - Collateral: 0-30 points (More valuable collateral = Higher score)
    
    Risk Levels:
    - 0-50: High Risk
    - 51-75: Medium Risk
    - 76-100: Low Risk
  `,
  'Pay-as-You-Go Loan': `
    - Payment History: 0-30 points (Better history = Higher score)
    - Usage Pattern: 0-20 points (Consistent usage = Higher score)
    - Length of Relationship: 0-20 points (Longer = Higher score)
    - Average Transaction Value: 0-30 points (Higher value = Higher score)
    
    Risk Levels:
    - 0-50: High Risk
    - 51-75: Medium Risk
    - 76-100: Low Risk
  `,
};

// New interface for storing chat context
interface ChatContext {
  messages: { role: string; content: string }[];
}

// Simple in-memory storage for chat contexts
const chatContexts: Record<string, ChatContext> = {};

const generateDueDiligenceReport = async (loanType: string, loanDetails: LoanDetails, contextId: string): Promise<string> => {
  // Initialize context if it doesn't exist
  if (!chatContexts[contextId]) {
    chatContexts[contextId] = { messages: [] };
  }

  const context = chatContexts[contextId];

  // Prepare the system message with credit scoring rules
  const systemMessage = {
    role: 'system',
    content: `You are an expert in credit scoring for ${loanType}. The following are the credit scoring rules for this loan type:\n\n${CREDIT_RULES[loanType]}`
  };

  // Prepare the user message with loan details
  const userMessage = {
    role: 'user',
    content: `
      Applicant details:
      - Client Name: ${loanDetails.clientName}
      - National ID: ${loanDetails.nationalId}
      - Date of Birth: ${loanDetails.dob}
      - Loan Amount: ${loanDetails.loanAmount}
      - Monthly Income: ${loanDetails.monthlyIncome}
      - Collateral: ${loanDetails.collateral} (${loanDetails.collateralValue})
      - Expenses: Grocery: ${loanDetails.expenses.grocery}, Rent: ${loanDetails.expenses.rent}, Utilities: ${loanDetails.expenses.utilities}, School Fees: ${loanDetails.expenses.schoolFees}
      - Years in Business: ${loanDetails.yearsInBusiness}
      - Credit History: ${loanDetails.fcbScore}
      - Repayment History: ${loanDetails.repaymentHistory}

      Based on the rules, calculate a score, determine risk, and provide a thorough due diligence report.
    `
  };

  // Combine previous context with new messages
  const messages = [
    systemMessage,
    ...context.messages,
    userMessage
  ];

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo',
        messages: messages,
        max_tokens: 1500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const aiResponse = response.data.choices[0].message.content;

    // Update context with the new messages
    context.messages.push(userMessage);
    context.messages.push({ role: 'assistant', content: aiResponse });

    // Limit context to last 10 messages to prevent token limit issues
    if (context.messages.length > 10) {
      context.messages = context.messages.slice(-10);
    }

    return aiResponse;
  } catch (error: any) {
    console.error('Error calling OpenAI:', error.response?.data || error.message);
    throw new Error('Failed to generate report');
  }
};

// Middleware function to validate loan details
const validateLoanDetails = (loanDetails: LoanDetails): ValidationError | null => {
  if (!loanDetails.loanType) {
    return { error: 'Invalid or missing loan type' };
  }
  if (Object.keys(loanDetails).length === 0) {
    return { error: 'Loan details are required' };
  }
  return null;
};

// Next.js API handler
// Updated Next.js API handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { loanDetails, contextId } = req.body;

  // Validate loan details
  const validationError = validateLoanDetails(loanDetails);
  if (validationError) {
    return res.status(400).json(validationError);
  }

  console.log('request details: ', loanDetails);

  // Generate the due diligence report
  try {
    const report = await generateDueDiligenceReport(loanDetails.loanType, loanDetails, contextId);
    return res.status(200).json({ report, contextId });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
