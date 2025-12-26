/**
 * Button component with Tailwind variants
 * Replaces: .btn-primary, .btn-secondary, .floating-button, .back-button, .delete-fish-btn, .delete-tank-btn
 */

const variantStyles = {
  primary: 'bg-blue-500 hover:bg-blue-600 text-white',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  'danger-ghost': 'text-red-500 hover:bg-red-50 hover:text-red-600',
  ghost: 'bg-white hover:bg-gray-50 text-gray-900',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  icon: 'p-2',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  floating = false,
  back = false,
  icon = false,
  className = '',
  disabled = false,
  ...props
}) {
  const baseStyles = 'rounded-md font-medium border-none cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const floatingStyles = floating
    ? 'fixed top-8 right-8 w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:shadow-xl z-40 bg-blue-700 hover:bg-blue-800 text-white'
    : '';
  
  const backStyles = back
    ? 'fixed top-8 left-8 w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:shadow-xl z-40 bg-blue-700 hover:bg-blue-800 text-white'
    : '';
  
  // Icon buttons use danger-ghost for subtle danger styling
  const effectiveVariant = icon && variant === 'danger' ? 'danger-ghost' : variant;
  
  const iconStyles = icon && !floating && !back
    ? 'p-1 rounded hover:bg-gray-100'
    : '';

  const variantClass = variantStyles[effectiveVariant] || variantStyles.primary;
  const sizeClass = floating || back || icon ? '' : sizeStyles[size];

  return (
    <button
      className={`${baseStyles} ${variantClass} ${sizeClass} ${floatingStyles} ${backStyles} ${iconStyles} ${className}`.trim()}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
