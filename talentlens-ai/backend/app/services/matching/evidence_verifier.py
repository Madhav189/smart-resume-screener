from ..llm.provider import get_llm_provider
from ...schemas.domain import LLMEvidenceVerification

class EvidenceVerifier:
    def __init__(self):
        self.llm = get_llm_provider()
    
    def verify(self, requirement: str, candidate_texts: list[str]) -> LLMEvidenceVerification:
        # We pass the top semantically matching sentences to the LLM to verify
        context = "\n".join([f"- {text}" for text in candidate_texts]) if candidate_texts else "No candidate context available."
        
        prompt = f"""
You are an expert technical recruiter verifying candidate evidence against a job requirement.
Job Requirement: "{requirement}"

Candidate Evidence Sentences:
{context}

Analyze the evidence and determine if the candidate meets the requirement.
Rules for Evidence Type:
- EXPLICIT: The requirement is explicitly stated in the evidence.
- EVIDENCE: The candidate describes work that clearly proves they have the skill.
- SEMANTIC: The concepts match (e.g. 'TCP server' implies 'backend').
- INFERRED: Weak evidence, but implies the skill.
- MISSING: The evidence does not support the requirement at all.

Rules for Status:
STRONG_MATCH, PARTIAL_MATCH, SEMANTIC_MATCH, WEAK_MATCH, MISSING, UNKNOWN.

Return the result matching the schema strictly.
"""
        return self.llm.generate_structured(prompt, LLMEvidenceVerification)
