from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING
import os

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/aquarium")
client = None
db = None


async def connect_to_mongo():
    """Connect to MongoDB and create indexes"""
    global client, db
    client = AsyncIOMotorClient(MONGO_URI)
    db = client.get_database()
    
    # Create unique index on username for users collection
    await db.users.create_index([("username", ASCENDING)], unique=True)


async def close_mongo_connection():
    """Close MongoDB connection"""
    global client
    if client:
        client.close()


def get_database():
    """Get database instance"""
    return db

