// Sistema de Conciliación Automática de Pagos
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  ArrowRight,
  Calendar,
  DollarSign,
  CreditCard,
  FileText,
  Download,
  Filter,
  Search,
  Settings,
  TrendingUp,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ConciliacionPagos, MovimientoConciliacion, Factura, Pago } from '@/types/facturacion'
import { useFacturacion } from '@/hooks/useFacturacion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

interface ConciliacionAutomaticaProps {
  facturas: Factura[]
  pagos: Pago[]
}

export function ConciliacionAutomatica({ facturas, pagos }: ConciliacionAutomaticaProps) {
  const [conciliacion, setConciliacion] = useState<ConciliacionPagos | null>(null)
  const [movimientosDetectados, setMovimientosDetectados] = useState<MovimientoConciliacion[]>([])
  const [movimientosManuales, setMovimientosManuales] = useState<MovimientoConciliacion[]>([])
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'conciliado' | 'pendiente' | 'diferencia'>('todos')
  const [busquedaTermino, setBusquedaTermino] = useState('')
  const [fechaInicio, setFechaInicio] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0])
  const [procesandoConciliacion, setProcesandoConciliacion] = useState(false)

  useEffect(() => {
    // Simular detección automática de movimientos
    detectarMovimientos()
  }, [facturas, pagos, fechaInicio, fechaFin])

  const detectarMovimientos = () => {
    // Simular movimientos automáticos detectados desde bancos
    const movimientosAuto: MovimientoConciliacion[] = [
      {
        fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        concepto: 'TRANSFERENCIA BANCARIA',
        monto: 1856,
        referencia: 'TRF001234567',
        tipo: 'ingreso',
        estado: 'conciliado'
      },
      {
        fecha: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        concepto: 'PAGO SPEI',
        monto: 2500,
        referencia: 'SPEI789012',
        tipo: 'ingreso',
        estado: 'pendiente'
      },
      {
        fecha: new Date(),
        concepto: 'DEPOSITO EN EFECTIVO',
        monto: 1200,
        referencia: 'EFE001',
        tipo: 'ingreso',
        estado: 'pendiente'
      }
    ]

    // Movimientos manuales del sistema
    const movimientosManuales: MovimientoConciliacion[] = [
      {
        fecha: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        concepto: 'FACTURA F-001 - MOLINA INDUSTRIAL',
        monto: 1856,
        tipo: 'ingreso',
        estado: 'conciliado'
      },
      {
        fecha: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        concepto: 'FACTURA F-002 - IMSS',
        monto: 2500,
        tipo: 'ingreso',
        estado: 'pendiente'
      }
    ]

    setMovimientosDetectados(movimientosAuto)
    setMovimientosManuales(movimientosManuales)

    // Crear conciliación
    setConciliacion({
      id: '1',
      fechaConciliacion: new Date(),
      periodo: {
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin)
      },
      movimientos: [...movimientosAuto, ...movimientosManuales],
      diferencias: 1444, // 3700 - 2256
      estado: 'pendiente'
    })
  }

  const ejecutarConciliacionAutomatica = async () => {
    setProcesandoConciliacion(true)
    try {
      // Simular proceso de conciliación automática
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Aplicar matching automático
      const movimientosActualizados = movimientosDetectados.map(mov => {
        // Lógica simple de matching por monto
        const facturaCoincidente = facturas.find(f => 
          Math.abs(f.total - mov.monto) < 1 && f.estado !== 'pagada'
        )
        
        if (facturaCoincidente && mov.estado === 'pendiente') {
          return { ...mov, estado: 'conciliado' as const }
        }
        return mov
      })

      setMovimientosDetectados(movimientosActualizados)
      
      // Actualizar conciliación
      if (conciliacion) {
        setConciliacion({
          ...conciliacion,
          movimientos: [...movimientosActualizados, ...movimientosManuales],
          estado: 'conciliada'
        })
      }

      toast.success('Conciliación automática completada')
      
    } catch (error) {
      toast.error('Error en la conciliación automática')
    } finally {
      setProcesandoConciliacion(false)
    }
  }

  const todasLasMovimientos = [...movimientosDetectados, ...movimientosManuales]
  
  const movimientosFiltrados = todasLasMovimientos.filter(mov => {
    if (filtroEstado !== 'todos' && mov.estado !== filtroEstado) return false
    if (busquedaTermino && !mov.concepto.toLowerCase().includes(busquedaTermino.toLowerCase())) return false
    return true
  })

  const estadisticasConciliacion = {
    totalMovimientos: todasLasMovimientos.length,
    conciliados: todasLasMovimientos.filter(m => m.estado === 'conciliado').length,
    pendientes: todasLasMovimientos.filter(m => m.estado === 'pendiente').length,
    diferencias: todasLasMovimientos.filter(m => m.estado === 'diferencia').length,
    montoTotal: todasLasMovimientos.reduce((sum, m) => sum + (m.tipo === 'ingreso' ? m.monto : -m.monto), 0)
  }

  const datosGrafico = [
    {
      mes: 'Ene',
      ingresos: 45000,
      conciliados: 42000,
      pendientes: 3000
    },
    {
      mes: 'Feb',
      ingresos: 52000,
      conciliados: 48000,
      pendientes: 4000
    },
    {
      mes: 'Mar',
      ingresos: 38000,
      conciliados: 35000,
      pendientes: 3000
    },
    {
      mes: 'Abr',
      ingresos: 61000,
      conciliados: 58000,
      pendientes: 3000
    },
    {
      mes: 'May',
      ingresos: 55000,
      conciliados: 52000,
      pendientes: 3000
    },
    {
      mes: 'Jun',
      ingresos: 48000,
      conciliados: 45000,
      pendientes: 3000
    }
  ]

  const obtenerIconoEstado = (estado: string) => {
    switch (estado) {
      case 'conciliado':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pendiente':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'diferencia':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              <span>Conciliación Automática de Pagos</span>
            </h2>
            <p className="text-gray-600 mt-1">
              Matching automático entre facturas y movimientos bancarios
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={detectarMovimientos}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button
              onClick={ejecutarConciliacionAutomatica}
              disabled={procesandoConciliacion}
              className="bg-primary hover:bg-primary/90"
            >
              {procesandoConciliacion ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Settings className="h-4 w-4 mr-2" />
              )}
              Conciliar Automáticamente
            </Button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          {
            titulo: 'Total Movimientos',
            valor: estadisticasConciliacion.totalMovimientos,
            icono: FileText,
            color: 'bg-blue-500'
          },
          {
            titulo: 'Conciliados',
            valor: estadisticasConciliacion.conciliados,
            icono: CheckCircle,
            color: 'bg-green-500'
          },
          {
            titulo: 'Pendientes',
            valor: estadisticasConciliacion.pendientes,
            icono: Clock,
            color: 'bg-yellow-500'
          },
          {
            titulo: 'Diferencias',
            valor: estadisticasConciliacion.diferencias,
            icono: AlertTriangle,
            color: 'bg-red-500'
          },
          {
            titulo: 'Monto Total',
            valor: `$${estadisticasConciliacion.montoTotal.toLocaleString()}`,
            icono: DollarSign,
            color: 'bg-primary'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.titulo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.titulo}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.valor}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icono className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de Movimientos */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">Movimientos Bancarios</h3>
              <div className="flex space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={busquedaTermino}
                    onChange={(e) => setBusquedaTermino(e.target.value)}
                    placeholder="Buscar..."
                    className="pl-10 w-64"
                  />
                </div>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="conciliado">Conciliados</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="diferencia">Con diferencias</option>
                </select>
              </div>
            </div>

            {/* Lista de Movimientos */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {movimientosFiltrados.map((movimiento, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {obtenerIconoEstado(movimiento.estado)}
                      <div>
                        <h4 className="font-medium text-gray-900">{movimiento.concepto}</h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span>{movimiento.fecha.toLocaleDateString('es-MX')}</span>
                          {movimiento.referencia && (
                            <span>Ref: {movimiento.referencia}</span>
                          )}
                          <Badge 
                            className={`${
                              movimiento.tipo === 'ingreso' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {movimiento.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        movimiento.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movimiento.tipo === 'ingreso' ? '+' : '-'}${movimiento.monto.toLocaleString()}
                      </p>
                      <Badge 
                        className={`mt-1 ${
                          movimiento.estado === 'conciliado' ? 'bg-green-100 text-green-800' :
                          movimiento.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {movimiento.estado}
                      </Badge>
                    </div>
                  </div>
                  
                  {movimiento.estado === 'pendiente' && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          Conciliar Manualmente
                        </Button>
                        <Button size="sm" variant="outline">
                          Marcar como Diferencia
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Panel de Control */}
        <div className="space-y-6">
          {/* Filtros de Fecha */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Período de Conciliación</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Inicio
                </label>
                <Input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Fin
                </label>
                <Input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
              <Button
                onClick={detectarMovimientos}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Aplicar Filtros
              </Button>
            </div>
          </Card>

          {/* Estado de Conciliación */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Estado Actual</h3>
            {conciliacion ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Período:</span>
                  <span className="font-medium">
                    {conciliacion.periodo.fechaInicio.toLocaleDateString('es-MX')} - 
                    {conciliacion.periodo.fechaFin.toLocaleDateString('es-MX')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Última conciliación:</span>
                  <span className="font-medium">
                    {conciliacion.fechaConciliacion.toLocaleDateString('es-MX')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estado:</span>
                  <Badge className={`${
                    conciliacion.estado === 'conciliada' ? 'bg-green-100 text-green-800' :
                    conciliacion.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {conciliacion.estado}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Diferencias:</span>
                  <span className={`font-medium ${
                    conciliacion.diferencias > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    ${conciliacion.diferencias.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No hay conciliación activa</p>
            )}
          </Card>

          {/* Acciones Rápidas */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Exportar Conciliación
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Generar Reporte
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="h-4 w-4 mr-2" />
                Integrar Banco
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Gráfico de Tendencias */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-900">Tendencias de Conciliación</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <TrendingUp className="h-4 w-4" />
            <span>Últimos 6 meses</span>
          </div>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datosGrafico}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              {/* @ts-ignore */}
              <XAxis dataKey="mes" stroke="#666" />
              {/* @ts-ignore */}
              <YAxis stroke="#666" />
              {/* @ts-ignore */}
              <Tooltip 
                formatter={(value) => [`$${value.toLocaleString()}`, 'Monto']}
                labelStyle={{ color: '#666' }}
              />
              {/* @ts-ignore */}
              <Bar dataKey="ingresos" fill="#00BFA6" radius={[4, 4, 0, 0]} name="Ingresos" />
              {/* @ts-ignore */}
              <Bar dataKey="conciliados" fill="#10B981" radius={[4, 4, 0, 0]} name="Conciliados" />
              {/* @ts-ignore */}
              <Bar dataKey="pendientes" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Pendientes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}