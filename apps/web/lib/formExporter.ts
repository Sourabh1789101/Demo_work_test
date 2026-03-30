// src/lib/formExporter.ts

// Define a simplified interface for the component data coming from your store
export interface FormComponentInstance {
  id: string;
  type: string;
  label?: string;
  properties?: Record<string, any>;
}

/**
 * Generates the HTML string for a single form component
 */
const renderComponentHTML = (component: FormComponentInstance): string => {
  const { type, label, id, properties } = component;
  const placeholder = properties?.placeholder || '';
  const helperText = properties?.helperText || '';
  const required = properties?.required ? 'required' : '';
  const name = label ? label.toLowerCase().replace(/\s+/g, '_') : `field_${id}`;

  let inputHTML = '';

  switch (type) {
    case 'textfield':
    case 'email':
    case 'phone':
    case 'number':
    case 'date':
    case 'file':
      const inputType = type === 'textfield' ? 'text' : type;
      inputHTML = `<input type="${inputType}" name="${name}" id="${id}" placeholder="${placeholder}" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" ${required}>`;
      break;

    case 'textarea':
      inputHTML = `<textarea name="${name}" id="${id}" rows="${properties?.rows || 4}" placeholder="${placeholder}" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" ${required}></textarea>`;
      break;

    case 'select':
      const options = properties?.options || [];
      const optionsHTML = options.map((opt: any) => `<option value="${opt.value}">${opt.label}</option>`).join('');
      inputHTML = `
        <select name="${name}" id="${id}" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" ${required}>
          <option value="" disabled selected>${placeholder}</option>
          ${optionsHTML}
        </select>`;
      break;

    case 'checkbox':
      // For checkboxes, we might have multiple options
      const cbOptions = properties?.options || [];
      inputHTML = cbOptions.map((opt: any) => `
        <div class="flex items-center mb-2">
          <input type="checkbox" name="${name}" value="${opt.value}" id="${id}_${opt.value}" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
          <label for="${id}_${opt.value}" class="ml-2 block text-sm text-gray-900">${opt.label}</label>
        </div>
      `).join('');
      break;

    case 'radio':
      const radioOptions = properties?.options || [];
      inputHTML = radioOptions.map((opt: any) => `
        <div class="flex items-center mb-2">
          <input type="radio" name="${name}" value="${opt.value}" id="${id}_${opt.value}" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300">
          <label for="${id}_${opt.value}" class="ml-2 block text-sm text-gray-900">${opt.label}</label>
        </div>
      `).join('');
      break;
      
    case 'heading':
      const Level = `h${properties?.level || 2}`;
      return `<${Level} class="text-2xl font-bold text-gray-900 mb-4">${properties?.content || label}</${Level}>`;
      
    case 'paragraph':
      return `<p class="text-gray-600 mb-4">${properties?.content || label}</p>`;

    default:
      inputHTML = `<div class="text-red-500">Unknown component type: ${type}</div>`;
  }

  // Don't wrap layout items like headings in the standard field wrapper
  if (['heading', 'paragraph', 'divider'].includes(type)) {
    return inputHTML;
  }

  return `
    <div class="mb-6">
      <label for="${id}" class="block text-sm font-medium text-gray-700 mb-1">${label}</label>
      ${inputHTML}
      ${helperText ? `<p class="mt-1 text-sm text-gray-500">${helperText}</p>` : ''}
    </div>
  `;
};

/**
 * Generates the full HTML document string with the embedded CSV export script
 */
export const exportFormToHTML = (formTitle: string, components: FormComponentInstance[]): string => {
  const formFieldsHTML = components.map(renderComponentHTML).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${formTitle}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <div class="px-6 py-8 border-b border-gray-200">
            <h1 class="text-3xl font-bold text-gray-900 text-center">${formTitle}</h1>
        </div>
        
        <form id="kim-ai-exported-form" class="px-8 py-8">
            ${formFieldsHTML}
            
            <div class="mt-8 pt-6 border-t border-gray-200">
                <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                    Submit & Download CSV
                </button>
            </div>
        </form>
    </div>

    <script>
        document.getElementById('kim-ai-exported-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const form = e.target;
            const formData = new FormData(form);
            const data = {};
            
            // Collect data
            for (let [key, value] of formData.entries()) {
                // Handle multiple checkboxes with same name
                if (data[key]) {
                    if (!Array.isArray(data[key])) {
                        data[key] = [data[key]];
                    }
                    data[key].push(value);
                } else {
                    data[key] = value;
                }
            }

            // Generate CSV
            // 1. Headers
            const headers = Object.keys(data);
            
            // 2. Values (handling commas and quotes in data)
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
            
            alert('Form submitted! Your data has been downloaded as a CSV file.');
            form.reset();
        });
    </script>
</body>
</html>`;
};
