from pydantic import BaseModel
from typing import Literal, Optional


class LectureListItem(BaseModel):
    id: str
    title: str
    tag: str
    date: str
    status: Literal["done", "processing"]
    due: str
    dueState: Literal["has-due", "none"]
    summary: str


class LectureUploadResponse(BaseModel):
    id: str
    status: Literal["processing"] = "processing"


class LectureNotesRequest(BaseModel):
    notes: str


class LectureStatusResponse(BaseModel):
    status: Literal["processing", "done"]


class DashboardRecentLecture(BaseModel):
    id: str
    tag: str
    title: str
    date: str
    status: Literal["done", "processing"]
    due_text: Optional[str] = None
