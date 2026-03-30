import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { FormTemplate, TemplateAnswerMap, TemplateDesignSettings, TemplateField } from '../../types/templateCatalog';
import './dynamicFormRenderer.css';

interface DynamicFormRendererProps {
  template: FormTemplate;
  onSubmit: (answers: TemplateAnswerMap) => Promise<void>;
  submitting?: boolean;
}

const toAnswerKey = (label: string, index: number): string => {
  const normalizedLabel = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return `${normalizedLabel || 'field'}_${index + 1}`;
};

const isEmptyValue = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'number') return Number.isNaN(value);
  return value === undefined || value === null || value === '';
};

const getRatingMax = (field: TemplateField): number => {
  const match = field.scale?.match(/(\d+)/);
  return match ? Number(match[1]) : 5;
};

const getBackgroundFromDesign = (designSettings: TemplateDesignSettings, primaryColor: string, secondaryColor: string): string => {
  if (designSettings.background_image) {
    return `linear-gradient(rgba(255,255,255,0.88), rgba(255,255,255,0.88)), url(${designSettings.background_image})`;
  }

  const backgroundType = (designSettings.background_type || '').toLowerCase();

  if (backgroundType.includes('gradient')) {
    return `linear-gradient(135deg, ${secondaryColor}, #ffffff)`;
  }

  if (backgroundType.includes('confetti')) {
    return `
      radial-gradient(circle at 20% 20%, ${primaryColor}22 0 14px, transparent 15px),
      radial-gradient(circle at 80% 35%, ${primaryColor}33 0 10px, transparent 11px),
      radial-gradient(circle at 35% 80%, ${primaryColor}22 0 11px, transparent 12px),
      #ffffff
    `;
  }

  if (backgroundType.includes('blue tint')) {
    return '#eff6ff';
  }

  if (backgroundType.includes('solid')) {
    return secondaryColor;
  }

  return '#ffffff';
};

const getLayoutClassName = (layout?: string): string => {
  const normalizedLayout = (layout || '').toLowerCase();

  if (normalizedLayout.includes('two column')) {
    return 'grid grid-cols-1 gap-4 md:grid-cols-2';
  }

  return 'space-y-4';
};

