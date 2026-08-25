
import os
import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import Meeting, User
from app.services.processing import run_processing_pipeline

router = APIRouter(prefix="/meetings", tags=["upload"])

MAX_UPLOAD_SIZE_BYTES = settings.max_upload_size_mb * 1024 * 1024


@router.post("/{meeting_id}/upload", status_code=status.HTTP_202_ACCEPTED)
async def upload_meeting_file(
    meeting_id: str,
    file: UploadFile,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if meeting is None or meeting.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found.")

    original_extension = os.path.splitext(file.filename or "")[1].lower()
    if original_extension not in settings.allowed_audio_video_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported file type '{original_extension}'. "
                f"Allowed types: {', '.join(settings.allowed_audio_video_extensions)}"
            ),
        )

    os.makedirs(settings.upload_dir, exist_ok=True)
    stored_filename = f"{meeting.id}_{uuid.uuid4().hex}{original_extension}"
    destination_path = os.path.join(settings.upload_dir, stored_filename)

    bytes_written = 0
    try:
        with open(destination_path, "wb") as destination_file:
            while chunk := await file.read(1024 * 1024):
                bytes_written += len(chunk)
                if bytes_written > MAX_UPLOAD_SIZE_BYTES:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File exceeds the {settings.max_upload_size_mb}MB limit.",
                    )
                destination_file.write(chunk)
    except HTTPException:
        _remove_partial_file(destination_path)
        raise
    except OSError as error:
        _remove_partial_file(destination_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save uploaded file: {error}",
        ) from error

    if bytes_written == 0:
        _remove_partial_file(destination_path)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

    meeting.file_path = destination_path
    meeting.status = "processing"
    db.commit()
    
    background_tasks.add_task(run_processing_pipeline, meeting.id, destination_path)

    return {"meetingId": meeting.id, "status": meeting.status}


def _remove_partial_file(path: str) -> None:
    try:
        if os.path.exists(path):
            os.remove(path)
    except OSError:
        pass