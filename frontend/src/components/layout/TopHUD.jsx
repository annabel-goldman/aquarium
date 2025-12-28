import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import '../../styles/components/top-hud.css';

/**
 * TopHUD - Top of screen HUD with logout and coins
 * Reused across all authenticated pages
 */
export function TopHUD({ coins = 0 }) {
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

  return (
    <div className="top-hud">
      {/* Coin Display - Center */}
      <div className="coin-display">
        <img src="/sprites/tank-tools/coin.svg" alt="coins" className="coin-icon-img" />
        <span className="coin-amount">{coins}</span>
      </div>
      
      {/* Logout Button - Right */}
      <button 
        className="logout-btn"
        onClick={handleLogout}
        title="Log out"
      >
        Log out
      </button>
    </div>
  );
}

