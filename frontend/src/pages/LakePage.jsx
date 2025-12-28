import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api/client';
import { useUnifiedGame } from '../hooks/useUnifiedGame';
import { useLocalFishing } from '../hooks/useLocalFishing';
import { TopHUD, FishCounter } from '../components/layout';
import { BottomNav } from '../components/BottomNav';
import { WaterBackground } from '../components/WaterBackground';
import { FishShadowSprite } from '../components/FishShadowSprite';
import { RARITY_CONFIG, FISH_SIZE_CONFIG, FISHING_CONFIG, COIN_CONFIG } from '../config/constants';
import '../styles/pages/lake.css';

/**
 * Fish silhouette using actual fish sprite as shadow
 */
function FishSilhouette({ spawn, onCatch, disabled }) {
  const goingRight = spawn.direction === 1;
  const sizeConfig = FISH_SIZE_CONFIG[spawn.size] || FISH_SIZE_CONFIG.md;
  const elementRef = useRef(null);
  
  const handleClick = (e) => {
    if (disabled) return;
    
    const lakeArea = e.currentTarget.closest('.lake-fish-area');
    if (!lakeArea) return;
    
    const lakeRect = lakeArea.getBoundingClientRect();
    const clickX = (e.clientX - lakeRect.left) / lakeRect.width;
    const clickY = (e.clientY - lakeRect.top) / lakeRect.height;
    
    onCatch(spawn, { x: clickX, y: clickY });
  };
  
  const animationStyle = {
    '--duration': `${spawn.speed}s`,
    top: `${spawn.y * 100}%`,
  };
  
  return (
    <div 
      ref={elementRef}
      className={`fish-shadow ${goingRight ? 'swim-right' : 'swim-left'}`}
      style={animationStyle}
      onClick={handleClick}
    >
      <div 
        className="fish-shadow-inner"
        style={{ 
          transform: goingRight ? 'scaleX(1)' : 'scaleX(-1)',
          width: 64 * sizeConfig.scale * 8,
          height: 64 * sizeConfig.scale * 8,
        }}
      >
        <FishShadowSprite 
          species={spawn.species} 
          size={spawn.size}
        />
      </div>
    </div>
  );
}

/**
 * Floating coin that can be clicked to collect
 */
function FloatingCoin({ coin, onCollect }) {
  const handleClick = (e) => {
    e.stopPropagation();
    e.currentTarget.classList.add('collected');
    setTimeout(() => onCollect(coin), 300);
  };
  
  return (
    <div 
      className="floating-coin"
      data-coin-id={coin.id}
      style={{
        left: `${coin.x * 100}%`,
        top: `${coin.y * 100}%`,
        '--delay': `${coin.delay}s`,
      }}
      onClick={handleClick}
    >
      <img src="/sprites/tank-tools/coin.svg" alt="coin" className="coin-img" />
      <span className="coin-value">+{coin.value}</span>
    </div>
  );
}

/**
 * Catch Result Modal
 */
