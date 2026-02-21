import { useState, useCallback, useRef } from 'react';

/**
 * useAccordion - Platform-agnostic accordion state management
 *
 * Manages which section is open (only one at a time), tracks completion
 * state, and supports auto-advancing to the next incomplete section.
 *
 * Designed to be reusable across web (Next.js) and mobile (Expo).
 * No DOM dependencies — all presentation logic stays in the component.
 */

export interface AccordionSection {
  id: string;
  isComplete: boolean;
  summary?: string;
}

export interface UseAccordionOptions {
  /** ID of the initially open section. If not set, first incomplete section opens. */
  defaultOpen?: string;
  /** All section definitions with initial state */
  sections: AccordionSection[];
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
  /** Auto-advance to the next incomplete section after current */
  openNext: () => void;
  /** Current section states */
  sections: AccordionSection[];
  /** Update a section's completion state and summary */
  updateSection: (id: string, updates: Partial<Omit<AccordionSection, 'id'>>) => void;
}

export function useAccordion({ defaultOpen, sections: initialSections }: UseAccordionOptions): UseAccordionReturn {
  const sectionsRef = useRef(initialSections);
  const [sections, setSections] = useState<AccordionSection[]>(initialSections);

  // Determine initial open section: explicit default, or first incomplete
  const getInitialOpen = () => {
    if (defaultOpen) return defaultOpen;
    const firstIncomplete = initialSections.find((s) => !s.isComplete);
    return firstIncomplete?.id ?? null;
  };

  const [activeSection, setActiveSection] = useState<string | null>(getInitialOpen);

  const toggleSection = useCallback((id: string) => {
    setActiveSection((current) => (current === id ? null : id));
  }, []);

  const openSection = useCallback((id: string) => {
    setActiveSection(id);
  }, []);

  const closeAll = useCallback(() => {
    setActiveSection(null);
  }, []);

  const openNext = useCallback(() => {
    const currentSections = sectionsRef.current;
    const currentIndex = currentSections.findIndex((s) => s.id === activeSection);
    // Find next incomplete section after current
    for (let i = currentIndex + 1; i < currentSections.length; i++) {
      if (!currentSections[i].isComplete) {
        setActiveSection(currentSections[i].id);
        return;
      }
    }
    // If no incomplete after current, check from start
    for (let i = 0; i <= currentIndex; i++) {
      if (!currentSections[i].isComplete) {
        setActiveSection(currentSections[i].id);
        return;
      }
    }
    // All complete — collapse
    setActiveSection(null);
  }, [activeSection]);

  const updateSection = useCallback((id: string, updates: Partial<Omit<AccordionSection, 'id'>>) => {
    setSections((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      sectionsRef.current = next;
      return next;
    });
  }, []);

  return {
    activeSection,
    toggleSection,
    openSection,
    closeAll,
    openNext,
    sections,
    updateSection,
  };
}

export default useAccordion;
