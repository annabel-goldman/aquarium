import { useState, useEffect } from 'react';
import { 
  SPECIES_SPRITE_MAP, 
  SPECIES_HEAD_POSITIONS, 
  FISH_SIZE_CONFIG,
  getAccessoryConfig,
  hasAccessorySprite,
} from '../config/constants';
import { loadAndRecolorSVG } from '../utils/svgLoader';

/**
 * FishRenderer - Single source of truth for fish appearance
 * 
 * Used by:
 * - TankView (SVG context) via FishInTank
 * - FishPreview (HTML context) via FishInPreview
 * 
 * This component defines HOW a fish looks - color, accessories, positioning.
 * 
 * ADDING NEW ACCESSORIES:
 * 1. Add sprite to: frontend/public/sprites/accessories/
 * 2. Add config to: frontend/src/config/constants.js (ACCESSORY_CONFIG)
 * 3. Add to backend: backend/app/game_config.py (SHOP_ITEMS)
 */

/**
 * Load fish SVG content with color
 */
export function useFishSVG(species, color, frame = 'tail-1') {
  const [svgContent, setSvgContent] = useState(null);
  
  useEffect(() => {
    const folder = SPECIES_SPRITE_MAP[species];
    if (!folder) return;
    
    loadAndRecolorSVG(folder, frame, color)
      .then((data) => {
        if (data) setSvgContent(data);
      })
      .catch(() => {
        console.error(`Failed to load sprite for ${species}`);
      });
  }, [species, color, frame]);
  
  return svgContent;
}

/**
 * Calculate accessory position based on fish species and accessory config
 * Returns position relative to fish center (0,0)
 * Returns null if accessory doesn't exist or has no sprite
 */
export function calculateAccessoryPosition(species, accessoryId, facingRight = true) {
  // Skip if no accessory or no sprite
  if (!accessoryId || !hasAccessorySprite(accessoryId)) return null;
  
  const accessory = getAccessoryConfig(accessoryId);
  if (!accessory) return null;
  
  let baseX, baseY;
  
  // Effects trail behind the fish, hats go on head
  if (accessory.slot === 'effect') {
    // Position behind the fish (negative x = behind when facing right)
    baseX = -20; // Behind the fish
    baseY = 0;   // Center height
  } else {
    // Hats and other accessories use head position
    const headPos = SPECIES_HEAD_POSITIONS[species] || { x: 15, y: 0 };
    baseX = headPos.x + (accessory.offset?.x || 0);
    baseY = headPos.y + (accessory.offset?.y || 0);
  }
  
  // Flip X if facing left
  const x = facingRight ? baseX : -baseX;
  const y = baseY;
  
  return {
    x,
    y,
    size: accessory.size || 0.35,
    rotation: facingRight ? (accessory.rotation || 0) : -(accessory.rotation || 0),
    sprite: accessory.sprite,
    name: accessory.name,
    slot: accessory.slot,
  };
}

/**
 * Get all equipped accessory positions for a fish
 * Returns accessories grouped by rendering order
 */
function getEquippedAccessories(fish, facingRight = true) {
  const accessories = [];
  
  // Check each slot (hat, effect)
  const slots = ['effect', 'hat']; // Effect first (renders behind), then hat (renders on top)
  for (const slot of slots) {
    const accessoryId = fish.accessories?.[slot];
    if (accessoryId) {
      const pos = calculateAccessoryPosition(fish.species, accessoryId, facingRight);
      if (pos) {
        accessories.push(pos);
      }
    }
  }
  
  return accessories;
}

/**
 * FishInTank - SVG version for use in TankView
 * Renders fish with accessories as SVG elements
 */
