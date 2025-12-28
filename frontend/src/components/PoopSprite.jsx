import '../styles/components/poop-sprite.css';

/**
 * Poop sprite that can be clicked to clean
 */
export function PoopSprite({ poop, highlight = false, onClick }) {
  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(poop.id);
    }
  };
  
  return (
    <g 
      transform={`translate(${poop.x * 100}, ${poop.y * 100})`}
      onClick={handleClick}
      className={`poop-sprite ${highlight ? 'highlight' : ''}`}
      data-poop-id={poop.id}
    >
      {/* Poop shadow */}
      <ellipse
        cx="0"
        cy="0.4"
        rx="0.8"
        ry="0.3"
        fill="rgba(0, 0, 0, 0.2)"
      />
      
      {/* Main poop body - three stacked circles */}
      <circle cx="0" cy="0" r="0.6" fill="#8B4513" />
      <circle cx="-0.3" cy="-0.3" r="0.45" fill="#A0522D" />
      <circle cx="0.2" cy="-0.5" r="0.35" fill="#8B4513" />
      
      {/* Top swirl */}
      <ellipse 
        cx="0.1" 
        cy="-0.8" 
        rx="0.25" 
        ry="0.2" 
        fill="#A0522D"
        transform="rotate(-15, 0.1, -0.8)"
      />
      
      {/* Highlight */}
      <circle cx="-0.2" cy="-0.4" r="0.1" fill="rgba(255,255,255,0.3)" />
      
      {/* Hover indicator */}
      <circle 
        cx="0" 
        cy="-0.3" 
        r="1.2" 
        fill="transparent"
        stroke="transparent"
        className="poop-hitarea"
      />
    </g>
  );
}

