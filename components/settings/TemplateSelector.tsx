'use client';

import { getTemplateList, type PdfTemplate } from '@/lib/templates/pdfTemplates';
import { useSettingsStore } from '@/stores/settingsStore';

/**
 * Template Selector
 * Visual grid for selecting PDF templates
 *
 * Apple-style design:
 * - Card-based selection
 * - Visual preview
 * - Selected state with ring
 */
export default function TemplateSelector() {
  const templates = getTemplateList();
  const templateId = useSettingsStore((state) => state.templateId);
  const setTemplateId = useSettingsStore((state) => state.setTemplateId);

  return (
    <div className="space-y-3">
      <label className="form-label">Invoice Template</label>
      <div className="grid grid-cols-3 gap-3">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={templateId === template.id}
            onSelect={() => setTemplateId(template.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ===== Template Card =====

interface TemplateCardProps {
  template: PdfTemplate;
  isSelected: boolean;
  onSelect: () => void;
}

function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative p-3 rounded-xl border-2 transition-all text-left
        ${isSelected
          ? 'border-[var(--brand-blue)] bg-[var(--brand-blue-50)] ring-2 ring-[var(--brand-blue)]/20'
          : 'border-[var(--surface-border)] hover:border-[var(--input-border-hover)] hover:bg-[var(--surface-elevated)]'
        }`}
    >
      {/* Preview area */}
      <div
        className="w-full h-16 rounded-lg mb-2 flex items-center justify-center text-2xl"
        style={{ backgroundColor: template.colors.surface }}
      >
        <div
          className="w-full h-2 rounded-full"
          style={{ backgroundColor: template.colors.primary, margin: '0 12px' }}
        />
      </div>

      {/* Template name */}
      <p className="font-medium text-sm text-[var(--text-primary)]">
        {template.name}
      </p>
      <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1">
        {template.description}
      </p>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--brand-blue)] flex items-center justify-center">
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
      )}
    </button>
  );
}
