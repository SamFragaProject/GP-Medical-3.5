
import React from 'react';

interface TextAreaProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  hideLabel?: boolean;
}

const TextArea: React.FC<TextAreaProps> = ({ label, id, value, onChange, placeholder, rows = 4, className, hideLabel = false }) => {
  return (
    <div className={className}>
      {!hideLabel && (
          <label htmlFor={id} className="block text-sm font-medium text-slate-800 mb-1">
            {label}
          </label>
      )}
      <textarea
        id={id}
        name={id}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
      />
    </div>
  );
};

export default TextArea;
