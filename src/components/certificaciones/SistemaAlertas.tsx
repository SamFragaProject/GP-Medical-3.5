// Sistema de Alertas para Certificaciones
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  Clock,
  AlertTriangle,
  CheckCircle,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  User,
  Building,
  FileText,
  Settings,
  Eye,
  Send,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  Filter,
  Search
} from 'lucide-react'
import { AlertaCertificacion, EstadoCertificacion } from '@/types/certificacion'

interface SistemaAlertasProps {
  alertas: AlertaCertificacion[]
  onCrearAlerta: (alerta: Partial<AlertaCertificacion>) => Promise<void>
  onEnviarNotificacion: (alertaId: string, tipo: 'email' | 'sms') => Promise<void>
  onActualizarAlerta: (id: string, datos: Partial<AlertaCertificacion>) => Promise<void>
  onEliminarAlerta: (id: string) => Promise<void>
}

interface ConfiguracionAlerta {
  tipo: 'vencimiento' | 'anulacion' | 'suspension' | 'renovacion'
  diasAntes: number
  destino: 'empresa' | 'empleado' | 'ambos'
  canal: 'email' | 'sms' | 'ambos'
  mensajePersonalizado: string
  activa: boolean
}

export function SistemaAlertas({
  alertas,
  onCrearAlerta,
  onEnviarNotificacion,
  onActualizarAlerta,
  onEliminarAlerta
}: SistemaAlertasProps) {
  const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false)
  const [mostrarNuevaAlerta, setMostrarNuevaAlerta] = useState(false)
  const [alertaSeleccionada, setAlertaSeleccionada] = useState<AlertaCertificacion | null>(null)
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [nuevaAlerta, setNuevaAlerta] = useState<ConfiguracionAlerta>({
    tipo: 'vencimiento',
    diasAntes: 30,
    destino: 'empresa',
    canal: 'email',
    mensajePersonalizado: '',
    activa: true
  })

  const estadisticas = {
    total: alertas.length,
    pendientes: alertas.filter(a => !a.enviada).length,
    enviadas: alertas.filter(a => a.enviada).length,
    empresasNotificadas: alertas.filter(a => a.empresaNotificada).length
  }

  const alertasFiltradas = alertas.filter(alerta => {
    const cumpleTipo = !filtroTipo || alerta.tipo === filtroTipo
    const cumpleEstado = !filtroEstado || (filtroEstado === 'enviada' ? alerta.enviada : !alerta.enviada)
    const cumpleBusqueda = !busqueda || alerta.mensaje.toLowerCase().includes(busqueda.toLowerCase())
    return cumpleTipo && cumpleEstado && cumpleBusqueda
  })

  const tiposAlerta = [
    { id: 'vencimiento', nombre: 'Vencimiento', icono: Clock, color: 'warning' },
    { id: 'anulacion', nombre: 'Anulación', icono: AlertTriangle, color: 'danger' },
    { id: 'suspension', nombre: 'Suspensión', icono: AlertTriangle, color: 'warning' },
    { id: 'renovacion', nombre: 'Renovación', icono: RefreshCw, color: 'primary' }
  ]

  const enviarNotificacion = async (alerta: AlertaCertificacion, tipo: 'email' | 'sms') => {
    await onEnviarNotificacion(alerta.id, tipo)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Sistema de Alertas</h2>
              <p className="text-gray-600">Gestión de notificaciones automáticas</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMostrarConfiguracion(!mostrarConfiguracion)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings size={16} />
              <span>Configuración</span>
            </button>
            <button
              onClick={() => setMostrarNuevaAlerta(!mostrarNuevaAlerta)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus size={16} />
              <span>Nueva Alerta</span>
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Alertas</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
            </div>
            <Bell className="h-6 w-6 text-gray-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-warning">{estadisticas.pendientes}</p>
            </div>
            <Clock className="h-6 w-6 text-warning" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Enviadas</p>
              <p className="text-2xl font-bold text-success">{estadisticas.enviadas}</p>
            </div>
            <CheckCircle className="h-6 w-6 text-success" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Empresas Notificadas</p>
              <p className="text-2xl font-bold text-primary">{estadisticas.empresasNotificadas}</p>
            </div>
            <Building className="h-6 w-6 text-primary" />
          </div>
        </motion.div>
      </div>

      {/* Panel de Configuración */}
      {mostrarConfiguracion && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Configuración Global de Alertas</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Alertas Automáticas</h4>
              
              {tiposAlerta.map(tipo => (
                <div key={tipo.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <tipo.icono className={`h-5 w-5 text-${tipo.color}`} />
                    <span className="text-sm font-medium text-gray-900">{tipo.nombre}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Configuración de Canales</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-gray-900">Notificaciones por Email</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      defaultValue={30}
                      className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-600">días antes</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-900">Notificaciones por SMS</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      defaultValue={7}
                      className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-600">días antes</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors">
                  Guardar Configuración
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Nueva Alerta */}
      {mostrarNuevaAlerta && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Crear Nueva Alerta</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Alerta
                </label>
                <select
                  value={nuevaAlerta.tipo}
                  onChange={(e) => setNuevaAlerta({...nuevaAlerta, tipo: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {tiposAlerta.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destinatarios
                </label>
                <select
                  value={nuevaAlerta.destino}
                  onChange={(e) => setNuevaAlerta({...nuevaAlerta, destino: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="empresa">Solo Empresa</option>
                  <option value="empleado">Solo Empleado</option>
                  <option value="ambos">Ambos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canal de Notificación
                </label>
                <select
                  value={nuevaAlerta.canal}
                  onChange={(e) => setNuevaAlerta({...nuevaAlerta, canal: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="ambos">Ambos</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje Personalizado
                </label>
                <textarea
                  rows={6}
                  value={nuevaAlerta.mensajePersonalizado}
                  onChange={(e) => setNuevaAlerta({...nuevaAlerta, mensajePersonalizado: e.target.value})}
                  placeholder="Escriba su mensaje personalizado..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Alerta Activa
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nuevaAlerta.activa}
                    onChange={(e) => setNuevaAlerta({...nuevaAlerta, activa: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => setMostrarNuevaAlerta(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => onCrearAlerta(nuevaAlerta)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Crear Alerta
            </button>
          </div>
        </motion.div>
      )}

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar alertas..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Todos los tipos</option>
              {tiposAlerta.map(tipo => (
                <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
              ))}
            </select>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="enviada">Enviada</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-600">
            {alertasFiltradas.length} alertas encontradas
          </div>
        </div>
      </div>

      {/* Lista de Alertas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alerta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Programada
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destinatarios
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {alertasFiltradas.map((alerta) => {
                const tipoInfo = tiposAlerta.find(t => t.id === alerta.tipo)
                return (
                  <tr key={alerta.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          alerta.tipo === 'vencimiento' ? 'bg-warning/10' :
                          alerta.tipo === 'anulacion' ? 'bg-danger/10' :
                          'bg-primary/10'
                        }`}>
                          {tipoInfo?.icono && <tipoInfo.icono className={`h-4 w-4 ${
                            alerta.tipo === 'vencimiento' ? 'text-warning' :
                            alerta.tipo === 'anulacion' ? 'text-danger' :
                            'text-primary'
                          }`} />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {alerta.tipo}
                          </p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {alerta.mensaje}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(alerta.fechaAlerta).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span>{alerta.destinatarios.length}</span>
                        <span className="text-gray-500">destinatarios</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          alerta.enviada ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                        }`}>
                          {alerta.enviada ? 'Enviada' : 'Pendiente'}
                        </span>
                        {alerta.empresaNotificada && (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                            Empresa Notificada
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setAlertaSeleccionada(alerta)}
                          className="text-primary hover:text-primary/80"
                          title="Ver detalles"
                        >
                          <Eye size={16} />
                        </button>
                        {!alerta.enviada && (
                          <button
                            onClick={() => enviarNotificacion(alerta, 'email')}
                            className="text-blue-600 hover:text-blue-800"
                            title="Enviar email"
                          >
                            <Mail size={16} />
                          </button>
                        )}
                        {!alerta.enviada && (
                          <button
                            onClick={() => enviarNotificacion(alerta, 'sms')}
                            className="text-green-600 hover:text-green-800"
                            title="Enviar SMS"
                          >
                            <Phone size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => onEliminarAlerta(alerta.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {alertasFiltradas.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-gray-900">No se encontraron alertas</h3>
            <p className="text-sm text-gray-500 mt-1">
              {busqueda || filtroTipo || filtroEstado ? 
                'No hay alertas que coincidan con los filtros aplicados' : 
                'Crea tu primera alerta para comenzar'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
