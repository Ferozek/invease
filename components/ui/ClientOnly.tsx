'use client';

import { useState, useEffect, ReactNode } from 'react';
import { SkeletonCard } from './Skeleton';

interface ClientOnlyProps {
  /** Children to render after hydration */
  children: ReactNode;
  /** Fallback UI during SSR/hydration */
  fallback?: ReactNode;
}

/**
 * ClientOnly Component
 * Prevents hydration mismatch by only rendering children on client
 *
 * Apple HIG: Show loading state during hydration to prevent flash
 *
 * @example
 * <ClientOnly fallback={<SkeletonCard />}>
 *   <ComponentThatUsesLocalStorage />
 * </ClientOnly>
 */
export default function ClientOnly({ children, fallback }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  // Standard hydration pattern - setState is intentional here
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return fallback ?? <SkeletonCard />;
  }

  return <>{children}</>;
}

/**
 * Hook for checking if component has hydrated
 */
export function useHasMounted(): boolean {
  const [hasMounted, setHasMounted] = useState(false);

  // Standard hydration pattern - setState is intentional here
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true);
  }, []);

  return hasMounted;
}
