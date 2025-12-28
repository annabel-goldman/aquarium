/**
 * ===============================================================================
 * FRONTEND CONFIGURATION - Cozy Aquarium Game
 * ===============================================================================
 * 
 * This file contains ALL tunable frontend parameters in one place.
 * Edit these values to adjust animations, UI behavior, and visual settings.
 * 
 * IMPORTANT: For game balance settings (rarity, coin values, shop prices),
 * see backend/app/game_config.py - those are server-controlled.
 * ===============================================================================
 */

// ==============================================================================
// FISH SPECIES & SPRITES
// Maps species names to sprite folder names
// ==============================================================================

export const FISH_SPECIES = [
  'Angelfish',
  'Clownfish',
  'Seahorse',
  'Dolphin',
  'Evilfish',
];

export const SPECIES_SPRITE_MAP = {
  'Angelfish': 'angelfish',
  'Clownfish': 'clownfish',
  'Seahorse': 'seahorse',
  'Dolphin': 'dolphin',
  'Evilfish': 'evilfish',
};


// ==============================================================================
// FISH SIZE CONFIGURATION
// Controls how different sized fish appear and behave in the tank
// ==============================================================================

export const FISH_SIZE_CONFIG = {
  sm: {
    scale: 0.1,              // Visual size multiplier (smaller = tinier fish)
    radius: 1,               // Collision/interaction radius
    nametagOffset: 2,        // How far above fish the nametag appears
    speed: 0.004,            // Swimming speed (HIGHER = faster movement)
    tailSpeed: 8,            // Tail animation speed (HIGHER = faster wiggle)
  },
  md: {
    scale: 0.16,
    radius: 1.6,
    nametagOffset: 2,
    speed: 0.003,
    tailSpeed: 6,
  },
  lg: {
    scale: 0.24,
    radius: 2.4,
    nametagOffset: 2,
    speed: 0.002,            // Larger fish swim slower
    tailSpeed: 5,
  },
};

export const SIZE_LABELS = {
  sm: 'Small',
  md: 'Medium',
  lg: 'Large',
};


// ==============================================================================
// FISH HEAD POSITIONS (for accessory placement)
// Coordinates are relative to 64x64 sprite center at (32, 32)
// x: horizontal offset (positive = toward face/right)
// y: vertical offset (positive = down)
// ==============================================================================

export const SPECIES_HEAD_POSITIONS = {
  'Angelfish': { x: 13, y: 0 },    // Standard fish shape
  'Clownfish': { x: 18, y: 0 },    // Wider face
  'Seahorse': { x: 8, y: -12 },    // Vertical fish, head at top
  'Dolphin': { x: 21, y: -2 },     // Long snout
  'Evilfish': { x: 23, y: 0 },     // Pointy face
};

export const SPRITE_FRAMES = {
  tail: ['tail-1', 'tail-2', 'tail-3', 'tail-4'],
};


// ==============================================================================
// ACCESSORY RENDERING CONFIGURATION
// Defines how each accessory appears on fish (position, size, sprite)
// 
// TO ADD A NEW ACCESSORY:
// 1. Add sprite SVG to: frontend/public/sprites/accessories/
// 2. Add entry below with rendering config
// 3. Add to backend SHOP_ITEMS in: backend/app/game_config.py
// ==============================================================================

// Default rendering values for each accessory slot
// Used when an accessory doesn't have custom config
const ACCESSORY_DEFAULTS = {
  hat: {
    offset: { x: 0, y: -10 },      // Sits on top of head
    size: 0.35,                     // 35% of fish size
    rotation: -5,                   // Slight tilt
  },
  effect: {
    offset: { x: 0, y: 0 },        // Centered on fish
    size: 0.5,
    rotation: 0,
  },
};

