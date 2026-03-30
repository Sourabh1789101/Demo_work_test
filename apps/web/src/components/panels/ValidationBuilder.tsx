import React from 'react';
import { ValidationRule, ValidationType } from '../../../modules/Core/types';
import { Plus, Trash2 } from 'lucide-react';

interface ValidationBuilderProps {
  rules: ValidationRule[];
  onChange: (rules: ValidationRule[]) => void;
}

const validationTypes: { type: ValidationType; label: string; needsValue: boolean }[] = [
  { type: 'required', label: 'Required', needsValue: false },
  { type: 'email', label: 'Valid Email', needsValue: false },
  { type: 'url', label: 'Valid URL', needsValue: false },
  { type: 'minLength', label: 'Min Length', needsValue: true },
  { type: 'maxLength', label: 'Max Length', needsValue: true },
  { type: 'min', label: 'Minimum Value', needsValue: true },
  { type: 'max', label: 'Maximum Value', needsValue: true },
  { type: 'pattern', label: 'Regex Pattern', needsValue: true },
];

export const ValidationBuilder: React.FC<ValidationBuilderProps> = ({ rules, onChange }) => {
  const addRule = () => {
    const newRule: ValidationRule = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'required',
    };
    onChange([...rules, newRule]);
  };

  const updateRule = (index: number, updates: Partial<ValidationRule>) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], ...updates };
    onChange(newRules);
  };

  const removeRule = (index: number) => {
    onChange(rules.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {rules.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-lg">
          No validation rules
        </div>
      )}

      {rules.map((rule, index) => {
        const typeInfo = validationTypes.find((t) => t.type === rule.type);

        return (
          <div key={rule.id} className="bg-gray-50 p-3 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <select
                value={rule.type}
                onChange={(e) => updateRule(index, { type: e.target.value as ValidationType })}
                className="text-sm border-gray-300 rounded-md bg-white"
              >
                {validationTypes.map((t) => (
                  <option key={t.type} value={t.type}>
                    {t.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => removeRule(index)}
                className="text-red-500 hover:bg-red-50 p-1 rounded"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {typeInfo?.needsValue && (
              <input
                type={rule.type.includes('Length') ? 'number' : 'text'}
                value={rule.value || ''}
                onChange={(e) => updateRule(index, { value: e.target.value })}
                placeholder="Value"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
              />
            )}

            <input
              type="text"
              value={rule.message || ''}
              onChange={(e) => updateRule(index, { message: e.target.value })}
              placeholder="Custom error message (optional)"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            />
          </div>
        );
      })}

      <button
        onClick={addRule}
        className="w-full py-2 flex items-center justify-center gap-2 text-sm text-blue-600 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50"
      >
        <Plus size={16} />
        Add Validation Rule
      </button>
    </div>
  );
};