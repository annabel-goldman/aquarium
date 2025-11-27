/**
 * Card component for tank previews and other content
 * Replaces: .tank-preview-card, .tank-preview-image, .tank-preview-info, .tank-preview-title
 */

export function Card({ children, onClick, className = '', hover = true }) {
  const baseStyles = 'bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 border border-white/20';
  const hoverStyles = hover ? 'hover:shadow-2xl hover:-translate-y-2 hover:scale-105' : '';
  const clickableStyles = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${clickableStyles} ${className}`.trim()}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

Card.Image = function CardImage({ children, className = '' }) {
  return (
    <div className={`w-full h-56 overflow-hidden ${className}`.trim()}>
      {children}
    </div>
  );
};

Card.Body = function CardBody({ children, className = '' }) {
  return (
    <div className={`p-5 ${className}`.trim()}>
      {children}
    </div>
  );
};

Card.Title = function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-xl font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis ${className}`.trim()}>
      {children}
    </h3>
  );
};

