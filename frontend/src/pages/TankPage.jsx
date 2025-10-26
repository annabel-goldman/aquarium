import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTank } from '../hooks/useTank';
import { useFishAnimation } from '../hooks/useFishAnimation';
import { TankView } from '../components/TankView';
import { FishList } from '../components/FishList';
import { AddFishModal } from '../components/AddFishModal';

export function TankPage({ username, onLogout }) {
  const { tankId } = useParams();
  const navigate = useNavigate();
  const { tank, loading, error, addFish, deleteFish } = useTank(tankId);
  const animatedFish = useFishAnimation(tank?.fish || []);
  const [isAddFishModalOpen, setIsAddFishModalOpen] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [showNametags, setShowNametags] = useState(false);

  const handleDeleteFish = async (fishId) => {
    if (confirm('Remove this fish from your aquarium?')) {
      await deleteFish(fishId);
    }
  };

  if (loading) {
    return (
      <div className="fullscreen-tank flex items-center justify-center">
        <div className="text-xl text-white">Loading your tank...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fullscreen-tank flex items-center justify-center">
        <div className="text-xl text-red-200">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="fullscreen-tank">
      <TankView fish={animatedFish} showNametags={showNametags} />

      {/* Back to Aquarium Button */}
      <button
        onClick={() => navigate('/aquarium')}
        className="back-button"
        title="Back to Aquariums"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      {/* Floating Button */}
      <button
        onClick={() => setIsControlsOpen(true)}
        className="floating-button"
        title="Tank Controls"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      {/* Controls Panel */}
      {isControlsOpen && (
        <div className="controls-overlay" onClick={() => setIsControlsOpen(false)}>
          <div className="controls-panel" onClick={(e) => e.stopPropagation()}>
            <div className="controls-header">
              <h2 className="text-xl font-bold text-gray-800">Tank Controls</h2>
              <button
                onClick={() => setIsControlsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="controls-content">
              <button
                onClick={() => {
                  setIsAddFishModalOpen(true);
                  setIsControlsOpen(false);
                }}
                className="btn-primary w-full text-lg py-3 mb-4"
              >
                + Add Fish
              </button>

              <button
                onClick={() => setShowNametags(!showNametags)}
                className={`w-full text-lg py-3 mb-4 rounded-lg font-medium transition-colors ${
                  showNametags
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {showNametags ? '🏷️ Hide Nametags' : '🏷️ Show Nametags'}
              </button>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600">Tank Name</div>
                <div className="text-lg font-semibold text-gray-800">{tank?.name || 'My Tank'}</div>
                <div className="text-sm text-gray-600 mt-2">Owner</div>
                <div className="text-lg font-semibold text-gray-800">{username}</div>
                <div className="text-sm text-gray-600 mt-2">Fish Count</div>
                <div className="text-2xl font-bold text-blue-600">{tank?.fish?.length || 0}</div>
              </div>

              <FishList fish={tank?.fish || []} onDeleteFish={handleDeleteFish} />

              <button
                onClick={() => navigate('/aquarium')}
                className="btn-secondary w-full mt-4"
              >
                ← Back to Aquariums
              </button>

              {onLogout && (
                <button
                  onClick={async () => {
                    const result = await onLogout();
                    if (result.success) {
                      navigate('/login');
                    }
                  }}
                  className="btn-secondary w-full mt-2"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Fish Modal */}
      <AddFishModal
        isOpen={isAddFishModalOpen}
        onClose={() => setIsAddFishModalOpen(false)}
        onSubmit={addFish}
        currentFishCount={tank?.fish?.length || 0}
      />
    </div>
  );
}

