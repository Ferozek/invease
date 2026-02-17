'use client';

import { useState, useCallback } from 'react';
import { useInvoiceStore } from '@/stores/invoiceStore';
import { toTitleCase } from '@/lib/textFormatters';
import {
  validateRequired,
  validatePostcode,
  normalisePostcode,
} from '@/lib/validationPatterns';
import { FieldError } from '@/components/ui/FormField';

/**
 * CustomerDetailsForm - Captures customer billing information
 * Features Apple-style inline validation (red border + shake on blur)
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
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="customerName" className="form-label form-label-required">Customer Name</label>
        <input
          id="customerName"
          type="text"
          className={`form-input ${touched.name && errors.name ? 'form-input-error' : ''}`}
          placeholder="Customer or company name"
          value={customer.name}
          onChange={(e) => setCustomerDetails({ name: e.target.value })}
          onBlur={(e) => {
            const formatted = toTitleCase(e.target.value);
            setCustomerDetails({ name: formatted });
            handleBlur('name', formatted);
          }}
        />
        <FieldError error={touched.name ? errors.name : null} />
      </div>
      <div>
        <label htmlFor="customerPostCode" className="form-label form-label-required">Post Code</label>
        <input
          id="customerPostCode"
          type="text"
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
