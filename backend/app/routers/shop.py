"""
Shop Router - Cosmetics and accessories shop
"""

from fastapi import APIRouter, Depends, HTTPException
from app.auth import get_current_username
from app.database import get_database
from app.models import ShopItem, now_utc
from app.game_config import SHOP_ITEMS

router = APIRouter()


@router.get("/shop/items")
async def list_shop_items(username: str = Depends(get_current_username)):
    """Get all shop items with ownership status"""
    db = get_database()
    users = db.users
    
    user = await users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    game_state = user.get("gameState", {})
    current_coins = game_state.get("coins", 0)
    owned = set(user.get("ownedAccessories", []))
    
    items = []
    for item_id, item_data in SHOP_ITEMS.items():
        is_owned = item_id in owned
        is_catch_only = item_data.get("catchOnly", False)
        can_buy = (
            not is_owned and 
            current_coins >= item_data["price"] and
            not is_catch_only
        )
        
        items.append({
            "id": item_id,
            "name": item_data["name"],
            "category": item_data["category"],
            "price": item_data["price"],
            "owned": is_owned,
            "canBuy": can_buy,
            "catchOnly": is_catch_only
        })
    
    # Sort by category, then by price
    items.sort(key=lambda x: (x["category"], x["price"], x["name"]))
    
    return {
        "items": items,
        "coins": current_coins
    }


@router.post("/shop/buy/{item_id}")
async def purchase_item(item_id: str, username: str = Depends(get_current_username)):
    """Purchase an item from the shop"""
    db = get_database()
    users = db.users
    
    # Validate item exists
    if item_id not in SHOP_ITEMS:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item = SHOP_ITEMS[item_id]
    
    # Check if catch-only item
    if item.get("catchOnly", False):
        raise HTTPException(status_code=400, detail="This item can only be obtained by fishing!")
    
    user = await users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    game_state = user.get("gameState", {})
    current_coins = game_state.get("coins", 0)
    owned = user.get("ownedAccessories", [])
    
    # Validate ownership
    if item_id in owned:
        raise HTTPException(status_code=400, detail="You already own this item")
    
    # Validate coins
    if current_coins < item["price"]:
        raise HTTPException(status_code=400, detail="Not enough coins")
    
    # Purchase the item
    new_coins = current_coins - item["price"]
    owned.append(item_id)
    
    await users.update_one(
        {"username": username},
        {"$set": {
            "gameState.coins": new_coins,
            "ownedAccessories": owned,
            "updatedAt": now_utc()
        }}
    )
    
    return {
        "success": True,
        "itemId": item_id,
        "itemName": item["name"],
        "coinsSpent": item["price"],
        "newCoins": new_coins,
        "message": f"Purchased {item['name']}!"
    }


@router.get("/shop/owned")
async def get_owned_items(username: str = Depends(get_current_username)):
    """Get all items owned by the user, organized by category"""
    db = get_database()
    users = db.users
    
    user = await users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    owned_ids = set(user.get("ownedAccessories", []))
    
    owned_items = {
        "hat": [],
        "glasses": [],
        "effect": []
    }
    
    for item_id in owned_ids:
        if item_id in SHOP_ITEMS:
            item = SHOP_ITEMS[item_id]
            owned_items[item["category"]].append({
                "id": item_id,
                "name": item["name"]
            })
    
    return owned_items
