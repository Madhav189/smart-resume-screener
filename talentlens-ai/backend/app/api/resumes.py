from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models import domain as models
from ..schemas import domain as schemas
from ..services.parsing.document_parser import DocumentParser
from ..services.extraction.resume_extractor import ResumeExtractor

router = APIRouter()

@router.post("/upload", response_model=schemas.Resume)
async def upload_resume(candidate_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    # 1. Parse File
    content = await file.read()
    try:
        raw_text = DocumentParser.parse(content, file.filename)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse document: {str(e)}")
    
    # 2. Extract structured data using LLM
    extractor = ResumeExtractor()
    extracted = extractor.extract(raw_text)
    
    # 3. Create candidate if not exists (simplified)
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        candidate = models.Candidate(
            id=candidate_id, 
            name=extracted.name, 
            email=extracted.email, 
            phone=extracted.phone
        )
        db.add(candidate)
        db.commit()

    # 4. Save Resume
    db_resume = models.Resume(
        candidate_id=candidate.id,
        filename=file.filename,
        file_type=file.filename.split(".")[-1],
        raw_text=raw_text,
        skills=extracted.skills,
        experience=[exp.model_dump() for exp in extracted.experience],
        education=[edu.model_dump() for edu in extracted.education],
        projects=[proj.model_dump() for proj in extracted.projects]
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    
    return db_resume

@router.get("/{resume_id}", response_model=schemas.Resume)
def get_resume(resume_id: str, db: Session = Depends(get_db)):
    resume = db.query(models.Resume).filter(models.Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume
