/**
 * PDF Styles — Dynamic, template-driven
 *
 * Generates @react-pdf/renderer styles from a PdfTemplate config.
 * Called per-render with the selected template + optional brand color override.
 */

import { StyleSheet } from '@react-pdf/renderer';
import type { PdfTemplate } from '@/lib/templates/pdfTemplates';

export function createPdfStyles(template: PdfTemplate, brandColorOverride?: string) {
  const c = template.colors;
  const t = template.typography;
  const l = template.layout;
  // Brand color override replaces the template primary
  const primary = brandColorOverride || c.primary;

  const isMinimalTable = l.tableStyle === 'minimal';
  const isBorderedTable = l.tableStyle === 'bordered';

  return StyleSheet.create({
    page: {
      padding: l.pageMargin,
      fontSize: t.bodySize,
      fontFamily: t.fontFamily,
      color: c.text,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: l.sectionSpacing + 5,
      paddingBottom: 12,
      borderBottomWidth: l.headerStyle === 'full-width' ? 2 : 1,
      borderBottomColor: l.headerStyle === 'full-width' ? primary : c.border,
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
      fontSize: t.titleSize,
      fontFamily: t.fontFamilyBold,
      color: primary,
      marginBottom: 4,
    },
    companyDetails: {
      fontSize: t.smallSize + 1,
      color: c.textMuted,
      lineHeight: 1.4,
    },
    invoiceTitle: {
      fontSize: t.headerSize,
      fontFamily: t.fontFamilyBold,
      color: primary,
      textAlign: 'right',
    },
    invoiceNumber: {
      fontSize: 12,
      textAlign: 'right',
      marginTop: 4,
    },
    invoiceDate: {
      fontSize: t.bodySize,
      color: c.textMuted,
      textAlign: 'right',
      marginTop: 2,
    },
    billToSection: {
      marginBottom: l.sectionSpacing,
      padding: 10,
      backgroundColor: c.surface,
      borderRadius: l.borderRadius,
    },
    billToLabel: {
      fontSize: t.smallSize,
      color: c.textMuted,
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    customerName: {
      fontSize: 12,
      fontFamily: t.fontFamilyBold,
      marginBottom: 2,
    },
    customerDetails: {
      fontSize: t.smallSize + 1,
      color: '#475569',
      lineHeight: 1.4,
    },
    table: {
      marginBottom: 12,
    },
    // Table header: colored bg for striped/bordered, no bg for minimal
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: isMinimalTable ? 'transparent' : primary,
      padding: 8,
      borderTopLeftRadius: l.borderRadius,
      borderTopRightRadius: l.borderRadius,
      ...(isMinimalTable
        ? { borderBottomWidth: 2, borderBottomColor: c.text }
        : {}),
    },
    tableHeaderText: {
      color: isMinimalTable ? c.text : '#ffffff',
      fontSize: t.smallSize + 1,
      fontFamily: t.fontFamilyBold,
      textTransform: 'uppercase',
    },
    tableRow: {
      flexDirection: 'row',
      padding: 8,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      ...(isBorderedTable
        ? { borderLeftWidth: 1, borderRightWidth: 1, borderLeftColor: c.border, borderRightColor: c.border }
        : {}),
    },
    tableRowAlt: {
      backgroundColor: l.tableStyle === 'striped' ? c.surface : 'transparent',
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
      marginBottom: l.sectionSpacing,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 6,
      paddingHorizontal: 10,
    },
    totalRowBorder: {
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    totalLabel: {
      fontSize: t.bodySize,
      color: c.textMuted,
    },
    totalValue: {
      fontSize: t.bodySize,
      fontFamily: t.fontFamilyBold,
    },
    grandTotalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      paddingHorizontal: 10,
      backgroundColor: primary,
      borderRadius: l.borderRadius,
      marginTop: 4,
    },
    grandTotalLabel: {
      fontSize: 12,
      fontFamily: t.fontFamilyBold,
      color: '#ffffff',
    },
    grandTotalValue: {
      fontSize: 14,
      fontFamily: t.fontFamilyBold,
      color: '#ffffff',
    },
    bankSection: {
      marginTop: 16,
      padding: 14,
      backgroundColor: isMinimalTable ? c.surface : '#f0f7ff',
      borderRadius: l.borderRadius + 2,
      borderWidth: 1,
      borderColor: primary,
    },
    bankTitle: {
      fontSize: 12,
      fontFamily: t.fontFamilyBold,
      color: primary,
      marginBottom: 8,
    },
    bankGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    bankItem: {
      width: '50%',
      marginBottom: 8,
    },
    bankLabel: {
      fontSize: t.smallSize,
      color: c.textMuted,
      marginBottom: 2,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    bankValue: {
      fontSize: 11,
      fontFamily: t.fontFamilyBold,
      color: c.text,
    },
    bankReferenceRow: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: c.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    bankReferenceLabel: {
      fontSize: t.smallSize,
      color: c.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    bankReferenceValue: {
      fontSize: 12,
      fontFamily: t.fontFamilyBold,
      color: primary,
    },
    bankAmountDue: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: c.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    bankAmountLabel: {
      fontSize: t.smallSize + 1,
      fontFamily: t.fontFamilyBold,
      color: '#475569',
    },
    bankAmountValue: {
      fontSize: 14,
      fontFamily: t.fontFamilyBold,
      color: primary,
    },
    footer: {
      position: 'absolute',
      bottom: 30,
      left: l.pageMargin,
      right: l.pageMargin,
      textAlign: 'center',
      fontSize: t.smallSize,
      color: '#94a3b8',
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    reverseChargeNote: {
      marginTop: 10,
      padding: 8,
      backgroundColor: '#fef3c7',
      borderRadius: l.borderRadius,
      borderLeftWidth: 3,
      borderLeftColor: c.warning,
    },
    reverseChargeText: {
      fontSize: t.smallSize + 1,
      color: '#92400e',
      fontStyle: 'italic',
    },
    // CIS styles
    cisBreakdown: {
      marginBottom: 10,
      padding: 8,
      backgroundColor: '#fffbeb',
      borderRadius: l.borderRadius,
      borderWidth: 1,
      borderColor: '#fcd34d',
    },
    cisTitle: {
      fontSize: t.bodySize,
      fontFamily: t.fontFamilyBold,
      color: '#92400e',
      marginBottom: 8,
    },
    cisRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 3,
    },
    cisLabel: {
      fontSize: t.smallSize + 1,
      color: '#78350f',
    },
    cisValue: {
      fontSize: t.smallSize + 1,
      fontFamily: t.fontFamilyBold,
      color: '#78350f',
    },
    cisDeduction: {
      color: '#dc2626',
    },
    cisNote: {
      marginTop: 8,
      padding: 8,
      backgroundColor: '#fef3c7',
      borderRadius: l.borderRadius,
      borderLeftWidth: 3,
      borderLeftColor: c.warning,
    },
    cisNoteText: {
      fontSize: t.smallSize + 1,
      color: '#92400e',
      fontStyle: 'italic',
    },
    netPayableRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      paddingHorizontal: 10,
      backgroundColor: c.success,
      borderRadius: l.borderRadius,
      marginTop: 4,
    },
    netPayableLabel: {
      fontSize: 12,
      fontFamily: t.fontFamilyBold,
      color: '#ffffff',
    },
    netPayableValue: {
      fontSize: 14,
      fontFamily: t.fontFamilyBold,
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
      fontSize: t.smallSize + 1,
      color: c.textMuted,
      textAlign: 'right' as const,
    },
    creditNoteReason: {
      marginTop: 10,
      marginBottom: 10,
      padding: 8,
      backgroundColor: '#fef2f2',
      borderRadius: l.borderRadius,
      borderLeftWidth: 3,
      borderLeftColor: '#dc2626',
    },
    // Notes section
    notesSection: {
      marginTop: 12,
      padding: 10,
      backgroundColor: c.surface,
      borderRadius: l.borderRadius,
    },
    notesTitle: {
      fontSize: t.bodySize,
      fontFamily: t.fontFamilyBold,
      color: '#475569',
      marginBottom: 6,
    },
    notesText: {
      fontSize: t.smallSize + 1,
      color: '#475569',
      lineHeight: 1.5,
    },
    paymentNote: {
      fontSize: t.smallSize + 1,
      color: c.textMuted,
      lineHeight: 1.5,
      fontStyle: 'italic' as const,
    },
    // Watermark overlay
    watermarkContainer: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    watermarkText: {
      fontSize: 72,
      fontFamily: t.fontFamilyBold,
      opacity: 0.08,
      transform: 'rotate(-45deg)',
      letterSpacing: 12,
    },
  });
}
