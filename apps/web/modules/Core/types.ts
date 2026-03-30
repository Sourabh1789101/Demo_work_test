// ==========================================
// MODULE 3: CORE TYPE DEFINITIONS
// Strict TypeScript for the entire form builder ecosystem
// ==========================================

import { ReactNode } from 'react';

// ==========================================
// PRIMITIVE TYPES
// ==========================================

export type UUID = string;
export type TimestampISO = string;
export type HexColor = string;
export type Email = string;
export type URLString = string;

export type Viewport = 'desktop' | 'tablet' | 'mobile';
export type BuilderMode = 'edit' | 'preview' | 'code' | 'json';
export type LayoutType = 'vertical' | 'horizontal' | 'grid' | 'columns';
export type WidthOption = 'full' | 'half' | 'third' | 'quarter' | 'auto';

export type ValidationType = 
  | 'required' 
  | 'email' 
  | 'url' 
  | 'minLength' 
  | 'maxLength' 
  | 'min' 
  | 'max' 
  | 'pattern' 
  | 'integer'
  | 'float'
  | 'alphanumeric'
  | 'custom'
  | 'match'; // Cross-field matching

export type ComponentCategory = 'basic' | 'advanced' | 'layout' | 'content' | 'data';

// ==========================================
// COMPONENT TYPE ENUMERATION
// ==========================================

export type ComponentType = 
  // Basic Inputs
  | 'textfield' 
  | 'email' 
  | 'number' 
  | 'password' 
  | 'textarea' 
  | 'phone'
  | 'url'
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'month'
  | 'week'
  | 'color'
  
  // Selection
  | 'select' 
  | 'multiselect'
  | 'checkbox' 
  | 'radio' 
  | 'toggle'
  | 'rating'
  | 'slider'
  
  // File & Media
  | 'file'
  | 'image-upload'
  | 'signature'
  | 'payment'
  
  // Layout
  | 'heading'
  | 'paragraph'
  | 'divider'
  | 'spacer'
  | 'container'
  | 'columns'
  | 'tabs'
  | 'page-break'
  | 'step'
  
  // Data Display
  | 'calculated'
  | 'html'
  | 'markdown';

// ==========================================
// STYLING & THEMING
// ==========================================

export interface SpacingConfig {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export interface StyleConfig {
  // Layout
  width?: WidthOption;
  height?: 'auto' | `${number}px`;
  display?: 'block' | 'inline-block' | 'flex' | 'grid';
  
  // Spacing (in pixels or Tailwind spacing units)
  margin?: SpacingConfig | 'none' | 'small' | 'medium' | 'large';
  padding?: SpacingConfig | 'none' | 'small' | 'medium' | 'large';
  
  // Appearance
  backgroundColor?: HexColor;
  textColor?: HexColor;
  borderColor?: HexColor;
  borderWidth?: number;
  borderRadius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  
  // Typography
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  fontWeight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: 'tight' | 'normal' | 'relaxed' | 'loose';
  
  // Effects
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  opacity?: number; // 0-1
  hidden?: boolean;
  
  // Responsive (mobile overrides)
  mobile?: Partial<Omit<StyleConfig, 'mobile'>>;
  tablet?: Partial<Omit<StyleConfig, 'tablet'>>;
}

// ==========================================
// VALIDATION SYSTEM
// ==========================================

export interface ValidationRule {
  id: UUID;
  type: ValidationType;
  value?: any; // Threshold value (min length, max number, etc.)
  message?: string; // Custom error message
  condition?: ConditionalRule; // Conditional validation (only validate if X)
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>; // fieldId -> error message
  warnings: Record<string, string>;
}

// ==========================================
// CONDITIONAL LOGIC
// ==========================================

export type OperatorType = 
  | 'equals' 
  | 'notEquals' 
  | 'contains' 
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan' 
  | 'lessThan' 
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'
  | 'between'
  | 'empty'
  | 'notEmpty'
  | 'regex'
  | 'in'
  | 'notIn';

export type ActionType = 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'setValue';

export interface Condition {
  id: UUID;
  field: UUID; // Target field ID to check
  operator: OperatorType;
  value?: any; // Value to compare against
  secondaryValue?: any; // For 'between' operator
}

export interface ConditionalRule {
  id: UUID;
  conditions: Condition[];
  logicOperator: 'AND' | 'OR'; // How to combine multiple conditions
  action: ActionType;
  targetField?: UUID; // Which field to affect (if different from source)
  targetValue?: any; // Value to set if action is 'setValue'
}

// ==========================================
// COMPONENT DEFINITION
// ==========================================

export interface SelectOption {
  id: UUID;
  label: string;
  value: string | number;
  disabled?: boolean;
  icon?: string;
  description?: string;
}

export interface ComponentProperties {
  // Common
  placeholder?: string;
  helperText?: string;
  tooltip?: string;
  prefix?: string; // Text/icon before input
  suffix?: string; // Text/icon after input
  
