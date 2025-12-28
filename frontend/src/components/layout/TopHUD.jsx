import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import '../../styles/components/top-hud.css';

/**
 * TopHUD - Top of screen HUD with login/logout and coins
 * Reused across all pages (works for both auth and unauth)
 */
export function TopHUD({ coins = 0, isAuthenticated = false }) {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    navigate('/login');
    window.location.reload();
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="top-hud">
      {/* Coin Display - Center */}
      <div className="coin-display">
        <img src="/sprites/tank-tools/coin.svg" alt="coins" className="coin-icon-img" />
        <span className="coin-amount">{coins}</span>
      </div>
      
      {/* Login/Logout Button - Right */}
      {isAuthenticated ? (
        <button 
          className="logout-btn"
          onClick={handleLogout}
          title="Log out"
        >
          Log out
        </button>
      ) : (
        <button 
          className="logout-btn login-btn"
          onClick={handleLogin}
          title="Log in to save your progress"
        >
          🔒 Log in
        </button>
      )}
    </div>
  );
}

