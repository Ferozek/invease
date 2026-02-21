/**
 * UI Components Barrel Export
 * Single import point for all reusable UI components
 */

// Core Components
export { default as Button } from './Button';
export { default as Card } from './Card';
export { default as PageHeader } from './PageHeader';
export { default as ConfirmDialog } from './ConfirmDialog';
export { default as ThemeToggle } from './ThemeToggle';
export { default as FocusTrap } from './FocusTrap';
export { default as CollapsibleSection } from './CollapsibleSection';
export { default as FormAccordion, FormAccordionSection } from './FormAccordion';

// Form Components
export { default as FormField, FieldError } from './FormField';

// Animation Components
export { default as AnimatedNumber, useAnimatedNumber } from './AnimatedNumber';

// Helper Components (Apple HIG)
export { default as Tooltip } from './Tooltip';
export { default as InfoIcon } from './InfoIcon';
export { default as EmptyState, EmptyStateIcons } from './EmptyState';
export { default as KeyboardHint, SHORTCUTS } from './KeyboardHint';
export { default as FirstRunHint, resetAllHints } from './FirstRunHint';

// Error Handling & Loading States
export { default as ErrorBoundary, PDFErrorBoundary } from './ErrorBoundary';
export { default as Skeleton, SkeletonText, SkeletonCard, SkeletonButton, SkeletonInput } from './Skeleton';
export { default as ClientOnly, useHasMounted } from './ClientOnly';

// Icons
export * from './icons';
