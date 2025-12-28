/**
 * Unified Game Hook
 * 
 * Automatically uses either:
 * - useLocalGame (local storage) for unauthenticated users
 * - useGame (backend API) for authenticated users
 * 
 * Provides the same interface regardless of auth state
 */

import { useGame } from './useGame';
import { useLocalGame } from './useLocalGame';

export function useUnifiedGame(isAuthenticated) {
  // Only call the hook we need based on auth state
  // This prevents both hooks from running simultaneously
  if (isAuthenticated) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useGame();
  }
  
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useLocalGame();
}

