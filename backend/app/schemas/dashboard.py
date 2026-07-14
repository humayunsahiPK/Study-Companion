from pydantic import BaseModel
from typing import List, Literal


class DashboardSummary(BaseModel):
    due_number: int
    lecture_count: int
    most_overdue_title: str
    overdue_days: int


class StreakDay(BaseModel):
    day: Literal["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    state: Literal["done", "due", "today", "today due", "none"]


class StreakResponse(BaseModel):
    days: List[StreakDay]


class NotificationItem(BaseModel):
    id: str
    text: str
    lecture_id: str


class NotificationsResponse(BaseModel):
    notifications: List[NotificationItem]
