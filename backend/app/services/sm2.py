from datetime import datetime, timedelta, timezone
from typing import Literal

Rating = Literal["forgot", "hard", "good", "easy"]

# our 4-button UI rating mapped onto SM-2's 0-5 quality scale
RATING_TO_QUALITY = {
    "forgot": 0,
    "hard": 3,
    "good": 4,
    "easy": 5,
}

MIN_EASE_FACTOR = 1.3
INITIAL_EASE_FACTOR = 2.5


def calculate_sm2(
    rating: Rating,
    repetitions: int,
    interval_days: float,
    ease_factor: float,
) -> dict:
    quality = RATING_TO_QUALITY[rating]

    new_ease_factor = ease_factor + (
        0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
    )
    if new_ease_factor < MIN_EASE_FACTOR:
        new_ease_factor = MIN_EASE_FACTOR

    if quality < 3:
        new_repetitions = 0
        new_interval = 1.0
    else:
        new_repetitions = repetitions + 1
        if new_repetitions == 1:
            new_interval = 1.0
        elif new_repetitions == 2:
            new_interval = 6.0
        else:
            new_interval = interval_days * new_ease_factor

    next_review_date = datetime.now(timezone.utc) + timedelta(days=new_interval)

    return {
        "repetitions": new_repetitions,
        "interval_days": round(new_interval, 2),
        "ease_factor": round(new_ease_factor, 2),
        "next_review_date": next_review_date,
    }


def initial_sm2_state() -> dict:
    return {
        "repetitions": 0,
        "interval_days": 0.0,
        "ease_factor": INITIAL_EASE_FACTOR,
        "next_review_date": datetime.now(timezone.utc),
    }
