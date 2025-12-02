// Hook personalizado para el módulo de Facturación & Seguros
import { useState, useEffect, useCallback } from 'react'
import { 
  Cliente, 
  Factura, 
  ServicioMedico, 
  Pago, 
  NotaCredito,
  Seguro,
  PlanPrecios,
  ReporteFinanciero,
  EstadoCuenta,
  AlertaVencimiento,
  FacturacionRecurrente,
  ConciliacionPagos,
  ConfiguracionSeguro
} from '@/types/facturacion'
import toast from 'react-hot-toast'

export function useFacturacion() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estados para datos
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [servicios, setServicios] = useState<ServicioMedico[]>([])
  const [seguros, setSeguros] = useState<Seguro[]>([])
  const [planes, setPlanes] = useState<PlanPrecios[]>([])
  const [notasCredito, setNotasCredito] = useState<NotaCredito[]>([])
  const [alertasVencimiento, setAlertasVencimiento] = useState<AlertaVencimiento[]>([])

  // Mock data initialization
  useEffect(() => {
    initializeMockData()
  }, [])

  const initializeMockData = () => {
    // Servicios médicos mock
    setServicios([
      {
        id: '1',
        nombre: 'Consulta Médica Ocupacional',
        codigo: 'CMO001',
        descripcion: 'Consulta médica inicial para evaluación ocupacional',
        precio: 800,
        impuestos: 128,
        categoria: 'Consulta',
        activo: true
      },
      {
        id: '2',
        nombre: 'Examen Médico Anual',
        codigo: 'EMA001',
        descripcion: 'Examen médico completo anual',
        precio: 1500,
        impuestos: 240,
        categoria: 'Examen',
        activo: true
      },
      {
        id: '3',
        nombre: 'Audiometría',
        codigo: 'AUD001',
        descripcion: 'Examen de audición ocupacional',
        precio: 450,
        impuestos: 72,
        categoria: 'Laboratorio',
        activo: true
      },
      {
        id: '4',
        nombre: 'Espirometría',
        codigo: 'ESP001',
        descripcion: 'Examen de función pulmonar',
        precio: 350,
        impuestos: 56,
        categoria: 'Laboratorio',
        activo: true
      },
      {
        id: '5',
        nombre: 'Evaluación Ergonómica',
        codigo: 'ERG001',
        descripcion: 'Evaluación completa del puesto de trabajo',
        precio: 2500,
        impuestos: 400,
        categoria: 'Evaluación',
        activo: true
      }
    ])

    // Clientes mock
    setClientes([
      {
        id: '1',
        rfc: 'MOL850215ABC',
        razonSocial: 'MOLINA INDUSTRIAL SA DE CV',
        email: 'compras@molina.com',
        telefono: '555-0123',
        direccion: {
          calle: 'Av. Industrial',
          numero: '123',
          colonia: 'Industrial',
          ciudad: 'México',
          estado: 'CDMX',
          cp: '03100',
          pais: 'México'
        },
        tipo: 'moral',
        regimenFiscal: '601',
        usoCFDI: 'G03'
      },
      {
        id: '2',
        rfc: 'IMSS850301',
        razonSocial: 'INSTITUTO MEXICANO DEL SEGURO SOCIAL',
        email: 'facturacion@imss.gob.mx',
        direccion: {
          calle: 'Av. Paseo de la Reforma',
          numero: '476',
          colonia: 'Cuauhtémoc',
          ciudad: 'México',
          estado: 'CDMX',
          cp: '06500',
          pais: 'México'
        },
        tipo: 'moral',
        regimenFiscal: '603',
        usoCFDI: 'G03'
      },
      {
        id: '3',
        rfc: 'GARC800501ABC',
        razonSocial: 'Juan García López',
        email: 'juan.garcia@empresa.com',
        telefono: '555-0456',
        direccion: {
          calle: 'Calle Principal',
          numero: '456',
          colonia: 'Centro',
          ciudad: 'México',
          estado: 'CDMX',
          cp: '06000',
          pais: 'México'
        },
        tipo: 'fisica',
        regimenFiscal: '612',
        usoCFDI: 'G03'
      }
    ])

    // Seguros mock
    setSeguros([
      {
        id: '1',
        nombre: 'Instituto Mexicano del Seguro Social',
        codigo: 'IMSS',
        tipo: 'IMSS',
        activo: true,
        configuracion: {
          requierePreautorizacion: false,
          diasPreautorizacion: 0,
          precioPorProcedimiento: {
            'CMO001': 800,
            'EMA001': 1500
          },
          descuento: 15,
          copago: 0,
          cobertura: 85,
          limites: {
            anual: 50000,
            mensual: 5000
          },
          codigosAutorizacion: []
        }
      },
      {
        id: '2',
        nombre: 'Instituto de Seguridad y Servicios Sociales de los Trabajadores del Estado',
        codigo: 'ISSSTE',
        tipo: 'ISSSTE',
        activo: true,
        configuracion: {
          requierePreautorizacion: true,
          diasPreautorizacion: 5,
          precioPorProcedimiento: {
            'CMO001': 750,
            'EMA001': 1400
          },
          descuento: 12,
          copago: 50,
          cobertura: 80,
          limites: {
            anual: 45000,
            mensual: 4500
          },
          codigosAutorizacion: []
        }
      }
    ])

    // Facturas mock
    const hoy = new Date()
    const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    setFacturas([
      {
        id: '1',
        folio: 'F-001',
        fechaEmision: hace30Dias,
        fechaVencimiento: new Date(hace30Dias.getTime() + 30 * 24 * 60 * 60 * 1000),
        cliente: clientes[0] || {
          id: '1',
          rfc: 'MOL850215ABC',
          razonSocial: 'MOLINA INDUSTRIAL SA DE CV',
          email: 'compras@molina.com',
          direccion: {
            calle: 'Av. Industrial',
            numero: '123',
            colonia: 'Industrial',
            ciudad: 'México',
            estado: 'CDMX',
            cp: '03100',
            pais: 'México'
          },
          tipo: 'moral',
          regimenFiscal: '601',
          usoCFDI: 'G03'
        },
        servicios: [
          {
            id: '1',
            servicioId: '1',
            servicioNombre: 'Consulta Médica Ocupacional',
            cantidad: 2,
            precioUnitario: 800,
            descuento: 0,
            impuesto: 256,
            total: 1856
          }
        ],
        subtotal: 1600,
        impuestos: 256,
        total: 1856,
        moneda: 'MXN',
        estado: 'pendiente' as const,
        metodoPago: 'PUE',
        lugarExpedicion: 'CDMX',
        regimeFiscal: '601',
        usoCFDI: 'G03',
        serie: 'F',
        numero: 1,
        created_at: hace30Dias,
        updated_at: hace30Dias
      }
    ])

    setAlertasVencimiento([
      {
        id: '1',
        facturaId: '1',
        diasRestantes: 5,
        nivelUrgencia: 'alta',
        mensaje: 'Factura F-001 vence en 5 días',
        fechaLimite: new Date(hoy.getTime() + 5 * 24 * 60 * 60 * 1000)
      }
    ])
  }

  // Funciones para manejo de facturas
  const crearFactura = useCallback(async (facturaData: Partial<Factura>): Promise<Factura> => {
    setLoading(true)
    try {
      // Validar datos requeridos
      if (!facturaData.cliente) {
        throw new Error('Cliente es requerido')
      }
      if (!facturaData.servicios || facturaData.servicios.length === 0) {
        throw new Error('Servicios son requeridos')
      }

      // Simular creación de factura
      const nuevaFactura: Factura = {
        id: Date.now().toString(),
        folio: `F-${String(facturas.length + 1).padStart(3, '0')}`,
        fechaEmision: new Date(),
        fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cliente: facturaData.cliente,
        servicios: facturaData.servicios,
        subtotal: facturaData.subtotal || 0,
        impuestos: facturaData.impuestos || 0,
        total: facturaData.total || 0,
        moneda: facturaData.moneda || 'MXN',
        estado: 'pendiente' as const,
        metodoPago: facturaData.metodoPago || 'PUE',
        lugarExpedicion: facturaData.lugarExpedicion || 'CDMX',
        regimeFiscal: facturaData.regimeFiscal || '601',
        usoCFDI: facturaData.usoCFDI || 'G03',
        serie: 'F',
        numero: facturas.length + 1,
        created_at: new Date(),
        updated_at: new Date(),
        ...facturaData
      }

      setFacturas(prev => [...prev, nuevaFactura])
      toast.success('Factura creada exitosamente')
      return nuevaFactura
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear factura'
      setError(errorMessage)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [facturas.length])

  const generarCFDI = useCallback(async (facturaId: string): Promise<string> => {
    setLoading(true)
    try {
      // Simular generación de CFDI 4.0
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const cfdiUUID = `CFDI-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      
      setFacturas(prev => prev.map(f => 
        f.id === facturaId 
          ? { ...f, cfdiUUID, estado: 'pagada' as const }
          : f
      ))
      
      toast.success('CFDI 4.0 generado exitosamente')
      return cfdiUUID
    } catch (err) {
      const errorMessage = 'Error al generar CFDI'
      setError(errorMessage)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const procesarPago = useCallback(async (facturaId: string, pagoData: Partial<Pago>): Promise<Pago> => {
    setLoading(true)
    try {
      const nuevoPago: Pago = {
        id: Date.now().toString(),
        facturaId,
        monto: pagoData.monto || 0,
        fechaPago: new Date(),
        metodoPago: pagoData.metodoPago || 'TRANSFERENCIA',
        estado: 'completado' as const
      }

      // Actualizar estado de factura
      setFacturas(prev => prev.map(f => {
        if (f.id === facturaId) {
          const totalPagado = f.total // En producción se calcularía con pagos reales
          return {
            ...f,
            estado: totalPagado >= f.total ? 'pagada' as const : 'pendiente' as const
          }
        }
        return f
      }))

      toast.success('Pago procesado exitosamente')
      return nuevoPago
    } catch (err) {
      const errorMessage = 'Error al procesar pago'
      setError(errorMessage)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  // Funciones para reportes
  const generarReporteFinanciero = useCallback(async (fechaInicio: Date, fechaFin: Date): Promise<ReporteFinanciero> => {
    setLoading(true)
    try {
      // Simular generación de reporte
      await new Promise(resolve => setTimeout(resolve, 1500))

      const reporte: ReporteFinanciero = {
        periodo: { fechaInicio, fechaFin },
        ingresosTotales: 156750,
        ingresosCobrados: 142300,
        ingresosPendientes: 14450,
        gastosOperativos: 45200,
        utilidadNeta: 111550,
        facturasEmitidas: 89,
        facturasPagadas: 76,
        facturasVencidas: 8,
        clientesActivos: 23,
        ticketPromedio: 1760,
        crecimientoVsPeriodoAnterior: 15.3
      }

      return reporte
    } catch (err) {
      const errorMessage = 'Error al generar reporte'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  // Funciones para seguros
  const procesarConSeguro = useCallback(async (
    seguroId: string, 
    serviciosIds: string[], 
    datosPaciente: any
  ): Promise<{ costoPaciente: number; costoSeguro: number; autorizado: boolean }> => {
    setLoading(true)
    try {
      const seguro = seguros.find(s => s.id === seguroId)
      if (!seguro) throw new Error('Seguro no encontrado')

      let costoTotal = 0
      serviciosIds.forEach(id => {
        const servicio = servicios.find(s => s.id === id)
        if (servicio) {
          costoTotal += servicio.precio + servicio.impuestos
        }
      })

      const costoSeguro = costoTotal * (seguro.configuracion.cobertura / 100)
      const costoPaciente = costoTotal - costoSeguro + seguro.configuracion.copago

      return {
        costoPaciente: Math.round(costoPaciente),
        costoSeguro: Math.round(costoSeguro),
        autorizado: true // En producción verificaría preautorización
      }
    } catch (err) {
      const errorMessage = 'Error al procesar con seguro'
      setError(errorMessage)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [seguros, servicios])

  return {
    // Estados
    loading,
    error,
    clientes,
    facturas,
    servicios,
    seguros,
    planes,
    notasCredito,
    alertasVencimiento,

    // Funciones
    crearFactura,
    generarCFDI,
    procesarPago,
    generarReporteFinanciero,
    procesarConSeguro,
    
    // Utility functions
    getClienteById: (id: string) => clientes.find(c => c.id === id),
    getServicioById: (id: string) => servicios.find(s => s.id === id),
    getFacturaById: (id: string) => facturas.find(f => f.id === id),
    
    clearError: () => setError(null)
  }
}