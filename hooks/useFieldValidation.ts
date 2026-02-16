'use client';

import { useState, useCallback } from 'react';
import type { ValidationResult } from '@/lib/validationPatterns';

export interface ValidationRule {
  /** Regex pattern to match */
  pattern?: RegExp;
  /** Minimum length */
  minLength?: number;
  /** Maximum length */
  maxLength?: number;
  /** Field is required */
  required?: boolean;
  /** Custom validation function - returns error message or null */
  custom?: (value: string) => string | null;
  /** Custom validation function returning ValidationResult */
  validate?: (value: string) => ValidationResult;
}

export interface UseFieldValidationOptions {
  /** Field display name for error messages */
  fieldName: string;
  /** Validation rules */
  rules: ValidationRule;
  /** Normalize function to apply before validation */
  normalize?: (value: string) => string;
}

export interface UseFieldValidationReturn {
  /** Current error message (null if valid) */
  error: string | null;
  /** Whether field has been interacted with */
  touched: boolean;
  /** Whether field is currently valid */
  isValid: boolean;
  /** Validate the current value */
  validate: (value: string) => boolean;
  /** Handle blur event - validates and marks as touched */
  handleBlur: (value: string) => void;
  /** Reset validation state */
  reset: () => void;
  /** Mark field as touched without validating */
  touch: () => void;
  /** Clear error */
  clearError: () => void;
}

/**
 * useFieldValidation - Hook for Apple-style inline field validation
 *
 * Features:
 * - Validates on blur (not every keystroke)
 * - Tracks touched state
 * - Supports multiple validation rules
 * - Supports custom validation functions
 * - Supports normalization (e.g., uppercase postcodes)
 *
 * @example
 * const { error, handleBlur, validate } = useFieldValidation({
 *   fieldName: 'Postcode',
 *   rules: {
 *     required: true,
 *     validate: (value) => validatePostcode(value, true),
 *   },
 *   normalize: normalisePostcode,
 * });
 */
export function useFieldValidation({
  fieldName,
  rules,
  normalize,
}: UseFieldValidationOptions): UseFieldValidationReturn {
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const validate = useCallback(
    (value: string): boolean => {
      const normalizedValue = normalize ? normalize(value) : value;

      // Check required
      if (rules.required && !normalizedValue.trim()) {
        setError(`${fieldName} is required`);
        return false;
      }

      // Skip other validations if empty and not required
      if (!normalizedValue.trim()) {
        setError(null);
        return true;
      }

      // Check min length
      if (rules.minLength && normalizedValue.length < rules.minLength) {
        setError(`${fieldName} must be at least ${rules.minLength} characters`);
        return false;
      }

      // Check max length
      if (rules.maxLength && normalizedValue.length > rules.maxLength) {
        setError(`${fieldName} must be no more than ${rules.maxLength} characters`);
        return false;
      }

      // Check pattern
      if (rules.pattern && !rules.pattern.test(normalizedValue)) {
        setError(`Please enter a valid ${fieldName.toLowerCase()}`);
        return false;
      }

      // Check custom validation function
      if (rules.custom) {
        const customError = rules.custom(normalizedValue);
        if (customError) {
          setError(customError);
          return false;
        }
      }

      // Check validation function returning ValidationResult
      if (rules.validate) {
        const result = rules.validate(normalizedValue);
        if (!result.isValid) {
          setError(result.error);
          return false;
        }
      }

      setError(null);
      return true;
    },
    [fieldName, rules, normalize]
  );

  const handleBlur = useCallback(
    (value: string) => {
      setTouched(true);
      validate(value);
    },
    [validate]
  );

  const reset = useCallback(() => {
    setError(null);
    setTouched(false);
  }, []);

  const touch = useCallback(() => {
    setTouched(true);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    touched,
    isValid: error === null,
    validate,
    handleBlur,
    reset,
    touch,
    clearError,
  };
}

/**
 * useFormValidation - Hook for validating multiple fields at once
 *
 * @example
 * const { errors, validateAll, isValid } = useFormValidation({
 *   postcode: {
 *     value: postCode,
 *     rules: { required: true, validate: validatePostcode },
 *   },
 *   vatNumber: {
 *     value: vatNumber,
 *     rules: { validate: (v) => validateVatNumber(v, false) },
 *   },
 * });
 */
export interface FormFieldConfig {
  value: string;
  rules: ValidationRule;
  fieldName?: string;
  normalize?: (value: string) => string;
}

export function useFormValidation(
  fields: Record<string, FormFieldConfig>
): {
  errors: Record<string, string | null>;
  validateAll: () => boolean;
  validateField: (fieldName: string) => boolean;
  isValid: boolean;
  reset: () => void;
} {
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const validateField = useCallback(
    (fieldKey: string): boolean => {
      const field = fields[fieldKey];
      if (!field) return true;

      const { value, rules, fieldName = fieldKey, normalize } = field;
      const normalizedValue = normalize ? normalize(value) : value;

      // Check required
      if (rules.required && !normalizedValue.trim()) {
        setErrors((prev) => ({ ...prev, [fieldKey]: `${fieldName} is required` }));
        return false;
      }

      // Skip other validations if empty
      if (!normalizedValue.trim()) {
        setErrors((prev) => ({ ...prev, [fieldKey]: null }));
        return true;
      }

      // Check validation function
      if (rules.validate) {
        const result = rules.validate(normalizedValue);
        if (!result.isValid) {
          setErrors((prev) => ({ ...prev, [fieldKey]: result.error }));
          return false;
        }
      }

      // Check pattern
      if (rules.pattern && !rules.pattern.test(normalizedValue)) {
        setErrors((prev) => ({
          ...prev,
          [fieldKey]: `Please enter a valid ${fieldName.toLowerCase()}`,
        }));
        return false;
      }

      // Check custom
      if (rules.custom) {
        const customError = rules.custom(normalizedValue);
        if (customError) {
          setErrors((prev) => ({ ...prev, [fieldKey]: customError }));
          return false;
        }
      }

      setErrors((prev) => ({ ...prev, [fieldKey]: null }));
      return true;
    },
    [fields]
  );

  const validateAll = useCallback((): boolean => {
    let allValid = true;
    const newErrors: Record<string, string | null> = {};

    for (const fieldKey of Object.keys(fields)) {
      const field = fields[fieldKey];
      const { value, rules, fieldName = fieldKey, normalize } = field;
      const normalizedValue = normalize ? normalize(value) : value;

      let fieldError: string | null = null;

      // Check required
      if (rules.required && !normalizedValue.trim()) {
        fieldError = `${fieldName} is required`;
        allValid = false;
      } else if (normalizedValue.trim()) {
        // Check validation function
        if (rules.validate) {
          const result = rules.validate(normalizedValue);
          if (!result.isValid) {
            fieldError = result.error;
            allValid = false;
          }
        }

        // Check pattern
        if (!fieldError && rules.pattern && !rules.pattern.test(normalizedValue)) {
          fieldError = `Please enter a valid ${fieldName.toLowerCase()}`;
          allValid = false;
        }

        // Check custom
        if (!fieldError && rules.custom) {
          const customError = rules.custom(normalizedValue);
          if (customError) {
            fieldError = customError;
            allValid = false;
          }
        }
      }

      newErrors[fieldKey] = fieldError;
    }

    setErrors(newErrors);
    return allValid;
  }, [fields]);

  const reset = useCallback(() => {
    setErrors({});
  }, []);

  const isValid = Object.values(errors).every((e) => e === null);

  return {
    errors,
    validateAll,
    validateField,
    isValid,
    reset,
  };
}

export default useFieldValidation;
