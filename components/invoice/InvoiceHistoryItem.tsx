'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { SavedInvoice } from '@/stores/historyStore';
import { formatCurrency } from '@/lib/formatters';
import PaymentStatusRow from './PaymentStatusRow';

// Swipe thresholds — Apple Mail pattern: left=delete, right=mark paid
const SWIPE_THRESHOLD = 80;
const ACTION_BUTTON_WIDTH = 80;

// One-time peek hint key
export const PEEK_HINT_KEY = 'invease-swipe-hint-shown';

export interface InvoiceHistoryItemProps {
  invoice: SavedInvoice;
  onDuplicate: () => void;
  onDelete: () => void;
  onMarkAsPaid: () => void;
  onMarkAsUnpaid: () => void;
  onCreateCreditNote?: () => void;
  showPeekHint?: boolean;
}

/**
 * InvoiceHistoryItem — swipeable list item with Apple Mail bidirectional gestures
 *
 * Swipe right → green "Paid" / orange "Undo" (invoices only, not credit notes)
 * Swipe left  → red "Delete"
 * Desktop     → hover reveals action icons
 * Mobile      → compact icons + swipe for primary actions
 */
export default function InvoiceHistoryItem({
  invoice,
  onDuplicate,
  onDelete,
  onMarkAsPaid,
  onMarkAsUnpaid,
  onCreateCreditNote,
  showPeekHint,
}: InvoiceHistoryItemProps) {
  const isCreditNote = (invoice.documentType || 'invoice') === 'credit_note';
  const isPaid = invoice.status === 'paid';
  const canSwipeRight = !isCreditNote;
  const [showActions, setShowActions] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasPeeked, setHasPeeked] = useState(false);

  const formattedDate = new Date(invoice.savedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });

  // One-time peek animation — briefly reveals swipe actions to teach the gesture
  useEffect(() => {
    if (!showPeekHint || hasPeeked) return;
    const timer = setTimeout(() => {
      setSwipeOffset(canSwipeRight ? ACTION_BUTTON_WIDTH * 0.6 : -ACTION_BUTTON_WIDTH * 0.6);
      setTimeout(() => {
        setSwipeOffset(0);
        setHasPeeked(true);
        try { localStorage.setItem(PEEK_HINT_KEY, 'true'); } catch { /* noop */ }
      }, 600);
    }, 800);
    return () => clearTimeout(timer);
  }, [showPeekHint, hasPeeked, canSwipeRight]);

  const handleResetSwipe = useCallback(() => {
    setSwipeOffset(0);
  }, []);

  const handleSwipeAction = useCallback(() => {
    if (isPaid) {
      onMarkAsUnpaid();
    } else {
      onMarkAsPaid();
    }
    setSwipeOffset(0);
  }, [isPaid, onMarkAsPaid, onMarkAsUnpaid]);

  return (
    <div className="relative overflow-hidden">
      {/* LEFT action (swipe RIGHT to reveal) — Mark as Paid / Undo */}
      {canSwipeRight && (
        <div
          className="absolute left-0 top-0 h-full flex items-stretch"
          style={{ width: ACTION_BUTTON_WIDTH }}
        >
          <button
            type="button"
            onClick={() => handleSwipeAction()}
            className={`cursor-pointer flex-1 flex flex-col items-center justify-center text-white transition-colors ${
              isPaid
                ? 'bg-[#FF9500] hover:bg-[#E68900]'
                : 'bg-[#34C759] hover:bg-[#2DB84E]'
            }`}
            aria-label={isPaid ? 'Mark as unpaid' : 'Mark as paid'}
          >
            {isPaid ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-[10px] font-medium mt-0.5">
              {isPaid ? 'Undo' : 'Paid'}
            </span>
          </button>
        </div>
      )}

      {/* RIGHT action (swipe LEFT to reveal) — Delete */}
      <div
        className="absolute right-0 top-0 h-full flex items-stretch"
        style={{ width: ACTION_BUTTON_WIDTH }}
      >
        <button
          type="button"
          onClick={() => { handleResetSwipe(); onDelete(); }}
          className="cursor-pointer flex-1 flex flex-col items-center justify-center bg-red-500 text-white transition-colors hover:bg-red-600"
          aria-label="Delete invoice"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
          <span className="text-[10px] font-medium mt-0.5">Delete</span>
        </button>
      </div>

      {/* Swipeable content — Apple Mail bidirectional swipe */}
      <motion.div
        drag="x"
        dragConstraints={{
          left: -ACTION_BUTTON_WIDTH,
          right: canSwipeRight ? ACTION_BUTTON_WIDTH : 0,
        }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDrag={(_, info) => {
          const clamped = canSwipeRight
            ? Math.max(-ACTION_BUTTON_WIDTH, Math.min(ACTION_BUTTON_WIDTH, info.offset.x))
            : Math.min(0, Math.max(-ACTION_BUTTON_WIDTH, info.offset.x));
          setSwipeOffset(clamped);
        }}
        onDragEnd={(_, info) => {
          setIsDragging(false);
          if (info.offset.x < -SWIPE_THRESHOLD) {
            setSwipeOffset(-ACTION_BUTTON_WIDTH);
          } else if (canSwipeRight && info.offset.x > SWIPE_THRESHOLD) {
            setSwipeOffset(ACTION_BUTTON_WIDTH);
          } else {
            setSwipeOffset(0);
          }
        }}
        animate={{ x: swipeOffset }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="px-4 py-3 border-b border-[var(--surface-border)] hover:bg-[var(--surface-elevated)]
          transition-colors relative bg-[var(--surface-card)] touch-pan-y"
        onMouseEnter={() => !isDragging && setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        onClick={() => swipeOffset !== 0 && handleResetSwipe()}
      >
        {/* Invoice header row */}
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-[var(--text-primary)] truncate">
                {invoice.customerName}
              </p>
              {isCreditNote && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-semibold">
                  CN
                </span>
              )}
              <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--text-muted)]">
                #{invoice.invoiceNumber}
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              {formattedDate} · {formatCurrency(invoice.total)}
            </p>
          </div>

          {/* Desktop: hover actions */}
          <div className={`hidden sm:flex items-center transition-opacity ${showActions ? 'opacity-100' : 'opacity-0'}`}>
            {onCreateCreditNote && (
              <button type="button" onClick={onCreateCreditNote} className="cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors" aria-label="Create credit note" title="Create Credit Note">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            )}
            <button type="button" onClick={onDuplicate} className="cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-[var(--brand-blue-50)] text-[var(--brand-blue)] transition-colors" aria-label="Duplicate invoice">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
              </svg>
            </button>
            <button type="button" onClick={onDelete} className="cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors" aria-label="Delete invoice">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>

          {/* Mobile: compact icons, swipe for primary actions */}
          <div className="sm:hidden flex items-center">
            {onCreateCreditNote && (
              <button type="button" onClick={onCreateCreditNote} className="cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-red-500" aria-label="Create credit note">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            )}
            <button type="button" onClick={onDuplicate} className="cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[var(--brand-blue)]" aria-label="Duplicate invoice">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
              </svg>
            </button>
          </div>
        </div>

        {/* Payment status row — always visible below invoice details */}
        <PaymentStatusRow
          invoice={invoice}
          onMarkAsPaid={onMarkAsPaid}
          onMarkAsUnpaid={onMarkAsUnpaid}
        />
      </motion.div>
    </div>
  );
}
