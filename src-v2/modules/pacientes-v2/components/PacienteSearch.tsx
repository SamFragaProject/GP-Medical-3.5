/**
 * 🔍 BARRA DE BÚSQUEDA DE PACIENTES
 */

import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '../../../../src/components/ui/input';
import { ButtonV2 } from '../../../shared/components/ui/ButtonV2';

interface PacienteSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export function PacienteSearch({
  value,
  onChange,
  placeholder = 'Buscar pacientes...',
  isLoading,
}: PacienteSearchProps) {
  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-10"
      />
      {value && (
        <ButtonV2
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={() => onChange('')}
        >
          <X className="h-4 w-4" />
        </ButtonV2>
      )}
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
