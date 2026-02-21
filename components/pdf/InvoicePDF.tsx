'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import type { InvoiceData, InvoiceTotals, VatRate, CisStatus } from '@/types/invoice';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#0b4f7a',
  },
  logo: {
    width: 120,
    height: 60,
    objectFit: 'contain',
  },
  companySection: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#0b4f7a',
    marginBottom: 4,
  },
  companyDetails: {
    fontSize: 9,
    color: '#64748b',
    lineHeight: 1.4,
  },
  invoiceTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#0b4f7a',
    textAlign: 'right',
  },
  invoiceNumber: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  invoiceDate: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'right',
    marginTop: 2,
  },
  billToSection: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
  },
  billToLabel: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  customerName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  customerDetails: {
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.4,
  },
  table: {
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0b4f7a',
    padding: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderText: {
    color: '#ffffff',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc',
  },
  colDescription: {
    flex: 3,
  },
  colQty: {
    width: 50,
    textAlign: 'center',
  },
  colNet: {
    width: 70,
    textAlign: 'right',
  },
  colVat: {
    width: 50,
    textAlign: 'center',
  },
  colTotal: {
    width: 80,
    textAlign: 'right',
  },
  totalsSection: {
    marginLeft: 'auto',
    width: 250,
    marginBottom: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  totalRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  totalLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  totalValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#0b4f7a',
    borderRadius: 4,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  grandTotalValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  bankSection: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
  },
  bankTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#0b4f7a',
    marginBottom: 6,
  },
  bankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bankItem: {
    width: '50%',
    marginBottom: 6,
  },
  bankLabel: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 2,
  },
  bankValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  reverseChargeNote: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#fef3c7',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  reverseChargeText: {
    fontSize: 9,
    color: '#92400e',
    fontStyle: 'italic',
  },
  // CIS styles
  cisBreakdown: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#fffbeb',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  cisTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#92400e',
    marginBottom: 8,
  },
  cisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  cisLabel: {
    fontSize: 9,
    color: '#78350f',
  },
  cisValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#78350f',
  },
  cisDeduction: {
    color: '#dc2626',
  },
  cisNote: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fef3c7',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  cisNoteText: {
    fontSize: 9,
    color: '#92400e',
    fontStyle: 'italic',
  },
  netPayableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#16a34a',
    borderRadius: 4,
    marginTop: 4,
  },
  netPayableLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  netPayableValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  // Credit note styles
  creditNoteTitle: {
    color: '#dc2626',
  },
  creditNoteHeader: {
    borderBottomColor: '#dc2626',
  },
  creditNoteGrandTotalRow: {
    backgroundColor: '#dc2626',
  },
  creditNoteReference: {
    marginTop: 4,
    fontSize: 9,
    color: '#64748b',
    textAlign: 'right' as const,
  },
  creditNoteReason: {
    marginTop: 10,
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#dc2626',
  },
  // Notes section
  notesSection: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#475569',
    marginBottom: 6,
  },
  notesText: {
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.5,
  },
});

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
};

// Calculate line total
const calculateLineTotal = (quantity: number, netAmount: number, vatRate: VatRate): number => {
  const net = quantity * netAmount;
  // Reverse charge = 0% VAT (buyer accounts for VAT)
  const vatPercent = vatRate === 'reverse_charge' ? 0 : parseInt(vatRate);
  const vat = net * (vatPercent / 100);
  return net + vat;
};

// Get VAT rate display text
const getVatRateDisplay = (vatRate: VatRate): string => {
  if (vatRate === 'reverse_charge') return 'RC';
  return `${vatRate}%`;
};

// Format date to DD/MM/YYYY
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB');
};

// Calculate due date based on invoice date and payment terms
const calculateDueDate = (invoiceDate: string, paymentTerms: string): string => {
  const date = new Date(invoiceDate);
  const days = parseInt(paymentTerms) || 0;
  date.setDate(date.getDate() + days);
  return formatDate(date.toISOString());
};

// Get payment terms text
const getPaymentTermsText = (paymentTerms: string): string => {
  if (paymentTerms === '0') return 'Due on receipt';
  return `${paymentTerms} days`;
};

// Get CIS status label
const getCisStatusLabel = (status: CisStatus): string => {
  switch (status) {
    case 'gross_payment': return 'Gross Payment (0%)';
    case 'standard': return 'Verified (20%)';
    case 'unverified': return 'Unverified (30%)';
    default: return '';
  }
};

// Get CIS deduction rate
const getCisDeductionRate = (status: CisStatus): number => {
  switch (status) {
    case 'gross_payment': return 0;
    case 'standard': return 0.20;
    case 'unverified': return 0.30;
    default: return 0;
  }
};

interface InvoicePDFProps {
  invoice: InvoiceData;
  totals: InvoiceTotals;
}

