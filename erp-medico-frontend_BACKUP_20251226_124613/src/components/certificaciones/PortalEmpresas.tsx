// Portal para Empresas - Acceso seguro para empresas
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building,
  Lock,
  Key,
  Eye,
  Download,
  Search,
  Filter,
  Calendar,
  User,
  Mail,
  Phone,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  QrCode,
  Shield,
  Share2,
  ExternalLink,
  Copy,
  RefreshCw
} from 'lucide-react'
import { Empresa, Paciente, Certificacion } from '@/types/certificacion'

interface PortalEmpresasProps {
  empresa: Empresa
  pacientes: Paciente[]
  certificaciones: Certificacion[]
  onTokenGenerate: (empresaId: string) => void
  onTokenRefresh: (empresaId: string) => void
}

export function PortalEmpresas({ 
  empresa, 
  pacientes, 
  certificaciones, 
  onTokenGenerate,
  onTokenRefresh 
}: PortalEmpresasProps) {
  const [token, setToken] = useState('emp_' + empresa.id + '_token_12345')
  const [urlAcceso, setUrlAcceso] = useState(`https://portal.medicalflow.com/empresa/${empresa.id}?token=${token}`)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [mostrarToken, setMostrarToken] = useState(false)

  // Filtrar certificaciones de la empresa
  const certificacionesEmpresa = certificaciones.filter(c => c.empresaId === empresa.id)

  const certificacionesFiltradas = certificacionesEmpresa.filter(cert => {
    const paciente = pacientes.find(p => p.id === cert.pacienteId)
    const cumpleBusqueda = !busqueda || 
      paciente?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      paciente?.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
      cert.numeroCertificado.toLowerCase().includes(busqueda.toLowerCase())
    
    const cumpleFiltro = !filtroEstado || cert.estado === filtroEstado
    
    return cumpleBusqueda && cumpleFiltro
  })

  const copiarToken = () => {
    navigator.clipboard.writeText(token)
    // Mostrar notificación de éxito
  }

  const abrirPortal = () => {
    window.open(urlAcceso, '_blank')
  }

  const compartirURL = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Portal Médico - Certificaciones',
        text: 'Acceso al portal de certificaciones médicas',
        url: urlAcceso
      })
    } else {
      navigator.clipboard.writeText(urlAcceso)
      // Mostrar notificación
    }
  }

  const estadisticas = {
    total: certificacionesEmpresa.length,
    vigentes: certificacionesEmpresa.filter(c => c.estado === 'vigente').length,
    vencidos: certificacionesEmpresa.filter(c => c.estado === 'vencido').length,
    proximosVencer: certificacionesEmpresa.filter(c => {
      const fechaVenc = new Date(c.fechaVencimiento)
      const en30Dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      return fechaVenc <= en30Dias && fechaVenc > new Date()
    }).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Building className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{empresa.nombre}</h2>
              <p className="text-gray-600">{empresa.razonSocial}</p>
              <p className="text-sm text-gray-500">RFC: {empresa.rfc}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm text-gray-600">Portal Activo</p>
              <p className="text-lg font-semibold text-success">Conectado</p>
            </div>
            <div className="bg-success/10 p-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
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
              <p className="text-sm font-medium text-gray-600">Total Certificados</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
            </div>
            <FileText className="h-6 w-6 text-primary" />
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
              <p className="text-sm font-medium text-gray-600">Vigentes</p>
              <p className="text-2xl font-bold text-success">{estadisticas.vigentes}</p>
            </div>
            <CheckCircle className="h-6 w-6 text-success" />
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
              <p className="text-sm font-medium text-gray-600">Próximos a Vencer</p>
              <p className="text-2xl font-bold text-warning">{estadisticas.proximosVencer}</p>
            </div>
            <Clock className="h-6 w-6 text-warning" />
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
              <p className="text-sm font-medium text-gray-600">Vencidos</p>
              <p className="text-2xl font-bold text-danger">{estadisticas.vencidos}</p>
            </div>
            <AlertTriangle className="h-6 w-6 text-danger" />
          </div>
        </motion.div>
      </div>

      {/* Configuración del Portal */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Lock className="h-5 w-5" />
              <span>Configuración de Acceso</span>
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              Gestiona el acceso seguro al portal para tu empresa
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onTokenRefresh(empresa.id)}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <RefreshCw size={16} />
              <span>Renovar Token</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Token de Acceso */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token de Acceso
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type={mostrarToken ? "text" : "password"}
                  value={token}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                />
                <button
                  onClick={() => setMostrarToken(!mostrarToken)}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={copiarToken}
                  className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL del Portal
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={urlAcceso}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={compartirURL}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Share2 size={16} />
                </button>
                <button
                  onClick={abrirPortal}
                  className="px-3 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors"
                >
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Permisos y Configuración */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permisos del Portal
              </label>
              <div className="space-y-2">
                {[
                  { name: 'Ver certificados vigentes', enabled: true },
                  { name: 'Descargar PDFs', enabled: true },
                  { name: 'Ver historial médico', enabled: false },
                  { name: 'Recibir alertas automáticas', enabled: true },
                  { name: 'Exportar reportes', enabled: true }
                ].map((permiso, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{permiso.name}</span>
                    <div className={`w-10 h-6 rounded-full transition-colors ${
                      permiso.enabled ? 'bg-success' : 'bg-gray-300'
                    }`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        permiso.enabled ? 'translate-x-5' : 'translate-x-1'
                      } mt-1`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Configuración de Alertas
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="30">30 días antes del vencimiento</option>
                <option value="15">15 días antes del vencimiento</option>
                <option value="7">7 días antes del vencimiento</option>
                <option value="1">1 día antes del vencimiento</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Certificaciones */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Certificaciones de Empleados</h3>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar empleado..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Todos los estados</option>
                <option value="vigente">Vigente</option>
                <option value="vencido">Vencido</option>
                <option value="suspendido">Suspendido</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Puesto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certificado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
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
              {certificacionesFiltradas.map((cert) => {
                const paciente = pacientes.find(p => p.id === cert.pacienteId)
                return (
                  <tr key={cert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {paciente?.nombre} {paciente?.apellidos}
                          </div>
                          <div className="text-sm text-gray-500">{cert.numeroCertificado}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{paciente?.puestoTrabajo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Aptitud Laboral</div>
                      <div className="text-sm text-gray-500">Examen General</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        cert.estado === 'vigente' ? 'bg-success/10 text-success' :
                        cert.estado === 'vencido' ? 'bg-danger/10 text-danger' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {cert.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(cert.fechaVencimiento).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          className="text-primary hover:text-primary/80"
                          title="Ver certificado"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="text-success hover:text-success/80"
                          title="Descargar PDF"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-800"
                          title="QR Code"
                        >
                          <QrCode size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {certificacionesFiltradas.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-gray-900">No se encontraron certificaciones</h3>
            <p className="text-sm text-gray-500 mt-1">
              No hay certificaciones que coincidan con los filtros aplicados
            </p>
          </div>
        )}
      </div>
    </div>
  )
}