import uuid
import os
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, HTTPException
from app.core.db import lectures_collection, cards_collection
from app.core.security import get_current_user_id
from app.schemas.lecture import (
    LectureListItem,
    LectureUploadResponse,
    LectureNotesRequest,
    LectureStatusResponse,
)
from app.services.whisper_service import transcribe_and_generate
from app.services.gemini_service import generate_lecture_content
from app.services.card_service import save_generated_content

router = APIRouter(prefix="/lectures", tags=["lectures"])

UPLOAD_DIR = "uploaded_audio"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload", response_model=LectureUploadResponse)
async def upload_audio(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
):
    lecture_id = str(uuid.uuid4())
    audio_path = os.path.join(UPLOAD_DIR, f"{lecture_id}_{file.filename}")

    with open(audio_path, "wb") as f:
        f.write(await file.read())

    await lectures_collection.insert_one(
        {
            "_id": lecture_id,
            "user_id": user_id,
            "title": file.filename,
            "tag": "Audio",
            "status": "processing",
            "summary": "",
            "transcript": "",
            "created_at": datetime.now(timezone.utc),
        }
    )

    background_tasks.add_task(transcribe_and_generate, lecture_id, audio_path)

    return LectureUploadResponse(id=lecture_id, status="processing")


@router.post("/from-notes", response_model=LectureUploadResponse)
async def create_from_notes(
    payload: LectureNotesRequest,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user_id),
):
    lecture_id = str(uuid.uuid4())

    await lectures_collection.insert_one(
        {
            "_id": lecture_id,
            "user_id": user_id,
            "title": "Untitled notes",
            "tag": "Notes",
            "status": "processing",
            "summary": "",
            "transcript": payload.notes,
            "created_at": datetime.now(timezone.utc),
        }
    )

    background_tasks.add_task(_generate_from_text, lecture_id, payload.notes)

    return LectureUploadResponse(id=lecture_id, status="processing")


async def _generate_from_text(lecture_id: str, notes: str) -> None:
    generated = await generate_lecture_content(notes)
    await save_generated_content(lecture_id, generated)


@router.get("", response_model=list[LectureListItem])
async def list_lectures(user_id: str = Depends(get_current_user_id)):
    cursor = lectures_collection.find({"user_id": user_id}).sort(
        "created_at", -1
    )
    now = datetime.now(timezone.utc)

    results = []
    async for doc in cursor:
        created_at = doc.get("created_at")
        date_str = created_at.strftime("%b %d") if created_at else "—"

        total_cards = await cards_collection.count_documents(
            {"lecture_id": doc["_id"], "user_id": user_id}
        )
        due_count = await cards_collection.count_documents(
            {
                "lecture_id": doc["_id"],
                "user_id": user_id,
                "next_review_date": {"$lte": now},
            }
        )

        if total_cards == 0:
            due_text = "—"
            due_state = "none"
        elif due_count > 0:
            due_text = f"{due_count} due"
            due_state = "has-due"
        else:
            due_text = "Not due"
            due_state = "none"

        results.append(
            LectureListItem(
                id=doc["_id"],
                title=doc.get("title", ""),
                tag=doc.get("tag", ""),
                date=date_str,
                status=doc.get("status", "processing"),
                due=due_text,
                dueState=due_state,
                summary=doc.get("summary", ""),
            )
        )
    return results


@router.get("/{lecture_id}/status", response_model=LectureStatusResponse)
async def get_lecture_status(
    lecture_id: str, user_id: str = Depends(get_current_user_id)
):
    doc = await lectures_collection.find_one(
        {"_id": lecture_id, "user_id": user_id}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Lecture not found")
    return LectureStatusResponse(status=doc["status"])


@router.delete("/{lecture_id}")
async def delete_lecture(
    lecture_id: str, user_id: str = Depends(get_current_user_id)
):
    doc = await lectures_collection.find_one(
        {"_id": lecture_id, "user_id": user_id}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Lecture not found")

    await cards_collection.delete_many(
        {"lecture_id": lecture_id, "user_id": user_id}
    )
    await lectures_collection.delete_one({"_id": lecture_id})

    return {"deleted": True, "id": lecture_id}