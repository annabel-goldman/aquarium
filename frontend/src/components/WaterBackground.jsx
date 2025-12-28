import '../styles/components/water-background.css';

/**
 * Shared water background with light rays and bubbles
 * Used on Lake, Tank, and Shop pages
 */
export function WaterBackground({ children, variant = 'default' }) {
  return (
    <div className={`water-bg water-bg--${variant}`}>
      {/* Surface shimmer */}
      <div className="water-surface" />
      
      {/* Light rays */}
      <div className="water-rays">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="water-ray" style={{ '--i': i }} />
        ))}
      </div>
      
      {/* Bubbles */}
      <div className="water-bubbles">
        {[1, 2, 3, 4, 5, 6].map(i => (
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

