import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import '../styles/components/logout-button.css';

/**
 * LogoutButton - Appears on all pages in top right corner
 */
export function LogoutButton() {
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
    <button 
      className="logout-btn"
      onClick={handleLogout}
      title="Log out"
    >
      Log out
    </button>
  );
}

