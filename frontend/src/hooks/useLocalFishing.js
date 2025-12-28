/**
 * Local Fishing Hook (for unauthenticated users)
 * 
 * Replicates backend fishing logic locally
 */

import { useCallback } from 'react';
import {
  RARITY_WEIGHTS,
  RARITY_SPEED,
  CATCH_FISH_CHANCE,
  CATCH_JUNK_CHANCE,
  CATCH_COSMETIC_CHANCE,
  FISH_SPECIES,
  JUNK_ITEMS,
  CATCHABLE_COSMETICS,
  BONUS_COINS_ALL_COSMETICS,
  RARITY_COIN_VALUES,
} from '../config/gameBalance';

const generateId = () => crypto.randomUUID();

/**
 * Pick a random item from array
 */
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Weighted random selection
 */
const weightedRandom = (weights) => {
  const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * total;
  
  for (const [key, weight] of Object.entries(weights)) {
    random -= weight;
    if (random <= 0) return key;
  }
  
  return Object.keys(weights)[0];
};

/**
 * Generate fishing spawns (silhouettes in the lake)
 */
export function useLocalFishing() {
  /**
   * Generate new fish spawns
   */
  const generateSpawns = useCallback(() => {
    const numSpawns = Math.floor(Math.random() * 4) + 3; // 3-6 spawns to match backend
    const newSpawns = [];

    for (let i = 0; i < numSpawns; i++) {
      const rarity = weightedRandom(RARITY_WEIGHTS);
      const species = randomChoice(FISH_SPECIES);
      const size = randomChoice(['sm', 'md', 'lg']);
      const speed = RARITY_SPEED[rarity] || 5.0;
      const direction = Math.random() > 0.5 ? 1 : -1;
      
      newSpawns.push({
        id: generateId(),
        species,
        size,
        rarity,
        speed,
        direction,
        y: Math.random() * 0.6 + 0.2, // 20-80% down to match backend
        // x is not used in animation, but include it for consistency
        x: Math.random() * 0.8 + 0.1, // 10-90%
      });
    }

    return newSpawns;
  }, []);

  /**
   * Attempt to catch a fish
   * Returns: { resultType, fish?, junkItem?, coinValue?, message? }
   */
  const attemptCatch = useCallback((spawnId, spawnData) => {
    const random = Math.random();

    // Determine what was caught
    if (random < CATCH_FISH_CHANCE) {
      // Caught a fish!
      const fish = {
        id: generateId(),
        species: spawnData.species,
        size: spawnData.size,
        rarity: spawnData.rarity,
        name: `${spawnData.species}`,
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
        accessories: {},
        caughtAt: new Date().toISOString(),
      };

      return {
        resultType: 'fish',
        fish,
        coinValue: RARITY_COIN_VALUES[fish.rarity] || 5,
      };
    } else if (random < CATCH_FISH_CHANCE + CATCH_JUNK_CHANCE) {
      // Caught junk
      return {
        resultType: 'junk',
        junkItem: randomChoice(JUNK_ITEMS),
      };
    } else {
      // Caught a cosmetic (or bonus coins if already owned)
      const cosmetic = randomChoice(CATCHABLE_COSMETICS);
      
      return {
        resultType: 'cosmetic',
        itemId: cosmetic,
        message: `You found a rare accessory!`,
      };
    }
  }, []);

  return {
    generateSpawns,
    attemptCatch,
  };
}

