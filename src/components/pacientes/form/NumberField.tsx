
import React from 'react';

interface NumberFieldProps {
  label: string;
  id: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  readOnly?: boolean;
}

const NumberField: React.FC<NumberFieldProps> = ({ label, id, value, onChange, placeholder, className, min, max, step, readOnly = false }) => {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-800 mb-1">
        {label}
      </label>
      <input
        type="number"
        id={id}
        name={id}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        readOnly={readOnly}
        className={`block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 ${readOnly ? 'bg-gray-100' : 'bg-white'}`}
      />
    </div>
  );
};

export default NumberField;
