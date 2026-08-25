import subprocess
from pathlib import Path


def split_audio(
    input_path: str,
    output_dir: str,
    chunk_duration: int = 600,
) -> list[str]:
    """
    Split audio into chunks.

    Default chunk duration:
    600 seconds = 10 minutes
    """

    output_folder = Path(output_dir)
    output_folder.mkdir(parents=True, exist_ok=True)

    output_pattern = output_folder / "chunk_%03d.wav"

    command = [
        "ffmpeg",
        "-y",
        "-i",
        input_path,
        "-f",
        "segment",
        "-segment_time",
        str(chunk_duration),
        "-c",
        "copy",
        str(output_pattern),
    ]

    subprocess.run(
        command,
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

    chunks = sorted(output_folder.glob("chunk_*.wav"))

    return [str(chunk) for chunk in chunks]