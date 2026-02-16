'use client';

import { useState, useCallback, useMemo } from 'react';
import type { ValidationResult } from '@/lib/validationPatterns';

/**
 * Field validation configuration
 */
export interface FieldConfig {
  /** Validation function that returns ValidationResult */
  validate: (value: string, required?: boolean) => ValidationResult;
  /** Whether the field is required */
  required?: boolean;
  /** Optional transform function (e.g., normalisePostcode) */
  transform?: (value: string) => string;
}

/**
 * useValidationState - Reusable hook for form field validation state
 *
 * Eliminates duplication of touched/errors state management across forms.
 * Follows Apple HIG: validates on blur, shows inline errors.
 *
 * @example
 * const { errors, touched, handleBlur, validateAll, getFieldProps } = useValidationState({
 *   postCode: {
 *     validate: validatePostcode,
 *     required: true,
 *     transform: normalisePostcode,
 *   },
 *   vatNumber: {
 *     validate: validateVatNumber,
 *     required: false,
 *   },
 * });
 *
 * // In JSX:
 * <input
 *   className={`form-input ${getFieldProps('postCode').hasError ? 'form-input-error' : ''}`}
 *   onBlur={(e) => handleBlur('postCode', e.target.value)}
 * />
 * <FieldError error={getFieldProps('postCode').error} />
 */
export function useValidationState<T extends Record<string, FieldConfig>>(
  fields: T
) {
  type FieldKeys = keyof T & string;

  // Initialize state from field keys
  const fieldKeys = useMemo(() => Object.keys(fields) as FieldKeys[], [fields]);

  const [errors, setErrors] = useState<Record<FieldKeys, string | null>>(
    () => fieldKeys.reduce((acc, key) => ({ ...acc, [key]: null }), {} as Record<FieldKeys, string | null>)
  );

  const [touched, setTouched] = useState<Record<FieldKeys, boolean>>(
    () => fieldKeys.reduce((acc, key) => ({ ...acc, [key]: false }), {} as Record<FieldKeys, boolean>)
  );

  /**
   * Validate a single field and update state
   */
  const validateField = useCallback(
    (fieldName: FieldKeys, value: string): boolean => {
      const config = fields[fieldName];
      if (!config) return true;

      const transformedValue = config.transform ? config.transform(value) : value;
      const result = config.validate(transformedValue, config.required);

      setErrors((prev) => ({ ...prev, [fieldName]: result.error }));
      return result.isValid;
    },
    [fields]
  );

  /**
   * Handle blur event - marks field as touched and validates
   */
  const handleBlur = useCallback(
    (fieldName: FieldKeys, value: string): void => {
      setTouched((prev) => ({ ...prev, [fieldName]: true }));
      validateField(fieldName, value);
    },
    [validateField]
  );

  /**
   * Validate all fields at once (for form submission)
   * Returns true if all fields are valid
   */
  const validateAll = useCallback(
    (values: Record<FieldKeys, string>): boolean => {
      let allValid = true;
      const newErrors: Record<FieldKeys, string | null> = {} as Record<FieldKeys, string | null>;
      const newTouched: Record<FieldKeys, boolean> = {} as Record<FieldKeys, boolean>;

      for (const fieldName of fieldKeys) {
        const config = fields[fieldName];
        const value = values[fieldName] || '';
        const transformedValue = config.transform ? config.transform(value) : value;
        const result = config.validate(transformedValue, config.required);

        newErrors[fieldName] = result.error;
        newTouched[fieldName] = true;

        if (!result.isValid) {
          allValid = false;
        }
      }

      setErrors(newErrors);
      setTouched(newTouched);
      return allValid;
    },
    [fields, fieldKeys]
  );

  /**
   * Reset validation state for all fields
   */
  const reset = useCallback(() => {
    setErrors(fieldKeys.reduce((acc, key) => ({ ...acc, [key]: null }), {} as Record<FieldKeys, string | null>));
    setTouched(fieldKeys.reduce((acc, key) => ({ ...acc, [key]: false }), {} as Record<FieldKeys, boolean>));
  }, [fieldKeys]);

  /**
   * Reset a single field's validation state
   */
  const resetField = useCallback((fieldName: FieldKeys) => {
    setErrors((prev) => ({ ...prev, [fieldName]: null }));
    setTouched((prev) => ({ ...prev, [fieldName]: false }));
  }, []);

  /**
   * Get props for a specific field (error message and hasError flag)
   */
  const getFieldProps = useCallback(
    (fieldName: FieldKeys) => ({
      error: touched[fieldName] ? errors[fieldName] : null,
      hasError: touched[fieldName] && errors[fieldName] !== null,
      isTouched: touched[fieldName],
    }),
    [errors, touched]
  );

  /**
   * Check if form has any errors (for disabling submit button)
   */
  const hasErrors = useMemo(
    () => Object.values(errors).some((error) => error !== null),
    [errors]
  );

  /**
   * Check if all required fields have been touched
   */
  const allTouched = useMemo(
    () => fieldKeys.every((key) => touched[key]),
    [fieldKeys, touched]
  );

  return {
    errors,
    touched,
    handleBlur,
    validateField,
    validateAll,
    reset,
    resetField,
    getFieldProps,
    hasErrors,
    allTouched,
  };
}

export default useValidationState;
