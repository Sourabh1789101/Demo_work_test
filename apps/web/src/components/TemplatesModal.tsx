import React, { useState } from 'react';
import { X, Search, LayoutTemplate, ChevronRight } from 'lucide-react';
import { FORM_TEMPLATES, TEMPLATE_CATEGORIES, FormTemplate } from '../lib/templates';
import { useBuilderStore } from '../../modules/store/builderStore';

interface TemplatesModalProps {
  onClose: () => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({ onClose }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState<FormTemplate | null>(null);
  const { loadTemplate } = useBuilderStore();

  const filtered = FORM_TEMPLATES.filter(t => {
    const matchCat = activeCategory === 'all' || t.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || t.label.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const applyTemplate = (template: FormTemplate) => {
    const partial = template.buildSchema();
    const now = new Date().toISOString();

    loadTemplate({
      id: '',           // loadTemplate generates a new id internally
      version: 1,
      title: partial.title ?? 'Untitled Form',
      description: partial.description ?? '',
      components: (partial.components ?? []) as any,
      createdAt: now,
      updatedAt: now,
      settings: {
        submitButtonText: 'Submit',
        layout: 'vertical',
        theme: 'blue',
        multiStep: false,
        ...(partial.settings ?? {}),
      } as any,
    });

    onClose();
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal shell */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <LayoutTemplate size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Form Templates</h2>
              <p className="text-xs text-gray-500">{FORM_TEMPLATES.length} ready-to-use templates</p>
            </div>
          </div>
          <button
            type="button"
            title="Close"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* ── Sidebar: categories ── */}
          <aside className="w-44 border-r border-gray-200 flex-shrink-0 bg-gray-50 p-3 space-y-1">
            {TEMPLATE_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search */}
            <div className="px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Template grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                  <LayoutTemplate size={32} className="mb-2 opacity-30" />
                  <p className="text-sm">No templates found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Blank canvas card */}
                  {activeCategory === 'all' && !search && (
                    <button
                      type="button"
                      onClick={() => applyTemplate({
                        id: 'blank',
                        label: 'Blank Form',
                        description: '',
                        category: 'personal',
                        icon: '',
                        color: '',
                        fields: 0,
                        buildSchema: () => ({
                          title: 'Untitled Form',
                          description: '',
                          components: [],
                          settings: { submitButtonText: 'Submit', layout: 'vertical', theme: 'blue', multiStep: false } as any,
                        }),
                      })}
                      className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/40 transition-all group"
                    >
                      <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">+</span>
                      <span className="text-xs font-semibold">Start from Blank</span>
                    </button>
                  )}

                  {filtered.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onPreview={() => setPreview(template)}
                      onApply={() => applyTemplate(template)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Preview panel (slide-in) ── */}
      {preview && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4" onClick={() => setPreview(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Preview header */}
            <div className={`bg-gradient-to-br ${preview.color} p-6 text-white`}>
              <div className="text-4xl mb-3">{preview.icon}</div>
              <h3 className="text-xl font-bold">{preview.label}</h3>
              <p className="text-sm opacity-90 mt-1">{preview.description}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
                {preview.fields} fields included
              </div>
            </div>

            {/* Fields preview list */}
            <div className="p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Included Fields</p>
              <ul className="space-y-2">
                {(preview.buildSchema().components ?? [])
                  .filter((c: any) => !['heading', 'paragraph', 'divider'].includes(c.type))
                  .map((c: any) => (
                    <li key={c.id} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                      <span className="font-medium">{c.label}</span>
                      <span className="text-gray-400 text-xs capitalize ml-auto">{c.type}</span>
                    </li>
                  ))}
              </ul>

              <div className="flex gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="flex-1 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => { applyTemplate(preview); setPreview(null); }}
                  className={`flex-1 py-2.5 text-sm font-semibold text-white bg-gradient-to-r ${preview.color} rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}
                >
                  Use This Template <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Template Card ─────────────────────────────────────────────────────────────
const TemplateCard: React.FC<{
  template: FormTemplate;
  onPreview: () => void;
  onApply: () => void;
}> = ({ template, onPreview, onApply }) => (
  <div className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer">
    {/* Colour stripe */}
    <div className={`h-1.5 bg-gradient-to-r ${template.color}`} />

    <div className="p-4">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{template.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 leading-tight">{template.label}</p>
          <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2 leading-tight">{template.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium capitalize">
          {template.category}
        </span>
        <span className="text-[10px] text-gray-400">{template.fields} fields</span>
      </div>
    </div>

    {/* Hover action overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end pb-4 gap-2 px-4">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onApply(); }}
        className="w-full py-2 bg-white text-gray-900 text-xs font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
      >
        Use Template
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onPreview(); }}
        className="w-full py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-lg hover:bg-white/30 transition-colors border border-white/30"
      >
        Preview Fields
      </button>
    </div>
  </div>
);
