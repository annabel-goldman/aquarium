"""
===============================================================================
GAME CONFIGURATION - Cozy Aquarium Game
===============================================================================

This file contains ALL tunable game parameters in one place.
Edit these values to adjust game balance, difficulty, and pacing.

IMPORTANT: Changes here affect the BACKEND/SERVER behavior.
For frontend-only settings (animations, UI), see frontend/src/config/constants.js
===============================================================================
"""

# ==============================================================================
# STARTING VALUES
# These define what new players begin with
# ==============================================================================

STARTING_COINS = 100           # How many coins new players start with
                               # HIGHER = easier early game, more shop options
                               # LOWER = forces players to fish before shopping

STARTING_MAX_FISH = 10         # Tank capacity (fish slots)
                               # HIGHER = less pressure to release fish
                               # LOWER = forces more decisions about which fish to keep

STARTING_HUNGER = 100.0        # Tank hunger meter (0-100%)
STARTING_CLEANLINESS = 100.0   # Tank cleanliness meter (0-100%)


# ==============================================================================
# TANK MECHANICS - Hunger & Cleanliness
# These control how fast tanks degrade and how players maintain them
# ==============================================================================

HUNGER_DECAY_PER_MINUTE = 1.0  # How much hunger drops per minute of active play
                               # HIGHER = need to feed more often (more engaging but demanding)
                               # LOWER = more casual, less maintenance required
                               # At 1.0, tank goes from 100% to 0% in ~100 min

HUNGER_FEED_RESTORE = 25.0     # How much hunger is restored per feeding (shake the food)
                               # HIGHER = fewer feeds needed, more forgiving
                               # LOWER = need to feed more often

FEED_COST = 0                  # Coins charged per feeding
                               # 0 = free feeding (casual friendly)
                               # 5+ = adds economic pressure

POOP_GENERATION_INTERVAL = 120 # Seconds between poop spawns PER FISH
                               # HIGHER = less poop, easier to maintain
                               # LOWER = more poop, more cleaning needed
                               # At 120s, each fish poops every 2 minutes

POOP_CLEANLINESS_PENALTY = 3.0 # Cleanliness % lost per poop on the ground
                               # HIGHER = tank gets dirty faster, clean often
                               # LOWER = more forgiving, less cleaning needed

MIN_CLEANLINESS = 0.0          # Minimum cleanliness value (can't go below)
MAX_CLEANLINESS = 100.0        # Maximum cleanliness value


# ==============================================================================
# FISH RARITY & VALUES
# Controls how rare each fish type is and what they're worth
# ==============================================================================

RARITY_WEIGHTS = {
    # Relative chance of each rarity spawning in the lake
    # HIGHER weight = more common, LOWER = rarer
    # These are relative (60:25:12:3 = 60% common, 25% uncommon, etc.)
    "common": 60,              # ~60% of spawns
    "uncommon": 25,            # ~25% of spawns
    "rare": 12,                # ~12% of spawns
    "legendary": 3,            # ~3% of spawns - very rare!
}

RARITY_COIN_VALUES = {
    # Coins earned when RELEASING a fish of this rarity
    # HIGHER = more rewarding to release, less incentive to keep
    # LOWER = more incentive to keep fish in tank
    "common": 5,               # Worth a small amount
    "uncommon": 15,            # Worth 3x common
    "rare": 40,                # Worth 8x common
    "legendary": 100,          # Worth 20x common - big payout!
}

RARITY_SPEED = {
    # How many SECONDS the fish silhouette takes to swim across screen
    # HIGHER = slower, easier to click/tap
    # LOWER = faster, harder to catch
    "common": 8.0,             # Very slow, easy to catch
    "uncommon": 5.0,           # Moderate speed
    "rare": 3.0,               # Fairly quick
    "legendary": 1.5,          # Very fast - blink and you'll miss it!
}


# ==============================================================================
# FISHING MINIGAME - Catch Probabilities
# Controls what you get when you successfully tap a fish
# ==============================================================================

# These three values should add up to 1.0 (100%)
CATCH_FISH_CHANCE = 0.85       # 85% chance to catch an actual fish
                               # HIGHER = more fish, faster tank filling
                               # LOWER = more junk/cosmetics