// Accessory rendering configurations
// Only needs entries for accessories that DIFFER from defaults
export const ACCESSORY_CONFIG = {
  // ===== HATS =====
  top_hat: {
    id: 'top_hat',
    name: 'Top Hat',
    slot: 'hat',
    sprite: '/sprites/accessories/top-hat.svg',
    offset: { x: 0, y: -10 },
    size: 0.35,
    rotation: -5,
  },
  hat_party: {
    id: 'hat_party',
    name: 'Party Hat',
    slot: 'hat',
    sprite: '/sprites/accessories/party-hat.svg',
    offset: { x: 0, y: -12 },
    size: 0.35,
    rotation: 10,                   // Tilts the other way
  },
  hat_crown: {
    id: 'hat_crown',
    name: 'Royal Crown',
    slot: 'hat',
    sprite: '/sprites/accessories/crown.svg',
    offset: { x: 0, y: -8 },
    size: 0.4,
    rotation: 0,
  },
  hat_pirate: {
    id: 'hat_pirate',
    name: 'Pirate Hat',
    slot: 'hat',
    sprite: '/sprites/accessories/pirate-hat.svg',
    offset: { x: 0, y: -10 },
    size: 0.45,
    rotation: -8,
  },
  hat_wizard: {
    id: 'hat_wizard',
    name: 'Wizard Hat',
    slot: 'hat',
    sprite: '/sprites/accessories/wizard-hat.svg',
    offset: { x: 0, y: -14 },
    size: 0.5,
    rotation: 5,
  },
  hat_beanie: {
    id: 'hat_beanie',
    name: 'Cozy Beanie',
    slot: 'hat',
    sprite: '/sprites/accessories/beanie.svg',
    offset: { x: 0, y: -12 },
    size: 0.35,
    rotation: 0,
  },
  hat_fishing: {
    id: 'hat_fishing',
    name: 'Fishing Cap',
    slot: 'hat',
    sprite: '/sprites/accessories/fishing-cap.svg',
    offset: { x: 2, y: -8 },
    size: 0.35,
    rotation: -3,
  },
  hat_tophat: {
    id: 'hat_tophat',
    name: 'Fancy Top Hat',
    slot: 'hat',
    sprite: '/sprites/accessories/fancy-tophat.svg',
    offset: { x: 0, y: -12 },
    size: 0.4,
    rotation: -3,
  },
  
  // ===== EFFECTS =====
  // Effects render as overlays around the fish
  effect_bubbles: {
    id: 'effect_bubbles',
    name: 'Bubble Trail',
    slot: 'effect',
    sprite: '/sprites/accessories/effect-bubbles.svg',
    offset: { x: -15, y: 0 },      // Behind the fish
    size: 0.6,
    rotation: 0,
  },
  effect_sparkle: {
    id: 'effect_sparkle',
    name: 'Sparkle Aura',
    slot: 'effect',
    sprite: '/sprites/accessories/effect-sparkle.svg',
    offset: { x: 0, y: -8 },       // Above the fish
    size: 0.7,
    rotation: 0,
  },
  effect_hearts: {
    id: 'effect_hearts',
    name: 'Love Hearts',
    slot: 'effect',
    sprite: '/sprites/accessories/effect-hearts.svg',
    offset: { x: 0, y: -10 },      // Floating above
    size: 0.5,
    rotation: 0,
  },
  effect_rainbow: {
    id: 'effect_rainbow',
    name: 'Rainbow Trail',
    slot: 'effect',
    sprite: '/sprites/accessories/effect-rainbow.svg',
    offset: { x: -20, y: 0 },      // Trail behind
    size: 0.8,
    rotation: 0,
  },
  effect_lucky: {
    id: 'effect_lucky',
    name: 'Lucky Clover',
    slot: 'effect',
    sprite: '/sprites/accessories/effect-lucky.svg',
    offset: { x: 5, y: -12 },      // Above and slightly forward
    size: 0.35,
    rotation: 15,
  },
};

/**
 * Get accessory config by ID with defaults applied
 * Returns null if accessory doesn't exist
 */
export function getAccessoryConfig(accessoryId) {
  const config = ACCESSORY_CONFIG[accessoryId];
  if (!config) return null;
  
  // Apply slot-specific defaults
  const defaults = ACCESSORY_DEFAULTS[config.slot] || ACCESSORY_DEFAULTS.hat;
  
  return {
    ...defaults,
    ...config,
    offset: config.offset || defaults.offset,
  };
}

/**
 * Get all accessories that have rendering configs
 */
export function getAllAccessories() {
  return Object.values(ACCESSORY_CONFIG);
}

/**
 * Check if an accessory has a sprite file configured
 */
export function hasAccessorySprite(accessoryId) {
  return ACCESSORY_CONFIG[accessoryId]?.sprite != null;
}

/**
 * Get accessories formatted for the shop display
 * Returns items that have sprites and are not effect-only placeholders
 * Note: Actual prices come from the backend - these are display defaults
 */
export function getShopAccessories() {
  return Object.values(ACCESSORY_CONFIG)
    .filter(acc => acc.sprite && acc.slot !== 'effect') // Effects not fully implemented yet
    .map(acc => ({
      id: acc.id,
      name: acc.name,
      slot: acc.slot,
      sprite: acc.sprite,
      price: 50, // Default price - actual price comes from backend when buying
      description: `A ${acc.slot} for your fish`,
    }));
}


// ==============================================================================
// TANK BOUNDS
// Defines the swimming area for fish (as percentage of tank: 0.0 to 1.0)
// ==============================================================================

export const TANK_BOUNDS = {
  minX: 0.08,                // Left edge padding
  maxX: 0.92,                // Right edge padding
  minY: 0.1,                 // Top edge padding
  maxY: 0.9,                 // Bottom edge padding
  targetPaddingX: 0.1,       // Extra padding when chasing food
  targetPaddingY: 0.12,
};


// ==============================================================================
// GAME TICK CONFIGURATION
// Controls how often the game syncs with backend
// ==============================================================================

