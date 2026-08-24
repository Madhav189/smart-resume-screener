import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, AlertTriangle, HelpCircle, FileText, Download, Share2, ChevronRight, X, ShieldAlert, BookOpen, Clock, Activity, Zap } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ReactFlow, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import clsx from 'clsx';

// --- MOCK DATA ---
const candidate = {
  id: '1', name: 'Rahul Kumar', role: 'Backend Engineer',
  email: 'rahul@example.com', phone: '555-0123', location: 'Remote',
  score: 87, conf: 93, fit: 'STRONG FIT', summary: 'Excellent backend engineer with proven scalable system design experience.',
  resumeText: "Rahul Kumar\nBackend Engineer\nrahul@example.com | 555-0123\n\nSummary\nHighly skilled backend engineer with 3+ years of experience building scalable, distributed systems.\n\nSkills\nJava, Python, PostgreSQL, MySQL, Redis, REST APIs, Microservices, Git, Docker\n\nExperience\nBackend Developer | Tech Solutions Inc | 2021 - Present\n- Developed a concurrent Java TCP server using thread-pool based request handling, improving throughput by 40%.\n- Designed and implemented REST APIs using Python and FastAPI for a high-traffic e-commerce platform.\n- Optimized complex PostgreSQL queries, reducing latency by 40%.\n- Implemented Redis-style LRU/LFU eviction for an in-memory caching layer, improving data retrieval speeds.\n\nEducation\nB.S. Computer Science | University of Technology | 2020"
};

const requirements = [
  { id: 'req-1', name: 'Java', status: 'STRONG_MATCH', conf: 96, evidence: 'Developed a concurrent Java TCP server using thread-pool based request handling.', type: 'EXPLICIT', reason: 'Directly stated in recent experience.' },
  { id: 'req-2', name: 'Spring Boot', status: 'PARTIAL_MATCH', conf: 74, evidence: 'Built REST APIs for the backend system.', type: 'INFERRED', reason: 'Demonstrates REST API development but does not explicitly mention Spring Boot.' },
  { id: 'req-3', name: 'SQL', status: 'STRONG_MATCH', conf: 92, evidence: 'Optimized complex PostgreSQL queries, reducing latency by 40%.', type: 'EVIDENCE', reason: 'PostgreSQL is a SQL database.' },
  { id: 'req-4', name: 'AWS', status: 'MISSING', conf: 99, evidence: null, type: 'MISSING', reason: 'The resume contains no evidence of AWS experience.' },
];

const interviewQuestions = [
  { type: 'TECHNICAL_DEPTH', text: "Can you explain how you handled thread concurrency in your Java TCP server?" },
  { type: 'VERIFY_CLAIM', text: "Your resume mentions REST APIs. Did you use Spring Boot for that, and if so, how did you structure your controllers?" },
  { type: 'GAP_ANALYSIS', text: "We use AWS heavily. While not on your resume, have you deployed your containerized apps to any cloud provider?" }
];

// --- GRAPH DATA ---
const initialNodes = [
  { id: 'candidate', data: { label: 'Rahul Kumar' }, position: { x: 250, y: 0 }, className: 'bg-primary/20 border-primary text-white font-bold p-3 rounded-lg' },
  { id: 'skill1', data: { label: 'Java (Backend)' }, position: { x: 100, y: 100 }, className: 'bg-success/20 border-success text-white p-2 rounded' },
  { id: 'skill2', data: { label: 'SQL (PostgreSQL)' }, position: { x: 400, y: 100 }, className: 'bg-success/20 border-success text-white p-2 rounded' },
  { id: 'ev1', data: { label: 'TCP server thread-pool' }, position: { x: 50, y: 200 }, className: 'bg-surface border-white/10 text-textMuted text-xs p-2 rounded shadow-lg w-40' },
  { id: 'ev2', data: { label: 'Optimized complex queries' }, position: { x: 400, y: 200 }, className: 'bg-surface border-white/10 text-textMuted text-xs p-2 rounded shadow-lg w-40' },
];
const initialEdges = [
  { id: 'e1', source: 'candidate', target: 'skill1', animated: true, style: { stroke: '#06b6d4' } },
  { id: 'e2', source: 'candidate', target: 'skill2', animated: true, style: { stroke: '#06b6d4' } },
  { id: 'e3', source: 'skill1', target: 'ev1' },
  { id: 'e4', source: 'skill2', target: 'ev2' },
];

