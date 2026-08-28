
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import Meeting, User
from app.schemas.schemas import CreateMeetingRequest, MeetingResponse

router = APIRouter(prefix="/meetings", tags=["meetings"])


def format_duration(total_seconds: int) -> str:
    minutes, seconds = divmod(max(total_seconds, 0), 60)
    return f"{minutes:02d}:{seconds:02d}"


_INTERNAL_TO_PUBLIC_STATUS = {
    "uploaded": "processing",
    "processing": "processing",
    "transcribing": "processing",
    "analyzing": "processing",
    "completed": "completed",
    "failed": "failed",
}


def to_response(meeting: Meeting) -> MeetingResponse:
    public_status = _INTERNAL_TO_PUBLIC_STATUS.get(meeting.status, "processing")
    return MeetingResponse(
        id=meeting.id,
        title=meeting.title,
        date=meeting.date,
        duration=format_duration(meeting.duration_seconds),
        status=public_status,
        participants=[participant.name for participant in meeting.participants],
        summary=meeting.summary or "",
    )


def get_owned_meeting_or_404(meeting_id: str, user: User, db: Session) -> Meeting:
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()

    if meeting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found.")

    if meeting.owner_id != user.id:
        # Return 404 rather than 403 so we do not reveal that a
        # meeting with this id exists but belongs to someone else.
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found.")

    return meeting


@router.post("", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
def create_meeting(
    payload: CreateMeetingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    meeting = Meeting(owner_id=current_user.id, title=payload.title, status="uploaded")
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return to_response(meeting)


@router.get("", response_model=list[MeetingResponse])
def list_meetings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    meetings = (
        db.query(Meeting)
        .filter(Meeting.owner_id == current_user.id)
        .order_by(Meeting.created_at.desc())
        .all()
    )
    return [to_response(meeting) for meeting in meetings]


@router.get("/{meeting_id}", response_model=MeetingResponse)
def get_meeting(
    meeting_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    meeting = get_owned_meeting_or_404(meeting_id, current_user, db)
    return to_response(meeting)


@router.delete("/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meeting(
    meeting_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    meeting = get_owned_meeting_or_404(meeting_id, current_user, db)
    db.delete(meeting)
    db.commit()
