export interface Expenses {
    grocery: number;
    rent: number;
    utilities: number;
    schoolFees: number;
  }
  
  export interface CashLoanDetails {
    clientName: string;
    nationalId: string;
    dob: string;
    contactNumber: string;
    homeAddress: string;
    loanAmount: number;
    collateral: 'Yes' | 'No';
    collateralValue: number;
    monthlyIncome: number;
    expenses: Expenses;
    fcbScore: 'Good' | 'Fair' | 'Adverse';
    runningLoans: 'Yes' | 'No';
    repaymentHistory: 'Good' | 'Fair' | 'Adverse';
    yearsInBusiness: number;
    guarantorRelationship: 'Close' | 'Distant' | 'None';
    guarantorIncome: number;
    firstTimeBorrower: boolean;
    historyWithOtherMFIs: 'None' | 'Limited' | 'Frequent';
  }
  
  export interface PAYGLoanDetails {
    clientName: string;
    nationalId: string;
    dob: string;
    contactNumber: string;
    homeAddress: string;
    loanAmount: number;
    monthlyIncome: number;
    expenses: Expenses;
    fcbScore: 'Good' | 'Fair' | 'Adverse';
    guarantorRelationship: 'Close' | 'Distant' | 'None';
    guarantorIncome: number;
    firstTimeBorrower: boolean;
    historyWithOtherMFIs: 'None' | 'Limited' | 'Frequent';
    productUsageHours: number;
    productVerified: boolean;
    subscriptionCost: number;
  }