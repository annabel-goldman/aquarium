"""
One-time migration: MongoDB -> SQLite game store.

Run before switching production traffic to the single-container SQLite runtime:

    cd backend
    SQLITE_PATH=/data/aquarium.sqlite \
    MONGO_URI='mongodb://user:pass@host:27017/aquarium_v2?authSource=admin' \
    python migrate_to_game.py

This script intentionally keeps pymongo as an optional migration dependency so
the lean runtime does not need Mongo libraries installed.
"""

import asyncio
from datetime import datetime, timezone
import os
import sys

from app.database import connect_to_mongo, close_mongo_connection, save_user, sqlite_path


MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/aquarium")
STARTING_MAX_FISH = 10
STARTING_COINS = 100
STARTING_HUNGER = 100.0
STARTING_CLEANLINESS = 100.0


def now_utc():
    return datetime.now(timezone.utc)


def normalize_fish(fish: dict) -> dict:
    return {
        "id": fish.get("id"),
        "species": fish.get("species", "Clownfish"),
        "name": fish.get("name", fish.get("species", "Fish")),
        "color": fish.get("color", "#ff8844"),
        "size": fish.get("size", "md"),
        "rarity": fish.get("rarity", "common"),
        "accessories": fish.get("accessories", {"hat": None, "glasses": None, "effect": None}),
        "createdAt": fish.get("createdAt", now_utc()),
    }


def migrate_legacy_user(user: dict) -> dict:
    all_fish = []
    for tank in user.get("tanks", []):
        all_fish.extend(normalize_fish(fish) for fish in tank.get("fish", []))

    now = now_utc()
    fish_to_keep = all_fish[:STARTING_MAX_FISH]
    bonus_coins = len(all_fish) * 10

    return {
        "username": user["username"],
        "password_hash": user.get("password_hash"),
        "gameState": {
            "coins": STARTING_COINS + bonus_coins,
            "maxFish": STARTING_MAX_FISH,
            "lastActiveAt": now,
        },
        "tank": {
            "hunger": STARTING_HUNGER,
            "cleanliness": STARTING_CLEANLINESS,
            "poopPositions": [],
            "lastPoopTime": now,
        },
        "fish": fish_to_keep,
        "ownedAccessories": [],
        "createdAt": user.get("createdAt", now),
        "updatedAt": now,
    }


def migrate_game_user(user: dict) -> dict:
    now = now_utc()
    game_state = user.get("gameState", {})
    owned = user.get("ownedAccessories", game_state.get("ownedAccessories", []))

    return {
        "username": user["username"],
        "password_hash": user.get("password_hash"),
        "gameState": {
            "coins": game_state.get("coins", STARTING_COINS),
            "maxFish": game_state.get("maxFish", STARTING_MAX_FISH),
            "lastActiveAt": game_state.get("lastActiveAt", now),
        },
        "tank": user.get("tank", {
            "hunger": STARTING_HUNGER,
            "cleanliness": STARTING_CLEANLINESS,
            "poopPositions": [],
            "lastPoopTime": now,
        }),
        "fish": [normalize_fish(fish) for fish in user.get("fish", [])],
        "ownedAccessories": owned,
        "createdAt": user.get("createdAt", now),
        "updatedAt": user.get("updatedAt", now),
    }


async def run_migration():
    try:
        from pymongo import MongoClient
    except ImportError:
        print("Missing optional dependency: pymongo")
        print("Install only for migration with: python -m pip install pymongo")
        sys.exit(1)

    print("=" * 60)
    print("Cozy Aquarium MongoDB -> SQLite Migration")
    print("=" * 60)
    print(f"MongoDB: {MONGO_URI}")
    print(f"SQLite: {sqlite_path()}")

    await connect_to_mongo()
    client = MongoClient(MONGO_URI)
    db = client.get_database()
    users = db.users

    total = users.count_documents({})
    print(f"\nUsers to migrate: {total}")
    if total == 0:
        print("No users found. Done.")
        client.close()
        await close_mongo_connection()
        return

    confirm = input("\nWrite these users into SQLite? (yes/no): ").strip().lower()
    if confirm != "yes":
        print("Migration cancelled.")
        client.close()
        await close_mongo_connection()
        return

    migrated = 0
    errors = 0
    for user in users.find({}):
        try:
            if "gameState" in user:
                migrated_user = migrate_game_user(user)
            else:
                migrated_user = migrate_legacy_user(user)
            await save_user(migrated_user)
            migrated += 1
            print(f"  migrated {migrated_user['username']}")
        except Exception as exc:
            errors += 1
            print(f"  error migrating {user.get('username', '<unknown>')}: {exc}")

    client.close()
    await close_mongo_connection()
    print("\nMigration complete.")
    print(f"Migrated: {migrated}")
    print(f"Errors: {errors}")


if __name__ == "__main__":
    asyncio.run(run_migration())