  // Options (for select, radio, checkbox)
  options?: SelectOption[];
  allowMultiple?: boolean;
  searchable?: boolean;
  creatable?: boolean; // Allow creating new options
  
  // Number/Range specific
  min?: number;
  max?: number;
  step?: number;
  
  // Text specific
  rows?: number; // For textarea
  maxChars?: number;
  showCharCount?: boolean;
  
  // File specific
  accept?: string; // MIME types
  maxFileSize?: number; // MB
  multiple?: boolean;
  
  // Date specific
  dateFormat?: string;
  minDate?: string;
  maxDate?: string;
  disableWeekends?: boolean;
  
  // Layout specific
  columns?: number; // 1-4
  gap?: 'small' | 'medium' | 'large';
  size?: 'small' | 'medium' | 'large' | 'xl';
  
  // Heading specific
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  
  // Content specific
  content?: string; // For HTML, paragraph, markdown
  
  // Rating specific
  maxRating?: number;
  icon?: 'star' | 'heart' | 'thumb';
  
  // Calculated field
  formula?: string; // Math.js expression like "{{field1}} + {{field2}}"

  // Payment field (Stripe)
  amountCents?: number;
  currency?: string;
  stripePublishableKey?: string;

  // Custom CSS
  customClass?: string;
  customCSS?: string;
}

export interface FormComponent {
  // Identity
  id: UUID;
  type: ComponentType;
  
  // Content
  label: string;
  name?: string; // Form field name (defaults to label slug)
  description?: string;
  
  // Data
  defaultValue?: any;
  value?: any; // Runtime value
  
  // Configuration
  properties?: ComponentProperties;
  validation?: ValidationRule[];
  styles?: StyleConfig;
  conditions?: ConditionalRule[]; // When to show/hide/enable
  
  // Hierarchy (for nested layouts)
  parentId?: UUID;
  children?: FormComponent[];
  
  // State (runtime only, not persisted)
  isValid?: boolean;
  errorMessage?: string;
  isTouched?: boolean;
  isDirty?: boolean;
}

// ==========================================
// FORM STEP (Multi-step Forms)
// ==========================================

export interface FormStep {
  id: UUID;
  title: string;
  description?: string;
  componentIds: UUID[]; // References to components in this step
  condition?: ConditionalRule; // Show step only if condition met
  isOptional?: boolean;
  allowBack?: boolean;
  buttonText?: {
    next?: string;
    previous?: string;
    submit?: string;
  };
}

// ==========================================
// CALCULATION & LOGIC
// ==========================================

export interface CalculationRule {
  id: UUID;
  name: string;
  targetField: UUID;
  formula: string; // Expression with {{fieldId}} placeholders
  trigger: 'onChange' | 'onBlur' | 'manual';
}

export interface CrossFieldValidation {
  id: UUID;
  type: 'match' | 'unique' | 'sum' | 'custom';
  fields: UUID[];
  message: string;
  condition?: string; // Expression for custom validation
}

// ==========================================
// FORM SCHEMA (The Big One)
// ==========================================

export interface FormSettings {
  // General
  submitButtonText: string;
  layout: LayoutType;
  theme: string;
  
  // Behavior
  multiStep?: boolean;
  allowEditing?: boolean; // Allow users to edit submitted forms
  autoSave?: boolean;
  autoSaveInterval?: number; // seconds
  
