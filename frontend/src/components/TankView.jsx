import { FishInTank } from './FishRenderer';
import { PoopSprite } from './PoopSprite';
import { WaterBackground } from './WaterBackground';
import { FISH_SIZE_CONFIG } from '../config/constants';
import '../styles/components/tank-view.css';

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
          className="tank-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Poop layer (behind fish) */}
          {poop.map((p) => (
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