export default function CandidateDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('match');
  const [selectedReq, setSelectedReq] = useState<any>(requirements[0]);
  const [showQuestions, setShowQuestions] = useState(false);
  
  // Highlighting logic
  const highlightText = (text: string, snippet: string | null) => {
    if (!snippet) return <span className="whitespace-pre-wrap">{text}</span>;
    const parts = text.split(snippet);
    if (parts.length === 1) return <span className="whitespace-pre-wrap">{text}</span>;
    return (
      <span className="whitespace-pre-wrap leading-relaxed">
        {parts[0]}<span className="bg-primary/30 text-white font-bold rounded px-1 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all animate-pulse">{snippet}</span>{parts[1]}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col pb-10">
      <div className="mb-4 flex items-center justify-between">
        <Link to="/candidates" className="inline-flex items-center gap-2 text-sm text-textMuted hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back to Candidates
        </Link>
        <div className="flex gap-2">
          <button onClick={() => setShowQuestions(true)} className="px-3 py-1.5 bg-accent/10 text-accent border border-accent/20 rounded hover:bg-accent/20 text-sm font-medium flex items-center gap-2">
            <HelpCircle size={14} /> Generate Interview
          </button>
          <button className="px-3 py-1.5 bg-surface border border-white/10 rounded hover:bg-white/5 text-sm font-medium flex items-center gap-2">
            <Share2 size={14} /> Share
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="glass-panel p-6 rounded-xl mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-l-4 border-l-success">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-success/20 to-accent/20 flex items-center justify-center font-bold text-3xl text-success border border-success/30 relative">
            {candidate.name.charAt(0)}
            <div className="absolute -bottom-2 -right-2 bg-success text-background text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              {candidate.fit}
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1">{candidate.name}</h1>
            <p className="text-textMuted text-lg mb-2">{candidate.role}</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-textMuted">{candidate.email}</span>
              <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-textMuted">{candidate.phone}</span>
              <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-textMuted">{candidate.location}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-8 items-center bg-surface/30 p-4 rounded-xl border border-white/5">
          <div className="text-center">
            <div className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-1">Overall Match</div>
            <div className="relative w-16 h-16 flex items-center justify-center rounded-full border-4 border-success/20">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="28" cy="28" r="26" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-success" strokeDasharray={`${(candidate.score / 100) * 163} 163`} />
              </svg>
              <span className="text-2xl font-black text-success">{candidate.score}</span>
            </div>
          </div>
          <div className="h-12 w-px bg-white/10"></div>
          <div>
            <div className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-1">Evidence Conf.</div>
            <div className="text-2xl font-black text-white">{candidate.conf}%</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-6">
        {[
          { id: 'match', label: 'Match Analysis', icon: Activity },
          { id: 'graph', label: 'Evidence Graph', icon: Zap },
          { id: 'resume', label: 'Resume Text', icon: FileText },
          { id: 'history', label: 'History', icon: Clock }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2",
              activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-textMuted hover:text-white"
            )}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        
        {activeTab === 'match' && (
          <div className="flex gap-6 h-full min-h-[500px]">
            {/* Split Pane: Left (Req Matrix) */}
            <div className="w-1/3 glass-panel rounded-xl border border-white/5 overflow-y-auto">
              <div className="p-4 border-b border-white/5 sticky top-0 bg-background/95 backdrop-blur z-10">
                <h3 className="font-bold text-sm text-textMuted uppercase tracking-wider">Requirements Breakdown</h3>
              </div>
              <div className="p-2 space-y-1">
                {requirements.map(req => (
                  <button
                    key={req.id}
                    onClick={() => setSelectedReq(req)}
                    className={clsx(
                      "w-full text-left p-3 rounded-lg flex items-center justify-between transition-colors border",
                      selectedReq?.id === req.id 
                        ? "bg-surface border-primary/30" 
                        : "bg-transparent border-transparent hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {req.status === 'STRONG_MATCH' ? <CheckCircle2 size={18} className="text-success shrink-0" /> :
                       req.status === 'PARTIAL_MATCH' ? <ShieldAlert size={18} className="text-warning shrink-0" /> :
                       <AlertTriangle size={18} className="text-danger shrink-0" />}
                      <span className={clsx("font-semibold text-sm", selectedReq?.id === req.id ? "text-primary" : "text-white")}>
                        {req.name}
                      </span>
                    </div>
                    <ChevronRight size={16} className={selectedReq?.id === req.id ? "text-primary" : "text-textMuted"} />
                  </button>
                ))}
              </div>
              
              <div className="p-4 mt-4 border-t border-white/5">
                <h4 className="text-xs font-bold text-danger uppercase tracking-wider mb-3">Gap Analysis</h4>
                <div className="bg-danger/10 border border-danger/20 rounded p-3 text-xs text-danger/90">
                  <strong>AWS:</strong> {requirements.find(r => r.name === 'AWS')?.reason}
                </div>
              </div>
            </div>

            {/* Split Pane: Right (Evidence Side Panel) */}
            <div className="flex-1 glass-panel rounded-xl border border-white/5 p-8 flex flex-col overflow-y-auto">
              {selectedReq ? (
                <>
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <div className="text-xs font-bold text-textMuted uppercase tracking-wider mb-1">Requirement Analysis</div>
                      <h2 className="text-3xl font-bold text-white">{selectedReq.name}</h2>
                    </div>
                    <span className={clsx(
                      "px-3 py-1 rounded text-xs font-bold tracking-wider",
                      selectedReq.status === 'STRONG_MATCH' ? 'bg-success/20 text-success border border-success/30' :
                      selectedReq.status === 'PARTIAL_MATCH' ? 'bg-warning/20 text-warning border border-warning/30' :
                      'bg-danger/20 text-danger border border-danger/30'
                    )}>
                      {selectedReq.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-surface/50 border border-white/5 p-4 rounded-lg">
                      <div className="text-xs text-textMuted mb-1">Evidence Type</div>
                      <div className="font-mono text-sm text-primary">{selectedReq.type}</div>
                    </div>
                    <div className="bg-surface/50 border border-white/5 p-4 rounded-lg">
                      <div className="text-xs text-textMuted mb-1">AI Confidence</div>
                      <div className="font-mono text-sm text-white">{selectedReq.conf}%</div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-textMuted uppercase tracking-wider mb-3 flex items-center gap-2">
                        <BookOpen size={16} /> Extracted Evidence Snippet
                      </h4>
                      {selectedReq.evidence ? (
                        <div className="bg-background border-l-4 border-l-primary p-4 rounded-r-lg font-mono text-sm text-white/90 leading-relaxed">
                          "{selectedReq.evidence}"
                        </div>
                      ) : (
                        <div className="bg-danger/10 border border-danger/20 p-4 rounded-lg text-sm text-danger flex items-center gap-2">
                          <AlertTriangle size={16} /> No evidence snippet found.
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-bold text-textMuted uppercase tracking-wider mb-3 flex items-center gap-2">
                        <HelpCircle size={16} /> AI Reasoning
                      </h4>
                      <div className="bg-surface/50 p-4 rounded-lg text-sm text-white/80 border border-white/5">
                        {selectedReq.reason}
                      </div>
                    </div>
                  </div>
                  
                  {selectedReq.evidence && (
                    <div className="mt-auto pt-6">
                      <button onClick={() => setActiveTab('resume')} className="text-sm font-medium text-accent hover:underline flex items-center gap-2">
                        View Exact Location in Resume <ArrowUpRight size={14} />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-textMuted">
                  Select a requirement on the left to view deep evidence analysis.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'graph' && (
          <div className="flex-1 glass-panel rounded-xl border border-white/5 overflow-hidden min-h-[500px]">
            <ReactFlow nodes={initialNodes} edges={initialEdges} fitView className="bg-background">
              <Background color="#333" gap={16} />
              <Controls className="bg-surface border-white/10 fill-white" />
            </ReactFlow>
          </div>
        )}

        {activeTab === 'resume' && (
          <div className="flex-1 glass-panel rounded-xl border border-white/5 p-8 overflow-y-auto min-h-[500px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Interactive Resume Document</h3>
              {selectedReq?.evidence && (
                <div className="text-xs bg-accent/20 text-accent px-3 py-1 rounded border border-accent/30 animate-pulse">
                  Highlighting evidence for: {selectedReq.name}
                </div>
              )}
            </div>
            <div className="font-mono text-sm text-textMuted p-6 bg-background rounded-lg border border-white/5 whitespace-pre-wrap leading-loose">
              {highlightText(candidate.resumeText, selectedReq?.evidence)}
            </div>
          </div>
        )}
      </div>

      {/* Interview Modal */}
      {showQuestions && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-white/10 rounded-2xl p-8 max-w-2xl w-full shadow-2xl relative">
            <button onClick={() => setShowQuestions(false)} className="absolute top-4 right-4 text-textMuted hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-accent">
              <HelpCircle /> Generated Interview Questions
            </h2>
            <p className="text-sm text-textMuted mb-6">These questions are specifically generated based on the candidate's claims and skill gaps to verify authenticity.</p>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {interviewQuestions.map((iq, idx) => (
                <div key={idx} className="bg-background border border-white/5 p-4 rounded-lg">
                  <span className={clsx(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded mb-2 inline-block",
                    iq.type === 'GAP_ANALYSIS' ? 'bg-danger/20 text-danger' :
                    iq.type === 'VERIFY_CLAIM' ? 'bg-warning/20 text-warning' : 'bg-primary/20 text-primary'
                  )}>
                    {iq.type.replace('_', ' ')}
                  </span>
                  <p className="text-sm text-white/90">"{iq.text}"</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button className="px-4 py-2 border border-white/10 rounded hover:bg-white/5 text-sm font-medium">Copy All</button>
              <button className="px-4 py-2 bg-accent text-background rounded hover:bg-accent/90 text-sm font-medium shadow-lg shadow-accent/20">Export PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
