/**
 * Input components with Tailwind styling
 * Shared base styles to avoid duplication
 */

// Shared base styles for form inputs
const inputBaseStyles = 'w-full px-3 py-2 border border-gray-300 rounded-md text-base transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`${inputBaseStyles} ${className}`.trim()}
      {...props}
    />
  );
}

export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`${inputBaseStyles} ${className}`.trim()}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({ className = '', children, ...props }) {
  const labelStyles = 'block text-sm font-medium text-gray-700 mb-2';

  return (
    <label
      className={`${labelStyles} ${className}`.trim()}
      {...props}
    >
      {children}
    </label>
  );
}
