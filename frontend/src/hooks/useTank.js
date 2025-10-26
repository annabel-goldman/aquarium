import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

/**
 * Hook for managing a specific tank by ID
 */
export function useTank(tankId) {
  const [tank, setTank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTank = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getTank(tankId);
      setTank(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tankId]);

  useEffect(() => {
    if (tankId) {
      fetchTank();
    }
  }, [tankId, fetchTank]);

  const addFish = async (fishData) => {
    try {
      const newFish = await api.addFish(tankId, fishData);
      
      // Optimistic update
      setTank(prev => ({
        ...prev,
        fish: [...prev.fish, newFish],
      }));
      
      return { success: true, fish: newFish };
    } catch (err) {
      await fetchTank();
      return { success: false, error: err.message };
    }
  };

  const deleteFish = async (fishId) => {
    try {
      await api.deleteFish(tankId, fishId);
      
      // Optimistic update
      setTank(prev => ({
        ...prev,
        fish: prev.fish.filter(f => f.id !== fishId),
      }));
      
      return { success: true };
    } catch (err) {
      await fetchTank();
      return { success: false, error: err.message };
    }
  };

  return {
    tank,
    loading,
    error,
    addFish,
    deleteFish,
    refresh: fetchTank,
  };
}

