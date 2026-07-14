from pydantic import BaseModel
from typing import Literal, Union, List
from datetime import datetime


class FlipCardSchema(BaseModel):
    id: str
    type: Literal["flip"] = "flip"
    front: str
    back: str
    lecture_id: str
    next_review_date: datetime
    interval_days: float
    repetitions: int
    ease_factor: float


class McqCardSchema(BaseModel):
    id: str
    type: Literal["mcq"] = "mcq"
    question: str
    options: List[str]
    correctIndex: int
    lecture_id: str
    next_review_date: datetime
    interval_days: float
    repetitions: int
    ease_factor: float


CardSchema = Union[FlipCardSchema, McqCardSchema]


class CardsResponse(BaseModel):
    cards: List[CardSchema]


class ReviewSubmission(BaseModel):
    rating: Literal["forgot", "hard", "good", "easy"]


class ReviewResult(BaseModel):
    next_review_date: datetime
    interval_days: float


class McqAnswerRequest(BaseModel):
    selected_index: int


class McqAnswerResponse(BaseModel):
    correct: bool
    correct_index: int
