import tempfile
from pathlib import Path

from faster_whisper import WhisperModel

from app.services.transcription.audio_processor import convert_to_wav


_model = None


def get_whisper_model():
    global _model

    if _model is None:
        _model = WhisperModel(
            "small",
            device="cpu",
            compute_type="int8",
        )

    return _model


def transcribe_audio(file_path: str) -> list[dict]:
    model = get_whisper_model()

    with tempfile.TemporaryDirectory() as temp_dir:
        wav_path = Path(temp_dir) / "processed_audio.wav"

        convert_to_wav(
            input_path=file_path,
            output_path=str(wav_path),
        )

        segments, info = model.transcribe(
            str(wav_path),
            beam_size=5,
            vad_filter=True,
        )

        transcript = []

        for segment in segments:
            transcript.append(
                {
                    "start": round(segment.start, 2),
                    "end": round(segment.end, 2),
                    "text": segment.text.strip(),
                }
            )

        return transcript