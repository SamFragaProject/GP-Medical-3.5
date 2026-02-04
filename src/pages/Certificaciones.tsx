// Página principal del módulo de Certificaciones Médicas
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  Users,
  Building,
  Calendar,
  Bell,
  Settings,
  Send,
  FileSignature,
  Download as DownloadIcon,
  Share2,
  Lock,
  Star,
  BarChart3,
  RefreshCw,
  Mail,
  Phone,
  Printer,
  QrCode,
  Archive,
  AlertCircle
} from 'lucide-react'
import { useCertificaciones } from '@/hooks/useCertificaciones'
import { EstadoCertificacion, TipoAlerta } from '@/types/certificacion'
import { PortalEmpresas } from '@/components/certificaciones/PortalEmpresas'
import { SistemaFirmaDigital } from '@/components/certificaciones/SistemaFirmaDigital'
import { GeneracionMasiva } from '@/components/certificaciones/GeneracionMasiva'
import { SistemaAlertas } from '@/components/certificaciones/SistemaAlertas'
import { PlantillasCertificado } from '@/components/certificaciones/PlantillasCertificado'
import { PremiumHeader } from '@/components/ui/PremiumHeader'
import { PremiumMetricCard } from '@/components/ui/PremiumMetricCard'
import { PremiumButton } from '@/components/ui/PremiumButton'

interface TabProps {
  active: string
  onChange: (tab: string) => void
}

