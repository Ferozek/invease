/**
 * Customer Matching Utilities
 *
 * Detects near-duplicate customer names for merge suggestions.
 * Apple Contacts pattern: "These might be the same customer"
 *
 * Strategies:
 * 1. Normalised comparison (case, whitespace, suffixes like Ltd/Limited)
 * 2. Substring containment (one name contains the other)
 */

// Common UK business suffixes that should be treated as equivalent
const SUFFIX_PAIRS: [RegExp, string][] = [
  [/\blimited\b/i, 'ltd'],
  [/\bltd\b\.?/i, 'ltd'],
  [/\bplc\b\.?/i, 'plc'],
  [/\bllp\b\.?/i, 'llp'],
  [/\binc\b\.?/i, 'inc'],
  [/\b&\b/g, 'and'],
];

/** Normalise a customer name for comparison */
function normalise(name: string): string {
  let n = name.toLowerCase().trim();
  // Normalise suffixes
  for (const [pattern, replacement] of SUFFIX_PAIRS) {
    n = n.replace(pattern, replacement);
  }
  // Remove punctuation and extra whitespace
  n = n.replace(/[.,'"]/g, '').replace(/\s+/g, ' ').trim();
  return n;
}

export interface MergeSuggestion {
  nameA: string;
  nameB: string;
  reason: string;
}

/**
 * Find potential duplicate customers from a list of unique names.
 * Returns pairs that might be the same customer.
 */
export function findDuplicateCustomers(names: string[]): MergeSuggestion[] {
  const suggestions: MergeSuggestion[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const a = names[i];
      const b = names[j];
      const pairKey = [a, b].sort().join('|');
      if (seen.has(pairKey)) continue;

      const normA = normalise(a);
      const normB = normalise(b);

      // Exact match after normalisation (e.g. "ABC Limited" vs "ABC Ltd")
      if (normA === normB) {
        suggestions.push({ nameA: a, nameB: b, reason: 'Same name (different formatting)' });
        seen.add(pairKey);
        continue;
      }

      // One contains the other (e.g. "John Smith" vs "John Smith Builders")
      if (normA.length > 3 && normB.length > 3) {
        if (normA.includes(normB) || normB.includes(normA)) {
          suggestions.push({ nameA: a, nameB: b, reason: 'Similar names' });
          seen.add(pairKey);
        }
      }
    }
  }

  return suggestions;
}
