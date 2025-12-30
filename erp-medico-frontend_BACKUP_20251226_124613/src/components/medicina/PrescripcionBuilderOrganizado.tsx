// Generador de Recetas - Versión Reorganizada y Simplificada
// Elimina duplicaciones, mejora el flujo y organiza mejor la interfaz
import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Pill, Mic, MicOff, Wand2, Loader2, Target, CheckCircle2, 
  AlertTriangle, ListChecks, ArrowRight, ArrowLeft, Save, 
  FileSignature, X, Info, Search, Plus, Eye, EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PrescriptionPreview } from './PrescriptionPreview'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { correctSpanishGrammar } from '@/lib/grammar'
import { useAuditLog } from '@/hooks/useAuditLog'
import { CIE10Search } from './CIE10Search'
import { ChatbotDiagnostico } from './ChatbotDiagnostico'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import toast from 'react-hot-toast'
import { medicamentosDisponibles } from './PrescripcionBuilderInline'

interface PacienteResumen {
  id: string
  nombre: string
  apellido_paterno: string
  apellido_materno?: string
  alergias?: string
  enfermedades_cronicas?: string
}

interface MedicamentoPrescrito {
  medicamento_id: string
  nombre: string
  concentracion?: string
  dosis: string
  frecuencia: string
  duracion: string
  via_administracion: string
  indicaciones?: string
  cantidad_prescrita: number
}

interface Prescripcion {
  id: string
  fecha_prescripcion: string
  paciente_id: string
  medico_id: string
  medico_nombre: string
  diagnostico: string
  medicamentos: MedicamentoPrescrito[]
  observaciones?: string
  estado: string
  fecha_inicio: string
}

interface Props {
  paciente: PacienteResumen
  onCreated?: (p: Prescripcion) => void
}

type ModoEntrada = 'manual' | 'voz'
type Paso = 1 | 2 | 3

