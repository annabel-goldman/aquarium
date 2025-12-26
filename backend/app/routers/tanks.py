from fastapi import APIRouter, Depends, HTTPException, Request
from app.auth import get_current_username
from app.database import get_database
from app.models import TankCreate, TankResponse, TankSummary, FishCreate, FishResponse, now_utc
from typing import List
from slowapi import Limiter
from slowapi.util import get_remote_address
import uuid

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.get("/tanks", response_model=List[TankSummary])
async def list_tanks(username: str = Depends(get_current_username)):
    """Get all tanks for the authenticated user"""
    db = get_database()
    users_collection = db.users
    
    user = await users_collection.find_one({"username": username})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Return summary of each tank
    tank_summaries = []
    for tank in user.get("tanks", []):
        tank_summaries.append({
            "id": tank["id"],
            "name": tank["name"],
            "fishCount": len(tank.get("fish", [])),
            "createdAt": tank["createdAt"]
        })
    
    return tank_summaries


@router.post("/tanks", response_model=TankResponse)
async def create_tank(tank_data: TankCreate, username: str = Depends(get_current_username)):
    """Create a new tank for the user"""
    db = get_database()
    users_collection = db.users
    
    user = await users_collection.find_one({"username": username})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check tank limit
    if len(user.get("tanks", [])) >= 6:
        raise HTTPException(status_code=400, detail="Maximum of 6 tanks allowed per user")
    
    # Create new tank
    new_tank = {
        "id": str(uuid.uuid4()),
        "name": tank_data.name,
        "theme": {"background": "blue-gradient"},
        "fish": [],
        "createdAt": now_utc(),
        "updatedAt": now_utc()
    }
    
    # Add tank to user
    await users_collection.update_one(
        {"username": username},
        {
            "$push": {"tanks": new_tank},
            "$set": {"updatedAt": now_utc()}
        }
    )
    
    return TankResponse(**new_tank)


@router.get("/tanks/{tank_id}", response_model=TankResponse)
async def get_tank(tank_id: str, username: str = Depends(get_current_username)):
    """Get a specific tank by ID"""
    db = get_database()
    users_collection = db.users
    
    user = await users_collection.find_one({"username": username})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Find the tank
    tank = None
    for t in user.get("tanks", []):
        if t["id"] == tank_id:
            tank = t
            break
    
    if not tank:
        raise HTTPException(status_code=404, detail="Tank not found")
    
    return TankResponse(**tank)


@router.delete("/tanks/{tank_id}")
async def delete_tank(tank_id: str, username: str = Depends(get_current_username)):
    """Delete a tank"""
    db = get_database()
    users_collection = db.users
    
    # Remove tank from user
    result = await users_collection.update_one(
        {"username": username},
        {
            "$pull": {"tanks": {"id": tank_id}},
            "$set": {"updatedAt": now_utc()}
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Tank not found")
    
    return {"status": "deleted", "tankId": tank_id}


@router.post("/tanks/{tank_id}/fish", response_model=FishResponse)
async def add_fish(tank_id: str, fish_data: FishCreate, username: str = Depends(get_current_username)):
    """Add a new fish to a specific tank"""
    db = get_database()
    users_collection = db.users
    
    user = await users_collection.find_one({"username": username})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Find the tank and check fish limit
    tank = None
    for t in user.get("tanks", []):
        if t["id"] == tank_id:
            tank = t
            break
    
    if not tank:
        raise HTTPException(status_code=404, detail="Tank not found")
    
    if len(tank.get("fish", [])) >= 30:
        raise HTTPException(status_code=400, detail="Maximum of 30 fish per tank")
    
    # Create new fish
    new_fish = {
        "id": str(uuid.uuid4()),
        "species": fish_data.species,
        "name": fish_data.name,
        "color": fish_data.color,
        "size": fish_data.size.value,
        "createdAt": now_utc()
    }
    
    # Add fish to the specific tank
    await users_collection.update_one(
        {"username": username, "tanks.id": tank_id},
        {
            "$push": {"tanks.$.fish": new_fish},
            "$set": {"tanks.$.updatedAt": now_utc(), "updatedAt": now_utc()}
        }
    )
    
    return FishResponse(**new_fish)


@router.delete("/tanks/{tank_id}/fish/{fish_id}")
async def delete_fish(tank_id: str, fish_id: str, username: str = Depends(get_current_username)):
    """Delete a fish from a specific tank"""
    db = get_database()
    users_collection = db.users
    
    # Remove fish from the specific tank
    result = await users_collection.update_one(
        {"username": username, "tanks.id": tank_id},
        {
            "$pull": {"tanks.$.fish": {"id": fish_id}},
            "$set": {"tanks.$.updatedAt": now_utc(), "updatedAt": now_utc()}
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Fish or tank not found")
    
    return {"status": "deleted", "fishId": fish_id}


@router.post("/tanks/{tank_id}/fish/bulk", response_model=dict)
@limiter.limit("5/minute")
async def bulk_add_fish(request: Request, tank_id: str, fish_list: List[FishCreate], username: str = Depends(get_current_username)):
    """
    Bulk add fish to a tank - used for syncing guest fish on login
    Rate limited to 5 requests per minute.
    """
    # Limit the number of fish that can be added in one request
    MAX_BULK_FISH = 30
    if len(fish_list) > MAX_BULK_FISH:
        raise HTTPException(status_code=400, detail=f"Maximum {MAX_BULK_FISH} fish per bulk request")
    
    db = get_database()
    users_collection = db.users
    
    user = await users_collection.find_one({"username": username})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Find the tank
    tank = None
    for t in user.get("tanks", []):
        if t["id"] == tank_id:
            tank = t
            break
    
    if not tank:
        raise HTTPException(status_code=404, detail="Tank not found")
    
    current_count = len(tank.get("fish", []))
    available_slots = 30 - current_count
    
    if available_slots <= 0:
        raise HTTPException(status_code=400, detail="Tank is full (30 fish maximum)")
    
    # Only add as many fish as there are slots
    fish_to_add = fish_list[:available_slots]
    
    # Create fish documents
    new_fish = []
    for fish_data in fish_to_add:
        new_fish.append({
            "id": str(uuid.uuid4()),
            "species": fish_data.species,
            "name": fish_data.name,
            "color": fish_data.color,
            "size": fish_data.size.value,
            "createdAt": now_utc()
        })
    
    if new_fish:
        # Add all fish at once
        await users_collection.update_one(
            {"username": username, "tanks.id": tank_id},
            {
                "$push": {"tanks.$.fish": {"$each": new_fish}},
                "$set": {"tanks.$.updatedAt": now_utc(), "updatedAt": now_utc()}
            }
        )
    
    return {
        "status": "success",
        "added": len(new_fish),
        "skipped": len(fish_list) - len(new_fish)
    }

