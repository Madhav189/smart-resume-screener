from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models import domain as models
from ..schemas import domain as schemas
from ..services.matching.semantic_engine import SemanticEngine
from ..services.matching.evidence_verifier import EvidenceVerifier
from ..services.scoring.deterministic_scorer import DeterministicScorer

router = APIRouter()

@router.post("/{candidate_id}/{job_id}", response_model=schemas.Match)
def generate_match(candidate_id: str, job_id: str, db: Session = Depends(get_db)):
    # 1. Fetch Candidate/Resume and Job
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate or not candidate.resumes:
        raise HTTPException(status_code=404, detail="Candidate or Resume not found")
    resume = candidate.resumes[0] # For MVP, use the first resume
    
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    if not job.requirements:
        raise HTTPException(status_code=400, detail="Job has no requirements analyzed yet.")

    # 2. Gather all candidate evidence texts
    # Combine skills, experience descriptions, project descriptions
    evidence_texts = resume.skills.copy()
    for exp in resume.experience:
        evidence_texts.extend(exp.get("description", []))
    for proj in resume.projects:
        evidence_texts.append(proj.get("description", ""))
    
    evidence_texts = [text for text in evidence_texts if text.strip()]

    # 3. Analyze each requirement
    semantic_engine = SemanticEngine()
    verifier = EvidenceVerifier()
    
    match_evidences = []
    db_evidences = []
    
    for req in job.requirements:
        # Find best semantic matches in resume for this requirement
        best_texts_scores = semantic_engine.find_best_matches(req.name, evidence_texts, top_k=3)
        best_texts = [text for text, score in best_texts_scores]
        
        # Verify with LLM
        verification = verifier.verify(req.name, best_texts)
        
        # Store evidence
        db_ev = models.MatchEvidence(
            requirement_id=req.id,
            status=verification.status,
            evidence_type=verification.evidence_type,
            confidence=verification.confidence,
            evidence_text=verification.evidence_text,
            reason=verification.reason
        )
        db_evidences.append(db_ev)
        match_evidences.append(schemas.MatchEvidenceBase(
            status=verification.status,
            evidence_type=verification.evidence_type,
            confidence=verification.confidence,
            evidence_text=verification.evidence_text,
            reason=verification.reason
        ))
        
    # 4. Calculate deterministic score
    scorer = DeterministicScorer()
    score_result = scorer.score(match_evidences)
    
    # 5. Save Match to DB
    # Check if match exists and delete it to overwrite
    existing_match = db.query(models.Match).filter(
        models.Match.candidate_id == candidate_id, 
        models.Match.job_id == job_id
    ).first()
    if existing_match:
        db.delete(existing_match)
        db.commit()
        
    db_match = models.Match(
        candidate_id=candidate_id,
        job_id=job_id,
        overall_score=score_result.overall_score,
        confidence_score=score_result.confidence_score,
        req_skill_score=score_result.req_skill_score,
        semantic_match_score=score_result.semantic_match_score,
        experience_score=score_result.experience_score,
        project_score=score_result.project_score,
        education_score=score_result.education_score,
        summary=score_result.summary
    )
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    
    # Attach evidences to match
    for ev in db_evidences:
        ev.match_id = db_match.id
        db.add(ev)
    db.commit()
    db.refresh(db_match)
    
    return db_match

@router.get("/{candidate_id}/{job_id}", response_model=schemas.Match)
def get_match(candidate_id: str, job_id: str, db: Session = Depends(get_db)):
    match = db.query(models.Match).filter(
        models.Match.candidate_id == candidate_id,
        models.Match.job_id == job_id
    ).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return match

@router.get("/job/{job_id}", response_model=list[schemas.Match])
def get_matches_for_job(job_id: str, db: Session = Depends(get_db)):
    return db.query(models.Match).filter(models.Match.job_id == job_id).order_by(models.Match.overall_score.desc()).all()
