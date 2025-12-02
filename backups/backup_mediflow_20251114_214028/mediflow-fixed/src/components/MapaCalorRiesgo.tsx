// Componente de Mapas de Calor de Riesgo
import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Map,
  Layers,
  Palette,
  Target,
  Eye,
  Download,
  Camera,
  Plus,
  Minus,
  RotateCcw,
  Save,
  Settings,
  AlertTriangle,
  Info,
  Zap,
  User,
  Briefcase,
  MousePointer,
  Square,
  Circle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface PuntoCalor {
  id: string
  x: number
  y: number
  intensidad: number
  tipo_riesgo: 'musculoesqueletico' | 'postural' | 'movimiento_repetitivo' | 'carga_visual' | 'ambiental'
  descripcion: string
  empleado?: string
  actividad?: string
}

interface MapaCalorRiesgoProps {
  evaluacionId: string
  imagenBase?: string
  onPuntosChange?: (puntos: PuntoCalor[]) => void
}

export function MapaCalorRiesgo({ evaluacionId, imagenBase, onPuntosChange }: MapaCalorRiesgoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [puntosCalor, setPuntosCalor] = useState<PuntoCalor[]>([])
  const [imagenFondo, setImagenFondo] = useState<string>(imagenBase || '')
  const [modoEdicion, setModoEdicion] = useState<'punto' | 'area' | 'seleccion'>('punto')
  const [tipoRiesgoActivo, setTipoRiesgoActivo] = useState<PuntoCalor['tipo_riesgo']>('musculoesqueletico')
  const [intensidadActiva, setIntensidadActiva] = useState(80)
  const [mostrarCapas, setMostrarCapas] = useState(true)
  const [escala, setEscala] = useState(100)
  const [posicionImagen, setPosicionImagen] = useState({ x: 0, y: 0 })

  const tiposRiesgo = [
    {
      tipo: 'musculoesqueletico' as const,
      color: '#EF4444',
      icon: AlertTriangle,
      label: 'Riesgo Musculoesquelético',
      descripcion: 'Dolor de espalda, cuello, extremidades'
    },
    {
      tipo: 'postural' as const,
      color: '#F59E0B',
      icon: User,
      label: 'Riesgo Postural',
      descripcion: 'Posturas forzadas, inadecuadas'
    },
    {
      tipo: 'movimiento_repetitivo' as const,
      color: '#8B5CF6',
      icon: Zap,
      label: 'Movimiento Repetitivo',
      descripcion: 'Gestos repetitivos, sobrecarga'
    },
    {
      tipo: 'carga_visual' as const,
      color: '#06B6D4',
      icon: Eye,
      label: 'Carga Visual',
      descripcion: 'Fatiga ocular, visión borrosa'
    },
    {
      tipo: 'ambiental' as const,
      color: '#10B981',
      icon: Briefcase,
      label: 'Riesgo Ambiental',
      descripcion: 'Condiciones ambientales adversas'
    }
  ]

  const agregarPuntoCalor = (x: number, y: number) => {
    const nuevoPunto: PuntoCalor = {
      id: Date.now().toString(),
      x,
      y,
      intensidad: intensidadActiva,
      tipo_riesgo: tipoRiesgoActivo,
      descripcion: '',
      empleado: '',
      actividad: ''
    }
    
    const nuevosPuntos = [...puntosCalor, nuevoPunto]
    setPuntosCalor(nuevosPuntos)
    onPuntosChange?.(nuevosPuntos)
    toast.success('Punto de riesgo agregado')
  }

  const eliminarPuntoCalor = (id: string) => {
    const nuevosPuntos = puntosCalor.filter(p => p.id !== id)
    setPuntosCalor(nuevosPuntos)
    onPuntosChange?.(nuevosPuntos)
    toast.success('Punto de riesgo eliminado')
  }

  const manejarClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left) * (canvas.width / rect.width)
    const y = (event.clientY - rect.top) * (canvas.height / rect.height)

    if (modoEdicion === 'punto') {
      agregarPuntoCalor(x, y)
    }
  }

  const dibujarMapaCalor = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Dibujar imagen de fondo si existe
    if (imagenFondo) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        dibujarPuntosCalor(ctx)
        dibujarControles(ctx)
      }
      img.src = imagenFondo
    } else {
      // Dibujar grid de fondo
      ctx.fillStyle = '#f8f9fa'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Grid
      ctx.strokeStyle = '#e9ecef'
      ctx.lineWidth = 1
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, canvas.height)
        ctx.stroke()
      }
      for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(canvas.width, i)
        ctx.stroke()
      }
      
      // Etiquetas de ejes
      ctx.fillStyle = '#6c757d'
      ctx.font = '12px sans-serif'
      ctx.fillText('Vista Superior del Puesto de Trabajo', 10, 20)
      
      dibujarPuntosCalor(ctx)
      dibujarControles(ctx)
    }
  }

  const dibujarPuntosCalor = (ctx: CanvasRenderingContext2D) => {
    puntosCalor.forEach((punto) => {
      const tipoRiesgo = tiposRiesgo.find(t => t.tipo === punto.tipo_riesgo)
      if (!tipoRiesgo) return

      // Radio basado en la intensidad
      const radio = (punto.intensidad / 100) * 30 + 10

      // Crear gradiente para el efecto de calor
      const gradient = ctx.createRadialGradient(punto.x, punto.y, 0, punto.x, punto.y, radio)
      gradient.addColorStop(0, tipoRiesgo.color + 'CC') // 80% opacidad
      gradient.addColorStop(0.5, tipoRiesgo.color + '88') // 53% opacidad
      gradient.addColorStop(1, tipoRiesgo.color + '44') // 27% opacidad

      // Dibujar área de calor
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(punto.x, punto.y, radio, 0, 2 * Math.PI)
      ctx.fill()

      // Dibujar punto central
      ctx.fillStyle = tipoRiesgo.color
      ctx.beginPath()
      ctx.arc(punto.x, punto.y, 4, 0, 2 * Math.PI)
      ctx.fill()

      // Dibujar borde
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.stroke()
    })
  }

  const dibujarControles = (ctx: CanvasRenderingContext2D) => {
    // Leyenda
    const leyendaX = 20
    const leyendaY = ctx.canvas.height - 120
    
    // Fondo de la leyenda
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.fillRect(leyendaX - 10, leyendaY - 10, 200, 110)
    ctx.strokeStyle = '#e9ecef'
    ctx.lineWidth = 1
    ctx.strokeRect(leyendaX - 10, leyendaY - 10, 200, 110)

    // Título
    ctx.fillStyle = '#495057'
    ctx.font = 'bold 12px sans-serif'
    ctx.fillText('Tipos de Riesgo', leyendaX, leyendaY)

    // Elementos de la leyenda
    tiposRiesgo.forEach((tipo, index) => {
      const y = leyendaY + 20 + (index * 18)
      
      // Color
      ctx.fillStyle = tipo.color
      ctx.beginPath()
      ctx.arc(leyendaX + 8, y, 6, 0, 2 * Math.PI)
      ctx.fill()
      
      // Texto
      ctx.fillStyle = '#495057'
      ctx.font = '11px sans-serif'
      ctx.fillText(tipo.label, leyendaX + 20, y + 4)
    })

    // Escala de intensidad
    ctx.fillStyle = '#495057'
    ctx.font = 'bold 12px sans-serif'
    ctx.fillText('Intensidad', leyendaX, leyendaY + 105)
    
    // Barra de intensidad
    const barraX = leyendaX + 60
    const barraY = leyendaY + 97
    const barraAncho = 100
    const barraAlto = 8
    
    // Fondo
    ctx.fillStyle = '#e9ecef'
    ctx.fillRect(barraX, barraY, barraAncho, barraAlto)
    
    // Gradiente de intensidad
    const gradiente = ctx.createLinearGradient(barraX, barraY, barraX + barraAncho, barraY)
    gradiente.addColorStop(0, '#10B981') // Verde (bajo)
    gradiente.addColorStop(0.5, '#F59E0B') // Amarillo (medio)
    gradiente.addColorStop(1, '#EF4444') // Rojo (alto)
    
    ctx.fillStyle = gradiente
    ctx.fillRect(barraX, barraY, barraAncho, barraAlto)
    
    // Marcador
    ctx.fillStyle = '#495057'
    ctx.fillRect(barraX + (intensidadActiva / 100) * barraAncho - 2, barraY - 2, 4, barraAlto + 4)
  }

  useEffect(() => {
    dibujarMapaCalor()
  }, [puntosCalor, imagenFondo, intensidadActiva])

  const exportarMapa = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `mapa-calor-riesgo-${evaluacionId}.png`
    link.href = canvas.toDataURL()
    link.click()
    toast.success('Mapa de calor exportado')
  }

  const reiniciarMapa = () => {
    setPuntosCalor([])
    toast.success('Mapa reiniciado')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-3">
              <Map className="h-6 w-6 text-primary" />
              <span>Mapa de Calor de Riesgo</span>
            </h2>
            <p className="text-gray-600 mt-1">
              Visualización gráfica de áreas de riesgo en el puesto de trabajo
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setMostrarCapas(!mostrarCapas)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                mostrarCapas ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Layers size={16} />
              <span>Capas</span>
            </button>
            <button
              onClick={exportarMapa}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
            >
              <Download size={16} />
              <span>Exportar</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Panel de controles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración del Mapa</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tipos de riesgo */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Tipos de Riesgo</h4>
            <div className="space-y-2">
              {tiposRiesgo.map((tipo) => (
                <button
                  key={tipo.tipo}
                  onClick={() => setTipoRiesgoActivo(tipo.tipo)}
                  className={`w-full p-3 rounded-lg border text-left transition-colors ${
                    tipoRiesgoActivo === tipo.tipo
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tipo.color }}
                    ></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tipo.label}</p>
                      <p className="text-xs text-gray-500">{tipo.descripcion}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Control de intensidad */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Intensidad del Riesgo</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Nivel</span>
                  <span className="text-sm font-semibold text-gray-900">{intensidadActiva}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={intensidadActiva}
                  onChange={(e) => setIntensidadActiva(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #10B981 0%, #F59E0B 50%, #EF4444 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Bajo</span>
                  <span>Medio</span>
                  <span>Alto</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => setIntensidadActiva(30)}
                  className="w-full px-3 py-2 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
                >
                  Riesgo Bajo (30%)
                </button>
                <button
                  onClick={() => setIntensidadActiva(60)}
                  className="w-full px-3 py-2 text-sm bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
                >
                  Riesgo Medio (60%)
                </button>
                <button
                  onClick={() => setIntensidadActiva(90)}
                  className="w-full px-3 py-2 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Riesgo Alto (90%)
                </button>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Acciones</h4>
            <div className="space-y-3">
              <button
                onClick={reiniciarMapa}
                className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <RotateCcw size={16} />
                <span>Reiniciar Mapa</span>
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center">
                  <Plus size={16} />
                </button>
                <button className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center">
                  <Minus size={16} />
                </button>
              </div>
              
              <button className="w-full px-3 py-2 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center space-x-2">
                <Camera size={16} />
                <span>Capturar</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Canvas principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Lienzo de Mapeo</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Modo:</span>
            <span className="text-sm font-semibold text-primary capitalize">{modoEdicion}</span>
          </div>
        </div>
        
        <div className="relative bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onClick={manejarClick}
            className="cursor-crosshair w-full h-auto"
            style={{ maxHeight: '600px' }}
          />
          
          {!imagenFondo && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <Map className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  Haga clic para agregar puntos de riesgo
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  O cargue una imagen del puesto de trabajo
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Lista de puntos de riesgo */}
      {puntosCalor.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Puntos de Riesgo Identificados ({puntosCalor.length})
          </h3>
          
          <div className="space-y-3">
            {puntosCalor.map((punto, index) => {
              const tipoRiesgo = tiposRiesgo.find(t => t.tipo === punto.tipo_riesgo)
              return (
                <div
                  key={punto.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tipoRiesgo?.color }}
                    ></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Punto {index + 1}: {tipoRiesgo?.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        Intensidad: {punto.intensidad}% | Posición: ({Math.round(punto.x)}, {Math.round(punto.y)})
                      </p>
                      {punto.descripcion && (
                        <p className="text-xs text-gray-600 mt-1">{punto.descripcion}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => eliminarPuntoCalor(punto.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Square size={16} />
                  </button>
                </div>
              )
            })}
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Guardar Borrador
            </button>
            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2">
              <Save size={16} />
              <span>Guardar Mapa</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}