CATCH_JUNK_CHANCE = 0.10       # 10% chance to catch junk (old boot, etc.)
                               # HIGHER = more disappointing catches
                               # LOWER = more reliable fishing

CATCH_COSMETIC_CHANCE = 0.05   # 5% chance for rare cosmetic item
                               # HIGHER = cosmetics feel less special
                               # LOWER = cosmetics are rare treasures

# Available fish species in the lake
FISH_SPECIES = [
    "Angelfish",
    "Clownfish",
    "Seahorse",
    "Dolphin",
    "Evilfish",
]

# Junk items that can be caught (thrown back for nothing)
JUNK_ITEMS = [
    "Old Boot",
    "Empty Can",
    "Seaweed Clump",
    "Rusty Anchor",
    "Broken Shell",
]

# Rare cosmetics that can ONLY be caught while fishing (not in shop)
CATCHABLE_COSMETICS = [
    "hat_fishing",             # Fishing Cap
    "effect_lucky",            # Lucky Clover effect
]


# ==============================================================================
# SHOP ITEMS - All purchasable accessories
# ==============================================================================

SHOP_ITEMS = {
    # FORMAT:
    # "item_id": {
    #     "name": "Display Name",
    #     "category": "hat" | "effect",
    #     "price": coins_to_buy,         # Set to 0 for catch-only items
    #     "catchOnly": True/False,        # If True, can only get by fishing
    # }
    
    # ===== HATS =====
    "top_hat": {
        "name": "Top Hat",
        "category": "hat",
        "price": 50,                       # Affordable starter hat
    },
    "hat_party": {
        "name": "Party Hat",
        "category": "hat",
        "price": 50,
    },
    "hat_beanie": {
        "name": "Cozy Beanie",
        "category": "hat",
        "price": 80,
    },
    "hat_tophat": {
        "name": "Fancy Top Hat",
        "category": "hat",
        "price": 120,
    },
    "hat_crown": {
        "name": "Royal Crown",
        "category": "hat",
        "price": 150,
    },
    "hat_pirate": {
        "name": "Pirate Hat",
        "category": "hat",
        "price": 100,
    },
    "hat_wizard": {
        "name": "Wizard Hat",
        "category": "hat",
        "price": 200,
    },
    "hat_fishing": {
        "name": "Fishing Cap",
        "category": "hat",
        "price": 0,                        # Can't buy - fishing only!
        "catchOnly": True,
    },
    
    # ===== EFFECTS =====
    "effect_bubbles": {
        "name": "Bubble Trail",
        "category": "effect",
        "price": 100,
    },
    "effect_sparkle": {
        "name": "Sparkle Aura",
        "category": "effect",
        "price": 200,
    },
    "effect_hearts": {
        "name": "Love Hearts",
        "category": "effect",
        "price": 150,
    },
    "effect_rainbow": {
        "name": "Rainbow Trail",
        "category": "effect",
        "price": 250,
    },
    "effect_lucky": {
        "name": "Lucky Clover",
        "category": "effect",
        "price": 0,                        # Can't buy - fishing only!
        "catchOnly": True,
    },
}


# ==============================================================================
# BONUS COINS
# Miscellaneous coin rewards
# ==============================================================================

BONUS_COINS_ALL_COSMETICS = 50  # Coins given if player catches cosmetic but owns all
                                 # HIGHER = nice consolation prize
                                 # LOWER = less rewarding when "complete"


# ==============================================================================
# TICK BEHAVIOR (for reference - controlled by frontend)
# ==============================================================================
# 
# The frontend sends POST /api/game/tick periodically to sync state.
# This is configured in: frontend/src/config/constants.js (GAME_CONFIG)
#
# Current settings:
#   tickIntervalMs: 60000    (every 60 seconds)
#   tickDebounceMs: 10000    (minimum 10 seconds between ticks)
#
# The backend tick handler calculates time deltas based on lastActiveAt,
# so infrequent ticks are perfectly fine. All decay/generation is time-based,
# not tick-based.
#
