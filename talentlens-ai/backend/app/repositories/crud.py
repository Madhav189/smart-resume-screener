from sqlalchemy.orm import Session
from ..models import domain as models
from ..schemas import domain as schemas

# Job Repositories
def get_job(db: Session, job_id: str):
    return db.query(models.Job).filter(models.Job.id == job_id).first()

def get_jobs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Job).offset(skip).limit(limit).all()

def create_job(db: Session, job: schemas.JobCreate):
    db_job = models.Job(
        title=job.title,
        department=job.department,
        description=job.description
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

def create_job_requirement(db: Session, job_id: str, requirement: schemas.JobRequirementCreate):
    db_req = models.JobRequirement(**requirement.model_dump(), job_id=job_id)
    db.add(db_req)
    db.commit()
    db.refresh(db_req)
    return db_req

# Candidate Repositories
def get_candidate(db: Session, candidate_id: str):
    return db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()

def get_candidates(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Candidate).offset(skip).limit(limit).all()

# Match Repositories
def get_match(db: Session, candidate_id: str, job_id: str):
    return db.query(models.Match).filter(
        models.Match.candidate_id == candidate_id,
        models.Match.job_id == job_id
    ).first()

def get_job_matches(db: Session, job_id: str):
    return db.query(models.Match).filter(models.Match.job_id == job_id).order_by(models.Match.overall_score.desc()).all()
