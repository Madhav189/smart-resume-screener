import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, SlidersHorizontal, Filter, 
  ChevronDown, ArrowUpRight, Download, Play 
} from 'lucide-react';
import clsx from 'clsx';

const candidates = [
  { id: '1', name: 'Rahul Kumar', role: 'Backend Engineer', score: 91, conf: 93, match: 'Strong Fit', topSkill: 'Java, REST APIs', status: 'Reviewed' },
  { id: '2', name: 'Priya Sharma', role: 'Frontend Engineer', score: 87, conf: 88, match: 'Strong Fit', topSkill: 'React, TypeScript', status: 'New' },
  { id: '3', name: 'Arjun Singh', role: 'Data Scientist', score: 79, conf: 75, match: 'Good Fit', topSkill: 'Python, SQL', status: 'Shortlisted' },
  { id: '4', name: 'Sneha Gupta', role: 'Backend Engineer', score: 72, conf: 60, match: 'Potential Fit', topSkill: 'Python, Docker', status: 'New' },
  { id: '5', name: 'Vikram Patel', role: 'Backend Engineer', score: 55, conf: 90, match: 'Low Fit', topSkill: 'C++, System Design', status: 'Rejected' },
];

export default function CandidatesList() {
  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Candidates Directory</h1>
          <p className="text-sm text-textMuted mt-1">Showing 1,248 candidates across all active jobs.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-surface/50 border border-white/10 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-white/5 transition-colors">
            <Download size={16} /> Export CSV
          </button>
          <Link to="/compare" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">
            <SlidersHorizontal size={16} /> Compare Selected
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel p-4 rounded-xl mb-6 flex flex-wrap items-center gap-4 border border-white/5">
        <div className="flex items-center gap-2 text-sm font-medium text-textMuted mr-2">
          <Filter size={16} /> Filters
        </div>
        
        <div className="px-3 py-1.5 bg-background border border-white/10 rounded-full text-sm flex items-center gap-2 cursor-pointer hover:border-white/20">
          Match Score <ChevronDown size={14} className="text-textMuted" />
        </div>
        <div className="px-3 py-1.5 bg-background border border-white/10 rounded-full text-sm flex items-center gap-2 cursor-pointer hover:border-white/20">
          Skills <ChevronDown size={14} className="text-textMuted" />
        </div>
        <div className="px-3 py-1.5 bg-background border border-white/10 rounded-full text-sm flex items-center gap-2 cursor-pointer hover:border-white/20">
          Match Status <ChevronDown size={14} className="text-textMuted" />
        </div>
        <div className="px-3 py-1.5 bg-background border border-white/10 rounded-full text-sm flex items-center gap-2 cursor-pointer hover:border-white/20">
          Evidence Confidence <ChevronDown size={14} className="text-textMuted" />
        </div>
      </div>

      {/* Full Page Table */}
      <div className="glass-panel rounded-xl flex-1 overflow-hidden border border-white/5 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-textMuted uppercase bg-surface/50 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium"><input type="checkbox" className="rounded bg-background border-white/20 text-primary focus:ring-primary/50" /></th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-white">Candidate ID / Name</th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-white text-center">Overall Score</th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-white text-center">Evidence Conf.</th>
                <th className="px-6 py-4 font-medium">Top Skills</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {candidates.map((c) => (
                <tr key={c.id} className="hover:bg-surface/30 transition-colors group">
                  <td className="px-6 py-4"><input type="checkbox" className="rounded bg-background border-white/20 text-primary focus:ring-primary/50" /></td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white group-hover:text-primary transition-colors">{c.name}</div>
                    <div className="text-xs text-textMuted">TL-{1000 + parseInt(c.id)} • {c.role}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className={clsx(
                      "inline-flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold text-lg",
                      c.score >= 80 ? "border-success text-success" :
                      c.score >= 70 ? "border-warning text-warning" : "border-danger text-danger"
                    )}>
                      {c.score}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-mono text-xs">{c.conf}%</span>
                      <div className="w-16 h-1.5 bg-background rounded-full overflow-hidden">
                        <div className="bg-accent h-full" style={{ width: `${c.conf}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">{c.topSkill}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      "px-2.5 py-1 rounded text-xs font-semibold tracking-wide",
                      c.status === 'New' ? "bg-accent/20 text-accent" :
                      c.status === 'Reviewed' ? "bg-white/10 text-textMuted" :
                      c.status === 'Shortlisted' ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
                    )}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/candidates/${c.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded bg-white/5 hover:bg-primary hover:text-white transition-colors">
                      <ArrowUpRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
