/**
 * ===============================================================================
 * GAME BALANCE CONSTANTS (FRONTEND COPY)
 * ===============================================================================
 * 
 * These constants mirror the backend game configuration for use in local/offline mode.
 * They should match backend/app/game_config.py
 * 
 * NOTE: In authenticated mode, the backend values are authoritative.
 * These are only used for unauthenticated local storage gameplay.
 * ===============================================================================
 */

// ==============================================================================
// STARTING VALUES
// ==============================================================================

export const STARTING_COINS = 100;
export const STARTING_MAX_FISH = 10;
export const STARTING_HUNGER = 100.0;
export const STARTING_CLEANLINESS = 100.0;

// ==============================================================================
// TANK MECHANICS
// ==============================================================================

export const HUNGER_DECAY_PER_MINUTE = 1.0;
export const HUNGER_FEED_RESTORE = 25.0;
export const FEED_COST = 0;

export const POOP_GENERATION_INTERVAL = 120; // seconds
export const POOP_CLEANLINESS_PENALTY = 3.0;

// ==============================================================================
// FISH RARITY & VALUES
// ==============================================================================

export const RARITY_WEIGHTS = {
  common: 60,
  uncommon: 25,
  rare: 12,
  legendary: 3,
};

export const RARITY_COIN_VALUES = {
  common: 5,
  uncommon: 15,
  rare: 40,
  legendary: 100,
};

export const RARITY_SPEED = {
  common: 8.0,
  uncommon: 5.0,
  rare: 3.0,
  legendary: 1.5,
};

// ==============================================================================
// FISHING PROBABILITIES
// ==============================================================================

export const CATCH_FISH_CHANCE = 0.85;
export const CATCH_JUNK_CHANCE = 0.10;
export const CATCH_COSMETIC_CHANCE = 0.05;

export const FISH_SPECIES = [
  'Angelfish',
  'Clownfish',
  'Seahorse',
  'Dolphin',
  'Evilfish',
];

export const JUNK_ITEMS = [
  'Old Boot',
  'Empty Can',
  'Seaweed Clump',
  'Rusty Anchor',
  'Broken Shell',
];

export const CATCHABLE_COSMETICS = [
  'hat_fishing',
  'effect_lucky',
];

// ==============================================================================
// SHOP ITEMS
// ==============================================================================

export const SHOP_ITEMS = {
  // Hats
  top_hat: {
    name: 'Top Hat',
    category: 'hat',
    price: 50,
  },
  hat_party: {
    name: 'Party Hat',
    category: 'hat',
    price: 50,
  },
  hat_beanie: {
    name: 'Cozy Beanie',
    category: 'hat',
    price: 80,
  },
  hat_tophat: {
    name: 'Fancy Top Hat',
    category: 'hat',
    price: 120,
  },
  hat_crown: {
    name: 'Royal Crown',
    category: 'hat',
    price: 150,
  },
  hat_pirate: {
    name: 'Pirate Hat',
    category: 'hat',
    price: 100,
  },
  hat_wizard: {
    name: 'Wizard Hat',
    category: 'hat',
    price: 200,
  },
  hat_fishing: {
    name: 'Fishing Cap',
    category: 'hat',
    price: 0,
    catchOnly: true,
  },
  
  // Effects
  effect_bubbles: {
    name: 'Bubble Trail',
    category: 'effect',
    price: 100,
  },
  effect_sparkle: {
    name: 'Sparkle Aura',
    category: 'effect',
    price: 200,
  },
  effect_hearts: {
    name: 'Love Hearts',
    category: 'effect',
    price: 150,
  },
  effect_rainbow: {
    name: 'Rainbow Trail',
    category: 'effect',
    price: 250,
  },
  effect_lucky: {
    name: 'Lucky Clover',
    category: 'effect',
    price: 0,
    catchOnly: true,
  },
};

export const BONUS_COINS_ALL_COSMETICS = 50;

