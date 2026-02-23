import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmptyState, { EmptyStateIcons } from '@/components/ui/EmptyState';

// Mock framer-motion to avoid animation complexity in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...filterMotionProps(props)}>{children}</div>
    ),
  },
  useReducedMotion: () => false,
}));

// Filter out framer-motion-specific props that aren't valid DOM attributes
function filterMotionProps(props: Record<string, unknown>) {
  const motionKeys = ['animate', 'initial', 'exit', 'transition', 'whileInView', 'style', 'className'];
  const filtered: Record<string, unknown> = {};
  for (const key of Object.keys(props)) {
    if (key === 'className' || key === 'style') {
      filtered[key] = props[key];
    } else if (!motionKeys.includes(key) && !key.startsWith('while')) {
      filtered[key] = props[key];
    }
  }
  return filtered;
}

// Mock haptics
vi.mock('@/lib/haptics', () => ({
  hapticFeedback: { light: vi.fn(), medium: vi.fn(), error: vi.fn() },
}));

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No invoices yet" />);
    expect(screen.getByText('No invoices yet')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<EmptyState title="Empty" description="Create your first invoice" />);
    expect(screen.getByText('Create your first invoice')).toBeInTheDocument();
  });

  it('does not render description when omitted', () => {
    render(<EmptyState title="Empty" />);
    expect(screen.queryByText('Create your first invoice')).not.toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    const onClick = vi.fn();
    render(
      <EmptyState
        title="No items"
        action={{ label: 'Add Item', onClick }}
      />
    );
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument();
  });

  it('calls action onClick when button clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <EmptyState
        title="Empty"
        action={{ label: 'Create', onClick }}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Create' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('applies size variants', () => {
    const { container, rerender } = render(<EmptyState title="Small" size="sm" />);
    expect(container.firstChild).toHaveClass('py-6');

    rerender(<EmptyState title="Large" size="lg" />);
    expect(container.firstChild).toHaveClass('py-16');
  });

  it('renders icon when provided', () => {
    render(<EmptyState title="Search" icon={EmptyStateIcons.search} />);
    // Icon is wrapped in a motion.div
    expect(screen.getByText('Search')).toBeInTheDocument();
  });
});

describe('EmptyStateIcons', () => {
  it('exports all default icon types', () => {
    expect(EmptyStateIcons.invoice).toBeDefined();
    expect(EmptyStateIcons.lineItems).toBeDefined();
    expect(EmptyStateIcons.history).toBeDefined();
    expect(EmptyStateIcons.search).toBeDefined();
  });
});
