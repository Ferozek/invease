import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Skeleton, { SkeletonText, SkeletonCard, SkeletonButton, SkeletonInput } from '@/components/ui/Skeleton';

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
}));

describe('Skeleton', () => {
  it('renders with role="status" for accessibility', () => {
    render(<Skeleton />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has aria-label for screen readers', () => {
    render(<Skeleton />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading...');
  });

  it('applies pulse animation by default', () => {
    render(<Skeleton />);
    expect(screen.getByRole('status')).toHaveClass('animate-pulse');
  });

  it('disables animation when animation="none"', () => {
    render(<Skeleton animation="none" />);
    expect(screen.getByRole('status')).not.toHaveClass('animate-pulse');
  });

  it('applies variant border radius', () => {
    const { rerender } = render(<Skeleton variant="circular" />);
    expect(screen.getByRole('status')).toHaveClass('rounded-full');

    rerender(<Skeleton variant="rectangular" />);
    expect(screen.getByRole('status')).toHaveClass('rounded-none');

    rerender(<Skeleton variant="rounded" />);
    expect(screen.getByRole('status')).toHaveClass('rounded-xl');
  });

  it('applies custom width and height', () => {
    render(<Skeleton width={200} height={40} />);
    const el = screen.getByRole('status');
    expect(el.style.width).toBe('200px');
    expect(el.style.height).toBe('40px');
  });

  it('accepts string dimensions', () => {
    render(<Skeleton width="50%" height="2rem" />);
    const el = screen.getByRole('status');
    expect(el.style.width).toBe('50%');
    expect(el.style.height).toBe('2rem');
  });
});

describe('SkeletonText', () => {
  it('renders 3 skeleton lines by default', () => {
    render(<SkeletonText />);
    const skeletons = screen.getAllByRole('status');
    expect(skeletons).toHaveLength(3);
  });

  it('renders custom number of lines', () => {
    render(<SkeletonText lines={5} />);
    expect(screen.getAllByRole('status')).toHaveLength(5);
  });

  it('last line is shorter (60% width)', () => {
    render(<SkeletonText lines={2} />);
    const skeletons = screen.getAllByRole('status');
    expect(skeletons[1].style.width).toBe('60%');
    expect(skeletons[0].style.width).toBe('100%');
  });
});

describe('SkeletonCard', () => {
  it('renders with avatar circle and text lines', () => {
    render(<SkeletonCard />);
    const skeletons = screen.getAllByRole('status');
    // 1 circular avatar + 2 header lines + 3 text lines = 6
    expect(skeletons.length).toBeGreaterThanOrEqual(5);
  });
});

describe('SkeletonButton', () => {
  it('renders with 44px height (Apple HIG touch target)', () => {
    render(<SkeletonButton />);
    const el = screen.getByRole('status');
    expect(el.style.height).toBe('44px');
  });

  it('applies fullWidth', () => {
    render(<SkeletonButton fullWidth />);
    expect(screen.getByRole('status').style.width).toBe('100%');
  });
});

describe('SkeletonInput', () => {
  it('renders label skeleton and input skeleton', () => {
    render(<SkeletonInput />);
    const skeletons = screen.getAllByRole('status');
    expect(skeletons).toHaveLength(2);
  });

  it('input skeleton has 44px height', () => {
    render(<SkeletonInput />);
    const skeletons = screen.getAllByRole('status');
    expect(skeletons[1].style.height).toBe('44px');
  });
});
