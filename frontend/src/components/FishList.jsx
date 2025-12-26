import { Button } from './ui';
import { TrashIcon } from './icons';
import '../styles/components/fish-list.css';

/**
 * FishList with delete functionality
 */
export function FishList({ fish = [], onDeleteFish }) {
  if (fish.length === 0) {
    return (
      <div className="fish-list-empty">
        No fish yet. Click "Add Fish" to get started!
      </div>
    );
  }

  return (
    <div className="fish-list">
      <div className="fish-list-header">
        <h2 className="fish-list-title">
          Fish in Your Tank ({fish.length})
        </h2>
      </div>
      <div className="fish-list-items">
        {fish.map((f) => (
          <div key={f.id} className="fish-list-item">
            <div
              className="fish-color-dot"
              style={{ backgroundColor: f.color }}
              title={f.color}
            />
            <div className="fish-info">
              <div className="fish-name">{f.name}</div>
              <div className="fish-species">{f.species}</div>
            </div>
            <div className="fish-size">{f.size}</div>
            <Button
              onClick={() => onDeleteFish(f.id)}
              variant="danger"
              icon={true}
              title="Remove fish"
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
