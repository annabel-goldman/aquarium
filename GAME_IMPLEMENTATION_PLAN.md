# Cozy Aquarium Game - Implementation Plan

## Overview

This document outlines the complete refactor needed to transform the current multi-tank aquarium viewer into a gamified cozy aquarium experience with fishing, leveling, and customization.

---

## Current Architecture Summary

### Backend (FastAPI + MongoDB)
- **Multi-tank system**: Users have `tanks[]` array, each tank has `fish[]`
- **Fish model**: `{id, species, name, color, size, createdAt}`
- **Tank model**: `{id, name, theme, fish[], createdAt, updatedAt}`
- **User model**: `{username, password_hash, tanks[], createdAt, updatedAt}`

### Frontend (React + Vite)
- **Routing**: Login → Aquarium List → Individual Tank pages
- **State hooks**: `useTanks`, `useTank`, `useFishAnimation`
- **Components**: TankView, FishSprite, ControlsPanel, modals

---

## Phase 1: Core Refactor (Backend + Frontend Foundation)

### 1.1 Backend Data Model Changes

**New User Model:**
```python
class GameState(BaseModel):
    level: int = 1
    xp: int = 0                    # XP toward next level
    coins: int = 100               # Starting coins
    maxFish: int = 10              # Starting capacity
    lastActiveAt: datetime         # For calculating time-based decay

class TankState(BaseModel):
    hunger: float = 100.0          # 0-100, shared across all fish
    cleanliness: float = 100.0     # 0-100
    poopPositions: List[dict] = [] # [{id, x, y, createdAt}]

class FishAccessories(BaseModel):
    hat: Optional[str] = None
    glasses: Optional[str] = None
    effect: Optional[str] = None

class Fish(BaseModel):
    id: str
    species: str
    name: str
    color: str
    size: FishSize
    rarity: str = "common"         # common, uncommon, rare, legendary
    accessories: FishAccessories = FishAccessories()
    createdAt: datetime

class User(BaseModel):
    username: str
    password_hash: str
    gameState: GameState
    tank: TankState                # Single tank, not array
    fish: List[Fish] = []          # Fish at top level, not nested
    ownedAccessories: List[str] = []
    createdAt: datetime
    updatedAt: datetime
```

**New API Endpoints:**
```
# Game State
GET  /api/game                    → Get full game state (tank, fish, gameState)
POST /api/game/feed               → Feed the tank (costs coins or free with timer)
POST /api/game/clean              → Clean poop from tank
POST /api/game/tick               → Update game state (hunger decay, poop spawn)

# Fishing
GET  /api/fishing/spawn           → Get available fish silhouettes
POST /api/fishing/catch           → Attempt to catch a fish
POST /api/fishing/keep            → Keep caught fish (if room)
POST /api/fishing/release         → Release caught fish

# Shop
GET  /api/shop/items              → List all items with unlock status
POST /api/shop/buy/:itemId        → Purchase an item
POST /api/fish/:fishId/accessory  → Apply accessory to fish

# Fish Management
DELETE /api/fish/:fishId          → Release a fish from tank
POST   /api/fish/:fishId/swap     → Swap with newly caught fish
```

### 1.2 Backend File Changes

| File | Action | Changes |
|------|--------|---------|
| `models.py` | **Modify** | Add GameState, TankState, FishAccessories, rarity field |
| `routers/tanks.py` | **Delete** | Multi-tank logic no longer needed |
| `routers/game.py` | **Create** | New game state management |
| `routers/fishing.py` | **Create** | Fishing minigame logic |
| `routers/shop.py` | **Create** | Shop and accessory management |
| `game_config.py` | **Create** | Game constants (level thresholds, decay rates, etc.) |
| `migrate_to_game.py` | **Create** | Migration script from old to new schema |

### 1.3 Frontend Route Changes

**Old Routes:**
```
/login          → LoginForm
/aquarium       → AquariumPage (tank list)
/tanks/:tankId  → TankPage (individual tank)
/               → GuestTankPage
```

**New Routes:**
```
/login          → LoginForm (keep)
/tank           → TankPage (main hub, HOME)
/lake           → LakePage (fishing minigame)
/shop           → ShopPage (customization)
/               → Redirect to /tank if logged in, guest mode otherwise
```

### 1.4 Frontend File Changes

