from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api.meetings import get_owned_meeting_or_404
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import AIConversation, ActionItem, Decision, Meeting, Participant, Transcript, TranscriptSegment, User
from app.schemas.schemas import MeetingQuestionRequest, MeetingQuestionResponse
from app.services.retrieval import answer_question


router = APIRouter(tags=["Q&A and search"])


@router.post("/meetings/{meeting_id}/qa", response_model=MeetingQuestionResponse)
def meeting_qa(
    meeting_id: str,
    payload: MeetingQuestionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_owned_meeting_or_404(meeting_id, current_user, db)
    return answer_question(db, meeting_id, payload.question.strip())


@router.get("/meetings/{meeting_id}/qa")
def meeting_qa_history(
    meeting_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_owned_meeting_or_404(meeting_id, current_user, db)
    conversations = (
        db.query(AIConversation)
        .filter(AIConversation.meeting_id == meeting_id)
        .order_by(AIConversation.created_at.asc())
        .all()
    )
    return [
        {"question": item.question, "answer": item.answer, "timestamp": item.timestamp, "created_at": item.created_at}
        for item in conversations
    ]


@router.get("/search")
def search_meetings(
    query: str = Query(..., min_length=2, max_length=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    pattern = f"%{query.strip()}%"
    meetings = (
        db.query(Meeting)
        .filter(Meeting.owner_id == current_user.id)
        .outerjoin(Participant)
        .outerjoin(ActionItem)
        .outerjoin(Decision)
        .outerjoin(Transcript, Transcript.meeting_id == Meeting.id)
        .outerjoin(TranscriptSegment, TranscriptSegment.transcript_id == Transcript.id)
        .filter(
            or_(
                Meeting.title.ilike(pattern),
                Meeting.summary.ilike(pattern),
                Participant.name.ilike(pattern),
                ActionItem.task.ilike(pattern),
                Decision.decision.ilike(pattern),
                TranscriptSegment.text.ilike(pattern),
            )
        )
        .distinct()
        .order_by(Meeting.created_at.desc())
        .all()
    )
    return [{"id": meeting.id, "title": meeting.title, "summary": meeting.summary} for meeting in meetings]
