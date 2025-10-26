import { useState, useEffect } from 'react';
import { api } from '../api/client';

/**
 * Improved session hook - checks session without fetching aquarium
 * Prevents duplicate API calls
 */
export function useSession() {
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await api.getCurrentSession();
      if (response && response.username) {
        setUsername(response.username);
      } else {
        setUsername(null);
      }
    } catch (error) {
      setUsername(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await api.createSession(username, password);
      setUsername(response.username);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (username, password) => {
    try {
      const response = await api.registerSession(username, password);
      setUsername(response.username);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      setUsername(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return {
    username,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!username,
  };
}

