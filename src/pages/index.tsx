// pages/loan-score.tsx
import { useState } from "react";
import axios from "axios";
import PrimaryButton from "@/components/PrimaryButton";
import PrimaryInput from "@/components/PrimaryInput";

export default function LoanScore() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    monthly_income: 0,
    monthly_expenses: 0,
    collateral: false,
    business_type: "",
    years_in_business: 0,
    loan_amount: 0,
    payback_period: 0,
  });

  const [result, setResult] = useState<{
    preliminary_score: number;
    risk_category: string;
  } | null>(null);

  // Handler to update state for form inputs
  const handleInputChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Submit form data to the API
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/preliminary-score", {
        ...formData,
        monthly_income: Number(formData.monthly_income),
        monthly_expenses: Number(formData.monthly_expenses),
        years_in_business: Number(formData.years_in_business),
        loan_amount: Number(formData.loan_amount),
        payback_period: Number(formData.payback_period),
      });
      setLoading(false);

      setResult(response.data);
    } catch (error) {
      setLoading(false);
      console.error("Error calculating score:", error);
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-8 bg-white">
      <h1 className="text-3xl font-bold mb-6">General Cash Loan Scoring</h1>

      {/* Form Section */}
      <div className=" grid md:grid-cols-2 grid-cols-1 gap-8">
        <PrimaryInput
          label="Monthly Income"
          placeholder="Enter monthly income"
          type="number"
          value={formData.monthly_income}
          setValue={(value) => handleInputChange("monthly_income", value)}
        />

        <PrimaryInput
          label="Monthly Expenses"
          placeholder="Enter monthly expenses"
          type="number"
          value={formData.monthly_expenses}
          setValue={(value) => handleInputChange("monthly_expenses", value)}
        />

        <PrimaryInput
          label="Business Type"
          placeholder="Enter type of business"
          value={formData.business_type}
          setValue={(value) => handleInputChange("business_type", value)}
        />

        <PrimaryInput
          label="Years in Business"
          placeholder="Enter years in business"
          type="number"
          value={formData.years_in_business}
          setValue={(value) => handleInputChange("years_in_business", value)}
        />

        <div className="flex items-center">
          <PrimaryInput
            label="Collateral Provided"
            placeholder="Check if collateral is provided"
            type="checkbox"
            value={formData.collateral}
            setValue={(value) => handleInputChange("collateral", value)}
          />
        </div>

        <PrimaryInput
          label="Loan Amount Requested"
          placeholder="Enter loan amount requested"
          type="number"
          value={formData.loan_amount}
          setValue={(value) => handleInputChange("loan_amount", value)}
        />

        <PrimaryInput
          label="Payback Period (in months)"
          placeholder="Enter payback period"
          type="number"
          value={formData.payback_period}
          setValue={(value) => handleInputChange("payback_period", value)}
        />
      </div>
      <PrimaryButton
        loading={loading}
        onClick={handleSubmit}
        text="Calculate Score"
      />

      {/* Results Section */}
      {result && (
        <div className="mt-8 p-4 bg-green-100 border border-green-200 rounded-md">
          <h2 className="text-xl font-bold mb-2">Score Summary</h2>
          <p>
            <strong>Preliminary Score:</strong> {result.preliminary_score}
          </p>
          <p>
            <strong>Risk Category:</strong> {result.risk_category}
          </p>
        </div>
      )}
    </div>
  );
}
