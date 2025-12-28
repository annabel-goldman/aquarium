import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api/client';
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

export function LakePage({ username }) {
  const [coins, setCoins] = useState(0);
  const [tankFish, setTankFish] = useState([]);
  const [maxFish, setMaxFish] = useState(10);
  const [spawns, setSpawns] = useState([]);
  const [floatingCoins, setFloatingCoins] = useState([]);
  const [catching, setCatching] = useState(false);
  const [catchResult, setCatchResult] = useState(null);
  const [ripple, setRipple] = useState(null);
  
  const spawnTimerRef = useRef(null);
  const coinTimerRef = useRef(null);
  const coinIdRef = useRef(0);
  
  // Load game state
  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getGameState();
        setCoins(data.gameState?.coins || 0);
        setTankFish(data.fish || []);
        setMaxFish(data.gameState?.maxFish || 10);
      } catch (err) {
        console.error('Failed to load game:', err);
      }
    };
    load();
  }, []);
  
  // Spawn fish
  const refreshSpawns = useCallback(async () => {
    if (catching) return;
    try {
      const data = await api.getFishingSpawns();
      setSpawns(data.spawns || []);
    } catch (err) {
      console.error('Spawn error:', err);
    }
  }, [catching]);
  
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
    setCoins(prev => prev + coin.value);
    
    try {
      await api.addCoins(coin.value);
    } catch (err) {
      console.error('Failed to save coins:', err);
    }
  };
  
  // Catch a fish
  const handleCatch = async (spawn, clickPos) => {
    if (catching || catchResult) return;
    
    setCatching(true);
    setSpawns(prev => prev.filter(s => s.id !== spawn.id));
    setRipple({ x: clickPos.x, y: clickPos.y, id: Date.now() });
    
    try {
      const result = await api.attemptCatch(spawn.id, {
        species: spawn.species,
        size: spawn.size,
        rarity: spawn.rarity,
      });
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
    try {
      const result = await api.keepFish(catchResult.fish);
      if (result.success && result.fish) {
        setTankFish(prev => [...prev, result.fish]);
      }
    } catch (err) {
      console.error('Keep error:', err);
    }
    setCatchResult(null);
  };
  
  // Release for coins
  const handleRelease = async () => {
    if (!catchResult?.fish) return;
    try {
      const result = await api.releaseForCoins(catchResult.fish);
      if (result.success) {
        setCoins(result.newCoins);
      }
    } catch (err) {
      console.error('Release error:', err);
    }
    setCatchResult(null);
  };
  
  // Swap fish
  const handleSwap = async (releaseFishId) => {
    if (!catchResult?.fish) return;
    try {
      const result = await api.swapFish(catchResult.fish, releaseFishId);
      if (result.success) {
        setTankFish(prev => [...prev.filter(f => f.id !== releaseFishId), result.addedFish]);
        setCoins(result.newCoins);
      }
    } catch (err) {
      console.error('Swap error:', err);
    }
    setCatchResult(null);
  };
  
  const tankFull = tankFish.length >= maxFish;

  return (
    <div className="lake-page">
      <WaterBackground>
        {/* Fish swimming area - paused when modal is shown */}
        <div className={`lake-fish-area ${catchResult ? 'paused' : ''}`}>
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
      
      {/* Top HUD - Coins and Logout */}
      <TopHUD coins={coins} />
      
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
