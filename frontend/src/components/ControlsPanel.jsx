import { CloseIcon, TrashIcon } from './icons';
import { RARITY_CONFIG } from '../config/constants';
import '../styles/components/controls-panel.css';

/**
 * ControlsPanel - Slide-out panel for tank settings and fish management
 */
export function ControlsPanel({
  isOpen,
  onClose,
  tank,
  username,
  showNametags,
  onToggleNametags,
  onDeleteFish,
}) {

  if (!isOpen) return null;

  const fish = tank?.fish || [];

  return (
    <div className="controls-overlay" onClick={onClose}>
      <div className="controls-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="controls-header">
          <div>
            <h2 className="controls-title">Settings</h2>
            {username && <p className="controls-username">@{username}</p>}
          </div>
          <button onClick={onClose} className="controls-close-btn">
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="controls-body">
          {/* Quick Actions */}
          <div className="controls-section">
            <h3 className="section-title">Display</h3>
            
            {/* Nametags Toggle */}
            <button
              onClick={onToggleNametags}
              className={`toggle-btn ${showNametags ? 'toggle-btn-active' : 'toggle-btn-inactive'}`}
            >
              {showNametags ? '🏷️ Hide Nametags' : '🏷️ Show Nametags'}
            </button>
          </div>

          {/* Fish List */}
          <div className="controls-section">
            <h3 className="section-title">
              Your Fish ({fish.length})
            </h3>
            
            {fish.length > 0 ? (
              <div className="fish-list">
                {fish.map((f) => {
                  const rarityConfig = RARITY_CONFIG[f.rarity] || RARITY_CONFIG.common;
                  return (
                    <div key={f.id} className="fish-list-item">
                      <div
                        className="fish-color-dot"
                        style={{ backgroundColor: f.color }}
                      />
                      <div className="fish-info">
                        <span className="fish-name">{f.name}</span>
                        <span 
                          className="fish-rarity"
                          style={{ color: rarityConfig.color }}
                        >
                          {rarityConfig.label}
                        </span>
                      </div>
                      <span className="fish-species">{f.species}</span>
                      <button
                        onClick={() => onDeleteFish(f.id)}
                        className="fish-delete-btn"
                        title="Release fish"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-fish-list">
                <p>No fish yet!</p>
                <p className="hint">Go fishing at the Lake 🎣</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
