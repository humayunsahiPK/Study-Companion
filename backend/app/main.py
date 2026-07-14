from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import auth, lectures, cards, dashboard, export

app = FastAPI(title="Study Companion API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(lectures.router)
app.include_router(cards.router)
app.include_router(dashboard.router)
app.include_router(export.router)


@app.get("/")
async def health_check():
    return {"status": "ok"}
