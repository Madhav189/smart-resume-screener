const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export type Job = {
  id: string;
  title: string;
  department?: string;
  description: string;
  created_at: string;
};

export type MatchScore = {
  id: string;
  overall_score: number;
  confidence_score: number;
  req_skill_score: number;
  semantic_match_score: number;
  experience_score: number;
  project_score: number;
  education_score: number;
  summary: string;
  candidate_id: string;
  job_id: string;
  created_at: string;
  candidate: {
    id: string;
    name: string;
    email: string;
  };
  evidence: {
    id: string;
    status: string;
    evidence_type: string;
    confidence: number;
    evidence_text: string;
    reason: string;
    requirement: {
      id: string;
      name: string;
      req_type: string;
    }
  }[];
};

export const api = {
  getJobs: async (): Promise<Job[]> => {
    const res = await fetch(`${API_URL}/api/jobs/`);
    if (!res.ok) throw new Error('Failed to fetch jobs');
    return res.json();
  },

  getJobMatches: async (jobId: string): Promise<MatchScore[]> => {
    const res = await fetch(`${API_URL}/api/matches/job/${jobId}`);
    if (!res.ok) throw new Error('Failed to fetch matches');
    return res.json();
  },

  getMatchDetail: async (candidateId: string, jobId: string): Promise<MatchScore> => {
    const res = await fetch(`${API_URL}/api/matches/${candidateId}/${jobId}`);
    if (!res.ok) throw new Error('Failed to fetch match detail');
    return res.json();
  },

  uploadResume: async (candidateId: string, file: File): Promise<{ id: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`${API_URL}/api/resumes/upload?candidate_id=${candidateId}`, {
      method: 'POST',
      body: formData,
    });
    
    if (!res.ok) throw new Error('Failed to upload resume');
    return res.json();
  },

  generateMatch: async (candidateId: string, jobId: string): Promise<MatchScore> => {
    const res = await fetch(`${API_URL}/api/matches/${candidateId}/${jobId}`, {
      method: 'POST',
    });
    
    if (!res.ok) throw new Error('Failed to generate match');
    return res.json();
  }
};
