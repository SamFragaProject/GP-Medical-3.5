import React from 'react';

interface RadioGroupProps {
  label?: string;
  name: string;
  options: string[];
  selectedValue: string;
  onChange: (value: string) => void;
  className?: string;
  hideLabel?: boolean;
}

const RadioGroup: React.FC<RadioGroupProps> = ({ label, name, options, selectedValue, onChange, className, hideLabel = false }) => {
  return (
    <div className={className}>
      {!hideLabel && <label className="block text-sm font-medium text-slate-800 mb-1">{label}</label>}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {options.map((option) => (
          <label key={option} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option}
              checked={selectedValue === option}
              onChange={(e) => onChange(e.target.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="text-sm text-slate-800">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default RadioGroup;