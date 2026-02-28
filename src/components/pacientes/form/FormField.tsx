import React from 'react';

interface FormFieldProps {
  label?: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  hideLabel?: boolean;
  type?: 'text' | 'tel' | 'email';
}

const FormField: React.FC<FormFieldProps> = ({ label, id, value, onChange, placeholder, className, inputClassName, hideLabel = false, type = 'text' }) => {
  return (
    <div className={className}>
      {!hideLabel && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-800 mb-1">
            {label}
        </label>
      )}
      <input
        type={type}
        id={id}
        name={id}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900 ${inputClassName}`}
      />
    </div>
  );
};

export default FormField;