import { useState, useEffect, useCallback, useRef } from 'react';
import { GAME_CONFIG } from '../config/constants';
import {
  STARTING_COINS,
  STARTING_MAX_FISH,
  STARTING_HUNGER,
  STARTING_CLEANLINESS,
  HUNGER_DECAY_PER_MINUTE,
  HUNGER_FEED_RESTORE,
  FEED_COST,
  POOP_GENERATION_INTERVAL,
  POOP_CLEANLINESS_PENALTY,
  RARITY_COIN_VALUES,
  SHOP_ITEMS,
} from '../config/gameBalance';

const LOCAL_GAME_KEY = 'aquarium_local_game_state';

// Generate UUID using browser's built-in crypto API
const generateId = () => crypto.randomUUID();

/**
 * Get current timestamp in ISO format
 */
const now = () => new Date().toISOString();

/**
 * Calculate happiness from hunger and cleanliness
 */
const calculateHappiness = (hunger, cleanliness) => {
  return (hunger + cleanliness) / 2;
};

/**
 * Get default game state for a new user
 */
const getDefaultGameState = () => ({
  gameState: {
    coins: STARTING_COINS,
    maxFish: STARTING_MAX_FISH,
    lastActiveAt: now(),
    ownedAccessories: [],
  },
  tank: {
    id: 'local-tank',
    name: 'My Aquarium',
    hunger: STARTING_HUNGER,
    cleanliness: STARTING_CLEANLINESS,
    poopPositions: [],
    lastPoopTime: now(),
    updatedAt: now(),
  },
  fish: [],
});

/**
 * Hook for managing game state in localStorage (for unauthenticated users)
 * Replicates backend game logic on the frontend
 */
