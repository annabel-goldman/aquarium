/**
 * Consolidated configuration for the aquarium app
 * All constants in one place to avoid duplication
 */

// Fish species list - used for dropdown and sprite mapping
export const FISH_SPECIES = [
  'Angelfish',
  'Clownfish',
  'Seahorse',
  'Dolphin',
  'Evilfish',
];

// Fish size configurations - consolidated from multiple components
export const FISH_SIZE_CONFIG = {
  sm: {
    scale: 0.1,        // SVG scale multiplier
    radius: 1,         // Fallback circle radius
    nametagOffset: 2,  // Distance above fish for nametag (in SVG units)
    speed: 0.004,      // Swimming speed
    tailSpeed: 8,      // Tail animation FPS
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
    speed: 0.002,
    tailSpeed: 5,
  },
};

// Species folder mapping for PNG sprites
export const SPECIES_SPRITE_MAP = {
  'Angelfish': 'angelfish',
  'Clownfish': 'clownfish',
  'Seahorse': 'seahorse',
  'Dolphin': 'dolphin',
  'Evilfish': 'evilfish',
};

// SVG sprite frame names (all species use the same structure)
export const SPRITE_FRAMES = {
  tail: ['tail-1', 'tail-2', 'tail-3', 'tail-4'],
};

// Animation boundaries (percentage of viewport)
export const TANK_BOUNDS = {
  minX: 0.08,
  maxX: 0.92,
  minY: 0.1,
  maxY: 0.9,
  targetPaddingX: 0.1,  // Padding for target generation
  targetPaddingY: 0.12,
};

// App limits - centralized to avoid magic numbers
export const LIMITS = {
  // Fish limits
  maxFishPerTank: 30,
  
  // Tank limits
  maxTanks: 6,
  tankNameMaxLength: 50,
  
  // User limits
  usernameMinLength: 3,
  usernameMaxLength: 20,
  passwordMinLength: 8,
  passwordMaxLength: 100,
  
  // Fish name limits
  fishNameMaxLength: 50,
};

// Default colors for fish customization
export const DEFAULT_COLORS = [
  '#ff8844', // Orange
  '#4488ff', // Blue
  '#ffcc44', // Yellow
  '#ff4488', // Pink
  '#44ff88', // Green
  '#8844ff', // Purple
];

// Size display names
export const SIZE_LABELS = {
  sm: 'Small',
  md: 'Medium',
  lg: 'Large',
};
