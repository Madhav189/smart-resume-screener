from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Shared base models
class ORMBaseModel(BaseModel):
    id: str
    
    class Config:
        from_attributes = True

# --- Jobs ---
class JobRequirementBase(BaseModel):
    name: str
    req_type: str

class JobRequirementCreate(JobRequirementBase):
    pass

class JobRequirement(ORMBaseModel, JobRequirementBase):
    job_id: str

class JobBase(BaseModel):
    title: str
    department: Optional[str] = None
    description: str

class JobCreate(JobBase):
    pass

class Job(ORMBaseModel, JobBase):
    created_at: datetime
    requirements: List[JobRequirement] = []

# --- Resumes and Candidates ---
class CandidateBase(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None

class ResumeBase(BaseModel):
    filename: str
    file_type: str
    skills: List[str] = []
    experience: List[Dict[str, Any]] = []
    education: List[Dict[str, Any]] = []
    projects: List[Dict[str, Any]] = []

class Resume(ORMBaseModel, ResumeBase):
    candidate_id: str
    created_at: datetime

class Candidate(ORMBaseModel, CandidateBase):
    created_at: datetime
    resumes: List[Resume] = []

# --- Matching ---
class MatchEvidenceBase(BaseModel):
    status: str
    evidence_type: str
    confidence: float
    evidence_text: Optional[str] = None
    reason: Optional[str] = None

class MatchEvidence(ORMBaseModel, MatchEvidenceBase):
    match_id: str
    requirement_id: str
    requirement: JobRequirement

class MatchBase(BaseModel):
    overall_score: float
    confidence_score: float
    req_skill_score: float = 0.0
    semantic_match_score: float = 0.0
    experience_score: float = 0.0
    project_score: float = 0.0
    education_score: float = 0.0
    summary: Optional[str] = None

class Match(ORMBaseModel, MatchBase):
    candidate_id: str
    job_id: str
    created_at: datetime
    evidence: List[MatchEvidence] = []
    candidate: Optional[Candidate] = None

# --- AI Extraction Schemas (for LLM Output Validation) ---
class LLMExtractedRequirement(BaseModel):
    name: str
    req_type: str # MUST_HAVE, NICE_TO_HAVE, EXPERIENCE, EDUCATION, DOMAIN, SOFT_SKILL

class LLMJobAnalysis(BaseModel):
    requirements: List[LLMExtractedRequirement]

class LLMExperience(BaseModel):
    company: str
    title: str
    duration: str
    description: List[str]

class LLMEducation(BaseModel):
    institution: str
    degree: str
    year: str

class LLMProject(BaseModel):
    name: str
    technologies: List[str]
    description: str

class LLMResumeExtraction(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    skills: List[str] = []
    experience: List[LLMExperience] = []
    education: List[LLMEducation] = []
    projects: List[LLMProject] = []

class LLMEvidenceVerification(BaseModel):
    requirement: str
    status: str # STRONG_MATCH, PARTIAL_MATCH, SEMANTIC_MATCH, WEAK_MATCH, MISSING, UNKNOWN
    evidence_type: str # EXPLICIT, EVIDENCE, SEMANTIC, INFERRED, MISSING
    confidence: float
    evidence_text: Optional[str] = None
    reason: str