export function useLocalGame() {
  const [gameState, setGameState] = useState(null);
  const [tank, setTank] = useState(null);
  const [fish, setFish] = useState([]);
  const [ownedAccessories, setOwnedAccessories] = useState([]);
  const [happiness, setHappiness] = useState(100);
  const [loading, setLoading] = useState(true);
  
  const tickIntervalRef = useRef(null);
  const lastTickRef = useRef(0);
  const isTickingRef = useRef(false);

  // Load game state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_GAME_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setGameState(data.gameState);
        setTank(data.tank);
        setFish(data.fish || []);
        setOwnedAccessories(data.gameState?.ownedAccessories || []);
        setHappiness(calculateHappiness(
          data.tank?.hunger || 100,
          data.tank?.cleanliness || 100
        ));
      } else {
        // Initialize with default state
        const defaultState = getDefaultGameState();
        setGameState(defaultState.gameState);
        setTank(defaultState.tank);
        setFish(defaultState.fish);
        setOwnedAccessories(defaultState.gameState.ownedAccessories);
        setHappiness(100);
        localStorage.setItem(LOCAL_GAME_KEY, JSON.stringify(defaultState));
      }
    } catch (error) {
      console.error('Failed to load local game state:', error);
      const defaultState = getDefaultGameState();
      setGameState(defaultState.gameState);
      setTank(defaultState.tank);
      setFish(defaultState.fish);
      setOwnedAccessories(defaultState.gameState.ownedAccessories);
      setHappiness(100);
    }
    setLoading(false);
  }, []);

  // Save to localStorage whenever state changes
  const saveToLocalStorage = useCallback((updatedState) => {
    try {
      localStorage.setItem(LOCAL_GAME_KEY, JSON.stringify(updatedState));
    } catch (error) {
      console.error('Failed to save local game state:', error);
    }
  }, []);

  // Game tick - update hunger, poop (mimics backend logic)
  const gameTick = useCallback(() => {
    // Debounce: prevent ticks more frequent than tickDebounceMs
    const nowTime = Date.now();
    const timeSinceLastTick = nowTime - lastTickRef.current;
    
    if (timeSinceLastTick < GAME_CONFIG.tickDebounceMs) {
      return;
    }
    
    if (isTickingRef.current) {
      return;
    }
    
    isTickingRef.current = true;
    lastTickRef.current = nowTime;
    
    setTank(prevTank => {
      setGameState(prevGameState => {
        setFish(prevFish => {
          if (!prevTank || !prevGameState) {
            isTickingRef.current = false;
            return prevFish;
          }

          const nowISO = now();
          const lastActive = new Date(prevGameState.lastActiveAt);
          const secondsPassed = Math.min((Date.now() - lastActive.getTime()) / 1000, 300);
          const minutesPassed = secondsPassed / 60;

          // Hunger decay
          const hungerLoss = HUNGER_DECAY_PER_MINUTE * minutesPassed;
          const newHunger = Math.max(0, prevTank.hunger - hungerLoss);

          // Poop generation
          let newPoopPositions = [...prevTank.poopPositions];
          const lastPoop = new Date(prevTank.lastPoopTime);
          const poopSeconds = (Date.now() - lastPoop.getTime()) / 1000;

          if (prevFish.length > 0 && poopSeconds >= POOP_GENERATION_INTERVAL) {
            const poopsToAdd = Math.floor(poopSeconds / POOP_GENERATION_INTERVAL);
            for (let i = 0; i < Math.min(poopsToAdd, prevFish.length); i++) {
              newPoopPositions.push({
                id: generateId(),
                x: Math.random() * 0.8 + 0.1,
                y: Math.random() * 0.3 + 0.6,
                createdAt: nowISO,
              });
            }
          }

          // Cleanliness based on poop count
          const poopPenalty = newPoopPositions.length * POOP_CLEANLINESS_PENALTY;
          const newCleanliness = Math.max(0, 100 - poopPenalty);

          const newHappiness = calculateHappiness(newHunger, newCleanliness);

          const updatedTank = {
            ...prevTank,
            hunger: newHunger,
            cleanliness: newCleanliness,
            poopPositions: newPoopPositions,
            lastPoopTime: poopSeconds >= POOP_GENERATION_INTERVAL ? nowISO : prevTank.lastPoopTime,
            updatedAt: nowISO,
          };

          const updatedGameState = {
            ...prevGameState,
            lastActiveAt: nowISO,
          };

          setHappiness(newHappiness);
          setTank(updatedTank);
          setGameState(updatedGameState);

          // Save to localStorage
          saveToLocalStorage({
            gameState: updatedGameState,
            tank: updatedTank,
            fish: prevFish,
          });

          isTickingRef.current = false;
          return prevFish;
        });
        return prevGameState;
      });
      return prevTank;
    });
  }, [saveToLocalStorage]);

  // Start periodic game ticks
  useEffect(() => {
    if (!loading && gameState && tank) {
      // Initial tick after a short delay
      const initialTickTimer = setTimeout(gameTick, 1000);
      
      // Set up interval for periodic ticks
      tickIntervalRef.current = setInterval(gameTick, GAME_CONFIG.tickIntervalMs);
      
      // Tick when user returns to the tab
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          gameTick();
        }
      };
      
      // Tick when window regains focus
      const handleFocus = () => {
        gameTick();
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocus);
      
      return () => {
        clearTimeout(initialTickTimer);
        if (tickIntervalRef.current) {
          clearInterval(tickIntervalRef.current);
        }
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [loading, !!gameState, !!tank, gameTick]);

  // Feed the tank
  const feed = useCallback(async () => {
    if (!gameState || !tank) {
      return { success: false, error: 'Game not loaded' };
    }

    if (gameState.coins < FEED_COST) {
      return { success: false, error: 'Not enough coins to feed' };
    }

    const newHunger = Math.min(100, tank.hunger + HUNGER_FEED_RESTORE);
    const newCoins = gameState.coins - FEED_COST;
    const newHappiness = calculateHappiness(newHunger, tank.cleanliness);

    const updatedTank = { ...tank, hunger: newHunger };
    const updatedGameState = { ...gameState, coins: newCoins };

    setTank(updatedTank);
    setGameState(updatedGameState);
    setHappiness(newHappiness);

    saveToLocalStorage({
      gameState: updatedGameState,
      tank: updatedTank,
      fish,
    });

    return {
      success: true,
      newHunger,
      coinsSpent: FEED_COST,
      newCoins,
    };
  }, [gameState, tank, fish, saveToLocalStorage]);

  // Clean all poop
  const cleanAll = useCallback(async () => {
    if (!tank) {
      return { success: false, error: 'Game not loaded' };
    }

    const updatedTank = {
      ...tank,
      cleanliness: 100,
      poopPositions: [],
    };
    const newHappiness = calculateHappiness(tank.hunger, 100);

    setTank(updatedTank);
    setHappiness(newHappiness);

    saveToLocalStorage({
      gameState,
      tank: updatedTank,
      fish,
    });

    return {
      success: true,
      newCleanliness: 100,
    };
  }, [gameState, tank, fish, saveToLocalStorage]);

  // Clean single poop
  const cleanPoop = useCallback(async (poopId) => {
    if (!tank) {
      return { success: false, error: 'Game not loaded' };
    }

    const newPoopPositions = tank.poopPositions.filter(p => p.id !== poopId);
    const poopPenalty = newPoopPositions.length * POOP_CLEANLINESS_PENALTY;
    const newCleanliness = Math.max(0, 100 - poopPenalty);
    const newHappiness = calculateHappiness(tank.hunger, newCleanliness);

    const updatedTank = {
      ...tank,
      cleanliness: newCleanliness,
      poopPositions: newPoopPositions,
    };

    setTank(updatedTank);
    setHappiness(newHappiness);

    saveToLocalStorage({
      gameState,
      tank: updatedTank,
      fish,
    });

    return {
      success: true,
      newCleanliness,
    };
  }, [gameState, tank, fish, saveToLocalStorage]);

  // Release a fish (remove from tank, get coins)
  const releaseFish = useCallback(async (fishId) => {
    const fishToRelease = fish.find(f => f.id === fishId);
    if (!fishToRelease) {
      return { success: false, error: 'Fish not found' };
    }

    const coinValue = RARITY_COIN_VALUES[fishToRelease.rarity] || 5;
    const newFish = fish.filter(f => f.id !== fishId);
    const updatedGameState = {
      ...gameState,
      coins: gameState.coins + coinValue,
    };

    setFish(newFish);
    setGameState(updatedGameState);

    saveToLocalStorage({
      gameState: updatedGameState,
      tank,
      fish: newFish,
    });

    return { success: true, coinsEarned: coinValue };
  }, [fish, gameState, tank, saveToLocalStorage]);

  // Apply accessory to fish
  const applyAccessory = useCallback(async (fishId, slot, itemId) => {
    const updatedFish = fish.map(f => {
      if (f.id === fishId) {
        return {
          ...f,
          accessories: { ...f.accessories, [slot]: itemId }
        };
      }
      return f;
    });

    setFish(updatedFish);

    saveToLocalStorage({
      gameState,
      tank,
      fish: updatedFish,
    });

    return { success: true };
  }, [fish, gameState, tank, saveToLocalStorage]);

  // Add fish to tank
  const addFish = useCallback((newFish) => {
    const fishWithId = {
      ...newFish,
      id: newFish.id || generateId(),
      createdAt: newFish.createdAt || now(),
      accessories: newFish.accessories || {},
    };

    const updatedFish = [...fish, fishWithId];
    setFish(updatedFish);

    saveToLocalStorage({
      gameState,
      tank,
      fish: updatedFish,
    });

    return fishWithId;
  }, [fish, gameState, tank, saveToLocalStorage]);

  // Update coins
  const updateCoins = useCallback((newCoins) => {
    const updatedGameState = {
      ...gameState,
      coins: newCoins,
    };

    setGameState(updatedGameState);

    saveToLocalStorage({
      gameState: updatedGameState,
      tank,
      fish,
    });
  }, [gameState, tank, fish, saveToLocalStorage]);

  // Add coins (for collecting in lake)
  const addCoins = useCallback((amount) => {
    const newCoins = gameState.coins + amount;
    updateCoins(newCoins);
    return { success: true, newCoins };
  }, [gameState, updateCoins]);

  // Buy shop item
  const buyItem = useCallback((itemId) => {
    const item = SHOP_ITEMS[itemId];
    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    if (gameState.coins < item.price) {
      return { success: false, error: 'Not enough coins' };
    }

    if (ownedAccessories.includes(itemId)) {
      return { success: false, error: 'Already owned' };
    }

    const newOwnedAccessories = [...ownedAccessories, itemId];
    const updatedGameState = {
      ...gameState,
      coins: gameState.coins - item.price,
      ownedAccessories: newOwnedAccessories,
    };

    setGameState(updatedGameState);
    setOwnedAccessories(newOwnedAccessories);

    saveToLocalStorage({
      gameState: updatedGameState,
      tank,
      fish,
    });

    return { success: true, newCoins: updatedGameState.coins };
  }, [gameState, ownedAccessories, tank, fish, saveToLocalStorage]);

  // Add accessory to owned items (from fishing)
  const addOwnedAccessory = useCallback((itemId) => {
    if (ownedAccessories.includes(itemId)) {
      return { alreadyOwned: true };
    }

    const newOwnedAccessories = [...ownedAccessories, itemId];
    const updatedGameState = {
      ...gameState,
      ownedAccessories: newOwnedAccessories,
    };

    setGameState(updatedGameState);
    setOwnedAccessories(newOwnedAccessories);

    saveToLocalStorage({
      gameState: updatedGameState,
      tank,
      fish,
    });

    return { success: true };
  }, [gameState, ownedAccessories, tank, fish, saveToLocalStorage]);

  // Refresh (reload from localStorage)
  const refresh = useCallback(() => {
    try {
      const stored = localStorage.getItem(LOCAL_GAME_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setGameState(data.gameState);
        setTank(data.tank);
        setFish(data.fish || []);
        setOwnedAccessories(data.gameState?.ownedAccessories || []);
        setHappiness(calculateHappiness(
          data.tank?.hunger || 100,
          data.tank?.cleanliness || 100
        ));
      }
    } catch (error) {
      console.error('Failed to refresh local game state:', error);
    }
  }, []);

  return {
    // State
    gameState,
    tank,
    fish,
    ownedAccessories,
    happiness,
    loading,
    error: null,
    
    // Computed
    canFeed: gameState ? gameState.coins >= FEED_COST : false,
    hasPoop: tank ? tank.poopPositions.length > 0 : false,
    isTankFull: gameState ? fish.length >= gameState.maxFish : false,
    
    // Actions
    feed,
    cleanAll,
    cleanPoop,
    releaseFish,
    applyAccessory,
    addFish,
    updateCoins,
    addCoins,
    buyItem,
    addOwnedAccessory,
    refresh,
  };
}

/**
 * Get the current local game state from localStorage
 * (for use outside of React components, like during login migration)
 */
export function getLocalGameState() {
  try {
    const stored = localStorage.getItem(LOCAL_GAME_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Clear local game state from localStorage
 */
export function clearLocalGameState() {
  localStorage.removeItem(LOCAL_GAME_KEY);
}

