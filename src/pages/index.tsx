import { useState, FormEvent, ChangeEvent } from 'react';
import PrimaryInput from '../components/PrimaryInput';
import jsPDF from 'jspdf';
import { ArrowDownTrayIcon } from '@heroicons/react/16/solid';

interface Expenses {
  grocery: number;
  rent: number;
  utilities: number;
  schoolFees: number;
}

interface LoanDetails {
  clientName: string;
  nationalId: string;
  loanType: string;
  dob: string;
  contactNumber: string;
  homeAddress: string;
  loanAmount: number;
  collateral: string;
  collateralValue: number;
  monthlyIncome: number;
  expenses: Expenses;
  fcbScore: string;
  runningLoans: string;
  repaymentHistory: string;
  yearsInBusiness: number;
}

interface AnalysisResult {
  analysis: string;
  clientName: string | null;
  dob: string | null;
}

export default function Home() {
  const [loanDetails, setLoanDetails] = useState<LoanDetails>({
    clientName: '',
    nationalId: '',
    loanType: 'Cash Loan',
    dob: '',
    contactNumber: '',
    homeAddress: '',
    loanAmount: 0,
    collateral: 'No',
    collateralValue: 0,
    monthlyIncome: 0,
    expenses: {
      grocery: 0,
      rent: 0,
      utilities: 0,
      schoolFees: 0
    },
    fcbScore: 'Good',
    runningLoans: 'No',
    repaymentHistory: 'Good',
    yearsInBusiness: 0
  });
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };


  const generatePDF = (report: string) => {
    const doc = new jsPDF();
    
    // Add content to the PDF
    doc.setFontSize(16);
    doc.text('Loan Application Report', 105, 15, { align: 'center' });
    
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(report, 180);
    doc.text(splitText, 15, 25);

    // Save the PDF
    doc.save('loan_report.pdf');
  };

  const handleInputChange = (field: keyof LoanDetails) => (value: any) => {
    setLoanDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const analyzeDocument = async () => {
    if (!file) return;
  
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const res = await fetch('/api/analyze-document', {
        method: 'POST',
        body: formData,
      });
  
      if (res.ok) {
        const data: AnalysisResult = await res.json();
        setAnalysisResult(data);
        
        // Update loanDetails with extracted information
        setLoanDetails(prev => ({
          ...prev,
          clientName: data.clientName || prev.clientName,
          dob: data.dob || prev.dob
        }));
      } else {
        const errorData = await res.json();
        setAnalysisResult({ analysis: `Error: ${errorData.error}`, clientName: null, dob: null });
        if (res.status === 429) {
          // Add a delay before allowing another attempt
          setTimeout(() => setLoading(false), 60000); // 1 minute delay
          return;
        }
      }
    } catch (error) {
      console.error('Error analyzing document:', error);
      setAnalysisResult({ analysis: 'An error occurred while analyzing the document.', clientName: null, dob: null });
    } finally {
      setLoading(false);
    }
  };

  const handleExpensesChange = (field: keyof Expenses) => (value: number) => {
    setLoanDetails(prev => ({
      ...prev,
      expenses: {
        ...prev.expenses,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch('/api/preliminary-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loanDetails),
      });

      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error('Error submitting loan application:', error);
      setResponse('An error occurred while processing your application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-zinc-100 ">
      <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-zinc-950 text-center">Loan Application Form</h1>
      <div className="text-2xl flex flex-col space-x-4 font-bold mb-4 bg-white rounded-xl border border-zinc-300/50 md:p-8 p-4 text-center">
      <div>
          <label htmlFor="document" className="block text-sm text-zinc-700 font-semibold">
            Upload Document for Analysis
          </label>
          <input
            type="file"
            id="document"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>
       <div className="flex">
       <button 
          type="button" 
          onClick={analyzeDocument}
          className={`px-4 py-2 rounded-xl mt-4 text-sm text-white ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
          disabled={!file || loading}
        >
          {loading ? 'Analysing...' : 'Analyse Document'}
        </button>
        
       
       </div>
       {loading && (
        <div className="mt-4 p-4 border rounded bg-yellow-100">
          <p className="text-yellow-700">Analysing your document...</p>
        </div>
      )}
       {/* PRINT THE DOC ANALYSIS here */}
       {analysisResult && (
          <div className="mt-4 p-4 border rounded bg-purple-100 text-left">
            <h2 className="text-xl font-bold mb-2 text-purple-800">Document Analysis:</h2>
            <div className="text-purple-700 text-sm">
              <p><strong>Analysis:</strong> {analysisResult.analysis}</p>
              <p><strong>Client Name:</strong> {analysisResult.clientName || 'Not found'}</p>
              <p><strong>Date of Birth:</strong> {analysisResult.dob || 'Not found'}</p>
            </div>
          </div>
        )}
      </div>
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
        <div className="flex flex-col">
          <label htmlFor="loanType" className="text-zinc-950 font-semibold pl-1 pb-2">Loan Type</label>
          <select
            id="loanType"
            value={loanDetails.loanType}
            onChange={(e) => handleInputChange('loanType')(e.target.value)}
            className="border p-3 text-base rounded-xl border-zinc-300/50 bg-white text-zinc-600"
          >
            <option value="Cash Loan">Cash Loan</option>
            <option value="Mortgage">Mortgage</option>
            <option value="Business Loan">Business Loan</option>
          </select>
        </div>
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
        <PrimaryInput
          label="FCB Score"
          placeholder="Enter FCB score"
          value={loanDetails.fcbScore}
          setValue={handleInputChange('fcbScore')}
        />
        <PrimaryInput
          label="Running Loans"
          placeholder="Any running loans?"
          value={loanDetails.runningLoans}
          setValue={handleInputChange('runningLoans')}
        />
        <PrimaryInput
          label="Repayment History"
          placeholder="Enter repayment history"
          value={loanDetails.repaymentHistory}
          setValue={handleInputChange('repaymentHistory')}
        />
        <PrimaryInput
          label="Years in Business"
          placeholder="Enter years in business"
          value={loanDetails.yearsInBusiness}
          setValue={handleInputChange('yearsInBusiness')}
          type="number"
        />


         <button 
          type="submit" 
          className={`px-4 py-2 text-md rounded-xl text-white ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
      {loading && (
        <div className="mt-4 p-4 border rounded bg-yellow-100">
          <p className="text-yellow-700">Processing your application...</p>
        </div>
      )}
      {response && (
        <div className="mt-4 p-4 border rounded-xl bg-zinc-200">
          <div className="flex w-full justify-between">
          <h2 className="text-xl font-bold mb-2">Preliminary Score Result:</h2>
<button onClick={() => generatePDF(response.report)} className='bg-zinc-200 p-2 rounded-xl'>
<ArrowDownTrayIcon height={20} width={20}/>
</button>
          </div>
          <pre className="whitespace-pre-wrap">{response?.report || 'No report available'}</pre>
        </div>
      )}
    </div>
    </div>
  );
}