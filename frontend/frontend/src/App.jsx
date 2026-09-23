import React, { useState } from 'react';
import { UploadCloud, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError(null);
    } else {
      setFile(null);
      setError('Invalid file type. Please select a CSV file.');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/summarize-field-data/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to process environmental data');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-mko-green mb-2">MKO Environmental AI Workstation</h1>
          <p className="text-gray-600">Automated Ecological Data Extraction & Summarization</p>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
            <UploadCloud className="mr-2 text-mko-green" />
            Upload Field Survey Data (CSV)
          </h2>
          
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-10 bg-gray-50 hover:bg-gray-100 transition-colors">
            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" id="file-upload" />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
              <FileText className="h-12 w-12 text-gray-400 mb-3" />
              <span className="text-sm font-medium text-gray-700">
                {file ? file.name : 'Click to browse or drag CSV file here'}
              </span>
            </label>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center text-sm">
              <AlertCircle className="w-4 h-4 mr-2" /> {error}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className={`px-6 py-2.5 rounded-md text-white font-medium flex items-center transition-colors ${
                !file || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-mko-green hover:bg-green-800 shadow-md'
              }`}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing AI Summary...</>
              ) : 'Generate Report Summary'}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-xl shadow-sm border border-mko-green border-opacity-20 p-8">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h2 className="text-xl font-semibold flex items-center text-mko-green">
                <CheckCircle2 className="mr-2" /> AI Generated Executive Summary
              </h2>
              <span className="text-xs font-medium bg-mko-light text-mko-green px-3 py-1 rounded-full">
                {result.row_count} records analyzed
              </span>
            </div>
            <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
              {result.summary}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
export default App;