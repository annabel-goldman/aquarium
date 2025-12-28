# Testing Guide: Unauthenticated Play → Login → Data Migration

## Manual Testing Steps

### 1. Test Unauthenticated Mode (Local Storage)

1. **Clear browser data** (to start fresh):
   - Open DevTools → Application → Local Storage
   - Delete all `aquarium_*` keys

2. **Visit the app** (without logging in):
   - Navigate to http://localhost:5173
   - Should land on `/tank` page
   - Should see "🔒 Log in" button in top right

3. **Play the game without login**:
   - Go to Lake page (`/lake`)
   - Catch some fish
   - Collect coins
   - Keep fish or release for coins
   
   - Go to Tank page (`/tank`)
   - Feed fish (shake food)
   - Wait for poop to appear
   - Clean poop
   
   - Go to Shop page (`/shop`)
   - Buy accessories with coins
   
   - Go to Closet page (`/closet`)
   - Equip accessories on fish

4. **Verify local storage**:
   - DevTools → Application → Local Storage
   - Check `aquarium_local_game_state` key
   - Should contain: `gameState`, `tank`, `fish` arrays

### 2. Test Login & Migration

1. **Click "🔒 Log in" button**

2. **Create a new account** or login with existing:
   - Username: `testuser`
   - Password: `password`

3. **Verify migration happened**:
   - Should stay on same page after login
   - All your fish should still be there
   - All your coins should still be there
   - All your owned accessories should still be there
   
4. **Check local storage cleared**:
   - DevTools → Application → Local Storage
   - `aquarium_local_game_state` should be GONE
   - Data is now in backend (MongoDB)

### 3. Test Persistence

1. **Refresh the page**:
   - All data should persist (loaded from backend)
   - Should show "Log out" button

2. **Logout and login again**:
   - Data should persist across sessions

### 4. Edge Cases to Test

#### Tank Full During Migration
1. Play as guest, catch 10 fish (fill tank)
2. Login
3. Fish that don't fit should convert to coins
4. Check coins increased

#### Already Owned Accessories
1. Play as guest, buy "Top Hat"
2. Login to account that already owns "Top Hat"
3. Should merge without duplicates

#### Empty Guest State
1. Clear local storage
2. Visit app
3. Login immediately
4. Should work normally (no migration needed)

## Backend Testing

### Check Migration Endpoint

```bash
# Start backend
cd backend
uvicorn app.main:app --reload

# Test migration endpoint (requires authentication)
# This is called automatically by frontend during login
```

### Database Verification

```python
# Check MongoDB after migration
from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client.aquarium_db

user = db.users.find_one({"username": "testuser"})
print("Fish count:", len(user.get("fish", [])))
print("Coins:", user.get("gameState", {}).get("coins"))
print("Accessories:", user.get("gameState", {}).get("ownedAccessories"))
```

## Expected Behavior Summary

| Action | Before Login | After Login |
|--------|-------------|-------------|
| Data storage | localStorage | MongoDB |
| Fish visible | ✅ | ✅ |
| Coins visible | ✅ | ✅ |
| Can catch fish | ✅ | ✅ |
| Can buy items | ✅ | ✅ |
| Can equip accessories | ✅ | ✅ |
| Data persists across refreshes | ✅ (local) | ✅ (server) |
| Login button shows | ✅ "🔒 Log in" | "Log out" |

## Common Issues

### Issue: Fish disappear after login
- **Cause**: Migration endpoint failed
- **Check**: Browser console for errors
- **Check**: Backend logs for exceptions

### Issue: Coins doubled/wrong
- **Cause**: Migration adding local + server coins
- **Expected**: This is correct behavior (merge)

### Issue: Can't access pages without login
- **Cause**: App.jsx still has auth checks
- **Fix**: All routes should work without auth now

### Issue: Local storage not clearing after login
- **Cause**: `clearLocalGameState()` not called
- **Check**: `useSession.js` migration logic

## Success Criteria

✅ Can play full game without logging in
✅ All features work in unauthenticated mode
✅ Login button visible when not logged in
✅ Login/Register flow works smoothly
✅ All local data migrates to account on login
✅ Local storage clears after successful migration
✅ Data persists after login across sessions
✅ No duplicate data after migration
✅ Tank capacity respected during migration

