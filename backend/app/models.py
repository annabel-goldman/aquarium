"""
Data Models for Cozy Aquarium Game
"""

from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime, timezone
from enum import Enum
from passlib.context import CryptContext
import re

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ============================================
# ENUMS
# ============================================

class FishSize(str, Enum):
    sm = "sm"
    md = "md"
    lg = "lg"


class Rarity(str, Enum):
    common = "common"
    uncommon = "uncommon"
    rare = "rare"
    legendary = "legendary"


# ============================================
# FISH MODELS
# ============================================

class FishAccessories(BaseModel):
    """Accessories worn by a fish"""
    hat: Optional[str] = None
    glasses: Optional[str] = None
    effect: Optional[str] = None


class Fish(BaseModel):
    """A fish in the player's tank"""
    id: str
    species: str
    name: str
    color: str
    size: FishSize
    rarity: Rarity = Rarity.common
    accessories: FishAccessories = FishAccessories()
    createdAt: datetime


class FishCreate(BaseModel):
    """Data for creating a new fish (manual add)"""
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
    """Fish data returned to client"""
    id: str
    species: str
    name: str
    color: str
    size: str
    rarity: str
    accessories: FishAccessories
    createdAt: datetime


# ============================================
# TANK STATE
# ============================================

class PoopPosition(BaseModel):
    """A poop particle in the tank"""
    id: str
    x: float  # 0-1 position
    y: float  # 0-1 position
    createdAt: datetime


class TankState(BaseModel):
    """Current state of the player's tank"""
    hunger: float = 100.0          # 0-100
    cleanliness: float = 100.0     # 0-100
    poopPositions: List[PoopPosition] = []
    lastPoopTime: datetime = None  # Track when poop was last generated


# ============================================
# GAME STATE
# ============================================

class GameState(BaseModel):
    """Player's progression and resources"""
    coins: int = 100
    maxFish: int = 10
    lastActiveAt: datetime


# ============================================
# USER MODEL
# ============================================

class User(BaseModel):
    """Complete user data with game state"""
    username: str
    password_hash: str
    gameState: GameState
    tank: TankState
    fish: List[Fish] = []
    ownedAccessories: List[str] = []
    createdAt: datetime
    updatedAt: datetime


# ============================================
# API REQUEST/RESPONSE MODELS
# ============================================

class SessionCreate(BaseModel):
    """Login/register request"""
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
    """Login response"""
    username: str
    is_new_user: bool = False


class GameStateResponse(BaseModel):
    """Full game state returned to client"""
    gameState: GameState
    tank: TankState
    fish: List[FishResponse]
    ownedAccessories: List[str]
    happiness: float  # Calculated: (hunger + cleanliness) / 2


class FeedResponse(BaseModel):
    """Response after feeding"""
    success: bool
    newHunger: float
    coinsSpent: int
    newCoins: int


class CleanResponse(BaseModel):
    """Response after cleaning"""
    success: bool
    newCleanliness: float
    poopRemoved: int


# ============================================
# FISHING MODELS
# ============================================

class FishingSpawn(BaseModel):
    """A fish silhouette in the lake"""
    id: str
    species: str
    rarity: Rarity
    x: float
    speed: float
    direction: int  # 1 = right, -1 = left


class CatchResult(BaseModel):
    """Result of attempting to catch something"""
    success: bool
    resultType: str  # "fish", "junk", "cosmetic"
    fish: Optional[FishResponse] = None
    junkItem: Optional[str] = None
    cosmeticId: Optional[str] = None
    coinsEarned: int = 0


class KeepFishRequest(BaseModel):
    """Request to keep a caught fish"""
    fishId: str  # ID of caught fish to keep


class SwapFishRequest(BaseModel):
    """Request to swap caught fish with one in tank"""
    caughtFishId: str
    releaseFishId: str  # ID of fish in tank to release


# ============================================
# SHOP MODELS
# ============================================

class ShopItem(BaseModel):
    """An item in the shop"""
    id: str
    name: str
    category: str  # "hat", "glasses", "effect"
    price: int
    owned: bool = False
    canBuy: bool = False
    catchOnly: bool = False


class PurchaseRequest(BaseModel):
    """Request to purchase an item"""
    itemId: str


class ApplyAccessoryRequest(BaseModel):
    """Request to apply accessory to fish"""
    slot: str  # "hat", "glasses", "effect"
    itemId: Optional[str] = None  # None to remove


# ============================================
# LEGACY MODELS (for migration compatibility)
# ============================================

class LegacyTheme(BaseModel):
    background: str = "blue-gradient"


class LegacyTank(BaseModel):
    id: str
    name: str
    theme: LegacyTheme
    fish: List[dict] = []
    createdAt: datetime
    updatedAt: datetime


class LegacyUser(BaseModel):
    username: str
    password_hash: str
    tanks: List[LegacyTank] = []
    createdAt: datetime
    updatedAt: datetime


# ============================================
# UTILITY FUNCTIONS
# ============================================

def now_utc():
    """Get current UTC time with timezone info"""
    return datetime.now(timezone.utc)


def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return pwd_context.verify(plain_password, hashed_password)


def calculate_happiness(hunger: float, cleanliness: float) -> float:
    """Calculate tank happiness from hunger and cleanliness"""
    return (hunger + cleanliness) / 2
