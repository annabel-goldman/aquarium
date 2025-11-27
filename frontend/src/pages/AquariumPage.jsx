import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTanks } from '../hooks/useTanks';
import { TankPreview } from '../components/TankPreview';
import { CreateTankModal } from '../components/CreateTankModal';
import { Button } from '../components/ui';

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
      <div className="fixed inset-0 bg-gradient-to-b from-blue-400 via-blue-500 to-blue-700 flex items-center justify-center">
        <div className="text-xl text-white font-medium">Loading your aquariums...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-blue-400 via-blue-500 to-blue-700 flex items-center justify-center">
        <div className="text-xl text-red-100 font-medium">Error: {error}</div>
      </div>
    );
  }

  const canCreateTank = tanks.length < 6;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-blue-400 via-blue-500 to-blue-700 overflow-y-auto">
      {/* Header with user info - centered, avoiding buttons */}
      <div className="fixed top-0 left-0 right-0 z-30 pointer-events-none">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-center items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">🐠 My Aquariums</h1>
              <span className="text-base font-semibold text-white/90 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                {tanks.length} / 6 tanks
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Logout button - bottom right corner */}
      {onLogout && (
        <button
          onClick={async () => {
            const result = await onLogout();
            if (result.success) {
              navigate('/login');
            }
          }}
          className="fixed bottom-8 right-8 bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40 font-medium"
        >
          Logout
        </button>
      )}

      {/* Main Content */}
      <div className="pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Tanks Grid */}
          {tanks.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-16 text-center max-w-2xl mx-auto">
              <div className="text-8xl mb-6">🐠</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">No tanks yet</h2>
              <p className="text-gray-600 mb-8 text-lg">Create your first aquarium and start adding fish!</p>
              <Button 
                onClick={() => setIsCreateModalOpen(true)} 
                variant="primary"
                size="lg"
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Tank
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {tanks.map((tank) => (
                  <TankPreview
                    key={tank.id}
                    tank={tank}
                    onEnter={handleEnterTank}
                    onDelete={handleDeleteTank}
                  />
                ))}
              </div>

              {/* Floating Add Button - matching tank page style */}
              {canCreateTank && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  floating={true}
                  title="Add New Tank"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </Button>
              )}

              {!canCreateTank && (
                <div className="mt-8 text-center">
                  <div className="inline-block bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full border border-white/30">
                    Maximum of 6 tanks reached. Delete a tank to create a new one.
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

