from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

client = AsyncIOMotorClient(settings.mongodb_uri,tz_aware=True)
db = client.get_default_database()

users_collection = db["users"]
lectures_collection = db["lectures"]
cards_collection = db["cards"]
