import json
from pathlib import Path

from app.schemas.schemas import MeetingAnalysis


ANALYSIS_DIR = Path("uploads") / "analyses"


def save_analysis(meeting_id: str, analysis: MeetingAnalysis) -> str:
    ANALYSIS_DIR.mkdir(parents=True, exist_ok=True)
    output_path = ANALYSIS_DIR / f"{meeting_id}.json"
    with output_path.open("w", encoding="utf-8") as file:
        json.dump(analysis.model_dump(), file, ensure_ascii=False, indent=2)
    return str(output_path)


def load_analysis(meeting_id: str) -> MeetingAnalysis | None:
    analysis_path = ANALYSIS_DIR / f"{meeting_id}.json"
    if not analysis_path.exists():
        return None
    with analysis_path.open("r", encoding="utf-8") as file:
        return MeetingAnalysis.model_validate(json.load(file))
