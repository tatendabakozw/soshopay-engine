import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

interface PAYGLoanDetails {
  clientName: string;
  nationalId: string;
  dob: string;
  contactNumber: string;
  homeAddress: string;
  loanAmount: number;
  monthlyIncome: number;
  expenses: {
    grocery: number;
    rent: number;
    utilities: number;
    schoolFees: number;
  };
  fcbScore: 'Good' | 'Fair' | 'Adverse';
  guarantorRelationship: 'Close' | 'Distant' | 'None';
  guarantorIncome: number;
  firstTimeBorrower: boolean;
  historyWithOtherMFIs: 'None' | 'Limited' | 'Frequent';
  productUsageHours: number;
  productVerified: boolean;
  subscriptionCost: number;
}

interface ValidationError {
  error: string;
}

const PAYG_LOAN_RULES = `
  1. Monthly Income-to-Expense Ratio: 0-25 points
  2. Product Dependency (Hours of Usage): 0-20 points
  3. Credit History (FCB Score): -10 to 25 points
  4. Product Verification: -5 to 10 points
  5. Subscription-to-Usage Ratio: 0-20 points
  6. Guarantor Relationship: 0-10 points
  7. Guarantor's Income and Affordability: 0-15 points
  8. Age of Borrower: -5 to 10 points
  9. History with Other Microfinance Institutions: -10 to 10 points
  10. First-time Borrower with Good Affordability: 0-20 points

  Risk Levels:
  - 80-100: Very Low Risk (Approval recommended)
  - 60-79: Low Risk (Approval recommended)
  - 40-59: Moderate Risk (Discretionary approval)
  - 20-39: High Risk (Approval not recommended)
  - Below 20: Very High Risk (Reject application)
`;

interface ChatContext {
  messages: { role: string; content: string }[];
}

const chatContexts: Record<string, ChatContext> = {};

const generatePAYGLoanReport = async (loanDetails: PAYGLoanDetails, contextId: string): Promise<string> => {
  if (!chatContexts[contextId]) {
    chatContexts[contextId] = { messages: [] };
  }

  const context = chatContexts[contextId];

  const systemMessage = {
    role: 'system',
    content: `You are an expert in credit scoring for Pay-as-You-Go (PAYG) Loans. The following are the credit scoring rules:\n\n${PAYG_LOAN_RULES}`
  };

  const userMessage = {
    role: 'user',
    content: `
      PAYG Loan Applicant details:
      - Client Name: ${loanDetails.clientName}
      - National ID: ${loanDetails.nationalId}
      - Date of Birth: ${loanDetails.dob}
      - Loan Amount: ${loanDetails.loanAmount}
      - Monthly Income: ${loanDetails.monthlyIncome}
      - Expenses: Grocery: ${loanDetails.expenses.grocery}, Rent: ${loanDetails.expenses.rent}, Utilities: ${loanDetails.expenses.utilities}, School Fees: ${loanDetails.expenses.schoolFees}
      - Credit History: ${loanDetails.fcbScore}
      - Guarantor Relationship: ${loanDetails.guarantorRelationship}
      - Guarantor Income: ${loanDetails.guarantorIncome}
      - First Time Borrower: ${loanDetails.firstTimeBorrower}
      - History with Other MFIs: ${loanDetails.historyWithOtherMFIs}
      - Product Usage Hours: ${loanDetails.productUsageHours}
      - Product Verified: ${loanDetails.productVerified}
      - Subscription Cost: ${loanDetails.subscriptionCost}

      Based on the rules, calculate a score, determine risk, and provide a thorough due diligence report for this PAYG Loan application.
    `
  };

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

    context.messages.push(userMessage);
    context.messages.push({ role: 'assistant', content: aiResponse });

    if (context.messages.length > 10) {
      context.messages = context.messages.slice(-10);
    }

    return aiResponse;
  } catch (error: any) {
    console.error('Error calling OpenAI:', error.response?.data || error.message);
    throw new Error('Failed to generate report');
  }
};

const validatePAYGLoanDetails = (loanDetails: PAYGLoanDetails): ValidationError | null => {
  if (Object.keys(loanDetails).length === 0) {
    return { error: 'Loan details are required' };
  }
  // Add more specific validations as needed
  return null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { loanDetails, contextId } = req.body;

  const validationError = validatePAYGLoanDetails(loanDetails);
  if (validationError) {
    return res.status(400).json(validationError);
  }

  console.log('PAYG Loan request details: ', loanDetails);

  try {
    const report = await generatePAYGLoanReport(loanDetails, contextId);
    return res.status(200).json({ report, contextId });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}