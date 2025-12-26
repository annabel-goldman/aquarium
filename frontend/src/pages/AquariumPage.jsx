import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTanks } from '../hooks/useTanks';
import { useLogout } from '../hooks/useLogout';
import { TankPreview } from '../components/TankPreview';
import { CreateTankModal } from '../components/CreateTankModal';
import { Button } from '../components/ui';
import { PlusIcon } from '../components/icons';
import { LIMITS } from '../config/constants';
import '../styles/pages/aquarium.css';

export function AquariumPage({ username, onLogout }) {
  const navigate = useNavigate();
  const { tanks, loading, error, createTank, deleteTank } = useTanks();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const handleLogout = useLogout(onLogout);

  const handleEnterTank = (tankId) => {
    navigate(`/tanks/${tankId}`);
  };

  const handleCreateTank = async (name) => {
    const result = await createTank(name);
    return result;
  };

  const handleDeleteTank = async (tankId) => {
    await deleteTank(tankId);
  };

  if (loading) {
    return (
      <div className="fullscreen-center bg-ocean">
        <div className="text-xl text-white font-medium">Loading your aquariums...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fullscreen-center bg-ocean">
        <div className="text-xl text-red-100 font-medium">Error: {error}</div>
      </div>
    );
  }

  const canCreateTank = tanks.length < LIMITS.maxTanks;

  return (
    <div className="aquarium-page">
      {/* Header with user info - centered, avoiding buttons */}
      <div className="aquarium-header">
        <div className="aquarium-header-content">
          <div className="aquarium-title-wrapper">
            <div className="aquarium-title-group">
              <h1 className="aquarium-title">🐠 My Aquariums</h1>
              <span className="status-badge">
                {tanks.length} / {LIMITS.maxTanks} tanks
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Logout button - bottom right corner */}
      {onLogout && (
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      )}

      {/* Main Content */}
      <div className="aquarium-content">
        <div className="aquarium-content-inner">
          {/* Tanks Grid */}
          {tanks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🐠</div>
              <h2 className="empty-state-title">No tanks yet</h2>
              <p className="empty-state-text">Create your first aquarium and start adding fish!</p>
              <Button 
                onClick={() => setIsCreateModalOpen(true)} 
                variant="primary"
                size="lg"
              >
                <PlusIcon className="w-5 h-5 inline mr-2" />
                Create Your First Tank
              </Button>
            </div>
          ) : (
            <>
              <div className="tanks-grid">
                {tanks.map((tank) => (
                  <TankPreview
                    key={tank.id}
                    tank={tank}
                    onEnter={handleEnterTank}
                    onDelete={handleDeleteTank}
                  />
                ))}
              </div>

              {/* Floating Add Button */}
              {canCreateTank && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  floating={true}
                  title="Add New Tank"
                >
                  <PlusIcon />
                </Button>
              )}

              {!canCreateTank && (
                <div className="max-tanks-message">
                  <div className="max-tanks-badge">
                    Maximum of {LIMITS.maxTanks} tanks reached. Delete a tank to create a new one.
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Tank Modal */}
      <CreateTankModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTank}
        currentTankCount={tanks.length}
      />
    </div>
  );
}
