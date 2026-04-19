import { FormSchema, FormComponent } from '../../modules/Core/types';

// Helper to check if form has page-breaks (multi-step)
const hasPageBreaks = (components: FormComponent[]): boolean => {
  return components.some(c => c.type === 'page-break');
};

// Split components into pages based on page-break components
const splitIntoPages = (components: FormComponent[]): FormComponent[][] => {
  const pages: FormComponent[][] = [[]];
  let pageIndex = 0;

  components.forEach(component => {
    if (component.type === 'page-break') {
      pageIndex++;
      pages[pageIndex] = [];
    } else {
      pages[pageIndex].push(component);
    }
  });

  return pages.filter(page => page.length > 0);
};

export const exportToHTML = (schema: FormSchema): string => {
  const isMultiStep = hasPageBreaks(schema.components) || !!schema.settings.multiStep;
  const pages = isMultiStep ? splitIntoPages(schema.components) : [schema.components];
  
  const formHTML = isMultiStep
    ? generateMultiStepFormHTML(pages)
    : generateFormHTML(schema);
  const css = generateCSS(isMultiStep);
  const js = isMultiStep 
    ? generateMultiStepJS(schema.title, pages.length)
    : generateJS(schema.title);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${schema.title}</title>
    <style>
${css}
    </style>
</head>
<body>
    <div class="form-container">
        <div class="form-wrapper">
            <!-- Form Header -->
            <div class="form-header">
                <h1 class="form-title">${schema.title}</h1>
                ${schema.description ? `<p class="form-description">${schema.description}</p>` : ''}
            </div>

${isMultiStep ? `            <!-- Step Progress Indicator -->
            <div class="step-progress">
                <div class="step-indicators">
${pages.map((_, i) => `                    <div class="step-indicator${i === 0 ? ' active' : ''}" data-step="${i}">
                        <div class="step-circle">${i + 1}</div>
                        <span class="step-label">Step ${i + 1}</span>
                    </div>${i < pages.length - 1 ? '\n                    <div class="step-connector"></div>' : ''}`).join('\n')}
                </div>
                <div class="step-counter">Step <span id="currentStepNum">1</span> of ${pages.length}</div>
            </div>

` : ''}            <!-- Form Body -->
            <form id="dynamicForm" class="form-body">
${formHTML}
                
${isMultiStep ? `                <!-- Navigation Buttons -->
                <div class="navigation-buttons">
                    <button type="button" id="prevBtn" class="nav-button prev-button" style="display: none;">
                        ← Previous
                    </button>
                    <button type="button" id="nextBtn" class="nav-button next-button">
                        Next →
                    </button>
                    <button type="submit" id="submitBtn" class="submit-button" style="display: none;">
                        ${schema.settings.submitButtonText || 'Submit'}
                    </button>
                </div>` : `                <!-- Submit Button -->
                <div class="submit-section">
                    <button type="submit" class="submit-button">
                        ${schema.settings.submitButtonText || 'Submit'}
                    </button>
                </div>`}
            </form>

            <!-- Success Message (hidden by default) -->
            <div id="successMessage" class="success-message hidden">
                <div class="success-icon">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                </div>
                <h2>Success!</h2>
                <p>${schema.settings.successMessage || 'Thank you for your submission!'}</p>
            </div>
        </div>
    </div>

    <script>
${js}
    </script>
</body>
</html>`;
};

const generateMultiStepFormHTML = (pages: FormComponent[][]): string => {
  return pages.map((pageComponents, pageIndex) => {
    const pageHTML = pageComponents.map(component => {
      return generateComponentHTML(component);
    }).filter(Boolean).join('\n\n');

    return `                <!-- Step ${pageIndex + 1} -->
                <div class="form-step${pageIndex === 0 ? ' active' : ''}" data-step="${pageIndex}">
${pageHTML}
                </div>`;
  }).join('\n\n');
};

const generateComponentHTML = (component: FormComponent): string => {
  const isRequired = component.validation?.some(v => v.type === 'required');
  const requiredAttr = isRequired ? 'required' : '';
  const requiredLabel = isRequired ? '<span class="required">*</span>' : '';
  const fieldName = component.label 
    ? component.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') 
    : `field_${component.id}`;

  switch (component.type) {
    case 'heading':
      const level = component.properties?.level || 2;
      return `                    <h${level} class="form-heading">${component.properties?.content || component.label}</h${level}>`;

    case 'paragraph':
      return `                    <p class="form-paragraph">${component.properties?.content || 'Description text...'}</p>`;

    case 'divider':
      return `                    <hr class="form-divider">`;

    case 'textfield':
    case 'email':
    case 'phone':
    case 'url':
      const inputType = component.type === 'phone' ? 'tel' : component.type === 'url' ? 'url' : component.type === 'email' ? 'email' : 'text';
      return `                    <div class="form-group">
                        <label class="form-label">${component.label}${requiredLabel}</label>
                        <input 
                            type="${inputType}"
                            name="${fieldName}"
                            placeholder="${component.properties?.placeholder || ''}"
                            class="form-input"
                            ${requiredAttr}
                        >
                        ${component.properties?.helperText ? `<p class="helper-text">${component.properties.helperText}</p>` : ''}
                        <p class="error-message"></p>
                    </div>`;

    case 'number':
      return `                    <div class="form-group">
                        <label class="form-label">${component.label}${requiredLabel}</label>
                        <input 
                            type="number"
                            name="${fieldName}"
                            placeholder="${component.properties?.placeholder || ''}"
                            ${component.properties?.min !== undefined ? `min="${component.properties.min}"` : ''}
                            ${component.properties?.max !== undefined ? `max="${component.properties.max}"` : ''}
                            class="form-input"
                            ${requiredAttr}
                        >
                        ${component.properties?.helperText ? `<p class="helper-text">${component.properties.helperText}</p>` : ''}
                        <p class="error-message"></p>
                    </div>`;

    case 'password':
      return `                    <div class="form-group">
                        <label class="form-label">${component.label}${requiredLabel}</label>
                        <input 
                            type="password"
                            name="${fieldName}"
                            placeholder="${component.properties?.placeholder || ''}"
                            class="form-input"
                            ${requiredAttr}
                        >
                        ${component.properties?.helperText ? `<p class="helper-text">${component.properties.helperText}</p>` : ''}
                        <p class="error-message"></p>
                    </div>`;

    case 'textarea':
      return `                    <div class="form-group">
                        <label class="form-label">${component.label}${requiredLabel}</label>
                        <textarea 
                            name="${fieldName}"
                            placeholder="${component.properties?.placeholder || ''}"
                            rows="${component.properties?.rows || 4}"
                            class="form-textarea"
                            ${requiredAttr}
                        ></textarea>
                        ${component.properties?.helperText ? `<p class="helper-text">${component.properties.helperText}</p>` : ''}
                        <p class="error-message"></p>
                    </div>`;

    case 'select':
      const selectOptions = (component.properties?.options || [])
        .map((opt) =>
          `                            <option value="${opt.value}">${opt.label}</option>`
        ).join('\n');
      return `                    <div class="form-group">
                        <label class="form-label">${component.label}${requiredLabel}</label>
                        <select name="${fieldName}" class="form-select" ${requiredAttr}>
                            <option value="">${component.properties?.placeholder || 'Select an option...'}</option>
${selectOptions}
                        </select>
                        ${component.properties?.helperText ? `<p class="helper-text">${component.properties.helperText}</p>` : ''}
                        <p class="error-message"></p>
                    </div>`;

    case 'checkbox':
      return `                    <div class="form-group checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" name="${fieldName}" value="true" ${requiredAttr}>
                            <span>${component.label}</span>
                        </label>
                        ${component.properties?.helperText ? `<p class="helper-text">${component.properties.helperText}</p>` : ''}
                        <p class="error-message"></p>
                    </div>`;

    case 'radio':
      const radioOptions = (component.properties?.options || [])
        .map((opt) =>
          `                            <label class="radio-label">
                                <input type="radio" name="${fieldName}" value="${opt.value}" ${requiredAttr}>
                                <span>${opt.label}</span>
                            </label>`
        ).join('\n');
      return `                    <div class="form-group">
                        <label class="form-label">${component.label}${requiredLabel}</label>
                        <div class="radio-group">
${radioOptions}
                        </div>
                        <p class="error-message"></p>
                    </div>`;

    case 'date':
      return `                    <div class="form-group">
                        <label class="form-label">${component.label}${requiredLabel}</label>
                        <input 
                            type="date"
                            name="${fieldName}"
                            class="form-input"
                            ${requiredAttr}
                        >
                        ${component.properties?.helperText ? `<p class="helper-text">${component.properties.helperText}</p>` : ''}
                        <p class="error-message"></p>
                    </div>`;

    case 'time':
      return `                    <div class="form-group">
                        <label class="form-label">${component.label}${requiredLabel}</label>
                        <input 
                            type="time"
                            name="${fieldName}"
                            class="form-input"
                            ${requiredAttr}
                        >
                        ${component.properties?.helperText ? `<p class="helper-text">${component.properties.helperText}</p>` : ''}
                        <p class="error-message"></p>
                    </div>`;

    case 'file':
      return `                    <div class="form-group">
                        <label class="form-label">${component.label}${requiredLabel}</label>
                        <input 
                            type="file"
                            name="${fieldName}"
                            accept="${component.properties?.accept || ''}"
                            ${component.properties?.multiple ? 'multiple' : ''}
                            class="form-file"
                            ${requiredAttr}
                        >
                        <p class="error-message"></p>
                    </div>`;

    case 'rating':
      const maxRating = component.properties?.maxRating || 5;
      const ratingStars = Array.from({ length: maxRating }, (_, i) => 
        `                            <label class="rating-star">
                                <input type="radio" name="${fieldName}" value="${i + 1}" ${requiredAttr}>
                                <span>★</span>
                            </label>`
      ).join('\n');
      return `                    <div class="form-group">
                        <label class="form-label">${component.label}${requiredLabel}</label>
                        <div class="rating-group">
${ratingStars}
                        </div>
                        ${component.properties?.helperText ? `<p class="helper-text">${component.properties.helperText}</p>` : ''}
                        <p class="error-message"></p>
                    </div>`;

    case 'signature':
      return `                    <div class="form-group">
                        <label class="form-label">${component.label}${requiredLabel}</label>
                        <div class="signature-pad">
                            <canvas id="sig_${fieldName}" width="400" height="150"></canvas>
                            <input type="hidden" name="${fieldName}" id="sig_data_${fieldName}">
                            <button type="button" class="clear-sig" onclick="clearSignature('${fieldName}')">Clear</button>
                        </div>
                        ${component.properties?.helperText ? `<p class="helper-text">${component.properties.helperText}</p>` : ''}
                        <p class="error-message"></p>
                    </div>`;

    default:
      return '';
  }
};

// Original single-page form HTML generator
const generateFormHTML = (schema: FormSchema): string => {
  return schema.components
    .filter(c => c.type !== 'page-break') // Filter out page-breaks for single-page
    .map(component => generateComponentHTML(component))
    .filter(Boolean)
    .join('\n\n');
};

const generateCSS = (isMultiStep: boolean): string => {
  const baseCSS = `        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem;
            color: #333;
        }

        .form-container {
            max-width: 800px;
            margin: 0 auto;
        }

        .form-wrapper {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 3rem;
            animation: fadeIn 0.5s ease-in;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .form-header {
            margin-bottom: 2.5rem;
            padding-bottom: 2rem;
            border-bottom: 3px solid #f0f0f0;
        }

        .form-title {
            font-size: 2.5rem;
            font-weight: 800;
            color: #1a202c;
            margin-bottom: 0.75rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .form-description {
            font-size: 1.125rem;
            color: #718096;
            line-height: 1.7;
        }

        .form-body {
            margin-bottom: 2rem;
        }

        .form-group {
            margin-bottom: 1.75rem;
        }

        .form-label {
            display: block;
            font-size: 0.95rem;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 0.75rem;
        }

        .required {
            color: #e53e3e;
            margin-left: 0.25rem;
        }

        .form-input,
        .form-textarea,
        .form-select {
            width: 100%;
            padding: 1rem 1.25rem;
            font-size: 1rem;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            background: white;
            transition: all 0.3s ease;
            font-family: inherit;
        }

        .form-input:focus,
        .form-textarea:focus,
        .form-select:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
            transform: translateY(-2px);
        }

        .form-input.error,
        .form-textarea.error,
        .form-select.error {
            border-color: #fc8181;
        }

        .form-textarea {
            resize: vertical;
            min-height: 120px;
        }

        .form-file {
            width: 100%;
            padding: 1rem;
            border: 2px dashed #cbd5e0;
            border-radius: 12px;
            background: #f7fafc;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .form-file:hover {
            border-color: #667eea;
            background: #edf2f7;
        }

        .checkbox-group,
        .radio-group {
            display: flex;
            flex-direction: column;
            gap: 0.875rem;
        }

        .checkbox-label,
        .radio-label {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            cursor: pointer;
            padding: 0.75rem;
            border-radius: 8px;
            transition: background 0.2s ease;
        }

        .checkbox-label:hover,
        .radio-label:hover {
            background: #f7fafc;
        }

        .checkbox-label input[type="checkbox"],
        .radio-label input[type="radio"] {
            width: 1.25rem;
            height: 1.25rem;
            cursor: pointer;
            accent-color: #667eea;
        }

        .checkbox-label span,
        .radio-label span {
            font-size: 1rem;
            color: #2d3748;
        }

        .helper-text {
            margin-top: 0.5rem;
            font-size: 0.875rem;
            color: #718096;
        }

        .error-message {
            margin-top: 0.5rem;
            font-size: 0.875rem;
            color: #e53e3e;
            display: none;
        }

        .error-message.show {
            display: block;
        }

        .form-heading {
            font-weight: 700;
            color: #1a202c;
            margin: 1.5rem 0 1rem;
        }

        .form-paragraph {
            color: #4a5568;
            line-height: 1.7;
            margin-bottom: 1.5rem;
        }

        .form-divider {
            border: none;
            border-top: 2px solid #e2e8f0;
            margin: 2rem 0;
        }

        .submit-section {
            margin-top: 2.5rem;
            padding-top: 2rem;
            border-top: 3px solid #f0f0f0;
        }

        .submit-button {
            width: 100%;
            padding: 1.25rem 2rem;
            font-size: 1.125rem;
            font-weight: 700;
            color: white;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }

        .submit-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
        }

        .submit-button:active {
            transform: translateY(-1px);
        }

        .success-message {
            text-align: center;
            padding: 4rem 2rem;
            animation: fadeIn 0.5s ease-in;
        }

        .success-message.hidden {
            display: none;
        }

        .success-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 1.5rem;
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }

        .success-message h2 {
            font-size: 2rem;
            font-weight: 800;
            color: #1a202c;
            margin-bottom: 1rem;
        }

        .success-message p {
            font-size: 1.125rem;
            color: #718096;
        }

        @media (max-width: 768px) {
            body {
                padding: 1rem;
            }

            .form-wrapper {
                padding: 2rem 1.5rem;
            }

            .form-title {
                font-size: 2rem;
            }
        }`;

  // Add multi-step specific CSS if needed
  if (isMultiStep) {
    return baseCSS + `

        /* Multi-Step Form Styles */
        .step-progress {
            margin-bottom: 2rem;
        }

        .step-indicators {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
        }

        .step-indicator {
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
        }

        .step-circle {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #e2e8f0;
            color: #718096;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1rem;
            transition: all 0.3s ease;
        }

        .step-indicator.active .step-circle {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .step-indicator.completed .step-circle {
            background: #48bb78;
            color: white;
        }

        .step-indicator.completed .step-circle::before {
            content: '✓';
        }

        .step-label {
            margin-top: 0.5rem;
            font-size: 0.75rem;
            color: #718096;
            font-weight: 600;
        }

        .step-indicator.active .step-label {
            color: #667eea;
        }

        .step-connector {
            width: 60px;
            height: 3px;
            background: #e2e8f0;
            margin: 0 0.5rem;
            margin-bottom: 1.5rem;
            border-radius: 2px;
            transition: background 0.3s ease;
        }

        .step-connector.completed {
            background: #48bb78;
        }

        .step-counter {
            text-align: center;
            font-size: 0.875rem;
            color: #718096;
        }

        .form-step {
            display: none;
            animation: fadeIn 0.3s ease-in;
        }

        .form-step.active {
            display: block;
        }

        .navigation-buttons {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 3px solid #f0f0f0;
        }

        .nav-button {
            flex: 1;
            padding: 1rem 2rem;
            font-size: 1rem;
            font-weight: 600;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .prev-button {
            background: #e2e8f0;
            color: #4a5568;
        }

        .prev-button:hover {
            background: #cbd5e0;
        }

        .next-button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }

        .next-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
        }

        @media (max-width: 768px) {
            .step-connector {
                width: 30px;
            }

            .step-circle {
                width: 32px;
                height: 32px;
                font-size: 0.875rem;
            }

            .step-label {
                font-size: 0.625rem;
            }
        }`;
  }

  return baseCSS;
};

const generateJS = (formTitle: string): string => {
  return `        const form = document.getElementById('dynamicForm');
        const successMessage = document.getElementById('successMessage');

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Clear previous errors
            document.querySelectorAll('.error-message').forEach(el => {
                el.classList.remove('show');
                el.textContent = '';
            });
            document.querySelectorAll('.error').forEach(el => {
                el.classList.remove('error');
            });

            let isValid = true;

            // Validate required fields
            const requiredInputs = form.querySelectorAll('[required]');
            requiredInputs.forEach(input => {
                if (!input.value.trim() && input.type !== 'checkbox' && input.type !== 'radio') {
                    showError(input, 'This field is required');
                    isValid = false;
                }
            });

            // Validate email
            const emailInputs = form.querySelectorAll('input[type="email"]');
            emailInputs.forEach(input => {
                if (input.value && !isValidEmail(input.value)) {
                    showError(input, 'Please enter a valid email address');
                    isValid = false;
                }
            });

            // Validate radio groups (at least one selected if required)
            const radioGroups = {};
            form.querySelectorAll('input[type="radio"][required]').forEach(radio => {
                if (!radioGroups[radio.name]) {
                    radioGroups[radio.name] = [];
                }
                radioGroups[radio.name].push(radio);
            });

            Object.values(radioGroups).forEach(radios => {
                const checked = radios.some(r => r.checked);
                if (!checked) {
                    showError(radios[0], 'Please select an option');
                    isValid = false;
                }
            });

            if (isValid) {
                // Get form data
                const formData = new FormData(form);
                const data = {};
                for (let [key, value] of formData.entries()) {
                    if (data[key]) {
                        if (Array.isArray(data[key])) {
                            data[key].push(value);
                        } else {
                            data[key] = [data[key], value];
                        }
                    } else {
                        data[key] = value;
                    }
                }

                // Generate CSV
                const headers = Object.keys(data);
                const values = Object.values(data).map(val => {
                    const stringVal = Array.isArray(val) ? val.join('; ') : String(val);
                    return '"' + stringVal.replace(/"/g, '""') + '"';
                });

                const csvContent = "data:text/csv;charset=utf-8," 
                    + headers.join(",") + "\\n" 
                    + values.join(",");

                // Trigger Download
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "${formTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_submission.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Show success message
                form.style.display = 'none';
                successMessage.classList.remove('hidden');

                // You can send data to server here
                // fetch('/api/submit', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify(data)
                // });
            }
        });

        function showError(input, message) {
            input.classList.add('error');
            const errorEl = input.parentElement.querySelector('.error-message');
            if (errorEl) {
                errorEl.textContent = message;
                errorEl.classList.add('show');
            }
        }

        function isValidEmail(email) {
            return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
        }`;
};

const generateMultiStepJS = (formTitle: string, totalSteps: number): string => {
  return `        const form = document.getElementById('dynamicForm');
        const successMessage = document.getElementById('successMessage');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        const steps = document.querySelectorAll('.form-step');
        const stepIndicators = document.querySelectorAll('.step-indicator');
        const stepConnectors = document.querySelectorAll('.step-connector');
        const currentStepNum = document.getElementById('currentStepNum');
        
        let currentStep = 0;
        const totalSteps = ${totalSteps};

        // Initialize
        updateStepDisplay();

        // Previous button
        prevBtn.addEventListener('click', function() {
            if (currentStep > 0) {
                currentStep--;
                updateStepDisplay();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        // Next button
        nextBtn.addEventListener('click', function() {
            if (validateCurrentStep()) {
                if (currentStep < totalSteps - 1) {
                    currentStep++;
                    updateStepDisplay();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        });

        // Form submit
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!validateCurrentStep()) {
                return;
            }

            // Get form data
            const formData = new FormData(form);
            const data = {};
            for (let [key, value] of formData.entries()) {
                if (data[key]) {
                    if (Array.isArray(data[key])) {
                        data[key].push(value);
                    } else {
                        data[key] = [data[key], value];
                    }
                } else {
                    data[key] = value;
                }
            }

            // Generate CSV
            const headers = Object.keys(data);
            const values = Object.values(data).map(val => {
                const stringVal = Array.isArray(val) ? val.join('; ') : String(val);
                return '"' + stringVal.replace(/"/g, '""') + '"';
            });

            const csvContent = "data:text/csv;charset=utf-8," 
                + headers.join(",") + "\\n" 
                + values.join(",");

            // Trigger Download
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "${formTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_submission.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Show success message
            form.style.display = 'none';
            document.querySelector('.step-progress').style.display = 'none';
            successMessage.classList.remove('hidden');
        });

        function updateStepDisplay() {
            // Update step visibility
            steps.forEach((step, index) => {
                step.classList.toggle('active', index === currentStep);
            });

            // Update step indicators
            stepIndicators.forEach((indicator, index) => {
                indicator.classList.remove('active', 'completed');
                if (index < currentStep) {
                    indicator.classList.add('completed');
                } else if (index === currentStep) {
                    indicator.classList.add('active');
                }
            });

            // Update connectors
            stepConnectors.forEach((connector, index) => {
                connector.classList.toggle('completed', index < currentStep);
            });

            // Update step counter
            currentStepNum.textContent = currentStep + 1;

            // Update buttons
            prevBtn.style.display = currentStep === 0 ? 'none' : 'block';
            nextBtn.style.display = currentStep === totalSteps - 1 ? 'none' : 'block';
            submitBtn.style.display = currentStep === totalSteps - 1 ? 'block' : 'none';
        }

        function validateCurrentStep() {
            clearErrors();
            let isValid = true;
            const currentStepEl = steps[currentStep];

            // Validate required fields in current step
            const requiredInputs = currentStepEl.querySelectorAll('[required]');
            requiredInputs.forEach(input => {
                if (!input.value.trim() && input.type !== 'checkbox' && input.type !== 'radio') {
                    showError(input, 'This field is required');
                    isValid = false;
                }
            });

            // Validate email
            const emailInputs = currentStepEl.querySelectorAll('input[type="email"]');
            emailInputs.forEach(input => {
                if (input.value && !isValidEmail(input.value)) {
                    showError(input, 'Please enter a valid email address');
                    isValid = false;
                }
            });

            // Validate radio groups
            const radioGroups = {};
            currentStepEl.querySelectorAll('input[type="radio"][required]').forEach(radio => {
                if (!radioGroups[radio.name]) {
                    radioGroups[radio.name] = [];
                }
                radioGroups[radio.name].push(radio);
            });

            Object.values(radioGroups).forEach(radios => {
                const checked = radios.some(r => r.checked);
                if (!checked) {
                    showError(radios[0], 'Please select an option');
                    isValid = false;
                }
            });

            return isValid;
        }

        function clearErrors() {
            document.querySelectorAll('.error-message').forEach(el => {
                el.classList.remove('show');
                el.textContent = '';
            });
            document.querySelectorAll('.error').forEach(el => {
                el.classList.remove('error');
            });
        }

        function showError(input, message) {
            input.classList.add('error');
            const errorEl = input.parentElement.querySelector('.error-message');
            if (errorEl) {
                errorEl.textContent = message;
                errorEl.classList.add('show');
            }
        }

        function isValidEmail(email) {
            return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
        }`;
};

export const downloadHTML = (schema: FormSchema) => {
  const html = exportToHTML(schema);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${schema.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_form.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
