import clientPromise from "@/lib/mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

// Define the type for the request body
type SettingsRequestBody = {
  income_to_expense_ratio: number;
  collateral: number;
  business_type: number;
  years_in_business: number;
  loan_amount: number;
  payback_period: number;
};

// API handler function
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // Parse the request body
    const settings = req.body as SettingsRequestBody;

    try {
      // Use the existing client promise from the utility
      const client = await clientPromise;
      const db = client.db("loan-scoring"); // Use the "loan-scoring" database
      const collection = db.collection("engine-settings");

      // Upsert the settings (update if exists, insert if not)
      await collection.updateOne({}, { $set: settings }, { upsert: true });

      // Respond with success
      res.status(200).json({ message: "Settings saved successfully!" });
    } catch (error) {
      console.error("Error connecting to the database", error);
      res.status(500).json({ error: "Error saving settings to the database." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default handler;