export const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({ template, onSubmit, submitting = false }) => {
  const formContainerRef = useRef<HTMLElement | null>(null);
  const [answers, setAnswers] = useState<TemplateAnswerMap>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSubmittingInternally, setIsSubmittingInternally] = useState(false);

  const primaryColor = template.design_settings.primary_color || '#2563eb';
  const secondaryColor = template.design_settings.secondary_color || '#ffffff';
  const fontFamily = template.design_settings.font_family || 'inherit';
  const isCardLayout = (template.design_settings.layout || '').toLowerCase().includes('card');
  const resolvedBackground = useMemo(
    () => getBackgroundFromDesign(template.design_settings, primaryColor, secondaryColor),
    [primaryColor, secondaryColor, template.design_settings]
  );

  useEffect(() => {
    const container = formContainerRef.current;
    if (!container) {
      return;
    }

    container.style.setProperty('--dfr-primary-color', primaryColor);
    container.style.setProperty('--dfr-secondary-color', secondaryColor);
    container.style.setProperty('--dfr-background', resolvedBackground);
    container.style.setProperty('--dfr-font-family', fontFamily);

    if (template.design_settings.background_image) {
      container.classList.add('dynamic-form-surface--image');
    } else {
      container.classList.remove('dynamic-form-surface--image');
    }
  }, [fontFamily, primaryColor, resolvedBackground, secondaryColor, template.design_settings.background_image]);

  const setAnswerValue = (key: string, value: unknown) => {
    setAnswers((currentAnswers) => ({ ...currentAnswers, [key]: value }));
    setFieldErrors((currentErrors) => {
      if (!currentErrors[key]) return currentErrors;
      const nextErrors = { ...currentErrors };
      delete nextErrors[key];
      return nextErrors;
    });
  };

  const validateForm = (): boolean => {
    const nextErrors: Record<string, string> = {};

    template.fields.forEach((field, index) => {
      const answerKey = toAnswerKey(field.label, index);
      const value = answers[answerKey];

      if (field.required && isEmptyValue(value)) {
        nextErrors[answerKey] = `${field.label} is required`;
      }

      if (field.type === 'email' && typeof value === 'string' && value.trim().length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          nextErrors[answerKey] = 'Please enter a valid email address';
        }
      }

      if (field.type === 'url' && typeof value === 'string' && value.trim().length > 0) {
        try {
          new URL(value);
        } catch {
          nextErrors[answerKey] = 'Please enter a valid URL';
        }
      }
    });

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitError(null);
    setSubmitSuccess(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmittingInternally(true);
    try {
      await onSubmit(answers);
      setSubmitSuccess('Response submitted successfully.');
      setAnswers({});
      setFieldErrors({});
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit response';
      setSubmitError(message);
    } finally {
      setIsSubmittingInternally(false);
    }
  };

  const renderField = (field: TemplateField, index: number) => {
    const answerKey = toAnswerKey(field.label, index);
    const answerValue = answers[answerKey];
    const error = fieldErrors[answerKey];

    const sharedInputClassName = `w-full rounded-lg border px-3 py-2 text-sm transition ${
      error ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-gray-500'
    }`;

    const fieldContainerClassName = isCardLayout
      ? 'rounded-lg border border-gray-200 bg-white/90 p-3'
      : '';

    const labelBlock = (
      <label htmlFor={answerKey} className="mb-1 block text-sm font-semibold text-gray-800">
        {field.label}
        {field.required ? <span className="ml-1 text-red-500">*</span> : null}
      </label>
    );

    switch (field.type) {
      case 'long_text':
        return (
          <div className={fieldContainerClassName}>
            {labelBlock}
            <textarea
              id={answerKey}
              value={typeof answerValue === 'string' ? answerValue : ''}
              onChange={(event) => setAnswerValue(answerKey, event.target.value)}
              required={field.required}
              placeholder={field.placeholder || 'Type your answer...'}
              rows={4}
              className={`${sharedInputClassName} resize-y`}
            />
            {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
          </div>
        );

      case 'dropdown':
        return (
          <div className={fieldContainerClassName}>
            {labelBlock}
            <select
              id={answerKey}
              value={typeof answerValue === 'string' ? answerValue : ''}
              onChange={(event) => setAnswerValue(answerKey, event.target.value)}
              required={field.required}
              className={sharedInputClassName}
            >
              <option value="">Select an option</option>
              {(field.options || []).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
          </div>
        );

      case 'radio':
        return (
          <fieldset className={fieldContainerClassName}>
            <legend className="mb-1 block text-sm font-semibold text-gray-800">
              {field.label}
              {field.required ? <span className="ml-1 text-red-500">*</span> : null}
            </legend>
            <div className="space-y-2">
              {(field.options || []).map((option) => (
                <label key={option} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name={answerKey}
                    checked={answerValue === option}
                    onChange={() => setAnswerValue(answerKey, option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
          </fieldset>
        );

      case 'checkbox_group':
      case 'availability': {
        const selectedValues = Array.isArray(answerValue) ? answerValue : [];
        return (
          <fieldset className={fieldContainerClassName}>
            <legend className="mb-1 block text-sm font-semibold text-gray-800">
              {field.label}
              {field.required ? <span className="ml-1 text-red-500">*</span> : null}
            </legend>
            <div className="space-y-2">
              {(field.options || []).map((option) => (
                <label key={option} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option)}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setAnswerValue(answerKey, [...selectedValues, option]);
                        return;
                      }

                      setAnswerValue(
                        answerKey,
                        selectedValues.filter((selectedOption) => selectedOption !== option)
                      );
                    }}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
          </fieldset>
        );
      }

      case 'file_upload':
        return (
          <div className={fieldContainerClassName}>
            {labelBlock}
            <input
              id={answerKey}
              type="file"
              required={field.required}
              className={sharedInputClassName}
              onChange={(event) => {
                const fileNames = event.target.files
                  ? Array.from(event.target.files).map((file) => file.name)
                  : [];
                setAnswerValue(answerKey, fileNames);
              }}
            />
            {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
          </div>
        );

      case 'rating': {
        const ratingMax = getRatingMax(field);
        const selectedRating = typeof answerValue === 'number' ? answerValue : 0;

        return (
          <fieldset className={fieldContainerClassName}>
            <legend className="mb-1 block text-sm font-semibold text-gray-800">
              {field.label}
              {field.required ? <span className="ml-1 text-red-500">*</span> : null}
            </legend>
            <div className="flex gap-1">
              {Array.from({ length: ratingMax }).map((_, ratingIndex) => (
                <button
                  key={`${answerKey}_rating_${ratingIndex + 1}`}
                  type="button"
                  onClick={() => setAnswerValue(answerKey, ratingIndex + 1)}
                  className={`text-2xl ${
                    ratingIndex < selectedRating
                      ? 'dynamic-form-rating-active'
                      : 'dynamic-form-rating-inactive'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
          </fieldset>
        );
      }

      case 'payment': {
        const amountCents = Number(field.amountCents ?? field.price ?? 1000);
        const currency = (field.currency ?? 'usd').toUpperCase();
        const amountDisplay = (amountCents / 100).toLocaleString('en-US', {
          style: 'currency',
          currency: currency,
        });
        const isPaid = answerValue === 'paid';
        const isPaying = answerValue === 'processing';

        const handlePay = async () => {
          if (isPaid || isPaying) return;
          setAnswerValue(answerKey, 'processing');
          try {
            const res = await fetch(
              `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/payments/intent`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  formId: 'dynamic-form',
                  amountCents,
                  currency: currency.toLowerCase(),
                  description: field.description ?? field.label,
                }),
              },
            );
            const json = await res.json() as { success: boolean; data?: { clientSecret: string; paymentIntentId: string } };
            if (!json.success || !json.data) throw new Error('Failed to create payment intent');
            // Store the intent ID — actual confirmation handled by Stripe.js on the host page
            setAnswerValue(answerKey, `intent:${json.data.paymentIntentId}`);
          } catch {
            setAnswerValue(answerKey, '');
            alert('Payment setup failed. Please try again.');
          }
        };

        return (
          <div className={fieldContainerClassName}>
            {labelBlock}
            <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Amount due</span>
                <span className="text-lg font-bold text-gray-900">{amountDisplay}</span>
              </div>
              {isPaid ? (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded px-3 py-2 text-sm font-medium">
                  <span>✓</span> Payment authorized
                </div>
              ) : typeof answerValue === 'string' && answerValue.startsWith('intent:') ? (
                <div className="flex items-center gap-2 text-blue-700 bg-blue-50 rounded px-3 py-2 text-sm font-medium">
                  <span>⏳</span> Payment intent created — confirm with your card
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => { void handlePay(); }}
                  disabled={isPaying}
                  className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isPaying ? 'Setting up payment…' : `Pay ${amountDisplay} with Stripe`}
                </button>
              )}
              <p className="text-xs text-gray-400 text-center">🔒 Secured by Stripe</p>
            </div>
            {field.helperText && <p className="mt-1 text-xs text-gray-500">{field.helperText}</p>}
            {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
          </div>
        );
      }

      case 'signature':
        return (
          <div className={fieldContainerClassName}>
            {labelBlock}
            <input
              id={answerKey}
              type="text"
              value={typeof answerValue === 'string' ? answerValue : ''}
              onChange={(event) => setAnswerValue(answerKey, event.target.value)}
              required={field.required}
              placeholder="Type your full name as digital signature"
              className={sharedInputClassName}
            />
            {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
          </div>
        );

      default: {
        const inputTypeMap: Record<string, React.HTMLInputTypeAttribute> = {
          text: 'text',
          email: 'email',
          tel: 'tel',
          url: 'url',
          number: 'number',
          date: 'date',
        };

        return (
          <div className={fieldContainerClassName}>
            {labelBlock}
            <input
              id={answerKey}
              type={inputTypeMap[field.type] || 'text'}
              value={typeof answerValue === 'string' || typeof answerValue === 'number' ? answerValue : ''}
              onChange={(event) => {
                if (field.type === 'number') {
                  const parsed = Number(event.target.value);
                  setAnswerValue(answerKey, Number.isNaN(parsed) ? '' : parsed);
                  return;
                }

                setAnswerValue(answerKey, event.target.value);
              }}
              required={field.required}
              placeholder={field.placeholder}
              className={sharedInputClassName}
            />
            {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
          </div>
        );
      }
    }
  };

  const isSubmitting = submitting || isSubmittingInternally;

  return (
    <section ref={formContainerRef} className="dynamic-form-surface h-full overflow-auto rounded-xl border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
        <p className="mt-1 text-sm text-gray-600">{template.description}</p>
        <p className="mt-2 text-xs uppercase tracking-wide text-gray-500">Theme: {template.design_settings.theme}</p>
      </div>

      <form onSubmit={handleSubmit} className={getLayoutClassName(template.design_settings.layout)}>
        {template.fields.map((field, index) => (
          <div key={`${template.id}_${field.label}_${index}`}>{renderField(field, index)}</div>
        ))}

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="dynamic-form-submit rounded-lg border px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Response'}
          </button>
        </div>

        {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
        {submitSuccess ? <p className="text-sm text-green-700">{submitSuccess}</p> : null}
      </form>
    </section>
  );
};
