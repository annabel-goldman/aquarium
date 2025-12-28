# Unauthenticated Mode Implementation - Summary

## Overview

The aquarium game now supports full gameplay **without requiring login**. All game data is stored in **localStorage** for unauthenticated users, and automatically migrates to their account when they log in.

---

## What Changed

### ✅ Complete Feature Parity
Unauthenticated users can now access **ALL** game features:
- 🐠 **Tank Page**: View fish, feed them, clean poop
- 🎣 **Lake Page**: Catch fish, collect coins, keep/release fish
- 🛍️ **Shop Page**: Buy accessories with coins
- 👗 **Closet Page**: Equip accessories on fish

### ✅ Seamless Migration
When a user logs in or creates an account:
1. All local fish are added to their tank (if space available)
2. Excess fish are converted to coins automatically
3. Coins are combined (local + account)
4. Owned accessories are merged (no duplicates)
5. Local storage is cleared after successful migration

---

## Technical Architecture

### New Files Created

#### Frontend
- `frontend/src/hooks/useLocalGame.js` - Complete local storage game state management
- `frontend/src/hooks/useUnifiedGame.js` - Switches between local/server game hooks
- `frontend/src/hooks/useLocalFishing.js` - Local fishing logic (spawns, catches)
- `frontend/src/config/gameBalance.js` - Game constants mirrored from backend

#### Backend
- Migration endpoint: `POST /api/sessions/migrate` - Handles data transfer on login

### Modified Files

#### Frontend Core
- `App.jsx` - Removed auth barriers, all routes now public
- `useSession.js` - Added migration logic after authentication
- `api/client.js` - Added migration endpoint

#### Pages (All Updated to Support Both Modes)
- `TankPage.jsx` - Uses `useUnifiedGame`, passes `isAuthenticated`
- `LakePage.jsx` - Uses `useUnifiedGame` + `useLocalFishing`
- `ShopPage.jsx` - Uses `useUnifiedGame`, local SHOP_ITEMS config
- `ClosetPage.jsx` - Uses `useUnifiedGame`

#### Layout Components
- `TopHUD.jsx` - Shows "🔒 Log in" button for unauth users
- `GameLayout.jsx` - Passes `isAuthenticated` to TopHUD
- `TankLayout.jsx` - Passes `isAuthenticated` to TopHUD

#### Backend
- `sessions.py` - Added `/sessions/migrate` endpoint

### Removed Files
- ❌ `GuestTankPage.jsx` - Replaced by unified TankPage
- ❌ `useGuestTank.js` - Replaced by comprehensive useLocalGame
- ❌ `guest-tank.css` - No longer needed

---

## How It Works

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Opens App                           │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
                ┌───────────────┐
                │ isAuthenticated? │
                └───────┬───────┘
                        │
        ┌───────────────┼───────────────┐
        │ NO            │               │ YES
        ▼               │               ▼
┌──────────────┐        │        ┌──────────────┐
│ useLocalGame │        │        │   useGame    │
│ (localStorage)│        │        │ (Backend API)│
└──────────────┘        │        └──────────────┘
        │               │               │
        ▼               │               ▼
   All features         │          All features
   work locally         │         work via server
        │               │               │
        │               ▼               │
        │         User clicks          │
        │         "🔒 Log in"           │
        │               │               │
        │               ▼               │
        │       ┌─────────────┐         │
        │       │ Login Form  │         │
        │       └──────┬──────┘         │
        │              │                │
        │              ▼                │
        │    ┌──────────────────┐       │
        │    │ POST /sessions    │       │
        │    │ (create account)  │       │
        │    └────────┬──────────┘       │
        │             │                 │
        │             ▼                 │
        │    ┌──────────────────┐       │
        └───→│ POST /migrate     │       │
             │ (transfer data)   │       │
             └────────┬──────────┘       │
                      │                 │
                      ▼                 │
             ┌─────────────────┐        │
             │ Clear localStorage│        │
             └────────┬──────────┘        │
                      │                 │
                      └─────────────────┘
                                │
                                ▼
                        Now using backend
                        (isAuthenticated = true)
