def format_transcript(
    meeting_id: str,
    segments: list[dict],
) -> list[dict]:
    formatted = []

    for segment in segments:
        formatted.append(
            {
                "meeting_id": meeting_id,
                "speaker": segment["speaker"],
                "start_time": segment["start"],
                "end_time": segment["end"],
                "text": segment["text"],
            }
        )

    return formatted