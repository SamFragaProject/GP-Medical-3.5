// Sistema de Firmas Digitales para Médicos
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileSignature,
  Lock,
  Shield,
  Fingerprint,
  Camera,
  Upload,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  MapPin,
  Smartphone,
  Download,
  Eye,
  Key,
  Award,
  Phone,
  Mail,
  QrCode,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { Medico } from '@/types/certificacion'

interface FirmaDigitalData {
  medico: Medico
  certificadoId: string
  fechaFirma: string
  ubicacion: string
  dispositivo: string
  huellaDigital?: string
  hashFirma: string
  validacionBlockchain: boolean
}

interface SistemaFirmaDigitalProps {
  onFirmaEnviar: (datos: FirmaDigitalData) => Promise<void>
  medicoActual: Medico
  certificadosPendientes: Array<{
    id: string
    numeroCertificado: string
    paciente: string
    fechaEmision: string
  }>
  medicoFirmante?: Medico
}

export function SistemaFirmaDigital({ 
  onFirmaEnviar, 
  medicoActual, 
  certificadosPendientes,
  medicoFirmante 
}: SistemaFirmaDigitalProps) {
  const [certificadoSeleccionado, setCertificadoSeleccionado] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [metodoFirma, setMetodoFirma] = useState<'biometrico' | 'pin' | 'qr'>('biometrico')
  const [huellaDigital, setHuellaDigital] = useState('')
  const [pinFirma, setPinFirma] = useState('')
  const [mostrarFirma, setMostrarFirma] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [firmaCompletada, setFirmaCompletada] = useState<FirmaDigitalData | null>(null)

  const metodosFirma = [
    {
      id: 'biometrico',
      nombre: 'Huella Dactilar',
      descripcion: 'Firma biométrica con lector de huella',
      icono: Fingerprint,
      disponible: true
    },
    {
      id: 'pin',
      nombre: 'PIN Seguro',
      descripcion: 'Código personal de 6 dígitos',
      icono: Lock,
      disponible: true
    },
    {
      id: 'qr',
      nombre: 'Código QR',
      descripcion: 'Escaneo desde aplicación móvil',
      icono: QrCode,
      disponible: true
    }
  ]

  const obtenerUbicacion = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUbicacion(`${position.coords.latitude}, ${position.coords.longitude}`)
      })
    }
  }

  const generarHashFirma = (datos: Partial<FirmaDigitalData>) => {
    const data = JSON.stringify({
      medico: datos.medico?.cedulaProfesional,
      certificado: datos.certificadoId,
      fecha: datos.fechaFirma,
      ubicacion: datos.ubicacion,
      dispositivo: navigator.userAgent
    })
    return btoa(data).slice(0, 32)
  }

  const simularCapturaHuella = () => {
    setHuellaDigital('biometric_' + Date.now())
  }

  const enviarFirmaDigital = async () => {
    if (!certificadoSeleccionado) return

    setProcesando(true)
    try {
      const datosFirma: FirmaDigitalData = {
        medico: medicoActual,
        certificadoId: certificadoSeleccionado,
        fechaFirma: new Date().toISOString(),
        ubicacion: ubicacion || 'Ubicación no disponible',
        dispositivo: navigator.platform || 'Dispositivo desconocido',
        huellaDigital: metodoFirma === 'biometrico' ? huellaDigital : undefined,
        hashFirma: '',
        validacionBlockchain: true
      }

      datosFirma.hashFirma = generarHashFirma(datosFirma)

      await onFirmaEnviar(datosFirma)
      setFirmaCompletada(datosFirma)
      setMostrarFirma(true)
    } catch (error) {
      console.error('Error al enviar firma:', error)
    } finally {
      setProcesando(false)
    }
  }

  const descargarCertificadoFirmado = () => {
    // Simular descarga del certificado con firma digital
    const elemento = document.createElement('a')
    elemento.href = '#'
    elemento.download = `certificado_firmado_${certificadoSeleccionado}.pdf`
    elemento.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <FileSignature className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Sistema de Firmas Digitales</h2>
              <p className="text-gray-600">Certificación biométrica y digital de documentos médicos</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-success/10 px-3 py-1 rounded-full">
              <span className="text-success text-sm font-medium">Médico Autorizado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Información del Médico */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Médico Firmante</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                Dr. {medicoActual.nombre} {medicoActual.apellidos}
              </p>
              <p className="text-sm text-gray-600">{medicoActual.especialidad}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Cédula Profesional</p>
              <p className="font-medium text-gray-900">{medicoActual.cedulaProfesional}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Certificación Digital</p>
              <p className="font-medium text-success">Vigente hasta Dic 2025</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de Firma */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Nuevo Certificado</h3>
          
          {/* Selección de Certificado */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificado a Firmar *
              </label>
              <select
                value={certificadoSeleccionado}
                onChange={(e) => setCertificadoSeleccionado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Seleccionar certificado</option>
                {certificadosPendientes.map(cert => (
                  <option key={cert.id} value={cert.id}>
                    {cert.numeroCertificado} - {cert.paciente}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={obtenerUbicacion}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors"
              >
                <MapPin size={16} />
                <span>Obtener Ubicación</span>
              </button>
              <input
                type="text"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                placeholder="Ubicación de la firma"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Método de Firma */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Método de Autenticación *
            </label>
            <div className="space-y-3">
              {metodosFirma.map((metodo) => (
                <div
                  key={metodo.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    metodoFirma === metodo.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setMetodoFirma(metodo.id as any)}
                >
                  <div className="flex items-center space-x-3">
                    <metodo.icono className={`h-5 w-5 ${
                      metodoFirma === metodo.id ? 'text-primary' : 'text-gray-400'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">{metodo.nombre}</p>
                      <p className="text-sm text-gray-600">{metodo.descripcion}</p>
                    </div>
                    {metodo.disponible && (
                      <CheckCircle className="h-4 w-4 text-success ml-auto" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Campos específicos por método */}
          <div className="mt-6">
            {metodoFirma === 'biometrico' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <Fingerprint className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-gray-900">Lector Biométrico</p>
                    <p className="text-sm text-gray-600">Conecte su lector de huella dactilar</p>
                  </div>
                </div>
                <button
                  onClick={simularCapturaHuella}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Camera size={16} />
                  <span>Capturar Huella Digital</span>
                </button>
              </div>
            )}

            {metodoFirma === 'pin' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PIN de Firma (6 dígitos)
                  </label>
                  <input
                    type="password"
                    value={pinFirma}
                    onChange={(e) => setPinFirma(e.target.value)}
                    placeholder="••••••"
                    maxLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-center font-mono text-lg tracking-widest"
                  />
                </div>
                <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <p className="text-sm text-warning">
                      Mantenga su PIN seguro y no lo comparta con nadie
                    </p>
                  </div>
                </div>
              </div>
            )}

            {metodoFirma === 'qr' && (
              <div className="space-y-4 text-center">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600">
                    Escanee este código con la app móvil GPMedical para firmar
                  </p>
                </div>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Generar Nuevo QR
                </button>
              </div>
            )}
          </div>

          {/* Botón de Firma */}
          <div className="mt-8">
            <button
              onClick={enviarFirmaDigital}
              disabled={!certificadoSeleccionado || procesando}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {procesando ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Procesando Firma...</span>
                </>
              ) : (
                <>
                  <FileSignature size={16} />
                  <span>Enviar Firma Digital</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Panel de Validación */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Validación Blockchain</h3>
          
          {firmaCompletada ? (
            <div className="space-y-6">
              {/* Estado de Firma */}
              <div className="bg-success/5 border border-success/20 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <CheckCircle className="h-6 w-6 text-success" />
                  <h4 className="font-semibold text-success">Firma Digital Validada</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hash de Firma:</span>
                    <span className="font-mono text-xs">{firmaCompletada.hashFirma}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Timestamp:</span>
                    <span>{new Date(firmaCompletada.fechaFirma).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ubicación:</span>
                    <span>{firmaCompletada.ubicacion}</span>
                  </div>
                </div>
              </div>

              {/* Validación Blockchain */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Shield className="h-6 w-6 text-primary" />
                  <h4 className="font-semibold text-primary">Blockchain Validation</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Red:</span>
                    <span>Ethereum Mainnet</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction Hash:</span>
                    <span className="font-mono text-xs">0x742d35cc6c...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Block Number:</span>
                    <span>#18456347</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-success">✓ Confirmed</span>
                  </div>
                </div>
              </div>

              {/* Metadatos de Dispositivo */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Metadatos de Dispositivo</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dispositivo:</span>
                    <span>{firmaCompletada.dispositivo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IP Address:</span>
                    <span>192.168.1.100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">User Agent:</span>
                    <span className="truncate max-w-32">Chrome 120.0...</span>
                  </div>
                  {firmaCompletada.huellaDigital && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Biometric Hash:</span>
                      <span className="font-mono text-xs">{firmaCompletada.huellaDigital}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex space-x-3">
                <button
                  onClick={descargarCertificadoFirmado}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors"
                >
                  <Download size={16} />
                  <span>Descargar</span>
                </button>
                <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Eye size={16} />
                  <span>Ver PDF</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileSignature className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Esperando Firma</h3>
              <p className="text-gray-600">
                Seleccione un certificado y configure su firma digital
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Historial de Firmas Recientes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Firmas Recientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certificado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
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
              {[
                {
                  certificado: 'CERT-20241101-0001',
                  paciente: 'Juan García',
                  metodo: 'Huella Dactilar',
                  fecha: '2024-11-01 10:30',
                  estado: 'Validada'
                },
                {
                  certificado: 'CERT-20241101-0002',
                  paciente: 'María López',
                  metodo: 'PIN Seguro',
                  fecha: '2024-11-01 09:15',
                  estado: 'Validada'
                }
              ].map((firma, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {firma.certificado}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {firma.paciente}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {firma.metodo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {firma.fecha}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-success/10 text-success">
                      {firma.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-primary hover:text-primary/80">
                        <Eye size={16} />
                      </button>
                      <button className="text-success hover:text-success/80">
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
