import { useNavigate } from 'react-router-dom';
import { Button } from './ui';
import { CloseIcon, TrashIcon } from './icons';
import { LIMITS } from '../config/constants';
import '../styles/components/controls-panel.css';

/**
 * ControlsPanel - Simplified slide-out panel for tank controls
 */
export function ControlsPanel({
  isOpen,
  onClose,
  onAddFish,
  onLogout,
  tank,
  showNametags,
  onToggleNametags,
  onDeleteFish,
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const fish = tank?.fish || [];

  return (
    <div className="controls-overlay" onClick={onClose}>
      <div className="controls-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="controls-header">
          <h2 className="controls-title">{tank?.name || 'My Tank'}</h2>
          <button onClick={onClose} className="controls-close-btn">
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="controls-body">
          {/* Add Fish Button */}
          <Button
            onClick={onAddFish}
            variant="primary"
            className="w-full text-lg py-3 mb-4"
          >
            + Add Fish
          </Button>

          {/* Nametags Toggle */}
          <button
            onClick={onToggleNametags}
            className={`toggle-btn ${showNametags ? 'toggle-btn-active' : 'toggle-btn-inactive'}`}
          >
            {showNametags ? '🏷️ Hide Nametags' : '🏷️ Show Nametags'}
          </button>

          {/* Fish Count */}
          <div className="text-sm text-gray-500 mb-4">
            {fish.length} / {LIMITS.maxFishPerTank} fish
          </div>

          {/* Simple Fish List */}
          {fish.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {fish.map((f) => (
                <div key={f.id} className="flex items-center gap-3 py-2 px-3 bg-gray-50 rounded-lg">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: f.color }}
                  />
                  <span className="flex-1 text-gray-800 truncate">{f.name}</span>
                  <span className="text-xs text-gray-400 uppercase">{f.size}</span>
                  <button
                    onClick={() => onDeleteFish(f.id)}
                    className="text-red-400 hover:text-red-600 p-1"
                    title="Remove fish"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-6">
              No fish yet
            </div>
          )}

          {/* Logout - only show if authenticated */}
          {onLogout && (
            <button
              onClick={async () => {
                const result = await onLogout();
                if (result.success) {
                  navigate('/login');
                }
              }}
              className="w-full mt-6 text-sm text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
