import { useState, useRef, useEffect, useCallback } from 'react';
import '../styles/components/tool-dock.css';

/**
 * ToolDock - Dockable tools that attach to mouse on click
 * 
 * Fish Food: Shake to drop food flakes into the tank
 * Sponge: Scrub on poop to clean it
 */
export function ToolDock({ 
  onFoodDrop,
  onCleanPoop,
  onShake,
  hasPoop = false,
}) {
  const [activeTool, setActiveTool] = useState(null); // 'food' | 'sponge' | null
  const [toolPosition, setToolPosition] = useState({ x: 0, y: 0 });
  const [bubbles, setBubbles] = useState([]);
  const [cleanedPoop, setCleanedPoop] = useState(new Set());
  
  const dockRef = useRef(null);
  const tankRef = useRef(null);
  const lastPositions = useRef([]);
  const bubbleIdRef = useRef(0);
  const shakeCountRef = useRef(0);
  const lastFlakeTime = useRef(0);
  
  // Get tank element for coordinate conversion
  useEffect(() => {
    tankRef.current = document.querySelector('.tank-svg');
  }, []);
  
  // Convert screen coordinates to tank normalized coordinates (0-1)
  const screenToTankCoords = useCallback((screenX, screenY) => {
    if (!tankRef.current) return null;
    
    const rect = tankRef.current.getBoundingClientRect();
    const x = (screenX - rect.left) / rect.width;
    const y = (screenY - rect.top) / rect.height;
    
    // Clamp to tank bounds
    return {
      x: Math.max(0.1, Math.min(0.9, x)),
      y: Math.max(0.1, Math.min(0.9, y)),
    };
  }, []);
  
  // Calculate shake intensity from movement
  const calculateShake = useCallback((newX, newY) => {
    const now = Date.now();
    lastPositions.current.push({ x: newX, y: newY, time: now });
    
    // Keep only last 10 positions from last 200ms
    lastPositions.current = lastPositions.current.filter(p => now - p.time < 200);
    
    if (lastPositions.current.length < 3) return 0;
    
    // Calculate total movement distance
    let totalMovement = 0;
    for (let i = 1; i < lastPositions.current.length; i++) {
      const prev = lastPositions.current[i - 1];
      const curr = lastPositions.current[i];
      totalMovement += Math.abs(curr.x - prev.x) + Math.abs(curr.y - prev.y);
    }
    
    return Math.min(totalMovement / 5, 100);
  }, []);
  
  // Spawn food flake at position
  const spawnFlake = useCallback((screenX, screenY) => {
    const coords = screenToTankCoords(screenX, screenY);
    if (!coords || !onFoodDrop) return;
    
    // Add some randomness to flake position
    const flake = {
      id: Date.now() + Math.random(),
      x: coords.x + (Math.random() - 0.5) * 0.08,
      y: coords.y + 0.05 + Math.random() * 0.05, // Slightly below shaker
    };
    
    onFoodDrop(flake);
    
    // Count shakes for hunger update
    shakeCountRef.current++;
    if (shakeCountRef.current >= 5 && onShake) {
      onShake();
      shakeCountRef.current = 0;
    }
  }, [screenToTankCoords, onFoodDrop, onShake]);
  
  // Spawn a cleaning bubble
  const spawnBubble = useCallback((x, y) => {
    const newBubble = {
      id: bubbleIdRef.current++,
      x: x + (Math.random() - 0.5) * 40,
      y: y,
      size: 0.5 + Math.random() * 0.8,
    };
    
    setBubbles(prev => [...prev, newBubble]);
    
    setTimeout(() => {
      setBubbles(prev => prev.filter(b => b.id !== newBubble.id));
    }, 1500);
  }, []);
  
  // Check if mouse is over dock area
  const isOverDock = useCallback((x, y) => {
    if (!dockRef.current) return false;
    const rect = dockRef.current.getBoundingClientRect();
    return x >= rect.left - 50 && x <= rect.right + 50 && 
           y >= rect.top - 50 && y <= rect.bottom + 50;
  }, []);
  
  // Check collision with poop
  const checkPoopCollision = useCallback((spongeX, spongeY) => {
    const poopElements = document.querySelectorAll('.poop-sprite[data-poop-id]');
    
    poopElements.forEach(poopEl => {
      const poopId = poopEl.getAttribute('data-poop-id');
      if (!poopId || cleanedPoop.has(poopId)) return;
      
      const poopRect = poopEl.getBoundingClientRect();
      const poopCenterX = poopRect.left + poopRect.width / 2;
      const poopCenterY = poopRect.top + poopRect.height / 2;
      
      const distance = Math.hypot(spongeX - poopCenterX, spongeY - poopCenterY);
      
      if (distance < 70) {
        setCleanedPoop(prev => new Set([...prev, poopId]));
        poopEl.classList.add('cleaning');
        
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            spawnBubble(poopCenterX, poopCenterY);
          }, i * 50);
        }
        
        if (onCleanPoop) {
          onCleanPoop(poopId);
        }
      }
    });
  }, [cleanedPoop, onCleanPoop, spawnBubble]);
  
  // Handle mouse move
  const handleMouseMove = useCallback((e) => {
    if (!activeTool) return;
    
    const x = e.clientX;
    const y = e.clientY;
    
    setToolPosition({ x, y });
    
    if (activeTool === 'food') {
      const intensity = calculateShake(x, y);
      const now = Date.now();
      
      // Drop flakes when shaking intensely (rate limited)
      if (intensity > 25 && now - lastFlakeTime.current > 80) {
        if (Math.random() < intensity / 80) {
          spawnFlake(x, y);
          lastFlakeTime.current = now;
        }
      }
    } else if (activeTool === 'sponge') {
      if (Math.random() < 0.1) {
        spawnBubble(x, y);
      }
      checkPoopCollision(x, y);
    }
  }, [activeTool, calculateShake, spawnFlake, spawnBubble, checkPoopCollision]);
  
  // Handle mouse up - check if over dock to return tool
  const handleMouseUp = useCallback((e) => {
    if (!activeTool) return;
    
    if (isOverDock(e.clientX, e.clientY)) {
      // Return tool to dock
      setActiveTool(null);
      lastPositions.current = [];
      shakeCountRef.current = 0;
    }
  }, [activeTool, isOverDock]);
  
  // Touch event handlers
  const handleTouchMove = useCallback((e) => {
    if (!activeTool) return;
    const touch = e.touches[0];
    handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
  }, [activeTool, handleMouseMove]);
  
  const handleTouchEnd = useCallback((e) => {
    if (!activeTool) return;
    const touch = e.changedTouches[0];
    handleMouseUp({ clientX: touch.clientX, clientY: touch.clientY });
  }, [activeTool, handleMouseUp]);
  
  // Add/remove global listeners
  useEffect(() => {
    if (activeTool) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [activeTool, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);
  
  // Reset cleaned poop when poop changes
  useEffect(() => {
    if (!hasPoop) {
      setCleanedPoop(new Set());
    }
  }, [hasPoop]);
  
  // Pick up a tool
  const pickUpTool = (tool, e) => {
    e.preventDefault();
    setActiveTool(tool);
    setToolPosition({ 
      x: e.clientX || e.touches?.[0]?.clientX || 0, 
      y: e.clientY || e.touches?.[0]?.clientY || 0 
    });
    lastPositions.current = [];
  };
  
  const shakeRotation = activeTool === 'food' && lastPositions.current.length > 3 
    ? Math.sin(Date.now() / 30) * 15 
    : 0;
  
  return (
    <>
      {/* Tool Dock */}
      <div ref={dockRef} className="tool-dock">
        {/* Fish Food */}
        <div 
          className={`tool-slot ${activeTool === 'food' ? 'empty' : ''}`}
          onMouseDown={(e) => pickUpTool('food', e)}
          onTouchStart={(e) => pickUpTool('food', e)}
        >
          {activeTool !== 'food' && (
            <>
              <img src="/sprites/tank-tools/fish-food.svg" alt="Fish Food" className="dock-tool-img" />
              <span className="tool-label">Fish Food</span>
            </>
          )}
          {activeTool === 'food' && (
            <div className="tool-placeholder">
              <span className="placeholder-text">Drop here</span>
            </div>
          )}
        </div>
        
        {/* Sponge */}
        <div 
          className={`tool-slot ${activeTool === 'sponge' ? 'empty' : ''} ${!hasPoop ? 'disabled' : ''}`}
          onMouseDown={(e) => hasPoop && pickUpTool('sponge', e)}
          onTouchStart={(e) => hasPoop && pickUpTool('sponge', e)}
        >
          {activeTool !== 'sponge' && (
            <>
              <img src="/sprites/tank-tools/sponge.svg" alt="Sponge" className="dock-tool-img" />
              <span className="tool-label">Sponge</span>
            </>
          )}
          {activeTool === 'sponge' && (
            <div className="tool-placeholder">
              <span className="placeholder-text">Drop here</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Active Tool Following Mouse */}
      {activeTool && (
        <div 
          className={`floating-tool ${activeTool}`}
          style={{
            left: toolPosition.x,
            top: toolPosition.y,
            transform: `translate(-50%, -50%) rotate(${shakeRotation}deg)`,
          }}
        >
          <img 
            src={`/sprites/tank-tools/${activeTool === 'food' ? 'fish-food' : 'sponge'}.svg`} 
            alt={activeTool === 'food' ? 'Fish Food' : 'Sponge'}
          />
        </div>
      )}
      
      {/* Rising Bubbles (from sponge) */}
      {bubbles.map(bubble => (
        <div
          key={bubble.id}
          className="scrub-bubble"
          style={{
            left: bubble.x,
            top: bubble.y,
          }}
        >
          <img 
            src="/sprites/tank-tools/bubble.svg" 
            alt=""
            style={{ 
              width: 24 * bubble.size, 
              height: 24 * bubble.size 
            }}
          />
        </div>
      ))}
    </>
  );
}