| File | Action | Changes |
|------|--------|---------|
| `App.jsx` | **Modify** | New routes, bottom navigation |
| `pages/AquariumPage.jsx` | **Delete** | No longer needed |
| `pages/TankPage.jsx` | **Modify** | Become main hub with meters |
| `pages/LakePage.jsx` | **Create** | Fishing minigame |
| `pages/ShopPage.jsx` | **Create** | Customization shop |
| `hooks/useTanks.js` | **Delete** | No longer needed |
| `hooks/useTank.js` | **Modify** | Rename to `useGame.js`, fetch full game state |
| `hooks/useGameState.js` | **Create** | Manage hunger, cleanliness, happiness |
| `hooks/useFishing.js` | **Create** | Fishing minigame state |
| `hooks/useShop.js` | **Create** | Shop state and purchases |
| `api/client.js` | **Modify** | New API endpoints |
| `config/constants.js` | **Modify** | Add game constants (decay rates, levels) |
| `config/gameData.js` | **Create** | Shop items, rarity configs, level rewards |

---

## Phase 2: Tank Mechanics

### 2.1 Hunger System
- **Decay**: 1% per minute during active play
- **Feed action**: Restores 25% hunger, costs 5 coins
- **Effect on happiness**: Direct contribution to formula

**Frontend:**
- Hunger meter bar (gradient from green → yellow → red)
- Feed button with coin cost
- Visual feedback (fish swim slower when hungry)

### 2.2 Cleanliness System
- **Poop generation**: Each fish generates poop every 2-3 minutes
- **Poop appears**: Random position in tank
- **Clean action**: Click poop to remove, or "Clean All" button
- **Effect**: Each poop reduces cleanliness by ~3%

**Frontend:**
- Poop sprites (simple brown circles/shapes)
- Click-to-clean interaction
- Water opacity effect (darker when dirty)
- Cleanliness meter bar

### 2.3 Happiness System
```javascript
happiness = (hunger + cleanliness) / 2
```

**Visual feedback:**
- Happy (80-100%): Fish swim normally, sparkle effects
- Content (50-80%): Normal behavior
- Sad (20-50%): Fish swim slower, muted colors
- Unhappy (0-20%): Fish barely move, water looks murky

---

## Phase 3: Leveling & Capacity

### 3.1 Level System

**XP Mechanics:**
- XP accumulates while happiness is at 100%
- Rate: 1 XP per second at max happiness
- Losing 100% happiness pauses XP gain (no penalty)

**Level Thresholds:**
```javascript
const LEVELS = [
  { level: 1, xpRequired: 0, maxFish: 10, rewards: [] },
  { level: 2, xpRequired: 600, maxFish: 12, rewards: ['hat_basic'] },      // 10 min
  { level: 3, xpRequired: 1800, maxFish: 14, rewards: ['glasses_round'] },  // 30 min
  { level: 4, xpRequired: 3600, maxFish: 16, rewards: ['effect_bubbles'] }, // 60 min
  { level: 5, xpRequired: 7200, maxFish: 18, rewards: ['hat_crown'] },      // 2 hours
  // ... continues
];
```

**Level Up Rewards:**
- +2 fish capacity per level
- 50 coins per level
- Unlock new shop items

### 3.2 UI Components

**Level display:**
- Current level badge
- XP progress bar to next level
- "MAX HAPPINESS!" indicator when earning XP

**Capacity display:**
- Fish count: "8 / 12 🐠"
- Show increase on level up

---

## Phase 4: Fishing Minigame

### 4.1 Lake Screen Design

**Layout:**
- Water surface with ripples
- Fish silhouettes moving at different speeds
- Tap/click to cast line and catch

**Fish Behavior by Rarity:**
| Rarity | Speed | Spawn Rate | Coin Value |
|--------|-------|------------|------------|
| Common | Slow (2s across) | 60% | 5 |
| Uncommon | Medium (1.5s) | 25% | 15 |
| Rare | Fast (1s) | 12% | 40 |
| Legendary | Very Fast (0.5s) | 3% | 100 |

### 4.2 Catch Flow

```
1. Fish silhouettes swim across lake
2. Player taps a fish to attempt catch
3. Brief "reeling" animation (0.5-1s)
4. Result revealed:
   - 85% → Fish caught (species + rarity)
   - 10% → Junk item (rock, boot, seaweed) - throw back
   - 5%  → Rare cosmetic item (unlocks in shop!)
5. If fish caught:
   - Tank has room → "Add to Tank" or "Release (+coins)"
   - Tank full → "Swap Fish" or "Release (+coins)"
```

### 4.3 Components

| Component | Purpose |
|-----------|---------|
| `LakePage.jsx` | Main fishing screen |
| `FishSilhouette.jsx` | Moving fish shadow |
| `CatchModal.jsx` | Show catch result |
| `SwapFishModal.jsx` | Choose fish to swap |
| `useFishing.js` | Manage fishing state |

---

