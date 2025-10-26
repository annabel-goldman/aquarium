"""
Migration script to convert from single aquarium per user to multi-tank structure.

This script converts the old 'aquariums' collection to the new 'users' collection
where each user can have multiple tanks.

Run this once after deploying the new multi-tank feature.
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import uuid


MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/aquarium")


async def migrate():
    """Migrate from aquariums collection to users collection"""
    client = AsyncIOMotorClient(MONGO_URI)
    db = client.get_database()
    
    print("Starting migration from aquariums to users collection...")
    
    # Check if users collection already has data
    users_count = await db.users.count_documents({})
    if users_count > 0:
        print(f"⚠️  Users collection already has {users_count} documents.")
        response = input("Continue with migration? This may duplicate data. (yes/no): ")
        if response.lower() != 'yes':
            print("Migration cancelled.")
            return
    
    # Get all aquariums
    aquariums = await db.aquariums.find().to_list(length=None)
    print(f"Found {len(aquariums)} aquariums to migrate.")
    
    migrated_count = 0
    
    for aquarium in aquariums:
        username = aquarium.get('username')
        if not username:
            print(f"⚠️  Skipping aquarium without username: {aquarium.get('_id')}")
            continue
        
        # Check if user already exists
        existing_user = await db.users.find_one({"username": username})
        if existing_user:
            print(f"⚠️  User '{username}' already exists. Skipping.")
            continue
        
        # Convert aquarium to tank format
        tank = {
            "id": str(uuid.uuid4()),
            "name": aquarium.get('title', f"{username}'s Tank"),
            "theme": aquarium.get('theme', {"background": "blue-gradient"}),
            "fish": aquarium.get('fish', []),
            "createdAt": aquarium.get('createdAt', datetime.now(timezone.utc)),
            "updatedAt": aquarium.get('updatedAt', datetime.now(timezone.utc))
        }
        
        # Create new user with single tank
        new_user = {
            "username": username,
            "tanks": [tank],
            "createdAt": aquarium.get('createdAt', datetime.now(timezone.utc)),
            "updatedAt": datetime.now(timezone.utc)
        }
        
        # Insert new user
        await db.users.insert_one(new_user)
        migrated_count += 1
        print(f"✓ Migrated user '{username}' with {len(tank['fish'])} fish")
    
    print(f"\n✅ Migration complete! Migrated {migrated_count} users.")
    print(f"\nOld 'aquariums' collection is still intact.")
    print(f"After verifying the migration worked, you can drop it with:")
    print(f"  db.aquariums.drop()")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(migrate())

