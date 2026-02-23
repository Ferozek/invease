import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FormField, { FieldError, FieldHelper } from '@/components/ui/FormField';

describe('FormField', () => {
  it('renders label and input', () => {
    render(
      <FormField label="Email">
        <input type="email" />
      </FormField>
    );
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('shows required asterisk via CSS class', () => {
    render(
      <FormField label="Name" required>
        <input type="text" />
      </FormField>
    );
    const label = screen.getByText('Name');
    expect(label).toHaveClass('form-label-required');
  });

  it('injects aria-required on child input', () => {
    render(
      <FormField label="Name" required>
        <input type="text" />
      </FormField>
    );
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-required', 'true');
  });

  it('shows error message with role="alert"', () => {
    render(
      <FormField label="Email" error="Invalid email">
        <input type="email" />
      </FormField>
    );
    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent('Invalid email');
    expect(error).toHaveAttribute('aria-live', 'assertive');
  });

  it('sets aria-invalid on input when error present', () => {
    render(
      <FormField label="Email" error="Required">
        <input type="email" />
      </FormField>
    );
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('links error to input via aria-describedby', () => {
    render(
      <FormField label="Email" error="Required">
        <input type="email" />
      </FormField>
    );
    const input = screen.getByLabelText('Email');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(screen.getByRole('alert').id).toBe(describedBy);
  });

  it('shows helper text when no error', () => {
    render(
      <FormField label="Postcode" helperText="e.g. SW1A 1AA">
        <input type="text" />
      </FormField>
    );
    expect(screen.getByText('e.g. SW1A 1AA')).toBeInTheDocument();
  });

  it('hides helper text when error is shown', () => {
    render(
      <FormField label="Postcode" helperText="e.g. SW1A 1AA" error="Invalid">
        <input type="text" />
      </FormField>
    );
    expect(screen.queryByText('e.g. SW1A 1AA')).not.toBeInTheDocument();
    expect(screen.getByText('Invalid')).toBeInTheDocument();
  });

  it('applies error wrapper class', () => {
    const { container } = render(
      <FormField label="Name" error="Required">
        <input type="text" />
      </FormField>
    );
    expect(container.querySelector('.form-field-error')).toBeInTheDocument();
  });
});

describe('FieldError', () => {
  it('renders nothing when no error', () => {
    const { container } = render(<FieldError error={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders error with role="alert"', () => {
    render(<FieldError error="Something went wrong" id="test-error" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Something went wrong');
    expect(alert).toHaveAttribute('id', 'test-error');
  });
});

describe('FieldHelper', () => {
  it('renders helper text', () => {
    render(<FieldHelper text="Format: DD/MM/YYYY" id="date-helper" />);
    expect(screen.getByText('Format: DD/MM/YYYY')).toHaveAttribute('id', 'date-helper');
  });
});
