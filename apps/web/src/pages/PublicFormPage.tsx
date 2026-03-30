import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Zap, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { formService } from '../services/formService';
import { submissionService } from '../services/submissionService';
import type { FormSchema, FormComponent } from '../../modules/Core/types';

const inputCls =
  'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white ' +
  'focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all';

const FieldLabel: React.FC<{ label: string; required?: boolean }> = ({ label, required }) => (
  <label className="block text-sm font-medium text-gray-700 mb-1.5">
    {label}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const ErrorMsg: React.FC<{ msg?: string }> = ({ msg }) =>
  msg ? <p className="text-xs text-red-500 mt-1">{msg}</p> : null;

const renderField = (
  comp: FormComponent,
  value: unknown,
  onChange: (id: string, val: unknown) => void,
  error?: string,
) => {
  const p = comp.properties ?? {};
  const required = !!(p as any).required;

  switch (comp.type) {
    case 'heading':
      return (
        <div className={`font-bold text-gray-900 ${(p as any).level === 1 ? 'text-3xl' : (p as any).level === 3 ? 'text-xl' : 'text-2xl'}`}>
          {(p as any).content || comp.label || 'Heading'}
        </div>
      );

    case 'paragraph':
      return <p className="text-gray-600 text-sm leading-relaxed">{(p as any).content || ''}</p>;

    case 'divider':
      return <hr className="border-gray-200" />;

    case 'spacer': {
      const spacerCls = (p as any).size === 'large' ? 'h-10' : (p as any).size === 'small' ? 'h-3' : 'h-6';
      return <div className={spacerCls} aria-hidden="true" />;
    }

    case 'textfield':
    case 'email':
    case 'phone':
    case 'url':
    case 'number':
      return (
        <div>
          <FieldLabel label={comp.label} required={required} />
          <input
            type={comp.type === 'textfield' ? 'text' : comp.type}
            className={`${inputCls} ${error ? 'border-red-300 ring-1 ring-red-200' : ''}`}
            placeholder={(p as any).placeholder}
            value={value as string ?? ''}
            onChange={(e) => onChange(comp.id, e.target.value)}
          />
          {(p as any).helperText && (
            <p className="text-xs text-gray-400 mt-1">{(p as any).helperText}</p>
          )}
          <ErrorMsg msg={error} />
        </div>
      );

    case 'textarea':
      return (
        <div>
          <FieldLabel label={comp.label} required={required} />
          <textarea
            rows={(p as any).rows ?? 4}
            className={`${inputCls} resize-y ${error ? 'border-red-300' : ''}`}
            placeholder={(p as any).placeholder}
            value={value as string ?? ''}
            onChange={(e) => onChange(comp.id, e.target.value)}
          />
          <ErrorMsg msg={error} />
        </div>
      );

    case 'select': {
      const opts: { id: string; label: string; value: string }[] = (p as any).options ?? [];
      return (
        <div>
          <FieldLabel label={comp.label} required={required} />
          <select
            title={comp.label}
            aria-label={comp.label}
            className={`${inputCls} ${error ? 'border-red-300' : ''}`}
            value={value as string ?? ''}
            onChange={(e) => onChange(comp.id, e.target.value)}
          >
            <option value="">Select an option…</option>
            {opts.map((o) => (
              <option key={o.id} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ErrorMsg msg={error} />
        </div>
      );
    }

    case 'radio': {
      const opts: { id: string; label: string; value: string }[] = (p as any).options ?? [];
      return (
        <div>
          <FieldLabel label={comp.label} required={required} />
          <div className="space-y-2 mt-1">
            {opts.map((o) => (
              <label key={o.id} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name={`radio-${comp.id}`}
                  value={o.value}
                  checked={value === o.value}
                  onChange={() => onChange(comp.id, o.value)}
                  className="accent-violet-600"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">{o.label}</span>
              </label>
            ))}
          </div>
          <ErrorMsg msg={error} />
        </div>
      );
    }

    case 'checkbox': {
      const opts: { id: string; label: string; value: string }[] = (p as any).options ?? [];
      if (opts.length === 0) {
        return (
          <div>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => onChange(comp.id, e.target.checked)}
                className="accent-violet-600 w-4 h-4"
              />
              <span className="text-sm text-gray-700">
                {comp.label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </label>
            <ErrorMsg msg={error} />
          </div>
        );
      }
      const selected: string[] = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div>
          <FieldLabel label={comp.label} required={required} />
          <div className="space-y-2 mt-1">
            {opts.map((o) => (
              <label key={o.id} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.includes(o.value)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...selected, o.value]
                      : selected.filter((v) => v !== o.value);
                    onChange(comp.id, next);
                  }}
                  className="accent-violet-600 w-4 h-4"
                />
                <span className="text-sm text-gray-700">{o.label}</span>
              </label>
            ))}
          </div>
          <ErrorMsg msg={error} />
        </div>
      );
    }

    case 'date':
    case 'datetime-local':
    case 'time':
      return (
        <div>
          <FieldLabel label={comp.label} required={required} />
          <input
            type={comp.type}
            title={comp.label}
            aria-label={comp.label}
            className={`${inputCls} ${error ? 'border-red-300' : ''}`}
            value={value as string ?? ''}
            onChange={(e) => onChange(comp.id, e.target.value)}
          />
          <ErrorMsg msg={error} />
        </div>
      );

    case 'rating': {
      const max = (p as any).maxRating ?? (p as any).max ?? 5;
      return (
        <div>
          <FieldLabel label={comp.label} required={required} />
          <div className="flex gap-1 mt-1">
            {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => onChange(comp.id, star)}
                className={`text-2xl transition-transform hover:scale-110 ${
                  (value as number || 0) >= star ? 'text-amber-400' : 'text-gray-200'
                }`}
              >
                ★
              </button>
            ))}
          </div>
          <ErrorMsg msg={error} />
        </div>
      );
    }

    case 'file':
      return (
        <div>
          <FieldLabel label={comp.label} required={required} />
          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer bg-gray-50 hover:border-violet-400 hover:bg-violet-50/30 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-1">📎</div>
              <p className="text-sm text-gray-500">Click to upload or drag & drop</p>
              <p className="text-xs text-gray-400 mt-0.5">{(p as any).accept || 'Any file type'}</p>
            </div>
            <input type="file" className="hidden" accept={(p as any).accept} onChange={(e) => onChange(comp.id, e.target.files?.[0]?.name ?? '')} />
          </label>
          <ErrorMsg msg={error} />
        </div>
      );

    default:
      return null;
  }
};

