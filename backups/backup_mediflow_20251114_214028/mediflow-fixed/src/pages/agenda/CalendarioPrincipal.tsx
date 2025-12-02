// Componente de Calendario Interactivo Principal
import React, { useState, useMemo } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/es'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './calendario.css'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, MoreHorizontal, Clock, User, Stethoscope } from 'lucide-react'
import { CalendarioEvent, RBCEvent } from '@/types/agenda'
import { useAgenda } from '@/hooks/useAgenda'
import toast from 'react-hot-toast'

// Configurar moment en español
moment.locale('es')
const localizer = momentLocalizer(moment)

interface CalendarioPrincipalProps {
  eventos: CalendarioEvent[]
  onCitaSeleccionada: (citaId: string) => void
  onNuevaCita: (fecha?: Date) => void
  loading: boolean
}

export function CalendarioPrincipal({ 
  eventos, 
  onCitaSeleccionada, 
  onNuevaCita, 
  loading 
}: CalendarioPrincipalProps) {
  const [vistaActual, setVistaActual] = useState<'month' | 'week' | 'day'>('month')
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date())

  // Configuraciones del calendario
  const calendarMessages = {
    allDay: 'Todo el día',
    previous: 'Anterior',
    next: 'Siguiente',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    date: 'Fecha',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'No hay citas en este período',
    showMore: (total: number) => `+ Ver más (${total})`
  }

  const calendarFormats = {
    monthHeaderFormat: 'MMMM YYYY',
    dayHeaderFormat: 'dddd, DD MMMM',
    dayRangeHeaderFormat: ({ start, end }: any) => 
      `${moment(start).format('DD MMMM')} - ${moment(end).format('DD MMMM YYYY')}`,
    timeGutterFormat: 'HH:mm',
    eventTimeRangeFormat: ({ start, end }: any, culture: any, localizer: any) =>
      `${localizer?.format(start, 'HH:mm', culture)} - ${localizer?.format(end, 'HH:mm', culture)}`
  }

  // Manejar selección de evento
  const manejarSeleccionEvento = (event: RBCEvent) => {
    onCitaSeleccionada(event.id)
  }

  // Manejar navegación de fecha
  const manejarNavegacion = (newDate: Date, view: string, action: string) => {
    setFechaSeleccionada(newDate)
  }

  // Manejar cambio de vista
  const manejarCambioVista = (vista: 'month' | 'week' | 'day') => {
    setVistaActual(vista)
  }

  // Manejar doble click para nueva cita
  const manejarDoubleClick = ({ start }: { start: Date }) => {
    onNuevaCita(start)
  }

  // Personalizar estilo de eventos
  const eventStyleGetter = (event: RBCEvent) => {
    const backgroundColor = event.bgColor || '#00BFA6'
    const borderColor = event.borderColor || backgroundColor
    
    return {
      style: {
        backgroundColor,
        borderColor,
        color: event.textColor || '#FFFFFF',
        border: 'none',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '500',
        padding: '2px 6px',
        cursor: 'pointer'
      }
    }
  }

  // Generar datos para la vista de toolbar
  const Toolbar = ({ label, onNavigate, onView, view }: any) => (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center space-x-4">
        {/* Navegación */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('PREV')}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => onNavigate('TODAY')}
            className="px-3 py-1 text-sm font-medium text-primary hover:bg-primary/10 rounded transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={() => onNavigate('NEXT')}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        
        {/* Label */}
        <h2 className="text-lg font-semibold text-gray-900">{label}</h2>
      </div>

      <div className="flex items-center space-x-2">
        {/* Vista actual indicator */}
        <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
          <button
            onClick={() => onView('month')}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              view === 'month' ? 'bg-primary text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mes
          </button>
          <button
            onClick={() => onView('week')}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              view === 'week' ? 'bg-primary text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => onView('day')}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              view === 'day' ? 'bg-primary text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Día
          </button>
        </div>

        {/* Nueva cita button */}
        <button
          onClick={() => onNuevaCita(new Date())}
          className="bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2 text-sm font-medium"
        >
          <Plus size={14} />
          <span>Nueva Cita</span>
        </button>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando calendario...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[600px]">
      <Calendar
        localizer={localizer}
        events={eventos}
        startAccessor="start"

        style={{ height: '100%' }}
        view={vistaActual}
        onView={manejarCambioVista}
        date={fechaSeleccionada}
        onNavigate={manejarNavegacion}
        onSelectEvent={manejarSeleccionEvento}
        onDoubleClickEvent={manejarDoubleClick}
        eventPropGetter={eventStyleGetter}
        messages={calendarMessages}
        popup
        step={15}
        timeslots={4}
        min={new Date(2024, 0, 1, 8, 0)} // 8:00 AM
        max={new Date(2024, 0, 1, 18, 0)} // 6:00 PM
        dayLayoutAlgorithm="no-overlap"
        showMultiDayTimes
        culture="es"
      />
      
      {/* Leyenda de estados */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Tipos de Consulta</h4>
        <div className="flex flex-wrap gap-4">
          {Array.from(new Set(eventos.map(e => e.resource.tipoConsulta?.nombre))).map(tipo => {
            const evento = eventos.find(e => e.resource.tipoConsulta?.nombre === tipo)
            return (
              <div key={tipo} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded" 
                  style={{ backgroundColor: evento?.bgColor || '#00BFA6' }}
                />
                <span className="text-sm text-gray-600">{tipo}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}