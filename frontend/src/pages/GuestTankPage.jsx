import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuestTank } from '../hooks/useGuestTank';
import { useFishAnimation } from '../hooks/useFishAnimation';
import { TankView } from '../components/TankView';
import { AddFishModal } from '../components/AddFishModal';
import { Button } from '../components/ui';
import { PlusIcon, CloseIcon, TrashIcon } from '../components/icons';
import { LIMITS } from '../config/constants';
import '../styles/pages/tank.css';
import '../styles/pages/guest-tank.css';
import '../styles/components/controls-panel.css';

const WELCOME_DISMISSED_KEY = 'aquarium_welcome_dismissed';

export function GuestTankPage() {
  const navigate = useNavigate();
  const { tank, loading, addFish, deleteFish } = useGuestTank();
  const animatedFish = useFishAnimation(tank?.fish || []);
  const [isAddFishModalOpen, setIsAddFishModalOpen] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [showNametags, setShowNametags] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const fish = tank?.fish || [];

  // Show welcome on first visit (if not dismissed)
  useEffect(() => {
    const dismissed = localStorage.getItem(WELCOME_DISMISSED_KEY);
    if (!dismissed) {
      setShowWelcome(true);
    }
  }, []);

  const dismissWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem(WELCOME_DISMISSED_KEY, 'true');
  };

  const handleDeleteFish = async (fishId) => {
    if (confirm('Remove this fish from your aquarium?')) {
      deleteFish(fishId);
    }
  };

  const handleAddFish = (fishData) => {
    return addFish(fishData);
  };

  const handleAddFirstFish = () => {
    dismissWelcome();
    setIsAddFishModalOpen(true);
  };

  if (loading) {
    return (
      <div className="tank-loading">
        <div className="tank-loading-text">Loading your tank...</div>
      </div>
    );
  }

  return (
    <div className="tank-page">
      <TankView fish={animatedFish} showNametags={showNametags} />

      {/* Welcome/Instructions Overlay */}
      {showWelcome && (
        <div className="guest-welcome-overlay">
          <div className="guest-welcome-modal">
            {/* Close button */}
            <button onClick={dismissWelcome} className="guest-welcome-close">
              <CloseIcon className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="guest-welcome-icon">🐠</div>
            <h1 className="guest-welcome-title">Welcome to Aquarium!</h1>
            <p className="guest-welcome-subtitle">
              Create your own virtual aquarium with colorful fish.
            </p>

            {/* Instructions */}
            <div className="guest-instructions">
              <div className="guest-instruction-item">
                <span className="guest-instruction-number">1</span>
                <p className="guest-instruction-text">
                  <strong>Add fish</strong> by clicking the <span className="guest-instruction-icon">+</span> button
                </p>
              </div>
              <div className="guest-instruction-item">
                <span className="guest-instruction-number">2</span>
                <p className="guest-instruction-text">
                  <strong>Choose species</strong>, name, color, and size for each fish
                </p>
              </div>
              <div className="guest-instruction-item">
                <span className="guest-instruction-number">3</span>
                <p className="guest-instruction-text">
                  <strong>Create an account</strong> to save your fish permanently
                </p>
              </div>
            </div>

            {/* Note about guest mode */}
            <p className="guest-mode-notice">
              🔒 Guest mode: Fish are saved in your browser. Log in to save them to your account.
            </p>

            {/* Action buttons */}
            <div className="guest-welcome-actions">
              <Button
                onClick={handleAddFirstFish}
                variant="primary"
                className="w-full text-lg py-3"
              >
                🐠 Add My First Fish
              </Button>
              <button
                onClick={() => {
                  dismissWelcome();
                  navigate('/login');
                }}
                className="guest-login-link"
              >
                I already have an account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Button - fixed top left */}
      <button onClick={() => navigate('/login')} className="guest-login-btn">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
        Login
      </button>

      {/* Floating Controls Button */}
      <Button
        onClick={() => setIsControlsOpen(true)}
        floating={true}
        title="Tank Controls"
      >
        <PlusIcon />
      </Button>

      {/* Controls Panel - Simplified */}
      {isControlsOpen && (
        <div className="controls-overlay" onClick={() => setIsControlsOpen(false)}>
          <div className="controls-panel" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="controls-header">
              <h2 className="controls-title">Guest Tank</h2>
              <button onClick={() => setIsControlsOpen(false)} className="controls-close-btn">
                <CloseIcon />
              </button>
            </div>

            {/* Body */}
            <div className="controls-body">
              {/* Add Fish Button */}
              <Button
                onClick={() => {
                  setIsAddFishModalOpen(true);
                  setIsControlsOpen(false);
                }}
                variant="primary"
                className="w-full text-lg py-3 mb-4"
              >
                + Add Fish
              </Button>

              {/* Nametags Toggle */}
              <button
                onClick={() => setShowNametags(!showNametags)}
                className={`toggle-btn ${showNametags ? 'toggle-btn-active' : 'toggle-btn-inactive'}`}
              >
                {showNametags ? '🏷️ Hide Nametags' : '🏷️ Show Nametags'}
              </button>

              {/* Fish Count */}
              <div className="guest-fish-count">
                {fish.length} / {LIMITS.maxFishPerTank} fish
              </div>

              {/* Simple Fish List */}
              {fish.length > 0 ? (
                <div className="guest-fish-list">
                  {fish.map((f) => (
                    <div key={f.id} className="guest-fish-item">
                      <div
                        className="guest-fish-color"
                        style={{ backgroundColor: f.color }}
                      />
                      <span className="guest-fish-name">{f.name}</span>
                      <span className="guest-fish-size">{f.size}</span>
                      <button
                        onClick={() => handleDeleteFish(f.id)}
                        className="guest-fish-delete"
                        title="Remove fish"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="guest-empty-list">No fish yet</div>
              )}

              {/* Create Account Button */}
              <Button
                onClick={() => navigate('/login')}
                variant="primary"
                className="w-full mt-4"
              >
                🔒 Save to Account
              </Button>

              {/* Show help again link */}
              <button
                onClick={() => {
                  setIsControlsOpen(false);
                  localStorage.removeItem(WELCOME_DISMISSED_KEY);
                  setShowWelcome(true);
                }}
                className="guest-show-help"
              >
                Show instructions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Fish Modal */}
      <AddFishModal
        isOpen={isAddFishModalOpen}
        onClose={() => setIsAddFishModalOpen(false)}
        onSubmit={handleAddFish}
        currentFishCount={fish.length}
      />
    </div>
  );
}
