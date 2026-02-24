from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "BuildWise API"
    API_V1_STR: str = "/api/v1"
    
    # Auth
    SECRET_KEY: str = "super_secret_temporary_key_for_dev_change_me_later"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Database
    # Using SQLite by default for simple local setup; can be swapped to postgres
    DATABASE_URL: str = "sqlite:///./buildwise.db"
    
    # AI Integration
    ANTHROPIC_API_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"

settings = Settings()
