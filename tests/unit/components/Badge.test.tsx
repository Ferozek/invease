import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '@/components/ui/Badge';

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Paid</Badge>);
    expect(screen.getByText('Paid')).toBeInTheDocument();
  });

  it('defaults to neutral variant', () => {
    render(<Badge>Status</Badge>);
    expect(screen.getByText('Status')).toHaveClass('bg-[var(--badge-neutral-bg)]');
  });

  it('applies variant styles', () => {
    const { rerender } = render(<Badge variant="success">Paid</Badge>);
    expect(screen.getByText('Paid')).toHaveClass('bg-[var(--badge-success-bg)]');

    rerender(<Badge variant="warning">Overdue</Badge>);
    expect(screen.getByText('Overdue')).toHaveClass('bg-[var(--badge-warning-bg)]');

    rerender(<Badge variant="info">Draft</Badge>);
    expect(screen.getByText('Draft')).toHaveClass('bg-[var(--brand-blue-50)]');
  });

  it('applies size styles', () => {
    const { rerender } = render(<Badge size="sm">Small</Badge>);
    expect(screen.getByText('Small')).toHaveClass('text-xs');

    rerender(<Badge size="md">Medium</Badge>);
    expect(screen.getByText('Medium')).toHaveClass('text-sm');

    rerender(<Badge size="lg">Large</Badge>);
    expect(screen.getByText('Large')).toHaveClass('text-base');
  });

  it('renders as inline-flex span', () => {
    render(<Badge>Status</Badge>);
    const el = screen.getByText('Status');
    expect(el.tagName).toBe('SPAN');
    expect(el).toHaveClass('inline-flex');
  });

  it('accepts additional className', () => {
    render(<Badge className="ml-2">Extra</Badge>);
    expect(screen.getByText('Extra')).toHaveClass('ml-2');
  });
});
