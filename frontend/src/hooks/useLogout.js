import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook to handle logout with navigation
 * Avoids duplicating the logout logic across components
 */
export function useLogout(onLogout) {
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    if (!onLogout) return;
    
    const result = await onLogout();
    if (result.success) {
      navigate('/login');
    }
    return result;
  }, [onLogout, navigate]);

  return handleLogout;
}

