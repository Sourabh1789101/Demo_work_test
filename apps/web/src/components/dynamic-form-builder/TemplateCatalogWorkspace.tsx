import React, { useEffect, useMemo, useState } from 'react';
import { DynamicFormRenderer } from './DynamicFormRenderer';
import { templateCatalogService } from '../../services/templateCatalogService';
import type { FormTemplate, TemplateAnswerMap, TemplateCategory } from '../../types/templateCatalog';

const ALL_TEMPLATES_SLUG = '__all_templates__';

const PRIMARY_COLOR_TO_ACCENT_CLASS: Record<string, string> = {
  '#2C3E50': 'bg-slate-700',
  '#3498DB': 'bg-sky-500',
  '#1ABC9C': 'bg-teal-500',
  '#E74C3C': 'bg-rose-500',
  '#F1C40F': 'bg-yellow-400',
};

const resolveAccentClass = (primaryColor?: string): string => {
  const normalized = (primaryColor || '').toUpperCase();
  return PRIMARY_COLOR_TO_ACCENT_CLASS[normalized] || 'bg-blue-500';
};

const getInitialTemplate = (categories: TemplateCategory[], categorySlug: string | null): FormTemplate | null => {
  const allTemplates = categories.flatMap((category) => category.templates);

  if (categorySlug === ALL_TEMPLATES_SLUG) {
    return allTemplates[0] ?? null;
  }

  if (categories.length === 0) {
    return null;
  }

  const selectedCategory = categorySlug
    ? categories.find((category) => category.category_slug === categorySlug)
    : categories[0];

  if (!selectedCategory || selectedCategory.templates.length === 0) {
    return null;
  }

  return selectedCategory.templates[0];
};

export const TemplateCatalogWorkspace: React.FC = () => {
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadCatalog = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const apiCategories = await templateCatalogService.listCategories();
        setCategories(apiCategories);

        const firstCategorySlug = ALL_TEMPLATES_SLUG;

        setActiveCategorySlug(firstCategorySlug);
        setSelectedTemplate(getInitialTemplate(apiCategories, firstCategorySlug));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load template catalog';
        setLoadError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadCatalog();
  }, []);

  const activeCategory = useMemo(
    () => categories.find((category) => category.category_slug === activeCategorySlug) || null,
    [activeCategorySlug, categories]
  );

  const allTemplates = useMemo(() => categories.flatMap((category) => category.templates), [categories]);

  const categoryTemplates = activeCategorySlug === ALL_TEMPLATES_SLUG
    ? allTemplates
    : activeCategory?.templates ?? [];

  useEffect(() => {
    if (!selectedTemplate) {
      return;
    }

    const templateStillVisible = categoryTemplates.some((template) => template.id === selectedTemplate.id);
    if (!templateStillVisible) {
      setSelectedTemplate(categoryTemplates[0] ?? null);
    }
  }, [categoryTemplates, selectedTemplate]);

  const handleCategoryClick = (categorySlug: string) => {
    setActiveCategorySlug(categorySlug);

    if (categorySlug === ALL_TEMPLATES_SLUG) {
      setSelectedTemplate(allTemplates[0] ?? null);
      setSubmitStatus(null);
      return;
    }

    const nextCategory = categories.find((category) => category.category_slug === categorySlug);
    setSelectedTemplate(nextCategory?.templates[0] ?? null);
    setSubmitStatus(null);
  };

  const handleTemplateResponse = async (answers: TemplateAnswerMap): Promise<void> => {
    if (!selectedTemplate) {
      return;
    }

    setIsSubmittingResponse(true);
    setSubmitStatus(null);

    try {
      const storedResponse = await templateCatalogService.submitTemplateResponse(selectedTemplate.id, answers);
      setSubmitStatus(`Saved response ${storedResponse.id} at ${new Date(storedResponse.submitted_at).toLocaleString()}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save response';
      setSubmitStatus(message);
      throw error;
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-600">Loading template catalog...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-full grid-cols-1 gap-4 bg-gray-50 p-4 lg:grid-cols-12">
      <aside className="min-h-0 rounded-xl border border-gray-200 bg-white p-3 lg:col-span-3">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Categories</h2>
        <div className="max-h-[75vh] space-y-2 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => handleCategoryClick(ALL_TEMPLATES_SLUG)}
            className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
              activeCategorySlug === ALL_TEMPLATES_SLUG
                ? 'border-blue-600 bg-blue-50 font-semibold text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="block">All Templates</span>
            <span className="text-xs text-gray-500">{allTemplates.length} template(s)</span>
          </button>

          {categories.map((category) => {
            const active = category.category_slug === activeCategorySlug;
            const categoryCountLabel = category.template_count
              ? `${category.template_count} templates`
              : `${category.templates.length} template(s)`;

            return (
              <button
                key={category.category_slug}
                type="button"
                onClick={() => handleCategoryClick(category.category_slug)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                  active
                    ? 'border-blue-600 bg-blue-50 font-semibold text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="block">{category.category_name}</span>
                <span className="text-xs text-gray-500">{categoryCountLabel}</span>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="min-h-0 rounded-xl border border-gray-200 bg-white p-3 lg:col-span-3">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Templates</h2>

        {categoryTemplates.length === 0 ? (
          <p className="text-sm text-gray-500">No templates in this category.</p>
        ) : (
          <div className="max-h-[75vh] space-y-2 overflow-y-auto pr-1">
            {categoryTemplates.map((template) => {
              const active = selectedTemplate?.id === template.id;
              const accentClass = resolveAccentClass(template.design_settings.primary_color);

              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => {
                    setSelectedTemplate(template);
                    setSubmitStatus(null);
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                    active
                      ? 'border-gray-900 bg-gray-100'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className={`mb-1 h-1 w-full rounded-full ${accentClass}`} />
                  <p className="text-sm font-semibold text-gray-900">{template.name}</p>
                  <p className="mt-0.5 text-xs text-gray-600">{template.description}</p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <main className="min-h-0 lg:col-span-6">
        {selectedTemplate ? (
          <>
            <DynamicFormRenderer
              template={selectedTemplate}
              onSubmit={handleTemplateResponse}
              submitting={isSubmittingResponse}
            />
            {submitStatus ? (
              <div className="mt-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700">
                {submitStatus}
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white text-sm text-gray-500">
            Select a template to render the dynamic form.
          </div>
        )}
      </main>
    </div>
  );
};
