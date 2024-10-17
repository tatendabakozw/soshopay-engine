import type { NextApiRequest, NextApiResponse } from "next";

// Define the expected shape of the incoming request body
type FinalScoreRequestBody = {
  monthly_income: number;
  monthly_expenses: number;
  collateral: boolean;
  business_type: string;
  years_in_business: number;
  loan_amount: number;
  payback_period: number;
  preliminary_score: number;
  fcb_score: "Good" | "Fair" | "Adverse";
  collateral_validity: boolean;
  running_loans: boolean;
  repayment_history: "Good" | "Fair" | "Adverse";
};

// Define the response shape
type ScoreResponse = {
  final_score: number;
  risk_category: string;
};

// Adjusted weights for each variable
const WEIGHTS = {
  income_to_expense_ratio: 30, // 30% weight
  collateral: 20, // 20% weight
  business_type: 15, // 15% weight
  years_in_business: 15, // 15% weight
  loan_amount: 10, // 10% weight
  payback_period: 10, // 10% weight
};

// Function to calculate weighted preliminary score
const calculatePreliminaryScore = (
  monthly_income: number,
  monthly_expenses: number,
  collateral: boolean,
  business_type: string,
  years_in_business: number,
  loan_amount: number,
  payback_period: number
): number => {
  let score = 0;

  // Calculate income to expense ratio score
  const income_to_expense_ratio =
    monthly_income / Math.max(monthly_expenses, 1);
  if (income_to_expense_ratio > 3)
    score += 30 * (WEIGHTS.income_to_expense_ratio / 100);
  else if (income_to_expense_ratio > 2)
    score += 25 * (WEIGHTS.income_to_expense_ratio / 100);
  else if (income_to_expense_ratio > 1.5)
    score += 20 * (WEIGHTS.income_to_expense_ratio / 100);
  else if (income_to_expense_ratio > 1)
    score += 15 * (WEIGHTS.income_to_expense_ratio / 100);
  else if (income_to_expense_ratio > 0.5)
    score += 10 * (WEIGHTS.income_to_expense_ratio / 100);
  else score += 5 * (WEIGHTS.income_to_expense_ratio / 100);

  // Collateral scoring
  score += collateral
    ? 20 * (WEIGHTS.collateral / 100)
    : 10 * (WEIGHTS.collateral / 100);

  // Business type and experience scoring
  if (business_type === "Established" && years_in_business > 5)
    score += 15 * (WEIGHTS.business_type / 100);
  else if (business_type === "Established")
    score += 10 * (WEIGHTS.business_type / 100);
  else score += 5 * (WEIGHTS.business_type / 100);

  // Years in Business scoring
  if (years_in_business > 10) score += 15 * (WEIGHTS.years_in_business / 100);
  else if (years_in_business > 5)
    score += 12 * (WEIGHTS.years_in_business / 100);
  else if (years_in_business > 2)
    score += 10 * (WEIGHTS.years_in_business / 100);
  else score += 5 * (WEIGHTS.years_in_business / 100);

  // Loan Amount scoring
  const loanToIncomeRatio = loan_amount / Math.max(monthly_income, 1);
  if (loanToIncomeRatio < 0.5) score += 10 * (WEIGHTS.loan_amount / 100);
  else if (loanToIncomeRatio < 0.75) score += 7 * (WEIGHTS.loan_amount / 100);
  else if (loanToIncomeRatio < 1) score += 5 * (WEIGHTS.loan_amount / 100);
  else score += 3 * (WEIGHTS.loan_amount / 100);

  // Payback Period scoring
  if (payback_period <= 12) score += 10 * (WEIGHTS.payback_period / 100);
  else if (payback_period <= 24) score += 7 * (WEIGHTS.payback_period / 100);
  else if (payback_period <= 36) score += 5 * (WEIGHTS.payback_period / 100);
  else score += 3 * (WEIGHTS.payback_period / 100);

  return score;
};

// Function for calculating the final score for General Cash Loans
const calculateFinalScoreGeneralLoan = (
  preliminary_score: number,
  fcb_score: "Good" | "Fair" | "Adverse",
  collateral_validity: boolean,
  running_loans: boolean,
  repayment_history: "Good" | "Fair" | "Adverse"
): number => {
  let final_score = preliminary_score;

  // FCB Score adjustments
  if (fcb_score === "Good") final_score += 10;
  else if (fcb_score === "Fair") final_score += 5;
  else final_score -= 10;

  // Collateral verification adjustment
  final_score += collateral_validity ? 10 : -10;

  // Running loans penalty
  if (running_loans) final_score -= 10;

  // Repayment history adjustment
  if (repayment_history === "Good") final_score += 10;
  else if (repayment_history === "Fair") final_score += 5;
  else final_score -= 10;

  return Math.max(0, Math.min(final_score, 100)); // Final score capped between 0 and 100
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
      preliminary_score,
      fcb_score,
      collateral_validity,
      running_loans,
      repayment_history,
    } = req.body as FinalScoreRequestBody;

    // Calculate weighted preliminary score
    const preliminary_score_calculated = calculatePreliminaryScore(
      monthly_income,
      monthly_expenses,
      collateral,
      business_type,
      years_in_business,
      loan_amount,
      payback_period
    );

    // Calculate final score
    const final_score = calculateFinalScoreGeneralLoan(
      preliminary_score_calculated,
      fcb_score,
      collateral_validity,
      running_loans,
      repayment_history
    );

    // Determine risk category
    const risk_category = getRiskCategory(final_score);

    // Return the score and category as a JSON response
    return res.status(200).json({ final_score, risk_category });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
