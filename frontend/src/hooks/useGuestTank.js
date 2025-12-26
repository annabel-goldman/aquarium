import { useState, useEffect, useCallback } from 'react';

const GUEST_FISH_KEY = 'aquarium_guest_fish';

// Generate UUID using browser's built-in crypto API
const generateId = () => crypto.randomUUID();

/**
 * Hook for managing guest (unauthenticated) fish in localStorage
 * Fish are stored locally until the user creates an account
 */
export function useGuestTank() {
  const [fish, setFish] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load fish from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(GUEST_FISH_KEY);
      if (stored) {
        setFish(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load guest fish:', error);
    }
    setLoading(false);
  }, []);

  // Save fish to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(GUEST_FISH_KEY, JSON.stringify(fish));
      } catch (error) {
        console.error('Failed to save guest fish:', error);
      }
    }
  }, [fish, loading]);

  const addFish = useCallback((fishData) => {
    const newFish = {
      id: generateId(),
      species: fishData.species,
      name: fishData.name,
      color: fishData.color,
      size: fishData.size,
      createdAt: new Date().toISOString(),
    };
    
    setFish(prev => [...prev, newFish]);
    return { success: true, fish: newFish };
  }, []);

  const deleteFish = useCallback((fishId) => {
    setFish(prev => prev.filter(f => f.id !== fishId));
    return { success: true };
  }, []);

  const clearAllFish = useCallback(() => {
    setFish([]);
    localStorage.removeItem(GUEST_FISH_KEY);
  }, []);

  const getGuestFish = useCallback(() => {
    return fish;
  }, [fish]);

  const hasGuestFish = fish.length > 0;

  return {
    tank: {
      id: 'guest',
      name: 'Guest Tank',
      fish,
    },
    loading,
    addFish,
    deleteFish,
    clearAllFish,
    getGuestFish,
    hasGuestFish,
  };
}

/**
 * Get guest fish from localStorage (for use outside of React components)
 */
export function getStoredGuestFish() {
  try {
    const stored = localStorage.getItem(GUEST_FISH_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Clear guest fish from localStorage
 */
export function clearStoredGuestFish() {
  localStorage.removeItem(GUEST_FISH_KEY);
}

