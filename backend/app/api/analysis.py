from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.meetings import get_owned_meeting_or_404
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import User
from app.schemas.schemas import MeetingAnalysis
from app.services.transcription.analysis_store import load_analysis


router = APIRouter(prefix="/meetings", tags=["analysis"])


@router.get("/{meeting_id}/analysis", response_model=MeetingAnalysis)
def get_analysis(
    meeting_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_owned_meeting_or_404(meeting_id, current_user, db)
    analysis = load_analysis(meeting_id)
    if analysis is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting analysis is not available yet.",
        )
    return analysis
