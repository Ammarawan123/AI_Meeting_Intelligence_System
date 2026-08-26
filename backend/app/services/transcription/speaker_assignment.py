def calculate_overlap(
    start1: float,
    end1: float,
    start2: float,
    end2: float,
) -> float:
    return max(0.0, min(end1, end2) - max(start1, start2))


def assign_speakers(
    transcript: list[dict],
    diarization: list[dict],
) -> list[dict]:

    unique_speakers = []

    for item in diarization:
        speaker = item["speaker"]

        if speaker not in unique_speakers:
            unique_speakers.append(speaker)

    speaker_map = {
        speaker: f"Speaker {index + 1}"
        for index, speaker in enumerate(unique_speakers)
    }

    speaker_transcript = []

    for segment in transcript:
        best_speaker = "Unknown"
        best_overlap = 0.0

        for speaker_segment in diarization:
            overlap = calculate_overlap(
                segment["start"],
                segment["end"],
                speaker_segment["start"],
                speaker_segment["end"],
            )

            if overlap > best_overlap:
                best_overlap = overlap
                best_speaker = speaker_map.get(
                    speaker_segment["speaker"],
                    "Unknown",
                )

        speaker_transcript.append(
            {
                "speaker": best_speaker,
                "start": segment["start"],
                "end": segment["end"],
                "text": segment["text"],
            }
        )

    return speaker_transcript