export function FishInTank({ fish, currentFrame = 'tail-1' }) {
  const svgContent = useFishSVG(fish.species, fish.color, currentFrame);
  const sizeConfig = FISH_SIZE_CONFIG[fish.size] || FISH_SIZE_CONFIG.md;
  
  if (!svgContent) return null;
  
  // Get all equipped accessories
  const accessories = getEquippedAccessories(fish, true);
  
  // SVG is 64x64, centered at 0,0 with scale applied
  const displaySize = 64;
  
  return (
    <g>
      {/* Render effects first (behind fish) with flowing trail stream */}
      {accessories.filter(acc => acc.slot === 'effect').map((acc) => {
        const accessorySize = displaySize * acc.size;
        const accessoryX = (acc.x * sizeConfig.scale);
        const accessoryY = (acc.y * sizeConfig.scale);
        
        // Special rainbow trail rendering - flowing line instead of particles
        if (acc.sprite.includes('rainbow')) {
          const rainbowLength = 50 * sizeConfig.scale;
          const rainbowHeight = 8 * sizeConfig.scale;
          
          return (
            <g key={acc.slot}>
              {/* Wavy rainbow path */}
              <path
                d={`M ${accessoryX} ${accessoryY} Q ${accessoryX - rainbowLength * 0.3} ${accessoryY - 6} ${accessoryX - rainbowLength * 0.6} ${accessoryY} Q ${accessoryX - rainbowLength * 0.9} ${accessoryY + 6} ${accessoryX - rainbowLength} ${accessoryY}`}
                fill="none"
                stroke="url(#rainbowGradient)"
                strokeWidth={rainbowHeight}
                strokeLinecap="round"
                opacity="0.85"
                style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}
              >
                {/* Flowing animation - dash pattern moves */}
                <animate
                  attributeName="stroke-dasharray"
                  values="0 100; 100 0"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </path>
              
              {/* Define rainbow gradient */}
              <defs>
                <linearGradient id="rainbowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ff0000" stopOpacity="1" />
                  <stop offset="16%" stopColor="#ff7f00" stopOpacity="1" />
                  <stop offset="33%" stopColor="#ffff00" stopOpacity="1" />
                  <stop offset="50%" stopColor="#00ff00" stopOpacity="1" />
                  <stop offset="66%" stopColor="#0000ff" stopOpacity="1" />
                  <stop offset="83%" stopColor="#4b0082" stopOpacity="1" />
                  <stop offset="100%" stopColor="#9400d3" stopOpacity="0.3" />
                </linearGradient>
              </defs>
            </g>
          );
        }
        
        // Default particle trail for other effects
        // Create flowing trail particles that continuously emerge from tail
        // Each particle flows backward, shrinks, and fades in a loop
        const trailParticles = [0, 1, 2, 3, 4, 5].map((index) => {
          const delay = index * 0.15; // Stagger so particles appear in sequence
          const particleSize = accessorySize * sizeConfig.scale * 0.7; // Smaller particles
          
          return (
            <image
              key={`${acc.slot}-trail-${index}`}
              href={acc.sprite}
              x={-particleSize / 2}
              y={-particleSize / 2}
              width={particleSize}
              height={particleSize}
              style={{ filter: 'drop-shadow(0 0.5px 1px rgba(0,0,0,0.3))' }}
            >
              {/* Flow backward animation - emerges from tail and flows back */}
              <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="translate"
                values={`${accessoryX},${accessoryY}; ${accessoryX - 35 * sizeConfig.scale},${accessoryY + Math.sin(index) * 2}`}
                dur="1s"
                begin={`${delay}s`}
                repeatCount="indefinite"
              />
              {/* Spinning as it flows */}
              <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="rotate"
                values={`0,0,0; 120,0,0`}
                dur="1s"
                begin={`${delay}s`}
                repeatCount="indefinite"
                additive="sum"
              />
              {/* Shrink as it flows away */}
              <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="scale"
                values={`1; 0.3`}
                dur="1s"
                begin={`${delay}s`}
                repeatCount="indefinite"
                additive="sum"
              />
              {/* Fade out as it flows */}
              <animate
                attributeName="opacity"
                values={`0.95; 0`}
                dur="1s"
                begin={`${delay}s`}
                repeatCount="indefinite"
              />
            </image>
          );
        });
        
        return <g key={acc.slot}>{trailParticles}</g>;
      })}
      
      {/* Fish body */}
      <g transform={`scale(${sizeConfig.scale})`}>
        <g 
          transform={`translate(${-displaySize / 2}, ${-displaySize / 2})`} 
          dangerouslySetInnerHTML={{ __html: svgContent }} 
        />
      </g>
      
      {/* Render hats on top of fish */}
      {accessories.filter(acc => acc.slot === 'hat').map((acc) => {
        const accessorySize = displaySize * acc.size;
        const accessoryX = (acc.x * sizeConfig.scale);
        const accessoryY = (acc.y * sizeConfig.scale);
        
        return (
          <image
            key={acc.slot}
            href={acc.sprite}
            x={-accessorySize * sizeConfig.scale / 2}
            y={-accessorySize * sizeConfig.scale / 2}
            width={accessorySize * sizeConfig.scale}
            height={accessorySize * sizeConfig.scale}
            transform={`translate(${accessoryX}, ${accessoryY}) rotate(${acc.rotation})`}
            style={{ filter: 'drop-shadow(0 0.5px 1px rgba(0,0,0,0.3))' }}
          />
        );
      })}
    </g>
  );
}

/**
 * FishInPreview - HTML/CSS version for closet preview
 * Renders fish with accessories as positioned HTML elements
 */
