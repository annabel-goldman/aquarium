import { useState, useEffect } from 'react';
import { SPECIES_SPRITE_MAP, FISH_SIZE_CONFIG } from '../config/constants';
import { loadAndRecolorSVG } from '../utils/svgLoader';

/**
 * FishSprite - uses PNG images with CSS filter for coloring
 */
export function FishSprite({ fish, currentFrame }) {
  const [svgContent, setSvgContent] = useState(null);

  const sizeConfig = FISH_SIZE_CONFIG[fish.size] || FISH_SIZE_CONFIG.md;

  useEffect(() => {
    const folder = SPECIES_SPRITE_MAP[fish.species];
    
    if (!folder) {
      return;
    }

    loadAndRecolorSVG(folder, currentFrame, fish.color)
      .then((data) => {
        if (data) {
          setSvgContent(data);
        }
      })
      .catch(() => {
        console.error(`Failed to load sprite for ${fish.species}`);
      });
  }, [fish.species, fish.color, currentFrame]);

  if (!svgContent) {
    return null;
  }

  // SVGs are designed for a 64x64 viewBox; display at this logical size
  const displaySize = 64;
  
  return (
    <g>
      <g transform={`scale(${sizeConfig.scale})`}>
        <g transform={`translate(${-displaySize / 2}, ${-displaySize / 2})`} dangerouslySetInnerHTML={{ __html: svgContent }} />
      </g>
    </g>
  );
}