export function PrescripcionBuilderOrganizado({ paciente, onCreated }: Props) {
  const { logAction } = useAuditLog()
  
  // Estados principales
  const [paso, setPaso] = useState<Paso>(1)
  const [modo, setModo] = useState<ModoEntrada>('manual')
  const [mostrarPreview, setMostrarPreview] = useState(true)
  
  // Datos de la prescripción
  const [diagnostico, setDiagnostico] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [medicamentosSeleccionados, setMedicamentosSeleccionados] = useState<MedicamentoPrescrito[]>([])
  
  // Estados de búsqueda y medicamentos
  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas')
  const [medicamentoSeleccionado, setMedicamentoSeleccionado] = useState<any>(null)
  
  // Estados de UI
  const [corrigiendo, setCorrigiendo] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showDraftBanner, setShowDraftBanner] = useState(false)
  const [codigosCIE10, setCodigosCIE10] = useState<Array<{ codigo: string; descripcion: string }>>([])
  const [medicamentoSeleccionadoParaDetalle, setMedicamentoSeleccionadoParaDetalle] = useState<any>(null)
  
  // Speech recognition
  const { isListening, start: startVoz, stop: stopVoz, supported: vozSoportada } = useSpeechRecognition({
    onResult: (texto, esFinal) => {
      if (esFinal && paso === 1) {
        setDiagnostico(d => (d ? d + ' ' : '') + texto.trim())
      }
    }
  })

  // Filtrado de medicamentos
  const categorias = ['todas', ...Array.from(new Set(medicamentosDisponibles.map(m => m.categoria)))]
  const medicamentosFiltrados = medicamentosDisponibles.filter(m => 
    (categoriaFiltro === 'todas' || m.categoria === categoriaFiltro) &&
    (m.nombre_comercial.toLowerCase().includes(busqueda.toLowerCase()) || 
     m.nombre_generico.toLowerCase().includes(busqueda.toLowerCase()))
  )

  // Funciones principales - DEFINIDAS ANTES DE USARLAS
  const toggleVoz = () => {
    if (isListening) {
      stopVoz()
    } else {
      startVoz()
      logAction({ action: 'RESOURCE_ACCESS', resourceType: 'prescripcion', actionType: 'VOICE_START' })
    }
  }

  const corregirGramatica = async () => {
    if (!diagnostico.trim()) return toast.error('Ingresa diagnóstico primero')
    setCorrigiendo(true)
    try {
      const { corrected, matches } = await correctSpanishGrammar(diagnostico)
      setDiagnostico(corrected)
      logAction({ action: 'RESOURCE_ACCESS', resourceType: 'historial', actionType: 'GRAMMAR_CORRECT', details: { matches: matches.length } })
      toast.success(`Correcciones: ${matches.length}`)
    } finally {
      setCorrigiendo(false)
    }
  }

  const agregarMedicamento = (medicamento: any) => {
    // Mostrar modal de especificaciones para seleccionar dosis, frecuencia, etc.
    setMedicamentoSeleccionadoParaDetalle(medicamento)
  }

  const confirmarMedicamentoConEspecificaciones = (medicamento: any, especificaciones: {
    dosis: string
    frecuencia: string
    duracion: string
    via_administracion: string
  }) => {
    const nuevo: MedicamentoPrescrito = {
      medicamento_id: Date.now().toString(),
      nombre: medicamento.nombre_comercial,
      concentracion: medicamento.concentracion,
      dosis: especificaciones.dosis,
      frecuencia: especificaciones.frecuencia,
      duracion: especificaciones.duracion,
      via_administracion: especificaciones.via_administracion,
      cantidad_prescrita: 1
    }
    setMedicamentosSeleccionados(prev => [...prev, nuevo])
    setMedicamentoSeleccionadoParaDetalle(null)
    setMedicamentoSeleccionado(null)
    setBusqueda('')
    toast.success(`${medicamento.nombre_comercial} agregado con especificaciones`)
  }

  const actualizarMedicamento = (index: number, campo: keyof MedicamentoPrescrito, valor: any) => {
    setMedicamentosSeleccionados(prev => 
      prev.map((m, i) => i === index ? { ...m, [campo]: valor } : m)
    )
  }

  const eliminarMedicamento = (index: number) => {
    setMedicamentosSeleccionados(prev => prev.filter((_, i) => i !== index))
  }

  const guardarBorrador = () => {
    try {
      const key = `HC_RX_DRAFT_${paciente.id}`
      const payload = { paso, diagnostico, observaciones, medicamentosSeleccionados, ts: Date.now() }
      localStorage.setItem(key, JSON.stringify(payload))
      toast.success('Borrador guardado')
      logAction({ action: 'RESOURCE_ACCESS', resourceType: 'prescripcion', actionType: 'RX_DRAFT_SAVE' })
    } catch {}
  }

  const restaurarBorrador = () => {
    try {
      const key = `HC_RX_DRAFT_${paciente.id}`
      const raw = localStorage.getItem(key)
      if (raw) {
        const s = JSON.parse(raw)
        setPaso(Math.min(3, Math.max(1, s.paso || 1)) as Paso)
        setDiagnostico(s.diagnostico || '')
        setObservaciones(s.observaciones || '')
        setMedicamentosSeleccionados(Array.isArray(s.medicamentosSeleccionados) ? s.medicamentosSeleccionados : [])
        localStorage.removeItem(key)
        setShowDraftBanner(false)
        toast.success('Borrador restaurado')
      }
    } catch {}
  }

  const siguientePaso = useCallback(() => {
    if (paso === 1 && !diagnostico.trim()) {
      toast.error('El diagnóstico es obligatorio')
      return
    }
    if (paso === 2 && medicamentosSeleccionados.length === 0) {
      toast.error('Agrega al menos un medicamento')
      return
    }
    if (paso < 3) setPaso((p => p + 1) as any)
  }, [paso, diagnostico, medicamentosSeleccionados.length])

  const anteriorPaso = useCallback(() => {
    if (paso > 1) setPaso((p => p - 1) as any)
  }, [paso])

  const crearPrescripcion = useCallback(() => {
    if (!diagnostico.trim()) return toast.error('El diagnóstico es obligatorio')
    if (medicamentosSeleccionados.length === 0) return toast.error('Agrega al menos un medicamento')
    if (medicamentosSeleccionados.some(m => !m.dosis || !m.frecuencia || !m.duracion)) {
      return toast.error('Completa dosis, frecuencia y duración de todos los medicamentos')
    }

    const pres: Prescripcion = {
      id: Date.now().toString(),
      fecha_prescripcion: new Date().toISOString(),
      paciente_id: paciente.id,
      medico_id: 'medico_actual',
      medico_nombre: 'Dr. Luna Rivera',
      diagnostico: diagnostico.trim(),
      medicamentos: medicamentosSeleccionados,
      observaciones: observaciones.trim() || undefined,
      estado: 'activa',
      fecha_inicio: new Date().toISOString()
    }

    onCreated?.(pres)
    toast.success('Prescripción creada')
    logAction({ action: 'RESOURCE_ACCESS', resourceType: 'prescripcion', actionType: 'RX_CREATED', details: { medicamentos: medicamentosSeleccionados.length } })
    
    // Limpiar y resetear
    setPaso(1)
    setDiagnostico('')
    setMedicamentosSeleccionados([])
    setObservaciones('')
    try {
      localStorage.removeItem(`HC_RX_DRAFT_${paciente.id}`)
    } catch {}
  }, [diagnostico, medicamentosSeleccionados, paciente.id, onCreated, logAction])

  // Verificar borrador al cargar
  useEffect(() => {
    const key = `HC_RX_DRAFT_${paciente.id}`
    try {
      const raw = localStorage.getItem(key)
      if (raw) setShowDraftBanner(true)
    } catch {}
  }, [paciente.id])

  // Atajos de teclado - DESPUÉS de definir crearPrescripcion
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F2' && modo === 'voz') {
        e.preventDefault()
        if (isListening) stopVoz()
        else startVoz()
      }
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault()
        siguientePaso()
      }
      if (e.altKey && e.key.toLowerCase() === 's' && paso === 3) {
        e.preventDefault()
        crearPrescripcion()
      }
      if (e.key === 'Escape') {
        if (showHelp) {
          e.preventDefault()
          setShowHelp(false)
        }
        if (isListening) {
          e.preventDefault()
          stopVoz()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [modo, paso, showHelp, diagnostico, medicamentosSeleccionados, isListening, startVoz, stopVoz, crearPrescripcion, siguientePaso])

  // Validaciones
  const advertenciasAlergias = medicamentosSeleccionados.filter(m => {
    const alergiasTexto = (paciente.alergias || '').toLowerCase()
    return alergiasTexto && alergiasTexto.split(/[ ,;]+/).some(al => m.nombre.toLowerCase().includes(al))
  })

  const advertenciasIncompletos = medicamentosSeleccionados.filter(m => !m.dosis || !m.frecuencia || !m.duracion)

  // Etiquetas inteligentes con descripciones
  const diagnosticoTags = [
    { 
      nombre: 'Cefalea tensional', 
      descripcion: 'Dolor de cabeza de tipo tensional, generalmente bilateral, de intensidad leve a moderada, sin náuseas ni fotofobia significativa.',
      codigoCIE10: 'G44.2'
    },
    { 
      nombre: 'Rinitis alérgica', 
      descripcion: 'Inflamación de la mucosa nasal de origen alérgico, caracterizada por rinorrea, estornudos, prurito nasal y congestión.',
      codigoCIE10: 'J30.9'
    },
    { 
      nombre: 'Lumbalgia mecánica', 
      descripcion: 'Dolor en la región lumbar de origen mecánico, generalmente relacionado con postura, esfuerzo o movimientos repetitivos.',
      codigoCIE10: 'M54.5'
    },
    { 
      nombre: 'Gastroenteritis viral', 
      descripcion: 'Inflamación del estómago e intestinos causada por virus, caracterizada por diarrea, náuseas, vómitos y dolor abdominal.',
      codigoCIE10: 'A09'
    }
  ]

  const agregarEtiquetaInteligente = (tag: typeof diagnosticoTags[0]) => {
    const textoCompleto = `${tag.nombre}. ${tag.descripcion}`
    setDiagnostico(d => d ? d + '\n\n' + textoCompleto : textoCompleto)
    
    // Agregar código CIE-10 si no está ya agregado
    if (tag.codigoCIE10 && !codigosCIE10.some(c => c.codigo === tag.codigoCIE10)) {
      setCodigosCIE10(prev => [...prev, { codigo: tag.codigoCIE10!, descripcion: tag.nombre }])
      toast.success(`Etiqueta "${tag.nombre}" agregada con código CIE-10 ${tag.codigoCIE10}`)
    } else {
      toast.success(`Etiqueta "${tag.nombre}" agregada con descripción completa`)
    }
  }

  return (
    <div className="space-y-4">
      {/* Banner de borrador */}
      <AnimatePresence>
        {showDraftBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2 text-sm text-amber-900">
              <Save className="h-4 w-4" />
              <span>Borrador encontrado - última edición guardada</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={restaurarBorrador}>Restaurar</Button>
              <Button size="sm" variant="ghost" onClick={() => {
                try { localStorage.removeItem(`HC_RX_DRAFT_${paciente.id}`) } catch {}
                setShowDraftBanner(false)
              }}>Descartar</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header unificado - Modo y Preview */}
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-3">
          {/* Selector de modo simplificado */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setModo('manual')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                modo === 'manual' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ✍️ Manual
            </button>
            <button
              onClick={() => setModo('voz')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                modo === 'voz' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              disabled={!vozSoportada}
            >
              🎤 Voz
            </button>
          </div>
          
          {/* Indicador de modo voz */}
          {modo === 'voz' && (
            <div className="flex items-center gap-2 text-sm">
              {isListening ? (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <Mic className="h-3 w-3" />
                  Dictando... (F2 para detener)
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1">
                  <MicOff className="h-3 w-3" />
                  Micrófono listo (F2 para dictar)
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Toggle preview */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMostrarPreview(!mostrarPreview)}
          className="flex items-center gap-2"
        >
          {mostrarPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {mostrarPreview ? 'Ocultar' : 'Mostrar'} Preview
        </Button>
      </div>

      {/* Layout principal: Editor + Preview */}
      <div className="grid grid-cols-12 gap-6">
        {/* Columna Editor - 7 columnas */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          {/* Indicador de progreso simplificado */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((p) => (
                <React.Fragment key={p}>
                  <div className={`flex items-center gap-2 ${paso >= p ? 'text-primary' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      paso >= p ? 'border-primary bg-primary/10' : 'border-gray-300'
                    }`}>
                      {paso > p ? <CheckCircle2 className="h-4 w-4" /> : p}
                    </div>
                    <span className="text-sm font-medium hidden sm:inline">
                      {p === 1 ? 'Diagnóstico' : p === 2 ? 'Medicamentos' : 'Resumen'}
                    </span>
                  </div>
                  {p < 3 && <div className="w-8 h-px bg-gray-300" />}
                </React.Fragment>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowHelp(!showHelp)}>
              <Info className="h-4 w-4" />
            </Button>
          </div>

          {/* Ayuda contextual */}
          {showHelp && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3 text-sm">
                <div className="space-y-2">
                  <p><strong>Modo Manual:</strong> Usa formularios y búsqueda estándar.</p>
                  <p><strong>Modo Voz:</strong> Presiona F2 para dictar diagnóstico y notas.</p>
                  <p className="text-xs text-gray-600">Atajos: F2 (voz) · Ctrl+Enter (siguiente) · Alt+S (firmar)</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contenido por paso */}
          {paso === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Diagnóstico Médico *
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Textarea
                    value={diagnostico}
                    onChange={(e) => setDiagnostico(e.target.value)}
                    rows={6}
                    className="pr-20"
                    placeholder="Describe el diagnóstico detallado o usa el micrófono para dictar..."
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    {modo === 'voz' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleVoz}
                        className={isListening ? 'bg-red-50 border-red-300' : ''}
                      >
                        {isListening ? <MicOff className="h-4 w-4 text-red-600" /> : <Mic className="h-4 w-4" />}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={corregirGramatica}
                      disabled={corrigiendo || !diagnostico.trim()}
                    >
                      {corrigiendo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Etiquetas inteligentes con descripciones */}
                <div>
                  <p className="text-xs text-gray-600 mb-2">Etiquetas inteligentes (click para agregar con descripción completa):</p>
                  <div className="flex flex-wrap gap-2">
                    {diagnosticoTags.map(tag => (
                      <motion.div
                        key={tag.nombre}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Badge
                          variant="outline"
                          className="cursor-pointer hover:bg-primary/10 hover:border-primary transition-all group relative"
                          onClick={() => agregarEtiquetaInteligente(tag)}
                        >
                          <span>+ {tag.nombre}</span>
                          {tag.codigoCIE10 && (
                            <span className="ml-1 text-[10px] text-primary">CIE-10: {tag.codigoCIE10}</span>
                          )}
                          {/* Tooltip con descripción */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-64">
                            <Card className="p-3 shadow-lg border-primary">
                              <CardContent className="p-0">
                                <p className="text-xs font-medium mb-1">{tag.nombre}</p>
                                <p className="text-xs text-gray-600 mb-2">{tag.descripcion}</p>
                                {tag.codigoCIE10 && (
                                  <Badge variant="outline" className="text-[10px]">
                                    CIE-10: {tag.codigoCIE10}
                                  </Badge>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Buscador CIE-10 integrado */}
                <Card className="border-primary/30 bg-blue-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                        CIE-10
                      </Badge>
                      Codificación diagnóstica
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CIE10Search
                      selectedCodes={codigosCIE10}
                      onAdd={(item) => {
                        setCodigosCIE10(prev => [...prev, item])
                        toast.success(`Código CIE-10 ${item.codigo} agregado`)
                      }}
                      onRemove={(codigo) => {
                        setCodigosCIE10(prev => prev.filter(c => c.codigo !== codigo))
                        toast.success('Código eliminado')
                      }}
                      placeholder="Buscar código CIE-10..."
                    />
                  </CardContent>
                </Card>

                {/* Alertas del paciente */}
                {(paciente.alergias || paciente.enfermedades_cronicas) && (
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Información médica relevante</span>
                      </div>
                      {paciente.alergias && (
                        <p className="text-xs text-yellow-700"><strong>Alergias:</strong> {paciente.alergias}</p>
                      )}
                      {paciente.enfermedades_cronicas && (
                        <p className="text-xs text-yellow-700"><strong>Enfermedades crónicas:</strong> {paciente.enfermedades_cronicas}</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          )}

          {paso === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Pill className="h-5 w-5 text-primary" />
                  Medicamentos ({medicamentosSeleccionados.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Búsqueda de medicamentos */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar medicamento..."
                        className="pl-9"
                      />
                    </div>
                    <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat === 'todas' ? 'Todas' : cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Lista de medicamentos mejorada con especificaciones */}
                  <div className="max-h-64 overflow-y-auto border rounded-lg p-2 space-y-2">
                    {medicamentosFiltrados.slice(0, 10).map((med, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => agregarMedicamento(med)}
                        whileHover={{ scale: 1.02 }}
                        className="w-full text-left p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{med.nombre_comercial}</div>
                            <div className="text-xs text-gray-500">{med.nombre_generico} · {med.categoria}</div>
                          </div>
                          <Badge variant="outline" className="text-xs">{med.concentracion}</Badge>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                          {med.dosis_recomendada && (
                            <span className="bg-blue-50 px-2 py-0.5 rounded">💊 {med.dosis_recomendada}</span>
                          )}
                          {med.frecuencia_opciones && med.frecuencia_opciones.length > 0 && (
                            <span className="bg-green-50 px-2 py-0.5 rounded">⏰ {med.frecuencia_opciones[0]}</span>
                          )}
                          {med.max_dias && (
                            <span className="bg-purple-50 px-2 py-0.5 rounded">📅 Max {med.max_dias} días</span>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Medicamentos seleccionados */}
                {medicamentosSeleccionados.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Medicamentos prescritos:</p>
                    {medicamentosSeleccionados.map((med, index) => (
                      <Card key={index} className="border-l-4 border-l-primary">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium">{med.nombre}</p>
                              {med.concentracion && <p className="text-xs text-gray-500">{med.concentracion}</p>}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => eliminarMedicamento(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-xs text-gray-600">Dosis</label>
                              <Input
                                value={med.dosis}
                                onChange={(e) => actualizarMedicamento(index, 'dosis', e.target.value)}
                                placeholder="500 mg"
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600">Frecuencia</label>
                              <Input
                                value={med.frecuencia}
                                onChange={(e) => actualizarMedicamento(index, 'frecuencia', e.target.value)}
                                placeholder="c/8h"
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600">Duración</label>
                              <Input
                                value={med.duracion}
                                onChange={(e) => actualizarMedicamento(index, 'duracion', e.target.value)}
                                placeholder="7 días"
                                className="text-sm"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Advertencias */}
                {advertenciasAlergias.length > 0 && (
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 text-sm text-red-800">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Posible alergia detectada en {advertenciasAlergias.length} medicamento(s)</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {advertenciasIncompletos.length > 0 && (
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 text-sm text-yellow-800">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{advertenciasIncompletos.length} medicamento(s) con campos incompletos</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          )}

          {paso === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-primary" />
                  Resumen y Observaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Diagnóstico:</label>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{diagnostico || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Medicamentos ({medicamentosSeleccionados.length}):</label>
                  <div className="space-y-2">
                    {medicamentosSeleccionados.map((med, idx) => (
                      <div key={idx} className="text-sm bg-gray-50 p-3 rounded">
                        <p className="font-medium">{med.nombre}</p>
                        <p className="text-gray-600">{med.dosis} · {med.frecuencia} · {med.duracion}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Observaciones (opcional):</label>
                  <Textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    rows={3}
                    placeholder="Indicaciones adicionales, precauciones, etc."
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Columna Preview - 5 columnas */}
        {mostrarPreview && (
          <div className="col-span-12 lg:col-span-5">
            <div className="sticky top-4">
              <PrescriptionPreview
                pacienteNombre={`${paciente.nombre} ${paciente.apellido_paterno}`}
                diagnostico={diagnostico}
                medicamentos={medicamentosSeleccionados.map((m, i) => ({ ...m, index: i })) as any}
                observaciones={observaciones}
                fecha={new Date()}
                medico="Dr. Luna Rivera"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer fijo con acciones - Botón continuar mejorado y visible */}
      <div className="flex items-center justify-between border-t pt-4 pb-4 bg-white sticky bottom-0 z-10 shadow-lg">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Paso {paso}/3</span>
          <span>Medicamentos: {medicamentosSeleccionados.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={guardarBorrador}>
            <Save className="h-4 w-4 mr-1" />
            Guardar borrador
          </Button>
          <Button variant="outline" size="sm" onClick={anteriorPaso} disabled={paso === 1}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          {paso < 3 ? (
            <Button 
              size="lg" 
              onClick={siguientePaso}
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-6 shadow-lg hover:shadow-xl transition-all"
            >
              Continuar
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          ) : (
            <Button 
              size="lg" 
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-6 shadow-lg hover:shadow-xl transition-all" 
              onClick={crearPrescripcion}
            >
              <FileSignature className="h-5 w-5 mr-2" />
              Crear Prescripción
            </Button>
          )}
        </div>
      </div>

      {/* Modal de especificaciones de medicamento */}
      <Dialog open={!!medicamentoSeleccionadoParaDetalle} onOpenChange={(open) => !open && setMedicamentoSeleccionadoParaDetalle(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Especificaciones del Medicamento</DialogTitle>
          </DialogHeader>
          {medicamentoSeleccionadoParaDetalle && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-semibold">{medicamentoSeleccionadoParaDetalle.nombre_comercial}</p>
                <p className="text-sm text-gray-600">{medicamentoSeleccionadoParaDetalle.nombre_generico}</p>
                <p className="text-xs text-gray-500 mt-1">{medicamentoSeleccionadoParaDetalle.concentracion} · {medicamentoSeleccionadoParaDetalle.categoria}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Dosis *</label>
                  <Select 
                    defaultValue={medicamentoSeleccionadoParaDetalle.dosis_recomendada}
                    onValueChange={(v) => {
                      const med = medicamentoSeleccionadoParaDetalle
                      setMedicamentoSeleccionadoParaDetalle({ ...med, dosisSeleccionada: v })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona dosis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={medicamentoSeleccionadoParaDetalle.dosis_recomendada}>
                        {medicamentoSeleccionadoParaDetalle.dosis_recomendada} (Recomendada)
                      </SelectItem>
                      {medicamentoSeleccionadoParaDetalle.dosis_recomendada !== '250 mg' && (
                        <SelectItem value="250 mg">250 mg</SelectItem>
                      )}
                      {medicamentoSeleccionadoParaDetalle.dosis_recomendada !== '500 mg' && (
                        <SelectItem value="500 mg">500 mg</SelectItem>
                      )}
                      {medicamentoSeleccionadoParaDetalle.dosis_recomendada !== '1000 mg' && (
                        <SelectItem value="1000 mg">1000 mg</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Frecuencia *</label>
                  <Select 
                    defaultValue={medicamentoSeleccionadoParaDetalle.frecuencia_opciones?.[0]}
                    onValueChange={(v) => {
                      const med = medicamentoSeleccionadoParaDetalle
                      setMedicamentoSeleccionadoParaDetalle({ ...med, frecuenciaSeleccionada: v })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona frecuencia" />
                    </SelectTrigger>
                    <SelectContent>
                      {medicamentoSeleccionadoParaDetalle.frecuencia_opciones?.map((freq: string) => (
                        <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                      ))}
                      <SelectItem value="según necesidad">Según necesidad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Duración *</label>
                  <Input
                    placeholder={`Ej: 7 días (máx ${medicamentoSeleccionadoParaDetalle.max_dias || 30} días)`}
                    onChange={(e) => {
                      const med = medicamentoSeleccionadoParaDetalle
                      setMedicamentoSeleccionadoParaDetalle({ ...med, duracionSeleccionada: e.target.value })
                    }}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Vía de administración</label>
                  <Select 
                    defaultValue="VO"
                    onValueChange={(v) => {
                      const med = medicamentoSeleccionadoParaDetalle
                      setMedicamentoSeleccionadoParaDetalle({ ...med, viaSeleccionada: v })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VO">Vía Oral (VO)</SelectItem>
                      <SelectItem value="IM">Intramuscular (IM)</SelectItem>
                      <SelectItem value="IV">Intravenosa (IV)</SelectItem>
                      <SelectItem value="TOP">Tópica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setMedicamentoSeleccionadoParaDetalle(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (medicamentoSeleccionadoParaDetalle) {
                  confirmarMedicamentoConEspecificaciones(medicamentoSeleccionadoParaDetalle, {
                    dosis: medicamentoSeleccionadoParaDetalle.dosisSeleccionada || medicamentoSeleccionadoParaDetalle.dosis_recomendada || '',
                    frecuencia: medicamentoSeleccionadoParaDetalle.frecuenciaSeleccionada || medicamentoSeleccionadoParaDetalle.frecuencia_opciones?.[0] || '',
                    duracion: medicamentoSeleccionadoParaDetalle.duracionSeleccionada || '',
                    via_administracion: medicamentoSeleccionadoParaDetalle.viaSeleccionada || 'VO'
                  })
                }
              }}
            >
              Agregar Medicamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chatbot especializado */}
      <ChatbotDiagnostico
        diagnosticoActual={diagnostico}
        sintomas={[]}
        onSugerenciaDiagnostico={(diag, codigo) => {
          setDiagnostico(diag)
          if (codigo) {
            setCodigosCIE10(prev => [...prev, { codigo, descripcion: diag }])
          }
          toast.success('Sugerencia del chatbot aplicada')
        }}
        onSugerenciaCIE10={(codigo, descripcion) => {
          setCodigosCIE10(prev => [...prev, { codigo, descripcion }])
          toast.success(`Código CIE-10 ${codigo} agregado`)
        }}
      />
    </div>
  )
}

