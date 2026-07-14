from fastapi import APIRouter, Depends, HTTPException
from app.core.db import cards_collection
from app.core.security import get_current_user_id
from app.schemas.card import (
    CardsResponse,
    ReviewSubmission,
    ReviewResult,
    McqAnswerRequest,
    McqAnswerResponse,
)
from app.services.sm2 import calculate_sm2

router = APIRouter(prefix="/lectures", tags=["cards"])


@router.get("/{lecture_id}/cards", response_model=CardsResponse)
async def get_cards_for_lecture(
    lecture_id: str, user_id: str = Depends(get_current_user_id)
):
    cursor = cards_collection.find({"lecture_id": lecture_id, "user_id": user_id})
    cards = []
    async for doc in cursor:
        doc["id"] = doc.pop("_id")
        cards.append(doc)
    return CardsResponse(cards=cards)


@router.post("/cards/{card_id}/review", response_model=ReviewResult)
async def submit_review(
    card_id: str,
    payload: ReviewSubmission,
    user_id: str = Depends(get_current_user_id),
):
    card = await cards_collection.find_one({"_id": card_id, "user_id": user_id})
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    sm2_result = calculate_sm2(
        rating=payload.rating,
        repetitions=card.get("repetitions", 0),
        interval_days=card.get("interval_days", 0.0),
        ease_factor=card.get("ease_factor", 2.5),
    )

    await cards_collection.update_one({"_id": card_id}, {"$set": sm2_result})

    return ReviewResult(
        next_review_date=sm2_result["next_review_date"],
        interval_days=sm2_result["interval_days"],
    )


@router.post("/cards/{card_id}/answer", response_model=McqAnswerResponse)
async def submit_mcq_answer(
    card_id: str,
    payload: McqAnswerRequest,
    user_id: str = Depends(get_current_user_id),
):
    card = await cards_collection.find_one({"_id": card_id, "user_id": user_id})
    if not card or card.get("type") != "mcq":
        raise HTTPException(status_code=404, detail="MCQ card not found")

    correct_index = card["correctIndex"]
    is_correct = payload.selected_index == correct_index

    return McqAnswerResponse(correct=is_correct, correct_index=correct_index)
