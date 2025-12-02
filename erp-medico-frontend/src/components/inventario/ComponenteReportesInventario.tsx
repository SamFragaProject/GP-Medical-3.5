// Componente para reportes avanzados de inventario
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Download,
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart,
  Calendar,
  Filter,
  Eye,
  Printer,
  Mail,
  Package,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts'
import { useInventario } from '@/hooks/useInventario'
import { ReporteInventario } from '@/types/inventario'
import toast from 'react-hot-toast'

// Interfaces para datos de gráficos
interface DatosReporteData {
  mes: string
  ventas: number
  compras: number
  inventario: number
}

interface DatosCategoriaData {
  name: string
  value: number
  color: string
}

interface DatosRotacionData {
  producto: string
  rotacion: number
  categoria: string
}

interface DatosVencimientosData {
  producto: string
  diasVencimiento: number
  cantidad: number
  riesgo: 'bajo' | 'medio' | 'alto'
}

interface TooltipFormatterProps {
  value: any
  name: string
}

// Datos simulados para los reportes
const datosReporte: DatosReporteData[] = [
  { mes: 'Ene', ventas: 45000, compras: 38000, inventario: 125000 },
  { mes: 'Feb', ventas: 52000, compras: 42000, inventario: 133000 },
  { mes: 'Mar', ventas: 48000, compras: 45000, inventario: 138000 },
  { mes: 'Abr', ventas: 61000, compras: 39000, inventario: 146000 },
  { mes: 'May', ventas: 55000, compras: 52000, inventario: 151000 },
  { mes: 'Jun', ventas: 67000, compras: 44000, inventario: 158000 }
]

const datosCategoria: DatosCategoriaData[] = [
  { name: 'Medicamentos', value: 45, color: '#00BFA6' },
  { name: 'Equipos', value: 25, color: '#10B981' },
  { name: 'Consumibles', value: 20, color: '#3B82F6' },
  { name: 'Reactivos', value: 10, color: '#F59E0B' }
]

const datosRotacion: DatosRotacionData[] = [
  { producto: 'Ibuprofeno', rotacion: 4.2, categoria: 'Medicamento' },
  { producto: 'Guantes', rotacion: 3.8, categoria: 'Consumible' },
  { producto: 'Tensiómetro', rotacion: 2.1, categoria: 'Equipo' },
  { producto: 'Alcohol', rotacion: 5.1, categoria: 'Medicamento' },
  { producto: 'Jeringas', rotacion: 4.5, categoria: 'Consumible' }
]

const datosVencimientos: DatosVencimientosData[] = [
  { producto: 'Ibuprofeno 400mg', diasVencimiento: 45, cantidad: 500, riesgo: 'medio' },
  { producto: 'Antibiótico 500mg', diasVencimiento: 12, cantidad: 200, riesgo: 'alto' },
  { producto: 'Alcohol 70%', diasVencimiento: 120, cantidad: 50, riesgo: 'bajo' },
  { producto: 'Vitamina C', diasVencimiento: 8, cantidad: 150, riesgo: 'alto' }
]

