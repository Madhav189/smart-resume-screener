import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, SlidersHorizontal, Filter, 
  ChevronDown, ArrowUpRight, Download, Loader, AlertTriangle 
} from 'lucide-react';
import clsx from 'clsx';
import { api, type Job, type MatchScore } from '../api';

export default function CandidatesList() {
  const [job, setJob] = useState<Job | null>(null);
  const [matches, setMatches] = useState<MatchScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobs = await api.getJobs();
        if (jobs.length > 0) {
          setJob(jobs[0]); // Pick first job for demo
          const matchData = await api.getJobMatches(jobs[0].id);
          setMatches(matchData);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load candidates data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-textMuted">
        <Loader className="animate-spin mr-3" size={24} /> Loading Candidates...
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

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col pb-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Candidates Directory</h1>
          <p className="text-sm text-textMuted mt-1">Showing {matches.length} candidates for {job?.title || 'All Jobs'}.</p>
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
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-white">Candidate Name</th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-white text-center">Overall Score</th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-white text-center">Evidence Conf.</th>
                <th className="px-6 py-4 font-medium">Top Skills Matched</th>
                <th className="px-6 py-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {matches.map((m) => (
                <tr key={m.id} className="hover:bg-surface/30 transition-colors group">
                  <td className="px-6 py-4"><input type="checkbox" className="rounded bg-background border-white/20 text-primary focus:ring-primary/50" /></td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white group-hover:text-primary transition-colors">{m.candidate?.name || 'Unknown'}</div>
                    <div className="text-xs text-textMuted">{job?.title}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className={clsx(
                      "inline-flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold text-lg",
                      m.overall_score >= 80 ? "border-success text-success" :
                      m.overall_score >= 70 ? "border-warning text-warning" : "border-danger text-danger"
                    )}>
                      {Math.round(m.overall_score)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-mono text-xs">{Math.round(m.confidence_score)}%</span>
                      <div className="w-16 h-1.5 bg-background rounded-full overflow-hidden">
                        <div className="bg-accent h-full" style={{ width: `${Math.round(m.confidence_score)}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {m.evidence.filter(e => e.status.includes('STRONG')).slice(0, 2).map(e => (
                        <span key={e.id} className="text-xs bg-success/10 text-success border border-success/20 px-2 py-1 rounded truncate max-w-[120px]">
                          {e.requirement?.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/candidates/${m.candidate_id}`} className="inline-flex items-center justify-center w-8 h-8 rounded bg-white/5 hover:bg-primary hover:text-white transition-colors">
                      <ArrowUpRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
              {matches.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-textMuted">
                    No candidates found for this job.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
