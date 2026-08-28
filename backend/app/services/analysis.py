import json
import logging
from datetime import date
from urllib import error, request

from app.core.config import settings
from app.schemas.schemas import MeetingAnalysis


logger = logging.getLogger(__name__)


def _transcript_text(transcript: list[dict]) -> str:
    return "\n".join(
        f"[{segment['start_time']}] {segment['speaker']}: {segment['text']}"
        for segment in transcript
    )


def _fallback_analysis(transcript: list[dict]) -> MeetingAnalysis:
    first_text = transcript[0]["text"] if transcript else ""
    return MeetingAnalysis(
        meeting_title="Meeting Analysis",
        executive_summary=first_text or "No transcript content was available for analysis.",
        detailed_summary=first_text or "No transcript content was available for analysis.",
        sentiment="neutral",
        sentiment_confidence=0.0,
    )


def analyze_meeting(transcript: list[dict], meeting_date: date) -> MeetingAnalysis:
    if not transcript:
        return _fallback_analysis(transcript)

    if not settings.openai_api_key:
        logger.warning("OPENAI_API_KEY is not configured; using empty analysis fallback")
        return _fallback_analysis(transcript)

    schema = MeetingAnalysis.model_json_schema()
    prompt = f"""Analyze this meeting transcript and return only valid JSON matching the supplied schema.
Meeting date: {meeting_date.isoformat()}
Rules:
- Generate a useful title, executive summary, detailed summary, and discussion key points.
- Extract only decisions, action items, unresolved issues, and follow-ups supported by the transcript.
- For every decision or action item, include the source timestamp in MM:SS when available.
- Convert relative deadlines such as tomorrow, Friday, next Monday, next week, and end of this month
  into ISO dates using the meeting date. Keep null when no deadline is stated.
- Use sentiment positive, neutral, negative, or mixed and provide a confidence between 0 and 1.

Transcript:
{_transcript_text(transcript)}"""

    payload = {
        "model": settings.openai_model,
        "temperature": 0.1,
        "messages": [
            {"role": "system", "content": "You are a precise meeting intelligence analyst."},
            {"role": "user", "content": prompt},
        ],
        "response_format": {
            "type": "json_schema",
            "json_schema": {"name": "meeting_analysis", "strict": True, "schema": schema},
        },
    }
    body = json.dumps(payload).encode("utf-8")
    api_request = request.Request(
        f"{settings.openai_base_url.rstrip('/')}/chat/completions",
        data=body,
        headers={
            "Authorization": f"Bearer {settings.openai_api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with request.urlopen(api_request, timeout=120) as response:
            response_body = json.loads(response.read().decode("utf-8"))
        content = response_body["choices"][0]["message"]["content"]
        return MeetingAnalysis.model_validate(json.loads(content))
    except (error.URLError, TimeoutError, KeyError, IndexError, json.JSONDecodeError, ValueError) as exc:
        raise RuntimeError("Meeting analysis failed") from exc
