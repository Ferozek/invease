'use client';

import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/formatters';

/**
 * CollectionRing — Apple Card spending wheel pattern
 *
 * Single ring showing collection progress: "£X collected of £Y invoiced"
 * Green at 100%, blue when in progress. Animated on mount.
 */
export default function CollectionRing({ collected, invoiced }: { collected: number; invoiced: number }) {
  const percentage = invoiced > 0 ? Math.min((collected / invoiced) * 100, 100) : 0;
  const radius = 40;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const ringColor = percentage >= 100 ? '#34C759' : '#007AFF';

  return (
    <div className="flex flex-col items-center shrink-0" data-testid="collection-ring">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 96 96" className="w-full h-full -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="var(--surface-border)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-[var(--text-primary)]">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      <p className="text-[10px] text-[var(--text-muted)] mt-1 text-center leading-tight">
        {formatCurrency(collected)}
        <br />
        collected
      </p>
    </div>
  );
}
