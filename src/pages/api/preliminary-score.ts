import type { NextApiRequest, NextApiResponse } from "next";

// Define the expected shape of the incoming request body
type PreliminaryScoreRequestBody = {
  monthly_income: number;
  monthly_expenses: number;
  collateral: boolean;
  business_type: string;
  years_in_business: number;
  loan_amount: number;
  payback_period: number;
};

// Define the response shape
type ScoreResponse = {
  preliminary_score: number;
  risk_category: string;
};

// Function for calculating preliminary score for General Cash Loans
const calculatePreliminaryScoreGeneralLoan = (
  monthly_income: number,
  monthly_expenses: number,
  collateral: boolean,
  business_type: string,
  years_in_business: number,
  loan_amount: number,
  payback_period: number
): number => {
  let score = 0;
  const income_to_expense_ratio =
    monthly_income / Math.max(monthly_expenses, 1);

  // Income-to-expense ratio scoring
  if (income_to_expense_ratio > 3) score += 25;
  else if (income_to_expense_ratio > 2) score += 20;
  else if (income_to_expense_ratio > 1.5) score += 15;
  else score += 10;

  // Collateral scoring
  score += collateral ? 20 : 10;

  // Business type and experience scoring
  if (business_type === "Established" && years_in_business > 5) score += 25;
  else if (years_in_business > 2) score += 20;
  else score += 10;

  // Loan-to-payback ratio scoring
  const loan_to_payback_ratio = loan_amount / Math.max(payback_period, 1);
  if (loan_to_payback_ratio < 200) score += 20;
  else if (loan_to_payback_ratio < 300) score += 15;
  else score += 10;

  return score;
};

// Function to determine risk category based on score
const getRiskCategory = (score: number): string => {
  if (score >= 80) return "Very low risk";
  if (score >= 60) return "Low risk";
  if (score >= 40) return "Moderate risk";
  if (score >= 20) return "High risk";
  return "Very high risk";
};

// API Handler
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ScoreResponse>
) {
  if (req.method === "POST") {
    const {
      monthly_income,
      monthly_expenses,
      collateral,
      business_type,
      years_in_business,
      loan_amount,
      payback_period,
    } = req.body as PreliminaryScoreRequestBody;

    // Calculate preliminary score
    const preliminary_score = calculatePreliminaryScoreGeneralLoan(
      monthly_income,
      monthly_expenses,
      collateral,
      business_type,
      years_in_business,
      loan_amount,
      payback_period
    );

    // Determine risk category
    const risk_category = getRiskCategory(preliminary_score);

    // Return the score and category as a JSON response
    return res.status(200).json({ preliminary_score, risk_category });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
