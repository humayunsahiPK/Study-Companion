import json
import asyncio
from google import genai
from google.genai import errors as genai_errors
from app.core.config import settings

client = genai.Client(api_key=settings.gemini_api_key)

# tried in order - if one's overloaded or gone, fall back to the next
MODEL_FALLBACK_CHAIN = [
    "gemini-3.5-flash",
    "gemini-flash-latest",
]

RETRIES_PER_MODEL = 2
RETRY_DELAY_SECONDS = 5

GENERATION_PROMPT = """You are helping a student study a lecture transcript.

Given the transcript below, produce a JSON object with exactly this shape,
and output ONLY valid JSON, no other text:

{{
  "title": "a short, descriptive title for this lecture (5-8 words, no quotes)",
  "summary": "a clear 3-5 sentence summary of the lecture",
  "mcqs": [
    {{"question": "...", "options": ["...", "...", "...", "..."], "correctIndex": 0}}
  ],
  "flashcards": [
    {{"front": "...", "back": "..."}}
  ]
}}

Produce exactly 5 items in "mcqs" and exactly 10 items in "flashcards".

Transcript:
{transcript}
"""


def _parse_response(raw_text: str) -> dict:
    raw_text = raw_text.strip()
    if raw_text.startswith("```"):
        raw_text = raw_text.strip("`")
        if raw_text.startswith("json"):
            raw_text = raw_text[4:]

    try:
        return json.loads(raw_text)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"Gemini response was not valid JSON. Raw response: {raw_text}"
        ) from e


async def generate_lecture_content(transcript: str) -> dict:
    prompt = GENERATION_PROMPT.format(transcript=transcript)

    last_error = None

    for model_name in MODEL_FALLBACK_CHAIN:
        for attempt in range(1, RETRIES_PER_MODEL + 1):
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                print(f"[gemini_service] Success using model: {model_name}")
                return _parse_response(response.text)

            except genai_errors.ClientError as e:
                # model's gone or rejected the request, no point retrying it
                last_error = e
                print(f"[gemini_service] {model_name} failed (client error): {e}")
                break

            except genai_errors.ServerError as e:
                # overloaded, worth a couple retries before moving on
                last_error = e
                print(
                    f"[gemini_service] {model_name} failed (attempt {attempt}/{RETRIES_PER_MODEL}, server error): {e}"
                )
                if attempt < RETRIES_PER_MODEL:
                    await asyncio.sleep(RETRY_DELAY_SECONDS)
                continue

    raise last_error
