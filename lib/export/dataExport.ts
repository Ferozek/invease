/**
 * Full Data Export Utility (GDPR Article 20 — Data Portability)
 *
 * Exports all user data from localStorage stores as JSON.
 * Explicitly excludes bank details (memory-only, never persisted).
 *
 * Modular for Supabase: same function can later pull from API instead of localStorage.
 */

import { useCompanyStore } from '@/stores/companyStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useHistoryStore } from '@/stores/historyStore';
import { getTodayISO } from '@/lib/dateUtils';

export interface DataExport {
  exportedAt: string;
  version: 1;
  company: {
    companyName: string;
    companyNumber: string;
    vatNumber: string;
    eoriNumber: string;
    address: string;
    postCode: string;
    cisStatus: string;
    cisUtr: string;
  };
  settings: {
    templateId: string;
    customPrimaryColor: string | null;
    defaultPaymentTerms: string;
    defaultVatRate: string;
    defaultNotes: string;
  };
  invoiceHistory: ReturnType<typeof useHistoryStore.getState>['invoices'];
  recentCustomers: ReturnType<typeof useHistoryStore.getState>['recentCustomers'];
}

/**
 * Gathers all user data from stores into a single exportable object.
 * Bank details are explicitly excluded (security).
 */
export function gatherExportData(): DataExport {
  const company = useCompanyStore.getState();
  const settings = useSettingsStore.getState();
  const history = useHistoryStore.getState();

  return {
    exportedAt: new Date().toISOString(),
    version: 1,
    company: {
      companyName: company.companyName,
      companyNumber: company.companyNumber,
      vatNumber: company.vatNumber,
      eoriNumber: company.eoriNumber,
      address: company.address,
      postCode: company.postCode,
      cisStatus: company.cisStatus,
      cisUtr: company.cisUtr,
    },
    settings: {
      templateId: settings.templateId,
      customPrimaryColor: settings.customPrimaryColor,
      defaultPaymentTerms: settings.defaultPaymentTerms,
      defaultVatRate: settings.defaultVatRate,
      defaultNotes: settings.defaultNotes,
    },
    invoiceHistory: history.invoices,
    recentCustomers: history.recentCustomers,
  };
}

/**
 * Downloads user data as a JSON file.
 */
export function downloadDataExport(): void {
  const data = gatherExportData();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `invease-data-${getTodayISO()}.json`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
