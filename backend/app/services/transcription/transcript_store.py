import json
from pathlib import Path


TRANSCRIPT_DIR = Path("uploads") / "transcripts"


def save_transcript(
    meeting_id: str,
    transcript: list[dict],
) -> str:
    TRANSCRIPT_DIR.mkdir(parents=True, exist_ok=True)

    output_path = TRANSCRIPT_DIR / f"{meeting_id}.json"

    with open(output_path, "w", encoding="utf-8") as file:
        json.dump(
            transcript,
            file,
            ensure_ascii=False,
            indent=2,
        )

    return str(output_path)


def load_transcript(meeting_id: str) -> list[dict]:
    transcript_path = TRANSCRIPT_DIR / f"{meeting_id}.json"

    if not transcript_path.exists():
        return []

    with open(transcript_path, "r", encoding="utf-8") as file:
        return json.load(file)