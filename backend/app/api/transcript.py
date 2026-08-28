from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import Meeting, User
from app.services.transcription.transcript_store import load_transcript


router = APIRouter(
    prefix="/meetings",
    tags=["transcript"],
)


@router.get("/{meeting_id}/transcript")
def get_transcript(
    meeting_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    meeting = (
        db.query(Meeting)
        .filter(Meeting.id == meeting_id)
        .first()
    )

    if meeting is None or meeting.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found.",
        )

    if meeting.transcript is not None:
        transcript = [
            {
                "meeting_id": meeting_id,
                "speaker": segment.speaker,
                "start_time": segment.start_time,
                "end_time": segment.end_time,
                "text": segment.text,
            }
            for segment in sorted(meeting.transcript.segments, key=lambda item: item.start_time)
        ]
    else:
        transcript = load_transcript(meeting_id)

    return {
        "meeting_id": meeting_id,
        "segments": transcript,
    }
