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
  guarantorRelationship: 'Close' | 'Distant' | 'None';
  guarantorIncome: number;
  productUsageHours?: number; // Only for PAYG loans
  productVerified?: boolean; // Only for PAYG loans
  subscriptionCost?: number; // Only for PAYG loans
  firstTimeBorrower: boolean;
  historyWithOtherMFIs: 'None' | 'Limited' | 'Frequent';
}

// Define the validation error type
interface ValidationError {
  error: string;
}

// Updated CREDIT_RULES
const CREDIT_RULES: Record<string, string> = {
  'Cash Loan': `
    1. Income-to-Expense Ratio (Affordability): 0-25 points
    2. Loan Amount: Evaluated but no direct points
    3. Guarantor Relationship: 0-10 points
    4. Guarantor's Income and Affordability: 0-15 points
    5. Collateral Value: 0-20 points
    6. Repayment History: -10 to 20 points
    7. FCB Credit Score: -10 to 25 points
    8. Age of Borrower: -5 to 10 points
    9. History with Other Microfinance Institutions: -10 to 10 points
    10. First-time Borrower with Good Affordability: 0-20 points

    Risk Levels:
    - 80-100: Very Low Risk (Approval recommended)
    - 60-79: Low Risk (Approval recommended)
    - 40-59: Moderate Risk (Discretionary approval)
    - 20-39: High Risk (Approval not recommended)
    - Below 20: Very High Risk (Reject application)
  `,
  'Pay-as-You-Go Loan': `
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
      - Guarantor Relationship: ${loanDetails.guarantorRelationship}
      - Guarantor Income: ${loanDetails.guarantorIncome}
      - First Time Borrower: ${loanDetails.firstTimeBorrower}
      - History with Other MFIs: ${loanDetails.historyWithOtherMFIs}
      ${loanType === 'Pay-as-You-Go Loan' ? `
      - Product Usage Hours: ${loanDetails.productUsageHours}
      - Product Verified: ${loanDetails.productVerified}
      - Subscription Cost: ${loanDetails.subscriptionCost}
      ` : ''}

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
