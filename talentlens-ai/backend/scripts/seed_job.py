import os
import sys

# Add parent directory to path so we can import app modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.core.database import SessionLocal, engine
from app.models import domain as models
from app.services.extraction.jd_analyzer import JobDescriptionAnalyzer

def seed_job():
    # Ensure tables exist
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if a job already exists
    existing_job = db.query(models.Job).first()
    if existing_job:
        print(f"Job already exists: {existing_job.title} (ID: {existing_job.id})")
        return
        
    print("Creating default Senior Software Engineer job...")
    
    description = """
    We are looking for a Senior Software Engineer to join our core backend team. 
    You will be responsible for building scalable APIs, integrating with machine learning models, 
    and optimizing database performance.
    
    Requirements:
    - 5+ years of experience with Python (FastAPI, Django)
    - Strong knowledge of PostgreSQL and SQLAlchemy
    - Experience with Docker and CI/CD pipelines
    - Familiarity with React/TypeScript is a strong plus
    - Excellent system design and architecture skills
    """
    
    db_job = models.Job(
        title="Senior Software Engineer",
        department="Engineering",
        description=description
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    
    print(f"Analyzing JD to extract requirements for {db_job.title}...")
    
    try:
        analyzer = JobDescriptionAnalyzer()
        analysis = analyzer.analyze(db_job.title, db_job.description)
        
        for req in analysis.requirements:
            db_req = models.JobRequirement(
                job_id=db_job.id,
                name=req.name,
                req_type=req.req_type
            )
            db.add(db_req)
        db.commit()
        print(f"Successfully created job (ID: {db_job.id}) with {len(analysis.requirements)} extracted requirements.")
    except Exception as e:
        print(f"Error during JD analysis: {e}")
        
    db.close()

if __name__ == "__main__":
    seed_job()
