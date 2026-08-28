
import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

@dataclass(frozen=True)
class Settings:
    jwt_secret: str
    jwt_algorithm: str
    access_token_expire_minutes: int
    database_url: str
    upload_dir: str
    max_upload_size_mb: int
    allowed_audio_video_extensions: tuple[str, ...]
    openai_api_key: str | None
    openai_model: str
    openai_base_url: str


def load_settings() -> Settings:
    jwt_secret = os.environ.get("JWT_SECRET")
    if not jwt_secret:
        
        jwt_secret = "dev-only-insecure-secret-change-me"

    return Settings(
        jwt_secret=jwt_secret,
        jwt_algorithm="HS256",
        access_token_expire_minutes=60 * 24,  
        database_url=os.environ.get("DATABASE_URL", "sqlite:///./meeting_intelligence.db"),
        upload_dir=os.environ.get("UPLOAD_DIR", "./uploads"),
        max_upload_size_mb=int(os.environ.get("MAX_UPLOAD_SIZE_MB", "500")),
        allowed_audio_video_extensions=(
            ".mp3", ".wav", ".m4a", ".mp4", ".mov", ".webm",
        ),
        openai_api_key=os.environ.get("OPENAI_API_KEY"),
        openai_model=os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
        openai_base_url=os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1"),
    )


settings = load_settings()
