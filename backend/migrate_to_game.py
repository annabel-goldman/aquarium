"""
Migration Script: Multi-Tank to Cozy Aquarium Game

This script migrates existing users from the multi-tank format
to the new single-tank game format.

Run with: python migrate_to_game.py
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/aquarium")

# Game starting values
STARTING_MAX_FISH = 10
STARTING_COINS = 100
STARTING_HUNGER = 100.0
STARTING_CLEANLINESS = 100.0


def now_utc():
    return datetime.now(timezone.utc)


async def migrate_user(user: dict) -> dict:
    """Convert a legacy multi-tank user to new game format"""
    
    # Check if already migrated
    if "gameState" in user:
        print(f"  User {user['username']} already migrated, skipping")
        return None
    
    # Gather all fish from all tanks
    all_fish = []
    for tank in user.get("tanks", []):
        for fish in tank.get("fish", []):
            # Add new fields to fish
            migrated_fish = {
                "id": fish["id"],
                "species": fish["species"],
                "name": fish["name"],
                "color": fish["color"],
                "size": fish["size"],
                "rarity": "common",  # All existing fish are common
                "accessories": {"hat": None, "glasses": None, "effect": None},
                "createdAt": fish["createdAt"]
            }
            all_fish.append(migrated_fish)
    
    # Keep up to starting capacity
    fish_to_keep = all_fish[:STARTING_MAX_FISH]
    
    # Give bonus coins for existing fish
    bonus_coins = len(all_fish) * 10
    
    now = now_utc()
    
    # Build the update document
    update = {
        "$set": {
            "gameState": {
                "coins": STARTING_COINS + bonus_coins,
                "maxFish": STARTING_MAX_FISH,
                "lastActiveAt": now
            },
            "tank": {
                "hunger": STARTING_HUNGER,
                "cleanliness": STARTING_CLEANLINESS,
                "poopPositions": [],
                "lastPoopTime": now
            },
            "fish": fish_to_keep,
            "ownedAccessories": [],
            "updatedAt": now
        },
        "$unset": {
            "tanks": ""  # Remove old tanks array
        }
    }
    
    return update


async def run_migration():
    """Run the migration on all users"""
    print("=" * 60)
    print("Cozy Aquarium Game Migration")
    print("=" * 60)
    print(f"\nConnecting to MongoDB: {MONGO_URI}")
    
    client = AsyncIOMotorClient(MONGO_URI)
    db = client.get_database()
    users_collection = db.users
    
    # Count users
    total_users = await users_collection.count_documents({})
    legacy_users = await users_collection.count_documents({"tanks": {"$exists": True}})
    already_migrated = await users_collection.count_documents({"gameState": {"$exists": True}})
    
    print(f"\nTotal users: {total_users}")
    print(f"Legacy users (with tanks): {legacy_users}")
    print(f"Already migrated: {already_migrated}")
    print(f"Need migration: {legacy_users}")
    
    if legacy_users == 0:
        print("\nNo users need migration. Done!")
        client.close()
        return
    
    # Confirm migration
    confirm = input(f"\nMigrate {legacy_users} users? (yes/no): ").strip().lower()
    if confirm != "yes":
        print("Migration cancelled.")
        client.close()
        return
    
    # Process each legacy user
    cursor = users_collection.find({"tanks": {"$exists": True}})
    migrated = 0
    errors = 0
    
    async for user in cursor:
        username = user["username"]
        print(f"\nMigrating: {username}")
        
        try:
            update = await migrate_user(user)
            if update:
                await users_collection.update_one(
                    {"username": username},
                    update
                )
                
                # Count fish
                fish_count = len(update["$set"]["fish"])
                bonus = len(user.get("tanks", [])) * 10
                print(f"  ✓ Migrated with {fish_count} fish, {STARTING_COINS + bonus} coins")
                migrated += 1
        except Exception as e:
            print(f"  ✗ Error: {e}")
            errors += 1
    
    print("\n" + "=" * 60)
    print("Migration Complete")
    print("=" * 60)
    print(f"Migrated: {migrated}")
    print(f"Errors: {errors}")
    
    client.close()


async def rollback_migration():
    """Rollback migration (for testing) - NOT RECOMMENDED FOR PRODUCTION"""
    print("WARNING: This will undo the game migration!")
    confirm = input("Are you sure? Type 'ROLLBACK' to confirm: ").strip()
    
    if confirm != "ROLLBACK":
        print("Rollback cancelled.")
        return
    
    client = AsyncIOMotorClient(MONGO_URI)
    db = client.get_database()
    users_collection = db.users
    
    # Find migrated users
    cursor = users_collection.find({"gameState": {"$exists": True}})
    
    async for user in cursor:
        username = user["username"]
        print(f"Rolling back: {username}")
        
        # Recreate a basic tank from fish
        fish = user.get("fish", [])
        now = now_utc()
        
        # Remove new fields and keep minimal data
        legacy_fish = []
        for f in fish:
            legacy_fish.append({
                "id": f["id"],
                "species": f["species"],
                "name": f["name"],
                "color": f["color"],
                "size": f["size"],
                "createdAt": f["createdAt"]
            })
        
        tank = {
            "id": "migrated-tank",
            "name": "My Tank",
            "theme": {"background": "blue-gradient"},
            "fish": legacy_fish,
            "createdAt": now,
            "updatedAt": now
        }
        
        await users_collection.update_one(
            {"username": username},
            {
                "$set": {
                    "tanks": [tank],
                    "updatedAt": now
                },
                "$unset": {
                    "gameState": "",
                    "tank": "",
                    "fish": "",
                    "ownedAccessories": ""
                }
            }
        )
    
    print("Rollback complete.")
    client.close()


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--rollback":
        asyncio.run(rollback_migration())
    else:
        asyncio.run(run_migration())
