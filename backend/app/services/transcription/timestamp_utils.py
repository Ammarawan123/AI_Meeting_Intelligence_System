def add_timestamp_offset(
    segments: list[dict],
    offset: float,
) -> list[dict]:
    adjusted_segments = []

    for segment in segments:
        adjusted_segments.append(
            {
                **segment,
                "start": round(segment["start"] + offset, 2),
                "end": round(segment["end"] + offset, 2),
            }
        )

    return adjusted_segments