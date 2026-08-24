import React, { useState, useCallback } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader, X, Settings } from 'lucide-react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

type UploadFile = {
  id: string;
  name: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
};

export default function Upload() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => 
      f.type === 'application/pdf' || f.name.endsWith('.docx') || f.name.endsWith('.txt')
    );
    
    if (droppedFiles.length > 0) {
      const newFiles: UploadFile[] = droppedFiles.map((f, i) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: f.name,
        status: 'QUEUED',
        progress: 0
      }));
      setFiles(prev => [...prev, ...newFiles]);
      
      // Simulate processing
      newFiles.forEach((f, i) => simulateProcessing(f.id, i * 1500));
    }
  }, []);

  const simulateProcessing = (id: string, delay: number) => {
    setTimeout(() => {
      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'PROCESSING', progress: 10 } : f));
      
      let prog = 10;
      const interval = setInterval(() => {
        prog += Math.random() * 20;
        if (prog >= 100) {
          prog = 100;
          clearInterval(interval);
          setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'COMPLETED', progress: 100 } : f));
        } else {
          setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: prog } : f));
        }
      }, 500);
    }, delay);
  };

  const completedCount = files.filter(f => f.status === 'COMPLETED').length;

  return (
    <div className="max-w-6xl mx-auto flex gap-8 h-full">
      {/* Left: Upload Area */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Resumes</h1>
          <p className="text-textMuted">Upload multiple candidate resumes for the selected job. Supports PDF, DOCX, and TXT.</p>
        </div>

        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={clsx(
            "border-2 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center transition-all cursor-pointer group",
            isDragging ? "border-primary bg-primary/5" : "border-white/20 bg-surface/50 hover:bg-surface/80 hover:border-white/30"
          )}
        >
          <div className={clsx(
            "w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform",
            isDragging ? "bg-primary/20 scale-110" : "bg-primary/10 group-hover:scale-110"
          )}>
            <UploadCloud size={40} className="text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Drag & Drop Resumes</h3>
          <p className="text-textMuted mb-6">Drop your files here to start bulk processing</p>
          
          <input 
            type="file" 
            id="file-upload" 
            multiple
            className="hidden" 
            accept=".pdf,.docx,.txt"
            onChange={(e) => {
              // Implementation omitted for brevity (similar to drop)
            }}
          />
          <label htmlFor="file-upload" className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors cursor-pointer shadow-lg shadow-primary/20">
            Browse Files
          </label>
        </div>
        
        <div className="mt-6 flex items-center justify-between text-sm text-textMuted p-4 rounded-lg bg-surface/30 border border-white/5">
          <div className="flex items-center gap-2">
            <Settings size={16} /> Assigning to: <strong className="text-white">Backend Software Engineer</strong>
          </div>
          <button className="text-primary hover:underline">Change Job</button>
        </div>
      </div>

      {/* Right: Queue Sidebar */}
      <div className="w-96 glass-panel border-l border-white/5 p-6 flex flex-col h-[calc(100vh-8rem)]">
        <h3 className="text-lg font-bold mb-4">Processing Queue</h3>
        
        {files.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-textMuted p-8">
            <FileText size={40} className="mb-4 opacity-20" />
            <p>Your queue is empty.</p>
            <p className="text-xs mt-2">Upload resumes to see progress here.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {files.map(f => (
              <div key={f.id} className="p-4 rounded-lg bg-surface/50 border border-white/5 relative overflow-hidden group">
                {/* Progress bar background */}
                {f.status === 'PROCESSING' && (
                  <div className="absolute inset-0 bg-primary/5">
                    <div className="h-full bg-primary/10 transition-all duration-300" style={{ width: `${f.progress}%` }} />
                  </div>
                )}
                
                <div className="relative z-10 flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 overflow-hidden pr-2">
                    {f.status === 'COMPLETED' ? <CheckCircle size={16} className="text-success shrink-0" /> :
                     f.status === 'FAILED' ? <AlertCircle size={16} className="text-danger shrink-0" /> :
                     f.status === 'PROCESSING' ? <Loader size={16} className="text-accent animate-spin shrink-0" /> :
                     <FileText size={16} className="text-textMuted shrink-0" />}
                    <span className="font-medium text-sm truncate">{f.name}</span>
                  </div>
                  <button className="text-textMuted hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={14} />
                  </button>
                </div>
                
                <div className="relative z-10 flex items-center justify-between mt-2">
                  <span className={clsx(
                    "text-xs font-bold tracking-wider",
                    f.status === 'COMPLETED' ? 'text-success' :
                    f.status === 'FAILED' ? 'text-danger' :
                    f.status === 'PROCESSING' ? 'text-accent' : 'text-textMuted'
                  )}>
                    {f.status}
                  </span>
                  
                  {f.status === 'COMPLETED' && (
                    <Link to={`/candidates/${f.id}`} className="text-xs text-primary hover:underline font-medium">
                      View Analysis →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {files.length > 0 && (
          <div className="pt-4 border-t border-white/5 mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-textMuted">Overall Progress</span>
              <span className="font-bold">{completedCount} / {files.length}</span>
            </div>
            <div className="w-full h-2 bg-background rounded-full overflow-hidden">
              <div 
                className="h-full bg-success transition-all duration-500"
                style={{ width: `${(completedCount / files.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
