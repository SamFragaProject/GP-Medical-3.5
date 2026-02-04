/**
 * 📅 PÁGINA DE AGENDA V2
 */

import React, { useState } from 'react';
import { Calendar, Clock, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { ButtonV2 } from '../../../shared/components/ui/ButtonV2';
import { useAgenda } from '../hooks/useAgenda';
import { useAuthContext } from '../../auth-v2/components/AuthProvider';
import { ESTADO_CITA_COLORS } from '../types/agenda.types';
import type { Cita, EstadoCita } from '../types/agenda.types';

export function Agenda() {
  const { hasPermission } = useAuthContext();
  const [showModal, setShowModal] = useState(false);
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);

  const {
    citas,
    citasHoy,
    stats,
    fechaSeleccionada,
    isLoading,
    isLoadingHoy,
    isLoadingStats,
    setFecha,
    cancelar,
    completar,
    isCancelando,
    isCompletando,
  } = useAgenda();

  const canCreate = hasPermission('citas', 'create');
  const canUpdate = hasPermission('citas', 'update');

  // Navegación de fechas
  const diaAnterior = () => {
    const nueva = new Date(fechaSeleccionada);
    nueva.setDate(nueva.getDate() - 1);
    setFecha(nueva);
  };

  const diaSiguiente = () => {
    const nueva = new Date(fechaSeleccionada);
    nueva.setDate(nueva.getDate() + 1);
    setFecha(nueva);
  };

  const hoy = () => {
    setFecha(new Date());
  };

  // Formatear fecha
  const formatFecha = (fecha: Date) => {
    return fecha.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Formatear hora
  const formatHora = (fechaStr: string) => {
    return new Date(fechaStr).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCancelar = async (cita: Cita) => {
    await cancelar({ id: cita.id, motivo: 'Cancelado por usuario' });
  };

  const handleCompletar = async (cita: Cita) => {
    await completar(cita.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-500">
            {isLoadingStats ? 'Cargando...' : `${stats?.totalHoy || 0} citas hoy`}
          </p>
        </div>
        
        {canCreate && (
          <ButtonV2
            variant="primary"
            onClick={() => {
              setSelectedCita(null);
              setShowModal(true);
            }}
            icon={<Plus className="h-4 w-4" />}
          >
            Nueva Cita
          </ButtonV2>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Pendientes"
            value={stats.pendientes}
            color="yellow"
          />
          <StatCard
            label="Completadas"
            value={stats.completadas}
            color="green"
          />
          <StatCard
            label="Canceladas"
            value={stats.canceladas}
            color="red"
          />
          <StatCard
            label="Total"
            value={stats.totalHoy}
            color="blue"
          />
        </div>
      )}

      {/* Navegación de fecha */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
        <ButtonV2 variant="outline" size="sm" onClick={diaAnterior}>
          <ChevronLeft className="h-4 w-4" />
        </ButtonV2>
        
        <div className="text-center">
          <h2 className="text-lg font-semibold capitalize">
            {formatFecha(fechaSeleccionada)}
          </h2>
          <ButtonV2 variant="ghost" size="sm" onClick={hoy}>
            Hoy
          </ButtonV2>
        </div>
        
        <ButtonV2 variant="outline" size="sm" onClick={diaSiguiente}>
          <ChevronRight className="h-4 w-4" />
        </ButtonV2>
      </div>

      {/* Lista de citas */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="font-semibold">Citas del día</h3>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : citas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-2" />
            <p>No hay citas programadas</p>
          </div>
        ) : (
          <div className="divide-y">
            {citas.map((cita) => (
              <div
                key={cita.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* Hora */}
                    <div className="flex flex-col items-center min-w-[60px]">
                      <span className="text-lg font-bold text-gray-900">
                        {formatHora(cita.fechaInicio)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {cita.duracion} min
                      </span>
                    </div>
                    
                    {/* Info */}
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {cita.paciente?.nombre} {cita.paciente?.apellidoPaterno}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {cita.medico?.nombre} {cita.medico?.apellidoPaterno}
                      </p>
                      <p className="text-sm text-gray-500">{cita.motivo}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full border ${ESTADO_CITA_COLORS[cita.estado]}`}>
                          {cita.estado.replace('_', ' ')}
                        </span>
                        {cita.consultorio && (
                          <span className="text-xs text-gray-500">
                            Consultorio {cita.consultorio}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Acciones */}
                  {canUpdate && cita.estado !== 'cancelada' && cita.estado !== 'completada' && (
                    <div className="flex items-center gap-2">
                      <ButtonV2
                        variant="outline"
                        size="sm"
                        onClick={() => handleCompletar(cita)}
                        isLoading={isCompletando}
                      >
                        Completar
                      </ButtonV2>
                      <ButtonV2
                        variant="destructive"
                        size="sm"
                        confirmAction
                        confirmTitle="¿Cancelar cita?"
                        confirmDescription={`¿Estás seguro de cancelar la cita de ${cita.paciente?.nombre}?`}
                        onClick={() => handleCancelar(cita)}
                        isLoading={isCancelando}
                      >
                        Cancelar
                      </ButtonV2>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'yellow' | 'green' | 'red' | 'blue';
}) {
  const colors = {
    yellow: 'bg-yellow-50 border-yellow-100 text-yellow-800',
    green: 'bg-green-50 border-green-100 text-green-800',
    red: 'bg-red-50 border-red-100 text-red-800',
    blue: 'bg-blue-50 border-blue-100 text-blue-800',
  };

  return (
    <div className={`p-4 rounded-lg border text-center ${colors[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm">{label}</p>
    </div>
  );
}
