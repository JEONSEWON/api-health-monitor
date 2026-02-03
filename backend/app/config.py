"""
Application Configuration
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings"""
    
    # App
    APP_NAME: str = "API Health Monitor"
    APP_ENV: str = "development"
    DEBUG: bool = True
    VERSION: str = "0.1.0"
    
    # Database
    DATABASE_URL: str
    
    # Redis
    REDIS_URL: str
    
    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # LemonSqueezy
    LEMONSQUEEZY_API_KEY: str = ""
    LEMONSQUEEZY_STORE_ID: str = ""
    LEMONSQUEEZY_WEBHOOK_SECRET: str = ""
    
    # SendGrid
    SENDGRID_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@apihealthmonitor.com"
    
    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    @property
    def allowed_origins_list(self) -> list[str]:
        """Convert comma-separated origins to list"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
