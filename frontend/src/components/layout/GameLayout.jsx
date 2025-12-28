import { WaterBackground } from '../WaterBackground';
import { TopHUD } from './TopHUD';
import { BottomNav } from '../BottomNav';
import '../../styles/components/layout.css';

/**
 * GameLayout - Shared layout wrapper for all game pages
 * Provides consistent background, HUD, and navigation
 * 
 * @param {React.ReactNode} children - Page content
 * @param {number} coins - Coin count to display
 * @param {boolean} showNav - Whether to show bottom navigation (default: true)
 * @param {boolean} showBackground - Whether to show water background (default: true)
 * @param {string} className - Additional class for the content wrapper
 */
export function GameLayout({ 
  children, 
  coins = 0,
  showNav = true,
  showBackground = true,
  className = '',
}) {
  const content = (
    <div className={`game-layout-content ${className}`}>
      <TopHUD coins={coins} />
      {children}
      {showNav && <BottomNav />}
    </div>
  );

  if (showBackground) {
    return (
      <WaterBackground>
        {content}
      </WaterBackground>
    );
  }

  return content;
}

/**
 * TankLayout - Special layout for TankPage that doesn't add WaterBackground
 * (TankView already handles its own background)
 */
export function TankLayout({ children, coins = 0 }) {
  return (
    <div className="tank-layout">
      <TopHUD coins={coins} />
      {children}
      <BottomNav />
    </div>
  );
}