export default function InvoicePDF({ invoice, totals }: InvoicePDFProps) {
  const isCreditNote = invoice.details.documentType === 'credit_note';
  const isCis = invoice.invoicer.cisStatus !== 'not_applicable';
  const cisStatus = invoice.invoicer.cisStatus;

  // Calculate CIS breakdown if applicable
  const labourTotal = isCis
    ? invoice.lineItems
        .filter(item => item.cisCategory === 'labour')
        .reduce((sum, item) => sum + item.netAmount * item.quantity, 0)
    : 0;

  const materialsTotal = isCis
    ? invoice.lineItems
        .filter(item => item.cisCategory === 'materials')
        .reduce((sum, item) => sum + item.netAmount * item.quantity, 0)
    : 0;

  const cisDeductionRate = getCisDeductionRate(cisStatus);
  const cisDeduction = labourTotal * cisDeductionRate;
  const netPayable = totals.total - cisDeduction;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={isCreditNote ? [styles.header, styles.creditNoteHeader] : styles.header}>
          <View style={styles.companySection}>
            {invoice.invoicer.logo && (
              <Image src={invoice.invoicer.logo} style={styles.logo} />
            )}
            <Text style={styles.companyName}>{invoice.invoicer.companyName}</Text>
            <Text style={styles.companyDetails}>
              {invoice.invoicer.address}
              {'\n'}
              {invoice.invoicer.postCode}
              {invoice.invoicer.companyNumber && `\nCompany No: ${invoice.invoicer.companyNumber}`}
              {invoice.invoicer.vatNumber && `\nVAT No: ${invoice.invoicer.vatNumber}`}
              {invoice.invoicer.eoriNumber && `\nEORI: ${invoice.invoicer.eoriNumber}`}
              {invoice.invoicer.cisUtr && `\nCIS UTR: ${invoice.invoicer.cisUtr}`}
            </Text>
          </View>
          <View>
            <Text style={isCreditNote ? [styles.invoiceTitle, styles.creditNoteTitle] : styles.invoiceTitle}>
              {isCreditNote ? 'CREDIT NOTE' : 'INVOICE'}
            </Text>
            <Text style={styles.invoiceNumber}>#{invoice.details.invoiceNumber}</Text>
            {isCreditNote && invoice.details.creditNoteFields?.relatedInvoiceNumber && (
              <Text style={styles.creditNoteReference}>
                Ref: Invoice #{invoice.details.creditNoteFields.relatedInvoiceNumber}
              </Text>
            )}
            <Text style={styles.invoiceDate}>Date: {formatDate(invoice.details.date)}</Text>
            <Text style={styles.invoiceDate}>
              Due: {calculateDueDate(invoice.details.date, invoice.details.paymentTerms)}
            </Text>
            <Text style={styles.invoiceDate}>
              Terms: {getPaymentTermsText(invoice.details.paymentTerms)}
            </Text>
          </View>
        </View>

        {/* Bill To */}
        <View style={styles.billToSection}>
          <Text style={styles.billToLabel}>Bill To</Text>
          <Text style={styles.customerName}>{invoice.customer.name}</Text>
          <Text style={styles.customerDetails}>
            {invoice.customer.address}
            {'\n'}
            {invoice.customer.postCode}
          </Text>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDescription]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colNet]}>Net</Text>
            <Text style={[styles.tableHeaderText, styles.colVat]}>VAT</Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
          </View>

          {/* Rows */}
          {invoice.lineItems.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.tableRow,
                index % 2 === 1 ? styles.tableRowAlt : {},
              ]}
            >
              <Text style={styles.colDescription}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colNet}>{formatCurrency(item.netAmount)}</Text>
              <Text style={styles.colVat}>{getVatRateDisplay(item.vatRate)}</Text>
              <Text style={styles.colTotal}>
                {formatCurrency(calculateLineTotal(item.quantity, item.netAmount, item.vatRate))}
              </Text>
            </View>
          ))}
        </View>

        {/* CIS Breakdown - shown for CIS subcontractors */}
        {isCis && (
          <View style={styles.cisBreakdown}>
            <Text style={styles.cisTitle}>CIS Breakdown ({getCisStatusLabel(cisStatus)})</Text>
            <View style={styles.cisRow}>
              <Text style={styles.cisLabel}>Labour Total</Text>
              <Text style={styles.cisValue}>{formatCurrency(labourTotal)}</Text>
            </View>
            <View style={styles.cisRow}>
              <Text style={styles.cisLabel}>Materials Total</Text>
              <Text style={styles.cisValue}>{formatCurrency(materialsTotal)}</Text>
            </View>
            {cisDeduction > 0 && (
              <View style={[styles.cisRow, { borderTopWidth: 1, borderTopColor: '#fcd34d', paddingTop: 6, marginTop: 4 }]}>
                <Text style={styles.cisLabel}>CIS Deduction ({Math.round(cisDeductionRate * 100)}%)</Text>
                <Text style={[styles.cisValue, styles.cisDeduction]}>-{formatCurrency(cisDeduction)}</Text>
              </View>
            )}
          </View>
        )}

        {/* Credit Note Reason */}
        {isCreditNote && invoice.details.creditNoteFields?.reason && (
          <View style={styles.creditNoteReason}>
            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#991b1b', marginBottom: 4 }}>
              Reason for Credit Note
            </Text>
            <Text style={{ fontSize: 9, color: '#991b1b' }}>
              {invoice.details.creditNoteFields.reason}
            </Text>
          </View>
        )}

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(totals.subtotal)}</Text>
          </View>
          {totals.vatBreakdown.map((vat) => (
            <View key={vat.rate} style={[styles.totalRow, styles.totalRowBorder]}>
              <Text style={styles.totalLabel}>
                {vat.rate === 'reverse_charge' ? 'Reverse Charge (0%)' : `VAT (${vat.rate}%)`}
              </Text>
              <Text style={styles.totalValue}>{formatCurrency(vat.amount)}</Text>
            </View>
          ))}
          <View style={isCreditNote ? [styles.grandTotalRow, styles.creditNoteGrandTotalRow] : styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>{isCreditNote ? 'Credit Total' : 'Total Due'}</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(totals.total)}</Text>
          </View>

          {/* Net Payable after CIS deduction */}
          {isCis && cisDeduction > 0 && (
            <View style={styles.netPayableRow}>
              <Text style={styles.netPayableLabel}>Net Payable</Text>
              <Text style={styles.netPayableValue}>{formatCurrency(netPayable)}</Text>
            </View>
          )}
        </View>

        {/* Bank Details */}
        <View style={styles.bankSection}>
          <Text style={styles.bankTitle}>Payment Details</Text>
          <View style={styles.bankGrid}>
            <View style={styles.bankItem}>
              <Text style={styles.bankLabel}>Account Name</Text>
              <Text style={styles.bankValue}>{invoice.bankDetails.accountName}</Text>
            </View>
            <View style={styles.bankItem}>
              <Text style={styles.bankLabel}>Bank</Text>
              <Text style={styles.bankValue}>{invoice.bankDetails.bankName}</Text>
            </View>
            <View style={styles.bankItem}>
              <Text style={styles.bankLabel}>Account Number</Text>
              <Text style={styles.bankValue}>{invoice.bankDetails.accountNumber}</Text>
            </View>
            <View style={styles.bankItem}>
              <Text style={styles.bankLabel}>Sort Code</Text>
              <Text style={styles.bankValue}>{invoice.bankDetails.sortCode}</Text>
            </View>
            {invoice.bankDetails.reference && (
              <View style={[styles.bankItem, { width: '100%' }]}>
                <Text style={styles.bankLabel}>Reference</Text>
                <Text style={styles.bankValue}>{invoice.bankDetails.reference}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Reverse Charge Note */}
        {invoice.lineItems.some(item => item.vatRate === 'reverse_charge') && (
          <View style={styles.reverseChargeNote}>
            <Text style={styles.reverseChargeText}>
              Reverse charge: VAT Act 1994 Section 55A applies. Customer to account for VAT to HMRC.
            </Text>
          </View>
        )}

        {/* CIS Notice */}
        {isCis && cisStatus === 'standard' && (
          <View style={styles.cisNote}>
            <Text style={styles.cisNoteText}>
              CIS deduction of 20% has been applied to labour costs. This amount will be reported to HMRC under the Construction Industry Scheme.
            </Text>
          </View>
        )}
        {isCis && cisStatus === 'unverified' && (
          <View style={styles.cisNote}>
            <Text style={styles.cisNoteText}>
              CIS deduction of 30% has been applied to labour costs (unverified subcontractor rate). This amount will be reported to HMRC under the Construction Industry Scheme.
            </Text>
          </View>
        )}
        {isCis && cisStatus === 'gross_payment' && (
          <View style={styles.cisNote}>
            <Text style={styles.cisNoteText}>
              Gross payment status: No CIS deduction applies. Subcontractor is responsible for their own tax obligations.
            </Text>
          </View>
        )}

        {/* Notes/Terms */}
        {invoice.details.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{invoice.details.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          {isCreditNote
            ? `This credit note cancels/reduces Invoice #${invoice.details.creditNoteFields?.relatedInvoiceNumber || ''}.`
            : `Thank you for your business. ${
                invoice.details.paymentTerms === '0'
                  ? 'Payment is due on receipt.'
                  : `Payment is due within ${invoice.details.paymentTerms} days.`
              }`}
        </Text>
      </Page>
    </Document>
  );
}
