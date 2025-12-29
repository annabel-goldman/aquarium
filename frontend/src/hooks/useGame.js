import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api/client';
import { GAME_CONFIG } from '../config/constants';

/**
 * Central game state hook
 * Manages tank, fish, game progression, and periodic updates
 * 
 * NOTE: Tick interval is set to 60 seconds by default (configurable in constants.js)
 * The backend calculates time deltas, so infrequent ticks are fine.
 * This reduces server load significantly.
 */
export function useGame() {
  const [gameState, setGameState] = useState(null);
  const [tank, setTank] = useState(null);
  const [fish, setFish] = useState([]);
  const [ownedAccessories, setOwnedAccessories] = useState([]);
  const [happiness, setHappiness] = useState(100);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const tickIntervalRef = useRef(null);
  const lastTickRef = useRef(0);
  const isTickingRef = useRef(false);

  // Fetch full game state
  const fetchGameState = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getGameState();
      setGameState(data.gameState);
      setTank(data.tank);
      setFish(data.fish);
      setOwnedAccessories(data.ownedAccessories);
      setHappiness(data.happiness);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Game tick - update hunger, poop
  // Debounced to prevent excessive server calls
  const gameTick = useCallback(async () => {
    // Debounce: prevent ticks more frequent than tickDebounceMs
    const now = Date.now();
    const timeSinceLastTick = now - lastTickRef.current;
    
    if (timeSinceLastTick < GAME_CONFIG.tickDebounceMs) {
      return; // Skip this tick, too soon
    }
    
    // Prevent concurrent ticks
    if (isTickingRef.current) {
      return;
    }
    
    isTickingRef.current = true;
    lastTickRef.current = now;
    
    try {
      const data = await api.gameTick();
      
      // Update local state from tick response
      setTank(prev => ({
        ...prev,
        hunger: data.hunger,
        cleanliness: data.cleanliness,
        poopPositions: prev?.poopPositions || [], // Keep poop positions until explicit refresh
      }));
      
      setGameState(prev => ({
        ...prev,
        maxFish: data.maxFish,
        coins: data.coins,
      }));
      
      setHappiness(data.happiness);
    } catch (err) {
      console.error('Game tick error:', err);
    } finally {
      isTickingRef.current = false;
    }
  }, []);

  // Start periodic game ticks + visibility-based ticks
  useEffect(() => {
    if (!loading && gameState) {
      // Initial tick after a short delay
      const initialTickTimer = setTimeout(gameTick, 1000);
      
      // Set up interval for periodic ticks (every 60 seconds by default)
      tickIntervalRef.current = setInterval(gameTick, GAME_CONFIG.tickIntervalMs);
      
      // Tick when user returns to the tab (visibility change)
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
  }, [loading, !!gameState]); // Only depend on loading and whether gameState exists

  // Initial fetch
  useEffect(() => {
    fetchGameState();
    
    // Cleanup on unmount
    return () => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
    };
  }, [fetchGameState]);

  // Feed the tank
  const feed = useCallback(async () => {
    try {
      const data = await api.feed();
      
      // Update state
      setTank(prev => ({ ...prev, hunger: data.newHunger }));
      setGameState(prev => ({ ...prev, coins: data.newCoins }));
      
      // Recalculate happiness
      setHappiness((data.newHunger + (tank?.cleanliness || 100)) / 2);
      
      return { success: true, ...data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [tank?.cleanliness]);

  // Clean all poop
  const cleanAll = useCallback(async () => {
    try {
      const data = await api.cleanAll();
      
      setTank(prev => ({
        ...prev,
        cleanliness: data.newCleanliness,
        poopPositions: [],
      }));
      
      // Recalculate happiness
      setHappiness(((tank?.hunger || 100) + data.newCleanliness) / 2);
      
      return { success: true, ...data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [tank?.hunger]);

  // Clean single poop
  const cleanPoop = useCallback(async (poopId) => {
    try {
      const data = await api.cleanPoop(poopId);
      
      setTank(prev => ({
        ...prev,
        cleanliness: data.newCleanliness,
        poopPositions: prev.poopPositions.filter(p => p.id !== poopId),
      }));
      
      // Recalculate happiness
      setHappiness(((tank?.hunger || 100) + data.newCleanliness) / 2);
      
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [tank?.hunger]);

  // Release a fish
  const releaseFish = useCallback(async (fishId) => {
    try {
      await api.releaseFish(fishId);
      setFish(prev => prev.filter(f => f.id !== fishId));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Apply accessory to fish
  const applyAccessory = useCallback(async (fishId, slot, itemId) => {
    try {
      await api.applyAccessory(fishId, slot, itemId);
      
      // Update fish locally
      setFish(prev => prev.map(f => {
        if (f.id === fishId) {
          return {
            ...f,
            accessories: { ...f.accessories, [slot]: itemId }
          };
        }
        return f;
      }));
      
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Add fish (from fishing)
  const addFish = useCallback((newFish) => {
    setFish(prev => [...prev, newFish]);
  }, []);

  // Update coins (local only)
  const updateCoins = useCallback((newCoins) => {
    setGameState(prev => ({ ...prev, coins: newCoins }));
  }, []);

  // Add coins (e.g., from collecting in the lake)
  const addCoins = useCallback(async (amount) => {
    try {
      const result = await api.addCoins(amount);
      setGameState(prev => ({ ...prev, coins: result.newTotal }));
      return { success: true, newCoins: result.newTotal };
    } catch (err) {
      return { success: false, error: err.message };
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
    error,
    
    // Computed
    canFeed: (gameState?.coins || 0) >= GAME_CONFIG.feedCost,
    hasPoop: (tank?.poopPositions?.length || 0) > 0,
    isTankFull: fish.length >= (gameState?.maxFish || 10),
    
    // Actions
    feed,
    cleanAll,
    cleanPoop,
    releaseFish,
    applyAccessory,
    addFish,
    addCoins,
    updateCoins,
    refresh: fetchGameState,
  };
}
