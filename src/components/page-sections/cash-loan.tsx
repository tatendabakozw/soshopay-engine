import React from 'react'
import PrimaryInput from '../PrimaryInput'
import { CashLoanDetails, Expenses } from '@/lib/types';


type Props = {
    setLoanDetails: React.Dispatch<React.SetStateAction<CashLoanDetails>>;
    handleSubmit: (e: React.FormEvent) => void;
    loanDetails: CashLoanDetails;
    loading: boolean;
}

function CashLoan({setLoanDetails, handleSubmit, loanDetails, loading}: Props) {
    const handleInputChange = (field: keyof CashLoanDetails) => (value: any) => {
        setLoanDetails((prev) => ({
          ...prev,
          [field]: value
        }));
      };
      const handleExpensesChange = (field: keyof Expenses) => (value: number) => {
        setLoanDetails((prev) => ({
          ...prev,
          expenses: {
            ...prev.expenses,
            [field]: value
          }
        }));
      };
  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white md:p-8 p-4 rounded-xl border border-zinc-300/50">
    <PrimaryInput
      label="Client Name"
      placeholder="Enter client name"
      value={loanDetails.clientName}
      setValue={handleInputChange('clientName')}
    />
    <PrimaryInput
      label="National ID"
      placeholder="Enter national ID"
      value={loanDetails.nationalId}
      setValue={handleInputChange('nationalId')}
    />
    <PrimaryInput
      label="Date of Birth"
      placeholder="Enter date of birth"
      value={loanDetails.dob}
      setValue={handleInputChange('dob')}
      type="date"
    />
    <PrimaryInput
      label="Contact Number"
      placeholder="Enter contact number"
      value={loanDetails.contactNumber}
      setValue={handleInputChange('contactNumber')}
    />
    <PrimaryInput
      label="Home Address"
      placeholder="Enter home address"
      value={loanDetails.homeAddress}
      setValue={handleInputChange('homeAddress')}
    />
    <PrimaryInput
      label="Loan Amount"
      placeholder="Enter loan amount"
      value={loanDetails.loanAmount}
      setValue={handleInputChange('loanAmount')}
      type="number"
    />
    <div className="flex flex-col">
      <label htmlFor="collateral" className="text-zinc-950 font-semibold pl-1 pb-2">Collateral</label>
      <select
        id="collateral"
        value={loanDetails.collateral}
        onChange={(e) => handleInputChange('collateral')(e.target.value)}
        className="border p-3 text-base rounded-xl border-zinc-300/50 bg-white text-zinc-600"
      >
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </select>
    </div>
    <PrimaryInput
      label="Collateral Value"
      placeholder="Enter collateral value"
      value={loanDetails.collateralValue}
      setValue={handleInputChange('collateralValue')}
      type="number"
    />
    <PrimaryInput
      label="Monthly Income"
      placeholder="Enter monthly income"
      value={loanDetails.monthlyIncome}
      setValue={handleInputChange('monthlyIncome')}
      type="number"
    />
    <div>
      <h3 className="text-zinc-950 font-semibold pl-1 pb-2">Monthly Expenses</h3>
      <div className="grid grid-cols-2 gap-4">
        <PrimaryInput
          label="Grocery"
          placeholder="Enter grocery expenses"
          value={loanDetails.expenses.grocery}
          setValue={handleExpensesChange('grocery')}
          type="number"
        />
        <PrimaryInput
          label="Rent"
          placeholder="Enter rent expenses"
          value={loanDetails.expenses.rent}
          setValue={handleExpensesChange('rent')}
          type="number"
        />
        <PrimaryInput
          label="Utilities"
          placeholder="Enter utilities expenses"
          value={loanDetails.expenses.utilities}
          setValue={handleExpensesChange('utilities')}
          type="number"
        />
        <PrimaryInput
          label="School Fees"
          placeholder="Enter school fees"
          value={loanDetails.expenses.schoolFees}
          setValue={handleExpensesChange('schoolFees')}
          type="number"
        />
      </div>
    </div>
    <div className="flex flex-col">
      <label htmlFor="fcbScore" className="text-zinc-950 font-semibold pl-1 pb-2">FCB Score</label>
      <select
        id="fcbScore"
        value={loanDetails.fcbScore}
        onChange={(e) => handleInputChange('fcbScore')(e.target.value)}
        className="border p-3 text-base rounded-xl border-zinc-300/50 bg-white text-zinc-600"
      >
        <option value="Good">Good</option>
        <option value="Fair">Fair</option>
        <option value="Adverse">Adverse</option>
      </select>
    </div>
    <div className="flex flex-col">
      <label htmlFor="runningLoans" className="text-zinc-950 font-semibold pl-1 pb-2">Running Loans</label>
      <select
        id="runningLoans"
        value={loanDetails.runningLoans}
        onChange={(e) => handleInputChange('runningLoans')(e.target.value)}
        className="border p-3 text-base rounded-xl border-zinc-300/50 bg-white text-zinc-600"
      >
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </select>
    </div>
    <div className="flex flex-col">
      <label htmlFor="repaymentHistory" className="text-zinc-950 font-semibold pl-1 pb-2">Repayment History</label>
      <select
        id="repaymentHistory"
        value={loanDetails.repaymentHistory}
        onChange={(e) => handleInputChange('repaymentHistory')(e.target.value)}
        className="border p-3 text-base rounded-xl border-zinc-300/50 bg-white text-zinc-600"
      >
        <option value="Good">Good</option>
        <option value="Fair">Fair</option>
        <option value="Adverse">Adverse</option>
      </select>
    </div>
    <PrimaryInput
      label="Years in Business"
      placeholder="Enter years in business"
      value={loanDetails.yearsInBusiness}
      setValue={handleInputChange('yearsInBusiness')}
      type="number"
    />
    <div className="flex flex-col">
      <label htmlFor="guarantorRelationship" className="text-zinc-950 font-semibold pl-1 pb-2">Guarantor Relationship</label>
      <select
        id="guarantorRelationship"
        value={loanDetails.guarantorRelationship}
        onChange={(e) => handleInputChange('guarantorRelationship')(e.target.value)}
        className="border p-3 text-base rounded-xl border-zinc-300/50 bg-white text-zinc-600"
      >
        <option value="Close">Close</option>
        <option value="Distant">Distant</option>
        <option value="None">None</option>
      </select>
    </div>
    <PrimaryInput
      label="Guarantor Income"
      placeholder="Enter guarantor income"
      value={loanDetails.guarantorIncome}
      setValue={handleInputChange('guarantorIncome')}
      type="number"
    />
    <div className="flex flex-col">
      <label htmlFor="firstTimeBorrower" className="text-zinc-950 font-semibold pl-1 pb-2">First Time Borrower</label>
      <select
        id="firstTimeBorrower"
        value={loanDetails.firstTimeBorrower ? 'Yes' : 'No'}
        onChange={(e) => handleInputChange('firstTimeBorrower')(e.target.value === 'Yes')}
        className="border p-3 text-base rounded-xl border-zinc-300/50 bg-white text-zinc-600"
      >
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </select>
    </div>
    <div className="flex flex-col">
      <label htmlFor="historyWithOtherMFIs" className="text-zinc-950 font-semibold pl-1 pb-2">History with Other MFIs</label>
      <select
        id="historyWithOtherMFIs"
        value={loanDetails.historyWithOtherMFIs}
        onChange={(e) => handleInputChange('historyWithOtherMFIs')(e.target.value)}
        className="border p-3 text-base rounded-xl border-zinc-300/50 bg-white text-zinc-600"
      >
        <option value="None">None</option>
        <option value="Limited">Limited</option>
        <option value="Frequent">Frequent</option>
      </select>
    </div>

     <button 
      type="submit" 
      className={`px-4 py-2 text-md rounded-xl text-white ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
      disabled={loading}
    >
      {loading ? 'Submitting...' : 'Submit Application'}
    </button>
  </form>
  )
}

export default CashLoan