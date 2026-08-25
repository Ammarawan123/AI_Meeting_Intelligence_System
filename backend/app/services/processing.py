import logging
import subprocess

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.models import Meeting

logger = logging.getLogger(__name__)


def get_media_duration_seconds(file_path: str) -> int:
    try:
        result = subprocess.run(
            [
                "ffprobe",
                "-v", "error",
                "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1",
                file_path,
            ],
            capture_output=True,
            text=True,
            timeout=30,
        )
        return int(float(result.stdout.strip()))
    except (subprocess.SubprocessError, ValueError, FileNotFoundError):
        logger.warning("Could not determine duration for %s", file_path)
        return 0


def run_processing_pipeline(meeting_id: str, file_path: str) -> None:
    db: Session = SessionLocal()
    try:
        meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
        if meeting is None:
            logger.warning("run_processing_pipeline: meeting %s not found", meeting_id)
            return

        try:
            meeting.status = "transcribing"
            db.commit()

            meeting.duration_seconds = get_media_duration_seconds(file_path)
            db.commit()

            meeting.status = "completed"
            db.commit()
        except Exception:
            logger.exception("Processing failed for meeting %s", meeting_id)
            meeting.status = "failed"
            db.commit()
    finally:
        db.close()