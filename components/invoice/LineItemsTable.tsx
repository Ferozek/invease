'use client';

import { memo, useCallback } from 'react';
import { useInvoiceStore } from '@/stores/invoiceStore';
import { useCompanyStore } from '@/stores/companyStore';
import { formatCurrency, calculateLineNet, calculateLineDiscount } from '@/lib/formatters';
import Button from '@/components/ui/Button';
import { VAT_RATES, CIS_CATEGORY_OPTIONS } from '@/config/constants';
import type { LineItem, VatRate, CisCategory, DiscountType } from '@/types/invoice';

// ===== Memoized Line Item Row =====
// Prevents re-render of all rows when one row changes

interface LineItemRowProps {
  item: LineItem;
  isCis: boolean;
  canDelete: boolean;
  onUpdate: (id: string, updates: Partial<LineItem>) => void;
  onRemove: (id: string) => void;
}

const LineItemRow = memo(function LineItemRow({
  item,
  isCis,
  canDelete,
  onUpdate,
  onRemove,
}: LineItemRowProps) {
  const hasDiscount = !!item.discountType && !!item.discountValue && item.discountValue > 0;
  const discountAmount = calculateLineDiscount(item.quantity, item.netAmount, item.discountType, item.discountValue);
  const lineTotal = calculateLineNet(item.quantity, item.netAmount, item.discountType, item.discountValue);
  // Column count for discount row spanning
  const colCount = isCis ? 7 : 6;

  return (
    <>
      <tr>
        <td className="py-2 px-2" data-label="Description">
          <input
            type="text"
            className="form-input w-full"
            placeholder="Service description"
            aria-label="Line item description"
            value={item.description}
            onChange={(e) => onUpdate(item.id, { description: e.target.value })}
          />
        </td>
        {isCis && (
          <td className="py-2 px-2" data-label="Category">
            <select
              className="form-input w-full"
              aria-label="CIS category"
              value={item.cisCategory || 'labour'}
              onChange={(e) =>
                onUpdate(item.id, { cisCategory: e.target.value as CisCategory })
              }
            >
              {CIS_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </td>
        )}
        <td className="py-2 px-2" data-label="Qty">
          <input
            type="number"
            className="form-input w-full"
            aria-label="Quantity"
            value={item.quantity}
            min={1}
            max={99999}
            onChange={(e) =>
              onUpdate(item.id, { quantity: parseInt(e.target.value) || 1 })
            }
            onBlur={(e) => {
              const clamped = Math.max(1, Math.min(99999, parseInt(e.target.value) || 1));
              onUpdate(item.id, { quantity: clamped });
            }}
          />
        </td>
        <td className="py-2 px-2" data-label="Net">
          <input
            type="number"
            className="form-input w-full"
            aria-label="Net amount"
            placeholder="0.00"
            step="0.01"
            min={0}
            max={9999999.99}
            value={item.netAmount || ''}
            onChange={(e) =>
              onUpdate(item.id, { netAmount: parseFloat(e.target.value) || 0 })
            }
            onBlur={(e) => {
              const clamped = Math.max(0, Math.min(9999999.99, parseFloat(e.target.value) || 0));
              const rounded = Math.round(clamped * 100) / 100;
              onUpdate(item.id, { netAmount: rounded });
            }}
          />
        </td>
        <td className="py-2 px-2" data-label="VAT">
          <select
            className="form-input w-full"
            aria-label="VAT rate"
            value={item.vatRate}
            onChange={(e) =>
              onUpdate(item.id, { vatRate: e.target.value as VatRate })
            }
          >
            {VAT_RATES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </td>
        <td className="py-2 px-2 text-right font-medium text-[var(--text-primary)]" data-label="Total">
          {formatCurrency(lineTotal)}
        </td>
        <td className="py-2 px-2">
          <button
            type="button"
            className="cursor-pointer text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg disabled:opacity-30 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => onRemove(item.id)}
            disabled={!canDelete}
            aria-label="Remove line item"
            title="Remove line item"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </td>
      </tr>
      {/* Discount row — progressive disclosure */}
      <tr>
        <td colSpan={colCount} className="px-2 pb-2 pt-0">
          {!hasDiscount ? (
            <button
              type="button"
              onClick={() => onUpdate(item.id, { discountType: 'percentage', discountValue: 0 })}
              className="cursor-pointer text-xs text-[var(--text-muted)] hover:text-[var(--brand-blue)] transition-colors"
            >
              + Discount
            </button>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center rounded-lg bg-[var(--surface-elevated)] p-0.5">
                <button
                  type="button"
                  onClick={() => onUpdate(item.id, { discountType: 'percentage' as DiscountType })}
                  className={`cursor-pointer px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    item.discountType === 'percentage'
                      ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                  aria-label="Percentage discount"
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate(item.id, { discountType: 'fixed' as DiscountType })}
                  className={`cursor-pointer px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    item.discountType === 'fixed'
                      ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                  aria-label="Fixed discount"
                >
                  &pound;
                </button>
              </div>
              <input
                type="number"
                step={item.discountType === 'percentage' ? '1' : '0.01'}
                min={0}
                max={item.discountType === 'percentage' ? 100 : item.netAmount * item.quantity}
                value={item.discountValue || ''}
                onChange={(e) => onUpdate(item.id, { discountValue: parseFloat(e.target.value) || 0 })}
                onBlur={(e) => {
                  const max = item.discountType === 'percentage' ? 100 : item.netAmount * item.quantity;
                  const clamped = Math.max(0, Math.min(max, parseFloat(e.target.value) || 0));
                  onUpdate(item.id, { discountValue: Math.round(clamped * 100) / 100 });
                }}
                className="form-input w-20 text-sm"
                aria-label="Discount value"
                placeholder="0"
              />
              <span className="text-xs text-[var(--text-muted)]">
                -{formatCurrency(discountAmount)}
              </span>
              <button
                type="button"
                onClick={() => onUpdate(item.id, { discountType: undefined, discountValue: undefined })}
                className="cursor-pointer text-xs text-red-500 hover:text-red-700 transition-colors ml-1"
                aria-label="Remove discount"
              >
                Remove
              </button>
            </div>
          )}
        </td>
      </tr>
    </>
  );
});

// ===== Main Table Component =====

export default function LineItemsTable() {
  const { lineItems, addLineItem, removeLineItem, updateLineItem } = useInvoiceStore();
  const { isCisSubcontractor } = useCompanyStore();

  const isCis = isCisSubcontractor();
  const canDelete = lineItems.length > 1;

  // Memoized callbacks to prevent row re-renders
  const handleUpdate = useCallback(
    (id: string, updates: Partial<LineItem>) => {
      updateLineItem(id, updates);
    },
    [updateLineItem]
  );

  const handleRemove = useCallback(
    (id: string) => {
      removeLineItem(id);
    },
    [removeLineItem]
  );

  const handleAddItem = useCallback(() => {
    addLineItem(isCis);
  }, [addLineItem, isCis]);

  return (
    <>
      <div className="overflow-x-auto line-items-mobile">
        <table className="w-full min-w-0" role="table">
          <thead>
            <tr className="border-b border-[var(--surface-border)]">
              <th
                scope="col"
                className="text-left py-2 px-2 text-sm font-semibold text-[var(--text-secondary)]"
              >
                Description
              </th>
              {isCis && (
                <th
                  scope="col"
                  className="text-left py-2 px-2 text-sm font-semibold text-[var(--text-secondary)] w-28"
                >
                  Category
                </th>
              )}
              <th
                scope="col"
                className="text-left py-2 px-2 text-sm font-semibold text-[var(--text-secondary)] w-20"
              >
                Qty
              </th>
              <th
                scope="col"
                className="text-left py-2 px-2 text-sm font-semibold text-[var(--text-secondary)] w-28"
              >
                Net
              </th>
              <th
                scope="col"
                className="text-left py-2 px-2 text-sm font-semibold text-[var(--text-secondary)] w-36"
              >
                VAT
              </th>
              <th
                scope="col"
                className="text-right py-2 px-2 text-sm font-semibold text-[var(--text-secondary)] w-28"
              >
                Total
              </th>
              <th scope="col" className="w-12">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item) => (
              <LineItemRow
                key={item.id}
                item={item}
                isCis={isCis}
                canDelete={canDelete}
                onUpdate={handleUpdate}
                onRemove={handleRemove}
              />
            ))}
          </tbody>
        </table>
      </div>
      <Button
        variant="muted"
        size="sm"
        className="mt-4"
        onClick={handleAddItem}
      >
        + Add Line Item
      </Button>
    </>
  );
}
