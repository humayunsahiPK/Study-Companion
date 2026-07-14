import asyncio
import whisper
from app.core.db import lectures_collection
from app.services.gemini_service import generate_lecture_content
from app.services.card_service import save_generated_content

_model = None


def get_model():
    global _model
    if _model is None:
        _model = whisper.load_model("base")
    return _model


def _run_transcription(audio_path: str) -> str:
    # blocking call, only ever run via asyncio.to_thread so it doesn't
    # freeze the event loop during a long transcription
    model = get_model()
    result = model.transcribe(audio_path)
    return result["text"]


async def transcribe_and_generate(lecture_id: str, audio_path: str) -> None:
    transcript = await asyncio.to_thread(_run_transcription, audio_path)

    await lectures_collection.update_one(
        {"_id": lecture_id}, {"$set": {"transcript": transcript}}
    )

    generated = await generate_lecture_content(transcript)

    await save_generated_content(lecture_id, generated)
