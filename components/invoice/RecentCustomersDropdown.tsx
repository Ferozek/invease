'use client';

import { useState, useRef, useEffect } from 'react';
import { useHistoryStore } from '@/stores/historyStore';
import { useInvoiceStore } from '@/stores/invoiceStore';
import type { RecentCustomer } from '@/stores/historyStore';

/**
 * Recent Customers Dropdown
 * Apple-style combobox showing last 5 customers for quick selection
 *
 * Features:
 * - Shows on focus of customer name field
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Auto-fills all customer fields on selection
 */
export default function RecentCustomersDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const recentCustomers = useHistoryStore((state) => state.recentCustomers);
  const setCustomerDetails = useInvoiceStore((state) => state.setCustomerDetails);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (customer: RecentCustomer) => {
    setCustomerDetails({
      name: customer.name,
      address: customer.address,
      postCode: customer.postCode,
    });
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < recentCustomers.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelect(recentCustomers[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  if (recentCustomers.length === 0) return null;

  return (
    <div ref={dropdownRef} className="relative" onKeyDown={handleKeyDown}>
      {/* Trigger button - 44px touch target per Apple HIG */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer absolute right-0 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg
          text-[var(--text-muted)] hover:text-[var(--text-primary)]
          hover:bg-[var(--surface-elevated)] transition-colors"
        aria-label="Show recent customers"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-1 z-50
            bg-[var(--surface-card)] border border-[var(--surface-border)]
            rounded-xl shadow-lg overflow-hidden"
          role="listbox"
        >
          <div className="px-3 py-2 border-b border-[var(--surface-border)]">
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
              Recent Customers
            </p>
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {recentCustomers.map((customer, index) => (
              <li key={customer.name}>
                <button
                  type="button"
                  onClick={() => handleSelect(customer)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`cursor-pointer w-full px-3 py-2.5 text-left transition-colors
                    ${highlightedIndex === index
                      ? 'bg-[var(--brand-blue-50)]'
                      : 'hover:bg-[var(--surface-elevated)]'
                    }`}
                  role="option"
                  aria-selected={highlightedIndex === index}
                >
                  <p className="font-medium text-[var(--text-primary)] text-sm">
                    {customer.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    {customer.address}, {customer.postCode}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
