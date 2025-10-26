import { useState, useEffect } from 'react';
import { api } from '../api/client';

/**
 * Aquarium hook with add and delete functionality
 */
export function useAquarium() {
  const [aquarium, setAquarium] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAquarium();
  }, []);

  const fetchAquarium = async () => {
    try {
      setLoading(true);
      const data = await api.getAquarium();
      setAquarium(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addFish = async (fishData) => {
    try {
      const newFish = await api.addFish(fishData);
      
      // Optimistic update
      setAquarium(prev => ({
        ...prev,
        fish: [...prev.fish, newFish],
      }));
      
      return { success: true, fish: newFish };
    } catch (err) {
      await fetchAquarium();
      return { success: false, error: err.message };
    }
  };

  const deleteFish = async (fishId) => {
    try {
      await api.deleteFish(fishId);
      
      // Optimistic update
      setAquarium(prev => ({
        ...prev,
        fish: prev.fish.filter(f => f.id !== fishId),
      }));
      
      return { success: true };
    } catch (err) {
      await fetchAquarium();
      return { success: false, error: err.message };
    }
  };

  return {
    aquarium,
    loading,
    error,
    addFish,
    deleteFish,
    refresh: fetchAquarium,
  };
}

