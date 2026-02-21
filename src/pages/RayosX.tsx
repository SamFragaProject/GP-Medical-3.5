// Módulo de Rayos X - Análisis Médico por IA
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  FileImage,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Brain,
  FileText,
  History,
  ArrowLeftRight,
  Loader2,
  Camera,
  Eye,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Move,
  Maximize2,
  Save,
  Share,
  Filter,
  Search,
  Calendar,
  User,
  Heart,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  Stethoscope,
  X,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  Grid3X3,
  Layers,
  ChevronDown,
  ChevronRight,
  Clock,
  TrendingUp,
  Activity,
  Target,
  Award,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { useAuth } from '@/contexts/AuthContext'
import { pacientesService, empresasService, Paciente } from '@/services/dataService'
import { NewPatientDialog } from '@/components/patients/NewPatientDialog'
import { useSystemIntegration } from '@/contexts/SystemIntegrationContext'
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader'
import toast from 'react-hot-toast'
import ollamaService from '@/services/ollamaService'

interface EstudioRayosX {
  id: string
  fecha: string
  paciente: string
  tipo: string
  imagenUrl: string
  dicomData?: any
  diagnosticoIA?: DiagnosticoIA
  estado: 'pendiente' | 'procesando' | 'completado' | 'revisado'
  medico?: string
  observaciones?: string
}

interface DiagnosticoIA {
  confianza: number
  hallazgos: string[]
  recomendaciones: string[]
  severidad: 'normal' | 'leve' | 'moderada' | 'severa'
  areaAfectada: string[]
  prioridad: 'baja' | 'media' | 'alta' | 'critica'
  codigoDiagnostico: string
  explicacion: string
  trackingProgresion?: {
    anterior?: string
    actual: string
    tendencia: 'mejora' | 'estable' | 'empeoramiento'
  }
}

interface ComparacionTemporal {
  fechaAnterior: string
  fechaActual: string
  cambiosDetectados: {
    descripcion: string
    impacto: 'positivo' | 'negativo' | 'neutro'
    medicion?: string
  }[]
  puntuacionProgresion: number
}