export const GAME_CONFIG = {
  // How often to send tick updates to the server (milliseconds)
  // The backend calculates time deltas, so this can be quite long
  // 
  // Why 60 seconds is fine:
  // - Hunger decays at 1% per minute, so 60s ticks are granular enough
  // - Poop spawns every 2 minutes per fish, so 60s catches it
  // - Time-based calculations use deltas, not tick count
  // - We also tick on: page focus, tab visibility, navigation
  //
  // HIGHER = less server load, better battery
  // LOWER = more responsive (but unnecessary)
  tickIntervalMs: 60000,     // Every 60 seconds
  
  // Minimum time between ticks to prevent spam
  tickDebounceMs: 10000,     // At most once per 10 seconds
  
  // These mirror backend values for UI calculations
  hungerDecayPerMinute: 1.0, // Matches backend HUNGER_DECAY_PER_MINUTE
  feedRestore: 25.0,         // Matches backend HUNGER_FEED_RESTORE
  feedCost: 0,               // Matches backend FEED_COST
  poopPenalty: 3.0,          // Matches backend POOP_CLEANLINESS_PENALTY
  
  // Starting values (for UI display before server responds)
  startingMaxFish: 10,       // Matches backend STARTING_MAX_FISH
  startingCoins: 100,        // Matches backend STARTING_COINS
};


// ==============================================================================
// RARITY CONFIGURATION
// Visual styling for each rarity tier (colors, labels)
// Coin values here are for DISPLAY - actual values come from backend
// ==============================================================================

export const RARITY_CONFIG = {
  common: {
    label: 'Common',
    color: '#9CA3AF',        // Gray text
    bgColor: '#F3F4F6',      // Light gray background
    coinValue: 5,            // Display value (actual from backend)
  },
  uncommon: {
    label: 'Uncommon',
    color: '#10B981',        // Green
    bgColor: '#D1FAE5',
    coinValue: 15,
  },
  rare: {
    label: 'Rare',
    color: '#3B82F6',        // Blue
    bgColor: '#DBEAFE',
    coinValue: 40,
  },
  legendary: {
    label: 'Legendary',
    color: '#F59E0B',        // Gold
    bgColor: '#FEF3C7',
    coinValue: 100,
  },
};


// ==============================================================================
// FISHING CONFIGURATION (Lake Page)
// Controls the fishing minigame UI behavior
// ==============================================================================

export const FISHING_CONFIG = {
  // Fish silhouette spawning
  spawnRefreshMs: 6000,          // How often new fish spawn (milliseconds)
                                  // HIGHER = fish feel more scarce
                                  // LOWER = constant action
  
  silhouetteCount: { 
    min: 3,                       // Minimum fish on screen
    max: 6,                       // Maximum fish on screen
  },
  
  catchAnimationMs: 800,          // Duration of catch animation (milliseconds)
};


// ==============================================================================
// FLOATING COIN CONFIGURATION (Lake Page)
// Controls the bonus coins that float around the lake
// ==============================================================================

export const COIN_CONFIG = {
  // Spawning
  initialCoins: 3,               // How many coins spawn when page loads
  spawnIntervalMs: 3000,         // Milliseconds between spawn attempts
                                  // LOWER = more coins spawning
  
  spawnChance: 0.7,              // Probability (0-1) of spawning each interval
                                  // HIGHER = more consistent coins
                                  // LOWER = more random/sparse
  
  lifetimeMs: 10000,             // How long coins stay before disappearing (ms)
                                  // HIGHER = easier to collect
                                  // LOWER = more urgency to grab them
  
  // Values
  normalValue: 1,                // Regular coin worth
  bonusValue: 5,                 // Rare bonus coin worth
  bonusChance: 0.1,              // Chance (0-1) for bonus coin
                                  // HIGHER = more 5-coin drops
};


// ==============================================================================
// UI INPUT LIMITS
// Validation constraints for user input fields
// ==============================================================================

export const LIMITS = {
  usernameMinLength: 3,
  usernameMaxLength: 20,
  passwordMinLength: 8,
  passwordMaxLength: 100,
  fishNameMaxLength: 50,
  maxFishPerTank: 10,            // Used for guest mode / display limits
};


// ==============================================================================
// COLOR PALETTE
// Default colors available when creating fish (guest mode)
// ==============================================================================

export const DEFAULT_COLORS = [
  '#ff8844',  // Orange
  '#4488ff',  // Blue  
  '#ffcc44',  // Yellow
  '#ff4488',  // Pink
  '#44ff88',  // Green
  '#8844ff',  // Purple
];


// ==============================================================================
// METER THRESHOLDS
// Controls when hunger/cleanliness meters change color
// ==============================================================================

export const METER_THRESHOLDS = {
  good: 70,        // Above this = GREEN (healthy)
  warning: 40,     // Above this = YELLOW (needs attention)
  danger: 0,       // Below warning = RED (critical!)
};
