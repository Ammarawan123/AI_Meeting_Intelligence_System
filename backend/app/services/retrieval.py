import json
import math
import re
from urllib import request

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.models import AIConversation, Meeting, Transcript, TranscriptSegment


def embed_text(text: str, dimensions: int = 384) -> list[float]:
    vector = [0.0] * dimensions
    for token in re.findall(r"[a-z0-9]+", text.lower()):
        vector[hash(token) % dimensions] += 1.0
    magnitude = math.sqrt(sum(value * value for value in vector)) or 1.0
    return [value / magnitude for value in vector]


def _similarity(left: list[float], right: list[float]) -> float:
    return sum(a * b for a, b in zip(left, right))


def index_transcript(db: Session, meeting_id: str, transcript: list[dict]) -> None:
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if meeting is None:
        return
    if meeting.transcript is None:
        meeting.transcript = Transcript()
    meeting.transcript.segments.clear()
    for segment in transcript:
        meeting.transcript.segments.append(
            TranscriptSegment(
                speaker=segment["speaker"],
                start_time=float(segment["start_time"]),
                end_time=float(segment["end_time"]),
                text=segment["text"],
                embedding=embed_text(segment["text"]),
            )
        )
    db.commit()


def retrieve_segments(db: Session, meeting_id: str, query: str, limit: int = 5) -> list[TranscriptSegment]:
    query_embedding = embed_text(query)
    if settings.database_url.startswith("postgresql"):
        return (
            db.query(TranscriptSegment)
            .join(TranscriptSegment.transcript)
            .filter(TranscriptSegment.transcript.has(meeting_id=meeting_id))
            .order_by(TranscriptSegment.embedding.cosine_distance(query_embedding))
            .limit(limit)
            .all()
        )
    rows = (
        db.query(TranscriptSegment)
        .join(TranscriptSegment.transcript)
        .filter(TranscriptSegment.transcript.has(meeting_id=meeting_id))
        .all()
    )
    ranked = sorted(
        rows,
        key=lambda row: _similarity(query_embedding, row.embedding or embed_text(row.text)),
        reverse=True,
    )
    return ranked[:limit]


def answer_question(db: Session, meeting_id: str, question: str) -> dict:
    segments = retrieve_segments(db, meeting_id, question)
    if not segments:
        answer = "I could not find supporting information in this meeting."
        timestamp = None
    else:
        context = "\n".join(f"[{row.start_time:.0f}s] {row.speaker}: {row.text}" for row in segments)
        answer = _llm_answer(question, context) or segments[0].text
        timestamp = f"{int(segments[0].start_time // 60):02d}:{int(segments[0].start_time % 60):02d}"
    conversation = AIConversation(meeting_id=meeting_id, question=question, answer=answer, timestamp=timestamp)
    db.add(conversation)
    db.commit()
    return {"answer": answer, "timestamp": timestamp, "conversation_id": conversation.id}


def _llm_answer(question: str, context: str) -> str | None:
    if not settings.openai_api_key:
        return None
    payload = {
        "model": settings.openai_model,
        "temperature": 0,
        "messages": [
            {"role": "system", "content": "Answer only from the provided meeting context. If unsupported, say so."},
            {"role": "user", "content": f"Question: {question}\nMeeting context:\n{context}"},
        ],
    }
    try:
        api_request = request.Request(
            f"{settings.openai_base_url.rstrip('/')}/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Authorization": f"Bearer {settings.openai_api_key}", "Content-Type": "application/json"},
            method="POST",
        )
        with request.urlopen(api_request, timeout=60) as response:
            body = json.loads(response.read().decode("utf-8"))
        return body["choices"][0]["message"]["content"]
    except (OSError, KeyError, IndexError, json.JSONDecodeError):
        return None
