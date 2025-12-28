import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { getLocalGameState, clearLocalGameState } from './useLocalGame';

/**
 * Session hook with unified login/register flow
 * Automatically creates account if username doesn't exist
 * Syncs local game state to account on login
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
   * Sync local game state to the user's account
   */
  const syncLocalGameState = async () => {
    const localState = getLocalGameState();
    
    if (!localState || (!localState.fish?.length && !localState.gameState?.ownedAccessories?.length)) {
      return { synced: 0 };
    }

    try {
      // Send full local game state to backend for migration
      const result = await api.migrateLocalGameState(localState);
      
      // Clear local game state from localStorage after successful migration
      clearLocalGameState();
      
      return result;
    } catch (error) {
      console.error('Failed to sync local game state:', error);
      return { synced: 0, error: error.message };
    }
  };

  /**
   * Unified auth - logs in if account exists, creates account if it doesn't
   * Also syncs any local game state after successful authentication
   * Returns { success, isNewUser, syncResult, error }
   */
  const authenticate = async (usernameInput, password) => {
    try {
      const response = await api.authenticate(usernameInput, password);
      setUsername(response.username);
      
      // Sync local game state
      const localState = getLocalGameState();
      let syncResult = null;
      
      if (localState) {
        try {
          syncResult = await syncLocalGameState();
        } catch (error) {
          console.error('Failed to sync local game state:', error);
          // Don't fail login if sync fails
        }
      }
      
      return { 
        success: true, 
        isNewUser: response.is_new_user || false,
        syncResult,
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
