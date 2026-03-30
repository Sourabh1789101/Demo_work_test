import React, { useState } from 'react';
import { nanoid } from 'nanoid';
import { Trash2, Plus, PlusCircle } from 'lucide-react';
import { useBuilderStore } from '../../../modules/store/builderStore';
import { ValidationBuilder } from './ValidationBuilder';
import {
  THEME_PRESETS,
  BUTTON_STYLES,
  FONT_OPTIONS,
} from '../../lib/themes';

// ── Conditional Logic Types ───────────────────────────────────────────────────
type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'is_empty'
  | 'is_not_empty'
  | 'greater_than'
  | 'less_than';

type ConditionAction = 'show' | 'hide' | 'require' | 'unrequire';

interface ConditionItem {
  id: string;
  fieldId: string;
  operator: ConditionOperator;
  value: string;
}

interface ConditionalRule {
  id: string;
  action: ConditionAction;
  logic: 'AND' | 'OR';
  conditions: ConditionItem[];
}

// ── Shared style constants ────────────────────────────────────────────────────
const inputCls =
  'w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-white ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all';

// ── Simple field wrapper ──────────────────────────────────────────────────────
const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1">
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
      {label}
    </label>
    {children}
  </div>
);

// ── Toggle switch ─────────────────────────────────────────────────────────────
const Toggle: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}> = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
    <div>
      <p className="text-xs font-semibold text-gray-700">{label}</p>
      {description && <p className="text-[10px] text-gray-400 mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      role="switch"
      title={label}
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 ${
        checked ? 'bg-blue-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  </div>
);

// ── Options editor (for select / multiselect / checkbox / radio) ──────────────
const OptionsEditor: React.FC<{
  options: { id: string; label: string; value: string }[];
  onChange: (options: any[]) => void;
}> = ({ options, onChange }) => {
  const add = () =>
    onChange([
      ...options,
      {
        id: nanoid(),
        label: `Option ${options.length + 1}`,
        value: `opt${options.length + 1}`,
      },
    ]);

  const update = (idx: number, label: string) => {
    const next = [...options];
    next[idx] = {
      ...next[idx],
      label,
      value: label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    };
    onChange(next);
  };

  const remove = (idx: number) => onChange(options.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Options
      </label>

      <div className="space-y-1.5">
        {options.map((opt, idx) => (
          <div key={opt.id ?? idx} className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full flex-shrink-0" />
            <input
              type="text"
              value={opt.label}
              onChange={e => update(idx, e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              placeholder="Option label"
            />
            <button
              type="button"
              onClick={() => remove(idx)}
              className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none flex-shrink-0"
              title="Remove option"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="w-full py-1.5 text-xs text-blue-600 border border-dashed border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
      >
        + Add Option
      </button>
    </div>
  );
};

// ── Basic properties tab ──────────────────────────────────────────────────────
const BasicProperties: React.FC<{ component: any }> = ({ component }) => {
  const { updateComponent, updateComponentProperty } = useBuilderStore();
  const id = component.id;

  // Helpers
  const setProp = (key: string, value: unknown) =>
    updateComponentProperty(id, `properties.${key}`, value);

  const setLabel = (v: string) => updateComponent(id, { label: v });

  const isRequired: boolean = component.validation?.some((v: any) => v.type === 'required') ?? false;

  const toggleRequired = (checked: boolean) => {
    const current: any[] = component.validation ?? [];
    if (checked) {
      if (!current.some((v: any) => v.type === 'required')) {
        updateComponent(id, {
          validation: [...current, { id: nanoid(), type: 'required', message: '' }],
        });
      }
    } else {
      updateComponent(id, {
        validation: current.filter((v: any) => v.type !== 'required'),
      });
    }
  };

  const type: string = component.type;

  const isContentType = ['heading', 'paragraph', 'divider', 'html', 'markdown', 'spacer'].includes(type);
  const hasPlaceholder = [
    'textfield', 'email', 'number', 'textarea', 'phone',
    'password', 'url', 'select', 'multiselect',
  ].includes(type);
  const hasHelperText = !['divider', 'page-break', 'html', 'markdown', 'spacer'].includes(type);
  const hasOptions = ['select', 'multiselect', 'checkbox', 'radio'].includes(type);

  return (
    <div className="p-4 space-y-4">
      {/* Label (not for divider or spacer) */}
      {!['divider', 'spacer'].includes(type) && (
        <Field label="Label">
          <input
            type="text"
            value={component.label}
            onChange={e => setLabel(e.target.value)}
            className={inputCls}
            placeholder="Field label"
          />
        </Field>
      )}

      {/* Required toggle */}
      {!isContentType && (
        <Toggle
          checked={isRequired}
          onChange={toggleRequired}
          label="Required"
          description="Must be filled to submit"
        />
      )}

      {/* Placeholder */}
      {hasPlaceholder && (
        <Field label="Placeholder">
          <input
            type="text"
            value={component.properties?.placeholder ?? ''}
            onChange={e => setProp('placeholder', e.target.value)}
            className={inputCls}
            placeholder="Hint text..."
          />
        </Field>
      )}

      {/* Textarea: rows */}
      {type === 'textarea' && (
        <Field label="Rows">
          <input
            type="number"
            aria-label="Number of rows"
            value={component.properties?.rows ?? 4}
            onChange={e => setProp('rows', Number(e.target.value))}
            min={2}
            max={20}
            className={inputCls}
          />
        </Field>
      )}

      {/* Number / Slider: min · max · step */}
      {(type === 'number' || type === 'slider') && (
        <div className="grid grid-cols-3 gap-2">
          {(['min', 'max', 'step'] as const).map(k => (
            <Field key={k} label={k.charAt(0).toUpperCase() + k.slice(1)}>
              <input
                type="number"
                aria-label={k.charAt(0).toUpperCase() + k.slice(1)}
                value={component.properties?.[k] ?? (k === 'max' ? 100 : k === 'step' ? 1 : 0)}
                onChange={e => setProp(k, Number(e.target.value))}
                className={inputCls}
              />
            </Field>
          ))}
        </div>
      )}

      {/* Heading: level + content */}
      {type === 'heading' && (
        <>
          <Field label="Heading Level">
            <select
              aria-label="Heading Level"
              value={component.properties?.level ?? 2}
              onChange={e => setProp('level', Number(e.target.value))}
              className={inputCls}
            >
              {[1, 2, 3, 4].map(n => (
                <option key={n} value={n}>
                  H{n} — {n === 1 ? 'Page title' : n === 2 ? 'Section' : n === 3 ? 'Sub-section' : 'Small'}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Content">
            <input
              type="text"
              value={component.properties?.content ?? ''}
              onChange={e => setProp('content', e.target.value)}
              className={inputCls}
              placeholder="Section Title"
            />
          </Field>
        </>
      )}

      {/* Paragraph: content */}
      {type === 'paragraph' && (
        <Field label="Content">
          <textarea
            value={component.properties?.content ?? ''}
            onChange={e => setProp('content', e.target.value)}
            rows={4}
            className={`${inputCls} resize-none`}
            placeholder="Paragraph text..."
          />
        </Field>
      )}

      {/* Rating: max stars */}
      {type === 'rating' && (
        <Field label="Number of Stars">
          <select
            aria-label="Number of Stars"
            value={component.properties?.maxRating ?? 5}
            onChange={e => setProp('maxRating', Number(e.target.value))}
            className={inputCls}
          >
            {[3, 4, 5, 6, 7, 10].map(n => (
              <option key={n} value={n}>
                {n} stars
              </option>
            ))}
          </select>
        </Field>
      )}

      {/* Spacer: size */}
      {type === 'spacer' && (
        <Field label="Size">
          <select
            aria-label="Spacer size"
            value={component.properties?.size ?? 'medium'}
            onChange={e => setProp('size', e.target.value)}
            className={inputCls}
          >
            <option value="small">Small (32px)</option>
            <option value="medium">Medium (64px)</option>
            <option value="large">Large (96px)</option>
            <option value="xl">Extra Large (128px)</option>
          </select>
        </Field>
      )}

      {/* HTML / Markdown: content editor */}
      {(type === 'html' || type === 'markdown') && (
        <Field label={type === 'markdown' ? 'Markdown Content' : 'HTML Content'}>
          <textarea
            value={component.properties?.content ?? ''}
            onChange={e => setProp('content', e.target.value)}
            rows={8}
            className={`${inputCls} resize-y font-mono text-xs`}
            placeholder={
              type === 'markdown'
                ? '## Title\n\nWrite **bold**, *italic* text...'
                : '<p>Enter <strong>HTML</strong> here</p>'
            }
          />
        </Field>
      )}

      {/* File / Image Upload: accept + multiple */}
      {(type === 'file' || type === 'image-upload') && (
        <>
          <Field label="Accepted File Types">
            <input
              type="text"
              value={component.properties?.accept ?? ''}
              onChange={e => setProp('accept', e.target.value)}
              className={inputCls}
              placeholder=".pdf, .jpg, .png"
            />
          </Field>
          <Toggle
            checked={!!component.properties?.multiple}
            onChange={v => setProp('multiple', v)}
            label="Allow Multiple Files"
          />
        </>
      )}

      {/* Options for select/multiselect/checkbox/radio */}
      {hasOptions && (
        <OptionsEditor
          options={component.properties?.options ?? []}
          onChange={options =>
            updateComponent(id, {
              properties: { ...component.properties, options },
            })
          }
        />
      )}

      {/* Helper Text */}
      {hasHelperText && (
        <Field label="Helper Text">
          <input
            type="text"
            value={component.properties?.helperText ?? ''}
            onChange={e => setProp('helperText', e.target.value)}
            className={inputCls}
            placeholder="Additional instructions..."
          />
        </Field>
      )}
    </div>
  );
};

// ── Style properties tab ──────────────────────────────────────────────────────
const StyleProperties: React.FC<{ component: any }> = ({ component }) => {
  const { updateComponent } = useBuilderStore();
  const styles = component.styles ?? {};

  const setStyle = (key: string, value: unknown) =>
    updateComponent(component.id, { styles: { [key]: value } });

  const alignBtns = ['left', 'center', 'right'] as const;

  return (
    <div className="p-4 space-y-4">
      <Field label="Width">
        <select
          aria-label="Width"
          value={styles.width ?? 'full'}
          onChange={e => setStyle('width', e.target.value)}
          className={inputCls}
        >
          <option value="full">Full (100%)</option>
          <option value="half">Half (50%)</option>
          <option value="third">One Third (33%)</option>
          <option value="quarter">Quarter (25%)</option>
        </select>
      </Field>

      <Field label="Text Align">
        <div className="flex gap-1">
          {alignBtns.map(align => (
            <button
              key={align}
              type="button"
              onClick={() => setStyle('textAlign', align)}
              className={`flex-1 py-1.5 text-xs rounded border transition-colors capitalize ${
                styles.textAlign === align
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
              }`}
            >
              {align}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Background">
          <input
            type="color"
            aria-label="Background color"
            value={styles.backgroundColor ?? '#ffffff'}
            onChange={e => setStyle('backgroundColor', e.target.value)}
            className="w-full h-8 rounded border border-gray-200 p-0.5 cursor-pointer"
          />
        </Field>
        <Field label="Text Color">
          <input
            type="color"
            aria-label="Text color"
            value={styles.textColor ?? '#111827'}
            onChange={e => setStyle('textColor', e.target.value)}
            className="w-full h-8 rounded border border-gray-200 p-0.5 cursor-pointer"
          />
        </Field>
      </div>
    </div>
  );
};

// ── Conditional Logic Builder ─────────────────────────────────────────────────
const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  equals: 'equals',
  not_equals: 'does not equal',
  contains: 'contains',
  not_contains: 'does not contain',
  is_empty: 'is empty',
  is_not_empty: 'is not empty',
  greater_than: 'is greater than',
  less_than: 'is less than',
};

const ACTION_LABELS: Record<ConditionAction, string> = {
  show: 'Show this field',
  hide: 'Hide this field',
  require: 'Require this field',
  unrequire: 'Un-require this field',
};

const VALUE_HIDDEN_OPERATORS: ConditionOperator[] = ['is_empty', 'is_not_empty'];

const LogicProperties: React.FC<{ component: any }> = ({ component }) => {
  const { schema, updateComponent } = useBuilderStore();
  const currentId = component.id;

  // Other fields in the form (excluding the current component)
  const otherFields = schema.components.filter(
    (c: any) => c.id !== currentId && !['divider', 'spacer', 'heading', 'paragraph', 'html', 'markdown', 'page-break'].includes(c.type)
  );

  const rules: ConditionalRule[] = (component as any).conditionalRules ?? [];

  const saveRules = (next: ConditionalRule[]) => {
    updateComponent(currentId, { conditionalRules: next } as any);
  };

  const addRule = () => {
    const newRule: ConditionalRule = {
      id: nanoid(),
      action: 'show',
      logic: 'AND',
      conditions: [
        {
          id: nanoid(),
          fieldId: otherFields[0]?.id ?? '',
          operator: 'equals',
          value: '',
        },
      ],
    };
    saveRules([...rules, newRule]);
  };

  const deleteRule = (ruleId: string) => {
    saveRules(rules.filter(r => r.id !== ruleId));
  };

  const updateRule = (ruleId: string, updates: Partial<ConditionalRule>) => {
    saveRules(rules.map(r => (r.id === ruleId ? { ...r, ...updates } : r)));
  };

  const addCondition = (ruleId: string) => {
    saveRules(
      rules.map(r =>
        r.id === ruleId
          ? {
              ...r,
              conditions: [
                ...r.conditions,
                {
                  id: nanoid(),
                  fieldId: otherFields[0]?.id ?? '',
                  operator: 'equals' as ConditionOperator,
                  value: '',
                },
              ],
            }
          : r
      )
    );
  };

  const deleteCondition = (ruleId: string, condId: string) => {
    saveRules(
      rules.map(r =>
        r.id === ruleId
          ? { ...r, conditions: r.conditions.filter(c => c.id !== condId) }
          : r
      )
    );
  };

  const updateCondition = (
    ruleId: string,
    condId: string,
    updates: Partial<ConditionItem>
  ) => {
    saveRules(
      rules.map(r =>
        r.id === ruleId
          ? {
              ...r,
              conditions: r.conditions.map(c =>
                c.id === condId ? { ...c, ...updates } : c
              ),
            }
          : r
      )
    );
  };

  if (otherFields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
          <span className="text-2xl">⚡</span>
        </div>
        <p className="text-sm font-semibold text-gray-700">Conditional Logic</p>
        <p className="text-xs text-gray-400 mt-1 max-w-[190px]">
          Add more fields to the form to create conditional rules
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Conditional Rules
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Control when this field is shown or required
          </p>
        </div>
        <button
          type="button"
          onClick={addRule}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus size={12} />
          Add Rule
        </button>
      </div>

      {/* Empty state */}
      {rules.length === 0 && (
        <div className="border-2 border-dashed border-gray-200 rounded-xl py-8 text-center">
          <p className="text-xs text-gray-400">No rules yet</p>
          <button
            type="button"
            onClick={addRule}
            className="mt-2 text-xs text-purple-600 font-medium hover:underline"
          >
            + Add your first rule
          </button>
        </div>
      )}

      {/* Rule list */}
      <div className="space-y-3">
        {rules.map((rule, ruleIdx) => (
          <div
            key={rule.id}
            className="border border-purple-100 bg-purple-50/40 rounded-xl overflow-hidden"
          >
            {/* Rule header */}
            <div className="flex items-center gap-2 px-3 py-2.5 bg-white border-b border-purple-100">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest flex-shrink-0">
                Rule {ruleIdx + 1}
              </span>

              {/* Action */}
              <select
                aria-label={`Action for rule ${ruleIdx + 1}`}
                value={rule.action}
                onChange={e =>
                  updateRule(rule.id, { action: e.target.value as ConditionAction })
                }
                className="flex-1 text-xs px-2 py-1 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-purple-400"
              >
                {(Object.keys(ACTION_LABELS) as ConditionAction[]).map(a => (
                  <option key={a} value={a}>
                    {ACTION_LABELS[a]}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => deleteRule(rule.id)}
                title="Delete rule"
                className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Logic toggle + conditions */}
            <div className="p-3 space-y-2">
              {/* When label + logic toggle */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="font-medium">When</span>
                <div className="flex rounded-md overflow-hidden border border-gray-200 flex-shrink-0">
                  {(['AND', 'OR'] as const).map(l => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => updateRule(rule.id, { logic: l })}
                      className={`px-2 py-0.5 text-[10px] font-bold transition-colors ${
                        rule.logic === l
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {l === 'AND' ? 'ALL' : 'ANY'}
                    </button>
                  ))}
                </div>
                <span className="text-gray-400">conditions are met:</span>
              </div>

              {/* Conditions */}
              <div className="space-y-2">
                {rule.conditions.map((cond, condIdx) => (
                  <div key={cond.id} className="flex items-start gap-1.5">
                    {/* Condition index badge */}
                    <span className="text-[9px] text-gray-300 font-mono mt-1.5 w-3 flex-shrink-0 text-center">
                      {condIdx + 1}
                    </span>

                    <div className="flex-1 grid grid-cols-1 gap-1">
                      {/* Field selector */}
                      <select
                        aria-label={`Field for condition ${condIdx + 1} in rule ${ruleIdx + 1}`}
                        value={cond.fieldId}
                        onChange={e =>
                          updateCondition(rule.id, cond.id, { fieldId: e.target.value })
                        }
                        className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                      >
                        <option value="">-- Select field --</option>
                        {otherFields.map((f: any) => (
                          <option key={f.id} value={f.id}>
                            {f.label || f.type}
                          </option>
                        ))}
                      </select>

                      {/* Operator + value row */}
                      <div className="flex gap-1">
                        <select
                          aria-label={`Operator for condition ${condIdx + 1} in rule ${ruleIdx + 1}`}
                          value={cond.operator}
                          onChange={e =>
                            updateCondition(rule.id, cond.id, {
                              operator: e.target.value as ConditionOperator,
                              value: '',
                            })
                          }
                          className="flex-1 text-xs px-2 py-1.5 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                        >
                          {(Object.keys(OPERATOR_LABELS) as ConditionOperator[]).map(op => (
                            <option key={op} value={op}>
                              {OPERATOR_LABELS[op]}
                            </option>
                          ))}
                        </select>

                        {!VALUE_HIDDEN_OPERATORS.includes(cond.operator) && (
                          <input
                            type="text"
                            value={cond.value}
                            onChange={e =>
                              updateCondition(rule.id, cond.id, { value: e.target.value })
                            }
                            placeholder="value"
                            title={`Value for condition ${condIdx + 1}`}
                            className="flex-1 text-xs px-2 py-1.5 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-purple-400 min-w-0"
                          />
                        )}
                      </div>
                    </div>

                    {/* Delete condition */}
                    <button
                      type="button"
                      onClick={() => deleteCondition(rule.id, cond.id)}
                      title="Remove condition"
                      disabled={rule.conditions.length === 1}
                      className="text-gray-200 hover:text-red-400 transition-colors flex-shrink-0 mt-1.5 disabled:pointer-events-none"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add condition */}
              <button
                type="button"
                onClick={() => addCondition(rule.id)}
                className="flex items-center gap-1 text-[10px] text-purple-600 font-medium hover:underline mt-1"
              >
                <PlusCircle size={11} />
                Add condition
              </button>
            </div>
          </div>
        ))}
      </div>

      {rules.length > 0 && (
        <p className="text-[10px] text-gray-400 text-center">
          Rules are evaluated in order and auto-saved
        </p>
      )}
    </div>
  );
};

// ── Static maps to avoid runtime inline styles ────────────────────────────────
const PRESET_BG: Record<string, string> = {
  blue:   'bg-blue-500',
  purple: 'bg-purple-500',
  green:  'bg-emerald-500',
  rose:   'bg-rose-500',
  orange: 'bg-orange-500',
  dark:   'bg-gray-800',
};

const BTN_RADIUS_CLS: Record<string, string> = {
  rounded: 'rounded',
  pill:    'rounded-full',
  sharp:   'rounded-none',
};

// ── Form settings (shown when no component is selected) ───────────────────────
const FormSettings: React.FC = () => {
  const { schema, updateSchema, updateSettings } = useBuilderStore();

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <h3 className="font-semibold text-gray-900 text-sm">Form Settings</h3>
        <p className="text-[11px] text-gray-400 mt-0.5">Global form configuration</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Field label="Form Title">
          <input
            type="text"
            value={schema.title}
            onChange={e => updateSchema({ title: e.target.value })}
            className={inputCls}
            placeholder="My Form"
          />
        </Field>

        <Field label="Description">
          <textarea
            value={schema.description ?? ''}
            onChange={e => updateSchema({ description: e.target.value })}
            className={`${inputCls} resize-none`}
            rows={2}
            placeholder="Optional form description..."
          />
        </Field>

        <div className="border-t border-gray-100 pt-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            Submission
          </p>

          <div className="space-y-3">
            <Field label="Submit Button Text">
              <input
                type="text"
                value={schema.settings.submitButtonText}
                onChange={e => updateSettings({ submitButtonText: e.target.value })}
                className={inputCls}
              />
            </Field>

            <Field label="Success Message">
              <input
                type="text"
                value={schema.settings.successMessage ?? ''}
                onChange={e => updateSettings({ successMessage: e.target.value })}
                className={inputCls}
                placeholder="Thank you for your submission!"
              />
            </Field>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            Layout
          </p>

          <div className="space-y-3">
            <Field label="Layout Direction">
              <select
                aria-label="Layout Direction"
                value={schema.settings.layout}
                onChange={e => updateSettings({ layout: e.target.value as any })}
                className={inputCls}
              >
                <option value="vertical">Vertical (default)</option>
                <option value="horizontal">Horizontal</option>
                <option value="grid">Grid</option>
              </select>
            </Field>

            <Toggle
              checked={!!schema.settings.multiStep}
              onChange={v => updateSettings({ multiStep: v })}
              label="Multi-Step Form"
              description="Split form into multiple pages"
            />
          </div>
        </div>

        {/* ── Theme ── */}
        <div className="border-t border-gray-100 pt-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            Theme
          </p>

          <div className="space-y-4">
            {/* Preset swatches */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Color Preset</p>
              <div className="flex gap-2 flex-wrap">
                {THEME_PRESETS.map(preset => {
                  const active = (schema.settings as any).theme === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      title={preset.label}
                      onClick={() => updateSettings({ theme: preset.id } as any)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${PRESET_BG[preset.id] ?? 'bg-gray-400'} ${
                        active ? 'border-gray-700 scale-110 shadow-md' : 'border-transparent hover:scale-105'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Custom accent color */}
            <Field label="Custom Accent Color">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  aria-label="Custom accent color"
                  value={(schema.settings as any).themeAccent ?? '#3b82f6'}
                  onChange={e => updateSettings({ themeAccent: e.target.value } as any)}
                  className="w-9 h-9 rounded border border-gray-200 p-0.5 cursor-pointer flex-shrink-0"
                />
                <input
                  type="text"
                  value={(schema.settings as any).themeAccent ?? '#3b82f6'}
                  onChange={e => updateSettings({ themeAccent: e.target.value } as any)}
                  className={`${inputCls} flex-1 font-mono text-xs`}
                  placeholder="#3b82f6"
                />
              </div>
            </Field>

            {/* Button style */}
            <Field label="Button Style">
              <div className="flex gap-1">
                {BUTTON_STYLES.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => updateSettings({ themeBtnStyle: s.id } as any)}
                    className={`flex-1 py-1.5 text-xs border transition-colors ${BTN_RADIUS_CLS[s.id] ?? 'rounded'} ${
                      (schema.settings as any).themeBtnStyle === s.id
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </Field>

            {/* Font family */}
            <Field label="Font">
              <select
                aria-label="Font family"
                value={(schema.settings as any).themeFont ?? 'system'}
                onChange={e => updateSettings({ themeFont: e.target.value } as any)}
                className={inputCls}
              >
                {FONT_OPTIONS.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Tab types ─────────────────────────────────────────────────────────────────
type TabId = 'basic' | 'validation' | 'styles' | 'logic';

// ── Main panel ────────────────────────────────────────────────────────────────
export const PropertiesPanel: React.FC = () => {
  const { schema, selectedId, updateComponent } = useBuilderStore();
  const component = schema.components.find(c => c.id === selectedId);
  const [activeTab, setActiveTab] = useState<TabId>('basic');

  if (!component) return <FormSettings />;

  const isContentType = ['heading', 'paragraph', 'divider', 'html', 'markdown', 'spacer'].includes(component.type);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'basic', label: 'Basic' },
    ...(!isContentType ? [{ id: 'validation' as TabId, label: 'Validation' }] : []),
    { id: 'styles', label: 'Styles' },
    { id: 'logic', label: 'Logic' },
  ];

  // Compute type badge color
  const badgeColor =
    component.type === 'heading' || component.type === 'paragraph'
      ? 'bg-green-100 text-green-700'
      : ['select', 'multiselect', 'checkbox', 'radio', 'toggle'].includes(component.type)
      ? 'bg-purple-100 text-purple-700'
      : ['file', 'rating', 'signature', 'color'].includes(component.type)
      ? 'bg-orange-100 text-orange-700'
      : 'bg-blue-100 text-blue-700';

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-gray-900 text-sm truncate flex-1">
            {component.label}
          </h3>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase flex-shrink-0 ${badgeColor}`}>
            {component.type}
          </span>
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
          #{component.id.slice(0, 8)}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 flex-shrink-0 bg-white">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'basic' && <BasicProperties component={component} />}

        {activeTab === 'validation' && (
          <div className="p-4">
            <ValidationBuilder
              rules={component.validation ?? []}
              onChange={validation => updateComponent(component.id, { validation })}
            />
          </div>
        )}

        {activeTab === 'styles' && <StyleProperties component={component} />}

        {activeTab === 'logic' && <LogicProperties component={component} />}
      </div>
    </div>
  );
};
