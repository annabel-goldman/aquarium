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
  
  const headPos = SPECIES_HEAD_POSITIONS[species] || { x: 15, y: 0 };
  
  // Base position is head position + accessory offset
  const baseX = headPos.x + (accessory.offset?.x || 0);
  const baseY = headPos.y + (accessory.offset?.y || 0);
  
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
 */
function getEquippedAccessories(fish, facingRight = true) {
  const accessories = [];
  
  // Check each slot (hat, effect - glasses removed)
  const slots = ['hat', 'effect'];
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
      {/* Fish body */}
      <g transform={`scale(${sizeConfig.scale})`}>
        <g 
          transform={`translate(${-displaySize / 2}, ${-displaySize / 2})`} 
          dangerouslySetInnerHTML={{ __html: svgContent }} 
        />
      </g>
      
      {/* Render all accessories */}
      {accessories.map((acc) => {
        const accessorySize = displaySize * acc.size;
        return (
          <image
            key={acc.slot}
            href={acc.sprite}
            x={(acc.x - accessorySize / 2) * sizeConfig.scale}
            y={(acc.y - accessorySize / 2) * sizeConfig.scale}
            width={accessorySize * sizeConfig.scale}
            height={accessorySize * sizeConfig.scale}
            transform={`rotate(${acc.rotation})`}
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
      {/* Fish SVG */}
      <svg 
        viewBox="0 0 64 64" 
        width={size} 
        height={size}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <g dangerouslySetInnerHTML={{ __html: svgContent }} />
      </svg>
      
      {/* Render all accessories */}
      {accessories.map((acc) => {
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
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              pointerEvents: 'none',
            }}
          />
        );
      })}
    </div>
  );
}

export default FishInTank;
