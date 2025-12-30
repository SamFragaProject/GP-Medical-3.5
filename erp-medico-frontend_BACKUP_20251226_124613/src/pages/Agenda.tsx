import React, { useState } from 'react'
import { CalendarioPrincipal } from './agenda/CalendarioPrincipal'
import { useAgenda } from '@/hooks/useAgenda'
import { PremiumHeader } from '@/components/ui/PremiumHeader'
import { Calendar as CalendarIcon } from 'lucide-react'

export const Agenda = () => {
  const { obtenerEventosCalendario, loading } = useAgenda()

  const eventos = obtenerEventosCalendario()

  const handleNuevaCita = (fecha?: Date) => {
    console.log('Nueva cita en:', fecha)
    // TODO: Implementar modal de nueva cita
  }

  const handleCitaSeleccionada = (citaId: string) => {
    console.log('Cita seleccionada:', citaId)
    // TODO: Implementar detalle de cita
  }

  return (
    <div className="space-y-6">
      <div className="p-6 pb-0">
        <PremiumHeader
          title="Agenda Médica"
          subtitle="Gestión de citas y programación"
          gradient={true}
          badges={[
            { text: "Calendario Activo", variant: "info", icon: <CalendarIcon size={14} /> }
          ]}
        />
      </div>

      <div className="p-6 pt-0 h-[calc(100vh-200px)]">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full p-4">
          <CalendarioPrincipal
            eventos={eventos}
            loading={loading}
            onNuevaCita={handleNuevaCita}
            onCitaSeleccionada={handleCitaSeleccionada}
          />
        </div>
      </div>
    </div>
  )
}
