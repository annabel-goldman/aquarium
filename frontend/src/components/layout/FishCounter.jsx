import '../../styles/components/fish-counter.css';

/**
 * FishCounter - Shows current fish count vs max capacity
 * Used on Tank and Lake pages
 * 
 * @param {number} current - Current number of fish
 * @param {number} max - Maximum capacity
 * @param {boolean} showFullTag - Show "FULL" tag when at capacity
 */
export function FishCounter({ current = 0, max = 10, showFullTag = true }) {
  const isFull = current >= max;
  
  return (
    <div className="fish-counter">
      <span className="fish-counter-text">
        🐠 {current}/{max}
      </span>
      {showFullTag && isFull && (
        <span className="fish-counter-full">FULL</span>
      )}
    </div>
  );
}

