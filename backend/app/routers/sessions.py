from fastapi import APIRouter, Response, Depends, HTTPException, Request
from app.models import SessionCreate, SessionResponse, now_utc, hash_password, verify_password
from app.auth import set_session_cookie, clear_session_cookie, get_current_username
from app.database import get_database
from slowapi import Limiter
from slowapi.util import get_remote_address
import uuid

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/sessions", response_model=SessionResponse)
@limiter.limit("5/minute")
async def create_session(request: Request, session_data: SessionCreate, response: Response):
    """
    Unified auth: Login if user exists, otherwise create account.
    - If username exists and password matches → login
    - If username exists and password wrong → 401 error
    - If username doesn't exist → create account and login
    """
    username = session_data.username
    password = session_data.password
    
    db = get_database()
    users_collection = db.users
    
    user = await users_collection.find_one({"username": username})
    
    if user:
        # Check if this is a legacy user (created before passwords were added)
        if "password_hash" not in user:
            # Migrate legacy user: set their password
            await users_collection.update_one(
                {"username": username},
                {"$set": {"password_hash": hash_password(password)}}
            )
            set_session_cookie(response, username)
            return SessionResponse(username=username, is_new_user=False)
        
        # User exists with password - verify it
        if not verify_password(password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Incorrect password")
        
        # Password correct - login
        set_session_cookie(response, username)
        return SessionResponse(username=username, is_new_user=False)
    
    # User doesn't exist - create new account
    default_tank = {
        "id": str(uuid.uuid4()),
        "name": "My First Tank",
        "theme": {"background": "blue-gradient"},
        "fish": [],
        "createdAt": now_utc(),
        "updatedAt": now_utc()
    }
    
    new_user = {
        "username": username,
        "password_hash": hash_password(password),
        "tanks": [default_tank],
        "createdAt": now_utc(),
        "updatedAt": now_utc()
    }
    
    await users_collection.insert_one(new_user)
    
    set_session_cookie(response, username)
    return SessionResponse(username=username, is_new_user=True)


@router.get("/sessions/me", response_model=SessionResponse)
async def get_current_session(username: str = Depends(get_current_username)):
    """Get current session info without fetching aquarium data"""
    return SessionResponse(username=username)


@router.delete("/sessions")
async def delete_session(response: Response):
    """Logout - clear session cookie"""
    clear_session_cookie(response)
    return {"status": "logged out"}


@router.post("/sessions/migrate")
async def migrate_local_game_state(
    request: Request,
    local_state: dict,
    username: str = Depends(get_current_username)
):
    """
    Migrate local game state from localStorage to authenticated account.
    Merges fish, coins, owned accessories from local storage into user's account.
    """
    db = get_database()
    users_collection = db.users
    
    user = await users_collection.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Extract local state components
    local_fish = local_state.get("fish", [])
    local_game_state = local_state.get("gameState", {})
    local_coins = local_game_state.get("coins", 0)
    local_accessories = local_game_state.get("ownedAccessories", [])
    
    # Get current user state
    current_fish = user.get("fish", [])
    current_game_state = user.get("gameState", {})
    current_coins = current_game_state.get("coins", 0)
    current_accessories = current_game_state.get("ownedAccessories", [])
    
    # Merge fish (add local fish to user's tank if space available)
    max_fish = current_game_state.get("maxFish", 10)
    fish_to_add = []
    coins_from_releases = 0
    
    for fish in local_fish:
        if len(current_fish) + len(fish_to_add) < max_fish:
            # Add fish to tank
            fish_copy = fish.copy()
            # Ensure it has required fields
            if "id" not in fish_copy:
                fish_copy["id"] = str(uuid.uuid4())
            if "createdAt" not in fish_copy:
                fish_copy["createdAt"] = now_utc()
            fish_to_add.append(fish_copy)
        else:
            # Tank full - convert to coins
            rarity = fish.get("rarity", "common")
            from app.game_config import RARITY_COIN_VALUES
            coin_value = RARITY_COIN_VALUES.get(rarity, 5)
            coins_from_releases += coin_value
    
    # Merge coins
    new_coins = current_coins + local_coins + coins_from_releases
    
    # Merge accessories (union of both sets)
    merged_accessories = list(set(current_accessories + local_accessories))
    
    # Update database
    await users_collection.update_one(
        {"username": username},
        {
            "$push": {"fish": {"$each": fish_to_add}},
            "$set": {
                "gameState.coins": new_coins,
                "gameState.ownedAccessories": merged_accessories,
                "updatedAt": now_utc()
            }
        }
    )
    
    return {
        "success": True,
        "fishAdded": len(fish_to_add),
        "fishReleased": len(local_fish) - len(fish_to_add),
        "coinsFromReleases": coins_from_releases,
        "coinsAdded": local_coins,
        "totalCoins": new_coins,
        "accessoriesAdded": len(merged_accessories) - len(current_accessories),
    }