## Phase 5: Shop & Customization

### 5.1 Shop Categories

**Hats:**
```javascript
const HATS = [
  { id: 'hat_basic', name: 'Party Hat', price: 50, unlockLevel: 2 },
  { id: 'hat_crown', name: 'Crown', price: 150, unlockLevel: 5 },
  { id: 'hat_pirate', name: 'Pirate Hat', price: 100, unlockLevel: 3 },
  // ...
];
```

**Glasses:**
```javascript
const GLASSES = [
  { id: 'glasses_round', name: 'Round Glasses', price: 40, unlockLevel: 3 },
  { id: 'glasses_star', name: 'Star Glasses', price: 80, unlockLevel: 6 },
  // ...
];
```

**Effects:**
```javascript
const EFFECTS = [
  { id: 'effect_bubbles', name: 'Bubbles', price: 100, unlockLevel: 4 },
  { id: 'effect_sparkle', name: 'Sparkle', price: 200, unlockLevel: 8 },
  { id: 'effect_hearts', name: 'Hearts', price: 150, unlockLevel: 6 },
  // ...
];
```

### 5.2 Shop UI

- Grid of items by category (tabs)
- Lock icon + "Unlocks at Level X" for locked items
- Price display with coin icon
- "Owned" badge for purchased items
- Preview of item on sample fish

### 5.3 Apply Accessories Flow

```
1. Go to tank, tap a fish
2. "Customize" button opens fish customization modal
3. Select from owned accessories (hat/glasses/effect)
4. Apply and save
```

---

## Migration Strategy

### Database Migration Script

```python
# migrate_to_game.py

async def migrate_user(old_user):
    """Convert old multi-tank user to new single-tank game user"""
    
    # Merge all fish from all tanks
    all_fish = []
    for tank in old_user.get('tanks', []):
        for fish in tank.get('fish', []):
            # Add rarity (existing fish default to common)
            fish['rarity'] = 'common'
            fish['accessories'] = {'hat': None, 'glasses': None, 'effect': None}
            all_fish.append(fish)
    
    # Take first 10 fish (starting capacity)
    fish_to_keep = all_fish[:10]
    
    new_user = {
        'username': old_user['username'],
        'password_hash': old_user['password_hash'],
        'gameState': {
            'level': 1,
            'xp': 0,
            'coins': 100 + len(all_fish) * 10,  # Bonus for existing fish
            'maxFish': 10,
            'lastActiveAt': datetime.utcnow()
        },
        'tank': {
            'hunger': 100.0,
            'cleanliness': 100.0,
            'poopPositions': []
        },
        'fish': fish_to_keep,
        'ownedAccessories': [],
        'createdAt': old_user['createdAt'],
        'updatedAt': datetime.utcnow()
    }
    
    return new_user
```

---

## Component Architecture (Frontend)

### New Component Tree

```
App.jsx
├── BottomNav.jsx                    # Lake | Tank | Shop navigation
├── pages/
│   ├── TankPage.jsx                 # Main hub
│   │   ├── TankView.jsx             # Fish + poop rendering
│   │   ├── MeterBar.jsx             # Hunger/cleanliness/happiness
│   │   ├── FeedButton.jsx
│   │   ├── CleanButton.jsx
│   │   ├── LevelBadge.jsx
│   │   └── FishCustomizeModal.jsx
│   ├── LakePage.jsx                 # Fishing
│   │   ├── LakeView.jsx             # Water + silhouettes
│   │   ├── FishSilhouette.jsx
│   │   ├── CatchResultModal.jsx
│   │   └── SwapFishModal.jsx
│   └── ShopPage.jsx                 # Customization
│       ├── ShopTabs.jsx
│       ├── ShopItem.jsx
│       └── ItemPreview.jsx
└── components/
    ├── FishSprite.jsx               # Updated with accessories
    ├── PoopSprite.jsx               # New
    ├── AccessorySprite.jsx          # New (hat/glasses overlays)
    └── ui/                          # Existing UI components
```

### State Management

```javascript
// useGame.js - Central game state hook
const useGame = () => {
  const [gameState, setGameState] = useState(null);
  // { level, xp, coins, maxFish }
  
  const [tank, setTank] = useState(null);
  // { hunger, cleanliness, poopPositions }
  
  const [fish, setFish] = useState([]);
  // Array of fish with accessories
  
  const happiness = useMemo(() => 
    (tank.hunger + tank.cleanliness) / 2,
    [tank]
  );
  
  // Actions
  const feed = async () => { ... };
  const clean = async (poopId) => { ... };
  const cleanAll = async () => { ... };
  const applyAccessory = async (fishId, slot, itemId) => { ... };
  
  return {
    gameState,
    tank,
    fish,
    happiness,
    feed,
    clean,
    cleanAll,
    applyAccessory,
  };
};
```

