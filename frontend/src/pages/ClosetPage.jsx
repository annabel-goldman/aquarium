import { useState, useEffect } from 'react';
import { useUnifiedGame } from '../hooks/useUnifiedGame';
import { GameLayout } from '../components/layout';
import { FishPreview } from '../components/FishPreview';
import { MiniSprite } from '../components/MiniSprite';
import { ACCESSORY_CONFIG } from '../config/constants';
import '../styles/pages/closet.css';

// Get all available accessories from shared config
const ALL_ACCESSORIES = Object.values(ACCESSORY_CONFIG);

// Slot display order and labels (only hats and effects)
const ACCESSORY_SLOTS = [
  { id: 'hat', label: '🎩 Hats', icon: '🎩' },
  { id: 'effect', label: '✨ Effects', icon: '✨' },
];

/**
 * Accessory tile for equipping owned items
 */
function AccessoryTile({ item, equipped, onToggle }) {
  return (
    <button 
      className={`accessory-tile ${equipped ? 'equipped' : ''}`}
      onClick={onToggle}
      title={item.name}
    >
      <img src={item.sprite} alt={item.name} />
      {equipped && <span className="equipped-check">✓</span>}
    </button>
  );
}

/**
 * Fish card with sprite and name
 */
function FishCard({ fish, selected, onClick }) {
  return (
    <button 
      className={`fish-card ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="fish-card-sprite">
        <MiniSprite species={fish.species} color={fish.color} size={32} />
      </div>
      <span className="fish-card-name">{fish.name}</span>
    </button>
  );
}

export function ClosetPage({ username, isAuthenticated }) {
  const game = useUnifiedGame(isAuthenticated);
  const [selectedFish, setSelectedFish] = useState(null);
  const [message, setMessage] = useState(null);
  
  const fish = game.fish || [];
  const ownedAccessories = game.ownedAccessories || [];
  const coins = game.gameState?.coins || 0;
  
  useEffect(() => {
    if (fish.length > 0 && !selectedFish) {
      setSelectedFish(fish[0]);
    }
  }, [fish, selectedFish]);
  
  useEffect(() => {
    if (selectedFish) {
      const updated = fish.find(f => f.id === selectedFish.id);
      if (updated) {
        setSelectedFish(updated);
      }
    }
  }, [fish, selectedFish?.id]);
  
  // Filter accessories to only show owned ones, organized by slot
  const ownedItems = ALL_ACCESSORIES.filter(item => 
    ownedAccessories.includes(item.id)
  );
  
  // Group by slot
  const itemsBySlot = {};
  for (const slot of ACCESSORY_SLOTS) {
    itemsBySlot[slot.id] = ownedItems.filter(item => item.slot === slot.id);
  }
  
  const handleToggleAccessory = async (item) => {
    if (!selectedFish) return;
    
    const isEquipped = selectedFish.accessories?.[item.slot] === item.id;
    const newValue = isEquipped ? null : item.id;
    
    const result = await game.applyAccessory(selectedFish.id, item.slot, newValue);
    
    if (result.success) {
      setMessage({ 
        type: 'success', 
        text: isEquipped ? 'Removed!' : 'Equipped!' 
      });
      setTimeout(() => setMessage(null), 1500);
    }
  };

  const isEquipped = (item) => {
    return selectedFish?.accessories?.[item.slot] === item.id;
  };

  return (
    <GameLayout coins={coins} isAuthenticated={isAuthenticated} className="closet-page">
      {message && (
        <div className={`toast closet-toast ${message.type}`}>
          {message.text}
        </div>
      )}
      
      {fish.length === 0 ? (
        <div className="closet-empty">
          <p>🐠 No fish yet!</p>
          <p>Catch some at the Lake</p>
        </div>
      ) : (
        <div className="closet-layout">
          {/* Left: Owned Accessories organized by slot */}
          <div className="accessories-sidebar">
            {ownedItems.length === 0 ? (
              <div className="sidebar-empty">
                <p>👒</p>
                <p>No items yet!</p>
                <p className="sidebar-empty-hint">Visit the Shop</p>
              </div>
            ) : (
              ACCESSORY_SLOTS.map(slot => {
                const slotItems = itemsBySlot[slot.id];
                if (slotItems.length === 0) return null;
                
                return (
                  <div key={slot.id} className="accessory-slot-section">
                    <h3 className="slot-label">{slot.icon}</h3>
                    <div className="accessories-grid">
                      {slotItems.map(item => (
                        <AccessoryTile
                          key={item.id}
                          item={item}
                          equipped={isEquipped(item)}
                          onToggle={() => handleToggleAccessory(item)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {/* Right: Fish selection and preview */}
          <div className="preview-area">
            {/* Fish cards at top */}
            <div className="fish-cards-row">
              {fish.map(f => (
                <FishCard
                  key={f.id}
                  fish={f}
                  selected={selectedFish?.id === f.id}
                  onClick={() => setSelectedFish(f)}
                />
              ))}
            </div>
            
            {/* Large preview - uses FishRenderer internally */}
            {selectedFish && (
              <div className="preview-container">
                <FishPreview fish={selectedFish} />
              </div>
            )}
          </div>
        </div>
      )}
    </GameLayout>
  );
}
