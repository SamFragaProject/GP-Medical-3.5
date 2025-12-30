// Componente para control de equipos médicos y mantenimiento
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Wrench,
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Activity,
  Settings,
  Thermometer,
  Gauge,
  FileText,
  Edit,
  Eye,
  Play,
  Pause,
  AlertCircle
} from 'lucide-react'
import { EquipoMedico, MantenimientoEquipo, CalibracionEquipo } from '@/types/inventario'
import { useInventario } from '@/hooks/useInventario'
import toast from 'react-hot-toast'

interface ComponenteEquiposMedicosProps {
  equipos: EquipoMedico[]
}

export function ComponenteEquiposMedicos({ equipos }: ComponenteEquiposMedicosProps) {
  const { programarMantenimiento } = useInventario()
  const [vistaActual, setVistaActual] = useState<'equipos' | 'mantenimiento' | 'calibracion'>('equipos')
  const [mostrarFormularioMantenimiento, setMostrarFormularioMantenimiento] = useState(false)
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<EquipoMedico | null>(null)
  const [mantenimientoSeleccionado, setMantenimientoSeleccionado] = useState<MantenimientoEquipo | null>(null)

  // Simulación de datos de mantenimiento
  const mantenimientosSimulados: MantenimientoEquipo[] = [
    {
      id: '1',
      equipoId: '1',
      tipo: 'preventivo',
      fechaProgramada: new Date('2024-11-15'),
      fechaEjecutada: undefined,
      descripcion: 'Mantenimiento preventivo mensual - limpieza y calibración básica',
      costo: 2500,
      tecnico: 'Técnico Juan Pérez',
      estado: 'programado',
      observaciones: 'Incluye revisión de sensores y software',
      proximoMantenimiento: new Date('2024-12-15'),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      equipoId: '1',
      tipo: 'correctivo',
      fechaProgramada: new Date('2024-10-20'),
      fechaEjecutada: new Date('2024-10-20'),
      descripcion: 'Reparación de error en sensor de temperatura',
      costo: 4500,
      tecnico: 'Ingeniero María González',
      estado: 'completado',
      observaciones: 'Sensor reemplazado exitosamente',
      proximoMantenimiento: new Date('2024-12-15'),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  const calibracionesSimuladas: CalibracionEquipo[] = [
    {
      id: '1',
      equipoId: '1',
      fechaCalibracion: new Date('2024-10-01'),
      fechaProximaCalibracion: new Date('2025-01-01'),
      resultado: 'aprobado',
      certificado: 'CAL-2024-001',
      tecnico: 'Técnico Certificado Juan Pérez',
      observaciones: 'Calibración exitosa - todos los parámetros dentro de especificaciones',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  const obtenerEstadoEquipo = (estado: string) => {
    const estados = {
      activo: { color: 'bg-success/10 text-success', icono: CheckCircle, texto: 'Activo' },
      fueravServicio: { color: 'bg-danger/10 text-danger', icono: AlertTriangle, texto: 'Fuera de Servicio' },
      mantenimiento: { color: 'bg-warning/10 text-warning', icono: Wrench, texto: 'En Mantenimiento' },
      descontinuado: { color: 'bg-gray/10 text-gray', icono: Pause, texto: 'Descontinuado' }
    }
    return estados[estado as keyof typeof estados] || estados.activo
  }

  const obtenerEstadoMantenimiento = (estado: string) => {
    const estados = {
      programado: { color: 'bg-primary/10 text-primary', icono: Clock, texto: 'Programado' },
      en_proceso: { color: 'bg-warning/10 text-warning', icono: Play, texto: 'En Proceso' },
      completado: { color: 'bg-success/10 text-success', icono: CheckCircle, texto: 'Completado' },
      vencido: { color: 'bg-danger/10 text-danger', icono: AlertTriangle, texto: 'Vencido' },
      reparacion: { color: 'bg-gray/10 text-gray', icono: Wrench, texto: 'En Reparación' }
    }
    return estados[estado as keyof typeof estados] || estados.programado
  }

  const TarjetaEquipo = ({ equipo }: { equipo: EquipoMedico }) => {
    const estado = obtenerEstadoEquipo(equipo.estado)
    const EstadoIcono = estado.icono
    const proximaCalibracion = calibracionesSimuladas.find(c => c.equipoId === equipo.id)

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{equipo.nombre}</h3>
            <p className="text-sm text-gray-600">
              {equipo.marca} {equipo.modelo} - {equipo.codigo}
            </p>
            <p className="text-xs text-gray-500 mt-1">Serie: {equipo.numeroSerie}</p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estado.color}`}>
            <EstadoIcono size={12} className="mr-1" />
            {estado.texto}
          </span>
        </div>

        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500">Ubicación:</span>
              <p className="font-medium">{equipo.ubicacion}</p>
            </div>
            <div>
              <span className="text-gray-500">Responsable:</span>
              <p className="font-medium">{equipo.responsable || 'Sin asignar'}</p>
            </div>
            <div>
              <span className="text-gray-500">Fecha Compra:</span>
              <p className="font-medium">{new Date(equipo.fechaCompra).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-gray-500">Valor:</span>
              <p className="font-medium">${equipo.costoAdquisicion.toLocaleString()}</p>
            </div>
          </div>

          {proximaCalibracion && (
            <div className="bg-gray-50 rounded-md p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Próxima Calibración:</span>
                <span className={`text-xs font-medium ${
                  new Date(proximaCalibracion.fechaProximaCalibracion) < new Date() ? 'text-danger' :
                  Math.ceil((new Date(proximaCalibracion.fechaProximaCalibracion).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) <= 30 ? 'text-warning' :
                  'text-success'
                }`}>
                  {new Date(proximaCalibracion.fechaProximaCalibracion).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setEquipoSeleccionado(equipo)
                setMostrarFormularioMantenimiento(true)
              }}
              className="px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-md transition-colors flex items-center space-x-1"
            >
              <Plus size={14} />
              <span>Mantenimiento</span>
            </button>
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors flex items-center space-x-1">
              <Eye size={14} />
              <span>Detalles</span>
            </button>
          </div>
          <div className="flex items-center space-x-1">
            <Activity className={`h-4 w-4 ${
              equipo.estado === 'activo' ? 'text-success' : 'text-gray-400'
            }`} />
            <span className="text-xs text-gray-500">
              {equipo.estado === 'activo' ? 'Operativo' : 'Inactivo'}
            </span>
          </div>
        </div>
      </motion.div>
    )
  }

  const TarjetaMantenimiento = ({ mantenimiento }: { mantenimiento: MantenimientoEquipo }) => {
    const estado = obtenerEstadoMantenimiento(mantenimiento.estado)
    const EstadoIcono = estado.icono
    const equipo = equipos.find(e => e.id === mantenimiento.equipoId)

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {mantenimiento.tipo === 'preventivo' ? 'Mantenimiento Preventivo' : 'Mantenimiento Correctivo'}
            </h3>
            <p className="text-sm text-gray-600">
              Equipo: {equipo?.nombre}
            </p>
            <p className="text-xs text-gray-500">{equipo?.codigo}</p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estado.color}`}>
            <EstadoIcono size={12} className="mr-1" />
            {estado.texto}
          </span>
        </div>

        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500">Fecha Programada:</span>
              <p className="font-medium">{new Date(mantenimiento.fechaProgramada).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-gray-500">Ejecutado:</span>
              <p className="font-medium">
                {mantenimiento.fechaEjecutada ? new Date(mantenimiento.fechaEjecutada).toLocaleDateString() : 'Pendiente'}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Técnico:</span>
              <p className="font-medium">{mantenimiento.tecnico}</p>
            </div>
            <div>
              <span className="text-gray-500">Costo:</span>
              <p className="font-medium">${mantenimiento.costo?.toFixed(2) || 'N/A'}</p>
            </div>
          </div>

          <div>
            <span className="text-gray-500">Descripción:</span>
            <p className="text-gray-900 mt-1">{mantenimiento.descripcion}</p>
          </div>

          {mantenimiento.observaciones && (
            <div className="bg-gray-50 rounded-md p-3">
              <span className="text-gray-500 text-xs">Observaciones:</span>
              <p className="text-sm text-gray-700 mt-1">{mantenimiento.observaciones}</p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-2">
          {mantenimiento.estado === 'programado' && (
            <>
              <button className="px-3 py-1.5 text-sm text-success hover:bg-success/10 rounded-md transition-colors flex items-center space-x-1">
                <Play size={14} />
                <span>Iniciar</span>
              </button>
              <button className="px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-md transition-colors flex items-center space-x-1">
                <Edit size={14} />
                <span>Editar</span>
              </button>
            </>
          )}
          {mantenimiento.estado === 'en_proceso' && (
            <button className="px-3 py-1.5 text-sm text-success hover:bg-success/10 rounded-md transition-colors flex items-center space-x-1">
              <CheckCircle size={14} />
              <span>Completar</span>
            </button>
          )}
        </div>
      </motion.div>
    )
  }

  const FormularioMantenimiento = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Programar Mantenimiento
          </h2>
          <p className="text-gray-600 mt-1">
            {equipoSeleccionado?.nombre} - {equipoSeleccionado?.codigo}
          </p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Mantenimiento</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                <option value="preventivo">Preventivo</option>
                <option value="correctivo">Correctivo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Programada</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción del Trabajo</label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Descripción detallada del mantenimiento a realizar..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Técnico Responsable</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Nombre del técnico"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Costo Estimado</label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Notas adicionales..."
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={() => {
              setMostrarFormularioMantenimiento(false)
              setEquipoSeleccionado(null)
            }}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={async () => {
              if (equipoSeleccionado) {
                await programarMantenimiento(equipoSeleccionado.id, new Date(), 'Mantenimiento programado')
              }
              setMostrarFormularioMantenimiento(false)
              setEquipoSeleccionado(null)
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Programar Mantenimiento
          </button>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Equipos Médicos</h2>
          <p className="text-gray-600 mt-1">Control de equipos, mantenimiento y calibración</p>
        </div>
      </div>

      {/* Navegación de vistas */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'equipos', label: 'Equipos', icon: Settings },
          { id: 'mantenimiento', label: 'Mantenimiento', icon: Wrench },
          { id: 'calibracion', label: 'Calibración', icon: Gauge }
        ].map(vista => (
          <button
            key={vista.id}
            onClick={() => setVistaActual(vista.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              vistaActual === vista.id
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <vista.icon size={16} />
            <span>{vista.label}</span>
          </button>
        ))}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Equipos</p>
              <p className="text-2xl font-bold text-gray-900">{equipos.length}</p>
            </div>
            <Settings className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-success">
                {equipos.filter(e => e.estado === 'activo').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Mantenimiento</p>
              <p className="text-2xl font-bold text-warning">
                {equipos.filter(e => e.estado === 'mantenimiento').length}
              </p>
            </div>
            <Wrench className="h-8 w-8 text-warning" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Próximos</p>
              <p className="text-2xl font-bold text-secondary">
                {mantenimientosSimulados.filter(m => 
                  m.estado === 'programado' && 
                  new Date(m.fechaProgramada) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                ).length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-secondary" />
          </div>
        </div>
      </div>

      {/* Contenido según la vista */}
      {vistaActual === 'equipos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipos.map(equipo => (
            <TarjetaEquipo key={equipo.id} equipo={equipo} />
          ))}
        </div>
      )}

      {vistaActual === 'mantenimiento' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Programación de Mantenimiento</h3>
            <button
              onClick={() => {
                if (equipos.length > 0) {
                  setEquipoSeleccionado(equipos[0])
                  setMostrarFormularioMantenimiento(true)
                }
              }}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Programar Mantenimiento</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mantenimientosSimulados.map(mantenimiento => (
              <TarjetaMantenimiento key={mantenimiento.id} mantenimiento={mantenimiento} />
            ))}
          </div>
        </div>
      )}

      {vistaActual === 'calibracion' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificados de Calibración</h3>
          <div className="space-y-4">
            {calibracionesSimuladas.map(calibracion => {
              const equipo = equipos.find(e => e.id === calibracion.equipoId)
              return (
                <div key={calibracion.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{equipo?.nombre}</h4>
                      <p className="text-sm text-gray-600">{equipo?.codigo}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      calibracion.resultado === 'aprobado' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                    }`}>
                      {calibracion.resultado === 'aprobado' ? 'Aprobado' : 'Rechazado'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Fecha Calibración:</span>
                      <p className="font-medium">{new Date(calibracion.fechaCalibracion).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Próxima:</span>
                      <p className="font-medium">{new Date(calibracion.fechaProximaCalibracion).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Certificado:</span>
                      <p className="font-medium">{calibracion.certificado}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">{calibracion.observaciones}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      {mostrarFormularioMantenimiento && <FormularioMantenimiento />}
    </div>
  )
}
