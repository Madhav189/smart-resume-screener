from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models import domain as models
from ..schemas import domain as schemas
from ..services.extraction.jd_analyzer import JobDescriptionAnalyzer

router = APIRouter()

@router.post("/", response_model=schemas.Job)
def create_job(job_in: schemas.JobCreate, db: Session = Depends(get_db)):
    # 1. Save Job
    db_job = models.Job(
        title=job_in.title,
        department=job_in.department,
        description=job_in.description
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    
    # 2. Analyze JD to extract requirements
    analyzer = JobDescriptionAnalyzer()
    try:
        analysis = analyzer.analyze(db_job.title, db_job.description)
        for req in analysis.requirements:
            db_req = models.JobRequirement(
                job_id=db_job.id,
                name=req.name,
                req_type=req.req_type
            )
            db.add(db_req)
        db.commit()
        db.refresh(db_job)
    except Exception as e:
        # If analysis fails, we still have the job but no requirements
        print(f"JD Analysis failed: {e}")
        
    return db_job

@router.get("/{job_id}", response_model=schemas.Job)
def get_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.get("/", response_model=list[schemas.Job])
def get_jobs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Job).offset(skip).limit(limit).all()
