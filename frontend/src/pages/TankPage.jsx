import { useState, useCallback, useRef } from 'react';
import { useGame } from '../hooks/useGame';
import { useFishAnimation } from '../hooks/useFishAnimation';
import { TankLayout, FishCounter } from '../components/layout';
import { TankView } from '../components/TankView';
import { TankMeters } from '../components/MeterBar';
import { ControlsPanel } from '../components/ControlsPanel';
import { ToolDock } from '../components/ToolDock';
import '../styles/pages/tank.css';

export function TankPage({ username }) {
  const {
    gameState,
    tank,
    fish,
    loading,
    error,
    hasPoop,
    feed,
    cleanPoop,
    releaseFish,
  } = useGame();
  
  const [foodParticles, setFoodParticles] = useState([]);
  const [showNametags, setShowNametags] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  
  // Track timeout IDs so we can clear them when food is eaten
  const foodTimeouts = useRef(new Map());
  
  // Handle food eaten by fish - remove immediately
  const handleEatFood = useCallback((foodId) => {
    const timeoutId = foodTimeouts.current.get(foodId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      foodTimeouts.current.delete(foodId);
    }
    setFoodParticles(prev => prev.filter(f => f.id !== foodId));
  }, []);
  
  // Animate fish with food awareness
  const animatedFish = useFishAnimation(fish, foodParticles, handleEatFood);
  
  // Handle food dropped from shaking
  const handleFoodDrop = useCallback((food) => {
    setFoodParticles(prev => [...prev, food]);
    
    // Auto-remove food after 4 seconds if not eaten
    const timeoutId = setTimeout(() => {
      setFoodParticles(prev => prev.filter(f => f.id !== food.id));
      foodTimeouts.current.delete(food.id);
    }, 4000);
    
    foodTimeouts.current.set(food.id, timeoutId);
  }, []);
  
  // Handle shake - updates hunger meter
  const handleShake = useCallback(() => {
    feed();
  }, [feed]);
  
  // Handle poop cleaning via scrub
  const handleCleanPoop = useCallback(async (poopId) => {
    await cleanPoop(poopId);
  }, [cleanPoop]);
  
  const handleDeleteFish = async (fishId) => {
    if (confirm('Release this fish back to the lake?')) {
      await releaseFish(fishId);
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

  const poopPositions = tank?.poopPositions || [];

  return (
    <TankLayout coins={gameState?.coins || 0}>
      {/* Tank View */}
      <TankView 
        fish={animatedFish} 
        poop={poopPositions}
        foodParticles={foodParticles}
        cleanliness={tank?.cleanliness || 100}
        showNametags={showNametags}
      />
      
      {/* Fish Counter - Top Left */}
      <FishCounter 
        current={fish.length} 
        max={gameState?.maxFish || 10} 
      />
      
      {/* Meters - Below fish counter */}
      <div className="tank-meters-container">
        <TankMeters 
          hunger={tank?.hunger || 100}
          cleanliness={tank?.cleanliness || 100}
        />
      </div>
      
      {/* Settings Button - Bottom Left */}
      <button 
        className="settings-floating-btn"
        onClick={() => setIsControlsOpen(true)}
        title="Settings"
      >
        ⚙️
      </button>
      
      {/* Tool Dock - Right Side */}
      <ToolDock
        onFoodDrop={handleFoodDrop}
        onCleanPoop={handleCleanPoop}
        onShake={handleShake}
        hasPoop={hasPoop}
      />
      
      {/* Controls Panel */}
      <ControlsPanel
        isOpen={isControlsOpen}
        onClose={() => setIsControlsOpen(false)}
        tank={{ fish }}
        username={username}
        showNametags={showNametags}
        onToggleNametags={() => setShowNametags(!showNametags)}
        onDeleteFish={handleDeleteFish}
      />
    </TankLayout>
  );
}
