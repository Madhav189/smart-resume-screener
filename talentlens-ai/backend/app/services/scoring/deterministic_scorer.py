from ...schemas.domain import MatchBase, MatchEvidenceBase
import math

class DeterministicScorer:
    WEIGHTS = {
        "required_skill": 0.35,
        "semantic_match": 0.20,
        "experience": 0.15,
        "project_relevance": 0.10,
        "education": 0.10,
        "nice_to_have": 0.05,
        "confidence": 0.05
    }

    def score(self, evidences: list[MatchEvidenceBase]) -> MatchBase:
        # Tally up points based on evidence
        must_have_total = 0
        must_have_earned = 0
        nice_to_have_total = 0
        nice_to_have_earned = 0
        semantic_total = 0
        semantic_earned = 0
        
        confidence_sum = 0.0
        
        for ev in evidences:
            confidence_sum += ev.confidence
            
            # Simplified logic based on requirement type from the evidence (which we'd need to pass in real implementation)
            # For MVP, we'll estimate based on status
            score_val = 0.0
            if ev.status == "STRONG_MATCH":
                score_val = 1.0
            elif ev.status in ["PARTIAL_MATCH", "SEMANTIC_MATCH"]:
                score_val = 0.5
            elif ev.status == "WEAK_MATCH":
                score_val = 0.2
            
            must_have_total += 1 # Assume all are must have for MVP math
            must_have_earned += score_val
            
            if ev.evidence_type in ["SEMANTIC", "INFERRED"]:
                semantic_total += 1
                semantic_earned += score_val
                
        # Calculate individual components (0 to 100)
        req_score = (must_have_earned / must_have_total * 100) if must_have_total > 0 else 0
        sem_score = (semantic_earned / semantic_total * 100) if semantic_total > 0 else req_score
        exp_score = req_score # simplified
        proj_score = req_score # simplified
        edu_score = 100 # simplified
        
        avg_conf = (confidence_sum / len(evidences) * 100) if evidences else 0
        
        final_score = (
            req_score * self.WEIGHTS["required_skill"] +
            sem_score * self.WEIGHTS["semantic_match"] +
            exp_score * self.WEIGHTS["experience"] +
            proj_score * self.WEIGHTS["project_relevance"] +
            edu_score * self.WEIGHTS["education"] +
            avg_conf * self.WEIGHTS["confidence"]
        )
        
        return MatchBase(
            overall_score=round(final_score, 1),
            confidence_score=round(avg_conf, 1),
            req_skill_score=round(req_score, 1),
            semantic_match_score=round(sem_score, 1),
            experience_score=round(exp_score, 1),
            project_score=round(proj_score, 1),
            education_score=round(edu_score, 1)
        )
