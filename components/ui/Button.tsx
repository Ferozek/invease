/**
 * Button Component
 * Reusable button with brand-consistent styling
 * Variants: primary (red), secondary (blue), ghost (outline), muted (light blue)
 */

'use client';

import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'muted';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    className = '',
    disabled,
    children,
    ...props
  },
  ref
) {
  // Base styles
  const baseStyles = 'cursor-pointer inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  // Variant styles
  const variantStyles = {
    primary: 'btn-primary bg-[var(--brand-red)] hover:bg-[#a31b24] text-white focus:ring-[var(--brand-red)]',
    secondary: 'btn-secondary bg-[var(--brand-blue)] hover:bg-[#08436b] text-white focus:ring-[var(--brand-blue)]',
    ghost: 'btn-ghost border-2 border-[var(--brand-blue)] text-[var(--brand-blue)] hover:bg-[var(--brand-blue)] hover:text-white focus:ring-[var(--brand-blue)]',
    muted: 'btn-muted bg-[var(--brand-blue-50)] text-[var(--brand-blue)] hover:bg-[var(--brand-blue)] hover:text-white focus:ring-[var(--brand-blue)]',
  };

  // Size styles - all meet Apple HIG 44px minimum touch target
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm rounded-lg min-h-[44px]',
    md: 'px-4 py-3 text-base rounded-xl min-h-[44px]',
    lg: 'px-6 py-4 text-lg rounded-xl min-h-[52px]',
  };

  // Width style
  const widthStyle = fullWidth ? 'w-full' : '';

  // Disabled/loading state
  const disabledStyles = (disabled || loading) ? 'opacity-50 cursor-not-allowed' : '';

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${disabledStyles} ${className}`.trim();

  return (
    <button
      ref={ref}
      className={combinedClassName}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <>
          <span className="sr-only">Loading...</span>
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </>
      )}
      {children}
    </button>
  );
});

export default Button;
