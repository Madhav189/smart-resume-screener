from ..llm.provider import get_llm_provider
from ...schemas.domain import LLMJobAnalysis
import json

class JobDescriptionAnalyzer:
    def __init__(self):
        self.llm = get_llm_provider()
    
    def analyze(self, job_title: str, job_description: str) -> LLMJobAnalysis:
        prompt = f"""
You are an expert technical recruiter analyzing a job description.
Extract the key requirements from the job description and classify them into the following types:
- MUST_HAVE (Essential technical skills, frameworks, languages)
- NICE_TO_HAVE (Bonus technical skills)
- EXPERIENCE (Years of experience required)
- EDUCATION (Degree requirements)
- DOMAIN (Industry or domain experience like FinTech, Healthcare)
- SOFT_SKILL (Communication, Leadership, etc.)

Job Title: {job_title}
Job Description:
---
{job_description}
---

Be precise and concise.
"""
        return self.llm.generate_structured(prompt, LLMJobAnalysis)
