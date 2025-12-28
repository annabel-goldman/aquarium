"""
Fishing Router - Lake minigame for catching fish
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from app.auth import get_current_username
from app.database import get_database
from app.models import FishResponse, now_utc
from app.game_config import (
    RARITY_WEIGHTS, RARITY_COIN_VALUES, RARITY_SPEED,
    CATCH_FISH_CHANCE, CATCH_JUNK_CHANCE, CATCH_COSMETIC_CHANCE,
    FISH_SPECIES, JUNK_ITEMS, CATCHABLE_COSMETICS,
    BONUS_COINS_ALL_COSMETICS
)
import uuid
import random

router = APIRouter()


def weighted_rarity_choice():
    """Select a rarity based on weights"""
    total = sum(RARITY_WEIGHTS.values())
    r = random.uniform(0, total)
    cumulative = 0
    for rarity, weight in RARITY_WEIGHTS.items():
        cumulative += weight
        if r <= cumulative:
            return rarity
    return "common"


def generate_fish_name(species: str) -> str:
    """Generate a fun random name for a fish"""
    prefixes = ["Captain", "Sir", "Lady", "Professor", "Duke", "Baron", "Count", "Dr."]
    names = ["Bubbles", "Splash", "Finn", "Coral", "Neptune", "Azure", "Shimmer", "Glitter",
             "Sparkle", "Wavey", "Sunny", "Marina", "Pearl", "Sandy", "Ripple", "Dory",
             "Nemo", "Gilbert", "Oscar", "Goldie", "Flash", "Zippy", "Dash", "Blitz"]
    
    if random.random() < 0.3:
        return f"{random.choice(prefixes)} {random.choice(names)}"
    return random.choice(names)


def generate_fish_color() -> str:
    """Generate a random fish color"""
    colors = [
        "#ff8844", "#4488ff", "#ffcc44", "#ff4488", "#44ff88",
        "#8844ff", "#ff6666", "#66ccff", "#ffaa00", "#00ccaa",
        "#ff88cc", "#88ccff", "#ccff88", "#ffcc88", "#88ffcc"
    ]
    return random.choice(colors)


@router.get("/fishing/spawn")
async def get_fishing_spawns(username: str = Depends(get_current_username)):
    """Get current fish silhouettes swimming in the lake"""
    # Generate 3-6 fish silhouettes
    count = random.randint(3, 6)
    spawns = []
    
    for i in range(count):
        rarity = weighted_rarity_choice()
        species = random.choice(FISH_SPECIES)
        direction = random.choice([-1, 1])
        
        spawns.append({
            "id": str(uuid.uuid4()),
            "species": species,
            "rarity": rarity,
            "x": random.uniform(0.1, 0.9) if direction == 1 else random.uniform(0.1, 0.9),
            "y": random.uniform(0.2, 0.8),
            "speed": RARITY_SPEED[rarity],
            "direction": direction,
            "size": random.choice(["sm", "md", "lg"])
        })
    
    return {"spawns": spawns}


@router.post("/fishing/catch/{spawn_id}")
async def attempt_catch(
    spawn_id: str, 
    species: str = None,
    size: str = None,
    rarity: str = None,
    username: str = Depends(get_current_username)
):
    """
    Attempt to catch a fish silhouette.
    Species, size, and rarity can be passed from the spawn data.
    Returns what was caught (fish, junk, or rare cosmetic).
    """
    db = get_database()
    users = db.users
    
    user = await users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Determine what was caught
    roll = random.random()
    
    if roll < CATCH_COSMETIC_CHANCE:
        # Rare cosmetic catch!
        owned = user.get("ownedAccessories", [])
        available = [c for c in CATCHABLE_COSMETICS if c not in owned]
        
        if available:
            cosmetic_id = random.choice(available)
            # Add to owned accessories
            await users.update_one(
                {"username": username},
                {
                    "$push": {"ownedAccessories": cosmetic_id},
                    "$set": {"updatedAt": now_utc()}
                }
            )
            
            return {
                "success": True,
                "resultType": "cosmetic",
                "cosmeticId": cosmetic_id,
                "message": "🎉 You caught a rare cosmetic item!"
            }
        else:
            # Already have all catchable cosmetics, give coins instead
            bonus_coins = BONUS_COINS_ALL_COSMETICS
            current_coins = user.get("gameState", {}).get("coins", 0)
            await users.update_one(
                {"username": username},
                {"$set": {
                    "gameState.coins": current_coins + bonus_coins,
                    "updatedAt": now_utc()
                }}
            )
            return {
                "success": True,
                "resultType": "bonus_coins",
                "coinsEarned": bonus_coins,
                "message": f"✨ You found a treasure! +{bonus_coins} coins"
            }
    
    elif roll < CATCH_COSMETIC_CHANCE + CATCH_JUNK_CHANCE:
        # Caught junk
        junk = random.choice(JUNK_ITEMS)
        return {
            "success": True,
            "resultType": "junk",
            "junkItem": junk,
            "message": f"You caught... {junk}. Better throw it back!"
        }
    
    else:
        # Caught a fish!
        # Use passed values from spawn, or generate random if not provided
        fish_rarity = rarity if rarity else weighted_rarity_choice()
        fish_species = species if species else random.choice(FISH_SPECIES)
        fish_size = size if size else random.choice(["sm", "md", "lg"])
        
        # Create the caught fish (not added to tank yet)
        caught_fish = {
            "id": str(uuid.uuid4()),
            "species": fish_species,
            "name": generate_fish_name(fish_species),
            "color": generate_fish_color(),
            "size": fish_size,
            "rarity": fish_rarity,
            "accessories": {"hat": None, "glasses": None, "effect": None},
            "createdAt": now_utc()
        }
        
        # Store caught fish temporarily in session/cache
        # For simplicity, we'll include it in the response
        # The frontend will call /fishing/keep or /fishing/release
        
        game_state = user.get("gameState", {})
        current_fish_count = len(user.get("fish", []))
        max_fish = game_state.get("maxFish", 10)
        coins_value = RARITY_COIN_VALUES.get(fish_rarity, 5)
        
        return {
            "success": True,
            "resultType": "fish",
            "fish": caught_fish,
            "rarity": fish_rarity,
            "coinValue": coins_value,
            "tankFull": current_fish_count >= max_fish,
            "currentFishCount": current_fish_count,
            "maxFish": max_fish,
            "message": f"You caught a {fish_rarity} {fish_species}!"
        }


@router.post("/fishing/keep")
async def keep_fish(fish_data: dict, username: str = Depends(get_current_username)):
    """Add a caught fish to the tank"""
    db = get_database()
    users = db.users
    
    user = await users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    game_state = user.get("gameState", {})
    current_fish = user.get("fish", [])
    max_fish = game_state.get("maxFish", 10)
    
    if len(current_fish) >= max_fish:
        raise HTTPException(status_code=400, detail="Tank is full!")
    
    # Add the fish
    new_fish = {
        "id": fish_data.get("id", str(uuid.uuid4())),
        "species": fish_data["species"],
        "name": fish_data["name"],
        "color": fish_data["color"],
        "size": fish_data["size"],
        "rarity": fish_data.get("rarity", "common"),
        "accessories": fish_data.get("accessories", {"hat": None, "glasses": None, "effect": None}),
        "createdAt": now_utc()
    }
    
    await users.update_one(
        {"username": username},
        {
            "$push": {"fish": new_fish},
            "$set": {"updatedAt": now_utc()}
        }
    )
    
    return {
        "success": True,
        "fish": new_fish,
        "message": f"{new_fish['name']} joined your tank!"
    }


@router.post("/fishing/release")
async def release_for_coins(fish_data: dict, username: str = Depends(get_current_username)):
    """Release a caught fish for coins"""
    db = get_database()
    users = db.users
    
    user = await users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    rarity = fish_data.get("rarity", "common")
    coins_earned = RARITY_COIN_VALUES.get(rarity, 5)
    
    current_coins = user.get("gameState", {}).get("coins", 0)
    new_coins = current_coins + coins_earned
    
    await users.update_one(
        {"username": username},
        {"$set": {
            "gameState.coins": new_coins,
            "updatedAt": now_utc()
        }}
    )
    
    return {
        "success": True,
        "coinsEarned": coins_earned,
        "newCoins": new_coins,
        "message": f"Released the fish and earned {coins_earned} coins!"
    }


@router.post("/fishing/swap")
async def swap_fish(
    caught_fish: dict,
    release_fish_id: str = Query(..., description="ID of fish to release from tank"),
    username: str = Depends(get_current_username)
):
    """Swap a caught fish with one in the tank"""
    db = get_database()
    users = db.users
    
    user = await users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    current_fish = user.get("fish", [])
    
    # Find and get coins for the released fish
    released_fish = None
    remaining_fish = []
    for fish in current_fish:
        if fish["id"] == release_fish_id:
            released_fish = fish
        else:
            remaining_fish.append(fish)
    
    if not released_fish:
        raise HTTPException(status_code=404, detail="Fish to release not found in tank")
    
    # Add coins for released fish
    released_rarity = released_fish.get("rarity", "common")
    coins_earned = RARITY_COIN_VALUES.get(released_rarity, 5)
    current_coins = user.get("gameState", {}).get("coins", 0)
    new_coins = current_coins + coins_earned
    
    # Add the new fish
    new_fish = {
        "id": caught_fish.get("id", str(uuid.uuid4())),
        "species": caught_fish["species"],
        "name": caught_fish["name"],
        "color": caught_fish["color"],
        "size": caught_fish["size"],
        "rarity": caught_fish.get("rarity", "common"),
        "accessories": {"hat": None, "glasses": None, "effect": None},
        "createdAt": now_utc()
    }
    remaining_fish.append(new_fish)
    
    await users.update_one(
        {"username": username},
        {"$set": {
            "fish": remaining_fish,
            "gameState.coins": new_coins,
            "updatedAt": now_utc()
        }}
    )
    
    return {
        "success": True,
        "addedFish": new_fish,
        "releasedFish": released_fish,
        "coinsEarned": coins_earned,
        "newCoins": new_coins,
        "message": f"Swapped {released_fish['name']} for {new_fish['name']}! +{coins_earned} coins"
    }

