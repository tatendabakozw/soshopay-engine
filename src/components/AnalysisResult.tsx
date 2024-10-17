import React from 'react';

interface AnalysisResultProps {
  analysis: string;
  userInfo: {
    fullName?: string;
    dateOfBirth?: string;
    emailAddress?: string;
    [key: string]: string | undefined;  // This allows for additional properties
  };
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis, userInfo }) => {
  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-bold mb-4">Document Analysis</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Summary</h3>
        <p className="text-gray-700 text-start text-sm font-normal">{analysis}</p>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Extracted Information</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(userInfo).map(([key, value]) => (
            <div key={key}>
              <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
              <span className="text-gray-700">{value || 'Not found'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;