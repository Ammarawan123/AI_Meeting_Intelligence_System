import logging
import subprocess

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.models import Meeting

from app.services.transcription.pipeline import process_recording
from app.services.transcription.formatter import format_transcript
from app.services.transcription.transcript_store import save_transcript
from app.services.analysis import analyze_meeting
from app.services.transcription.analysis_store import save_analysis
from app.models.models import (
    ActionItem,
    Deadline,
    Decision,
    FollowUp,
    MeetingFile,
    Participant,
    Speaker,
)
from app.services.retrieval import index_transcript


logger = logging.getLogger(__name__)


def get_media_duration_seconds(file_path: str) -> int:
    try:
        result = subprocess.run(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=noprint_wrappers=1:nokey=1",
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
        meeting = (
            db.query(Meeting)
            .filter(Meeting.id == meeting_id)
            .first()
        )

        if meeting is None:
            logger.warning(
                "run_processing_pipeline: meeting %s not found",
                meeting_id,
            )
            return

        try:
            # 1. Start transcription
            meeting.status = "transcribing"
            db.commit()

            # 2. Detect meeting duration
            meeting.duration_seconds = get_media_duration_seconds(file_path)
            db.commit()

            # 3. Run Member 3 AI pipeline
            speaker_transcript = process_recording(file_path)

            # 4. Convert to agreed team JSON format
            transcript = format_transcript(
                str(meeting_id),
                speaker_transcript,
            )

            # 5. Temporarily save transcript JSON
            save_transcript(
                str(meeting_id),
                transcript,
            )
            index_transcript(db, str(meeting_id), transcript)

            analysis = analyze_meeting(transcript, meeting.date.date())
            save_analysis(str(meeting_id), analysis)
            meeting.title = analysis.meeting_title
            meeting.summary = analysis.executive_summary
            meeting.files.append(MeetingFile(filename=file_path.rsplit("\\", 1)[-1], path=file_path))
            for speaker in sorted({segment["speaker"] for segment in transcript}):
                meeting.speakers.append(Speaker(label=speaker))
                meeting.participants.append(Participant(name=speaker))
            for item in analysis.action_items:
                meeting.action_items.append(ActionItem(task=item.task, owner=item.owner, deadline=item.deadline, timestamp=item.timestamp))
                if item.deadline:
                    meeting.deadlines.append(Deadline(description=item.task, due_date=item.deadline, timestamp=item.timestamp))
            for decision in analysis.decisions:
                meeting.decisions.append(Decision(decision=decision.decision, timestamp=decision.timestamp))
            for follow_up in analysis.follow_ups:
                meeting.follow_ups.append(FollowUp(description=follow_up))
            meeting.status = "analyzing"
            db.commit()
            meeting.status = "completed"
            db.commit()

        except Exception:
            logger.exception(
                "Processing failed for meeting %s",
                meeting_id,
            )

            meeting.status = "failed"
            db.commit()

    finally:
        db.close()
