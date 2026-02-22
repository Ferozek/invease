/**
 * PageHeader Component
 * Consistent page header with icon, title, description, and optional actions
 */

'use client';

import { ReactNode } from 'react';

export interface PageHeaderProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
  gradient?: boolean;
  className?: string;
}

export default function PageHeader({
  icon,
  title,
  description,
  actions,
  gradient = false,
  className = '',
}: PageHeaderProps) {
  const backgroundStyle = gradient
    ? 'bg-[var(--brand-blue)]'
    : '';

  const textColor = gradient ? 'text-white' : 'text-[var(--text-primary)]';
  const descriptionColor = gradient ? 'text-white/90' : 'text-[var(--text-secondary)]';

  return (
    <div className={`${backgroundStyle} ${gradient ? 'py-12' : 'mb-8'} ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {icon && (
              <div className={`flex-shrink-0 ${gradient ? 'bg-white/20' : 'bg-[var(--brand-blue-50)]'} rounded-xl p-3`}>
                <div className={`w-8 h-8 flex items-center justify-center ${gradient ? 'text-white' : 'text-[var(--brand-blue)]'}`}>
                  {icon}
                </div>
              </div>
            )}
            <div>
              <h1 className={`text-3xl font-bold ${textColor} mb-2`}>
                {title}
              </h1>
              {description && (
                <p className={`${descriptionColor} max-w-2xl`}>
                  {description}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
