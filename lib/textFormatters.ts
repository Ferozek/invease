/**
 * Text Formatting Utilities
 * Functions for proper case formatting of form fields
 */

/**
 * Convert string to Title Case (capitalize first letter of each word)
 * Used for: Company Name, Customer Name, Address fields
 */
export function toTitleCase(str: string): string {
  if (!str) return str;
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format postcode to uppercase
 * Used for: Post Code fields (ALL CAPS per UK standard)
 */
export function formatPostcode(str: string): string {
  if (!str) return str;
  return str.toUpperCase().trim();
}

/**
 * Format on blur - applies title case formatting
 * Returns formatted value for controlled inputs
 */
export function formatOnBlurTitleCase(value: string): string {
  return toTitleCase(value.trim());
}

/**
 * Format on blur - applies uppercase formatting for postcodes
 * Returns formatted value for controlled inputs
 */
export function formatOnBlurPostcode(value: string): string {
  return formatPostcode(value);
}
