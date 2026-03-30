import { ComponentDefinition, ComponentType, ComponentCategory } from '../modules/Core/types';

export const componentRegistry: ComponentDefinition[] = [
  // === BASIC FIELDS ===
  {
    type: 'textfield',
    category: 'basic',
    label: 'Text Field',
    description: 'Single line text input',
    icon: 'txt',
    defaultProps: {
      label: 'Text Field',
      properties: {
        placeholder: 'Enter text...',
        helperText: '',
      },
      validation: [],
    },
    allowedProps: ['label', 'properties.placeholder', 'properties.helperText', 'defaultValue', 'validation', 'styles'],
  },
  {
    type: 'email',
    category: 'basic',
    label: 'Email',
    description: 'Email address with validation',
    icon: 'mail',
    defaultProps: {
      label: 'Email Address',
      properties: {
        placeholder: 'you@example.com',
        helperText: '',
      },
      validation: [
        { id: '1', type: 'required', message: 'Email is required' },
        { id: '2', type: 'email', message: 'Please enter a valid email' },
      ],
    },
    allowedProps: ['label', 'properties.placeholder', 'properties.helperText', 'defaultValue', 'validation', 'styles'],
  },
  {
    type: 'number',
    category: 'basic',
    label: 'Number',
    description: 'Numeric input with min/max',
    icon: 'num',
    defaultProps: {
      label: 'Number',
      properties: {
        placeholder: '0',
        helperText: '',
        min: 0,
        max: 100,
        step: 1,
      },
      validation: [],
    },
    allowedProps: ['label', 'properties.placeholder', 'properties.helperText', 'defaultValue', 'properties.min', 'properties.max', 'properties.step', 'validation', 'styles'],
  },
  {
    type: 'textarea',
    category: 'basic',
    label: 'Text Area',
    description: 'Multi-line text input',
    icon: 'area',
    defaultProps: {
      label: 'Text Area',
      properties: {
        placeholder: 'Enter long text...',
        helperText: '',
        rows: 4,
      },
      validation: [],
    },
    allowedProps: ['label', 'properties.placeholder', 'properties.helperText', 'defaultValue', 'properties.rows', 'validation', 'styles'],
  },
  {
    type: 'phone',
    category: 'basic',
    label: 'Phone',
    description: 'Phone number input',
    icon: 'tel',
    defaultProps: {
      label: 'Phone Number',
      properties: {
        placeholder: '+1 (000) 000-0000',
        helperText: '',
      },
      validation: [{ id: '1', type: 'required' }],
    },
    allowedProps: ['label', 'properties.placeholder', 'properties.helperText', 'defaultValue', 'validation', 'styles'],
  },
  {
    type: 'password',
    category: 'basic',
    label: 'Password',
    description: 'Secure password input',
    icon: 'pwd',
    defaultProps: {
      label: 'Password',
      properties: {
        placeholder: '••••••••',
        helperText: '',
      },
      validation: [
        { id: '1', type: 'required', message: 'Password is required' },
        { id: '2', type: 'minLength', value: 8, message: 'Password must be at least 8 characters' },
      ],
    },
    allowedProps: ['label', 'properties.placeholder', 'properties.helperText', 'defaultValue', 'validation', 'styles'],
  },
  {
    type: 'url',
    category: 'basic',
    label: 'Website URL',
    description: 'URL input with validation',
    icon: 'url',
    defaultProps: {
      label: 'Website',
      properties: {
        placeholder: 'https://example.com',
        helperText: '',
      },
      validation: [{ id: '1', type: 'url', message: 'Please enter a valid URL' }],
    },
    allowedProps: ['label', 'properties.placeholder', 'properties.helperText', 'defaultValue', 'validation', 'styles'],
  },

  // === SELECTION & CHOICE FIELDS ===
  {
    type: 'select',
    category: 'basic',
    label: 'Dropdown',
    description: 'Single selection dropdown',
    icon: 'drop',
    defaultProps: {
      label: 'Select Option',
      properties: {
        placeholder: 'Select an option...',
        helperText: '',
        options: [
          { id: '1', label: 'Option 1', value: 'opt1' },
          { id: '2', label: 'Option 2', value: 'opt2' },
          { id: '3', label: 'Option 3', value: 'opt3' },
        ],
        searchable: false,
      },
      validation: [],
    },
    allowedProps: ['label', 'properties.placeholder', 'properties.helperText', 'defaultValue', 'properties.options', 'properties.searchable', 'validation', 'styles'],
  },
  {
    type: 'multiselect',
    category: 'basic',
    label: 'Multi-Select',
    description: 'Select multiple options from a list',
    icon: 'msel',
    defaultProps: {
      label: 'Choose Options',
      properties: {
        placeholder: 'Select options...',
        helperText: '',
        options: [
          { id: '1', label: 'Option 1', value: 'opt1' },
          { id: '2', label: 'Option 2', value: 'opt2' },
          { id: '3', label: 'Option 3', value: 'opt3' },
        ],
      },
      validation: [],
    },
    allowedProps: ['label', 'properties.placeholder', 'properties.helperText', 'defaultValue', 'properties.options', 'validation', 'styles'],
  },
  {
    type: 'checkbox',
    category: 'basic',
    label: 'Checkbox',
    description: 'Multiple selection checkboxes',
    icon: 'chk',
    defaultProps: {
      label: 'Checkbox Group',
      properties: {
        helperText: '',
        options: [{ id: '1', label: 'Option 1', value: 'opt1' }],
      },
      validation: [],
    },
    allowedProps: ['label', 'properties.helperText', 'defaultValue', 'properties.options', 'validation', 'styles'],
  },
  {
    type: 'radio',
    category: 'basic',
    label: 'Radio Group',
    description: 'Single selection radio buttons',
    icon: 'rad',
    defaultProps: {
      label: 'Choose one',
      properties: {
        helperText: '',
        options: [
          { id: '1', label: 'Yes', value: 'yes' },
          { id: '2', label: 'No', value: 'no' },
        ],
      },
      validation: [],
    },
    allowedProps: ['label', 'properties.helperText', 'defaultValue', 'properties.options', 'validation', 'styles'],
  },
  {
    type: 'toggle',
    category: 'basic',
    label: 'Toggle',
    description: 'On/Off boolean switch',
    icon: 'tog',
    defaultProps: {
      label: 'Enable Option',
      properties: {
        helperText: '',
      },
      validation: [],
    },
    allowedProps: ['label', 'properties.helperText', 'defaultValue', 'styles'],
  },
  {
    type: 'slider',
    category: 'basic',
    label: 'Slider',
    description: 'Range value with min/max',
    icon: 'sldr',
    defaultProps: {
      label: 'Range',
      properties: {
        min: 0,
        max: 100,
        step: 1,
        helperText: '',
      },
      validation: [],
    },
    allowedProps: ['label', 'properties.helperText', 'properties.min', 'properties.max', 'properties.step', 'defaultValue', 'styles'],
  },
  {
    type: 'date',
    category: 'basic',
    label: 'Date',
    description: 'Date picker',
    icon: 'date',
    defaultProps: {
      label: 'Date',
      properties: { dateFormat: 'YYYY-MM-DD' },
      validation: [],
    },
    allowedProps: ['label', 'properties.dateFormat', 'validation', 'styles'],
  },
  {
    type: 'datetime-local',
    category: 'basic',
    label: 'Date & Time',
    description: 'Date and time combined picker',
    icon: 'dtt',
    defaultProps: {
      label: 'Date & Time',
      properties: {},
      validation: [],
    },
    allowedProps: ['label', 'validation', 'styles'],
  },
  {
    type: 'time',
    category: 'basic',
    label: 'Time',
    description: 'Time picker (HH:MM)',
    icon: 'time',
    defaultProps: {
      label: 'Time',
      properties: {},
      validation: [],
    },
    allowedProps: ['label', 'validation', 'styles'],
  },
  {
    type: 'month',
    category: 'basic',
    label: 'Month',
    description: 'Month and year picker',
    icon: 'mon',
    defaultProps: {
      label: 'Month',
      properties: {},
      validation: [],
    },
    allowedProps: ['label', 'validation', 'styles'],
  },
  {
    type: 'week',
    category: 'basic',
    label: 'Week',
    description: 'Week of the year picker',
    icon: 'wk',
    defaultProps: {
      label: 'Week',
      properties: {},
      validation: [],
    },
    allowedProps: ['label', 'validation', 'styles'],
  },

  // === ADVANCED FIELDS ===
  {
    type: 'file',
    category: 'advanced',
    label: 'File Upload',
    description: 'Upload files with restrictions',
    icon: 'file',
    defaultProps: {
      label: 'Upload File',
      properties: {
        accept: '.pdf,.jpg,.png',
        maxFileSize: 5,
        multiple: false,
      },
      validation: [],
    },
    allowedProps: ['label', 'properties.accept', 'properties.maxFileSize', 'properties.multiple'],
  },
  {
    type: 'color',
    category: 'advanced',
    label: 'Color Picker',
    description: 'Color selection input',
    icon: 'clr',
    defaultProps: {
      label: 'Choose a Color',
      properties: {
        helperText: '',
      },
      validation: [],
    },
    allowedProps: ['label', 'properties.helperText', 'defaultValue', 'styles'],
  },
  {
    type: 'rating',
    category: 'advanced',
    label: 'Rating',
    description: 'Star rating (1–5 or custom)',
    icon: 'star',
    defaultProps: {
      label: 'Rating',
      properties: { maxRating: 5, icon: 'star' },
    },
    allowedProps: ['label', 'properties.maxRating', 'properties.icon'],
  },
  {
    type: 'signature',
    category: 'advanced',
    label: 'Signature',
    description: 'Draw or type a signature',
    icon: 'sig',
    defaultProps: {
      label: 'Signature',
    },
    allowedProps: ['label'],
  },
  {
    type: 'image-upload',
    category: 'advanced',
    label: 'Image Upload',
    description: 'Upload and preview images',
    icon: 'img',
    defaultProps: {
      label: 'Upload Image',
      properties: {
        accept: '.jpg,.jpeg,.png,.gif,.webp',
        multiple: false,
      },
      validation: [],
    },
    allowedProps: ['label', 'properties.accept', 'properties.multiple'],
  },

  // === CONTENT COMPONENTS ===
  {
    type: 'heading',
    category: 'content',
    label: 'Heading',
    description: 'Section heading text',
    icon: 'hd',
    defaultProps: {
      label: 'Heading',
      properties: { level: 2, content: 'Section Title' },
      styles: { fontSize: '2xl', fontWeight: 'bold', margin: 'medium' },
    },
    allowedProps: ['properties.content', 'properties.level', 'styles'],
  },
  {
    type: 'paragraph',
    category: 'content',
    label: 'Paragraph',
    description: 'Body text or description',
    icon: 'para',
    defaultProps: {
      label: 'Paragraph',
      properties: { content: 'Enter your description here...' },
      styles: { textAlign: 'left' },
    },
    allowedProps: ['properties.content', 'styles'],
  },
  {
    type: 'html',
    category: 'content',
    label: 'HTML Block',
    description: 'Embed raw HTML content',
    icon: 'html',
    defaultProps: {
      label: 'HTML Block',
      properties: { content: '<p>Enter <strong>HTML</strong> content here.</p>' },
    },
    allowedProps: ['properties.content'],
  },
  {
    type: 'markdown',
    category: 'content',
    label: 'Markdown',
    description: 'Formatted markdown text',
    icon: 'md',
    defaultProps: {
      label: 'Markdown',
      properties: { content: '## Title\n\nWrite **bold**, *italic*, and more.' },
    },
    allowedProps: ['properties.content'],
  },

  // === LAYOUT COMPONENTS ===
  {
    type: 'divider',
    category: 'layout',
    label: 'Divider',
    description: 'Horizontal line separator',
    icon: 'div',
    defaultProps: {
      label: 'Divider',
      styles: { margin: 'medium' },
    },
    allowedProps: ['styles'],
  },
  {
    type: 'container',
    category: 'layout',
    label: 'Container',
    description: 'Group components together',
    icon: 'box',
    defaultProps: {
      label: 'Container',
      styles: { backgroundColor: '#f9fafb', padding: 'medium', borderRadius: 'medium' },
    },
    allowedProps: ['label', 'styles'],
    canHaveChildren: true,
  },
  {
    type: 'columns',
    category: 'layout',
    label: 'Columns',
    description: 'Multi-column layout',
    icon: 'col',
    defaultProps: {
      label: 'Columns',
      properties: { columns: 2, gap: 'medium' },
    },
    allowedProps: ['properties.columns', 'properties.gap'],
    canHaveChildren: true,
    maxChildren: 4,
  },
  {
    type: 'page-break',
    category: 'layout',
    label: 'Page Break',
    description: 'Multi-step form separator',
    icon: 'pg',
    defaultProps: {
      label: 'Continue',
      properties: { content: 'Next Page' },
    },
    allowedProps: ['properties.content'],
  },
  {
    type: 'spacer',
    category: 'layout',
    label: 'Spacer',
    description: 'Blank vertical space between elements',
    icon: 'spc',
    defaultProps: {
      label: 'Spacer',
      properties: { size: 'medium' },
    },
    allowedProps: ['properties.size'],
  },
  // === PAYMENT FIELD ===
  {
    type: 'payment',
    category: 'advanced',
    label: 'Payment',
    description: 'Collect payment via Stripe before submission',
    icon: '💳',
    defaultProps: {
      label: 'Payment',
      properties: {
        amountCents: 1000,
        currency: 'usd',
        stripePublishableKey: '',
        helperText: 'Your payment is secured by Stripe.',
      },
      validation: [],
    },
    allowedProps: [
      'label',
      'properties.amountCents',
      'properties.currency',
      'properties.description',
      'properties.stripePublishableKey',
      'properties.helperText',
      'styles',
    ],
  },
];

export const getComponentDefinition = (type: ComponentType): ComponentDefinition | undefined =>
  componentRegistry.find((c) => c.type === type);

export const getComponentsByCategory = (category: ComponentCategory): ComponentDefinition[] =>
  componentRegistry.filter((c) => c.category === category);

export const categories: { id: ComponentCategory; label: string; description: string }[] = [
  { id: 'basic', label: 'Basic Fields', description: 'Essential form inputs' },
  { id: 'advanced', label: 'Advanced', description: 'Specialized inputs' },
  { id: 'layout', label: 'Layout', description: 'Structure and organization' },
  { id: 'content', label: 'Content', description: 'Text and media' },
];
