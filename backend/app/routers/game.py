"""
Game Router - Core game state management
Handles tank view, feeding, cleaning, and game tick updates
"""

from fastapi import APIRouter, Depends, HTTPException
from app.auth import get_current_username
from app.database import get_database
from app.models import (
    GameStateResponse, FeedResponse, CleanResponse,
    FishResponse, FishCreate, FishAccessories,
    ApplyAccessoryRequest, now_utc, calculate_happiness
)
from app.game_config import (
    HUNGER_DECAY_PER_MINUTE, HUNGER_FEED_RESTORE, FEED_COST,
    POOP_GENERATION_INTERVAL, POOP_CLEANLINESS_PENALTY,
    SHOP_ITEMS,
    STARTING_COINS, STARTING_HUNGER, STARTING_CLEANLINESS,
    STARTING_MAX_FISH
)
from datetime import datetime, timezone
import uuid
import random


def ensure_tz_aware(dt):
    """Ensure datetime is timezone-aware (UTC)"""
    if dt is None:
        return now_utc()
    if isinstance(dt, str):
        # Parse ISO format string
        dt = datetime.fromisoformat(dt.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        # Naive datetime - assume it's UTC
        dt = dt.replace(tzinfo=timezone.utc)
    return dt

router = APIRouter()


def fish_to_response(fish: dict) -> dict:
    """Convert fish dict to response format"""
    accessories = fish.get("accessories", {"hat": None, "glasses": None, "effect": None})
    return {
        "id": fish["id"],
        "species": fish["species"],
        "name": fish["name"],
        "color": fish["color"],
        "size": fish["size"],
        "rarity": fish.get("rarity", "common"),
        "accessories": accessories,
        "createdAt": fish["createdAt"]
    }


async def get_or_create_user_game(username: str) -> dict:
    """Get user with game state, migrating from legacy if needed"""
    db = get_database()
    users = db.users
    
    user = await users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user has been migrated to game format
    if "gameState" not in user:
        # Migrate from legacy multi-tank format
        user = await migrate_user_to_game(user)
    
    return user


async def migrate_user_to_game(legacy_user: dict) -> dict:
    """Migrate a legacy multi-tank user to single-tank game format"""
    db = get_database()
    users = db.users
    
    # Gather all fish from all tanks
    all_fish = []
    for tank in legacy_user.get("tanks", []):
        for fish in tank.get("fish", []):
            # Add new fields to fish
            fish["rarity"] = "common"
            fish["accessories"] = {"hat": None, "glasses": None, "effect": None}
            all_fish.append(fish)
    
    # Keep up to starting capacity
    fish_to_keep = all_fish[:STARTING_MAX_FISH]
    bonus_coins = len(all_fish) * 10  # Bonus for existing fish
    
    now = now_utc()
    
    # Create new game state
    game_update = {
        "gameState": {
            "coins": STARTING_COINS + bonus_coins,
            "maxFish": STARTING_MAX_FISH,
            "lastActiveAt": now,
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
    }
    
    # Update user in database
    await users.update_one(
        {"username": legacy_user["username"]},
        {
            "$set": game_update,
            "$unset": {"tanks": ""}  # Remove old tanks field
        }
    )
    
    # Return updated user
    return {**legacy_user, **game_update}


@router.get("/game", response_model=GameStateResponse)
async def get_game_state(username: str = Depends(get_current_username)):
    """Get full game state for the authenticated user"""
    user = await get_or_create_user_game(username)
    
    tank = user.get("tank", {})
    hunger = tank.get("hunger", 100)
    cleanliness = tank.get("cleanliness", 100)
    
    return {
        "gameState": user["gameState"],
        "tank": tank,
        "fish": [fish_to_response(f) for f in user.get("fish", [])],
        "ownedAccessories": user.get("ownedAccessories", []),
        "happiness": calculate_happiness(hunger, cleanliness)
    }


@router.post("/game/tick")
async def game_tick(username: str = Depends(get_current_username)):
    """
    Update game state based on time passed.
    Called periodically by the frontend during active play.
    Updates: hunger decay, poop generation
    """
    db = get_database()
    users = db.users
    
    user = await get_or_create_user_game(username)
    now = now_utc()
    
    game_state = user["gameState"]
    tank = user["tank"]
    fish = user.get("fish", [])
    
    last_active = ensure_tz_aware(game_state.get("lastActiveAt"))
    
    # Calculate time delta (cap at 5 minutes to prevent abuse)
    seconds_passed = min((now - last_active).total_seconds(), 300)
    minutes_passed = seconds_passed / 60
    
    # --- Hunger Decay ---
    hunger = tank.get("hunger", 100)
    hunger_loss = HUNGER_DECAY_PER_MINUTE * minutes_passed
    new_hunger = max(0, hunger - hunger_loss)
    
    # --- Poop Generation ---
    poop_positions = tank.get("poopPositions", [])
    last_poop = ensure_tz_aware(tank.get("lastPoopTime"))
    
    poop_seconds = (now - last_poop).total_seconds()
    
    # Generate poop based on fish count and time
    if len(fish) > 0 and poop_seconds >= POOP_GENERATION_INTERVAL:
        # Each fish has a chance to generate poop
        poops_to_add = int(poop_seconds / POOP_GENERATION_INTERVAL)
        for _ in range(min(poops_to_add, len(fish))):
            # Random fish poops at random position
            new_poop = {
                "id": str(uuid.uuid4()),
                "x": random.uniform(0.1, 0.9),
                "y": random.uniform(0.6, 0.9),  # Poop tends to sink
                "createdAt": now
            }
            poop_positions.append(new_poop)
        last_poop = now
    
    # --- Cleanliness based on poop count ---
    poop_penalty = len(poop_positions) * POOP_CLEANLINESS_PENALTY
    new_cleanliness = max(0, 100 - poop_penalty)
    
    # --- Happiness ---
    happiness = calculate_happiness(new_hunger, new_cleanliness)
    
    # Update database
    await users.update_one(
        {"username": username},
        {"$set": {
            "gameState.lastActiveAt": now,
            "tank.hunger": new_hunger,
            "tank.cleanliness": new_cleanliness,
            "tank.poopPositions": poop_positions,
            "tank.lastPoopTime": last_poop,
            "updatedAt": now
        }}
    )
    
    return {
        "hunger": new_hunger,
        "cleanliness": new_cleanliness,
        "happiness": happiness,
        "coins": game_state.get("coins", 0),
        "maxFish": game_state.get("maxFish", STARTING_MAX_FISH),
        "poopCount": len(poop_positions)
    }


@router.post("/game/feed", response_model=FeedResponse)
async def feed_tank(username: str = Depends(get_current_username)):
    """Feed all fish in the tank"""
    db = get_database()
    users = db.users
    
    user = await get_or_create_user_game(username)
    
    game_state = user["gameState"]
    tank = user["tank"]
    coins = game_state.get("coins", 0)
    
    if coins < FEED_COST:
        raise HTTPException(status_code=400, detail="Not enough coins to feed")
    
    hunger = tank.get("hunger", 0)
    new_hunger = min(100, hunger + HUNGER_FEED_RESTORE)
    new_coins = coins - FEED_COST
    
    await users.update_one(
        {"username": username},
        {"$set": {
            "tank.hunger": new_hunger,
            "gameState.coins": new_coins,
            "updatedAt": now_utc()
        }}
    )
    
    return {
        "success": True,
        "newHunger": new_hunger,
        "coinsSpent": FEED_COST,
        "newCoins": new_coins
    }


@router.post("/game/clean", response_model=CleanResponse)
async def clean_tank(username: str = Depends(get_current_username)):
    """Clean all poop from the tank"""
    db = get_database()
    users = db.users
    
    user = await get_or_create_user_game(username)
    tank = user["tank"]
    
    poop_count = len(tank.get("poopPositions", []))
    
    await users.update_one(
        {"username": username},
        {"$set": {
            "tank.poopPositions": [],
            "tank.cleanliness": 100.0,
            "updatedAt": now_utc()
        }}
    )
    
    return {
        "success": True,
        "newCleanliness": 100.0,
        "poopRemoved": poop_count
    }


@router.delete("/game/poop/{poop_id}")
async def clean_single_poop(poop_id: str, username: str = Depends(get_current_username)):
    """Remove a single poop by clicking on it"""
    db = get_database()
    users = db.users
    
    user = await get_or_create_user_game(username)
    tank = user["tank"]
    
    poop_positions = [p for p in tank.get("poopPositions", []) if p["id"] != poop_id]
    poop_penalty = len(poop_positions) * POOP_CLEANLINESS_PENALTY
    new_cleanliness = max(0, 100 - poop_penalty)
    
    result = await users.update_one(
        {"username": username},
        {"$set": {
            "tank.poopPositions": poop_positions,
            "tank.cleanliness": new_cleanliness,
            "updatedAt": now_utc()
        }}
    )
    
    return {
        "success": True,
        "newCleanliness": new_cleanliness,
        "remainingPoop": len(poop_positions)
    }


@router.post("/game/coins")
async def add_coins(amount: int, username: str = Depends(get_current_username)):
    """Add coins to the user's balance (e.g., from collecting coins in the lake)"""
    db = get_database()
    users = db.users
    
    user = await get_or_create_user_game(username)
    current_coins = user.get("gameState", {}).get("coins", 0)
    new_coins = current_coins + amount
    
    await users.update_one(
        {"username": username},
        {"$set": {
            "gameState.coins": new_coins,
            "updatedAt": now_utc()
        }}
    )
    
    return {
        "success": True,
        "coinsAdded": amount,
        "newTotal": new_coins
    }


@router.post("/fish", response_model=FishResponse)
async def add_fish(fish_data: FishCreate, username: str = Depends(get_current_username)):
    """Manually add a fish to the tank (for testing/debug)"""
    db = get_database()
    users = db.users
    
    user = await get_or_create_user_game(username)
    
    current_fish = len(user.get("fish", []))
    max_fish = user["gameState"].get("maxFish", STARTING_MAX_FISH)
    
    if current_fish >= max_fish:
        raise HTTPException(status_code=400, detail=f"Tank is full ({max_fish} fish maximum)")
    
    new_fish = {
        "id": str(uuid.uuid4()),
        "species": fish_data.species,
        "name": fish_data.name,
        "color": fish_data.color,
        "size": fish_data.size.value,
        "rarity": "common",
        "accessories": {"hat": None, "glasses": None, "effect": None},
        "createdAt": now_utc()
    }
    
    await users.update_one(
        {"username": username},
        {
            "$push": {"fish": new_fish},
            "$set": {"updatedAt": now_utc()}
        }
    )
    
    return fish_to_response(new_fish)


@router.delete("/fish/{fish_id}")
async def release_fish(fish_id: str, username: str = Depends(get_current_username)):
    """Release a fish from the tank"""
    db = get_database()
    users = db.users
    
    result = await users.update_one(
        {"username": username},
        {
            "$pull": {"fish": {"id": fish_id}},
            "$set": {"updatedAt": now_utc()}
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Fish not found")
    
    return {"success": True, "fishId": fish_id}


@router.post("/fish/{fish_id}/accessory")
async def apply_accessory(
    fish_id: str,
    request: ApplyAccessoryRequest,
    username: str = Depends(get_current_username)
):
    """Apply an accessory to a fish"""
    db = get_database()
    users = db.users
    
    user = await get_or_create_user_game(username)
    
    # Validate slot
    if request.slot not in ["hat", "glasses", "effect"]:
        raise HTTPException(status_code=400, detail="Invalid accessory slot")
    
    # Validate item ownership (if applying, not removing)
    if request.itemId:
        owned = user.get("ownedAccessories", [])
        if request.itemId not in owned:
            raise HTTPException(status_code=400, detail="You don't own this accessory")
        
        # Validate item category matches slot
        item = SHOP_ITEMS.get(request.itemId)
        if not item or item["category"] != request.slot:
            raise HTTPException(status_code=400, detail="Item doesn't match slot")
    
    # Find and update the fish
    fish_list = user.get("fish", [])
    fish_found = False
    
    for fish in fish_list:
        if fish["id"] == fish_id:
            fish_found = True
            accessories = fish.get("accessories", {"hat": None, "glasses": None, "effect": None})
            accessories[request.slot] = request.itemId
            fish["accessories"] = accessories
            break
    
    if not fish_found:
        raise HTTPException(status_code=404, detail="Fish not found")
    
    await users.update_one(
        {"username": username},
        {"$set": {
            "fish": fish_list,
            "updatedAt": now_utc()
        }}
    )
    
    return {"success": True, "fishId": fish_id, "slot": request.slot, "itemId": request.itemId}
