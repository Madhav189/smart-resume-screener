import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "TalentLens AI"
    VERSION: str = "1.0.0"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./talentlens.db")
    
    # LLM Settings
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "gemini") # "openai", "gemini", "mock"
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Matching thresholds
    MATCH_STRONG_THRESHOLD: float = 0.85
    MATCH_PARTIAL_THRESHOLD: float = 0.60
    
    # Model configuration
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

settings = Settings()
