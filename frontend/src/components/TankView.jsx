import { useEffect, useMemo, useRef, useState } from 'react';
import { FishInTank } from './FishRenderer';
import { PoopSprite } from './PoopSprite';
import { WaterBackground } from './WaterBackground';
import { FISH_SIZE_CONFIG } from '../config/constants';
import '../styles/components/tank-view.css';

const VIEWBOX_SIZE = 100;
const POOP_EDGE_PADDING = 1.6;

const DEFAULT_VISIBLE_BOUNDS = {
  minX: 0,
  maxX: VIEWBOX_SIZE,
  minY: 0,
  maxY: VIEWBOX_SIZE,
};

function getVisibleViewBoxBounds(width, height) {
  if (!width || !height) {
    return DEFAULT_VISIBLE_BOUNDS;
  }

  const aspectRatio = width / height;

  if (aspectRatio > 1) {
    const visibleHeight = VIEWBOX_SIZE / aspectRatio;
    const minY = (VIEWBOX_SIZE - visibleHeight) / 2;

    return {
      minX: 0,
      maxX: VIEWBOX_SIZE,
      minY,
      maxY: minY + visibleHeight,
    };
  }

  const visibleWidth = VIEWBOX_SIZE * aspectRatio;
  const minX = (VIEWBOX_SIZE - visibleWidth) / 2;

  return {
    minX,
    maxX: minX + visibleWidth,
    minY: 0,
    maxY: VIEWBOX_SIZE,
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function clampToRange(value, min, max) {
  if (min > max) {
    return (min + max) / 2;
  }

  return clamp(value, min, max);
}

function clampPoopToVisibleBounds(poop, bounds) {
  const x = Number.isFinite(poop.x) ? poop.x * VIEWBOX_SIZE : VIEWBOX_SIZE / 2;
  const y = Number.isFinite(poop.y) ? poop.y * VIEWBOX_SIZE : VIEWBOX_SIZE / 2;

  return {
    ...poop,
    x: clampToRange(x, bounds.minX + POOP_EDGE_PADDING, bounds.maxX - POOP_EDGE_PADDING) / VIEWBOX_SIZE,
    y: clampToRange(y, bounds.minY + POOP_EDGE_PADDING, bounds.maxY - POOP_EDGE_PADDING) / VIEWBOX_SIZE,
  };
}

function useVisibleSvgBounds() {
  const svgRef = useRef(null);
  const [bounds, setBounds] = useState(DEFAULT_VISIBLE_BOUNDS);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return undefined;

    const updateBounds = () => {
      const { width, height } = svg.getBoundingClientRect();
      setBounds(getVisibleViewBoxBounds(width, height));
    };

    updateBounds();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateBounds);
      return () => window.removeEventListener('resize', updateBounds);
    }

    const resizeObserver = new ResizeObserver(updateBounds);
    resizeObserver.observe(svg);

    return () => resizeObserver.disconnect();
  }, []);

  return { svgRef, bounds };
}

/**
 * FoodFlake - A single food particle rendered in the tank
 */
function FoodFlake({ x, y }) {
  return (
    <g transform={`translate(${x * 100}, ${y * 100})`}>
      {/* Main flake body - oval shape */}
      <ellipse 
        rx="0.8" 
        ry="0.4" 
        fill="#FF7722" 
        opacity="0.95"
      />
      {/* Highlight */}
      <ellipse 
        rx="0.5" 
        ry="0.25" 
        cx="-0.15" 
        cy="-0.1" 
        fill="#FFAA55" 
        opacity="0.8"
      />
    </g>
  );
}

/**
 * TankView - Renders the aquarium with fish, food, and poop
 * Uses FishInTank from FishRenderer for consistent fish appearance
 */
export function TankView({ 
  fish = [], 
  poop = [],
  foodParticles = [],
  cleanliness = 100,
  showNametags = false,
  highlightPoop = false,
  onCleanPoop
}) {
  // Calculate water opacity based on cleanliness
  const waterOpacity = 0.1 + (1 - cleanliness / 100) * 0.4;
  const { svgRef, bounds } = useVisibleSvgBounds();
  const visiblePoop = useMemo(
    () => poop.map((p) => clampPoopToVisibleBounds(p, bounds)),
    [poop, bounds]
  );
  
  return (
    <WaterBackground>
      <div className="tank-container">
        {/* Murky water overlay when dirty */}
        <div 
          className="water-overlay"
          style={{ 
            opacity: waterOpacity,
            backgroundColor: `rgba(55, 71, 79, ${waterOpacity})`
          }}
        />
        
        <svg
          ref={svgRef}
          className="tank-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Poop layer (behind fish) */}
          {visiblePoop.map((p) => (
            <PoopSprite 
              key={p.id} 
              poop={p} 
              highlight={highlightPoop}
              onClick={onCleanPoop}
            />
          ))}
          
          {/* Food particles layer */}
          {foodParticles.map((food) => (
            <FoodFlake 
              key={food.id} 
              x={food.x} 
              y={food.y} 
            />
          ))}
          
          {/* Fish layer - using shared FishInTank renderer */}
          {fish.map((f) => {
            const sizeConfig = FISH_SIZE_CONFIG[f.size] || FISH_SIZE_CONFIG.md;
            
            return (
              <g key={f.id} className={f.isEating ? 'fish-eating' : ''}>
                {/* Fish with accessories - using shared renderer */}
                <g transform={`translate(${f.x * 100}, ${f.y * 100}) scale(${f.facingRight ? 1 : -1}, 1)`}>
                  <FishInTank fish={f} currentFrame={f.currentFrame} />
                </g>

                {/* Nametag */}
                {showNametags && (
                  <g transform={`translate(${f.x * 100}, ${f.y * 100 - (sizeConfig.nametagOffset * sizeConfig.scale * 20)})`}>
                    <text
                      x="0"
                      y="0"
                      textAnchor="middle"
                      fontSize={1.2 * sizeConfig.scale * 10}
                      fontWeight="600"
                      fill="white"
                      fontFamily="system-ui, -apple-system, sans-serif"
                      stroke="rgba(0, 0, 0, 0.5)"
                      strokeWidth="0.15"
                      paintOrder="stroke"
                    >
                      {f.name}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </WaterBackground>
  );
}