export const PublicFormPage: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!formId) return;
    void formService.getForm(formId)
      .then((form) => setSchema(form.schema as FormSchema))
      .catch(() => setLoadError('This form is not available or has been removed.'));
  }, [formId]);

  const handleChange = (fieldId: string, val: unknown) => {
    setFormData((prev) => ({ ...prev, [fieldId]: val }));
    setErrors((prev) => { const next = { ...prev }; delete next[fieldId]; return next; });
  };

  const validate = (): boolean => {
    if (!schema) return false;
    const newErrors: Record<string, string> = {};
    for (const comp of schema.components) {
      const p = comp.properties ?? {};
      if ((p as any).required && !formData[comp.id]) {
        newErrors[comp.id] = `${comp.label || comp.type} is required`;
      }
      if (comp.type === 'email' && formData[comp.id]) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[comp.id] as string)) {
          newErrors[comp.id] = 'Enter a valid email address';
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !formId) return;
    setSubmitting(true);
    try {
      await submissionService.createSubmission(formId, formData);
      setSubmitted(true);
    } catch {
      setErrors({ _global: 'Failed to submit. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-700 mb-1">Form Not Found</h2>
          <p className="text-sm text-gray-500 mb-4">{loadError}</p>
          <Link to="/" className="text-violet-600 text-sm hover:underline">← Back to Home</Link>
        </div>
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-violet-600" size={36} />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {schema.settings?.successMessage || 'Thank you!'}
          </h2>
          <p className="text-gray-500 text-sm mb-6">Your response has been recorded successfully.</p>
          <button
            type="button"
            onClick={() => { setFormData({}); setSubmitted(false); }}
            className="px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors"
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 py-10 px-4">
      <div className="text-center mb-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors">
          <div className="w-5 h-5 bg-gradient-to-br from-violet-600 to-indigo-600 rounded flex items-center justify-center">
            <Zap size={10} className="text-white" />
          </div>
          Powered by KIM AI
        </Link>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500" />
            <div className="p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{schema.title || 'Untitled Form'}</h1>
              {schema.description && (
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">{schema.description}</p>
              )}

              <div className="space-y-5">
                {schema.components.map((comp) => (
                  <div key={comp.id}>
                    {renderField(comp, formData[comp.id], handleChange, errors[comp.id])}
                  </div>
                ))}
              </div>

              {errors._global && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{errors._global}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-8 w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-violet-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Submitting…</>
                ) : (
                  schema.settings?.submitButtonText || 'Submit'
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
