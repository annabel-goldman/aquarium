import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTanks } from '../hooks/useTanks';
import { TankPreview } from '../components/TankPreview';
import { CreateTankModal } from '../components/CreateTankModal';

export function AquariumPage({ username, onLogout }) {
  const navigate = useNavigate();
  const { tanks, loading, error, createTank, deleteTank } = useTanks();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
        <div className="text-xl text-gray-700">Loading your aquariums...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  const canCreateTank = tanks.length < 6;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">My Aquariums</h1>
              <span className="text-lg font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {tanks.length} / 6
              </span>
            </div>
            {onLogout && (
              <button
                onClick={async () => {
                  const result = await onLogout();
                  if (result.success) {
                    navigate('/login');
                  }
                }}
                className="btn-secondary"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Add Tank Button */}
        <div className="mb-6">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary text-lg"
            disabled={!canCreateTank}
          >
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Tank
          </button>
          {!canCreateTank && (
            <p className="text-sm text-gray-600 mt-2">
              You've reached the maximum of 6 tanks. Delete a tank to create a new one.
            </p>
          )}
        </div>

        {/* Tanks Grid */}
        {tanks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🐠</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No tanks yet</h2>
            <p className="text-gray-600 mb-6">Create your first tank to get started!</p>
            <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary">
              Create Your First Tank
            </button>
          </div>
        ) : (
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
        )}
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

