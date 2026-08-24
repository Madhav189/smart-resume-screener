import React, { useState, useEffect } from 'react';
import { Users, FileSearch, Zap, AlertTriangle, ArrowUpRight, UploadCloud, Plus, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { api, type Job, type MatchScore } from '../api';

export default function Dashboard() {
  const [job, setJob] = useState<Job | null>(null);
  const [matches, setMatches] = useState<MatchScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobs = await api.getJobs();
        if (jobs.length > 0) {
          setJob(jobs[0]); // Pick first job for dashboard
          const matchData = await api.getJobMatches(jobs[0].id);
          setMatches(matchData);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data. Ensure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-textMuted">
        <Loader className="animate-spin mr-3" size={24} /> Loading Dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-danger flex-col">
        <AlertTriangle size={48} className="mb-4 opacity-50" />
        <p>{error}</p>
      </div>
    );
  }

  const strongMatches = matches.filter(m => m.overall_score >= 90).length;
  const potentialMatches = matches.filter(m => m.overall_score >= 70 && m.overall_score < 90).length;
  const lowMatches = matches.filter(m => m.overall_score < 70).length;

  const metricCards = [
    { label: 'Candidates Analyzed', value: matches.length.toString(), icon: Users, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
    { label: 'Strong Matches', value: strongMatches.toString(), sub: '90-100%', icon: Zap, color: 'text-success', bg: 'bg-success/10 border-success/20' },
    { label: 'Potential Matches', value: potentialMatches.toString(), sub: '70-89%', icon: FileSearch, color: 'text-warning', bg: 'bg-warning/10 border-warning/20' },
    { label: 'Low Matches', value: lowMatches.toString(), sub: '<70%', icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/10 border-danger/20' },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">{job ? job.title : 'No Active Jobs'}</h1>
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
        {matches.slice(0, 6).map(m => (
          <div key={m.id} className="glass-panel p-6 rounded-xl border border-white/5 hover:border-white/10 transition-colors flex flex-col group relative overflow-hidden">
            {m.overall_score >= 90 && <div className="absolute top-0 right-0 w-16 h-16 bg-success/10 rounded-bl-full pointer-events-none"></div>}
            
            <div className="flex justify-between items-start mb-6">
              <div className="pr-4">
                <h4 className="text-lg font-bold group-hover:text-primary transition-colors truncate">{m.candidate?.name || 'Unknown Candidate'}</h4>
                <p className="text-xs text-textMuted">{job?.title}</p>
              </div>
              <div className="text-right">
                <div className={clsx(
                  "text-3xl font-black mb-1",
                  m.overall_score >= 90 ? "text-success" : m.overall_score >= 70 ? "text-warning" : "text-danger"
                )}>
                  {Math.round(m.overall_score)}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-xs text-textMuted mb-2 flex justify-between">
                <span>Evidence Confidence</span>
                <span className="font-mono">{Math.round(m.confidence_score)}%</span>
              </div>
              <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                <div className="bg-accent h-full" style={{ width: `${Math.round(m.confidence_score)}%` }}></div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {m.evidence.slice(0, 4).map(ev => (
                <span key={ev.id} className={clsx(
                  "px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border truncate max-w-[140px]",
                  ev.status.includes('STRONG') ? "bg-success/10 text-success border-success/20" :
                  ev.status.includes('PARTIAL') ? "bg-warning/10 text-warning border-warning/20" :
                  "bg-danger/10 text-danger border-danger/20"
                )}>
                  {ev.requirement?.name || 'Requirement'}
                </span>
              ))}
            </div>

            <Link to={`/candidates/${m.candidate_id}`} className="mt-auto w-full py-2.5 bg-surface border border-white/5 rounded-lg text-sm font-medium text-center hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
              View Analysis <ArrowUpRight size={14} />
            </Link>
          </div>
        ))}
        {matches.length === 0 && (
          <div className="col-span-3 py-10 text-center text-textMuted glass-panel rounded-xl border border-white/5">
            No candidates analyzed yet. Upload some resumes!
          </div>
        )}
      </div>
    </div>
  );
}