  // Success
  successMessage?: string;
  successRedirect?: URLString;
  successCallback?: string; // JavaScript function name
  
  // Validation
  validateOn?: 'change' | 'blur' | 'submit';
  preventSubmit?: boolean; // Stop if invalid
  
  // Styling
  customCSS?: string;
  customJS?: string;
  backgroundImage?: URLString;
  
  // Access
  private?: boolean; // Requires auth
  password?: string; // Simple password protection
  allowMultipleSubmissions?: boolean;
  submissionLimit?: number;
  
  // Integrations
  webhooks?: WebhookConfig[];
  emailNotifications?: EmailConfig[];
}

export interface WebhookConfig {
  id: UUID;
  url: URLString;
  method: 'POST' | 'PUT';
  headers?: Record<string, string>;
  events: ('submit' | 'update' | 'delete')[];
  active: boolean;
}

export interface EmailConfig {
  id: UUID;
  to: string[];
  subject: string;
  template: 'default' | 'custom';
  customBody?: string;
  attachPdf?: boolean;
  attachData?: boolean;
}

export interface FormSchema {
  // Metadata
  id: UUID;
  version: number;
  title: string;
  description?: string;
  
  // Timestamps
  createdAt: TimestampISO;
  updatedAt: TimestampISO;
  publishedAt?: TimestampISO;
  
  // Structure
  components: FormComponent[];
  steps?: FormStep[];
  settings: FormSettings;
  
  // Logic
  calculations?: CalculationRule[];
  logic?: {
    validations?: CrossFieldValidation[];
    calculations?: CalculationRule[];
  };
  
  // Stats (runtime)
  submissionCount?: number;
  viewCount?: number;
}

// ==========================================
// BUILDER STATE
// ==========================================

export interface BuilderHistory {
  timestamp: number;
  schema: FormSchema;
  action: string; // Description of what changed
}

export interface BuilderState {
  // Schema
  schema: FormSchema;
  
  // Selection & Interaction
  selectedId: UUID | null;
  draggedId: UUID | null;
  hoveredId: UUID | null;
  
  // UI State
  view: Viewport;
  mode: BuilderMode;
  zoom: number;
  sidebarOpen: boolean;
  panelOpen: boolean;
  
  // History
  history: BuilderHistory[];
  historyIndex: number;
  
  // Multi-step editing
  currentStepId: UUID | null;
  
  // Async
  isSaving: boolean;
  lastSaved: TimestampISO | null;
}

// ==========================================
// DRAG & DROP TYPES
// ==========================================

export type DraggableType = 'sidebar-item' | 'canvas-item' | 'tree-item';

export interface DragData {
  type: DraggableType;
  componentType?: ComponentType;
  componentId?: UUID;
  index?: number;
  parentId?: UUID;
}

export interface DropResult {
  source: 'palette' | 'canvas' | 'trash';
  targetId?: UUID;
  position: 'before' | 'after' | 'inside' | 'end';
}

// ==========================================
// API TYPES
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface FormSubmission {
  id: UUID;
  formId: UUID;
  data: Record<string, any>;
  metadata: {
    ip?: string;
    userAgent?: string;
    referrer?: string;
    submittedAt: TimestampISO;
    timeSpent: number; // seconds
  };
  files?: Record<string, URLString>;
}

// ==========================================
// COMPONENT REGISTRY TYPES
// ==========================================

export interface ComponentDefinition {
  type: ComponentType;
  category: ComponentCategory;
  label: string;
  description: string;
  icon: string | ReactNode;
  defaultProps: Partial<FormComponent>;
  allowedProps: string[]; // Whitelist of editable properties
  forbiddenProps?: string[];
  canHaveChildren?: boolean;
  maxChildren?: number;
  allowedChildren?: ComponentType[];
  requiresParent?: ComponentType[];
  isDeprecated?: boolean;
}

// ==========================================
// UTILITY TYPES
// ==========================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type ComponentPropsMap = {
  [K in ComponentType]: Partial<FormComponent>;
};

// Helper for strongly typed event handlers
export type ComponentChangeHandler = (id: UUID, value: any) => void;
export type ComponentSelectHandler = (id: UUID | null) => void;