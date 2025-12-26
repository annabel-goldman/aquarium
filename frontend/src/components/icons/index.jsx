/**
 * Reusable Icon Components
 * Centralized SVG icons to avoid duplication across the codebase
 */

const defaultProps = {
  className: 'w-6 h-6',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24',
};

export function CloseIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} {...defaultProps} viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

export function PlusIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} {...defaultProps} viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
      />
    </svg>
  );
}

export function TrashIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} {...defaultProps} viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

export function ArrowLeftIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} {...defaultProps} viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 19l-7-7m0 0l7-7m-7 7h18"
      />
    </svg>
  );
}


