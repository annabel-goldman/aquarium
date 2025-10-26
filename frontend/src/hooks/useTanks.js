import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

/**
 * Hook for managing all tanks for the current user
 */
export function useTanks() {
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTanks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.listTanks();
      setTanks(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTanks();
  }, [fetchTanks]);

  const createTank = async (name) => {
    try {
      const newTank = await api.createTank(name);
      
      // Optimistic update - add tank summary to list
      setTanks(prev => [...prev, {
        id: newTank.id,
        name: newTank.name,
        fishCount: 0,
        createdAt: newTank.createdAt
      }]);
      
      return { success: true, tank: newTank };
    } catch (err) {
      await fetchTanks();
      return { success: false, error: err.message };
    }
  };

  const deleteTank = async (tankId) => {
    try {
      await api.deleteTank(tankId);
      
      // Optimistic update
      setTanks(prev => prev.filter(t => t.id !== tankId));
      
      return { success: true };
    } catch (err) {
      await fetchTanks();
      return { success: false, error: err.message };
    }
  };

  return {
    tanks,
    loading,
    error,
    createTank,
    deleteTank,
    refresh: fetchTanks,
  };
}