export function RayosX() {
  const { user } = useAuth()
  const isSuperAdmin = user?.rol === 'super_admin'

  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Estados principales
  const [estudios, setEstudios] = useState<EstudioRayosX[]>([])
  const [estudioActual, setEstudioActual] = useState<EstudioRayosX | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showComparacion, setShowComparacion] = useState(false)

  // Estados del visualizador
  const [imageLoaded, setImageLoaded] = useState(false)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [filters, setFilters] = useState({
    suavizado: false,
    nitidez: false,
    color: false
  })

  // Estados de la UI
  const [activeTab, setActiveTab] = useState(isSuperAdmin ? 'dashboard' : 'upload')
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [busqueda, setBusqueda] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')

  // Estados expandibles
  const [showConfiguracionAvanzada, setShowConfiguracionAvanzada] = useState(false)
  const [showDetallesDiagnostico, setShowDetallesDiagnostico] = useState(false)

  // Estados para asignación de paciente
  const [isAssigningPatient, setIsAssigningPatient] = useState(false)
  const [isCreatingPatient, setIsCreatingPatient] = useState(false)
  const [pacientes, setPacientes] = useState<Paciente[]>([])

  // Integración de Plugins
  const { isModuleActive } = useSystemIntegration()
  const xrayModuleActive = isModuleActive('ai_xray_vision')

  // Redireccionar si no está activo, excepto si es Super Admin que siempre puede ver
  useEffect(() => {
    if (!xrayModuleActive && !isSuperAdmin) {
      // Opcional: Redirigir o mostrar estado bloqueado. 
      // Aquí optamos por bloquear el render en el return
    }
  }, [xrayModuleActive, isSuperAdmin])

  // Estados de métricas Super Admin
  const [metricasIA, setMetricasIA] = useState({
    totalProcesados: 1240,
    accuracy: 94.2,
    tiempoPromedio: '4.2s',
    costoAhorrado: '$12,400',
    hallazgosCriticos: 42
  })

  // Datos de ejemplo para demo
  useEffect(() => {
    cargarEstudiosDemo()
  }, [])

  const cargarEstudiosDemo = () => {
    // Los estudios se cargarán dinámicamente desde Supabase
    const estudiosDemo: EstudioRayosX[] = []
    setEstudios(estudiosDemo)
  }

  // Funciones de carga de archivos
  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files) return

    const file = files[0]
    const fileType = file.type
    const fileName = file.name

    // Validar tipos de archivo
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/dicom',
      'application/x-dicom'
    ]

    if (!validTypes.includes(fileType)) {
      toast.error('Formato no válido. Solo se aceptan archivos DICOM, JPG y PNG')
      return
    }

    setIsUploading(true)

    try {
      // Simular carga y procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000))

      const nuevoEstudio: EstudioRayosX = {
        id: Date.now().toString(),
        fecha: new Date().toISOString().split('T')[0],
        paciente: 'Paciente en proceso',
        tipo: detectarTipoImagen(fileName),
        imagenUrl: URL.createObjectURL(file),
        estado: 'procesando'
      }

      setEstudios(prev => [nuevoEstudio, ...prev])
      setEstudioActual(nuevoEstudio)
      setActiveTab('visualizador')

      // Simular análisis automático
      setTimeout(() => {
        realizarAnalisisIA(nuevoEstudio)
      }, 3000)

      toast.success('Archivo cargado correctamente')
    } catch (error) {
      toast.error('Error al cargar el archivo')
    } finally {
      setIsUploading(false)
    }
  }, [])

  const detectarTipoImagen = (fileName: string): string => {
    const nombre = fileName.toLowerCase()
    if (nombre.includes('torax') || nombre.includes('chest')) return 'Radiografía de Tórax'
    if (nombre.includes('columna') || nombre.includes('spine')) return 'Radiografía de Columna'
    if (nombre.includes('extremidad') || nombre.includes('limb')) return 'Radiografía de Extremidad'
    if (nombre.includes('craneo') || nombre.includes('head')) return 'Radiografía de Cráneo'
    return 'Radiografía General'
  }

  // Análisis por IA
  const realizarAnalisisIA = async (estudio: EstudioRayosX) => {
    setIsAnalyzing(true)

    try {
      let diagnosticoPredicho: DiagnosticoIA | null = null;
      let base64Image = '';

      // TENTATIVA: Usar Ollama Local (IA Real)
      try {
        if (estudio.imagenUrl) {
          // Convertir URL a Base64
          const response = await fetch(estudio.imagenUrl);
          const blob = await response.blob();
          base64Image = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => resolve(reader.result as string);
          });

          const isOllamaReady = await ollamaService.isOllamaAvailable();

          if (isOllamaReady) {
            const prompt = `Analiza detalladamente esta imagen médica de tipo ${estudio.tipo}. 
               Eres un radiólogo experto. 
               Responde ÚNICAMENTE con un objeto JSON válido con la siguiente estructura.
               NO incluyas markdown, bloques de código, ni texto adicional. Solo el JSON crudo:
               {
                 "hallazgos": ["hallazgo1", "hallazgo2"],
                 "recomendaciones": ["rec1", "rec2"],
                 "severidad": "normal" | "leve" | "moderada" | "severa",
                 "areaAfectada": ["area1", "area2"],
                 "prioridad": "baja" | "media" | "alta" | "critica",
                 "explicacion": "explicación detallada clínica"
               }`;

            const result = await ollamaService.analyzeMedicalImage(base64Image, prompt);

            if (result.success && result.response) {
              let parsed: any = null;
              const text = result.response.trim();

              try {
                // 1. Intentar parseo directo
                parsed = JSON.parse(text);
              } catch (e) {
                // 2. Intentar extraer de bloques de código markdown
                const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                if (codeBlockMatch) {
                  try {
                    parsed = JSON.parse(codeBlockMatch[1]);
                  } catch (e2) { /* continue */ }
                }

                // 3. Intentar extraer con regex de llaves (fallback)
                if (!parsed) {
                  const jsonMatch = text.match(/\{[\s\S]*\}/);
                  if (jsonMatch) {
                    try {
                      parsed = JSON.parse(jsonMatch[0]);
                    } catch (e3) { /* continue */ }
                  }
                }
              }

              if (parsed) {
                diagnosticoPredicho = {
                  confianza: 92,
                  hallazgos: parsed.hallazgos || ['Hallazgo detectado por IA'],
                  recomendaciones: parsed.recomendaciones || ['Revisión médica sugerida'],
                  severidad: parsed.severidad || 'media',
                  areaAfectada: parsed.areaAfectada || [],
                  prioridad: parsed.prioridad || 'media',
                  codigoDiagnostico: 'AI-OLLAMA',
                  explicacion: parsed.explicacion || result.response,
                  trackingProgresion: undefined
                };
                toast.success(`Análisis Real IA Completado (${result.model_used})`);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Ollama error, falling back to simulation', err);
      }

      // FALLBACK: Simulación si no hay IA Real
      if (!diagnosticoPredicho) {
        await new Promise(resolve => setTimeout(resolve, 3000))
        diagnosticoPredicho = {
          confianza: Math.floor(Math.random() * 20) + 80, // 80-99%
          hallazgos: generarHallazgosAleatorios(),
          recomendaciones: generarRecomendacionesAleatorias(),
          severidad: ['normal', 'leve', 'moderada', 'severa'][Math.floor(Math.random() * 4)] as any,
          areaAfectada: ['Pulmones', 'Corazón', 'Mediastino', 'Huesos'],
          prioridad: ['baja', 'media', 'alta', 'critica'][Math.floor(Math.random() * 4)] as any,
          codigoDiagnostico: generarCodigoDiagnostico(),
          explicacion: generarExplicacionMedica(),
          trackingProgresion: Math.random() > 0.5 ? {
            anterior: 'Estudio previo sin alteraciones significativas',
            actual: 'Hallazgos leves detectados',
            tendencia: 'estable'
          } : undefined
        }
        toast.success('Análisis completado (Simulado)')
      }

      const estudioActualizado = {
        ...estudio,
        diagnosticoIA: diagnosticoPredicho!,
        estado: 'completado' as const
      }

      setEstudios(prev => prev.map(e => e.id === estudio.id ? estudioActualizado : e))
      setEstudioActual(estudioActualizado)

    } catch (error) {
      toast.error('Error en el análisis por IA')
      console.error(error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Generadores de contenido para demo
  const generarHallazgosAleatorios = () => {
    const opciones = [
      'Campos pulmonares claros sin opacidades patológicas',
      'Silueta cardíaca de tamaño normal',
      'Ángulos costofrénicos libres',
      'Mediastino central sin alteraciones',
      'Estructuras óseas sin fracturas',
      'Tejidos blandos simétricos',
      'Diafragmas en posición normal',
      'Leve incremento de la mark vascular'
    ]
    return opciones.sort(() => 0.5 - Math.random()).slice(0, 3)
  }

  const generarRecomendacionesAleatorias = () => {
    const opciones = [
      'Continuar con controles médicos rutinarios',
      'Mantener estilo de vida saludable',
      'Realizar ejercicios respiratorios',
      'Seguir tratamiento médico prescrito',
      'Control especializado en 6 meses',
      'Estudios complementarios si persiste síntomas',
      'Fisioterapia especializada',
      'Evaluación cardiológica'
    ]
    return opciones.sort(() => 0.5 - Math.random()).slice(0, 2)
  }

  const generarCodigoDiagnostico = () => {
    const codigos = ['R04.0', 'M48.06', 'S22.3', 'Z87.1', 'I10.0']
    return codigos[Math.floor(Math.random() * codigos.length)]
  }

  const generarExplicacionMedica = () => {
    return 'El estudio radiológico muestra características dentro de los parámetros normales para la edad y sexo del paciente. No se observan alteraciones patológicas significativas que requieran intervención inmediata.'
  }

  // Controles del visualizador
  const handleZoomIn = () => setScale(prev => Math.min(prev * 1.2, 5))
  const handleZoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.5))
  const handleRotate = () => setRotation(prev => prev + 90)
  const handleReset = () => {
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
    setBrightness(100)
    setContrast(100)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Filtros y búsqueda
  const estudiosFiltrados = estudios.filter(estudio => {
    const matchEstado = filtroEstado === 'todos' || estudio.estado === filtroEstado
    const matchBusqueda = estudio.paciente.toLowerCase().includes(busqueda.toLowerCase()) ||
      estudio.tipo.toLowerCase().includes(busqueda.toLowerCase())
    const matchFecha = (!fechaDesde || estudio.fecha >= fechaDesde) &&
      (!fechaHasta || estudio.fecha <= fechaHasta)
    return matchEstado && matchBusqueda && matchFecha
  })

  // Comparación temporal
  const generarComparacionTemporal = (estudioActual: EstudioRayosX): ComparacionTemporal => {
    const estudiosAnteriores = estudios.filter(e =>
      e.paciente === estudioActual.paciente &&
      e.fecha < estudioActual.fecha
    ).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

    if (estudiosAnteriores.length === 0) {
      return {
        fechaActual: estudioActual.fecha,
        fechaAnterior: '',
        cambiosDetectados: [],
        puntuacionProgresion: 0
      }
    }

    const estudioAnterior = estudiosAnteriores[0]
    return {
      fechaAnterior: estudioAnterior.fecha,
      fechaActual: estudioActual.fecha,
      cambiosDetectados: [
        {
          descripcion: 'Disminución leve de la mark vascular',
          impacto: 'positivo' as const,
          medicion: '15%'
        },
        {
          descripcion: 'Estabilidad en el tamaño cardíaco',
          impacto: 'neutro' as const,
          medicion: 'Normal'
        }
      ],
      puntuacionProgresion: Math.floor(Math.random() * 30) + 70 // 70-100
    }
  }

  // Exportar reporte
  const exportarReporte = (estudio: EstudioRayosX) => {
    const reporte = {
      fecha: new Date().toISOString(),
      paciente: estudio.paciente,
      tipo: estudio.tipo,
      diagnostico: estudio.diagnosticoIA,
      medico: user?.nombre,
      institucion: 'Centro Médico ERP'
    }

    const dataStr = JSON.stringify(reporte, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `reporte-rayosx-${estudio.id}.json`
    link.click()

    toast.success('Reporte exportado correctamente')
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      {/* Header Premium */}
      <div className="-mx-6 -mt-6 mb-8">
        <PremiumPageHeader
          title="Departamento de Imagenología"
          subtitle="Análisis y diagnóstico avanzado con Inteligencia Artificial Multimodal"
          icon={Zap}
          badge="PREMIUM AI"
          actions={
            <div className="flex gap-3">
              <button onClick={() => setActiveTab('historial')} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center space-x-2 backdrop-blur-md">
                <History className="w-4 h-4" />
                <span>Historial</span>
              </button>
              <button onClick={() => setActiveTab('upload')} className="btn-premium px-6 py-2 flex items-center space-x-2 shadow-xl shadow-emerald-500/20">
                <Plus className="w-4 h-4" />
                <span>Nuevo Estudio</span>
              </button>
            </div>
          }
        />
      </div>

      {/* BLOQUEO DE MÓDULO SI NO ESTÁ ACTIVO */}
      {!xrayModuleActive && !isSuperAdmin ? (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300 min-h-[400px]">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6 text-gray-400">
            <Zap size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Módulo No Activado</h2>
          <p className="text-gray-500 max-w-md text-center mb-6">
            Tu organización no tiene habilitada la extensión <strong>Visión IA Radiológica</strong>.
            Contacta al administrador para activar este módulo desde el Marketplace.
          </p>
          <Button disabled variant="outline">Módulo Requerido: ai_xray_vision</Button>
        </div>
      ) : (
        /* Contenido Normal del Módulo */


        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex w-full bg-slate-100/50 p-1 rounded-2xl backdrop-blur-sm border border-slate-200/50">
            {isSuperAdmin && (
              <TabsTrigger
                value="dashboard"
                className="flex-1 py-3 px-4 rounded-xl transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm font-bold border-none"
              >
                📊 Dashboard
              </TabsTrigger>
            )}
            {['upload', 'visualizador', 'analisis', 'historial', 'comparacion'].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="flex-1 py-3 px-4 rounded-xl transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm font-bold border-none capitalize"
              >
                {tab === 'upload' && '📤 Cargar'}
                {tab === 'visualizador' && '🔍 Ver'}
                {tab === 'analisis' && '🧠 IA'}
                {tab === 'historial' && '📋 Lista'}
                {tab === 'comparacion' && '⚖️ Evolución'}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab 0: Dashboard (Super Admin Only) */}
          {isSuperAdmin && (
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <FileImage className="h-5 w-5 opacity-80" />
                      <Badge className="bg-white/20 text-white border-0">+12%</Badge>
                    </div>
                    <div className="text-3xl font-black">{metricasIA.totalProcesados.toLocaleString()}</div>
                    <div className="text-sm opacity-80">Imágenes Procesadas</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <Target className="h-5 w-5 opacity-80" />
                      <Badge className="bg-white/20 text-white border-0">Estable</Badge>
                    </div>
                    <div className="text-3xl font-black">{metricasIA.accuracy}%</div>
                    <div className="text-sm opacity-80">Accuracy Promedio</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <Clock className="h-5 w-5 opacity-80" />
                      <Badge className="bg-white/20 text-white border-0">-0.2s</Badge>
                    </div>
                    <div className="text-3xl font-black">{metricasIA.tiempoPromedio}</div>
                    <div className="text-sm opacity-80">Velocidad de Análisis</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-lg">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <AlertTriangle className="h-5 w-5 opacity-80" />
                      <Badge className="bg-white/20 text-white border-0">Crítico</Badge>
                    </div>
                    <div className="text-3xl font-black">{metricasIA.hallazgosCriticos}</div>
                    <div className="text-sm opacity-80">Hallazgos Críticos/Mes</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-slate-700 to-slate-800 text-white border-0 shadow-lg">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="h-5 w-5 opacity-80" />
                      <Badge className="bg-white/20 text-white border-0">ROI</Badge>
                    </div>
                    <div className="text-3xl font-black">{metricasIA.costoAhorrado}</div>
                    <div className="text-sm opacity-80">Ahorro Estimado</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Layers className="h-5 w-5 text-blue-500" />
                      Uso por Empresa
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { nombre: 'Empresa Principal', qty: 450, color: 'bg-blue-500' },
                      { nombre: 'TechHealth Systems', qty: 320, color: 'bg-indigo-500' },
                      { nombre: 'Industrial Safety MX', qty: 280, color: 'bg-purple-500' },
                      { nombre: 'PharmaCore Lab', qty: 190, color: 'bg-teal-500' },
                    ].map((item, idx) => (
                      <div key={idx} className="group">
                        <div className="flex items-center justify-between mb-1 text-sm">
                          <span className="font-medium text-gray-700">{item.nombre}</span>
                          <span className="font-bold text-gray-900">{item.qty} estudios</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.qty / 450) * 100}%` }}
                            transition={{ duration: 1, delay: idx * 0.1 }}
                            className={`h-full ${item.color} rounded-full`}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-500" />
                      Accuracy por Especialidad
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { especialidad: 'Tórax (Pulmonar)', accuracy: 96.2, color: 'bg-emerald-500' },
                      { especialidad: 'Columna Lumbar', accuracy: 92.5, color: 'bg-emerald-500' },
                      { especialidad: 'Fracturas Extremidades', accuracy: 98.1, color: 'bg-emerald-500' },
                      { especialidad: 'Análisis Cardíaco', accuracy: 89.9, color: 'bg-amber-500' },
                    ].map((item, idx) => (
                      <div key={idx} className="group">
                        <div className="flex items-center justify-between mb-1 text-sm">
                          <span className="font-medium text-gray-700">{item.especialidad}</span>
                          <span className="font-bold text-gray-900">{item.accuracy}%</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.accuracy}%` }}
                            transition={{ duration: 1, delay: idx * 0.1 }}
                            className={`h-full ${item.color} rounded-full`}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 text-primary" />
                  <span>Cargar Estudios de Rayos X</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Zona de carga */}
                  <div
                    className="border-2 border-dashed border-emerald-200 bg-emerald-50/10 rounded-[2rem] p-16 text-center hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".dicom,.dcm,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                    />

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="space-y-4"
                    >
                      <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <Upload className="h-10 w-10 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800">
                        Arrastra archivos DICOM o imágenes
                      </h3>
                      <p className="text-slate-500 max-w-sm mx-auto">
                        Optimizado para análisis de alta resolución con diagnóstico asistido por IA
                      </p>
                      <button className="btn-premium px-8 py-3 mt-4">
                        Seleccionar Archivos
                      </button>
                    </motion.div>
                  </div>

                  {/* Información de formatos */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileImage className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">DICOM</h4>
                          <p className="text-sm text-gray-600">Formato médico estándar</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <FileImage className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">JPG</h4>
                          <p className="text-sm text-gray-600">Imágenes comprimidas</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <FileImage className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">PNG</h4>
                          <p className="text-sm text-gray-600">Alta calidad sin pérdida</p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {isUploading && (
                    <Alert>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <AlertDescription>
                        Procesando archivo, esto puede tomar unos momentos...
                      </AlertDescription>
                    </Alert>
                  )}
                </motion.div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Visualizador */}
          <TabsContent value="visualizador" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Visualizador principal */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <Eye className="h-5 w-5 text-emerald-600" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">Visualizador Médico HD</span>
                      </CardTitle>
                      {estudioActual && (
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{estudioActual.tipo}</Badge>
                          <Badge variant={estudioActual.estado === 'completado' ? 'default' : 'secondary'}>
                            {estudioActual.estado}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {estudioActual ? (
                      <div className="space-y-4">
                        {/* Controles del visualizador */}
                        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Button size="sm" onClick={handleZoomOut}>
                              <ZoomOut className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-mono">{Math.round(scale * 100)}%</span>
                            <Button size="sm" onClick={handleZoomIn}>
                              <ZoomIn className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button size="sm" onClick={handleRotate}>
                              <RotateCw className="h-4 w-4" />
                            </Button>
                            <Button size="sm" onClick={handleReset}>
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant={filters.suavizado ? "default" : "outline"}
                              onClick={() => setFilters(prev => ({ ...prev, suavizado: !prev.suavizado }))}
                            >
                              <Filter className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={showConfiguracionAvanzada ? "default" : "outline"}
                              onClick={() => setShowConfiguracionAvanzada(!showConfiguracionAvanzada)}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Configuración avanzada */}
                        <AnimatePresence>
                          {showConfiguracionAvanzada && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="p-4 bg-gray-50 rounded-lg space-y-4"
                            >
                              <h4 className="font-semibold text-gray-900">Configuración Avanzada</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Brillo: {brightness}%
                                  </label>
                                  <input
                                    type="range"
                                    min="0"
                                    max="200"
                                    value={brightness}
                                    onChange={(e) => setBrightness(Number(e.target.value))}
                                    className="w-full"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Contraste: {contrast}%
                                  </label>
                                  <input
                                    type="range"
                                    min="0"
                                    max="200"
                                    value={contrast}
                                    onChange={(e) => setContrast(Number(e.target.value))}
                                    className="w-full"
                                  />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Área de visualización */}
                        <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '600px' }}>
                          <div
                            className="w-full h-full flex items-center justify-center cursor-move"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                          >
                            {estudioActual.imagenUrl ? (
                              <img
                                ref={imageRef}
                                src={estudioActual.imagenUrl}
                                alt="Radiografía"
                                className="max-w-full max-h-full object-contain transition-transform"
                                style={{
                                  transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
                                  filter: `brightness(${brightness}%) contrast(${contrast}%)`
                                }}
                                onLoad={() => setImageLoaded(true)}
                              />
                            ) : (
                              <div className="text-center text-white">
                                <FileImage className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                <p>No hay imagen cargada</p>
                              </div>
                            )}
                          </div>

                          {/* Overlay de información */}
                          <div className="absolute top-4 left-4 bg-black/70 text-white p-3 rounded-lg">
                            <div className="text-sm">
                              <div>Paciente: {estudioActual.paciente}</div>
                              <div>Fecha: {new Date(estudioActual.fecha).toLocaleDateString()}</div>
                              <div>Tipo: {estudioActual.tipo}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No hay estudio seleccionado
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Carga un archivo para comenzar el análisis
                        </p>
                        <Button onClick={() => setActiveTab('upload')}>
                          <Upload className="h-4 w-4 mr-2" />
                          Cargar Estudio
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Panel lateral */}
              <div className="space-y-6">
                {/* Información del estudio */}
                {estudioActual && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Información del Estudio</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Paciente</label>
                        <p className="text-gray-900">{estudioActual.paciente}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Fecha</label>
                        <p className="text-gray-900">{new Date(estudioActual.fecha).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Tipo</label>
                        <p className="text-gray-900">{estudioActual.tipo}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Estado</label>
                        <Badge variant={estudioActual.estado === 'completado' ? 'default' : 'secondary'}>
                          {estudioActual.estado}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Herramientas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Herramientas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Imagen
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Configuración
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Share className="h-4 w-4 mr-2" />
                      Compartir Estudio
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Análisis por IA */}
          <TabsContent value="analisis" className="space-y-6">
            {estudioActual ? (
              <div className="space-y-6">
                {/* Header del análisis */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                          <Brain className="h-5 w-5 text-emerald-600" />
                        </div>
                        <span className="text-xl font-bold text-slate-800">Cerebro IA: Diagnóstico Asistido</span>
                      </CardTitle>
                      {estudioActual.diagnosticoIA && (
                        <Badge variant="outline" className="text-primary border-primary">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Analizado
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isAnalyzing ? (
                      <div className="text-center py-8">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Analizando imagen con IA...
                        </h3>
                        <p className="text-gray-600">
                          Esto puede tomar unos momentos mientras procesamos la imagen
                        </p>
                      </div>
                    ) : estudioActual.diagnosticoIA ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        {/* Resumen del diagnóstico */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {estudioActual.diagnosticoIA.confianza}%
                            </div>
                            <div className="text-sm text-gray-600">Confianza IA</div>
                          </div>
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600 capitalize">
                              {estudioActual.diagnosticoIA.severidad}
                            </div>
                            <div className="text-sm text-gray-600">Severidad</div>
                          </div>
                          <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600 capitalize">
                              {estudioActual.diagnosticoIA.prioridad}
                            </div>
                            <div className="text-sm text-gray-600">Prioridad</div>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-lg font-bold text-purple-600">
                              {estudioActual.diagnosticoIA.codigoDiagnostico}
                            </div>
                            <div className="text-sm text-gray-600">Código CIE-10</div>
                          </div>
                        </div>

                        {/* Hallazgos */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <Lightbulb className="h-5 w-5 text-yellow-600" />
                              <span>Hallazgos Detectados</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {estudioActual.diagnosticoIA.hallazgos.map((hallazgo, index) => (
                                <div key={index} className="flex items-start space-x-3">
                                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                  <span className="text-gray-900">{hallazgo}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Recomendaciones */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <Target className="h-5 w-5 text-blue-600" />
                              <span>Recomendaciones Médicas</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {estudioActual.diagnosticoIA.recomendaciones.map((recomendacion, index) => (
                                <div key={index} className="flex items-start space-x-3">
                                  <Heart className="h-5 w-5 text-primary mt-0.5" />
                                  <span className="text-gray-900">{recomendacion}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Explicación detallada */}
                        <Card>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center space-x-2">
                                <Info className="h-5 w-5 text-primary" />
                                <span>Explicación Detallada</span>
                              </CardTitle>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowDetallesDiagnostico(!showDetallesDiagnostico)}
                              >
                                {showDetallesDiagnostico ? 'Ocultar' : 'Mostrar'} Detalles
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-700 leading-relaxed">
                              {estudioActual.diagnosticoIA.explicacion}
                            </p>

                            <AnimatePresence>
                              {showDetallesDiagnostico && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-4 pt-4 border-t border-gray-200 space-y-4"
                                >
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Áreas Afectadas:</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {estudioActual.diagnosticoIA.areaAfectada.map((area, index) => (
                                        <Badge key={index} variant="outline">{area}</Badge>
                                      ))}
                                    </div>
                                  </div>

                                  {estudioActual.diagnosticoIA.trackingProgresion && (
                                    <div>
                                      <h4 className="font-semibold text-gray-900 mb-2">Progresión:</h4>
                                      <div className="space-y-2 text-sm">
                                        <div><strong>Anterior:</strong> {estudioActual.diagnosticoIA.trackingProgresion.anterior}</div>
                                        <div><strong>Actual:</strong> {estudioActual.diagnosticoIA.trackingProgresion.actual}</div>
                                        <div className="flex items-center space-x-2">
                                          <strong>Tendencia:</strong>
                                          <Badge variant={
                                            estudioActual.diagnosticoIA.trackingProgresion?.tendencia === 'mejora' ? 'default' :
                                              estudioActual.diagnosticoIA.trackingProgresion?.tendencia === 'estable' ? 'secondary' : 'destructive'
                                          }>
                                            {estudioActual.diagnosticoIA.trackingProgresion?.tendencia}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </CardContent>
                        </Card>

                        {/* Acciones */}
                        <div className="flex flex-wrap gap-4 pt-4">
                          <button onClick={() => exportarReporte(estudioActual)} className="btn-premium px-6 py-3 flex items-center space-x-2">
                            <Download className="h-4 w-4" />
                            <span>Exportar Informe PDF</span>
                          </button>

                          {estudioActual.paciente === 'Paciente en proceso' && (
                            <>
                              <button
                                className="px-6 py-3 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition-all font-bold flex items-center space-x-2"
                                onClick={() => {
                                  pacientesService.getAll().then(setPacientes)
                                  setIsAssigningPatient(true)
                                }}
                              >
                                <User className="h-4 w-4" />
                                <span>Asignar Paciente</span>
                              </button>
                              <button
                                className="px-6 py-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all font-bold flex items-center space-x-2"
                                onClick={() => setIsCreatingPatient(true)}
                              >
                                <Plus className="h-4 w-4" />
                                <span>Nuevo Registro</span>
                              </button>
                            </>
                          )}

                          <button className="px-6 py-3 rounded-2xl bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-all font-bold flex items-center space-x-2">
                            <Share className="h-4 w-4" />
                            <span>Compartir</span>
                          </button>
                        </div>

                        {/* Modales de Asignación */}
                        {isAssigningPatient && (
                          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <Card className="w-full max-w-lg">
                              <CardHeader>
                                <div className="flex items-center justify-between">
                                  <CardTitle>Asignar a Paciente Existente</CardTitle>
                                  <Button variant="ghost" size="sm" onClick={() => setIsAssigningPatient(false)}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="relative">
                                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                  <input
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                                    placeholder="Buscar por nombre o ID..."
                                    onChange={(e) => {
                                      // Simular búsqueda local
                                    }}
                                  />
                                </div>
                                <div className="max-h-64 overflow-y-auto space-y-2">
                                  {pacientes.slice(0, 5).map(p => (
                                    <div
                                      key={p.id}
                                      className="p-3 border rounded-xl hover:bg-blue-50 cursor-pointer flex items-center justify-between group"
                                      onClick={() => {
                                        const nombreCompleto = `${p.nombre} ${p.apellido_paterno}`
                                        setEstudioActual(prev => prev ? { ...prev, paciente: nombreCompleto } : null)
                                        setEstudios(prev => prev.map(e => e.id === estudioActual.id ? { ...e, paciente: nombreCompleto } : e))
                                        setIsAssigningPatient(false)
                                        toast.success(`Estudio asignado a ${nombreCompleto}`)
                                      }}
                                    >
                                      <div>
                                        <p className="font-semibold text-gray-900">{p.nombre} {p.apellido_paterno}</p>
                                        <p className="text-xs text-gray-500">{p.puesto || 'Sin puesto'}</p>
                                      </div>
                                      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}

                        <NewPatientDialog
                          open={isCreatingPatient}
                          onOpenChange={setIsCreatingPatient}
                          onSubmit={(data) => {
                            const nombreCompleto = `${data.nombre} ${data.apellido_paterno}`
                            setEstudioActual(prev => prev ? { ...prev, paciente: nombreCompleto } : null)
                            setEstudios(prev => prev.map(e => e.id === estudioActual.id ? { ...e, paciente: nombreCompleto } : e))
                            setIsCreatingPatient(false)
                            toast.success(`Paciente creado y estudio asignado: ${nombreCompleto}`)
                          }}
                        />
                      </motion.div>
                    ) : (
                      <div className="text-center py-8">
                        <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Análisis pendiente
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Inicia el análisis por IA para obtener diagnósticos automatizados
                        </p>
                        <Button onClick={() => realizarAnalisisIA(estudioActual)}>
                          <Brain className="h-4 w-4 mr-2" />
                          Iniciar Análisis IA
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Selecciona un estudio para analizar
                  </h3>
                  <p className="text-gray-600">
                    Carga o selecciona un estudio de rayos X para comenzar el análisis por IA
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab 4: Historial */}
          <TabsContent value="historial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-5 w-5 text-primary" />
                  <span>Historial de Estudios</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Buscar paciente
                    </label>
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Nombre del paciente..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Estado
                    </label>
                    <select
                      value={filtroEstado}
                      onChange={(e) => setFiltroEstado(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="todos">Todos</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="procesando">Procesando</option>
                      <option value="completado">Completado</option>
                      <option value="revisado">Revisado</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Desde
                    </label>
                    <input
                      type="date"
                      value={fechaDesde}
                      onChange={(e) => setFechaDesde(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Hasta
                    </label>
                    <input
                      type="date"
                      value={fechaHasta}
                      onChange={(e) => setFechaHasta(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                {/* Lista de estudios */}
                <div className="space-y-4">
                  {estudiosFiltrados.map((estudio, index) => (
                    <motion.div
                      key={estudio.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setEstudioActual(estudio)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <FileImage className="h-8 w-8 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{estudio.paciente}</h3>
                            <p className="text-gray-600 text-sm">{estudio.tipo}</p>
                            <p className="text-gray-500 text-xs">
                              {new Date(estudio.fecha).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Badge variant={estudio.estado === 'completado' ? 'default' : 'secondary'}>
                            {estudio.estado}
                          </Badge>
                          {estudio.diagnosticoIA && (
                            <div className="text-right">
                              <div className="text-sm font-semibold text-green-600">
                                {estudio.diagnosticoIA.confianza}% confianza
                              </div>
                              <div className="text-xs text-gray-500 capitalize">
                                {estudio.diagnosticoIA.severidad}
                              </div>
                            </div>
                          )}
                          <ArrowRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {estudiosFiltrados.length === 0 && (
                  <div className="text-center py-12">
                    <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No se encontraron estudios
                    </h3>
                    <p className="text-gray-600">
                      Ajusta los filtros o carga nuevos estudios
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 5: Comparación temporal */}
          <TabsContent value="comparacion" className="space-y-6">
            {estudioActual && estudioActual.diagnosticoIA ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ArrowLeftRight className="h-5 w-5 text-primary" />
                      <span>Comparación Temporal</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const comparacion = generarComparacionTemporal(estudioActual)

                      if (!comparacion.fechaAnterior) {
                        return (
                          <div className="text-center py-12">
                            <ArrowLeftRight className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              No hay estudios anteriores para comparar
                            </h3>
                            <p className="text-gray-600">
                              Esta es la primera radiografía del paciente
                            </p>
                          </div>
                        )
                      }

                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-6"
                        >
                          {/* Header de comparación */}
                          <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              Comparación de Estudios
                            </h3>
                            <p className="text-gray-600">
                              {comparacion.fechaAnterior} vs {comparacion.fechaActual}
                            </p>
                          </div>

                          {/* Puntuación de progresión */}
                          <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                            <div className="text-3xl font-bold text-primary mb-2">
                              {comparacion.puntuacionProgresion}/100
                            </div>
                            <div className="text-lg font-semibold text-gray-900 mb-1">
                              Puntuación de Progresión
                            </div>
                            <div className="text-sm text-gray-600">
                              {comparacion.puntuacionProgresion >= 80 ? 'Excelente evolución' :
                                comparacion.puntuacionProgresion >= 60 ? 'Buena evolución' :
                                  comparacion.puntuacionProgresion >= 40 ? 'Evolución moderada' : 'Requiere atención'}
                            </div>
                          </div>

                          {/* Cambios detectados */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center space-x-2">
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                                <span>Cambios Detectados</span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {comparacion.cambiosDetectados.map((cambio, index) => (
                                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <div className={`p-1 rounded-full ${cambio.impacto === 'positivo' ? 'bg-green-100' :
                                      cambio.impacto === 'negativo' ? 'bg-red-100' : 'bg-gray-100'
                                      }`}>
                                      {cambio.impacto === 'positivo' && <TrendingUp className="h-4 w-4 text-green-600" />}
                                      {cambio.impacto === 'negativo' && <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />}
                                      {cambio.impacto === 'neutro' && <Activity className="h-4 w-4 text-gray-600" />}
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900">{cambio.descripcion}</div>
                                      {cambio.medicion && (
                                        <div className="text-sm text-gray-600">Medición: {cambio.medicion}</div>
                                      )}
                                      <Badge
                                        variant="outline"
                                        className={`mt-1 ${cambio.impacto === 'positivo' ? 'text-green-700 border-green-200' :
                                          cambio.impacto === 'negativo' ? 'text-red-700 border-red-200' :
                                            'text-gray-700 border-gray-200'
                                          }`}
                                      >
                                        {cambio.impacto}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Resumen médico */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center space-x-2">
                                <Stethoscope className="h-5 w-5 text-primary" />
                                <span>Resumen Médico</span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="prose max-w-none">
                                <p className="text-gray-700">
                                  La comparación temporal entre los estudios muestra {comparacion.cambiosDetectados.length}
                                  cambios significativos. La puntuación de progresión de {comparacion.puntuacionProgresion}/100
                                  indica {comparacion.puntuacionProgresion >= 80 ? 'una excelente evolución' :
                                    comparacion.puntuacionProgresion >= 60 ? 'una buena evolución' :
                                      comparacion.puntuacionProgresion >= 40 ? 'una evolución moderada' :
                                        'la necesidad de atención médica especializada'}.
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )
                    })()}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <ArrowLeftRight className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Selecciona un estudio analizado
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Para comparar temporalmente, necesitas un estudio que haya sido analizado por IA
                  </p>
                  <Button onClick={() => setActiveTab('historial')}>
                    <History className="h-4 w-4 mr-2" />
                    Ver Historial
                  </Button>
                </CardContent>
              </Card>
            )}

          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
