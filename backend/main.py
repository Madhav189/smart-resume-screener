from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from backend.resume_parser import extract_text_from_pdf
from backend.llm_service import analyze_resume, extract_jd_requirements
from backend.database import SessionLocal, Resume, ScreeningSession
import shutil
import os
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:8080",
        "http://localhost:8080",
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/")
def home():
    return {
        "message": "Smart Resume Screener is running!"
    }


@app.post("/analyze-resume")
async def analyze(
    resume_files: list[UploadFile] = File(...),
    job_file: UploadFile | None = File(None),
    job_description: str | None = Form(None)
):
    os.makedirs("resumes", exist_ok=True)
    os.makedirs("job_descriptions", exist_ok=True)

    if not job_file and not job_description:
        return {
            "error": "Please provide either a job description PDF or job description text."
        }

    if job_file and job_description:
        return {
            "error": "Provide either job description PDF or text, not both."
        }

    if job_file:
        job_path = os.path.join(
            "job_descriptions",
            job_file.filename
        )

        with open(job_path, "wb") as buffer:
            shutil.copyfileobj(
                job_file.file,
                buffer
            )

        jd_text = extract_text_from_pdf(job_path)
        job_source = "pdf"

    else:
        jd_text = job_description
        job_source = "text"

    jd_requirements = extract_jd_requirements(jd_text)

    db = SessionLocal()

    try:
        screening_session = ScreeningSession(
            job_source=job_source,
            job_description=jd_text,
            jd_requirements=json.dumps(jd_requirements)
        )

        db.add(screening_session)
        db.commit()
        db.refresh(screening_session)

        results = []

        for resume_file in resume_files:
            resume_path = os.path.join(
                "resumes",
                resume_file.filename
            )

            with open(resume_path, "wb") as buffer:
                shutil.copyfileobj(
                    resume_file.file,
                    buffer
                )

            resume_text = extract_text_from_pdf(
                resume_path
            )

            analysis = analyze_resume(
                resume_text,
                jd_requirements
            )

            candidate = analysis.get(
                "candidate",
                {}
            )

            resume_record = Resume(
                session_id=screening_session.id,
                filename=resume_file.filename,
                candidate_name=candidate.get(
                    "name",
                    ""
                ),
                education=json.dumps(
                    candidate.get(
                        "education",
                        []
                    )
                ),
                skills=json.dumps(
                    candidate.get(
                        "skills",
                        []
                    )
                ),
                experience=json.dumps(
                    candidate.get(
                        "experience",
                        []
                    )
                ),
                projects=json.dumps(
                    candidate.get(
                        "projects",
                        []
                    )
                ),
                certifications=json.dumps(
                    candidate.get(
                        "certifications",
                        []
                    )
                ),
                resume_text=resume_text,
                match_score=str(
                    analysis.get(
                        "match_score",
                        0
                    )
                ),
                shortlist=analysis.get(
                    "shortlist",
                    "No"
                ),
                justification=analysis.get(
                    "justification",
                    ""
                ),
                requirements=json.dumps(
                    analysis.get(
                        "requirements",
                        {}
                    )
                )
            )

            db.add(resume_record)
            db.commit()
            db.refresh(resume_record)

            results.append({
                "id": resume_record.id,
                "filename": resume_file.filename,
                "candidate": candidate,
                "analysis": analysis
            })

        results.sort(
            key=lambda x: float(
                x["analysis"].get(
                    "match_score",
                    0
                )
            ),
            reverse=True
        )

        for index, result in enumerate(
            results,
            start=1
        ):
            result["rank"] = index

            resume_record = db.query(
                Resume
            ).filter(
                Resume.id == result["id"]
            ).first()

            resume_record.rank = index

        db.commit()

        shortlisted = [
            result
            for result in results
            if result["analysis"].get(
                "shortlist"
            ) == "Yes"
        ]

        not_shortlisted = [
            result
            for result in results
            if result["analysis"].get(
                "shortlist"
            ) == "No"
        ]

        return {
            "session_id": screening_session.id,
            "job_source": job_source,
            "total_candidates": len(results),
            "shortlisted_count": len(shortlisted),
            "not_shortlisted_count": len(not_shortlisted),
            "ranked_candidates": results,
            "shortlisted": shortlisted,
            "not_shortlisted": not_shortlisted
        }

    finally:
        db.close()


@app.get("/screening/{session_id}")
def get_screening(session_id: int):
    db = SessionLocal()

    try:
        screening = db.query(
            ScreeningSession
        ).filter(
            ScreeningSession.id == session_id
        ).first()

        if not screening:
            return {
                "error": "Screening session not found."
            }

        resumes = db.query(
            Resume
        ).filter(
            Resume.session_id == session_id
        ).order_by(
            Resume.rank.asc()
        ).all()

        results = []

        for resume in resumes:
            candidate = {
                "name": resume.candidate_name or "",
                "education": json.loads(
                    resume.education or "[]"
                ),
                "skills": json.loads(
                    resume.skills or "[]"
                ),
                "experience": json.loads(
                    resume.experience or "[]"
                ),
                "projects": json.loads(
                    resume.projects or "[]"
                ),
                "certifications": json.loads(
                    resume.certifications or "[]"
                )
            }

            analysis = {
                "match_score": float(
                    resume.match_score or 0
                ),
                "shortlist": resume.shortlist or "No",
                "justification": resume.justification or "",
                "requirements": json.loads(
                    resume.requirements or "{}"
                )
            }

            results.append({
                "id": resume.id,
                "filename": resume.filename,
                "candidate": candidate,
                "analysis": analysis,
                "rank": resume.rank
            })

        shortlisted = [
            result
            for result in results
            if result["analysis"]["shortlist"] == "Yes"
        ]

        not_shortlisted = [
            result
            for result in results
            if result["analysis"]["shortlist"] == "No"
        ]

        return {
            "session_id": screening.id,
            "job_source": screening.job_source,
            "job_description": screening.job_description,
            "jd_requirements": json.loads(
                screening.jd_requirements or "{}"
            ),
            "total_candidates": len(results),
            "shortlisted_count": len(shortlisted),
            "not_shortlisted_count": len(not_shortlisted),
            "ranked_candidates": results,
            "shortlisted": shortlisted,
            "not_shortlisted": not_shortlisted
        }

    finally:
        db.close()


@app.get("/resume/{resume_id}")
def get_resume(resume_id: int):
    db = SessionLocal()

    try:
        resume = db.query(
            Resume
        ).filter(
            Resume.id == resume_id
        ).first()

        if not resume:
            return {
                "error": "Resume not found."
            }

        return {
            "id": resume.id,
            "session_id": resume.session_id,
            "filename": resume.filename,
            "candidate": {
                "name": resume.candidate_name or "",
                "education": json.loads(
                    resume.education or "[]"
                ),
                "skills": json.loads(
                    resume.skills or "[]"
                ),
                "experience": json.loads(
                    resume.experience or "[]"
                ),
                "projects": json.loads(
                    resume.projects or "[]"
                ),
                "certifications": json.loads(
                    resume.certifications or "[]"
                )
            },
            "resume_text": resume.resume_text,
            "match_score": float(
                resume.match_score or 0
            ),
            "shortlist": resume.shortlist,
            "justification": resume.justification,
            "requirements": json.loads(
                resume.requirements or "{}"
            ),
            "rank": resume.rank
        }

    finally:
        db.close()