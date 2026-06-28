import '../styles/components/water-background.css';
import { getIsLowPowerMode } from '../utils/performance';

/**
 * Shared water background with light rays and bubbles
 * Used on Lake, Tank, and Shop pages
 */
export function WaterBackground({ children, variant = 'default' }) {
  const isLowPower = getIsLowPowerMode();
  const rayCount = isLowPower ? 2 : 4;
  const bubbleCount = isLowPower ? 2 : 6;

  return (
    <div className={`water-bg water-bg--${variant}`}>
      {/* Surface shimmer */}
      <div className="water-surface" />
      
      {/* Light rays */}
      <div className="water-rays">
        {Array.from({ length: rayCount }, (_, i) => (
          <div key={i} className="water-ray" style={{ '--i': i }} />
        ))}
      </div>
      
      {/* Bubbles */}
      <div className="water-bubbles">
        {Array.from({ length: bubbleCount }, (_, index) => index + 1).map(i => (
          <div key={i} className="water-bubble" style={{ '--i': i }} />
        ))}
      </div>
      
      {/* Content */}
      <div className="water-content">
        {children}
      </div>
    </div>
  );
}
