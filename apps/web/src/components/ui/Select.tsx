import React from 'react';

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  value: any;
  onChange: (value: any) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  helperText,
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full px-3 py-2 border rounded-md text-sm bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${error ? 'border-red-300' : 'border-gray-300'}
        `}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {helperText && !error && <p className="text-xs text-gray-500">{helperText}</p>}
    </div>
  );
};