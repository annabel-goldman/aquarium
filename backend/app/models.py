from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime, timezone
from enum import Enum
from passlib.context import CryptContext
import re

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class FishSize(str, Enum):
    sm = "sm"
    md = "md"
    lg = "lg"


class Fish(BaseModel):
    id: str
    species: str
    name: str
    color: str
    size: FishSize
    createdAt: datetime


class Theme(BaseModel):
    background: str = "blue-gradient"


class Tank(BaseModel):
    id: str
    name: str
    theme: Theme
    fish: List[Fish] = []
    createdAt: datetime
    updatedAt: datetime


class User(BaseModel):
    username: str
    password_hash: str
    tanks: List[Tank] = []
    createdAt: datetime
    updatedAt: datetime


class SessionCreate(BaseModel):
    username: str
    password: str
    
    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        if not re.match(r'^[a-z0-9_]{3,20}$', v):
            raise ValueError("Username must be 3-20 characters, lowercase letters, numbers, and underscores only")
        return v
    
    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if len(v) > 72:
            raise ValueError("Password must be at most 72 characters (bcrypt limitation)")
        return v


class SessionResponse(BaseModel):
    username: str


class FishCreate(BaseModel):
    species: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=50)
    color: str
    size: FishSize
    
    @field_validator("color")
    @classmethod
    def validate_color(cls, v: str) -> str:
        if not re.match(r'^#[0-9A-Fa-f]{6}$', v):
            raise ValueError("Color must be a valid hex code (e.g., #FF8844)")
        return v


class FishResponse(BaseModel):
    id: str
    species: str
    name: str
    color: str
    size: str
    createdAt: datetime


class TankCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)


class TankResponse(BaseModel):
    id: str
    name: str
    theme: Theme
    fish: List[FishResponse] = []
    createdAt: datetime
    updatedAt: datetime


class TankSummary(BaseModel):
    id: str
    name: str
    fishCount: int
    createdAt: datetime


def now_utc():
    """Get current UTC time with timezone info"""
    return datetime.now(timezone.utc)


def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return pwd_context.verify(plain_password, hashed_password)

