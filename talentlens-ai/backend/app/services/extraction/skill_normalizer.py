import re

class SkillNormalizer:
    # A simple deterministic mapping for MVP
    # In production, this could be backed by an LLM or a large taxonomy DB.
    TAXONOMY = {
        "node": "Node.js",
        "nodejs": "Node.js",
        "js": "JavaScript",
        "react": "React",
        "reactjs": "React",
        "react.js": "React",
        "postgres": "PostgreSQL",
        "ts": "TypeScript",
        "aws": "AWS",
        "amazon web services": "AWS",
        "gcp": "Google Cloud",
        "k8s": "Kubernetes",
        "ml": "Machine Learning"
    }
    
    @classmethod
    def normalize(cls, skill: str) -> str:
        s = skill.strip().lower()
        return cls.TAXONOMY.get(s, skill.strip())
