import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card, { CardHeader, CardBody, CardFooter } from '@/components/ui/Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('defaults to plain variant', () => {
    render(<Card>Plain</Card>);
    expect(screen.getByText('Plain').closest('div')).toHaveClass('card-plain');
  });

  it('applies accent variant', () => {
    render(<Card variant="accent">Accent</Card>);
    expect(screen.getByText('Accent').closest('div')).toHaveClass('card-accent');
  });

  it('applies hover animation classes', () => {
    render(<Card hover>Hoverable</Card>);
    const card = screen.getByText('Hoverable').closest('div')!;
    expect(card.className).toContain('hover:shadow-lg');
    expect(card.className).toContain('hover:-translate-y-1');
  });

  it('does not apply hover classes by default', () => {
    render(<Card>Static</Card>);
    expect(screen.getByText('Static').closest('div')!.className).not.toContain('hover:shadow-lg');
  });

  it('accepts additional className', () => {
    render(<Card className="mt-4">Extra</Card>);
    expect(screen.getByText('Extra').closest('div')).toHaveClass('mt-4');
  });
});

describe('CardHeader', () => {
  it('renders children with bottom border', () => {
    render(<CardHeader>Header</CardHeader>);
    const el = screen.getByText('Header').closest('div')!;
    expect(el.className).toContain('border-b');
    expect(el.className).toContain('px-6');
  });
});

describe('CardBody', () => {
  it('renders children with padding', () => {
    render(<CardBody>Body</CardBody>);
    const el = screen.getByText('Body').closest('div')!;
    expect(el.className).toContain('px-6');
    expect(el.className).toContain('py-4');
  });
});

describe('CardFooter', () => {
  it('renders children with top border and elevated bg', () => {
    render(<CardFooter>Footer</CardFooter>);
    const el = screen.getByText('Footer').closest('div')!;
    expect(el.className).toContain('border-t');
    expect(el.className).toContain('bg-[var(--surface-elevated)]');
  });
});
