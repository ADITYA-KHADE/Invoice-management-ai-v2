from motor.motor_asyncio import AsyncIOMotorClient
import os
from urllib.parse import urlparse

client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
db = client[os.getenv("MONGODB_DB_NAME", "invoice_db")]


def get_db():
    return db