```

### Local Storage Structure

```javascript
{
  "gameState": {
    "coins": 150,
    "maxFish": 10,
    "lastActiveAt": "2025-01-01T12:00:00.000Z",
    "ownedAccessories": ["top_hat", "effect_bubbles"]
  },
  "tank": {
    "id": "local-tank",
    "name": "My Aquarium",
    "hunger": 85.5,
    "cleanliness": 92.0,
    "poopPositions": [
      { "id": "...", "x": 0.5, "y": 0.8, "createdAt": "..." }
    ],
    "lastPoopTime": "2025-01-01T12:00:00.000Z",
    "updatedAt": "2025-01-01T12:00:00.000Z"
  },
  "fish": [
    {
      "id": "...",
      "species": "Clownfish",
      "name": "Nemo",
      "color": "#ff6b35",
      "size": "md",
      "rarity": "common",
      "accessories": { "hat": "top_hat" },
      "createdAt": "..."
    }
  ]
}
```

---

## Game Balance Sync

The frontend now has a mirror of backend game constants in `config/gameBalance.js`:

- Starting coins/fish capacity
- Hunger/cleanliness decay rates
- Poop generation intervals
- Fish rarity weights and values
- Shop item prices
- Fishing drop rates

**Important**: These must be kept in sync with `backend/app/game_config.py`. In the future, consider fetching these from an API endpoint for single source of truth.

---

## Migration Logic

When a user logs in with local data:

### Fish Migration
```python
for each local_fish:
    if tank_has_space:
        add_to_tank(local_fish)
    else:
        coins += release_value(local_fish)
```

### Coin Migration
```python
new_coins = account_coins + local_coins + release_coins
```

### Accessory Migration
```python
merged_accessories = unique(account_accessories + local_accessories)
```

---

## User Experience Flow

### First-Time Visitor
1. Opens app → lands on `/tank`
2. Sees empty tank with "🔒 Log in" button
3. Can immediately start catching fish, buying items, playing
4. All progress saved to browser localStorage

### Returning Visitor (Unauth)
1. Opens app → local state loads from localStorage
2. Sees all their fish/coins/accessories
3. Continues playing where they left off
4. Data persists until they clear browser data

### Converting to Account
1. Clicks "🔒 Log in" button
2. Creates account or logs in
3. **Instant seamless transition** - no page reload
4. All local data merged into account
5. Local storage cleared
6. Now synced across devices

---

## Benefits

✅ **Lower Barrier to Entry**: No signup required to try the game
✅ **Better Conversion**: Users see value before committing to account
✅ **No Data Loss**: Local progress automatically saved on login
✅ **Cross-Device Sync**: After login, play anywhere
✅ **Offline-Ready**: Could extend to full offline support

---

## Testing

See `TESTING_UNAUTH_MODE.md` for comprehensive test plan.

Quick smoke test:
1. Visit app without logging in
2. Catch 3 fish in lake
3. Buy 1 accessory in shop
4. Equip accessory in closet
5. Log in
6. Verify all 3 fish, coins, and accessory are still there

---

## Future Enhancements

### Potential Improvements
- **Welcome tour** for first-time visitors
- **Save reminder** after significant progress ("Log in to save!")
- **Guest username** for non-auth users (e.g. "Guest-1234")
- **Export/Import** local data as JSON
- **Sync indicator** showing local vs server mode
- **Offline mode toggle** (force local storage even when auth)

### Sync Backend Config
Currently game balance is duplicated. Consider:
```javascript
// Fetch config from backend
const config = await api.getGameConfig();
```

This ensures single source of truth.

---

## Code Maintenance

### When Adding New Features

If adding a new game feature, ensure it works in both modes:

1. **Backend**: Add API endpoint (for auth users)
2. **useLocalGame**: Add equivalent localStorage logic
3. **useUnifiedGame**: Hook works automatically (no changes needed)
4. **Migration**: Update `/sessions/migrate` if data needs merging

### When Changing Game Balance

Update BOTH files:
- `backend/app/game_config.py` (authoritative)
- `frontend/src/config/gameBalance.js` (local copy)

---

## Architecture Decisions

### Why localStorage Instead of IndexedDB?
- Simpler API for this use case
- State size is small (< 1MB typical)
- JSON serialization works well
- No async complexity

### Why Mirror Backend Config?
- Local mode needs same balance as server mode
- Ensures consistent gameplay experience
- Could fetch from API in future

### Why Unified Hook Pattern?
- Pages don't need to know about auth state
- Same interface for local/server
- Easy to test both modes
- DRY principle (don't repeat logic)

---

## Summary

The aquarium game is now a **progressive web experience**:
- Try instantly without barriers
- Save progress anytime with one click
- Seamless transition from local to server
- Full feature parity in both modes

This implementation provides the best of both worlds: low-friction onboarding with powerful account-based features for committed users.

