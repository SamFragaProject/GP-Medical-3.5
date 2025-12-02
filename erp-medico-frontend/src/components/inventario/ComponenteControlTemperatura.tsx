// Componente para control de temperatura de productos refrigerated
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Thermometer,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  CheckCircle,
  Zap,
  Snowflake,
  Sun,
  ThermometerSun,
  Gauge
} from 'lucide-react'

interface ControlTemperaturaProps {
  productosRequierenFrio: Array<{
    id: string
    nombre: string
    ubicacion: string
    temperaturaMin: number
    temperaturaMax: number
    temperaturaActual: number
    estado: 'normal' | 'alerta' | 'critico'
  }>
}

export function ComponenteControlTemperatura({ productosRequierenFrio }: ControlTemperaturaProps) {
  const [temperaturas, setTemperaturas] = useState(productosRequierenFrio)
  const [promedio, setPromedio] = useState(0)
  const [alertas, setAlertas] = useState(0)

  useEffect(() => {
    // Simular actualización de temperaturas cada 5 segundos
    const interval = setInterval(() => {
      setTemperaturas(prev => prev.map(producto => {
        const variacion = (Math.random() - 0.5) * 2 // Variación de ±1 grado
        const nuevaTemp = producto.temperaturaActual + variacion
        let nuevoEstado: 'normal' | 'alerta' | 'critico' = 'normal'
        
        if (nuevaTemp < producto.temperaturaMin - 2 || nuevaTemp > producto.temperaturaMax + 2) {
          nuevoEstado = 'critico'
        } else if (nuevaTemp < producto.temperaturaMin || nuevaTemp > producto.temperaturaMax) {
          nuevoEstado = 'alerta'
        }
        
        return {
          ...producto,
          temperaturaActual: Math.round(nuevaTemp * 10) / 10,
          estado: nuevoEstado
        }
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Calcular promedio y alertas
    const promedioTemp = temperaturas.reduce((acc, p) => acc + p.temperaturaActual, 0) / temperaturas.length
    setPromedio(Math.round(promedioTemp * 10) / 10)
    setAlertas(temperaturas.filter(p => p.estado !== 'normal').length)
  }, [temperaturas])

  const getTemperaturaColor = (temp: number, min: number, max: number) => {
    if (temp < min || temp > max) {
      return temp < min - 2 || temp > max + 2 ? 'text-red-600' : 'text-orange-600'
    }
    return 'text-green-600'
  }

  const getTemperaturaIcon = (temp: number) => {
    if (temp < 5) return <Snowflake className="h-5 w-5" />
    if (temp < 15) return <Thermometer className="h-5 w-5" />
    return <ThermometerSun className="h-5 w-5" />
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'critico': return 'bg-red-100 border-red-200 text-red-800'
      case 'alerta': return 'bg-orange-100 border-orange-200 text-orange-800'
      default: return 'bg-green-100 border-green-200 text-green-800'
    }
  }

  const getEstadoIcono = (estado: string) => {
    switch (estado) {
      case 'critico': return <AlertTriangle className="h-4 w-4" />
      case 'alerta': return <TrendingUp className="h-4 w-4" />
      default: return <CheckCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Control de Temperatura</h2>
            <p className="text-gray-600 mt-1">Monitoreo en tiempo real de productos refrigerados</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Activity className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-sm text-gray-600">Monitoreo Activo</span>
            </div>
          </div>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Promedio Actual</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{promedio}°C</p>
              </div>
              <Thermometer className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Normales</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {temperaturas.filter(p => p.estado === 'normal').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">En Alerta</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">
                  {temperaturas.filter(p => p.estado === 'alerta').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">Críticas</p>
                <p className="text-2xl font-bold text-red-900 mt-1">
                  {temperaturas.filter(p => p.estado === 'critico').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de productos refrigerados */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Productos Refrigerados</h3>
          <div className="text-sm text-gray-500">
            Última actualización: {new Date().toLocaleTimeString()}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {temperaturas.map((producto) => (
            <motion.div
              key={producto.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-lg p-4 ${getEstadoColor(producto.estado)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{producto.nombre}</h4>
                  <p className="text-sm text-gray-600">{producto.ubicacion}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getEstadoIcono(producto.estado)}
                  <span className="text-xs font-medium">
                    {producto.estado === 'critico' ? 'CRÍTICO' :
                     producto.estado === 'alerta' ? 'ALERTA' : 'NORMAL'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {/* Temperatura actual con medidor visual */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getTemperaturaIcon(producto.temperaturaActual)}
                    <span className="text-lg font-bold">
                      {producto.temperaturaActual}°C
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-600">Rango: {producto.temperaturaMin}° - {producto.temperaturaMax}°C</div>
                    <div className={`text-xs font-medium ${getTemperaturaColor(producto.temperaturaActual, producto.temperaturaMin, producto.temperaturaMax)}`}>
                      {producto.temperaturaActual < producto.temperaturaMin ? 'Muy Frío' :
                       producto.temperaturaActual > producto.temperaturaMax ? 'Muy Caliente' : 'Normal'}
                    </div>
                  </div>
                </div>

                {/* Barra de temperatura visual */}
                <div className="relative">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        producto.estado === 'critico' ? 'bg-red-500' :
                        producto.estado === 'alerta' ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{
                        width: `${Math.max(0, Math.min(100, ((producto.temperaturaActual - (producto.temperaturaMin - 5)) / 10) * 100))}%`
                      }}
                    />
                  </div>
                  {/* Marcadores de rango */}
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{producto.temperaturaMin - 5}°</span>
                    <span className="text-green-600 font-medium">{producto.temperaturaMin}°</span>
                    <span className="text-green-600 font-medium">{producto.temperaturaMax}°</span>
                    <span>{producto.temperaturaMax + 5}°</span>
                  </div>
                </div>
              </div>

              {/* Alertas */}
              {producto.estado !== 'normal' && (
                <div className="mt-3 p-2 bg-white/50 rounded-md">
                  <p className="text-xs">
                    {producto.estado === 'critico' 
                      ? '⚠️ Temperatura crítica - Acción inmediata requerida'
                      : '⚠️ Temperatura fuera de rango - Monitoreo continuo'
                    }
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Gráfico de tendencias */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencias de Temperatura</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <Gauge className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Gráfico de tendencias de temperatura</p>
            <p className="text-sm text-gray-500">Próximamente disponible</p>
          </div>
        </div>
      </div>
    </div>
  )
}
