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
  AlertaVencimiento,
} from '@/types/facturacion'
import toast from 'react-hot-toast'
import { billingService } from '@/services/billingService'
import { useAuth } from '@/contexts/AuthContext'

export function useFacturacion() {
  const { user } = useAuth()
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

  // Load initial data
  useEffect(() => {
    if (user?.empresa_id) {
      loadInitialData()
    }
  }, [user?.empresa_id])

  const loadInitialData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [clientesData, facturasData, planesData] = await Promise.all([
        billingService.getClientes(user!.empresa_id),
        billingService.getFacturas(user!.empresa_id),
        billingService.getPlanes()
      ])

      // Cast needed because internal types match but might have different property naming
      setClientes(clientesData as any)
      setFacturas(facturasData as any)
      setPlanes(planesData as any)

      // Seguros and Servicios are still static for now as they lack DB tables
      initializeStaticData()
    } catch (err: any) {
      console.error('Error loading billing data:', err)
      setError(err.message || 'Error al cargar datos de facturación')
    } finally {
      setLoading(false)
    }
  }

  const initializeStaticData = () => {
    // Servicios médicos (Future: migrate to database)
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
      }
    ])

    // Seguros mock (Future: migrate to database)
    setSeguros([
      {
        id: '1',
        nombre: 'IMSS',
        codigo: 'IMSS',
        tipo: 'IMSS',
        activo: true,
        configuracion: {
          requierePreautorizacion: false,
          diasPreautorizacion: 0,
          precioPorProcedimiento: {},
          descuento: 0,
          copago: 0,
          cobertura: 100,
          limites: { anual: 0, mensual: 0 },
          codigosAutorizacion: []
        }
      }
    ])
  }

  // Funciones para manejo de facturas
  const crearFactura = useCallback(async (facturaData: Partial<Factura>): Promise<Factura> => {
    setLoading(true)
    try {
      if (!user) throw new Error('Usuario no autenticado')

      const res = await billingService.createFacturaBorrador(
        {
          ...facturaData,
          empresa_id: user.empresa_id,
          estado: 'borrador',
          fecha_emision: new Date().toISOString()
        } as any,
        facturaData.servicios as any
      )

      await loadInitialData()
      toast.success('Factura creada exitosamente')
      return res as any
    } catch (err: any) {
      toast.error(err.message || 'Error al crear factura')
      throw err
    } finally {
      setLoading(false)
    }
  }, [user, facturas.length])

  const generarCFDI = useCallback(async (facturaId: string): Promise<string> => {
    setLoading(true)
    try {
      // Simulation of CFDI generation 4.0 (In production this would call a real SAT provider)
      await new Promise(resolve => setTimeout(resolve, 1500))
      const cfdiUUID = crypto.randomUUID().toUpperCase()

      await billingService.updateEstadoFactura(facturaId, {
        estado: 'timbrada',
        cfdiUUID
      } as any)

      await loadInitialData()
      toast.success('CFDI 4.0 generado exitosamente')
      return cfdiUUID
    } catch (err: any) {
      toast.error('Error al generar CFDI')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const procesarPago = useCallback(async (facturaId: string, pagoData: Partial<Pago>): Promise<Pago> => {
    setLoading(true)
    try {
      // Simulation of payment processing
      await billingService.updateEstadoFactura(facturaId, {
        estado: 'pagada'
      } as any)

      const nuevoPago: Pago = {
        id: Date.now().toString(),
        facturaId,
        monto: pagoData.monto || 0,
        fechaPago: new Date(),
        metodoPago: pagoData.metodoPago || 'TRANSFERENCIA',
        estado: 'completado'
      }

      await loadInitialData()
      toast.success('Pago procesado exitosamente')
      return nuevoPago
    } catch (err: any) {
      toast.error('Error al procesar pago')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Funciones para reportes
  const generarReporteFinanciero = useCallback(async (fechaInicio: Date, fechaFin: Date): Promise<ReporteFinanciero> => {
    setLoading(true)
    try {
      // Optimization: use existing facturas state instead of new query if possible
      const reportFacturas = facturas.filter(f =>
        new Date(f.fechaEmision) >= fechaInicio && new Date(f.fechaEmision) <= fechaFin
      )

      const ingresosTotales = reportFacturas.reduce((acc, f) => acc + f.total, 0)
      const ingresosCobrados = reportFacturas.filter(f => f.estado === 'pagada' || f.estado === 'timbrada').reduce((acc, f) => acc + f.total, 0)

      return {
        periodo: { fechaInicio, fechaFin },
        ingresosTotales,
        ingresosCobrados,
        ingresosPendientes: ingresosTotales - ingresosCobrados,
        gastosOperativos: 0,
        utilidadNeta: ingresosCobrados,
        facturasEmitidas: reportFacturas.length,
        facturasPagadas: reportFacturas.filter(f => f.estado === 'pagada').length,
        facturasVencidas: 0,
        clientesActivos: Array.from(new Set(reportFacturas.map(f => f.cliente?.id))).length,
        ticketPromedio: reportFacturas.length > 0 ? ingresosTotales / reportFacturas.length : 0,
        crecimientoVsPeriodoAnterior: 0
      }
    } finally {
      setLoading(false)
    }
  }, [facturas])

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
        autorizado: true
      }
    } finally {
      setLoading(false)
    }
  }, [seguros, servicios])

  return {
    loading,
    error,
    clientes,
    facturas,
    servicios,
    seguros,
    planes,
    notasCredito,
    alertasVencimiento,
    refresh: loadInitialData,
    crearFactura,
    generarCFDI,
    procesarPago,
    generarReporteFinanciero,
    procesarConSeguro,
    getClienteById: (id: string) => clientes.find(c => c.id === id),
    getServicioById: (id: string) => servicios.find(s => s.id === id),
    getFacturaById: (id: string) => facturas.find(f => f.id === id),
    clearError: () => setError(null)
  }
}
