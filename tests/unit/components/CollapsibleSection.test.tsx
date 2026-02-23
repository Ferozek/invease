import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CollapsibleSection from '@/components/ui/CollapsibleSection';

// Mock matchMedia for reduced motion detection
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe('CollapsibleSection', () => {
  it('renders title', () => {
    render(
      <CollapsibleSection title="Customer Details">
        <p>Form content</p>
      </CollapsibleSection>
    );
    expect(screen.getByText('Customer Details')).toBeInTheDocument();
  });

  it('starts collapsed by default', () => {
    render(
      <CollapsibleSection title="Section">
        <p>Hidden content</p>
      </CollapsibleSection>
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });

  it('starts expanded when defaultOpen=true', () => {
    render(
      <CollapsibleSection title="Section" defaultOpen>
        <p>Visible content</p>
      </CollapsibleSection>
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  it('toggles on click', async () => {
    const user = userEvent.setup();
    render(
      <CollapsibleSection title="Toggle Me">
        <p>Content</p>
      </CollapsibleSection>
    );

    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('has proper ARIA: aria-expanded + aria-controls', () => {
    render(
      <CollapsibleSection title="ARIA Test">
        <p>Content</p>
      </CollapsibleSection>
    );
    const trigger = screen.getByRole('button');
    const controlsId = trigger.getAttribute('aria-controls');
    expect(controlsId).toBeTruthy();
    expect(document.getElementById(controlsId!)).toBeInTheDocument();
  });

  it('content region has role="region" and aria-labelledby', () => {
    render(
      <CollapsibleSection title="Region Test">
        <p>Content</p>
      </CollapsibleSection>
    );
    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-labelledby');
  });

  it('shows description when collapsed', () => {
    render(
      <CollapsibleSection title="Section" description="Helper text">
        <p>Content</p>
      </CollapsibleSection>
    );
    expect(screen.getByText('Helper text')).toBeInTheDocument();
  });

  it('hides description when expanded', async () => {
    const user = userEvent.setup();
    render(
      <CollapsibleSection title="Section" description="Helper text">
        <p>Content</p>
      </CollapsibleSection>
    );

    await user.click(screen.getByRole('button'));
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
  });

  it('accepts additional className', () => {
    const { container } = render(
      <CollapsibleSection title="Test" className="mt-4">
        <p>Content</p>
      </CollapsibleSection>
    );
    expect(container.firstChild).toHaveClass('mt-4');
  });
});
