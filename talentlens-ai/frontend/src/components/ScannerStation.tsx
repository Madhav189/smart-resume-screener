import React, { useState, useCallback } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function ScannerStation() {
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.name.endsWith('.docx') || droppedFile.name.endsWith('.txt'))) {
      setFile(droppedFile);
    }
  }, []);

  const handleScan = () => {
    if (!file) return;
    setScanning(true);
    setProgress(0);
    
    // Simulate upload and scan stages for demo
    const stages = [20, 45, 75, 100];
    let step = 0;
    
    const interval = setInterval(() => {
      setProgress(stages[step]);
      step++;
      if (step >= stages.length) {
        clearInterval(interval);
        setTimeout(() => {
          setScanning(false);
          setResult({ status: 'success', message: 'Resume successfully parsed.' });
        }, 800);
      }
    }, 1200);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[80vh]">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-4">
          Diagnostic Scanner
        </h1>
        <p className="text-textMuted text-lg max-w-xl mx-auto">
          Upload a candidate's resume to extract skills, experience, and evaluate them against open job requirements using our semantic matching engine.
        </p>
      </div>

      <div className="w-full max-w-2xl">
        {!scanning && !result && (
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-white/20 rounded-2xl p-16 flex flex-col items-center justify-center bg-surface/50 hover:bg-surface/80 transition-all cursor-pointer group"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <UploadCloud size={40} className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Drag & Drop Resume</h3>
            <p className="text-textMuted mb-6">Supports PDF, DOCX, and TXT</p>
            
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              accept=".pdf,.docx,.txt"
              onChange={(e) => e.target.files && setFile(e.target.files[0])}
            />
            <label htmlFor="file-upload" className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors cursor-pointer shadow-lg shadow-primary/20">
              Browse Files
            </label>

            {file && (
              <div className="mt-8 p-4 bg-background/80 rounded-lg w-full flex items-center justify-between border border-white/10">
                <div className="flex items-center gap-3">
                  <FileText className="text-accent" />
                  <span className="font-medium text-sm truncate max-w-[200px]">{file.name}</span>
                </div>
                <button 
                  onClick={handleScan}
                  className="px-4 py-2 bg-accent text-background rounded font-semibold text-sm hover:bg-accent/90"
                >
                  Initiate Scan
                </button>
              </div>
            )}
          </div>
        )}

        {scanning && (
          <div className="glass-panel rounded-2xl p-12 flex flex-col items-center justify-center relative overflow-hidden border-accent/30 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
            <div className="diagnostic-scan-line" />
            
            <div className="w-32 h-40 border border-accent/40 rounded bg-background/50 relative flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <FileText size={48} className="text-accent/60" />
            </div>
            
            <h3 className="text-xl font-semibold mb-4 text-accent flex items-center gap-2">
              <Loader className="animate-spin" size={20} />
              Scanning Document...
            </h3>
            
            <div className="w-full bg-background rounded-full h-2 mb-4 overflow-hidden border border-white/5">
              <div 
                className="bg-accent h-2 transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }} 
              />
            </div>
            
            <div className="w-full flex justify-between text-xs text-textMuted font-mono">
              <span className={progress >= 20 ? 'text-accent' : ''}>[ Extracting Content ]</span>
              <span className={progress >= 45 ? 'text-accent' : ''}>[ Identifying Skills ]</span>
              <span className={progress >= 75 ? 'text-accent' : ''}>[ Semantic Analysis ]</span>
            </div>
          </div>
        )}

        {result && (
          <div className="glass-panel rounded-2xl p-12 text-center border-success/30">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6 text-success">
              <CheckCircle size={40} />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Scan Complete</h3>
            <p className="text-textMuted mb-8">Candidate profile has been successfully extracted and stored.</p>
            
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => { setFile(null); setResult(null); }}
                className="px-6 py-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors font-medium"
              >
                Scan Another
              </button>
              <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 font-medium">
                View Candidate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
