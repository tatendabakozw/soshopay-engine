import React, { ChangeEvent, useState } from 'react'

type Props = {}
interface AnalysisResult {
    analysis: string;
    clientName: string | null;
    dob: string | null;
  }

function AnalyseDoc({}: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false)
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        console.log('File input changed');
        if (e.target.files && e.target.files.length > 0) {
          console.log('File selected:', e.target.files[0].name);
          setFile(e.target.files[0]);
        } else {
          console.log('No file selected');
        }
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
    
    
  return (
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
        <div className="mt-4 p-4 border rounded bg-zinc-100 text-left">
          <h2 className="text-xl font-bold mb-2 text-zinc-800">Document Analysis:</h2>
          <div className="text-zinc-700 text-sm">
            <p><strong>Analysis:</strong> {analysisResult.analysis}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalyseDoc