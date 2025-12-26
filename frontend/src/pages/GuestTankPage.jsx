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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center relative">
            {/* Close button */}
            <button
              onClick={dismissWelcome}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <CloseIcon className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="text-6xl mb-4">🐠</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome to Aquarium!
            </h1>
            <p className="text-gray-600 mb-6">
              Create your own virtual aquarium with colorful fish.
            </p>

            {/* Instructions */}
            <div className="text-left bg-blue-50 rounded-xl p-4 mb-6 space-y-3">
              <div className="flex items-start gap-3">
                <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                <p className="text-gray-700">
                  <strong>Add fish</strong> by clicking the <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs">+</span> button
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                <p className="text-gray-700">
                  <strong>Choose species</strong>, name, color, and size for each fish
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                <p className="text-gray-700">
                  <strong>Create an account</strong> to save your fish permanently
                </p>
              </div>
            </div>

            {/* Note about guest mode */}
            <p className="text-sm text-gray-500 mb-6">
              🔒 Guest mode: Fish are saved in your browser. Log in to save them to your account.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
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
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                I already have an account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Button - fixed top left */}
      <button
        onClick={() => navigate('/login')}
        className="fixed top-8 left-8 bg-white hover:bg-gray-100 text-gray-800 px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40 font-medium flex items-center gap-2"
      >
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
                        onClick={() => handleDeleteFish(f.id)}
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
                className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700"
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
