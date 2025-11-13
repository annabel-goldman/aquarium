from jose import jwt, JWTError
from fastapi import Cookie, HTTPException, Response
from typing import Optional
import os
from datetime import datetime, timedelta, timezone

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-in-production")
ALGORITHM = "HS256"
COOKIE_NAME = "sid"


def create_session_token(username: str) -> str:
    """Create a signed JWT token with username"""
    payload = {
        "username": username,
        "exp": datetime.now(timezone.utc) + timedelta(days=30)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)
    return token


def verify_session_token(token: str) -> Optional[str]:
    """Verify JWT token and return username"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        username = payload.get("username")
        return username
    except JWTError:
        return None


def set_session_cookie(response: Response, username: str):
    """Set HttpOnly session cookie"""
    token = create_session_token(username)
    # Secure cookies - enabled for HTTPS (aquarium.annabelgoldman.com)
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        max_age=30 * 24 * 60 * 60,  # 30 days
        secure=True  # HTTPS enabled!
    )


def clear_session_cookie(response: Response):
    """Clear session cookie"""
    response.delete_cookie(key=COOKIE_NAME)


async def get_current_username(sid: Optional[str] = Cookie(None)) -> str:
    """Dependency to extract username from cookie"""
    if not sid:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    username = verify_session_token(sid)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    return username


def get_optional_username(sid: Optional[str] = Cookie(None)) -> Optional[str]:
    """Get username from cookie without raising exception if not present"""
    if not sid:
        return None
    return verify_session_token(sid)

