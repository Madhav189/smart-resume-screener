from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from ..core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Candidate(Base):
    __tablename__ = "candidates"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    linkedin = Column(String, nullable=True)
    github = Column(String, nullable=True)
    portfolio = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    resumes = relationship("Resume", back_populates="candidate", cascade="all, delete-orphan")
    matches = relationship("Match", back_populates="candidate", cascade="all, delete-orphan")

class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    candidate_id = Column(String, ForeignKey("candidates.id"))
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # pdf, txt
    raw_text = Column(Text, nullable=False)
    
    # Extracted structured data stored as JSON
    skills = Column(JSON, default=list) 
    experience = Column(JSON, default=list)
    education = Column(JSON, default=list)
    projects = Column(JSON, default=list)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    candidate = relationship("Candidate", back_populates="resumes")
    analysis_runs = relationship("AnalysisRun", back_populates="resume")

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    department = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    requirements = relationship("JobRequirement", back_populates="job", cascade="all, delete-orphan")
    matches = relationship("Match", back_populates="job", cascade="all, delete-orphan")

class JobRequirement(Base):
    __tablename__ = "job_requirements"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    job_id = Column(String, ForeignKey("jobs.id"))
    name = Column(String, nullable=False)
    req_type = Column(String, nullable=False)  # MUST_HAVE, NICE_TO_HAVE, EXPERIENCE, EDUCATION, DOMAIN, SOFT_SKILL
    
    job = relationship("Job", back_populates="requirements")
    match_evidence = relationship("MatchEvidence", back_populates="requirement")

class Match(Base):
    __tablename__ = "matches"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    candidate_id = Column(String, ForeignKey("candidates.id"))
    job_id = Column(String, ForeignKey("jobs.id"))
    
    overall_score = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=False)
    
    # Score breakdown
    req_skill_score = Column(Float, default=0.0)
    semantic_match_score = Column(Float, default=0.0)
    experience_score = Column(Float, default=0.0)
    project_score = Column(Float, default=0.0)
    education_score = Column(Float, default=0.0)
    
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    candidate = relationship("Candidate", back_populates="matches")
    job = relationship("Job", back_populates="matches")
    evidence = relationship("MatchEvidence", back_populates="match", cascade="all, delete-orphan")

class MatchEvidence(Base):
    __tablename__ = "match_evidence"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    match_id = Column(String, ForeignKey("matches.id"))
    requirement_id = Column(String, ForeignKey("job_requirements.id"))
    
    status = Column(String, nullable=False) # STRONG_MATCH, PARTIAL_MATCH, SEMANTIC_MATCH, WEAK_MATCH, MISSING, UNKNOWN
    evidence_type = Column(String, nullable=False) # EXPLICIT, EVIDENCE, SEMANTIC, INFERRED, MISSING
    confidence = Column(Float, nullable=False)
    evidence_text = Column(Text, nullable=True) # The actual sentence from the resume
    reason = Column(Text, nullable=True) # LLM explanation
    
    match = relationship("Match", back_populates="evidence")
    requirement = relationship("JobRequirement", back_populates="match_evidence")

class AnalysisRun(Base):
    __tablename__ = "analysis_runs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    resume_id = Column(String, ForeignKey("resumes.id"))
    job_id = Column(String, ForeignKey("jobs.id"))
    status = Column(String, nullable=False) # QUEUED, PROCESSING, COMPLETED, FAILED
    llm_provider = Column(String, nullable=False)
    prompt_version = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    resume = relationship("Resume", back_populates="analysis_runs")
