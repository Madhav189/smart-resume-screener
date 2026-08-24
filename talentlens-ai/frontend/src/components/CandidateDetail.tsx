import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, AlertTriangle, HelpCircle, FileText, Download, Share2, ChevronRight, X, ShieldAlert, BookOpen, Clock, Activity, Zap, ArrowUpRight, Loader } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ReactFlow, Controls, Background, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import clsx from 'clsx';
import { api, MatchScore } from '../api';

export default function CandidateDetail() {
  const { id } = useParams();
  const [matchData, setMatchData] = useState<MatchScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState('match');
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [showQuestions, setShowQuestions] = useState(false);
  
  const [graphNodes, setGraphNodes] = useState<Node[]>([]);
  const [graphEdges, setGraphEdges] = useState<Edge[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const jobs = await api.getJobs();
        if (jobs.length > 0) {
          const m = await api.getMatchDetail(id, jobs[0].id);
          setMatchData(m);
          if (m.evidence && m.evidence.length > 0) {
            setSelectedReq(m.evidence[0]);
          }

          // Build graph
          const nodes: Node[] = [
            { id: 'candidate', data: { label: m.candidate?.name || 'Candidate' }, position: { x: 250, y: 0 }, className: 'bg-primary/20 border-primary text-white font-bold p-3 rounded-lg' }
          ];
          const edges: Edge[] = [];
          
          m.evidence.slice(0, 5).forEach((ev, idx) => {
            const skillNodeId = `skill_${ev.id}`;
            const isStrong = ev.status.includes('STRONG');
            nodes.push({
              id: skillNodeId,
              data: { label: ev.requirement?.name },
              position: { x: (idx * 200) - 100, y: 150 },
              className: isStrong ? 'bg-success/20 border-success text-white p-2 rounded' : 'bg-warning/20 border-warning text-white p-2 rounded'
            });
            edges.push({ id: `e_${ev.id}`, source: 'candidate', target: skillNodeId, animated: true, style: { stroke: isStrong ? '#22c55e' : '#f59e0b' } });

            if (ev.evidence_text) {
              const evNodeId = `ev_${ev.id}`;
              nodes.push({
                id: evNodeId,
                data: { label: ev.evidence_text.substring(0, 30) + '...' },
                position: { x: (idx * 200) - 100, y: 300 },
                className: 'bg-surface border-white/10 text-textMuted text-xs p-2 rounded shadow-lg w-40'
              });
              edges.push({ id: `e_ev_${ev.id}`, source: skillNodeId, target: evNodeId });
            }
          });

          setGraphNodes(nodes);
          setGraphEdges(edges);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load candidate analysis.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-textMuted">
        <Loader className="animate-spin mr-3" size={24} /> Loading Deep Analysis...
      </div>
    );
  }

  if (error || !matchData) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-danger flex-col">
        <AlertTriangle size={48} className="mb-4 opacity-50" />
        <p>{error || 'Candidate not found.'}</p>
      </div>
    );
  }

  const highlightText = (text: string, snippet: string | null) => {
    if (!snippet) return <span className="whitespace-pre-wrap">{text}</span>;
    // Just a basic substring highlight (in reality, requires smarter NLP matching)
    const lowerText = text.toLowerCase();
    const lowerSnippet = snippet.toLowerCase();
    const idx = lowerText.indexOf(lowerSnippet.substring(0, 20)); // match first 20 chars
    
    if (idx === -1) return <span className="whitespace-pre-wrap">{text}</span>;
    
    const parts = [
      text.substring(0, idx),
      text.substring(idx, idx + snippet.length),
      text.substring(idx + snippet.length)
    ];
    return (
      <span className="whitespace-pre-wrap leading-relaxed">
        {parts[0]}<span className="bg-primary/30 text-white font-bold rounded px-1 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all animate-pulse">{parts[1]}</span>{parts[2]}
      </span>
    );
  };

  const interviewQuestions = [
    { type: 'TECHNICAL_DEPTH', text: "Can you explain how you applied your skills in your past roles?" },
    { type: 'VERIFY_CLAIM', text: "Your resume mentions specific technologies. Can you elaborate on the architecture?" },
  ];

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
        </div>
      </div>

      {/* Hero Section */}
      <div className="glass-panel p-6 rounded-xl mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-l-4 border-l-success">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-success/20 to-accent/20 flex items-center justify-center font-bold text-3xl text-success border border-success/30 relative">
            {matchData.candidate?.name?.charAt(0) || '?'}
            <div className="absolute -bottom-2 -right-2 bg-success text-background text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              {matchData.overall_score >= 80 ? 'STRONG' : 'PARTIAL'}
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1">{matchData.candidate?.name || 'Unknown'}</h1>
            <p className="text-textMuted text-lg mb-2">Candidate Analysis</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-textMuted">{matchData.candidate?.email || 'No email'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-8 items-center bg-surface/30 p-4 rounded-xl border border-white/5">
          <div className="text-center">
            <div className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-1">Overall Match</div>
            <div className="relative w-16 h-16 flex items-center justify-center rounded-full border-4 border-success/20">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="28" cy="28" r="26" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-success" strokeDasharray={`${(matchData.overall_score / 100) * 163} 163`} />
              </svg>
              <span className="text-2xl font-black text-success">{Math.round(matchData.overall_score)}</span>
            </div>
          </div>
          <div className="h-12 w-px bg-white/10"></div>
          <div>
            <div className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-1">Evidence Conf.</div>
            <div className="text-2xl font-black text-white">{Math.round(matchData.confidence_score)}%</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-6">
        {[
          { id: 'match', label: 'Match Analysis', icon: Activity },
          { id: 'graph', label: 'Evidence Graph', icon: Zap },
          { id: 'resume', label: 'Resume Text', icon: FileText },
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
                {matchData.evidence.map(req => (
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
                      {req.status.includes('STRONG') ? <CheckCircle2 size={18} className="text-success shrink-0" /> :
                       req.status.includes('PARTIAL') ? <ShieldAlert size={18} className="text-warning shrink-0" /> :
                       <AlertTriangle size={18} className="text-danger shrink-0" />}
                      <span className={clsx("font-semibold text-sm", selectedReq?.id === req.id ? "text-primary" : "text-white")}>
                        {req.requirement?.name}
                      </span>
                    </div>
                    <ChevronRight size={16} className={selectedReq?.id === req.id ? "text-primary" : "text-textMuted"} />
                  </button>
                ))}
              </div>
            </div>

            {/* Split Pane: Right (Evidence Side Panel) */}
            <div className="flex-1 glass-panel rounded-xl border border-white/5 p-8 flex flex-col overflow-y-auto">
              {selectedReq ? (
                <>
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <div className="text-xs font-bold text-textMuted uppercase tracking-wider mb-1">Requirement Analysis</div>
                      <h2 className="text-3xl font-bold text-white">{selectedReq.requirement?.name}</h2>
                    </div>
                    <span className={clsx(
                      "px-3 py-1 rounded text-xs font-bold tracking-wider",
                      selectedReq.status.includes('STRONG') ? 'bg-success/20 text-success border border-success/30' :
                      selectedReq.status.includes('PARTIAL') ? 'bg-warning/20 text-warning border border-warning/30' :
                      'bg-danger/20 text-danger border border-danger/30'
                    )}>
                      {selectedReq.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-surface/50 border border-white/5 p-4 rounded-lg">
                      <div className="text-xs text-textMuted mb-1">Evidence Type</div>
                      <div className="font-mono text-sm text-primary">{selectedReq.evidence_type}</div>
                    </div>
                    <div className="bg-surface/50 border border-white/5 p-4 rounded-lg">
                      <div className="text-xs text-textMuted mb-1">AI Confidence</div>
                      <div className="font-mono text-sm text-white">{Math.round(selectedReq.confidence)}%</div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-textMuted uppercase tracking-wider mb-3 flex items-center gap-2">
                        <BookOpen size={16} /> Extracted Evidence Snippet
                      </h4>
                      {selectedReq.evidence_text ? (
                        <div className="bg-background border-l-4 border-l-primary p-4 rounded-r-lg font-mono text-sm text-white/90 leading-relaxed">
                          "{selectedReq.evidence_text}"
                        </div>
                      ) : (
                        <div className="bg-danger/10 border border-danger/20 p-4 rounded-lg text-sm text-danger flex items-center gap-2">
                          <AlertTriangle size={16} /> No explicit evidence snippet found.
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
            <ReactFlow nodes={graphNodes} edges={graphEdges} fitView className="bg-background">
              <Background color="#333" gap={16} />
              <Controls className="bg-surface border-white/10 fill-white" />
            </ReactFlow>
          </div>
        )}

        {activeTab === 'resume' && (
          <div className="flex-1 glass-panel rounded-xl border border-white/5 p-8 overflow-y-auto min-h-[500px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Interactive Resume Document</h3>
            </div>
            <div className="font-mono text-sm text-textMuted p-6 bg-background rounded-lg border border-white/5 whitespace-pre-wrap leading-loose">
              [Resume PDF rendering goes here] (For MVP, exact text is processed backend-side).
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
            <p className="text-sm text-textMuted mb-6">These questions are generated based on the candidate's claims and skill gaps.</p>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {interviewQuestions.map((iq, idx) => (
                <div key={idx} className="bg-background border border-white/5 p-4 rounded-lg">
                  <span className={clsx(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded mb-2 inline-block bg-primary/20 text-primary"
                  )}>
                    {iq.type.replace('_', ' ')}
                  </span>
                  <p className="text-sm text-white/90">"{iq.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
