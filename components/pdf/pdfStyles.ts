/**
 * PDF Styles
 * Extracted from InvoicePDF.tsx — StyleSheet for @react-pdf/renderer
 */

import { StyleSheet } from '@react-pdf/renderer';

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
  paymentNote: {
    fontSize: 9,
    color: '#64748b',
    lineHeight: 1.5,
    fontStyle: 'italic' as const,
  },
});

export default styles;
