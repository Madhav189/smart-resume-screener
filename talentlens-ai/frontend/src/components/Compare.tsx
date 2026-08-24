import React from 'react';
import { ArrowLeft, CheckCircle2, ShieldAlert, Zap, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

const candidates = [
  { 
    id: '1', name: 'Rahul Kumar', score: 91, conf: 93, match: 'Strong Fit',
    strengths: ['Java concurrency', 'PostgreSQL optimization', 'REST APIs'],
    gaps: ['No AWS evidence'],
    topEvidence: 'Developed a concurrent Java TCP server using thread-pool based request handling.'
  },
  { 
    id: '4', name: 'Sneha Gupta', score: 72, conf: 60, match: 'Potential Fit',
    strengths: ['Python automation', 'Docker basics'],
    gaps: ['Weak Java experience', 'No SQL listed'],
    topEvidence: 'Containerized Python applications using Docker.'
  }
];

const requirements = [
  { name: 'Java', reqType: 'Must-Have' },
  { name: 'Python', reqType: 'Must-Have' },
  { name: 'PostgreSQL', reqType: 'Must-Have' },
  { name: 'AWS', reqType: 'Nice-to-Have' },
  { name: 'REST APIs', reqType: 'Must-Have' }
];

// Mock matrix [reqIndex][candidateIndex]
const matchMatrix = [
  [ { s: 'STRONG', c: 96 }, { s: 'PARTIAL', c: 65 } ], // Java
  [ { s: 'STRONG', c: 90 }, { s: 'STRONG', c: 85 } ],  // Python
  [ { s: 'STRONG', c: 92 }, { s: 'MISSING', c: 99 } ], // PostgreSQL
  [ { s: 'MISSING', c: 99 }, { s: 'PARTIAL', c: 50 } ],// AWS
  [ { s: 'STRONG', c: 88 }, { s: 'PARTIAL', c: 70 } ]  // REST APIs
];

export default function Compare() {
  return (
    <div className="max-w-6xl mx-auto h-full overflow-y-auto pb-10">
      <div className="mb-6">
        <Link to="/candidates" className="inline-flex items-center gap-2 text-sm text-textMuted hover:text-white transition-colors mb-4">
          <ArrowLeft size={16} /> Back to Candidates
        </Link>
        <h1 className="text-3xl font-bold">Candidate Comparison</h1>
        <p className="text-textMuted">Comparing 2 candidates for <strong>Backend Software Engineer</strong>.</p>
      </div>
      
      {/* Best Fit Banner */}
      <div className="glass-panel p-6 rounded-xl border border-success/30 bg-success/5 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center text-success">
            <Zap size={24} fill="currentColor" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-success">Recommended: Rahul Kumar</h3>
            <p className="text-sm">Scores significantly higher on core backend requirements (Java, PostgreSQL) with 93% evidence confidence.</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-success text-background font-bold rounded shadow-lg shadow-success/20 hover:bg-success/90">
          Move to Next Stage
        </button>
      </div>

      {/* Side by side summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {candidates.map((c, i) => (
          <div key={c.id} className={clsx("glass-panel p-6 rounded-xl border", i === 0 ? "border-primary/50" : "border-white/5")}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold">{c.name}</h3>
                <p className="text-textMuted">{c.match}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-primary">{c.score}</div>
                <div className="text-xs text-textMuted font-mono">Conf: {c.conf}%</div>
              </div>
            </div>
            
            <div className="space-y-4 text-sm mt-6">
              <div>
                <h4 className="font-bold flex items-center gap-2 text-success mb-2"><CheckCircle2 size={16} /> Key Strengths</h4>
                <ul className="list-disc pl-5 text-textMuted">
                  {c.strengths.map(s => <li key={s}>{s}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-bold flex items-center gap-2 text-warning mb-2"><AlertTriangle size={16} /> Gaps</h4>
                <ul className="list-disc pl-5 text-textMuted">
                  {c.gaps.map(g => <li key={g}>{g}</li>)}
                </ul>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/5">
              <Link to={`/candidates/${c.id}`} className="text-primary hover:underline text-sm font-medium">
                View Full Analysis →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Requirement Matrix */}
      <h3 className="text-xl font-bold mb-4">Requirement Matrix</h3>
      <div className="glass-panel rounded-xl overflow-hidden border border-white/5">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface/50 border-b border-white/5 uppercase text-xs text-textMuted">
            <tr>
              <th className="px-6 py-4 font-medium w-1/3">Requirement</th>
              {candidates.map(c => (
                <th key={c.id} className="px-6 py-4 font-medium">{c.name}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {requirements.map((req, rIdx) => (
              <tr key={req.name} className="hover:bg-surface/30">
                <td className="px-6 py-4">
                  <div className="font-bold">{req.name}</div>
                  <div className="text-xs text-textMuted">{req.reqType}</div>
                </td>
                {candidates.map((c, cIdx) => {
                  const match = matchMatrix[rIdx][cIdx];
                  return (
                    <td key={c.id} className="px-6 py-4 relative group cursor-help">
                      <div className="flex items-center gap-3">
                        {match.s === 'STRONG' ? <CheckCircle2 size={20} className="text-success" /> :
                         match.s === 'PARTIAL' ? <ShieldAlert size={20} className="text-warning" /> :
                         <AlertTriangle size={20} className="text-danger" />}
                        <div>
                          <div className={clsx("font-bold text-xs", 
                            match.s === 'STRONG' ? 'text-success' : 
                            match.s === 'PARTIAL' ? 'text-warning' : 'text-danger'
                          )}>
                            {match.s}
                          </div>
                          <div className="font-mono text-[10px] text-textMuted">Conf {match.c}%</div>
                        </div>
                      </div>
                      
                      {/* Hover Tooltip */}
                      <div className="absolute left-6 top-12 bg-surface border border-white/10 rounded-lg p-3 w-64 shadow-xl opacity-0 group-hover:opacity-100 group-hover:z-50 transition-opacity pointer-events-none hidden md:block">
                        <div className="text-xs font-bold text-primary mb-1">EVIDENCE:</div>
                        <div className="text-xs text-textMuted italic">
                          {match.s === 'MISSING' ? "No evidence found in resume." : 
                           cIdx === 0 ? candidates[0].topEvidence : candidates[1].topEvidence}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
