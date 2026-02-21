import { useState, useCallback } from 'react';

/**
 * useAccordion - Platform-agnostic accordion state management
 *
 * Manages which section is open (only one at a time) and supports
 * auto-advancing to the next incomplete section.
 *
 * Designed to be reusable across web (Next.js) and mobile (Expo).
 * No DOM dependencies — all presentation logic stays in the component.
 *
 * Completion state is NOT stored here — it flows directly from
 * useFormCompletion to the FormAccordionSection props. This hook
 * only manages active section state.
 */

export interface SectionDef {
  id: string;
  isComplete: boolean;
}

export interface UseAccordionOptions {
  /** ID of the initially open section. If not set, first section opens. */
  defaultOpen?: string;
  /** Section IDs in order (for openNext navigation) */
  sectionIds: string[];
}

export interface UseAccordionReturn {
  /** Currently open section ID, or null if all collapsed */
  activeSection: string | null;
  /** Toggle a section open/closed */
  toggleSection: (id: string) => void;
  /** Force-open a specific section */
  openSection: (id: string) => void;
  /** Close all sections */
  closeAll: () => void;
  /** Auto-advance to the next incomplete section. Pass current completion state. */
  openNext: (completions: SectionDef[]) => void;
}

export function useAccordion({ defaultOpen, sectionIds }: UseAccordionOptions): UseAccordionReturn {
  const [activeSection, setActiveSection] = useState<string | null>(() => {
    if (defaultOpen) return defaultOpen;
    return sectionIds[0] ?? null;
  });

  const toggleSection = useCallback((id: string) => {
    setActiveSection((current) => (current === id ? null : id));
  }, []);

  const openSection = useCallback((id: string) => {
    setActiveSection(id);
  }, []);

  const closeAll = useCallback(() => {
    setActiveSection(null);
  }, []);

  const openNext = useCallback((completions: SectionDef[]) => {
    setActiveSection((current) => {
      const currentIndex = completions.findIndex((s) => s.id === current);

      // Find next incomplete section after current
      for (let i = currentIndex + 1; i < completions.length; i++) {
        if (!completions[i].isComplete) {
          return completions[i].id;
        }
      }
      // Wrap around: check from start
      for (let i = 0; i <= currentIndex; i++) {
        if (!completions[i].isComplete) {
          return completions[i].id;
        }
      }
      // All complete — collapse all
      return null;
    });
  }, []);

  return {
    activeSection,
    toggleSection,
    openSection,
    closeAll,
    openNext,
  };
}

export default useAccordion;
