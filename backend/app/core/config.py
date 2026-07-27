import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "PharmaGen AI"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    
    SECRET_KEY: str = "super_secret_pharmagen_key_2026_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    POSTGRES_USER: str = "pharmagen"
    POSTGRES_PASSWORD: str = "secure_pharma_password_2026"
    POSTGRES_DB: str = "pharmagen_db"
    POSTGRES_HOST: str = "db"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: str = "postgresql+asyncpg://pharmagen:secure_pharma_password_2026@localhost:5432/pharmagen_db"
    
    GEMINI_API_KEY: str = ""
    EMBEDDING_MODEL: str = "text-embedding-005"
    LLM_MODEL: str = "gemini-2.5-flash"
    
    MLFLOW_TRACKING_URI: str = "http://localhost:5000"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
