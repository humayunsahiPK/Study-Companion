from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from app.core.db import cards_collection, lectures_collection
from app.core.security import get_current_user_id
from app.schemas.dashboard import (
    DashboardSummary,
    StreakResponse,
    StreakDay,
    NotificationsResponse,
    NotificationItem,
)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(user_id: str = Depends(get_current_user_id)):
    now = datetime.now(timezone.utc)

    due_count = await cards_collection.count_documents(
        {"user_id": user_id, "next_review_date": {"$lte": now}}
    )
    lecture_count = await lectures_collection.count_documents({"user_id": user_id})

    most_overdue_card = await cards_collection.find_one(
        {"user_id": user_id, "next_review_date": {"$lte": now}},
        sort=[("next_review_date", 1)],
    )

    most_overdue_title = "—"
    overdue_days = 0
    if most_overdue_card:
        lecture = await lectures_collection.find_one(
            {"_id": most_overdue_card["lecture_id"]}
        )
        if lecture:
            most_overdue_title = lecture.get("title", "—")
        overdue_days = (now - most_overdue_card["next_review_date"]).days

    return DashboardSummary(
        due_number=due_count,
        lecture_count=lecture_count,
        most_overdue_title=most_overdue_title,
        overdue_days=max(overdue_days, 0),
    )


@router.get("/streak", response_model=StreakResponse)
async def get_streak(user_id: str = Depends(get_current_user_id)):
    # TODO: this is faked from today's due state, not real review history.
    # Need a "reviewed_at" timestamp per review to do this properly.
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    today_index = datetime.now(timezone.utc).weekday()

    streak_days = []
    for i, day in enumerate(days):
        if i < today_index:
            state = "done"
        elif i == today_index:
            state = "today due"
        else:
            state = "none"
        streak_days.append(StreakDay(day=day, state=state))

    return StreakResponse(days=streak_days)


@router.get("/notifications", response_model=NotificationsResponse)
async def get_notifications(user_id: str = Depends(get_current_user_id)):
    now = datetime.now(timezone.utc)

    cursor = cards_collection.find(
        {"user_id": user_id, "next_review_date": {"$lte": now}}
    )

    lecture_due_counts: dict[str, int] = {}
    async for card in cursor:
        lecture_id = card["lecture_id"]
        lecture_due_counts[lecture_id] = lecture_due_counts.get(lecture_id, 0) + 1

    notifications = []
    for lecture_id, count in lecture_due_counts.items():
        lecture = await lectures_collection.find_one({"_id": lecture_id})
        title = lecture.get("title", "Untitled") if lecture else "Untitled"
        notifications.append(
            NotificationItem(
                id=f"notif-{lecture_id}",
                text=f"{count} cards due — {title}",
                lecture_id=lecture_id,
            )
        )

    return NotificationsResponse(notifications=notifications)
