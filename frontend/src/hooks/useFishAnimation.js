import { useState, useEffect, useRef, useMemo } from 'react';
import { FISH_SIZE_CONFIG, TANK_BOUNDS, SPRITE_FRAMES } from '../config/constants';

/**
 * Fish animation hook with natural food-seeking behavior
 * 
 * Fish swim around randomly, but when food appears:
 * - They notice food within a certain radius
 * - They smoothly accelerate toward the nearest food
 * - On collision, they eat the food (triggering removal)
 */
export function useFishAnimation(fishData = [], foodParticles = [], onEatFood = null) {
  const [animatedFish, setAnimatedFish] = useState([]);
  const stateRef = useRef(new Map());
  const frameRef = useRef(null);
  const fishDataRef = useRef(fishData);
  const foodRef = useRef(foodParticles);
  const onEatFoodRef = useRef(onEatFood);
  
  // Keep refs updated
  fishDataRef.current = fishData;
  foodRef.current = foodParticles;
  onEatFoodRef.current = onEatFood;
  
  // Stable key for fish changes
  const fishKey = useMemo(() => 
    fishData.map(f => f.id).sort().join(','),
    [fishData]
  );

  // Initialize fish state
  useEffect(() => {
    const state = stateRef.current;
    const currentFish = fishDataRef.current;
    const currentIds = new Set(currentFish.map(f => f.id));

    // Add new fish
    currentFish.forEach((fish) => {
      if (!state.has(fish.id)) {
        const sizeConfig = FISH_SIZE_CONFIG[fish.size] || FISH_SIZE_CONFIG.md;
        state.set(fish.id, {
          x: 0.3 + Math.random() * 0.4,
          y: 0.3 + Math.random() * 0.4,
          vx: 0,
          vy: 0,
          facingRight: Math.random() > 0.5,
          targetX: 0.5,
          targetY: 0.5,
          tailFrame: 0,
          frameTimer: 0,
          baseSpeed: sizeConfig.speed,
          tailSpeed: sizeConfig.tailSpeed,
          isEating: false,
          eatingTimer: 0,
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

  // Main animation loop
  useEffect(() => {
    const currentFish = fishDataRef.current;
    
    if (currentFish.length === 0) {
      setAnimatedFish([]);
      return;
    }

    let lastTime = performance.now();
    const eatenThisFrame = new Set();

    function animate(currentTime) {
      const deltaTime = Math.min((currentTime - lastTime) / 16.67, 3);
      lastTime = currentTime;

      const state = stateRef.current;
      const fishList = fishDataRef.current;
      const food = foodRef.current;
      
      eatenThisFrame.clear();
      
      const updated = fishList.map((fish) => {
        const s = state.get(fish.id);
        if (!s) return fish;

        // Eating animation cooldown
        if (s.isEating) {
          s.eatingTimer -= deltaTime;
          if (s.eatingTimer <= 0) {
            s.isEating = false;
          }
        }

        // Find closest food
        let targetX = s.targetX;
        let targetY = s.targetY;
        let chasingFood = false;
        let closestFood = null;
        let closestDist = Infinity;

        if (food.length > 0 && !s.isEating) {
          for (const particle of food) {
            if (eatenThisFrame.has(particle.id)) continue;
            
            const dx = particle.x - s.x;
            const dy = particle.y - s.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Fish notice food within 0.6 units
            if (dist < 0.6 && dist < closestDist) {
              closestDist = dist;
              closestFood = particle;
            }
          }

          if (closestFood) {
            targetX = closestFood.x;
            targetY = closestFood.y;
            chasingFood = true;

            // Collision detection - fish eats food
            const eatRadius = 0.05;
            if (closestDist < eatRadius) {
              s.isEating = true;
              s.eatingTimer = 12;
              eatenThisFrame.add(closestFood.id);
              
              if (onEatFoodRef.current) {
                onEatFoodRef.current(closestFood.id);
              }
            }
          }
        }

        // Pick new random target if reached current one
        if (!chasingFood) {
          const distToTarget = Math.sqrt(
            Math.pow(s.targetX - s.x, 2) + Math.pow(s.targetY - s.y, 2)
          );

          if (distToTarget < 0.05) {
            s.targetX = TANK_BOUNDS.targetPaddingX + Math.random() * (1 - 2 * TANK_BOUNDS.targetPaddingX);
            s.targetY = TANK_BOUNDS.targetPaddingY + Math.random() * (1 - 2 * TANK_BOUNDS.targetPaddingY);
            targetX = s.targetX;
            targetY = s.targetY;
          }
        }

        // Movement physics
        const dx = targetX - s.x;
        const dy = targetY - s.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Speed boost when chasing food
        const maxSpeed = chasingFood ? s.baseSpeed * 4 : s.baseSpeed;
        const acceleration = chasingFood ? 0.2 : 0.06;
        
        if (distance > 0.001) {
          const desiredVx = (dx / distance) * maxSpeed;
          const desiredVy = (dy / distance) * maxSpeed;
          
          // Smooth acceleration
          s.vx += (desiredVx - s.vx) * acceleration * deltaTime;
          s.vy += (desiredVy - s.vy) * acceleration * deltaTime;

          // Update facing direction
          if (Math.abs(dx) > 0.01) {
            s.facingRight = dx > 0;
          }
        } else {
          s.vx *= 0.9;
          s.vy *= 0.9;
        }

        // Update position
        s.x += s.vx * deltaTime;
        s.y += s.vy * deltaTime;

        // Bounce off boundaries
        if (s.x < TANK_BOUNDS.minX) {
          s.x = TANK_BOUNDS.minX;
          s.vx *= -0.5;
        } else if (s.x > TANK_BOUNDS.maxX) {
          s.x = TANK_BOUNDS.maxX;
          s.vx *= -0.5;
        }
        
        if (s.y < TANK_BOUNDS.minY) {
          s.y = TANK_BOUNDS.minY;
          s.vy *= -0.5;
        } else if (s.y > TANK_BOUNDS.maxY) {
          s.y = TANK_BOUNDS.maxY;
          s.vy *= -0.5;
        }

        // Tail animation (faster when moving faster)
        const currentSpeed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
        const tailSpeedMult = 1 + (currentSpeed / s.baseSpeed) * 0.5;
        
        s.frameTimer += deltaTime * tailSpeedMult;
        if (s.frameTimer >= 60 / s.tailSpeed) {
          s.frameTimer = 0;
          s.tailFrame = (s.tailFrame + 1) % SPRITE_FRAMES.tail.length;
        }

        return {
          ...fish,
          x: s.x,
          y: s.y,
          facingRight: s.facingRight,
          currentFrame: SPRITE_FRAMES.tail[s.tailFrame],
          isEating: s.isEating,
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
