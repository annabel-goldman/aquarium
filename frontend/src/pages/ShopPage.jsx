import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useUnifiedGame } from '../hooks/useUnifiedGame';
import { GameLayout } from '../components/layout';
import { getAccessoryConfig } from '../config/constants';
import { SHOP_ITEMS } from '../config/gameBalance';
import '../styles/pages/shop.css';

/**
 * Shop item card
 */
function ShopItem({ item, canAfford, onBuy, purchasing }) {
  // Get sprite from frontend config (backend doesn't have sprites)
  const accessoryConfig = getAccessoryConfig(item.id);
  const sprite = accessoryConfig?.sprite || '/sprites/accessories/placeholder.svg';
  
  if (item.owned) {
    return (
      <div className="shop-item owned">
        <img src={sprite} alt={item.name} className="item-image" />
        <div className="item-details">
          <span className="item-name">{item.name}</span>
          <span className="owned-badge">✓ Owned</span>
        </div>
      </div>
    );
  }
  
  // Catch-only items can't be bought
  if (item.catchOnly) {
    return (
      <div className="shop-item catch-only">
        <img src={sprite} alt={item.name} className="item-image" />
        <div className="item-details">
          <span className="item-name">{item.name}</span>
          <span className="catch-only-badge">🎣 Fishing Only</span>
        </div>
      </div>
    );
  }
  
  return (
    <button 
      className={`shop-item ${!canAfford ? 'cant-afford' : ''}`}
      onClick={() => canAfford && onBuy(item)}
      disabled={!canAfford || purchasing}
    >
      <img src={sprite} alt={item.name} className="item-image" />
      <div className="item-details">
        <span className="item-name">{item.name}</span>
        <div className="item-price">
          <img src="/sprites/tank-tools/coin.svg" alt="" />
          <span>{item.price}</span>
        </div>
      </div>
    </button>
  );
}

export function ShopPage({ username, isAuthenticated }) {
  const game = useUnifiedGame(isAuthenticated);
  const [shopItems, setShopItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  
  // Load shop items
  useEffect(() => {
    const loadShop = async () => {
      try {
        let items;
        
        if (isAuthenticated) {
          // Load from backend
          const data = await api.getShopItems();
          items = data.items;
        } else {
          // Use local shop config
          items = Object.entries(SHOP_ITEMS).map(([id, item]) => ({
            id,
            name: item.name,
            category: item.category,
            price: item.price,
            catchOnly: item.catchOnly || false,
            owned: game.ownedAccessories?.includes(id) || false,
          }));
        }
        
        // Filter to only show items with sprites configured
        const itemsWithSprites = items.filter(item => {
          const config = getAccessoryConfig(item.id);
          return config?.sprite;
        });
        
        setShopItems(itemsWithSprites);
      } catch (err) {
        console.error('Failed to load shop:', err);
      } finally {
        setLoading(false);
      }
    };
    loadShop();
  }, [isAuthenticated, game.ownedAccessories]);
  
  const handleBuy = async (item) => {
    if (purchasing) return;
    
    setPurchasing(true);
    setMessage(null);
    
    try {
      let result;
      
      if (isAuthenticated) {
        result = await api.buyItem(item.id);
      } else {
        result = game.buyItem(item.id);
      }
      
      if (result.success) {
        setMessage({ type: 'success', text: `Bought ${item.name}!` });
        // Update local shop state
        setShopItems(prev => prev.map(i => 
          i.id === item.id ? { ...i, owned: true } : i
        ));
        
        if (isAuthenticated) {
          game.refresh();
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Purchase failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setPurchasing(false);
      setTimeout(() => setMessage(null), 2000);
    }
  };
  
  const coins = game.gameState?.coins || 0;

  // Group items by category (only hats and effects - no glasses)
  const categories = {
    hat: shopItems.filter(i => i.category === 'hat'),
    effect: shopItems.filter(i => i.category === 'effect'),
  };

  if (loading) {
    return (
      <GameLayout coins={coins} isAuthenticated={isAuthenticated} className="shop-page">
        <div className="shop-loading">Loading shop...</div>
      </GameLayout>
    );
  }

  return (
    <GameLayout coins={coins} isAuthenticated={isAuthenticated} className="shop-page">
      <h1 className="shop-title">Shop</h1>
      
      {message && (
        <div className={`toast ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="shop-scroll-content">
        {/* Hats Section */}
        {categories.hat.length > 0 && (
          <div className="shop-category">
            <h2 className="category-title">🎩 Hats</h2>
            <div className="shop-items">
              {categories.hat.map(item => (
                <ShopItem
                  key={item.id}
                  item={item}
                  canAfford={coins >= item.price}
                  onBuy={handleBuy}
                  purchasing={purchasing}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Effects Section */}
        {categories.effect.length > 0 && (
          <div className="shop-category">
            <h2 className="category-title">✨ Effects</h2>
            <div className="shop-items">
              {categories.effect.map(item => (
                <ShopItem
                  key={item.id}
                  item={item}
                  canAfford={coins >= item.price}
                  onBuy={handleBuy}
                  purchasing={purchasing}
                />
              ))}
            </div>
          </div>
        )}
        
        <p className="shop-coming-soon">More items coming soon!</p>
      </div>
    </GameLayout>
  );
}
