import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTank } from '../hooks/useTank';
import { useFishAnimation } from '../hooks/useFishAnimation';
import { TankView } from '../components/TankView';
import { ControlsPanel } from '../components/ControlsPanel';
import { AddFishModal } from '../components/AddFishModal';
import { Button } from '../components/ui';
import { PlusIcon, ArrowLeftIcon } from '../components/icons';
import '../styles/pages/tank.css';

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
      <div className="tank-loading">
        <div className="tank-loading-text">Loading your tank...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tank-loading">
        <div className="tank-error-text">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="tank-page">
      <TankView fish={animatedFish} showNametags={showNametags} />

      {/* Back to Aquarium Button */}
      <Button
        onClick={() => navigate('/aquarium')}
        back={true}
        title="Back to Aquariums"
      >
        <ArrowLeftIcon />
      </Button>

      {/* Floating Controls Button */}
      <Button
        onClick={() => setIsControlsOpen(true)}
        floating={true}
        title="Tank Controls"
      >
        <PlusIcon />
      </Button>

      {/* Controls Panel */}
      <ControlsPanel
        isOpen={isControlsOpen}
        onClose={() => setIsControlsOpen(false)}
        onAddFish={() => {
          setIsAddFishModalOpen(true);
          setIsControlsOpen(false);
        }}
        onLogout={onLogout}
        tank={tank}
        username={username}
        showNametags={showNametags}
        onToggleNametags={() => setShowNametags(!showNametags)}
        onDeleteFish={handleDeleteFish}
      />

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
