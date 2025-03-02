# backend/app/config.py
import os
import secrets
from typing import List
from pydantic import BaseModel

class Settings(BaseModel):
    # Basic settings
    PROJECT_NAME: str = "Academic Portfolio"
    PROJECT_VERSION: str = "0.1.0"
    API_PREFIX: str = "/api"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS - Development mode
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",  # Development frontend
        "http://localhost:8000",  # Development backend
        "http://127.0.0.1:3000",  # Alternative local address
        "http://frontend:3000",   # Container service name
    ]
    
    # MongoDB
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://mongodb:27017")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "academic_portfolio")
    
    # File uploads
    MEDIA_ROOT: str = os.getenv("MEDIA_ROOT", "media")
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10 MB
    ALLOWED_UPLOAD_EXTENSIONS: List[str] = ["jpg", "jpeg", "png", "gif", "pdf"]
    
    # Admin user
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@example.com")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "adminpassword")
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "admin")

# Load environment variables from .env file (if it exists)
def load_dotenv():
    env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                os.environ.setdefault(key.strip(), value.strip())

# Load environment variables before creating settings
load_dotenv()

# Create settings instance
settings = Settings()