from ..llm.provider import get_llm_provider
from ...schemas.domain import LLMResumeExtraction
import json

class ResumeExtractor:
    def __init__(self):
        self.llm = get_llm_provider()
    
    def extract(self, raw_text: str) -> LLMResumeExtraction:
        prompt = f"""
You are an expert resume parser for an Applicant Tracking System.
Extract the following information from the provided resume text into a structured format.
Extract:
1. Candidate Name, Email, Phone, Location, LinkedIn URL, GitHub URL.
2. A list of technical and soft skills. Normalize skill names (e.g., 'NodeJS' -> 'Node.js').
3. Work Experience (Company, Title, Duration, Description as list of bullet points).
4. Education (Institution, Degree, Year).
5. Projects (Name, Technologies used, Description).

Ensure you accurately capture achievements, metrics, and specific technologies mentioned in bullet points.

Resume Text:
---
{raw_text}
---
"""
        return self.llm.generate_structured(prompt, LLMResumeExtraction)
