// Hook personalizado para manejar certificaciones médicas
import { useState, useEffect, useCallback } from 'react'
import {
  Certificacion,
  Paciente,
  Empresa,
  TipoCertificado,
  GeneracionMasiva,
  AlertaCertificacion,
  EstadoCertificacion,
  TipoAlerta
} from '@/types/certificacion'
import { dataService } from '@/services/dataService'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
export function useCertificaciones() {
  const { user } = useAuth()
  // Estados principales
  const [certificaciones, setCertificaciones] = useState<Certificacion[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [tiposCertificado, setTiposCertificado] = useState<TipoCertificado[]>([])
  const [alertas, setAlertas] = useState<AlertaCertificacion[]>([])
  const [loading, setLoading] = useState(false)

  // Estados de filtros y búsqueda
  const [filtros, setFiltros] = useState({
    empresa: '',
    estado: '',
    tipo: '',
    fechaDesde: '',
    fechaHasta: '',
    paciente: '',
    medico: ''
  })

  const [busqueda, setBusqueda] = useState('')
  const [certificacionSeleccionada, setCertificacionSeleccionada] = useState<Certificacion | null>(null)

  // Carga inicial
  useEffect(() => {
    obtenerCertificaciones()
    cargarCatalogos()
  }, [])

  const cargarCatalogos = async () => {
    try {
      const [pacs, emps, tipos] = await Promise.all([
        dataService.pacientes.getAll(),
        dataService.empresas.getAll(),
        dataService.certificaciones.getTipos()
      ])
      setPacientes(pacs as any)
      setEmpresas(emps as any)
      setTiposCertificado(tipos as any)
    } catch (error) {
      console.error('Error cargando catálogos:', error)
    }
  }

  // Funciones principales
  const obtenerCertificaciones = useCallback(async () => {
    setLoading(true)
    try {
      const data = await dataService.certificaciones.getAll()
      // Adaptar nombres de campos si es necesario (snake_case a camelCase)
      const adaptedData = (data || []).map((c: any) => ({
        id: c.id,
        numeroCertificado: c.numero_certificado,
        pacienteId: c.paciente_id,
        empresaId: c.empresa_id,
        tipoCertificadoId: c.tipo_certificacion,
        fechaEmision: c.fecha_emision,
        fechaVencimiento: c.fecha_vigencia,
        estado: c.estado,
        aptoParaTrabajo: c.resultado === 'apto',
        restricciones: c.restricciones ? [c.restricciones] : [],
        recomendaciones: c.recomendaciones ? [c.recomendaciones] : [],
        medicoFirma: c.medico
      }))
      setCertificaciones(adaptedData as any)
    } catch (error) {
      toast.error('Error al cargar certificaciones')
    } finally {
      setLoading(false)
    }
  }, [])

  const crearCertificacion = useCallback(async (datos: Partial<Certificacion>) => {
    try {
      setLoading(true)

      // Validaciones
      if (!datos.pacienteId || !datos.tipoCertificadoId || !datos.empresaId) {
        throw new Error('Faltan datos requeridos')
      }

      const res = await dataService.certificaciones.create({
        paciente_id: datos.pacienteId,
        empresa_id: datos.empresaId,
        tipo_certificacion: datos.tipoCertificadoId,
        resultado: datos.aptoParaTrabajo ? 'apto' : 'no_apto',
        restricciones: datos.restricciones?.join(', '),
        recomendaciones: datos.recomendaciones?.join(', '),
        medico_id: user?.id,
        fecha_emision: new Date().toISOString(),
        fecha_vigencia: calcularFechaVencimiento(datos.tipoCertificadoId!),
        estado: 'vigente'
      })

      await obtenerCertificaciones()
      toast.success('Certificación creada exitosamente')
      return res as any
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear certificación'
      toast.error(message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const actualizarCertificacion = useCallback(async (id: string, datos: Partial<Certificacion>) => {
    try {
      setLoading(true)

      setCertificaciones(prev => prev.map(cert =>
        cert.id === id
          ? { ...cert, ...datos, updatedAt: new Date().toISOString() }
          : cert
      ))

      toast.success('Certificación actualizada')
    } catch (error) {
      toast.error('Error al actualizar certificación')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const anularCertificacion = useCallback(async (id: string, motivo: string) => {
    try {
      setLoading(true)

      const certificacion = certificaciones.find(c => c.id === id)
      if (!certificacion) throw new Error('Certificación no encontrada')

      const nuevoHistorial = [...certificacion.historialEstados, {
        id: `hist_${Date.now()}`,
        estado: EstadoCertificacion.ANULADO,
        fechaCambio: new Date().toISOString(),
        motivo,
        usuarioCambio: 'medico_actual'
      }]

      await actualizarCertificacion(id, {
        estado: EstadoCertificacion.ANULADO,
        historialEstados: nuevoHistorial
      })

      toast.success('Certificación anulada exitosamente')
    } catch (error) {
      toast.error('Error al anular certificación')
      throw error
    } finally {
      setLoading(false)
    }
  }, [certificaciones, actualizarCertificacion])

  const generarCertificadoPDF = useCallback(async (id: string) => {
    try {
      setLoading(true)

      const certificacion = certificaciones.find(c => c.id === id)
      if (!certificacion) throw new Error('Certificación no encontrada')

      // Simular generación de PDF
      await new Promise(resolve => setTimeout(resolve, 2000))

      // En una implementación real, aquí se generaría el PDF
      const pdfData = {
        certificado: certificacion,
        paciente: pacientes.find(p => p.id === certificacion.pacienteId),
        empresa: empresas.find(e => e.id === certificacion.empresaId),
        tipo: tiposCertificado.find(t => t.id === certificacion.tipoCertificadoId)
      }

      toast.success('PDF generado exitosamente')
      return pdfData
    } catch (error) {
      toast.error('Error al generar PDF')
      throw error
    } finally {
      setLoading(false)
    }
  }, [certificaciones, pacientes, empresas, tiposCertificado])

  const enviarFirmaDigital = useCallback(async (id: string, medicoFirma: any) => {
    try {
      setLoading(true)

      await actualizarCertificacion(id, {
        medicoFirma,
        fechaFirmaDigital: new Date().toISOString(),
        firmaDigitalHash: generarHashFirma(medicoFirma)
      })

      toast.success('Firma digital enviada exitosamente')
    } catch (error) {
      toast.error('Error al enviar firma digital')
      throw error
    } finally {
      setLoading(false)
    }
  }, [actualizarCertificacion])

  const generarCertificadosMasivos = useCallback(async (empresaId: string, tipoId: string, filtros: any) => {
    try {
      setLoading(true)

      // Filtrar pacientes según criterios
      const pacientesFiltrados = pacientes.filter(p =>
        p.empresa.id === empresaId &&
        (!filtros.puestosTrabajo || filtros.puestosTrabajo.includes(p.puestoTrabajo))
      )

      const generacion: GeneracionMasiva = {
        id: `gen_${Date.now()}`,
        empresaId,
        tipoCertificadoId: tipoId,
        filtrosPacientes: filtros,
        totalGenerados: pacientesFiltrados.length,
        fechaGeneracion: new Date().toISOString(),
        estado: 'procesando',
        certificadosGenerados: []
      }

      // Simular generación
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Crear certificaciones
      const nuevasCertificaciones = pacientesFiltrados.map(paciente => ({
        id: `cert_${Date.now()}_${paciente.id}`,
        numeroCertificado: generarNumeroCertificado(),
        pacienteId: paciente.id,
        empresaId,
        tipoCertificadoId: tipoId,
        fechaEmision: new Date().toISOString(),
        fechaVencimiento: calcularFechaVencimiento(tipoId),
        estado: EstadoCertificacion.VIGENTE,
        aptoParaTrabajo: true,
        restricciones: [],
        recomendaciones: [],
        observacionesMedicas: '',
        medicoFirma: {
          id: 'medico_1',
          nombre: 'Dr. Juan',
          apellidos: 'Pérez',
          cedulaProfesional: '1234567',
          especialidad: 'Medicina del Trabajo',
          certificacionFirmas: 'active'
        },
        camposPersonalizados: {},
        visibleEmpresa: true,
        creadoPor: 'medico_actual',
        historialEstados: [{
          id: `hist_${Date.now()}_${paciente.id}`,
          estado: EstadoCertificacion.VIGENTE,
          fechaCambio: new Date().toISOString(),
          usuarioCambio: 'medico_actual'
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))

      setCertificaciones(prev => [...nuevasCertificaciones, ...prev])
      generacion.estado = 'completado'
      generacion.certificadosGenerados = nuevasCertificaciones.map(c => c.id)

      toast.success(`${nuevasCertificaciones.length} certificaciones generadas exitosamente`)
      return generacion
    } catch (error) {
      toast.error('Error en generación masiva')
      throw error
    } finally {
      setLoading(false)
    }
  }, [pacientes, actualizarCertificacion])

  const enviarNotificacionVencimiento = useCallback(async (empresaId: string) => {
    try {
      setLoading(true)

      const certificadosVencidos = certificaciones.filter(c =>
        c.empresaId === empresaId &&
        c.estado === EstadoCertificacion.VIGENTE &&
        new Date(c.fechaVencimiento) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
      )

      // Simular envío de notificaciones
      await new Promise(resolve => setTimeout(resolve, 1500))

      toast.success(`Notificaciones enviadas a ${certificadosVencidos.length} certificados próximos a vencer`)
      return certificadosVencidos.length
    } catch (error) {
      toast.error('Error al enviar notificaciones')
      throw error
    } finally {
      setLoading(false)
    }
  }, [certificaciones])

  // Funciones auxiliares
  const aplicarFiltros = useCallback(() => {
    let resultado = certificaciones

    if (filtros.empresa) {
      resultado = resultado.filter(c => c.empresaId === filtros.empresa)
    }

    if (filtros.estado) {
      resultado = resultado.filter(c => c.estado === filtros.estado)
    }

    if (filtros.tipo) {
      resultado = resultado.filter(c => c.tipoCertificadoId === filtros.tipo)
    }

    if (busqueda) {
      resultado = resultado.filter(c => {
        const paciente = pacientes.find(p => p.id === c.pacienteId)
        return paciente?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          paciente?.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
          c.numeroCertificado.toLowerCase().includes(busqueda.toLowerCase())
      })
    }

    return resultado
  }, [certificaciones, pacientes, filtros, busqueda])

  // Funciones de utilidad locales
  function generarNumeroCertificado(): string {
    const año = new Date().getFullYear()
    const mes = String(new Date().getMonth() + 1).padStart(2, '0')
    const dia = String(new Date().getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
    return `CERT-${año}${mes}${dia}-${random}`
  }

  function calcularFechaVencimiento(tipoCertificadoId: string): string {
    const tipo = tiposCertificado.find(t => t.id === tipoCertificadoId)
    const diasVigencia = tipo?.vigenciaDias || 365
    const fechaVenc = new Date()
    fechaVenc.setDate(fechaVenc.getDate() + diasVigencia)
    return fechaVenc.toISOString()
  }

  function generarHashFirma(medico: any): string {
    const data = `${medico.nombre}_${medico.cedulaProfesional}_${Date.now()}`
    return btoa(data).slice(0, 16) // Simulación simple de hash
  }

  function generarDatosEjemplo() {
    return {
      pacientes: [
        {
          id: 'pac_1',
          nombre: 'Juan Carlos',
          apellidos: 'García López',
          fechaNacimiento: '1985-03-15',
          curp: 'GALM850315HDFRRN01',
          rfc: 'GALM850315ABC',
          puestoTrabajo: 'Operador de Maquinaria',
          empresa: {
            id: 'emp_1',
            nombre: 'Grupo Industrial México',
            razonSocial: 'Grupo Industrial México S.A. de C.V.',
            rfc: 'GIM850315DEF'
          },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'pac_2',
          nombre: 'María Elena',
          apellidos: 'Rodríguez Sánchez',
          fechaNacimiento: '1990-07-22',
          curp: 'ROSM900722HDFDNR08',
          rfc: 'ROSM900722GHI',
          puestoTrabajo: 'Supervisora de Producción',
          empresa: {
            id: 'emp_1',
            nombre: 'Grupo Industrial México',
            razonSocial: 'Grupo Industrial México S.A. de C.V.',
            rfc: 'GIM850315DEF'
          },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ],
      empresas: [
        {
          id: 'emp_1',
          nombre: 'Grupo Industrial México',
          razonSocial: 'Grupo Industrial México S.A. de C.V.',
          rfc: 'GIM850315DEF',
          configuracion: {
            camposRequeridos: ['puesto', 'antiguedad'],
            vigenciaPorDefecto: 365,
            alertaRenovacion: 30,
            formatoCertificado: 'oficial' as const,
            camposPersonalizados: []
          }
        }
      ],
      tiposCertificado: [
        {
          id: 'tipo_1',
          nombre: 'Aptitud para el Trabajo',
          codigo: 'APT',
          descripcion: 'Certificado de aptitud física para el desempeño laboral',
          template: 'aptitud_laboral',
          vigenciaDias: 365,
          camposRequeridos: ['examen_fisico', 'vision', 'audicion'],
          generadoAutomaticamente: true,
          requiereFirma: true
        },
        {
          id: 'tipo_2',
          nombre: 'Restricción Médica',
          codigo: 'RES',
          descripcion: 'Certificado de restricción médica temporal',
          template: 'restriccion_medica',
          vigenciaDias: 90,
          camposRequeridos: ['diagnostico', 'tratamiento'],
          generadoAutomaticamente: false,
          requiereFirma: true
        }
      ],
      alertas: [
        {
          id: 'alert_1',
          certificacionId: 'cert_1',
          tipo: TipoAlerta.VENCIMIENTO,
          fechaAlerta: '2025-01-15T00:00:00Z',
          mensaje: 'Certificado próximo a vencer',
          enviada: false,
          empresaNotificada: false,
          destinatarios: ['admin@empresa.com']
        }
      ],
      certificaciones: [
        {
          id: 'cert_1',
          numeroCertificado: 'CERT-20241101-0001',
          pacienteId: 'pac_1',
          empresaId: 'emp_1',
          tipoCertificadoId: 'tipo_1',
          fechaEmision: '2024-11-01T00:00:00Z',
          fechaVencimiento: '2025-11-01T00:00:00Z',
          estado: EstadoCertificacion.VIGENTE,
          aptoParaTrabajo: true,
          restricciones: [],
          recomendaciones: ['Uso obligatorio de equipo de protección personal'],
          observacionesMedicas: 'Examen físico dentro de parámetros normales',
          medicoFirma: {
            id: 'med_1',
            nombre: 'Dr. Roberto',
            apellidos: 'Méndez Hernández',
            cedulaProfesional: '1234567',
            especialidad: 'Medicina del Trabajo',
            certificacionFirmas: 'active'
          },
          camposPersonalizados: {},
          visibleEmpresa: true,
          creadoPor: 'med_1',
          historialEstados: [
            {
              id: 'hist_1',
              estado: EstadoCertificacion.VIGENTE,
              fechaCambio: '2024-11-01T00:00:00Z',
              usuarioCambio: 'med_1'
            }
          ],
          createdAt: '2024-11-01T00:00:00Z',
          updatedAt: '2024-11-01T00:00:00Z'
        }
      ]
    }
  }

  return {
    // Estados
    certificaciones,
    pacientes,
    empresas,
    tiposCertificado,
    alertas,
    loading,
    filtros,
    busqueda,
    certificacionSeleccionada,

    // Estados de filtros
    setFiltros,
    setBusqueda,
    setCertificacionSeleccionada,

    // Funciones principales
    obtenerCertificaciones,
    crearCertificacion,
    actualizarCertificacion,
    anularCertificacion,
    generarCertificadoPDF,
    enviarFirmaDigital,
    generarCertificadosMasivos,
    enviarNotificacionVencimiento,

    // Funciones auxiliares
    aplicarFiltros
  }
}
