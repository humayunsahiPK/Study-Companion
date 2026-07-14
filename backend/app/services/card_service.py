import uuid
from app.core.db import lectures_collection, cards_collection
from app.services.sm2 import initial_sm2_state


async def save_generated_content(lecture_id: str, generated: dict) -> None:
    lecture = await lectures_collection.find_one({"_id": lecture_id})
    if not lecture:
        raise ValueError(f"Lecture {lecture_id} not found when saving cards")

    user_id = lecture["user_id"]

    print(f"[card_service] Gemini response keys: {list(generated.keys())}")

    flashcards = generated.get("flashcards", [])
    print(f"[card_service] {len(flashcards)} flashcards received")
    for card in flashcards:
        sm2_state = initial_sm2_state()
        await cards_collection.insert_one(
            {
                "_id": str(uuid.uuid4()),
                "user_id": user_id,
                "lecture_id": lecture_id,
                "type": "flip",
                "front": card["front"],
                "back": card["back"],
                **sm2_state,
            }
        )

    mcqs = generated.get("mcqs", [])
    print(f"[card_service] {len(mcqs)} mcqs received")
    for mcq in mcqs:
        sm2_state = initial_sm2_state()
        await cards_collection.insert_one(
            {
                "_id": str(uuid.uuid4()),
                "user_id": user_id,
                "lecture_id": lecture_id,
                "type": "mcq",
                "question": mcq["question"],
                "options": mcq["options"],
                "correctIndex": mcq["correctIndex"],
                **sm2_state,
            }
        )

    if not flashcards and not mcqs:
        print(
            f"[card_service] WARNING: zero cards created for lecture {lecture_id}. "
            f"Full Gemini response: {generated}"
        )

    update_fields = {
        "summary": generated["summary"],
        "status": "done",
    }
    if generated.get("title"):
        update_fields["title"] = generated["title"]

    await lectures_collection.update_one(
        {"_id": lecture_id},
        {"$set": update_fields},
    )
