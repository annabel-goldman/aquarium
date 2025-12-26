import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { getStoredGuestFish, clearStoredGuestFish } from './useGuestTank';

/**
 * Session hook with unified login/register flow
 * Automatically creates account if username doesn't exist
 * Syncs guest fish to account on login
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

  /**
   * Sync guest fish to the user's first tank
   */
  const syncGuestFish = async () => {
    const guestFish = getStoredGuestFish();
    
    if (guestFish.length === 0) {
      return { synced: 0 };
    }

    try {
      // Get user's tanks
      const tanks = await api.listTanks();
      
      if (tanks.length === 0) {
        console.warn('No tanks found to sync fish to');
        return { synced: 0 };
      }

      // Sync to the first tank
      const firstTankId = tanks[0].id;
      
      // Convert guest fish to the format expected by the API
      const fishToSync = guestFish.map(f => ({
        species: f.species,
        name: f.name,
        color: f.color,
        size: f.size,
      }));

      const result = await api.bulkAddFish(firstTankId, fishToSync);
      
      // Clear guest fish from localStorage
      clearStoredGuestFish();
      
      return { synced: result.added, skipped: result.skipped };
    } catch (error) {
      console.error('Failed to sync guest fish:', error);
      return { synced: 0, error: error.message };
    }
  };

  /**
   * Unified auth - logs in if account exists, creates account if it doesn't
   * Also syncs any guest fish after successful authentication
   * Returns { success, isNewUser, error }
   */
  const authenticate = async (usernameInput, password) => {
    try {
      const response = await api.authenticate(usernameInput, password);
      setUsername(response.username);
      
      // Sync guest fish in the background
      const guestFish = getStoredGuestFish();
      if (guestFish.length > 0) {
        // Don't await - let it happen in background
        syncGuestFish().catch(console.error);
      }
      
      return { 
        success: true, 
        isNewUser: response.is_new_user || false 
      };
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
    authenticate,
    logout,
    isAuthenticated: !!username,
  };
}
