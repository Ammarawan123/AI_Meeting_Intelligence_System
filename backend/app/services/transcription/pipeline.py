import tempfile
from pathlib import Path

from app.services.transcription.audio_processor import (
    convert_to_wav,
    get_audio_duration,
)
from app.services.transcription.chunker import split_audio
from app.services.transcription.diarizer import diarize_audio
from app.services.transcription.speaker_assignment import assign_speakers
from app.services.transcription.timestamp_utils import add_timestamp_offset
from app.services.transcription.transcriber import transcribe_audio


CHUNK_DURATION = 600  # 10 minutes


def process_recording(file_path: str) -> list[dict]:
    with tempfile.TemporaryDirectory() as temp_dir:
        wav_path = Path(temp_dir) / "meeting_audio.wav"

        convert_to_wav(
            input_path=file_path,
            output_path=str(wav_path),
        )

        duration = get_audio_duration(str(wav_path))

        # Run diarization ONCE on the full recording.
        # This keeps speaker identities consistent.
        full_diarization = diarize_audio(str(wav_path))

        # Short recording
        if duration <= CHUNK_DURATION:
            transcript = transcribe_audio(str(wav_path))

            return assign_speakers(
                transcript=transcript,
                diarization=full_diarization,
            )

        # Long recording
        chunks_dir = Path(temp_dir) / "chunks"

        chunks = split_audio(
            input_path=str(wav_path),
            output_dir=str(chunks_dir),
            chunk_duration=CHUNK_DURATION,
        )

        full_transcript = []

        for index, chunk_path in enumerate(chunks):
            offset = index * CHUNK_DURATION

            chunk_transcript = transcribe_audio(chunk_path)

            chunk_transcript = add_timestamp_offset(
                chunk_transcript,
                offset,
            )

            full_transcript.extend(chunk_transcript)

        # Assign speakers only after all timestamps are restored
        return assign_speakers(
            transcript=full_transcript,
            diarization=full_diarization,
        )