export function FishInPreview({ fish, size = 160 }) {
  const svgContent = useFishSVG(fish.species, fish.color, 'tail-1');
  
  if (!svgContent) {
    return <div className="fish-loading" style={{ width: size, height: size }} />;
  }
  
  // Get all equipped accessories
  const accessories = getEquippedAccessories(fish, true);
  
  // Scale factor from 64px sprite to display size
  const scaleFactor = size / 64;
  
  return (
    <div 
      className="fish-renderer"
      style={{ 
        position: 'relative', 
        width: size, 
        height: size,
      }}
    >
      {/* Render effects first (behind fish) with flowing trail stream */}
      {accessories.filter(acc => acc.slot === 'effect').map((acc) => {
        const accessorySize = 64 * acc.size * scaleFactor * 0.7; // Smaller particles
        
        // Special rainbow trail rendering - flowing line instead of particles
        if (acc.sprite.includes('rainbow')) {
          const rainbowLength = 50 * scaleFactor;
          const rainbowHeight = 8 * scaleFactor;
          const startX = (32 + acc.x) * scaleFactor;
          const startY = (32 + acc.y) * scaleFactor;
          
          return (
            <svg
              key={acc.slot}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: size,
                height: size,
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              <defs>
                <linearGradient id={`rainbowGradient-preview`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ff0000" stopOpacity="1" />
                  <stop offset="16%" stopColor="#ff7f00" stopOpacity="1" />
                  <stop offset="33%" stopColor="#ffff00" stopOpacity="1" />
                  <stop offset="50%" stopColor="#00ff00" stopOpacity="1" />
                  <stop offset="66%" stopColor="#0000ff" stopOpacity="1" />
                  <stop offset="83%" stopColor="#4b0082" stopOpacity="1" />
                  <stop offset="100%" stopColor="#9400d3" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <path
                d={`M ${startX} ${startY} Q ${startX - rainbowLength * 0.3} ${startY - 6} ${startX - rainbowLength * 0.6} ${startY} Q ${startX - rainbowLength * 0.9} ${startY + 6} ${startX - rainbowLength} ${startY}`}
                fill="none"
                stroke="url(#rainbowGradient-preview)"
                strokeWidth={rainbowHeight}
                strokeLinecap="round"
                opacity="0.85"
                style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}
              >
                <animate
                  attributeName="stroke-dasharray"
                  values="0 100; 100 0"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </path>
            </svg>
          );
        }
        
        // Default particle trail for other effects
        // Create flowing trail particles that continuously emerge from tail
        // Each particle flows backward, shrinks, and fades in a loop
        const trailParticles = [0, 1, 2, 3, 4, 5].map((index) => {
          const delay = index * 0.15; // Stagger so particles appear in sequence
          
          const startX = (32 + acc.x) * scaleFactor - accessorySize / 2;
          const startY = (32 + acc.y) * scaleFactor - accessorySize / 2;
          
          return (
            <img
              key={`${acc.slot}-trail-${index}`}
              src={acc.sprite}
              alt={acc.name}
              className={`effect-trail-flow-${index}`}
              style={{
                position: 'absolute',
                left: startX,
                top: startY,
                width: accessorySize,
                height: accessorySize,
                transformOrigin: 'center',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                pointerEvents: 'none',
                zIndex: 1,
                animation: `particleFlow 1s ${delay}s ease-out infinite`,
                '--y-wobble': `${Math.sin(index) * 2}px`,
              }}
            />
          );
        });
        
        return <div key={acc.slot}>{trailParticles}</div>;
      })}
      
      {/* Fish SVG */}
      <svg 
        viewBox="0 0 64 64" 
        width={size} 
        height={size}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}
      >
        <g dangerouslySetInnerHTML={{ __html: svgContent }} />
      </svg>
      
      {/* Render hats on top of fish */}
      {accessories.filter(acc => acc.slot === 'hat').map((acc) => {
        const accessorySize = 64 * acc.size * scaleFactor;
        const accessoryX = (32 + acc.x) * scaleFactor - accessorySize / 2;
        const accessoryY = (32 + acc.y) * scaleFactor - accessorySize / 2;
        
        return (
          <img
            key={acc.slot}
            src={acc.sprite}
            alt={acc.name}
            style={{
              position: 'absolute',
              left: accessoryX,
              top: accessoryY,
              width: accessorySize,
              height: accessorySize,
              transform: `rotate(${acc.rotation}deg)`,
              transformOrigin: 'center',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              pointerEvents: 'none',
              zIndex: 3,
            }}
          />
        );
      })}
      
      {/* CSS animation for flowing trail stream */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes particleFlow {
          0% { 
            opacity: 0.95;
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
          100% { 
            opacity: 0;
            transform: translate(-35px, var(--y-wobble, 0)) scale(0.3) rotate(120deg);
          }
        }
      `}} />
    </div>
  );
}

export default FishInTank;
