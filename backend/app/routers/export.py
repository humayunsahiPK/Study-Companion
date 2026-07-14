from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from app.core.db import lectures_collection, cards_collection
from app.core.security import get_current_user_id
from app.services.apkg_service import generate_apkg

router = APIRouter(prefix="/lectures", tags=["export"])


@router.get("/{lecture_id}/export")
async def export_lecture_apkg(
    lecture_id: str, user_id: str = Depends(get_current_user_id)
):
    lecture = await lectures_collection.find_one(
        {"_id": lecture_id, "user_id": user_id}
    )
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")

    cursor = cards_collection.find(
        {"lecture_id": lecture_id, "user_id": user_id, "type": "flip"}
    )
    flashcards = []
    async for card in cursor:
        flashcards.append({"front": card["front"], "back": card["back"]})

    if not flashcards:
        raise HTTPException(
            status_code=400, detail="No flashcards to export for this lecture."
        )

    apkg_bytes = generate_apkg(lecture["title"], flashcards)

    return Response(
        content=apkg_bytes,
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f'attachment; filename="{lecture["title"]}.apkg"'
        },
    )
