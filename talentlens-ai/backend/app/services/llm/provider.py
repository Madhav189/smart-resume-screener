from abc import ABC, abstractmethod
import google.generativeai as genai
from pydantic import BaseModel
import json
from ...core.config import settings

class LLMProvider(ABC):
    @abstractmethod
    def generate_structured(self, prompt: str, schema_class: type[BaseModel]) -> BaseModel:
        pass

    @abstractmethod
    def generate_text(self, prompt: str) -> str:
        pass

class GeminiProvider(LLMProvider):
    def __init__(self):
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
        # Use gemini-1.5-flash since we need structured outputs and fast reasoning
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def generate_structured(self, prompt: str, schema_class: type[BaseModel]) -> BaseModel:
        # In a real scenario, use structured output mode or ask the model for JSON and parse it.
        # Here we'll ask it to output ONLY JSON and parse it.
        full_prompt = f"{prompt}\n\nYou must output a valid JSON object matching this schema exactly:\n{schema_class.model_json_schema()}\nDo not output any markdown formatting, only the raw JSON."
        
        response = self.model.generate_content(full_prompt)
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        
        data = json.loads(text.strip())
        return schema_class(**data)

    def generate_text(self, prompt: str) -> str:
        response = self.model.generate_content(prompt)
        return response.text

class MockProvider(LLMProvider):
    def generate_structured(self, prompt: str, schema_class: type[BaseModel]) -> BaseModel:
        # Return empty/dummy schema for local testing without API key
        return schema_class()

    def generate_text(self, prompt: str) -> str:
        return "Mock response"

def get_llm_provider() -> LLMProvider:
    if settings.LLM_PROVIDER.lower() == "gemini":
        return GeminiProvider()
    return MockProvider()
