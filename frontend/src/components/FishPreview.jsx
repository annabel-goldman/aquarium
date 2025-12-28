import { FishInPreview } from './FishRenderer';
import '../styles/components/fish-preview.css';

/**
 * FishPreview - Shows a fish with accessories for the closet
 * Uses FishInPreview from FishRenderer for consistent fish appearance
 */
export function FishPreview({ fish }) {
  return (
    <div className="fish-preview">
      <div className="preview-stage">
        {/* Fish with accessories - using shared renderer */}
        <div className="preview-fish">
          <FishInPreview fish={fish} size={160} />
        </div>
        
        {/* Fish name */}
        <div className="preview-name">
          <span className="name-text">{fish.name}</span>
          <span className="species-text">{fish.species}</span>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="preview-bubbles">
        <div className="bubble b1" />
        <div className="bubble b2" />
        <div className="bubble b3" />
      </div>
    </div>
  );
}
