/**
 * PDF Template System
 * Defines customizable themes for invoice PDFs
 *
 * Design: Configuration-based, easily extensible
 * Add new templates by adding to TEMPLATES object
 */

// ===== Types =====

export interface PdfTemplate {
  id: string;
  name: string;
  description: string;
  preview: string; // Preview image path or emoji
  colors: TemplateColors;
  typography: TemplateTypography;
  layout: TemplateLayout;
}

export interface TemplateColors {
  primary: string;      // Header, accents
  secondary: string;    // Subtle accents
  text: string;         // Main text
  textMuted: string;    // Secondary text
  background: string;   // Page background
  surface: string;      // Cards, sections
  border: string;       // Borders, dividers
  success: string;      // Positive amounts
  warning: string;      // Notices
}

export interface TemplateTypography {
  headerSize: number;
  titleSize: number;
  bodySize: number;
  smallSize: number;
  fontFamily: string;
  fontFamilyBold: string;
}

export interface TemplateLayout {
  pageMargin: number;
  sectionSpacing: number;
  borderRadius: number;
  showLogo: boolean;
  logoPosition: 'left' | 'right' | 'center';
  headerStyle: 'full-width' | 'minimal' | 'boxed';
  tableStyle: 'striped' | 'bordered' | 'minimal';
}

// ===== Templates =====

export const TEMPLATES: Record<string, PdfTemplate> = {
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, professional design with K&R branding',
    preview: '🎨',
    colors: {
      primary: '#0b4f7a',      // K&R Blue
      secondary: '#c61f2b',    // K&R Red
      text: '#1e293b',
      textMuted: '#64748b',
      background: '#ffffff',
      surface: '#f8fafc',
      border: '#e2e8f0',
      success: '#16a34a',
      warning: '#f59e0b',
    },
    typography: {
      headerSize: 24,
      titleSize: 18,
      bodySize: 10,
      smallSize: 8,
      fontFamily: 'Helvetica',
      fontFamilyBold: 'Helvetica-Bold',
    },
    layout: {
      pageMargin: 40,
      sectionSpacing: 15,
      borderRadius: 4,
      showLogo: true,
      logoPosition: 'left',
      headerStyle: 'full-width',
      tableStyle: 'striped',
    },
  },

  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional, formal invoice style',
    preview: '📋',
    colors: {
      primary: '#1a1a1a',
      secondary: '#4a4a4a',
      text: '#1a1a1a',
      textMuted: '#6b6b6b',
      background: '#ffffff',
      surface: '#fafafa',
      border: '#d4d4d4',
      success: '#166534',
      warning: '#a16207',
    },
    typography: {
      headerSize: 28,
      titleSize: 16,
      bodySize: 11,
      smallSize: 9,
      fontFamily: 'Times-Roman',
      fontFamilyBold: 'Times-Bold',
    },
    layout: {
      pageMargin: 50,
      sectionSpacing: 20,
      borderRadius: 0,
      showLogo: true,
      logoPosition: 'center',
      headerStyle: 'minimal',
      tableStyle: 'bordered',
    },
  },

  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple, distraction-free layout',
    preview: '⚪',
    colors: {
      primary: '#374151',
      secondary: '#6b7280',
      text: '#111827',
      textMuted: '#9ca3af',
      background: '#ffffff',
      surface: '#ffffff',
      border: '#e5e7eb',
      success: '#059669',
      warning: '#d97706',
    },
    typography: {
      headerSize: 20,
      titleSize: 14,
      bodySize: 10,
      smallSize: 8,
      fontFamily: 'Helvetica',
      fontFamilyBold: 'Helvetica-Bold',
    },
    layout: {
      pageMargin: 40,
      sectionSpacing: 12,
      borderRadius: 0,
      showLogo: true,
      logoPosition: 'left',
      headerStyle: 'minimal',
      tableStyle: 'minimal',
    },
  },
};

// ===== Helper Functions =====

export function getTemplate(id: string): PdfTemplate {
  return TEMPLATES[id] || TEMPLATES.modern;
}

export function getTemplateList(): PdfTemplate[] {
  return Object.values(TEMPLATES);
}

export function createCustomTemplate(
  baseId: string,
  customColors: Partial<TemplateColors>
): PdfTemplate {
  const base = getTemplate(baseId);
  return {
    ...base,
    id: 'custom',
    name: 'Custom',
    colors: { ...base.colors, ...customColors },
  };
}

// ===== Default Export =====

export const DEFAULT_TEMPLATE_ID = 'modern';
