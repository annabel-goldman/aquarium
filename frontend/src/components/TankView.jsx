import { FishSprite } from './FishSprite';
import { FISH_SIZE_CONFIG } from '../config/constants';

/**
 * TankView - Renders the aquarium with fish
 */
export function TankView({ fish = [], showNametags = false }) {
  return (
    <svg
      className="tank-svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(to bottom, #3b82f6 0%, #2563eb 50%, #1e40af 100%)',
      }}
    >
      {fish.map((f) => {
        const sizeConfig = FISH_SIZE_CONFIG[f.size] || FISH_SIZE_CONFIG.md;
        
        return (
          <g key={f.id}>
            <g transform={`translate(${f.x * 100}, ${f.y * 100}) scale(${f.facingRight ? 1 : -1}, 1)`}>
              <FishSprite fish={f} currentFrame={f.currentFrame} />
            </g>

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
  );
}

