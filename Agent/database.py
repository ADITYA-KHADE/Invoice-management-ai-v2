from motor.motor_asyncio import AsyncIOMotorClient
import os
from urllib.parse import urlparse


def _resolve_mongo_uri() -> str:
    """Pick the Mongo connection string from env with sensible fallback."""
    return os.getenv("MONGODB_URI") or os.getenv("MONGO_URI") or "mongodb://localhost:27017/fastapi_db"


def _resolve_db_name(uri: str) -> str:
    """Extract db name from URI path or fall back to env/default."""
    env_db = os.getenv("MONGO_DB_NAME")
    if env_db:
        return env_db

    parsed = urlparse(uri)
    if parsed.path and parsed.path != "/":
        return parsed.path.lstrip("/")

    return "fastapi_db"


MONGO_URI = _resolve_mongo_uri()
DB_NAME = _resolve_db_name(MONGO_URI)

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]


def get_db():
    return db
