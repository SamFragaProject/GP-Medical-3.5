// Componente para generación de certificados médicos
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Download,
  Eye,
  FileText,
  Award,
  Calendar,
  User,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Printer,
  Mail,
  Share2,
  Star,
  Shield,
  Activity
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Certificado {
  id: string
  empleado: string
  empresa: string
  puesto: string
  tipoExamen: string
  fechaExamen: string
  resultado: 'apto' | 'apto_con_restricciones' | 'no_apto'
  restricciones?: string[]
  fechaVencimiento: string
  generadoPor: string
  numeroCertificado: string
  observaciones: string
  estado: 'vigente' | 'vencido' | 'proximamente_vencer'
}

interface CertificadoMedicoProps {
  certificado: Certificado
  onDownload?: () => void
  onEmail?: () => void
  onPrint?: () => void
}

export function CertificadoMedico({ certificado, onDownload, onEmail, onPrint }: CertificadoMedicoProps) {
  const [mostrarDetalles, setMostrarDetalles] = useState(false)

  const getResultadoColor = (resultado: string) => {
    switch (resultado) {
      case 'apto': return 'text-green-600'
      case 'apto_con_restricciones': return 'text-yellow-600'
      case 'no_apto': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getResultadoIcon = (resultado: string) => {
    switch (resultado) {
      case 'apto': return <CheckCircle className="h-5 w-5" />
      case 'apto_con_restricciones': return <AlertTriangle className="h-5 w-5" />
      case 'no_apto': return <XCircle className="h-5 w-5" />
      default: return <Clock className="h-5 w-5" />
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'vigente': return 'bg-green-100 text-green-800'
      case 'vencido': return 'bg-red-100 text-red-800'
      case 'proximamente_vencer': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const diasParaVencimiento = () => {
    const hoy = new Date()
    const vencimiento = new Date(certificado.fechaVencimiento)
    const diffTime = vencimiento.getTime() - hoy.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
    >
      {/* Header del Certificado */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-primary/10 p-3 rounded-lg">
            <Award className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Certificado Médico</h3>
            <p className="text-sm text-gray-600">#{certificado.numeroCertificado}</p>
          </div>
        </div>
        
        <span className={`px-3 py-1 text-xs rounded-full font-medium ${getEstadoColor(certificado.estado)}`}>
          {certificado.estado === 'vigente' ? 'Vigente' : 
           certificado.estado === 'vencido' ? 'Vencido' : 'Próximo a Vencer'}
        </span>
      </div>

      {/* Información del Empleado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Empleado:</span>
            <span className="text-sm text-gray-900">{certificado.empleado}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Empresa:</span>
            <span className="text-sm text-gray-900">{certificado.empresa}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Puesto:</span>
            <span className="text-sm text-gray-900">{certificado.puesto}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Fecha Examen:</span>
            <span className="text-sm text-gray-900">{certificado.fechaExamen}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Vencimiento:</span>
            <span className="text-sm text-gray-900">{certificado.fechaVencimiento}</span>
            {certificado.estado !== 'vencido' && (
              <span className="text-xs text-gray-500">
                ({diasParaVencimiento()} días)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Resultado del Examen */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">Resultado Médico</h4>
          <div className={`flex items-center space-x-1 ${getResultadoColor(certificado.resultado)}`}>
            {getResultadoIcon(certificado.resultado)}
            <span className="font-medium">
              {certificado.resultado === 'apto' ? 'APTO' : 
               certificado.resultado === 'apto_con_restricciones' ? 'APTO CON RESTRICCIONES' : 'NO APTO'}
            </span>
          </div>
        </div>

        {certificado.restricciones && certificado.restricciones.length > 0 && (
          <div className="mt-3">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Restricciones:</h5>
            <div className="space-y-1">
              {certificado.restricciones.map((restriccion, index) => (
                <div key={index} className="bg-yellow-50 border border-yellow-200 rounded px-3 py-2">
                  <span className="text-sm text-yellow-800">• {restriccion}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {certificado.observaciones && (
          <div className="mt-3">
            <h5 className="text-sm font-medium text-gray-700 mb-1">Observaciones:</h5>
            <p className="text-sm text-gray-600">{certificado.observaciones}</p>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          Generado por: {certificado.generadoPor}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMostrarDetalles(!mostrarDetalles)}
            className="text-primary hover:text-primary/80 text-sm font-medium flex items-center space-x-1"
          >
            <Eye size={16} />
            <span>Ver Detalles</span>
          </button>
          
          <button
            onClick={onDownload}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center space-x-1"
          >
            <Download size={16} />
            <span>Descargar</span>
          </button>
          
          <button
            onClick={onPrint}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center space-x-1"
          >
            <Printer size={16} />
            <span>Imprimir</span>
          </button>
          
          <button
            onClick={onEmail}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center space-x-1"
          >
            <Mail size={16} />
            <span>Enviar</span>
          </button>
        </div>
      </div>

      {/* Vista Detallada */}
      <AnimatePresence>
        {mostrarDetalles && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Vista Previa del Certificado</h4>
              
              {/* Simulación de certificado */}
              <div className="bg-white border-2 border-gray-300 rounded-lg p-6 font-serif">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">CERTIFICADO MÉDICO OCUPACIONAL</h1>
                  <div className="border-t-2 border-gray-300 mt-2"></div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-bold">Empleado:</span> {certificado.empleado}
                    </div>
                    <div>
                      <span className="font-bold">Empresa:</span> {certificado.empresa}
                    </div>
                    <div>
                      <span className="font-bold">Puesto:</span> {certificado.puesto}
                    </div>
                    <div>
                      <span className="font-bold">Fecha de Examen:</span> {certificado.fechaExamen}
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-300 pt-4">
                    <div className="text-center mb-4">
                      <span className="font-bold">RESULTADO:</span>
                      <div className={`text-xl font-bold mt-2 ${getResultadoColor(certificado.resultado)}`}>
                        {certificado.resultado === 'apto' ? 'APTO PARA TRABAJAR' : 
                         certificado.resultado === 'apto_con_restricciones' ? 'APTO CON RESTRICCIONES' : 'NO APTO PARA TRABAJAR'}
                      </div>
                    </div>
                    
                    {certificado.restricciones && certificado.restricciones.length > 0 && (
                      <div>
                        <span className="font-bold">Restricciones:</span>
                        <ul className="list-disc list-inside mt-2">
                          {certificado.restricciones.map((restriccion, index) => (
                            <li key={index}>{restriccion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-300 pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-bold">Vigencia hasta:</span> {certificado.fechaVencimiento}
                      </div>
                      <div>
                        <span className="font-bold">Certificado No.:</span> {certificado.numeroCertificado}
                      </div>
                    </div>
                    
                    <div className="mt-6 text-right">
                      <div className="inline-block border-b border-gray-400 pb-1 px-4">
                        <span className="font-bold">{certificado.generadoPor}</span><br />
                        <span className="text-sm">Médico del Trabajo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Componente principal de gestión de certificados
export function GestionCertificados() {
  const [certificados, setCertificados] = useState<Certificado[]>([
    {
      id: 'CERT001',
      empleado: 'Juan Pérez García',
      empresa: 'Constructora SA',
      puesto: 'Soldador',
      tipoExamen: 'Periódico',
      fechaExamen: '2025-10-28',
      resultado: 'apto',
      fechaVencimiento: '2026-10-28',
      generadoPor: 'Dr. Roberto Hernández',
      numeroCertificado: 'CM-2025-001',
      observaciones: 'Examen dentro de parámetros normales. Continuar con protocolo establecido.',
      estado: 'vigente'
    },
    {
      id: 'CERT002',
      empleado: 'María López Hernández',
      empresa: 'Oficinas Corporativas',
      puesto: 'Analista',
      tipoExamen: 'Ingreso',
      fechaExamen: '2025-10-25',
      resultado: 'apto_con_restricciones',
      restricciones: ['Uso obligatorio de lentes para computadora', 'Descansos cada 2 horas'],
      fechaVencimiento: '2025-12-25',
      generadoPor: 'Dra. Carmen López',
      numeroCertificado: 'CM-2025-002',
      observaciones: 'Requiere seguimiento oftalmológico en 3 meses.',
      estado: 'proximamente_vencer'
    },
    {
      id: 'CERT003',
      empleado: 'Carlos Rodríguez Silva',
      empresa: 'Fábrica Industrial',
      puesto: 'Operador de maquinaria',
      tipoExamen: 'Post-incidente',
      fechaExamen: '2025-10-20',
      resultado: 'no_apto',
      fechaVencimiento: '2025-11-20',
      generadoPor: 'Dr. Miguel Torres',
      numeroCertificado: 'CM-2025-003',
      observaciones: 'No apto para manejo de maquinaria pesada. Requiere evaluación especializada.',
      estado: 'vencido'
    }
  ])

  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'vigente' | 'vencido' | 'proximamente_vencer'>('todos')
  const [searchTerm, setSearchTerm] = useState('')

  const certificadosFiltrados = certificados.filter(cert => {
    const matchesSearch = cert.empleado.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.empresa.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEstado = filtroEstado === 'todos' || cert.estado === filtroEstado
    return matchesSearch && matchesEstado
  })

  const handleGenerarCertificado = () => {
    toast.success('Abriendo generador de certificados')
  }

  const handleDescargarCertificado = (certificado: Certificado) => {
    toast.success(`Descargando certificado ${certificado.numeroCertificado}`)
  }

  const handleEnviarCertificado = (certificado: Certificado) => {
    toast.success(`Enviando certificado ${certificado.numeroCertificado} por email`)
  }

  const handleImprimirCertificado = (certificado: Certificado) => {
    toast.success(`Imprimiendo certificado ${certificado.numeroCertificado}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Certificados Médicos</h2>
          <p className="text-gray-600">Gestión y generación de certificados ocupacionales</p>
        </div>
        
        <button 
          onClick={handleGenerarCertificado}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
        >
          <Award size={16} />
          <span>Generar Certificado</span>
        </button>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Certificados</p>
              <p className="text-2xl font-bold text-gray-900">{certificados.length}</p>
            </div>
            <Award className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-success">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vigentes</p>
              <p className="text-2xl font-bold text-success">
                {certificados.filter(c => c.estado === 'vigente').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-warning">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Próximos a Vencer</p>
              <p className="text-2xl font-bold text-warning">
                {certificados.filter(c => c.estado === 'proximamente_vencer').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-warning" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-danger">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vencidos</p>
              <p className="text-2xl font-bold text-danger">
                {certificados.filter(c => c.estado === 'vencido').length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-danger" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="Buscar por empleado o empresa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 max-w-md px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as any)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="todos">Todos los certificados</option>
          <option value="vigente">Vigentes</option>
          <option value="proximamente_vencer">Próximos a vencer</option>
          <option value="vencido">Vencidos</option>
        </select>
      </div>

      {/* Lista de Certificados */}
      <div className="space-y-4">
        <AnimatePresence>
          {certificadosFiltrados.map((certificado) => (
            <CertificadoMedico
              key={certificado.id}
              certificado={certificado}
              onDownload={() => handleDescargarCertificado(certificado)}
              onEmail={() => handleEnviarCertificado(certificado)}
              onPrint={() => handleImprimirCertificado(certificado)}
            />
          ))}
        </AnimatePresence>
      </div>

      {certificadosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay certificados</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? 'No se encontraron certificados con ese criterio' : 'Aún no se han generado certificados médicos'}
          </p>
          <button 
            onClick={handleGenerarCertificado}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
          >
            Generar Primer Certificado
          </button>
        </div>
      )}
    </div>
  )
}
