import type { NextApiRequest, NextApiResponse } from "next";

// Define the expected shape of the incoming request body
type FinalScoreRequestBody = {
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
      preliminary_score,
      fcb_score,
      collateral_validity,
      running_loans,
      repayment_history,
    } = req.body as FinalScoreRequestBody;

    // Calculate final score
    const final_score = calculateFinalScoreGeneralLoan(
      preliminary_score,
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
