# backend/app/dependencies.py
import motor.motor_asyncio
from pymongo.database import Database
from .config import settings

# Create MongoDB client
client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URI)
database = client[settings.MONGODB_DB_NAME]

async def get_database() -> Database:
    """
    Get MongoDB database dependency.
    
    Returns:
        MongoDB database instance
    """
    return database