'use client';

import {
  Document,
  Page,
  Text,
  View,
  Image,
} from '@react-pdf/renderer';
import { formatCurrency, calculateLineTotal, getVatRateDisplay, getPaymentTermsText } from '@/lib/formatters';
import { formatDateUK, calculateDueDate } from '@/lib/dateUtils';
import { getCisDeductionRate, getCisStatusLabel } from '@/lib/cisUtils';
import { hasBankDetails as checkBankDetails } from '@/lib/bankDetailsUtils';
import styles from './pdfStyles';
import type { InvoiceData, InvoiceTotals } from '@/types/invoice';

interface InvoicePDFProps {
  invoice: InvoiceData;
  totals: InvoiceTotals;
}

export default function InvoicePDF({ invoice, totals }: InvoicePDFProps) {
  const isCreditNote = invoice.details.documentType === 'credit_note';
  const bankDetailsPresent = checkBankDetails(invoice.bankDetails);
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
            <Text style={styles.invoiceDate}>Date: {formatDateUK(invoice.details.date)}</Text>
            <Text style={styles.invoiceDate}>
              Due: {formatDateUK(calculateDueDate(invoice.details.date, invoice.details.paymentTerms))}
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

        {/* Payment Details - bank details or security note */}
        {bankDetailsPresent ? (
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
        ) : (
          <View style={styles.bankSection}>
            <Text style={styles.bankTitle}>Payment Information</Text>
            <Text style={styles.paymentNote}>
              {invoice.details.notes?.includes('payment')
                ? '' // Notes already contain payment info, don't duplicate
                : 'For payment details, please contact us directly. Bank details are not included on this document for security purposes.'}
            </Text>
          </View>
        )}

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
