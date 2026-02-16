'use client';

import { useId, isValidElement, cloneElement, Children, type ReactElement } from 'react';

interface FormFieldProps {
  /** Field label text */
  label: string;
  /** Whether field is required (shows asterisk) */
  required?: boolean;
  /** Error message to display */
  error?: string | null;
  /** Helper text shown below input */
  helperText?: string;
  /** Additional CSS classes for wrapper */
  className?: string;
  /** Optional custom ID for the input (auto-generated if not provided) */
  inputId?: string;
  /** The input/select/textarea element */
  children: React.ReactNode;
}

/**
 * FormField - Wrapper component for form inputs with Apple-style validation
 *
 * Features:
 * - Consistent label styling with required indicator
 * - Error state with red border + shake animation
 * - Helper text for format hints
 * - Full ARIA support (aria-invalid, aria-required, aria-describedby)
 * - Screen reader announces errors via role="alert"
 *
 * Based on Apple HIG inline validation approach
 */
export default function FormField({
  label,
  required = false,
  error,
  helperText,
  className = '',
  inputId,
  children,
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = inputId || generatedId;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;
  const hasError = Boolean(error);

  // Build aria-describedby value
  const describedBy = hasError ? errorId : helperText ? helperId : undefined;

  // Clone child element to inject ARIA attributes
  const enhancedChildren = Children.map(children, (child) => {
    if (isValidElement(child)) {
      // Inject ARIA attributes into the input element
      return cloneElement(child as ReactElement<Record<string, unknown>>, {
        id: fieldId,
        'aria-invalid': hasError ? 'true' : undefined,
        'aria-required': required ? 'true' : undefined,
        'aria-describedby': describedBy,
      });
    }
    return child;
  });

  return (
    <div className={`form-field ${className}`}>
      <label
        htmlFor={fieldId}
        className={`form-label ${required ? 'form-label-required' : ''}`}
      >
        {label}
      </label>

      {/* Input wrapper - adds error styling */}
      <div
        className={`form-field-input-wrapper ${hasError ? 'form-field-error' : ''}`}
        data-field-id={fieldId}
      >
        {enhancedChildren}
      </div>

      {/* Error message - announced by screen readers */}
      {hasError && (
        <p id={errorId} className="form-field-error-text" role="alert" aria-live="assertive">
          {error}
        </p>
      )}

      {/* Helper text - linked via aria-describedby */}
      {!hasError && helperText && (
        <p id={helperId} className="form-field-helper-text">
          {helperText}
        </p>
      )}
    </div>
  );
}

/**
 * Standalone error message component for inline validation
 * Use when FormField wrapper isn't suitable
 *
 * @param id - ID for aria-describedby linking
 * @param error - Error message text
 */
export function FieldError({ id, error }: { id?: string; error?: string | null }) {
  if (!error) return null;
  return (
    <p id={id} className="form-field-error-text" role="alert" aria-live="assertive">
      {error}
    </p>
  );
}

/**
 * Standalone helper text component
 *
 * @param id - ID for aria-describedby linking
 * @param text - Helper text content
 */
export function FieldHelper({ id, text }: { id?: string; text: string }) {
  return (
    <p id={id} className="form-field-helper-text">
      {text}
    </p>
  );
}
