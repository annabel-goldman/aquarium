import { useState, useEffect, useRef, useMemo } from 'react';
import { FISH_SIZE_CONFIG, TANK_BOUNDS, SPRITE_FRAMES } from '../config/constants';

/**
 * Optimized fish animation hook - simplified state management
 * Uses a single ref for animation state to avoid unnecessary re-renders
 */
export function useFishAnimation(fishData = []) {
  const [animatedFish, setAnimatedFish] = useState([]);
  const stateRef = useRef(new Map());
  const frameRef = useRef(null);
  const fishDataRef = useRef(fishData);
  
  // Always keep the ref updated with latest fish data
  fishDataRef.current = fishData;
  
  // Create a stable key based on fish IDs to prevent infinite loops
  const fishKey = useMemo(() => 
    fishData.map(f => f.id).sort().join(','),
    [fishData]
  );

  // Initialize or update fish state
  useEffect(() => {
    const state = stateRef.current;
    const currentFish = fishDataRef.current;
    const currentIds = new Set(currentFish.map(f => f.id));

    // Add new fish
    currentFish.forEach((fish) => {
      if (!state.has(fish.id)) {
        const sizeConfig = FISH_SIZE_CONFIG[fish.size] || FISH_SIZE_CONFIG.md;
        state.set(fish.id, {
          x: 0.5,
          y: 0.5,
          vx: 0,
          vy: 0,
          facingRight: Math.random() > 0.5,
          targetX: TANK_BOUNDS.targetPaddingX + Math.random() * (1 - 2 * TANK_BOUNDS.targetPaddingX),
          targetY: TANK_BOUNDS.targetPaddingY + Math.random() * (1 - 2 * TANK_BOUNDS.targetPaddingY),
          tailFrame: 0,
          frameTimer: 0,
          speed: sizeConfig.speed,
          tailSpeed: sizeConfig.tailSpeed,
        });
      }
    });

    // Remove deleted fish
    for (const id of state.keys()) {
      if (!currentIds.has(id)) {
        state.delete(id);
      }
    }
  }, [fishKey]);

  // Animation loop
  useEffect(() => {
    const currentFish = fishDataRef.current;
    
    if (currentFish.length === 0) {
      setAnimatedFish([]);
      return;
    }

    let lastTime = performance.now();

    function animate(currentTime) {
      const deltaTime = Math.min((currentTime - lastTime) / 16.67, 3);
      lastTime = currentTime;

      const state = stateRef.current;
      const currentFish = fishDataRef.current;
      const updated = currentFish.map((fish) => {
        const fishState = state.get(fish.id);
        if (!fishState) return fish;

        // Check if reached target
        const distToTarget = Math.sqrt(
          Math.pow(fishState.targetX - fishState.x, 2) +
          Math.pow(fishState.targetY - fishState.y, 2)
        );

        if (distToTarget < 0.05) {
          // Pick new target
          fishState.targetX = TANK_BOUNDS.targetPaddingX + Math.random() * (1 - 2 * TANK_BOUNDS.targetPaddingX);
          fishState.targetY = TANK_BOUNDS.targetPaddingY + Math.random() * (1 - 2 * TANK_BOUNDS.targetPaddingY);
        }

        // Move toward target
        const dx = fishState.targetX - fishState.x;
        const dy = fishState.targetY - fishState.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0.001) {
          fishState.vx = (dx / distance) * fishState.speed;
          fishState.vy = (dy / distance) * fishState.speed;

          if (Math.abs(dx) > 0.01) {
            fishState.facingRight = dx > 0;
          }
        } else {
          fishState.vx = 0;
          fishState.vy = 0;
        }

        // Update position
        fishState.x += fishState.vx * deltaTime;
        fishState.y += fishState.vy * deltaTime;

        // Keep in bounds
        fishState.x = Math.max(TANK_BOUNDS.minX, Math.min(TANK_BOUNDS.maxX, fishState.x));
        fishState.y = Math.max(TANK_BOUNDS.minY, Math.min(TANK_BOUNDS.maxY, fishState.y));

        // Update tail animation
        fishState.frameTimer += deltaTime;
        if (fishState.frameTimer >= 60 / fishState.tailSpeed) {
          fishState.frameTimer = 0;
          fishState.tailFrame = (fishState.tailFrame + 1) % SPRITE_FRAMES.tail.length;
        }

        return {
          ...fish,
          x: fishState.x,
          y: fishState.y,
          facingRight: fishState.facingRight,
          currentFrame: SPRITE_FRAMES.tail[fishState.tailFrame],
        };
      });

      setAnimatedFish(updated);
      frameRef.current = requestAnimationFrame(animate);
    }

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [fishKey]);

  return animatedFish;
}

