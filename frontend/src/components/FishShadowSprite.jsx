import { useState, useEffect } from 'react';
import { SPECIES_SPRITE_MAP } from '../config/constants';
import { loadSVG } from '../utils/svgLoader';

// Cache for loaded SVG content (static - single frame only)
const svgCache = new Map();

/**
 * FishShadowSprite - Renders a fish sprite as a dark silhouette
 * 
 * Uses a SINGLE STATIC FRAME for performance.
 * Since shadows are just dark silhouettes, tail animation isn't noticeable.
 * This eliminates all animation overhead.
 */
export function FishShadowSprite({ species }) {
  const [svgContent, setSvgContent] = useState(null);
  
  const folder = SPECIES_SPRITE_MAP[species];
  
  useEffect(() => {
    if (!folder) return;
    
    // Check cache first
    if (svgCache.has(folder)) {
      setSvgContent(svgCache.get(folder));
      return;
    }
    
    // Load single frame (tail-1) and cache it
    loadSVG(folder, 'tail-1')
      .then((svg) => {
        if (svg) {
          svgCache.set(folder, svg);
          setSvgContent(svg);
        }
      })
      .catch(() => {
        console.error(`Failed to load shadow sprite for ${species}`);
      });
  }, [folder, species]);
  
  if (!svgContent) {
    // Fallback simple fish shape
    return (
      <svg viewBox="0 0 64 64" className="fish-shadow-svg">
        <ellipse cx="32" cy="32" rx="24" ry="14" fill="rgba(0,0,0,0.5)" />
        <polygon points="8,32 0,22 0,42" fill="rgba(0,0,0,0.45)" />
      </svg>
    );
  }
  
  return (
    <svg 
      viewBox="0 0 64 64" 
      className="fish-shadow-svg"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
