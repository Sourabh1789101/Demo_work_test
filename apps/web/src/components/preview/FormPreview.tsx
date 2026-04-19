import React, { useState, useMemo } from 'react';
import { useBuilderStore } from '../../../modules/store/builderStore';
import { FormComponent } from '../../../modules/Core/types';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

export const FormPreview: React.FC = () => {
  const { schema } = useBuilderStore();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Split components into pages based on page-break components
  const pages = useMemo(() => {
    const result: FormComponent[][] = [[]];
    let pageIndex = 0;

    schema.components.forEach(component => {
      if (component.type === 'page-break') {
        pageIndex++;
        result[pageIndex] = [];
      } else {
        result[pageIndex].push(component);
      }
    });

    // Filter out empty pages
    return result.filter(page => page.length > 0);
  }, [schema.components]);

  // Check if form is multi-step (has page-breaks or multiStep setting)
  const isMultiStep = pages.length > 1 || schema.settings.multiStep;
  const totalSteps = pages.length;
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  const handleChange = (componentId: string, value: any) => {
    setFormData(prev => ({ ...prev, [componentId]: value }));
    // Clear error when user starts typing
    if (errors[componentId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[componentId];
        return newErrors;
      });
    }
  };

  // Validate only current step's components
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    const currentComponents = isMultiStep ? pages[currentStep] : schema.components;
    
    currentComponents.forEach(component => {
      const value = formData[component.id];
      const isRequired = component.validation?.some(v => v.type === 'required');
      
      if (isRequired && (!value || value === '' || (Array.isArray(value) && value.length === 0))) {
        newErrors[component.id] = `${component.label} is required`;
      }
      
      // Email validation
      if (component.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[component.id] = 'Please enter a valid email address';
        }
      }
      
      // Phone validation
      if (component.type === 'phone' && value) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(value)) {
          newErrors[component.id] = 'Please enter a valid phone number';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    schema.components.forEach(component => {
      if (component.type === 'page-break') return; // Skip page breaks
      
      const value = formData[component.id];
      const isRequired = component.validation?.some(v => v.type === 'required');
      
      if (isRequired && (!value || value === '' || (Array.isArray(value) && value.length === 0))) {
        newErrors[component.id] = `${component.label} is required`;
      }
      
      // Email validation
      if (component.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[component.id] = 'Please enter a valid email address';
        }
      }
      
      // Phone validation
      if (component.type === 'phone' && value) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(value)) {
          newErrors[component.id] = 'Please enter a valid phone number';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
      // Scroll to top of form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Form submitted:', formData);
      setSubmitted(true);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setFormData({});
      }, 3000);
    }
  };

  const renderComponent = (component: FormComponent) => {
    const value = formData[component.id] || '';
    const error = errors[component.id];
    const isRequired = component.validation?.some(v => v.type === 'required');

    const inputClasses = `w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${
      error 
        ? 'border-red-400 focus:border-red-500 focus:ring-red-200' 
        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
    } bg-white`;

    const labelClasses = 'block text-sm font-semibold text-gray-700 mb-2';

    switch (component.type) {
      case 'heading':
        const Tag = `h${component.properties?.level || 2}` as keyof JSX.IntrinsicElements;
        return (
          <Tag className="font-bold text-gray-900 text-2xl mb-4">
            {component.properties?.content || component.label}
          </Tag>
        );

      case 'paragraph':
        return (
          <p className="text-gray-600 mb-4 leading-relaxed">
            {component.properties?.content || 'Description text...'}
          </p>
        );

      case 'divider':
        return <hr className="border-gray-300 my-6" />;

      case 'textfield':
      case 'email':
      case 'phone':
        return (
          <div className="mb-5">
            <label className={labelClasses}>
              {component.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={component.type === 'email' ? 'email' : component.type === 'phone' ? 'tel' : 'text'}
              value={value}
              onChange={(e) => handleChange(component.id, e.target.value)}
              placeholder={component.properties?.placeholder || ''}
              className={inputClasses}
            />
            {component.properties?.helperText && !error && (
              <p className="mt-2 text-sm text-gray-500">{component.properties.helperText}</p>
            )}
            {error && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                {error}
              </p>
            )}
          </div>
        );

      case 'number':
        return (
          <div className="mb-5">
            <label className={labelClasses}>
              {component.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleChange(component.id, e.target.value)}
              placeholder={component.properties?.placeholder || '0'}
              min={component.properties?.min}
              max={component.properties?.max}
              step={component.properties?.step || 1}
              className={inputClasses}
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div className="mb-5">
            <label className={labelClasses}>
              {component.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleChange(component.id, e.target.value)}
              placeholder={component.properties?.placeholder || ''}
              rows={component.properties?.rows || 4}
              className={`${inputClasses} resize-none`}
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'select':
        return (
          <div className="mb-5">
            <label className={labelClasses}>
              {component.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              aria-label={component.label}
              value={value}
              onChange={(e) => handleChange(component.id, e.target.value)}
              className={inputClasses}
            >
              <option value="">{component.properties?.placeholder || 'Select an option...'}</option>
              {(component.properties?.options || []).map((opt: any) => (
                <option key={opt.id || opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div className="mb-5">
            <label className={labelClasses}>
              {component.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-3">
              {(component.properties?.options || []).map((opt: any) => (
                <label key={opt.id || opt.value} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={(value || []).includes(opt.value)}
                    onChange={(e) => {
                      const newValue = e.target.checked
                        ? [...(value || []), opt.value]
                        : (value || []).filter((v: string) => v !== opt.value);
                      handleChange(component.id, newValue);
                    }}
                    className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-200 cursor-pointer"
                  />
                  <span className="text-gray-700 group-hover:text-gray-900">{opt.label}</span>
                </label>
              ))}
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'radio':
        return (
          <div className="mb-5">
            <label className={labelClasses}>
              {component.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-3">
              {(component.properties?.options || []).map((opt: any) => (
                <label key={opt.id || opt.value} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name={component.id}
                    checked={value === opt.value}
                    onChange={() => handleChange(component.id, opt.value)}
                    className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-2 focus:ring-blue-200 cursor-pointer"
                  />
                  <span className="text-gray-700 group-hover:text-gray-900">{opt.label}</span>
                </label>
              ))}
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'date':
      case 'datetime-local':
      case 'time':
      case 'month':
      case 'week':
        return (
          <div className="mb-5">
            <label className={labelClasses}>
              {component.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={component.type}
              aria-label={component.label}
              value={value}
              onChange={(e) => handleChange(component.id, e.target.value)}
              className={inputClasses}
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'file':
        return (
          <div className="mb-5">
            <label className={labelClasses}>
              {component.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="file"
              aria-label={component.label}
              onChange={(e) => handleChange(component.id, e.target.files)}
              accept={component.properties?.accept}
              multiple={component.properties?.multiple}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer"
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'password':
      case 'url':
        return (
          <div className="mb-5">
            <label className={labelClasses}>
              {component.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={component.type === 'password' ? 'password' : 'url'}
              value={value}
              onChange={(e) => handleChange(component.id, e.target.value)}
              placeholder={component.properties?.placeholder || ''}
              className={inputClasses}
            />
            {component.properties?.helperText && !error && (
              <p className="mt-2 text-sm text-gray-500">{component.properties.helperText}</p>
            )}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'color':
        return (
          <div className="mb-5">
            <label className={labelClasses}>
              {component.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                aria-label={component.label}
                value={value || '#3b82f6'}
                onChange={(e) => handleChange(component.id, e.target.value)}
                className="w-14 h-10 rounded-lg border-2 border-gray-200 cursor-pointer p-0.5"
              />
              <span className="text-sm text-gray-500 font-mono">
                {value || '#3b82f6'}
              </span>
            </div>
            {component.properties?.helperText && (
              <p className="mt-2 text-sm text-gray-500">{component.properties.helperText}</p>
            )}
          </div>
        );

      case 'toggle': {
        const isToggled: boolean = !!formData[component.id];
        return (
          <div className="mb-5">
            <label className={`${labelClasses} flex items-center justify-between cursor-pointer`}>
              <span>
                {component.label}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isToggled ? "true" : "false"}
                onClick={() => handleChange(component.id, !isToggled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${
                  isToggled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    isToggled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
            {component.properties?.helperText && (
              <p className="mt-1 text-sm text-gray-500">{component.properties.helperText}</p>
            )}
          </div>
        );
      }

      case 'slider':
        return (
          <div className="mb-5">
            <label className={labelClasses}>
              {component.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                aria-label={component.label}
                min={component.properties?.min ?? 0}
                max={component.properties?.max ?? 100}
                step={component.properties?.step ?? 1}
                value={value !== '' ? value : (component.properties?.min ?? 0)}
                onChange={(e) => handleChange(component.id, Number(e.target.value))}
                className="flex-1 accent-blue-600"
              />
              <span className="text-sm font-semibold text-gray-700 w-10 text-right">
                {value !== '' ? value : (component.properties?.min ?? 0)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{component.properties?.min ?? 0}</span>
              <span>{component.properties?.max ?? 100}</span>
            </div>
            {component.properties?.helperText && (
              <p className="mt-1 text-sm text-gray-500">{component.properties.helperText}</p>
            )}
          </div>
        );

      case 'rating': {
        const max = component.properties?.maxRating || 5;
        const current = value || 0;
        return (
          <div className="mb-5">
            <label className={labelClasses}>
              {component.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex gap-1">
              {Array.from({ length: max }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleChange(component.id, i + 1)}
                  className={`text-2xl transition-colors ${
                    i < current ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
        );
      }

      case 'multiselect':
        return (
          <div className="mb-5">
            <label className={labelClasses}>
              {component.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="border-2 border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden">
              {(component.properties?.options || []).map((opt: any) => {
                const selected = (value || []).includes(opt.value);
                return (
                  <label
                    key={opt.id || opt.value}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      selected ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...(value || []), opt.value]
                          : (value || []).filter((v: string) => v !== opt.value);
                        handleChange(component.id, next);
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-400"
                    />
                    <span className={`text-sm ${selected ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                      {opt.label}
                    </span>
                  </label>
                );
              })}
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'image-upload': {
        const hasFile = !!formData[component.id];
        const fileInputId = `img-${component.id}`;
        return (
          <div className="mb-5">
            <label className={labelClasses}>
              {component.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              {hasFile ? (
                <div className="space-y-2">
                  <p className="text-sm text-green-600 font-medium">✓ Image selected</p>
                  <button
                    type="button"
                    onClick={() => handleChange(component.id, null)}
                    className="text-xs text-red-500 hover:text-red-700 underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    id={fileInputId}
                    aria-label={component.label}
                    accept={component.properties?.accept || '.jpg,.jpeg,.png,.gif,.webp'}
                    multiple={component.properties?.multiple}
                    onChange={(e) => handleChange(component.id, e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                  <label htmlFor={fileInputId} className="cursor-pointer">
                    <div className="text-3xl mb-2">🖼️</div>
                    <p className="text-sm text-gray-500">Click to upload image</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {component.properties?.accept || '.jpg, .png, .gif, .webp'}
                    </p>
                  </label>
                </>
              )}
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
        );
      }

      case 'spacer': {
        const SPACER_H: Record<string, string> = {
          small: 'h-8', medium: 'h-16', large: 'h-24', xl: 'h-32',
        };
        const spacerCls = SPACER_H[component.properties?.size ?? 'medium'] ?? 'h-16';
        return <div aria-hidden="true" className={spacerCls} />;
      }

      case 'html':
        return (
          // eslint-disable-next-line react/no-danger
          <div
            className="mb-4 prose max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: component.properties?.content || '' }}
          />
        );

      case 'markdown': {
        const mdContent = (component.properties?.content || '') as string;
        const rendered = mdContent
          .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-3 mb-1">$1</h3>')
          .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
          .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>')
          .replace(/\n/g, '<br/>');
        return (
          // eslint-disable-next-line react/no-danger
          <div
            className="mb-4 text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: rendered }}
          />
        );
      }

      default:
        return null;
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-white rounded-2xl shadow-lg p-12 max-w-md animate-fade-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Success!</h2>
          <p className="text-gray-600 mb-6">
            {schema.settings.successMessage || 'Thank you for your submission!'}
          </p>
          <div className="text-sm text-gray-500">Redirecting in a moment...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
      {/* Form Header */}
      <div className="mb-8 pb-6 border-b-2 border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{schema.title}</h1>
        {schema.description && (
          <p className="text-gray-600 text-lg leading-relaxed">{schema.description}</p>
        )}
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="space-y-1">
        {/* Step Progress Indicator for Multi-Step Forms */}
        {isMultiStep && totalSteps > 1 && (
          <div className="mb-8">
            {/* Progress Bar */}
            <div className="flex items-center justify-between mb-4">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <React.Fragment key={index}>
                  {/* Step Circle */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                        index < currentStep
                          ? 'bg-green-500 text-white'
                          : index === currentStep
                          ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {index < currentStep ? (
                        <Check size={18} />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className={`mt-2 text-xs font-medium ${
                      index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      Step {index + 1}
                    </span>
                  </div>
                  
                  {/* Connector Line */}
                  {index < totalSteps - 1 && (
                    <div className="flex-1 mx-2">
                      <div
                        className={`h-1 rounded-full transition-all duration-300 ${
                          index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            
            {/* Step Counter Text */}
            <div className="text-center text-sm text-gray-500">
              Step {currentStep + 1} of {totalSteps}
            </div>
          </div>
        )}

        {/* Render Current Page Components (multi-step) or All Components (single-page) */}
        {isMultiStep ? (
          pages[currentStep]?.map(component => (
            <div key={component.id}>
              {renderComponent(component)}
            </div>
          ))
        ) : (
          schema.components.map(component => (
            <div key={component.id}>
              {renderComponent(component)}
            </div>
          ))
        )}

        {/* Navigation Buttons */}
        {schema.components.length > 0 && (
          <div className="pt-6 mt-8 border-t-2 border-gray-100">
            {isMultiStep ? (
              <div className="flex gap-4">
                {/* Previous Button */}
                {!isFirstStep && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-8 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-300"
                  >
                    <ChevronLeft size={20} />
                    Previous
                  </button>
                )}
                
                {/* Next / Submit Button */}
                {isLastStep ? (
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-green-300"
                  >
                    {schema.settings.submitButtonText || 'Submit'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
                  >
                    Next
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>
            ) : (
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                {schema.settings.submitButtonText || 'Submit'}
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
};
