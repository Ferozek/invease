'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import { formatCurrency } from '@/lib/formatters';
import { formatDateUK } from '@/lib/dateUtils';
import { getTemplate } from '@/lib/templates/pdfTemplates';
import type { StatementRow, StatementSummary } from '@/lib/statementUtils';

interface StatementPDFProps {
  companyName: string;
  companyAddress: string;
  companyPostCode: string;
  customerName: string;
  customerAddress: string;
  customerPostCode: string;
  rows: StatementRow[];
  summary: StatementSummary;
  templateId?: string;
  brandColor?: string;
}

export default function StatementPDF({
  companyName,
  companyAddress,
  companyPostCode,
  customerName,
  customerAddress,
  customerPostCode,
  rows,
  summary,
  templateId,
  brandColor,
}: StatementPDFProps) {
  const template = getTemplate(templateId || 'modern');
  const primary = brandColor || template.colors.primary;
  const c = template.colors;
  const t = template.typography;

  const styles = StyleSheet.create({
    page: {
      padding: 40,
      fontSize: 9,
      fontFamily: t.fontFamily,
      color: c.text,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
      paddingBottom: 12,
      borderBottomWidth: 2,
      borderBottomColor: primary,
    },
    companyName: {
      fontSize: 16,
      fontFamily: t.fontFamilyBold,
      color: primary,
      marginBottom: 4,
    },
    companyDetails: {
      fontSize: 8,
      color: c.textMuted,
      lineHeight: 1.5,
    },
    title: {
      fontSize: 18,
      fontFamily: t.fontFamilyBold,
      color: primary,
      textAlign: 'right',
    },
    asOfDate: {
      fontSize: 9,
      color: c.textMuted,
      textAlign: 'right',
      marginTop: 4,
    },
    billTo: {
      marginBottom: 16,
      padding: 10,
      backgroundColor: c.surface,
      borderRadius: 4,
    },
    billToLabel: {
      fontSize: 7,
      fontFamily: t.fontFamilyBold,
      color: c.textMuted,
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    customerName: {
      fontSize: 11,
      fontFamily: t.fontFamilyBold,
      color: c.text,
      marginBottom: 2,
    },
    customerDetails: {
      fontSize: 8,
      color: c.textMuted,
      lineHeight: 1.4,
    },
    table: {
      marginBottom: 16,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: primary,
      paddingVertical: 6,
      paddingHorizontal: 8,
      borderRadius: 3,
    },
    tableHeaderText: {
      fontSize: 7,
      fontFamily: t.fontFamilyBold,
      color: '#ffffff',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 5,
      paddingHorizontal: 8,
      borderBottomWidth: 0.5,
      borderBottomColor: c.border,
    },
    tableRowAlt: {
      backgroundColor: c.surface,
    },
    colDate: { width: '12%' },
    colNumber: { width: '14%' },
    colDesc: { width: '30%' },
    colAmount: { width: '14%', textAlign: 'right' },
    colPaid: { width: '14%', textAlign: 'right' },
    colBalance: { width: '16%', textAlign: 'right' },
    summarySection: {
      marginTop: 8,
      padding: 12,
      backgroundColor: c.surface,
      borderRadius: 4,
    },
    summaryTitle: {
      fontSize: 10,
      fontFamily: t.fontFamilyBold,
      color: primary,
      marginBottom: 8,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 3,
    },
    summaryLabel: {
      fontSize: 9,
      color: c.textMuted,
    },
    summaryValue: {
      fontSize: 9,
      fontFamily: t.fontFamilyBold,
      color: c.text,
    },
    outstandingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 6,
      marginTop: 4,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    outstandingLabel: {
      fontSize: 11,
      fontFamily: t.fontFamilyBold,
      color: c.text,
    },
    outstandingValue: {
      fontSize: 11,
      fontFamily: t.fontFamilyBold,
    },
    footer: {
      position: 'absolute',
      bottom: 30,
      left: 40,
      right: 40,
      textAlign: 'center',
      fontSize: 7,
      color: c.textMuted,
    },
    creditText: {
      color: '#ef4444',
    },
  });

  const today = formatDateUK(new Date().toISOString().slice(0, 10));
  const isCredit = summary.outstanding < 0;

  return (
    <Document
      title={`Statement — ${customerName}`}
      author={companyName || 'Invease'}
      subject={`Statement of Account for ${customerName}`}
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{companyName}</Text>
            <Text style={styles.companyDetails}>
              {companyAddress}
              {'\n'}
              {companyPostCode}
            </Text>
          </View>
          <View>
            <Text style={styles.title}>STATEMENT</Text>
            <Text style={styles.asOfDate}>As of {today}</Text>
          </View>
        </View>

        {/* Bill To */}
        <View style={styles.billTo}>
          <Text style={styles.billToLabel}>Statement For</Text>
          <Text style={styles.customerName}>{customerName}</Text>
          <Text style={styles.customerDetails}>
            {customerAddress}
            {'\n'}
            {customerPostCode}
          </Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDate]}>Date</Text>
            <Text style={[styles.tableHeaderText, styles.colNumber]}>Reference</Text>
            <Text style={[styles.tableHeaderText, styles.colDesc]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.colAmount]}>Amount</Text>
            <Text style={[styles.tableHeaderText, styles.colPaid]}>Paid</Text>
            <Text style={[styles.tableHeaderText, styles.colBalance]}>Balance</Text>
          </View>

          {rows.map((row, index) => (
            <View
              key={`${row.invoiceNumber}-${index}`}
              style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}
            >
              <Text style={styles.colDate}>{row.date}</Text>
              <Text style={styles.colNumber}>{row.invoiceNumber}</Text>
              <Text style={styles.colDesc}>{row.description}</Text>
              <Text style={[styles.colAmount, row.amount < 0 ? styles.creditText : {}]}>
                {row.amount < 0 ? `-${formatCurrency(Math.abs(row.amount))}` : formatCurrency(row.amount)}
              </Text>
              <Text style={styles.colPaid}>
                {row.paid > 0 ? formatCurrency(row.paid) : ''}
              </Text>
              <Text style={[styles.colBalance, row.balance < 0 ? styles.creditText : {}]}>
                {row.balance < 0
                  ? `-${formatCurrency(Math.abs(row.balance))}`
                  : formatCurrency(row.balance)}
              </Text>
            </View>
          ))}

          {rows.length === 0 && (
            <View style={styles.tableRow}>
              <Text style={{ color: c.textMuted, fontStyle: 'italic' }}>
                No transactions found for this customer.
              </Text>
            </View>
          )}
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Account Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Invoiced</Text>
            <Text style={styles.summaryValue}>{formatCurrency(summary.totalInvoiced)}</Text>
          </View>
          {summary.totalCredited > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Credited</Text>
              <Text style={[styles.summaryValue, styles.creditText]}>
                -{formatCurrency(summary.totalCredited)}
              </Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Paid</Text>
            <Text style={styles.summaryValue}>{formatCurrency(summary.totalPaid)}</Text>
          </View>
          <View style={styles.outstandingRow}>
            <Text style={styles.outstandingLabel}>
              {isCredit ? 'Credit Balance' : 'Outstanding'}
            </Text>
            <Text
              style={[
                styles.outstandingValue,
                isCredit
                  ? { color: c.success }
                  : summary.outstanding > 0
                    ? { color: primary }
                    : { color: c.textMuted },
              ]}
            >
              {isCredit
                ? formatCurrency(Math.abs(summary.outstanding))
                : formatCurrency(summary.outstanding)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          This statement was generated on {today}. If you have any queries, please contact us.
        </Text>
      </Page>
    </Document>
  );
}
