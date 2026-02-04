/**
 * 📄 PÁGINA DE PACIENTES V2
 * 
 * Versión mejorada con:
 * - Datos reales de Supabase
 * - Paginación
 * - Búsqueda con debounce
 * - Filtros
 * - Ordenamiento
 */

import React, { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { ButtonV2 } from '../../../shared/components/ui/ButtonV2';
import { PacientesTable } from './PacientesTable';
import { PacienteSearch } from './PacienteSearch';
import { usePacientes } from '../hooks/usePacientes';
import { useAuthContext } from '../../auth-v2/components/AuthProvider';
import type { Paciente } from '../types/paciente.types';

export function Pacientes() {
  const { hasPermission } = useAuthContext();
  const [showModal, setShowModal] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);

  const {
    pacientes,
    total,
    page,
    pageSize,
    totalPages,
    stats,
    isLoading,
    isLoadingStats,
    error,
    filters,
    sort,
    setSearch,
    setSorting,
    goToPage,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,
    delete: deletePaciente,
    isDeleting,
  } = usePacientes({
    pageSize: 20,
    enableRealtime: true,
  });

  const handleEdit = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setShowModal(true);
  };

  const handleDelete = async (paciente: Paciente) => {
    // La confirmación ya está manejada por ButtonV2
    await deletePaciente(paciente.id);
  };

  const handleView = (paciente: Paciente) => {
    // Navegar a detalle
    window.location.href = `/pacientes/${paciente.id}`;
  };

  const canCreate = hasPermission('pacientes', 'create');
  const canDelete = hasPermission('pacientes', 'delete');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-500">
            {isLoadingStats ? (
              'Cargando...'
            ) : (
              `${stats?.total || 0} pacientes registrados`
            )}
          </p>
        </div>
        
        {canCreate && (
          <ButtonV2
            variant="primary"
            onClick={() => {
              setSelectedPaciente(null);
              setShowModal(true);
            }}
            icon={<Plus className="h-4 w-4" />}
          >
            Nuevo Paciente
          </ButtonV2>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="h-5 w-5 text-blue-600" />}
            label="Total"
            value={stats.total}
            color="blue"
          />
          <StatCard
            icon={<Users className="h-5 w-5 text-green-600" />}
            label="Activos"
            value={stats.activos}
            color="green"
          />
          <StatCard
            icon={<Users className="h-5 w-5 text-gray-600" />}
            label="Inactivos"
            value={stats.inactivos}
            color="gray"
          />
          <StatCard
            icon={<Users className="h-5 w-5 text-purple-600" />}
            label="Nuevos este mes"
            value={stats.nuevosEsteMes}
            color="purple"
          />
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-4">
        <PacienteSearch
          value={filters.search || ''}
          onChange={setSearch}
          isLoading={isLoading}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error al cargar pacientes</p>
          <p className="text-sm">{error.message}</p>
        </div>
      )}

      {/* Table */}
      <PacientesTable
        pacientes={pacientes}
        isLoading={isLoading}
        sort={sort}
        onSort={setSorting}
        onEdit={handleEdit}
        onDelete={canDelete ? handleDelete : () => {}}
        onView={handleView}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Mostrando {((page - 1) * pageSize) + 1} -{' '}
            {Math.min(page * pageSize, total)} de {total} pacientes
          </p>
          
          <div className="flex items-center gap-2">
            <ButtonV2
              variant="outline"
              size="sm"
              onClick={previousPage}
              disabled={!hasPreviousPage || isLoading}
            >
              Anterior
            </ButtonV2>
            
            <span className="text-sm text-gray-600">
              Página {page} de {totalPages}
            </span>
            
            <ButtonV2
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={!hasNextPage || isLoading}
            >
              Siguiente
            </ButtonV2>
          </div>
        </div>
      )}

      {/* Modal de crear/editar (placeholder) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-lg font-bold mb-4">
              {selectedPaciente ? 'Editar' : 'Nuevo'} Paciente
            </h2>
            <p className="text-gray-500">
              Formulario en desarrollo. Este es un placeholder.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <ButtonV2 variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </ButtonV2>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'gray' | 'purple';
}) {
  const colors = {
    blue: 'bg-blue-50 border-blue-100',
    green: 'bg-green-50 border-green-100',
    gray: 'bg-gray-50 border-gray-100',
    purple: 'bg-purple-50 border-purple-100',
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[color]}`}>
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
