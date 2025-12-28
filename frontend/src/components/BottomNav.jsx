import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/components/bottom-nav.css';

/**
 * BottomNav - Bottom navigation bar for game pages
 * Used across all authenticated pages (Lake, Tank, Closet, Shop)
 */
export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const tabs = [
    { id: 'lake', path: '/lake', icon: '🎣', label: 'Lake' },
    { id: 'tank', path: '/tank', icon: '🐠', label: 'Tank' },
    { id: 'closet', path: '/closet', icon: '👗', label: 'Closet' },
    { id: 'shop', path: '/shop', icon: '🛒', label: 'Shop' },
  ];
  
  const currentPath = location.pathname;
  
  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => navigate(tab.path)}
          className={`nav-btn ${currentPath === tab.path ? 'active' : ''}`}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
