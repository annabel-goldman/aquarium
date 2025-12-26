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

