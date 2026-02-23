import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '@/components/ui/Button';

// Mock haptics (not available in jsdom)
vi.mock('@/lib/haptics', () => ({
  hapticFeedback: { light: vi.fn(), medium: vi.fn(), error: vi.fn() },
}));

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Save Invoice</Button>);
    expect(screen.getByRole('button', { name: 'Save Invoice' })).toBeInTheDocument();
  });

  it('defaults to primary variant', () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-primary');
  });

  it('applies variant classes', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-destructive');

    rerender(<Button variant="ghost">Cancel</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-ghost');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-secondary');

    rerender(<Button variant="muted">Muted</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-muted');
  });

  it('applies size classes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('min-h-[44px]');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('min-h-[52px]');
  });

  it('enforces 44px minimum touch target on all sizes', () => {
    const { rerender } = render(<Button size="sm">Sm</Button>);
    expect(screen.getByRole('button').className).toContain('min-h-[44px]');

    rerender(<Button size="md">Md</Button>);
    expect(screen.getByRole('button').className).toContain('min-h-[44px]');
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click Me</Button>);

    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('does not fire click when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>No Click</Button>);

    await user.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('shows loading spinner and sr-only text', () => {
    render(<Button loading>Saving</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(screen.getByText('Loading...')).toHaveClass('sr-only');
  });

  it('applies fullWidth class', () => {
    render(<Button fullWidth>Full Width</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('sets aria-disabled when loading', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<Button ref={ref}>Ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('secondary variant is visually distinct from primary (tinted, not filled)', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const classes = screen.getByRole('button').className;
    // Secondary should have tinted background, not the primary CTA bg
    expect(classes).toContain('brand-blue-50');
    expect(classes).not.toContain('cta-primary-bg');
  });
});
