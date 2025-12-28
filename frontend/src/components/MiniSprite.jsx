import { useState, useEffect } from 'react';
import { SPECIES_SPRITE_MAP } from '../config/constants';
import { loadAndRecolorSVG } from '../utils/svgLoader';
import '../styles/components/mini-sprite.css';

/**
 * MiniSprite - Small fish sprite for selectors/lists
 */
export function MiniSprite({ species, color, size = 24 }) {
  const [svgContent, setSvgContent] = useState(null);
  
  useEffect(() => {
    const folder = SPECIES_SPRITE_MAP[species];
    
    if (!folder) return;
    
    loadAndRecolorSVG(folder, 'tail-1', color)
      .then((data) => {
        if (data) setSvgContent(data);
      })
      .catch(() => {
        console.error(`Failed to load sprite for ${species}`);
      });
  }, [species, color]);
  
  if (!svgContent) {
    return (
      <div 
        className="mini-sprite-placeholder"
        style={{ 
          width: size, 
          height: size,
          backgroundColor: color,
        }} 
      />
    );
  }
  
  return (
    <svg 
      viewBox="0 0 64 64" 
      width={size} 
      height={size}
      className="mini-sprite-svg"
    >
      <g dangerouslySetInnerHTML={{ __html: svgContent }} />
    </svg>
  );
}