---

## Visual Design Notes

### Color Palette (Cozy Ocean Theme)
```css
:root {
  /* Water colors */
  --water-clean: #4FC3F7;      /* Light blue */
  --water-dirty: #37474F;      /* Murky gray-blue */
  
  /* Meter colors */
  --meter-good: #66BB6A;       /* Green */
  --meter-warning: #FFA726;    /* Orange */
  --meter-danger: #EF5350;     /* Red */
  
  /* UI colors */
  --primary: #26A69A;          /* Teal */
  --accent: #FFD54F;           /* Gold (coins) */
  --bg-panel: rgba(255, 255, 255, 0.9);
}
```

### UI Style
- Soft rounded corners (12-16px)
- Subtle shadows
- Gentle animations
- Emoji accents for cozy feel (🐠 😊 🧼 🍞 🎣)

---

## Implementation Order

### Week 1: Core Refactor
1. ✅ Create implementation plan (this document)
2. Backend: New models + game router
3. Backend: Migration script
4. Frontend: Remove multi-tank, add single tank view

### Week 2: Tank Mechanics
5. Backend: Hunger/cleanliness decay system
6. Backend: Poop generation
7. Frontend: Meters UI + feed/clean buttons
8. Frontend: Poop rendering + click-to-clean

### Week 3: Leveling
9. Backend: XP accumulation + level system
10. Backend: Capacity increases + rewards
11. Frontend: Level display + XP bar
12. Frontend: Level up celebration

### Week 4: Fishing
13. Backend: Fishing spawn + catch logic
14. Frontend: Lake screen + silhouettes
15. Frontend: Catch modal + swap flow
16. Integration testing

### Week 5: Shop
17. Backend: Shop items + purchase logic
18. Backend: Accessory application
19. Frontend: Shop UI + item display
20. Frontend: Fish customization modal
21. Polish + final testing

---

## Files to Create (Summary)

### Backend
- `backend/app/game_config.py` - Game constants
- `backend/app/routers/game.py` - Game state management
- `backend/app/routers/fishing.py` - Fishing minigame
- `backend/app/routers/shop.py` - Shop system
- `backend/migrate_to_game.py` - Migration script

### Frontend
- `frontend/src/pages/LakePage.jsx` - Fishing screen
- `frontend/src/pages/ShopPage.jsx` - Shop screen
- `frontend/src/hooks/useGame.js` - Central game state
- `frontend/src/hooks/useFishing.js` - Fishing state
- `frontend/src/hooks/useShop.js` - Shop state
- `frontend/src/components/BottomNav.jsx` - Navigation
- `frontend/src/components/MeterBar.jsx` - Progress bars
- `frontend/src/components/PoopSprite.jsx` - Poop rendering
- `frontend/src/components/LakeView.jsx` - Lake rendering
- `frontend/src/components/FishSilhouette.jsx` - Fishing target
- `frontend/src/components/CatchResultModal.jsx` - Catch result
- `frontend/src/components/SwapFishModal.jsx` - Swap fish UI
- `frontend/src/components/ShopItem.jsx` - Shop item card
- `frontend/src/components/FishCustomizeModal.jsx` - Apply accessories
- `frontend/src/config/gameData.js` - Items, levels, rewards
- `frontend/src/styles/pages/lake.css` - Lake styles
- `frontend/src/styles/pages/shop.css` - Shop styles
- `frontend/src/styles/components/meters.css` - Meter styles
- `frontend/src/styles/components/bottom-nav.css` - Nav styles

### Files to Modify
- `backend/app/models.py` - Add game models
- `backend/app/main.py` - Add new routers
- `frontend/src/App.jsx` - New routes + nav
- `frontend/src/api/client.js` - New endpoints
- `frontend/src/config/constants.js` - Game constants
- `frontend/src/components/FishSprite.jsx` - Accessories support
- `frontend/src/pages/TankPage.jsx` - Game hub UI

### Files to Delete
- `frontend/src/pages/AquariumPage.jsx`
- `frontend/src/hooks/useTanks.js`
- `frontend/src/hooks/useAquarium.js`
- `backend/app/routers/tanks.py` (replace with game.py)

---

## Ready to Start?

This plan is ready for implementation. Start with **Phase 1: Core Refactor** to establish the new data model and single-tank architecture, then build each system incrementally.

The cozy, no-stress philosophy should guide all decisions: gentle feedback, no punishments, visual delight over numbers.

