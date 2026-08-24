import React from 'react';
import { Users, FileSearch, Zap, AlertTriangle, ArrowUpRight, UploadCloud, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

const metricCards = [
  { label: 'Candidates Analyzed', value: '24', icon: Users, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
  { label: 'Strong Matches', value: '7', sub: '90-100%', icon: Zap, color: 'text-success', bg: 'bg-success/10 border-success/20' },
  { label: 'Potential Matches', value: '12', sub: '70-89%', icon: FileSearch, color: 'text-warning', bg: 'bg-warning/10 border-warning/20' },
  { label: 'Low Matches', value: '5', sub: '<70%', icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/10 border-danger/20' },
];

const candidates = [
  { id: '1', name: 'Rahul Kumar', role: 'Backend Engineer', loc: 'Remote', score: 91, conf: 93, skills: [{ n: 'Java', s: 'STRONG' }, { n: 'PostgreSQL', s: 'STRONG' }, { n: 'AWS', s: 'MISSING' }] },
  { id: '2', name: 'Priya Sharma', role: 'Frontend Engineer', loc: 'Bangalore', score: 87, conf: 88, skills: [{ n: 'React', s: 'STRONG' }, { n: 'TypeScript', s: 'STRONG' }, { n: 'GraphQL', s: 'PARTIAL' }] },
  { id: '3', name: 'Arjun Singh', role: 'Data Scientist', loc: 'Delhi', score: 79, conf: 75, skills: [{ n: 'Python', s: 'STRONG' }, { n: 'SQL', s: 'STRONG' }, { n: 'PyTorch', s: 'PARTIAL' }] },
  { id: '4', name: 'Sneha Gupta', role: 'Backend Engineer', loc: 'Mumbai', score: 72, conf: 60, skills: [{ n: 'Python', s: 'STRONG' }, { n: 'Docker', s: 'STRONG' }, { n: 'Java', s: 'PARTIAL' }] },
];

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">Backend Software Engineer</h1>
          <p className="text-textMuted">Pipeline overview and top candidate matches.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/jobs" className="px-4 py-2 bg-surface/50 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors flex items-center gap-2">
            <Plus size={16} /> New Job
          </Link>
          <Link to="/upload" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 shadow-lg shadow-primary/20 transition-colors flex items-center gap-2">
            <UploadCloud size={16} /> Upload Resumes
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {metricCards.map((card, idx) => (
          <div key={idx} className={clsx("p-6 rounded-xl border", card.bg)}>
            <div className="flex justify-between items-start mb-4">
              <div className={clsx("p-3 rounded-lg bg-surface/50 border border-white/5", card.color)}>
                <card.icon size={20} />
              </div>
              {card.sub && <div className="text-xs font-mono text-textMuted">{card.sub}</div>}
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-1">{card.value}</h2>
              <p className="text-sm font-medium text-textMuted">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Top Candidates</h3>
        <Link to="/candidates" className="text-sm text-primary hover:underline">View All Pipeline →</Link>
      </div>

      {/* Candidate Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map(c => (
          <div key={c.id} className="glass-panel p-6 rounded-xl border border-white/5 hover:border-white/10 transition-colors flex flex-col group relative overflow-hidden">
            {c.score >= 90 && <div className="absolute top-0 right-0 w-16 h-16 bg-success/10 rounded-bl-full pointer-events-none"></div>}
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-lg font-bold group-hover:text-primary transition-colors">{c.name}</h4>
                <p className="text-xs text-textMuted">{c.role} • {c.loc}</p>
              </div>
              <div className="text-right">
                <div className={clsx(
                  "text-3xl font-black mb-1",
                  c.score >= 90 ? "text-success" : c.score >= 70 ? "text-warning" : "text-danger"
                )}>
                  {c.score}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-xs text-textMuted mb-2 flex justify-between">
                <span>Evidence Confidence</span>
                <span className="font-mono">{c.conf}%</span>
              </div>
              <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                <div className="bg-accent h-full" style={{ width: `${c.conf}%` }}></div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {c.skills.map(s => (
                <span key={s.n} className={clsx(
                  "px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border",
                  s.s === 'STRONG' ? "bg-success/10 text-success border-success/20" :
                  s.s === 'PARTIAL' ? "bg-warning/10 text-warning border-warning/20" :
                  "bg-danger/10 text-danger border-danger/20"
                )}>
                  {s.n}
                </span>
              ))}
            </div>

            <Link to={`/candidates/${c.id}`} className="mt-auto w-full py-2.5 bg-surface border border-white/5 rounded-lg text-sm font-medium text-center hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
              View Analysis <ArrowUpRight size={14} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
