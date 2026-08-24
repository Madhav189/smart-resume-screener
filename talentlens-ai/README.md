# TalentLens AI
**Explainable Resume Intelligence & Candidate Matching Platform**

## Problem
Traditional Applicant Tracking Systems (ATS) rely on basic keyword matching and boolean search. Modern "AI" resume scanners often provide an arbitrary, black-box score from 1-100, leaving recruiters wondering *why* the candidate scored so high, or worse, falling victim to LLM hallucinations inventing experience that the candidate never had.

## Solution
**TalentLens AI** is a production-grade candidate intelligence system built on the philosophy that **"Every score must have evidence."**

Instead of blindly trusting an LLM score, TalentLens utilizes a multi-stage NLP pipeline. It parses the resume, normalizes skills, and uses semantic embeddings (`sentence-transformers`) to conceptually match candidate experience to job requirements. Finally, an LLM acts as an Evidence Verifier, extracting the *exact sentence* from the resume to prove the match.

### Key Differentiators
- ✓ **Evidence-Grounded Scoring**: Every match (Strong, Partial, Missing) points to the original resume text.
- ✓ **Semantic Matching**: Understands that "TCP concurrent server" matches "Backend distributed systems".
- ✓ **Skill Normalization**: `JS` -> `JavaScript`, `K8s` -> `Kubernetes`.
- ✓ **Explainable Candidate Ranking**: Deterministic math powers the final score, not an LLM hallucination.
- ✓ **Interview Question Generator**: Generates targeted verification questions based on resume claims.

---

## System Architecture

The application is split into a highly interactive React/Vite frontend (styled as a "Career Diagnostic Lab") and a robust FastAPI backend.

### Pipeline
`PDF/DOCX` → `Text Extraction` → `Structured JSON Parsing` → `Skill Normalization` → `Semantic Embedding` → `LLM Evidence Verification` → `Deterministic Scoring`

---

## Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\Activate.ps1
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env # Add your GEMINI_API_KEY or OPENAI_API_KEY
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Docker Setup
```bash
docker compose up
```

## Demo Data
Check the `/demo` folder for synthetic resumes (`sample_resume_backend.txt`, `sample_resume_frontend.txt`) and a sample job description to test the matching engine.

## Future Improvements
- Native DOCX support improvements.
- Webhook integrations for existing ATS platforms (Workday, Greenhouse).
- Blind Screening Mode toggle to strip PII before rendering to recruiters.