function Tabs({ active, onChange }: TabProps) {
  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'nueva', name: 'Nueva Certificación', icon: Plus },
    { id: 'lista', name: 'Certificaciones', icon: FileText },
    { id: 'portal', name: 'Portal Empresas', icon: Building },
    { id: 'firmas', name: 'Firmas Digitales', icon: FileSignature },
    { id: 'alertas', name: 'Alertas', icon: Bell },
    { id: 'generacion', name: 'Generación Masiva', icon: Download },
    { id: 'plantillas', name: 'Plantillas', icon: Settings }
  ]

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex space-x-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`py-4 px-3 border-b-2 font-bold text-sm whitespace-nowrap flex items-center space-x-2 transition-all duration-300 rounded-t-xl ${active === tab.id
              ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50 shadow-[inset_0_-2px_0_0_#10b981]'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
          >
            <tab.icon size={16} />
            <span>{tab.name}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

export function Certificaciones() {
  const [tabActiva, setTabActiva] = useState('dashboard')
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [certificacionSeleccionada, setCertificacionSeleccionada] = useState<any>(null)
  const [mostrarModal, setMostrarModal] = useState(false)

  const {
    certificaciones,
    pacientes,
    empresas,
    tiposCertificado,
    alertas,
    loading,
    filtros,
    busqueda,
    setFiltros,
    setBusqueda,
    crearCertificacion,
    actualizarCertificacion,
    anularCertificacion,
    generarCertificadoPDF,
    enviarFirmaDigital,
    generarCertificadosMasivos,
    enviarNotificacionVencimiento,
    aplicarFiltros
  } = useCertificaciones()

  const certificadosFiltrados = aplicarFiltros()

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header Premium */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <PremiumHeader
          title="Certificaciones Médicas"
          subtitle="Gestión completa de certificaciones laborales"
          gradient={true}
          badges={[
            { text: "Sistema Activo", variant: "success", icon: <FileText size={14} /> }
          ]}
        />
        <div className="flex items-center space-x-3">
          <PremiumButton
            variant="primary"
            gradient={true}
            animated={true}
            icon={<Plus size={16} />}
            onClick={() => setTabActiva('nueva')}
          >
            Nueva Certificación
          </PremiumButton>
          <button
            onClick={() => setTabActiva('generacion')}
            className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl hover:bg-slate-50 transition-all duration-300 flex items-center space-x-2 shadow-sm hover:shadow-md active:scale-95 font-bold"
          >
            <Download size={18} />
            <span>Generación Masiva</span>
          </button>
        </div>
      </div>

      {/* Métricas principales - Premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PremiumMetricCard
          title="Total Certificados"
          value={certificaciones.length}
          subtitle="vs mes anterior"
          icon={FileText}
          gradient="blue"
          trend={{ value: 12, isPositive: true }}
        />

        <PremiumMetricCard
          title="Vigentes"
          value={certificaciones.filter(c => c.estado === 'vigente').length}
          subtitle="sin vencimientos"
          icon={CheckCircle}
          gradient="emerald"
        />

        <PremiumMetricCard
          title="Próximos a Vencer"
          value={certificaciones.filter(c => {
            const fechaVenc = new Date(c.fechaVencimiento)
            const en30Dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            return fechaVenc <= en30Dias && fechaVenc > new Date()
          }).length}
          subtitle="30 días"
          icon={Clock}
          gradient="amber"
        />

        <PremiumMetricCard
          title="Empresas Activas"
          value={empresas.length}
          subtitle="al sistema"
          icon={Building}
          gradient="purple"
        />
      </div>

      {/* Gráfico y tabla resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de certificaciones por estado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificaciones por Estado</h3>
          <div className="space-y-4">
            {Object.entries({
              vigentes: certificaciones.filter(c => c.estado === 'vigente').length,
              vencidos: certificaciones.filter(c => c.estado === 'vencido').length,
              suspendidos: certificaciones.filter(c => c.estado === 'suspendido').length,
              anulados: certificaciones.filter(c => c.estado === 'anulado').length
            }).map(([estado, cantidad]) => (
              <div key={estado} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${estado === 'vigentes' ? 'bg-success' :
                    estado === 'vencidos' ? 'bg-danger' :
                      estado === 'suspendidos' ? 'bg-warning' : 'bg-gray-400'
                    }`}></div>
                  <span className="text-sm text-gray-700 capitalize">{estado}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{cantidad}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Últimas certificaciones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Últimas Certificaciones</h3>
            <button
              onClick={() => setTabActiva('lista')}
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              Ver todas
            </button>
          </div>
          <div className="space-y-3">
            {certificaciones.slice(0, 5).map((cert) => {
              const paciente = pacientes.find(p => p.id === cert.pacienteId)
              return (
                <div key={cert.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {paciente?.nombre} {paciente?.apellidos}
                    </p>
                    <p className="text-xs text-gray-500">{cert.numeroCertificado}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${cert.estado === 'vigente' ? 'bg-success/10 text-success' :
                      cert.estado === 'vencido' ? 'bg-danger/10 text-danger' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                      {cert.estado}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(cert.fechaEmision).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Alertas recientes */}
      {alertas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Alertas Recientes</h3>
            <button
              onClick={() => setTabActiva('alertas')}
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              Ver todas
            </button>
          </div>
          <div className="space-y-3">
            {alertas.slice(0, 3).map((alerta) => (
              <div key={alerta.id} className="flex items-center space-x-3 p-3 bg-warning/5 border border-warning/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-warning flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{alerta.mensaje}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(alerta.fechaAlerta).toLocaleDateString()}
                  </p>
                </div>
                <button className="text-primary hover:text-primary/80 text-xs font-medium">
                  Gestionar
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )

  const renderNuevaCertificacion = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Nueva Certificación Médica</h2>
          <p className="text-gray-600 text-sm mt-1">Crear una nueva certificación médica</p>
        </div>

        <div className="p-6">
          <form className="space-y-6">
            {/* Información del paciente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paciente *
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                  <option value="">Seleccionar paciente</option>
                  {pacientes.map(paciente => (
                    <option key={paciente.id} value={paciente.id}>
                      {paciente.nombre} {paciente.apellidos} - {paciente.puestoTrabajo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Certificado *
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                  <option value="">Seleccionar tipo</option>
                  {tiposCertificado.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre} - {tipo.descripcion}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Información médica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Información Médica</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ¿Apto para el trabajo? *
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option value="">Seleccionar</option>
                    <option value="true">Sí, apto para el trabajo</option>
                    <option value="false">No apto para el trabajo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Médico Responsable *
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option value="">Seleccionar médico</option>
                    <option value="med_1">Dr. Roberto Méndez</option>
                    <option value="med_2">Dra. Ana García</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restricciones (opcional)
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Describir restricciones médicas..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recomendaciones
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Recomendaciones médicas..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones Médicas
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Observaciones adicionales del médico..."
                />
              </div>
            </div>

            {/* Configuración del certificado */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Configuración</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visible para la empresa
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de vencimiento
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notificar vencimiento
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option value="30">30 días antes</option>
                    <option value="15">15 días antes</option>
                    <option value="7">7 días antes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
              >
                <FileSignature size={16} />
                <span>Crear Certificación</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )

  const renderListaCertificaciones = () => (
    <div className="space-y-6">
      {/* Header con búsqueda y filtros */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Lista de Certificaciones</h2>
          <p className="text-gray-600 text-sm mt-1">
            {certificadosFiltrados.length} certificaciones encontradas
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl hover:bg-slate-50 transition-all flex items-center space-x-2 font-bold shadow-sm active:scale-95"
          >
            <Filter size={18} />
            <span>Filtros</span>
          </button>
          <button className="btn-premium px-6 py-2.5 flex items-center space-x-2">
            <Plus size={18} />
            <span>Nueva Certificación</span>
          </button>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por paciente, número de certificado..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={filtros.empresa}
              onChange={(e) => setFiltros({ ...filtros, empresa: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Todas las empresas</option>
              {empresas.map(empresa => (
                <option key={empresa.id} value={empresa.id}>{empresa.nombre}</option>
              ))}
            </select>

            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="vigente">Vigente</option>
              <option value="vencido">Vencido</option>
              <option value="suspendido">Suspendido</option>
              <option value="anulado">Anulado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de certificaciones */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente / Certificado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Emisión
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vencimiento
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {certificadosFiltrados.map((cert) => {
                const paciente = pacientes.find(p => p.id === cert.pacienteId)
                const empresa = empresas.find(e => e.id === cert.empresaId)
                const tipo = tiposCertificado.find(t => t.id === cert.tipoCertificadoId)

                return (
                  <tr key={cert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {paciente?.nombre} {paciente?.apellidos}
                        </div>
                        <div className="text-sm text-gray-500">{cert.numeroCertificado}</div>
                        <div className="text-xs text-gray-400">{tipo?.nombre}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{empresa?.nombre}</div>
                      <div className="text-sm text-gray-500">{paciente?.puestoTrabajo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${cert.estado === 'vigente' ? 'bg-success/10 text-success' :
                        cert.estado === 'vencido' ? 'bg-danger/10 text-danger' :
                          cert.estado === 'suspendido' ? 'bg-warning/10 text-warning' :
                            'bg-gray-100 text-gray-600'
                        }`}>
                        {cert.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(cert.fechaEmision).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(cert.fechaVencimiento).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setCertificacionSeleccionada(cert)
                            setMostrarModal(true)
                          }}
                          className="text-primary hover:text-primary/80"
                          title="Ver detalles"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => generarCertificadoPDF(cert.id)}
                          className="text-success hover:text-success/80"
                          title="Descargar PDF"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => enviarFirmaDigital(cert.id, cert.medicoFirma)}
                          className="text-warning hover:text-warning/80"
                          title="Enviar firma"
                        >
                          <FileSignature size={16} />
                        </button>
                        <button
                          onClick={() => setTabActiva('portal')}
                          className="text-primary hover:text-primary/80"
                          title="Portal empresa"
                        >
                          <Share2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {certificadosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-gray-900">No se encontraron certificaciones</h3>
            <p className="text-sm text-gray-500 mt-1">
              Intenta ajustar los filtros o crear una nueva certificación
            </p>
          </div>
        )}
      </div>
    </div>
  )

  const renderTabsContent = () => {
    switch (tabActiva) {
      case 'dashboard':
        return renderDashboard()
      case 'nueva':
        return renderNuevaCertificacion()
      case 'lista':
        return renderListaCertificaciones()
      case 'portal':
        return empresas.length > 0 ? (
          <PortalEmpresas
            empresa={empresas[0]}
            pacientes={pacientes}
            certificaciones={certificaciones}
            onTokenGenerate={(empresaId) => {
              // Implementar generación de token
              console.log('Generando token para:', empresaId)
            }}
            onTokenRefresh={(empresaId) => {
              // Implementar renovación de token
              console.log('Renovando token para:', empresaId)
            }}
          />
        ) : (
          <div className="text-center py-16">
            <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Portal para Empresas</h3>
            <p className="text-gray-600 mb-6">
              Configure empresas primero para acceder al portal
            </p>
          </div>
        )
      case 'firmas':
        return (
          <SistemaFirmaDigital
            onFirmaEnviar={async (datos) => {
              await enviarFirmaDigital(datos.certificadoId, datos.medico)
            }}
            medicoActual={{
              id: 'med_1',
              nombre: 'Roberto',
              apellidos: 'Méndez',
              cedulaProfesional: '1234567',
              especialidad: 'Medicina del Trabajo',
              certificacionFirmas: 'active'
            }}
            certificadosPendientes={certificaciones.slice(0, 5).map(c => ({
              id: c.id,
              numeroCertificado: c.numeroCertificado,
              paciente: pacientes.find(p => p.id === c.pacienteId)?.nombre + ' ' + pacientes.find(p => p.id === c.pacienteId)?.apellidos,
              fechaEmision: c.fechaEmision
            }))}
          />
        )
      case 'alertas':
        return (
          <SistemaAlertas
            alertas={alertas}
            onCrearAlerta={async (alerta) => {
              console.log('Crear alerta:', alerta)
              // Implementar creación de alerta
            }}
            onEnviarNotificacion={async (alertaId, tipo) => {
              console.log('Enviar notificación:', alertaId, tipo)
              // Implementar envío de notificación
            }}
            onActualizarAlerta={async (id, datos) => {
              console.log('Actualizar alerta:', id, datos)
              // Implementar actualización de alerta
            }}
            onEliminarAlerta={async (id) => {
              console.log('Eliminar alerta:', id)
              // Implementar eliminación de alerta
            }}
          />
        )
      case 'generacion':
        return (
          <GeneracionMasiva
            empresas={empresas}
            pacientes={pacientes}
            tiposCertificado={tiposCertificado}
            onGenerar={async (configuracion) => {
              await generarCertificadosMasivos(configuracion.empresaId, configuracion.tipoCertificadoId, configuracion.filtros)
            }}
          />
        )
      case 'plantillas':
        return (
          <PlantillasCertificado
            plantillas={[]}
            empresas={empresas}
            tiposCertificado={tiposCertificado}
            onCrearPlantilla={async (plantilla) => {
              console.log('Crear plantilla:', plantilla)
              // Implementar creación de plantilla
            }}
            onActualizarPlantilla={async (id, datos) => {
              console.log('Actualizar plantilla:', id, datos)
              // Implementar actualización de plantilla
            }}
            onEliminarPlantilla={async (id) => {
              console.log('Eliminar plantilla:', id)
              // Implementar eliminación de plantilla
            }}
            onPreviewPlantilla={(plantilla) => {
              console.log('Preview plantilla:', plantilla)
              // Implementar vista previa
            }}
            onActivarPlantilla={async (id, empresaId) => {
              console.log('Activar plantilla:', id, empresaId)
              // Implementar activación de plantilla
            }}
          />
        )
      default:
        return renderDashboard()
    }
  }

  return (
    <div className="space-y-6">
      <Tabs active={tabActiva} onChange={setTabActiva} />
      {renderTabsContent()}

      {/* Modal de detalles (placeholder) */}
      <AnimatePresence>
        {mostrarModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Detalles de Certificación</h3>
              </div>
              <div className="p-6">
                {certificacionSeleccionada && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Número de Certificado</label>
                      <p className="text-gray-900">{certificacionSeleccionada.numeroCertificado}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Estado</label>
                      <p className="text-gray-900 capitalize">{certificacionSeleccionada.estado}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Fecha de Emisión</label>
                      <p className="text-gray-900">
                        {new Date(certificacionSeleccionada.fechaEmision).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Fecha de Vencimiento</label>
                      <p className="text-gray-900">
                        {new Date(certificacionSeleccionada.fechaVencimiento).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setMostrarModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
