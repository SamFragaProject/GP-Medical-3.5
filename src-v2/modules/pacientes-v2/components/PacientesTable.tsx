/**
 * 📋 TABLA DE PACIENTES V2
 */

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Search,
  User,
  MoreHorizontal,
} from 'lucide-react';
import { ButtonV2 } from '../../../shared/components/ui/ButtonV2';
import { Badge } from '../../../../src/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../../src/components/ui/dropdown-menu';
import type { Paciente, PacienteSort } from '../types/paciente.types';

interface PacientesTableProps {
  pacientes: Paciente[];
  isLoading: boolean;
  sort: PacienteSort;
  onSort: (field: PacienteSort['field']) => void;
  onEdit: (paciente: Paciente) => void;
  onDelete: (paciente: Paciente) => void;
  onView: (paciente: Paciente) => void;
}

export function PacientesTable({
  pacientes,
  isLoading,
  sort,
  onSort,
  onEdit,
  onDelete,
  onView,
}: PacientesTableProps) {
  const SortIcon = ({ field }: { field: PacienteSort['field'] }) => {
    if (sort.field !== field) return <div className="w-4" />;
    return sort.direction === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const SortableHeader = ({
    field,
    children,
  }: {
    field: PacienteSort['field'];
    children: React.ReactNode;
  }) => (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <SortIcon field={field} />
      </div>
    </th>
  );

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (pacientes.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <SortableHeader field="nombre">Paciente</SortableHeader>
            <SortableHeader field="curp">CURP</SortableHeader>
            <SortableHeader field="edad">Edad</SortableHeader>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Contacto
            </th>
            <SortableHeader field="activo">Estado</SortableHeader>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {pacientes.map((paciente) => (
            <tr
              key={paciente.id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {paciente.nombre} {paciente.apellidoPaterno}
                    </div>
                    <div className="text-sm text-gray-500">
                      {paciente.email || 'Sin email'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {paciente.curp || '-'}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {paciente.edad ? `${paciente.edad} años` : '-'}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {paciente.telefono || '-'}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <Badge
                  variant={paciente.activo ? 'default' : 'secondary'}
                  className={
                    paciente.activo
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }
                >
                  {paciente.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <ButtonV2 variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </ButtonV2>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(paciente)}>
                      Ver detalle
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(paciente)}>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(paciente)}
                      className="text-red-600"
                    >
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3">
        <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
      </div>
      <div className="divide-y divide-gray-200">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-4 py-4 flex items-center space-x-4">
            <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-1/6 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12 border rounded-lg">
      <User className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">
        No hay pacientes
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Comienza agregando un nuevo paciente.
      </p>
    </div>
  );
}
