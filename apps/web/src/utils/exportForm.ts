import { FormSchema } from '../../modules/Core/types';

export const exportToHTML = (schema: FormSchema): string => {
  const formHTML = generateFormHTML(schema);
  const css = generateCSS();
  const js = generateJS(schema.title);

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

            <!-- Form Body -->
            <form id="dynamicForm" class="form-body">
${formHTML}
                
                <!-- Submit Button -->
                <div class="submit-section">
                    <button type="submit" class="submit-button">
                        ${schema.settings.submitButtonText || 'Submit'}
                    </button>
                </div>
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

const generateFormHTML = (schema: FormSchema): string => {
  return schema.components.map(component => {
    const isRequired = component.validation?.some(v => v.type === 'required');
    const requiredAttr = isRequired ? 'required' : '';
    const requiredLabel = isRequired ? '<span class="required">*</span>' : '';
    // Generate a human-readable name from the label
    const fieldName = component.label 
      ? component.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') 
      : `field_${component.id}`;

    switch (component.type) {
      case 'heading':
        const level = component.properties?.level || 2;
        return `                <h${level} class="form-heading">${component.properties?.content || component.label}</h${level}>`;

      case 'paragraph':
        return `                <p class="form-paragraph">${component.properties?.content || 'Description text...'}</p>`;

      case 'divider':
        return `                <hr class="form-divider">`;

      case 'textfield':
      case 'email':
      case 'phone':
        return `                <div class="form-group">
                    <label class="form-label">${component.label}${requiredLabel}</label>
                    <input 
                        type="${component.type === 'email' ? 'email' : component.type === 'phone' ? 'tel' : 'text'}"
                        name="${fieldName}"
                        placeholder="${component.properties?.placeholder || ''}"
                        class="form-input"
                        ${requiredAttr}
                    >
                    ${component.properties?.helperText ? `<p class="helper-text">${component.properties.helperText}</p>` : ''}
                    <p class="error-message"></p>
                </div>`;

      case 'number':
        return `                <div class="form-group">
                    <label class="form-label">${component.label}${requiredLabel}</label>
                    <input 
                        type="number"
                        name="${fieldName}"
                        placeholder="${component.properties?.placeholder || '0'}"
                        min="${component.properties?.min || ''}"
                        max="${component.properties?.max || ''}"
                        step="${component.properties?.step || 1}"
                        class="form-input"
                        ${requiredAttr}
                    >
                    <p class="error-message"></p>
                </div>`;

      case 'textarea':
        return `                <div class="form-group">
                    <label class="form-label">${component.label}${requiredLabel}</label>
                    <textarea 
                        name="${fieldName}"
                        placeholder="${component.properties?.placeholder || ''}"
                        rows="${component.properties?.rows || 4}"
                        class="form-textarea"
                        ${requiredAttr}
                    ></textarea>
                    <p class="error-message"></p>
                </div>`;

      case 'select':
        const options = (component.properties?.options || []).map((opt: any) =>
          `<option value="${opt.value}">${opt.label}</option>`
        ).join('\n                        ');
        return `                <div class="form-group">
                    <label class="form-label">${component.label}${requiredLabel}</label>
                    <select name="${fieldName}" class="form-select" ${requiredAttr}>
                        <option value="">${component.properties?.placeholder || 'Select an option...'}</option>
                        ${options}
                    </select>
                    <p class="error-message"></p>
                </div>`;

      case 'checkbox':
        const checkboxes = (component.properties?.options || []).map((opt: any) =>
          `                        <label class="checkbox-label">
                            <input type="checkbox" name="${fieldName}" value="${opt.value}">
                            <span>${opt.label}</span>
                        </label>`
        ).join('\n');
        return `                <div class="form-group">
                    <label class="form-label">${component.label}${requiredLabel}</label>
                    <div class="checkbox-group">
${checkboxes}
                    </div>
                    <p class="error-message"></p>
                </div>`;

      case 'radio':
        const radios = (component.properties?.options || []).map((opt: any) =>
          `                        <label class="radio-label">
                            <input type="radio" name="${fieldName}" value="${opt.value}" ${requiredAttr}>
                            <span>${opt.label}</span>
                        </label>`
        ).join('\n');
        return `                <div class="form-group">
                    <label class="form-label">${component.label}${requiredLabel}</label>
                    <div class="radio-group">
${radios}
                    </div>
                    <p class="error-message"></p>
                </div>`;

      case 'date':
        return `                <div class="form-group">
                    <label class="form-label">${component.label}${requiredLabel}</label>
                    <input 
                        type="date"
                        name="${fieldName}"
                        class="form-input"
                        ${requiredAttr}
                    >
                    <p class="error-message"></p>
                </div>`;

      case 'file':
        return `                <div class="form-group">
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

      default:
        return '';
    }
  }).filter(Boolean).join('\n\n');
};

const generateCSS = (): string => {
  return `        * {
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
