'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useInvoiceStore } from '@/stores/invoiceStore';
import { useHistoryStore, selectUniqueCustomers, type UniqueCustomer } from '@/stores/historyStore';
import { toTitleCase } from '@/lib/textFormatters';
import {
  validateRequired,
  validatePostcode,
  normalisePostcode,
} from '@/lib/validationPatterns';
import { FieldError } from '@/components/ui/FormField';
import { hapticFeedback } from '@/lib/haptics';

/**
 * CustomerDetailsForm - Captures customer billing information
 *
 * Apple Contacts autocomplete pattern:
 * - As user types in customer name, matching suggestions appear below
 * - Selecting a suggestion fills name, email, address, postCode
 * - Keyboard navigation: arrow keys, enter to select, escape to dismiss
 * - Builds customer list from all invoice history (deduped by name)
 */
export default function CustomerDetailsForm() {
  const { customer, setCustomerDetails } = useInvoiceStore();

  // Validation state
  const [errors, setErrors] = useState<Record<string, string | null>>({
    name: null,
    address: null,
    postCode: null,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({
    name: false,
    address: false,
    postCode: false,
  });

  // Autocomplete state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get all unique customers from invoice history
  const invoices = useHistoryStore((state) => state.invoices);
  const allCustomers = useMemo(
    () => selectUniqueCustomers({ invoices } as Parameters<typeof selectUniqueCustomers>[0]),
    [invoices]
  );

  // Filter suggestions based on current input
  const suggestions = useMemo(() => {
    const query = customer.name.toLowerCase().trim();
    if (!query || query.length < 1) return allCustomers.slice(0, 5); // Show top 5 when field is focused but empty
    return allCustomers.filter((c) =>
      c.name.toLowerCase().includes(query)
    ).slice(0, 8);
  }, [customer.name, allCustomers]);

  // Close suggestions on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Select a customer suggestion — fills all fields
  const handleSelectCustomer = useCallback((c: UniqueCustomer) => {
    setCustomerDetails({
      name: c.name,
      email: c.email,
      address: c.address,
      postCode: c.postCode,
    });
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    // Clear any name validation error since we just filled it
    setErrors((prev) => ({ ...prev, name: null }));
    setTouched((prev) => ({ ...prev, name: true }));
  }, [setCustomerDetails]);

  // Keyboard navigation for suggestions
  const handleNameKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          e.preventDefault();
          handleSelectCustomer(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
    }
  }, [showSuggestions, suggestions, highlightedIndex, handleSelectCustomer]);

  // Validate field
  const handleBlur = useCallback((field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    let result;
    switch (field) {
      case 'name':
        result = validateRequired(value, 'Customer name');
        break;
      case 'address':
        result = validateRequired(value, 'Address');
        break;
      case 'postCode':
        result = validatePostcode(value, true);
        break;
      default:
        return;
    }

    setErrors((prev) => ({ ...prev, [field]: result.error }));

    // Trigger haptic feedback on validation error
    if (result.error) {
      hapticFeedback.error();
    }
  }, []);

  const hasSuggestions = allCustomers.length > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="relative">
        <label htmlFor="customerName" className="form-label form-label-required">Customer Name</label>
        <input
          ref={inputRef}
          id="customerName"
          type="text"
          autoComplete="off"
          role="combobox"
          aria-expanded={showSuggestions && suggestions.length > 0}
          aria-controls="customer-suggestions"
          aria-activedescendant={highlightedIndex >= 0 ? `customer-option-${highlightedIndex}` : undefined}
          className={`form-input ${touched.name && errors.name ? 'form-input-error' : ''}`}
          placeholder={hasSuggestions ? 'Start typing or select...' : 'Customer or company name'}
          value={customer.name}
          onChange={(e) => {
            setCustomerDetails({ name: e.target.value });
            setShowSuggestions(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            if (hasSuggestions) setShowSuggestions(true);
          }}
          onBlur={(e) => {
            // Delay hiding so click on suggestion registers
            setTimeout(() => {
              const formatted = toTitleCase(e.target.value);
              setCustomerDetails({ name: formatted });
              handleBlur('name', formatted);
            }, 150);
          }}
          onKeyDown={handleNameKeyDown}
        />
        <FieldError error={touched.name ? errors.name : null} />

        {/* Autocomplete suggestions — Apple Contacts pattern */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            id="customer-suggestions"
            role="listbox"
            className="absolute left-0 right-0 top-full mt-1 z-50
              bg-[var(--surface-card)] border border-[var(--surface-border)]
              rounded-xl shadow-lg overflow-hidden"
          >
            {customer.name.trim() === '' && (
              <div className="px-3 py-1.5 border-b border-[var(--surface-border)]">
                <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Recent Customers
                </p>
              </div>
            )}
            <ul className="max-h-48 overflow-y-auto">
              {suggestions.map((c, index) => (
                <li key={c.name}>
                  <button
                    type="button"
                    id={`customer-option-${index}`}
                    role="option"
                    aria-selected={highlightedIndex === index}
                    onClick={() => handleSelectCustomer(c)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`cursor-pointer w-full px-3 py-2.5 text-left transition-colors ${
                      highlightedIndex === index
                        ? 'bg-[var(--brand-blue-50)]'
                        : 'hover:bg-[var(--surface-elevated)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-[var(--text-primary)] text-sm">
                        {c.name}
                      </p>
                      <span className="text-[10px] text-[var(--text-muted)] ml-2 shrink-0">
                        {c.invoiceCount} {c.invoiceCount === 1 ? 'inv' : 'invs'}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                      {c.postCode}{c.address ? ` \u00B7 ${c.address.split('\n')[0]}` : ''}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div>
        <label htmlFor="customerEmail" className="form-label">Email</label>
        <input
          id="customerEmail"
          type="email"
          autoComplete="email"
          className="form-input"
          placeholder="customer@example.com"
          value={customer.email}
          onChange={(e) => setCustomerDetails({ email: e.target.value.toLowerCase() })}
        />
        <p className="text-xs text-[var(--text-muted)] mt-1">For sending invoice</p>
      </div>
      <div>
        <label htmlFor="customerPostCode" className="form-label form-label-required">Post Code</label>
        <input
          id="customerPostCode"
          type="text"
          autoComplete="postal-code"
          className={`form-input ${touched.postCode && errors.postCode ? 'form-input-error' : ''}`}
          placeholder="e.g., SW1A 1AA"
          value={customer.postCode}
          onChange={(e) => setCustomerDetails({ postCode: e.target.value })}
          onBlur={(e) => {
            const formatted = normalisePostcode(e.target.value);
            setCustomerDetails({ postCode: formatted });
            handleBlur('postCode', formatted);
          }}
        />
        <FieldError error={touched.postCode ? errors.postCode : null} />
      </div>
      <div className="md:col-span-2">
        <label htmlFor="customerAddress" className="form-label form-label-required">Address</label>
        <textarea
          id="customerAddress"
          autoComplete="street-address"
          className={`form-input ${touched.address && errors.address ? 'form-input-error' : ''}`}
          rows={3}
          placeholder="Customer address"
          value={customer.address}
          onChange={(e) => setCustomerDetails({ address: e.target.value })}
          onBlur={(e) => {
            const formatted = toTitleCase(e.target.value);
            setCustomerDetails({ address: formatted });
            handleBlur('address', formatted);
          }}
        />
        <FieldError error={touched.address ? errors.address : null} />
      </div>
    </div>
  );
}
