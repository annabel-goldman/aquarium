/**
 * Input component with Tailwind styling
 * Replaces: .input-field
 */

export function Input({
  className = '',
  ...props
}) {
  const baseStyles = 'w-full px-3 py-2 border border-gray-300 rounded-md text-base transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

  return (
    <input
      className={`${baseStyles} ${className}`.trim()}
      {...props}
    />
  );
}

export function Select({
  className = '',
  children,
  ...props
}) {
  const baseStyles = 'w-full px-3 py-2 border border-gray-300 rounded-md text-base transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

  return (
    <select
      className={`${baseStyles} ${className}`.trim()}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({
  className = '',
  children,
  ...props
}) {
  const baseStyles = 'block text-sm font-medium text-gray-700 mb-2';

  return (
    <label
      className={`${baseStyles} ${className}`.trim()}
      {...props}
    >
      {children}
    </label>
  );
}

