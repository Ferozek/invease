import { track } from '@vercel/analytics';

/**
 * Custom Vercel Analytics events
 *
 * These track key user actions for product insights.
 * Vercel Analytics free tier supports custom events.
 */
export const analytics = {
  invoiceDownloaded: (documentType: string) =>
    track('invoice_downloaded', { documentType }),

  invoiceSaved: (documentType: string) =>
    track('invoice_saved', { documentType }),

  wizardCompleted: (businessType: string) =>
    track('wizard_completed', { businessType }),

  quickStartUsed: () =>
    track('quick_start_used'),

  creditNoteCreated: () =>
    track('credit_note_created'),

  customerAutocompleted: () =>
    track('customer_autocompleted'),
};
