import React, { useState } from "react";
import axios from "axios";

function Settings() {
  // State to store weights for each variable
  const [weights, setWeights] = useState({
    income_to_expense_ratio: 30,
    collateral: 20,
    business_type: 15,
    years_in_business: 15,
    loan_amount: 10,
    payback_period: 10,
  });

  // Handle changes in weight inputs
  const handleWeightChange = (variable: string, value: number) => {
    setWeights({
      ...weights,
      [variable]: value,
    });
  };

  // Save settings to the database by calling the API
  const saveSettings = async () => {
    try {
      const response = await axios.post("/api/save-settings", weights);
      alert(response.data.message);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error saving settings. Please try again.");
    }
  };

  return (
    <div className="flex flex-col space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="text-2xl font-bold text-gray-700">Engine Settings</div>
      <div className="bg-white p-4 rounded shadow-md space-y-4">
        <h3 className="text-lg font-semibold">Adjust Variable Weights</h3>
        {/* Render input sliders for each variable */}
        {Object.keys(weights).map((variable) => (
          <div key={variable} className="flex items-center space-x-4">
            <label className="w-1/3 text-gray-600 capitalize">
              {variable.replace(/_/g, " ")}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={weights[variable as keyof typeof weights]}
              onChange={(e) =>
                handleWeightChange(variable, Number(e.target.value))
              }
              className="flex-grow"
            />
            <span className="w-12 text-right">
              {weights[variable as keyof typeof weights]}%
            </span>
          </div>
        ))}
        <div className="pt-4">
          {/* Save Button */}
          <button
            onClick={saveSettings}
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
