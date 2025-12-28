import { METER_THRESHOLDS } from '../config/constants';
import '../styles/components/meters.css';

/**
 * Animated meter bar for hunger, cleanliness, and happiness
 */
export function MeterBar({ 
  value = 100, 
  label, 
  icon,
  showValue = true,
  size = 'md',
  className = ''
}) {
  // Clamp value between 0-100
  const clampedValue = Math.max(0, Math.min(100, value));
  
  // Determine color based on thresholds
  let colorClass = 'meter-good';
  if (clampedValue < METER_THRESHOLDS.warning) {
    colorClass = 'meter-danger';
  } else if (clampedValue < METER_THRESHOLDS.good) {
    colorClass = 'meter-warning';
  }
  
  return (
    <div className={`meter-bar meter-${size} ${className}`}>
      {(icon || label) && (
        <div className="meter-header">
          {icon && <span className="meter-icon">{icon}</span>}
          {label && <span className="meter-label">{label}</span>}
          {showValue && (
            <span className={`meter-value ${colorClass}`}>
              {Math.round(clampedValue)}%
            </span>
          )}
        </div>
      )}
      <div className="meter-track">
        <div 
          className={`meter-fill ${colorClass}`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Compact meter group for tank HUD
 */
export function TankMeters({ hunger, cleanliness }) {
  return (
    <div className="tank-meters">
      <MeterBar 
        value={hunger} 
        icon="🍞" 
        label="Hunger"
        size="sm"
      />
      <MeterBar 
        value={cleanliness} 
        icon="🧼" 
        label="Clean"
        size="sm"
      />
    </div>
  );
}