export function ComponenteReportesInventario() {
  const { generarReporteInventario } = useInventario()
  const [tipoReporte, setTipoReporte] = useState<'inventario' | 'consumo' | 'rotacion' | 'vencimientos'>('inventario')
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<'mensual' | 'trimestral' | 'anual'>('mensual')
  const [fechaInicio, setFechaInicio] = useState(new Date('2024-01-01').toISOString().split('T')[0])
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0])
  const [reporteData, setReporteData] = useState<ReporteInventario[]>([])
  const [mostrarDetalle, setMostrarDetalle] = useState(false)

  const generarReporte = async () => {
    try {
      const reporte = await generarReporteInventario(new Date(fechaInicio), new Date(fechaFin))
      setReporteData(reporte)
      setMostrarDetalle(true)
      toast.success('Reporte generado exitosamente')
    } catch (error) {
      toast.error('Error al generar reporte')
    }
  }

  const exportarReporte = (formato: 'pdf' | 'excel') => {
    // Simulación de exportación
    toast.success(`Reporte exportado en formato ${formato.toUpperCase()}`)
  }

  const enviarReporte = () => {
    toast.success('Reporte enviado por email')
  }

  const TarjetaEstadistica = ({ titulo, valor, cambio, icono: Icono, tendencia }: {
    titulo: string
    valor: string | number
    cambio?: string
    icono: any
    tendencia?: 'up' | 'down' | 'stable'
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{titulo}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{valor}</p>
          {cambio && (
            <div className="flex items-center mt-2">
              {tendencia === 'up' && <TrendingUp size={14} className="text-success mr-1" />}
              {tendencia === 'down' && <TrendingDown size={14} className="text-danger mr-1" />}
              <span className={`text-sm ${
                tendencia === 'up' ? 'text-success' : 
                tendencia === 'down' ? 'text-danger' : 'text-gray-600'
              }`}>
                {cambio}
              </span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-lg bg-primary/10">
          <Icono className="h-6 w-6 text-primary" />
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Reportes de Inventario</h2>
          <p className="text-gray-600 mt-1">Análisis detallado y reportes del inventario médico</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={enviarReporte}
            className="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary/10 transition-colors flex items-center space-x-2"
          >
            <Mail size={16} />
            <span>Enviar</span>
          </button>
          <button
            onClick={() => exportarReporte('pdf')}
            className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors flex items-center space-x-2"
          >
            <Download size={16} />
            <span>PDF</span>
          </button>
          <button
            onClick={() => exportarReporte('excel')}
            className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors flex items-center space-x-2"
          >
            <Download size={16} />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TarjetaEstadistica
          titulo="Valor Total Inventario"
          valor="$158,450"
          cambio="+12.3% vs mes anterior"
          icono={DollarSign}
          tendencia="up"
        />
        <TarjetaEstadistica
          titulo="Rotación Promedio"
          valor="4.2x"
          cambio="+0.3 vs mes anterior"
          icono={Activity}
          tendencia="up"
        />
        <TarjetaEstadistica
          titulo="Productos Vencen"
          valor="23"
          cambio="Próximos 30 días"
          icono={Clock}
          tendencia="stable"
        />
        <TarjetaEstadistica
          titulo="Stock Bajo"
          valor="7"
          cambio="Atención requerida"
          icono={AlertTriangle}
          tendencia="down"
        />
      </div>

      {/* Selector de tipo de reporte */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generar Reporte</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Reporte</label>
            <select
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="inventario">Reporte de Inventario</option>
              <option value="consumo">Reporte de Consumo</option>
              <option value="rotacion">Análisis de Rotación</option>
              <option value="vencimientos">Productos por Vencer</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={generarReporte}
              className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
            >
              <FileText size={16} />
              <span>Generar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Gráficos y visualizaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de tendencias */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencias de Inventario</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={datosReporte}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="mes" 
                  stroke="#666"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="#666"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                  formatter={(value: any, name: string) => [`$${value.toLocaleString()}`, name]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="ventas" 
                  stroke="#00BFA6" 
                  strokeWidth={3}
                  name="Ventas"
                  dot={{ fill: '#00BFA6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#00BFA6', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="compras" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="Compras"
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="inventario" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  name="Inventario"
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribución por categorías */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Categorías</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={datosCategoria}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }: any) => `${name}: ${value}%`}
                >
                  {datosCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                  formatter={(value: any, name: string) => [`${value}%`, 'Porcentaje']}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Análisis de rotación */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Rotación</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosRotacion}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="producto" 
                  stroke="#666"
                  tick={{ fontSize: 10 }}
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                />
                <YAxis 
                  stroke="#666"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                  formatter={(value: any, name: string) => [`${value}x`, 'Rotación']}
                />
                <Bar 
                  dataKey="rotacion" 
                  fill="#00BFA6"
                  radius={[4, 4, 0, 0]}
                  name="Rotación"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Productos por vencer */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos por Vencer</h3>
          <div className="space-y-4">
            {datosVencimientos.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.producto}</h4>
                  <p className="text-sm text-gray-600">{item.cantidad} unidades</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    item.riesgo === 'alto' ? 'text-danger' :
                    item.riesgo === 'medio' ? 'text-warning' : 'text-success'
                  }`}>
                    {item.diasVencimiento} días
                  </p>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      item.riesgo === 'alto' ? 'bg-danger' :
                      item.riesgo === 'medio' ? 'bg-warning' : 'bg-success'
                    }`} />
                    <span className="text-xs text-gray-500 capitalize">{item.riesgo}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla de reporte detallado */}
      {mostrarDetalle && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Reporte Detallado</h3>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
              <Printer size={16} />
              <span>Imprimir</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Producto</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Stock Actual</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Stock Mínimo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Valor Total</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Categoría</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Proveedor</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Estado</th>
                </tr>
              </thead>
              <tbody>
                {reporteData.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900 font-medium">{item.producto}</td>
                    <td className="py-3 px-4 text-gray-600">{item.stockActual}</td>
                    <td className="py-3 px-4 text-gray-600">{item.stockMinimo}</td>
                    <td className="py-3 px-4 text-gray-600">${item.valorTotal.toFixed(2)}</td>
                    <td className="py-3 px-4 text-gray-600">{item.categoria}</td>
                    <td className="py-3 px-4 text-gray-600">{item.proveedor}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.stockActual <= item.stockMinimo ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                      }`}>
                        {item.stockActual <= item.stockMinimo ? 'Stock Bajo' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  )
}
