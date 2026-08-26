import os

from dotenv import load_dotenv
from pyannote.audio import Pipeline

load_dotenv()

_pipeline = None


def get_diarization_pipeline():
    global _pipeline

    if _pipeline is None:
        hf_token = os.getenv("HF_TOKEN")

        if not hf_token:
            raise RuntimeError("HF_TOKEN is missing from .env")

        _pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-community-1",
            token=hf_token,
        )

    return _pipeline


def diarize_audio(file_path: str) -> list[dict]:
    pipeline = get_diarization_pipeline()

    output = pipeline(file_path)

    speakers = []

    for turn, speaker in output.speaker_diarization:
        speakers.append(
            {
                "speaker": speaker,
                "start": round(turn.start, 2),
                "end": round(turn.end, 2),
            }
        )

    return speakers