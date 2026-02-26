from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import List, Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Supabase
    supabase_url: str
    supabase_key: str
    supabase_service_key: Optional[str] = None  # Made optional
    supabase_jwt_secret: Optional[str] = None  # For JWT verification
    
    # AI - support both OpenAI and Gemini
    openai_api_key: Optional[str] = ""
    gemini_api_key: Optional[str] = ""  # Primary: caption generation & audience persona
    gemini_api_key_secondary: Optional[str] = ""  # Secondary: hook detection & chatbot

    # Ollama (Text Insights)
    ollama_base_url: str = "http://localhost:11434/v1"
    ollama_model: str = "llama3"
    
    # App
    app_env: str = "development"
    debug: bool = True
    cors_origins: str = "http://localhost:5173,http://localhost:3000,http://localhost:8080"
    
    # Social APIs
    youtube_api_key: Optional[str] = ""
    youtube_access_token: Optional[str] = ""
    instagram_client_id: Optional[str] = ""
    instagram_client_secret: Optional[str] = ""
    instagram_access_token: Optional[str] = ""  # Will be mapped from IG_PAGE_ACCESS_TOKEN if present
    
    # Voice AI
    elevenlabs_api_key: Optional[str] = ""
    
    # Groq (for LLaVA)
    groq_api_key: Optional[str] = ""
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",  # Ignore extra environment variables
        # Map specific env vars to settings fields
        populate_by_name=True,
    )

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Manual fallback mapping if not set by pydantic automatically
        import os
        if not self.instagram_access_token:
            self.instagram_access_token = os.getenv("IG_PAGE_ACCESS_TOKEN", "")


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
