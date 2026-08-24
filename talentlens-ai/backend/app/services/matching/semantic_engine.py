from sentence_transformers import SentenceTransformer, util
import torch
from ...core.config import settings

class SemanticEngine:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SemanticEngine, cls).__new__(cls)
            cls._instance.model = SentenceTransformer(settings.EMBEDDING_MODEL)
        return cls._instance

    def compute_similarity(self, query: str, texts: list[str]) -> list[float]:
        if not texts:
            return []
        
        query_emb = self.model.encode(query, convert_to_tensor=True)
        text_embs = self.model.encode(texts, convert_to_tensor=True)
        
        cosine_scores = util.cos_sim(query_emb, text_embs)[0]
        return cosine_scores.tolist()

    def find_best_matches(self, requirement: str, candidate_evidence_texts: list[str], top_k: int = 3) -> list[tuple[str, float]]:
        if not candidate_evidence_texts:
            return []
            
        scores = self.compute_similarity(requirement, candidate_evidence_texts)
        
        # Combine texts with scores
        scored_texts = list(zip(candidate_evidence_texts, scores))
        # Sort by score descending
        scored_texts.sort(key=lambda x: x[1], reverse=True)
        
        return scored_texts[:top_k]