function CatchModal({ result, tankFish, tankFull, onKeep, onRelease, onSwap, onDismiss }) {
  const [showSwapList, setShowSwapList] = useState(false);
  
  if (!result) return null;
  
  const { resultType, fish, junkItem, coinValue, message } = result;
  
  // Junk
  if (resultType === 'junk') {
    return (
      <div className="catch-overlay" onClick={onDismiss}>
        <div className="catch-modal junk" onClick={e => e.stopPropagation()}>
          <div className="catch-emoji">🪨</div>
          <h3>Whoops!</h3>
          <p className="catch-text">{junkItem}</p>
          <p className="catch-subtext">That's not a fish...</p>
          <button className="catch-btn primary" onClick={onDismiss}>
            Throw Back 🌊
          </button>
        </div>
      </div>
    );
  }
  
  // Cosmetic
  if (resultType === 'cosmetic') {
    return (
      <div className="catch-overlay" onClick={onDismiss}>
        <div className="catch-modal cosmetic" onClick={e => e.stopPropagation()}>
          <div className="catch-emoji sparkle">✨</div>
          <h3>Rare Find!</h3>
          <p className="catch-text">{message}</p>
          <button className="catch-btn primary" onClick={onDismiss}>
            Amazing! 🎉
          </button>
        </div>
      </div>
    );
  }
  
  // Bonus coins
  if (resultType === 'bonus_coins') {
    return (
      <div className="catch-overlay" onClick={onDismiss}>
        <div className="catch-modal coins" onClick={e => e.stopPropagation()}>
          <div className="catch-emoji">💎</div>
          <h3>Treasure!</h3>
          <p className="catch-text">{message}</p>
          <button className="catch-btn primary" onClick={onDismiss}>
            Sweet! 🪙
          </button>
        </div>
      </div>
    );
  }
  
  // Fish caught!
  if (resultType === 'fish' && fish) {
    const rarityConfig = RARITY_CONFIG[fish.rarity] || RARITY_CONFIG.common;
    
    if (showSwapList) {
      return (
        <div className="catch-overlay">
          <div className="catch-modal swap" onClick={e => e.stopPropagation()}>
            <h3>Release which fish?</h3>
            <div className="swap-list">
              {tankFish.map((f) => {
                const fRarity = RARITY_CONFIG[f.rarity] || RARITY_CONFIG.common;
                return (
                  <button
                    key={f.id}
                    className="swap-item"
                    onClick={() => { onSwap(f.id); setShowSwapList(false); }}
                  >
                    <div className="swap-color" style={{ backgroundColor: f.color }} />
                    <div className="swap-info">
                      <span className="swap-name">{f.name}</span>
                      <span className="swap-rarity" style={{ color: fRarity.color }}>
                        {fRarity.label} {f.species}
                      </span>
                    </div>
                    <span className="swap-coins">+{fRarity.coinValue}🪙</span>
                  </button>
                );
              })}
            </div>
            <button className="catch-btn secondary" onClick={() => setShowSwapList(false)}>
              Cancel
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="catch-overlay">
        <div className="catch-modal fish-caught" onClick={e => e.stopPropagation()}>
          <div 
            className="rarity-tag" 
            style={{ backgroundColor: rarityConfig.bgColor, color: rarityConfig.color }}
          >
            {rarityConfig.label}
          </div>
          
          <div className="fish-preview" style={{ backgroundColor: fish.color }}>
            <span className="fish-emoji">🐟</span>
          </div>
          
          <h3>{fish.name}</h3>
          <p className="fish-species">{fish.species}</p>
          
          <div className="catch-buttons">
            {!tankFull ? (
              <button className="catch-btn primary" onClick={onKeep}>
                Add to Tank 🐠
              </button>
            ) : (
              <button className="catch-btn primary" onClick={() => setShowSwapList(true)}>
                Swap with Tank Fish 🔄
              </button>
            )}
            <button className="catch-btn secondary" onClick={onRelease}>
              Release for {coinValue} 🪙
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
}

export function LakePage({ username, isAuthenticated }) {
  const game = useUnifiedGame(isAuthenticated);
  
  // Only use local fishing when not authenticated
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const localFishing = !isAuthenticated ? useLocalFishing() : null;
  
  // Store localFishing in a ref to avoid dependency issues
  const localFishingRef = useRef(localFishing);
  useEffect(() => {
    localFishingRef.current = localFishing;
  }, [localFishing]);
  
  const [spawns, setSpawns] = useState([]);
  const [floatingCoins, setFloatingCoins] = useState([]);
  const [catching, setCatching] = useState(false);
  const [catchResult, setCatchResult] = useState(null);
  const [ripple, setRipple] = useState(null);
  
  const spawnTimerRef = useRef(null);
  const coinTimerRef = useRef(null);
  const coinIdRef = useRef(0);
  
  const coins = game.gameState?.coins || 0;
  const tankFish = game.fish || [];
  const maxFish = game.gameState?.maxFish || 10;
  
  // Spawn fish
  const refreshSpawns = useCallback(async () => {
    if (catching) return;
    
    if (isAuthenticated) {
      // Use backend API
      try {
        const data = await api.getFishingSpawns();
        console.log('[AUTH] Spawns from backend:', data.spawns);
        setSpawns(data.spawns || []);
      } catch (err) {
        console.error('Spawn error:', err);
      }
    } else if (localFishingRef.current) {
      // Use local fishing
      const newSpawns = localFishingRef.current.generateSpawns();
      console.log('[UNAUTH] Generated spawns:', newSpawns);
      setSpawns(newSpawns);
    } else {
      console.warn('[UNAUTH] localFishing is null!');
    }
  }, [catching, isAuthenticated]); // Removed localFishing from deps
  
  useEffect(() => {
    refreshSpawns();
    spawnTimerRef.current = setInterval(refreshSpawns, FISHING_CONFIG.spawnRefreshMs);
    return () => clearInterval(spawnTimerRef.current);
  }, [refreshSpawns]);
  
  // Spawn floating coins periodically (config-driven)
  useEffect(() => {
    const spawnCoin = () => {
      const newCoin = {
        id: coinIdRef.current++,
        x: 0.1 + Math.random() * 0.8,
        y: 0.2 + Math.random() * 0.5,
        value: Math.random() < COIN_CONFIG.bonusChance 
          ? COIN_CONFIG.bonusValue 
          : COIN_CONFIG.normalValue,
        delay: Math.random() * 2,
      };
      
      setFloatingCoins(prev => [...prev, newCoin]);
      
      // Auto-remove after lifetime expires
      setTimeout(() => {
        setFloatingCoins(prev => prev.filter(c => c.id !== newCoin.id));
      }, COIN_CONFIG.lifetimeMs);
    };
    
    // Spawn initial coins
    for (let i = 0; i < COIN_CONFIG.initialCoins; i++) {
      setTimeout(spawnCoin, i * 500);
    }
    
    // Periodic spawn attempts
    coinTimerRef.current = setInterval(() => {
      if (Math.random() < COIN_CONFIG.spawnChance) {
        spawnCoin();
      }
    }, COIN_CONFIG.spawnIntervalMs);
    
    return () => clearInterval(coinTimerRef.current);
  }, []);
  
  // Collect a coin
  const handleCollectCoin = async (coin) => {
    setFloatingCoins(prev => prev.filter(c => c.id !== coin.id));
    game.addCoins(coin.value);
  };
  
  // Catch a fish
  const handleCatch = async (spawn, clickPos) => {
    if (catching || catchResult) return;
    
    setCatching(true);
    setSpawns(prev => prev.filter(s => s.id !== spawn.id));
    setRipple({ x: clickPos.x, y: clickPos.y, id: Date.now() });
    
    try {
      let result;
      
      if (isAuthenticated) {
        // Use backend API
        result = await api.attemptCatch(spawn.id, {
          species: spawn.species,
          size: spawn.size,
          rarity: spawn.rarity,
        });
      } else if (localFishing) {
        // Use local fishing
        result = localFishing.attemptCatch(spawn.id, spawn);
        
        // Handle cosmetic catches locally
        if (result.resultType === 'cosmetic') {
          const alreadyOwned = game.ownedAccessories?.includes(result.itemId);
          
          if (alreadyOwned) {
            // Give bonus coins
            game.addCoins(50);
            result = {
              resultType: 'bonus_coins',
              message: `You already have this accessory! Here's 50 coins instead.`,
            };
          } else {
            // Add to owned accessories
            game.addOwnedAccessory(result.itemId);
          }
        }
      } else {
        // Fallback if something went wrong
        result = {
          resultType: 'junk',
          junkItem: 'Nothing here...'
        };
      }
      
      setCatchResult(result);
    } catch (err) {
      console.error('Catch error:', err);
      setCatchResult({
        resultType: 'junk',
        junkItem: 'Something got away...'
      });
    } finally {
      setCatching(false);
      setTimeout(() => setRipple(null), 600);
    }
  };
  
  // Keep fish
  const handleKeep = async () => {
    if (!catchResult?.fish) return;
    
    if (isAuthenticated) {
      try {
        await api.keepFish(catchResult.fish);
        game.refresh();
      } catch (err) {
        console.error('Keep error:', err);
      }
    } else {
      // Add fish locally
      game.addFish(catchResult.fish);
    }
    
    setCatchResult(null);
  };
  
  // Release for coins
  const handleRelease = async () => {
    if (!catchResult?.fish) return;
    
    if (isAuthenticated) {
      try {
        const result = await api.releaseForCoins(catchResult.fish);
        game.updateCoins(result.newCoins);
      } catch (err) {
        console.error('Release error:', err);
      }
    } else {
      // Add coins locally
      game.addCoins(catchResult.coinValue);
    }
    
    setCatchResult(null);
  };
  
  // Swap fish
  const handleSwap = async (releaseFishId) => {
    if (!catchResult?.fish) return;
    
    if (isAuthenticated) {
      try {
        await api.swapFish(catchResult.fish, releaseFishId);
        game.refresh();
      } catch (err) {
        console.error('Swap error:', err);
      }
    } else {
      // Release old fish, add new fish
      const fishToRelease = tankFish.find(f => f.id === releaseFishId);
      if (fishToRelease) {
        await game.releaseFish(releaseFishId);
        game.addFish(catchResult.fish);
      }
    }
    
    setCatchResult(null);
  };
  
  const tankFull = tankFish.length >= maxFish;

  return (
    <div className="lake-page">
      <WaterBackground>
        {/* Fish swimming area - paused when modal is shown */}
        <div className={`lake-fish-area ${catchResult ? 'paused' : ''}`}>
          {console.log('[RENDER] Spawns to render:', spawns.length, spawns)}
          {spawns.map(spawn => (
            <FishSilhouette
              key={spawn.id}
              spawn={spawn}
              onCatch={handleCatch}
              disabled={catching || !!catchResult}
            />
          ))}
        </div>
        
        {/* Floating Coins */}
        <div className="lake-coins">
          {floatingCoins.map(coin => (
            <FloatingCoin
              key={coin.id}
              coin={coin}
              onCollect={handleCollectCoin}
            />
          ))}
        </div>
        
        {/* Ripple effect */}
        {ripple && (
          <div 
            className="lake-ripple" 
            style={{ left: `${ripple.x * 100}%`, top: `${ripple.y * 100}%` }}
          />
        )}
      </WaterBackground>
      
      {/* Top HUD - Coins and Login/Logout */}
      <TopHUD coins={coins} isAuthenticated={isAuthenticated} />
      
      {/* Fish Counter */}
      <FishCounter current={tankFish.length} max={maxFish} />
      
      {/* Instructions - fades out after a moment, stays visible while catching */}
      <div className={`lake-tip ${catching ? 'catching' : ''}`}>
        {catching ? '🎣 Catching...' : 'Tap fish to catch • Grab coins! 🪙'}
      </div>
      
      {/* Navigation */}
      <BottomNav />
      
      {/* Catch Modal */}
      <CatchModal
        result={catchResult}
        tankFish={tankFish}
        tankFull={tankFull}
        onKeep={handleKeep}
        onRelease={handleRelease}
        onSwap={handleSwap}
        onDismiss={() => setCatchResult(null)}
      />
    </div>
  );
}
