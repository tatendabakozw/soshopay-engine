import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import jsPDF from 'jspdf';
import { ArrowDownTrayIcon } from '@heroicons/react/16/solid';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; // Add this import
import CashLoan from '@/components/page-sections/cash-loan';
import AnalyseDoc from '@/components/page-sections/analyse-doc';

  
const tab_options = [
  {name:"Cash", _id: 'cash_loans'},
  {name:"PAYG", _id: 'payg'},
]

export interface Expenses {
  grocery: number;
  rent: number;
  utilities: number;
  schoolFees: number;
}

export interface LoanDetails {
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
  const [contextId, setContextId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(tab_options[0]);

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



  

  // Use useEffect to initialize or retrieve contextId from localStorage
  useEffect(() => {
    const storedContextId = localStorage.getItem('loanAppContextId');
    if (storedContextId) {
      setContextId(storedContextId);
    } else {
      const newContextId = uuidv4();
      setContextId(newContextId);
      localStorage.setItem('loanAppContextId', newContextId);
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    
    try {
      const { data } = await axios.post('/api/preliminary-score', 
        { 
          loanDetails, 
          contextId 
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      setResponse(data);
      setContextId(data.contextId); // Store the contextId returned from the API
    } catch (error) {
      console.error('Error submitting loan application:', error);
      setResponse('An error occurred while processing your application.');
    } finally {
      setLoading(false);
    }
  };


  // const startNewConversation = () => {
  //   const newContextId = uuidv4();
  //   setContextId(newContextId);
  //   localStorage.setItem('loanAppContextId', newContextId);
  //   setResponse(null);
  // };

  return (
    <div className="w-full bg-zinc-100 ">
      <div className="container mx-auto p-4 flex flex-col w-full space-y-4">
      <h1 className="text-2xl font-bold mb-4 text-zinc-950 text-center">Loan Application Form</h1>
     <AnalyseDoc />
     
      <div className="mx-auto">
      <div className="bg-white p-1 rounded-xl border border-zinc-300/50 text-sm font-semibold flex flex-row items-center self-center">
      {tab_options.map((tab:any, index:number) => (
        <button
          key={tab._id}
          className={`flex-1 text-center py-2 px-8 ${index===0 ? 'rounded-l-lg' : ' rounded-r-lg '} ${tab._id === selectedTab._id ? 'bg-zinc-200 text-zinc-950' : 'bg-white text-black'}`}
          onClick={() => setSelectedTab(tab)}
        >
          {tab.name}
        </button>
      ))}
      </div>
      </div>
     {
      selectedTab._id === 'cash_loans' && <CashLoan setLoanDetails={setLoanDetails} handleSubmit={handleSubmit} loanDetails={loanDetails} loading={loading} />
     }
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