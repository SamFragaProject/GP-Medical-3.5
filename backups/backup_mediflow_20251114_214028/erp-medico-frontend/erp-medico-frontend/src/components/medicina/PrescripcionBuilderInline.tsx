// Constructor de prescripción en línea (sin modal)
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Pill, Plus, Search, Mic, MicOff, Wand2, Loader2, Target, CheckCircle2, AlertTriangle, ListChecks, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import toast from 'react-hot-toast'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { correctSpanishGrammar } from '@/lib/grammar'
import { PrescriptionPreview } from './PrescriptionPreview'
import { useAuditLog } from '@/hooks/useAuditLog'

export interface PacienteResumen {
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
  concentracion: string
  dosis: string
  frecuencia: string
  duracion: string
  via_administracion: string
  indicaciones: string
  cantidad_prescrita: number
  horarios?: string[]
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
  estado: 'activa' | 'completada' | 'cancelada'
  fecha_inicio: string
}

// Catálogo demo ampliado con recomendaciones y validaciones
export const medicamentosDisponibles = [
  { nombre_comercial: 'Paracetamol', nombre_generico: 'Paracetamol', concentracion: '500mg', forma_farmaceutica: 'Tableta', categoria: 'Analgésico', precio: 45, stok_disponible: 500, contraindicaciones: ['Insuficiencia hepática severa'], dosis_recomendada: '500 mg', frecuencia_opciones: ['cada 6 horas', 'cada 8 horas'], max_dias: 5, alerta_alergias: ['paracetamol'] },
  { nombre_comercial: 'Ibuprofeno', nombre_generico: 'Ibuprofeno', concentracion: '400mg', forma_farmaceutica: 'Tableta', categoria: 'Antiinflamatorio', precio: 75, stok_disponible: 300, contraindicaciones: ['Úlcera péptica'], dosis_recomendada: '400 mg', frecuencia_opciones: ['cada 8 horas', 'cada 12 horas'], max_dias: 7, alerta_alergias: ['ibuprofeno','aine'] },
  { nombre_comercial: 'Loratadina', nombre_generico: 'Loratadina', concentracion: '10mg', forma_farmaceutica: 'Tableta', categoria: 'Antihistamínico', precio: 120, stok_disponible: 200, contraindicaciones: [], dosis_recomendada: '10 mg', frecuencia_opciones: ['cada 24 horas'], max_dias: 14, alerta_alergias: ['loratadina','antihistamínico'] },
  { nombre_comercial: 'Omeprazol', nombre_generico: 'Omeprazol', concentracion: '20mg', forma_farmaceutica: 'Cápsula', categoria: 'Gastroprotector', precio: 95, stok_disponible: 180, contraindicaciones: ['Hipersensibilidad'], dosis_recomendada: '20 mg', frecuencia_opciones: ['cada 24 horas'], max_dias: 30, alerta_alergias: ['omeprazol'] },
]

export interface PrescripcionBuilderInlineState {
  paso: number
  diagnostico: string
  observaciones: string
  medicamentosSeleccionados: MedicamentoPrescrito[]
}

interface Props {
  paciente: PacienteResumen
  onCreated?: (p: Prescripcion) => void
  variant?: 'default' | 'external'
  hideInternalPreview?: boolean
  onState?: (state: PrescripcionBuilderInlineState) => void
  commandsRef?: React.MutableRefObject<{
    next: () => void
    prev: () => void
    signAndPdf: () => void
    saveDraft: () => void
    addMedicineQuick: () => void
    toggleMic: () => void
    focusSearch: () => void
    getState: () => PrescripcionBuilderInlineState
    addParsedMedicamentos: (items: { nombre: string; dosis?: string; frecuencia?: string; duracion?: string; via_administracion?: string; indicaciones?: string }[]) => void
    isMicActive: () => boolean
    voiceSupported: () => boolean
    restoreDraft: (s: PrescripcionBuilderInlineState) => void
    setDiagnostico: (s: string) => void
    appendDiagnostico: (s: string) => void
    correctGrammar: () => void
    duplicateLast: () => void
  } | null>
}

export function PrescripcionBuilderInline({ paciente, onCreated, variant = 'default', hideInternalPreview = false, onState, commandsRef }: Props) {
  const [paso, setPaso] = useState(1)
  const [diagnostico, setDiagnostico] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas')
  const [corrigiendo, setCorrigiendo] = useState(false)
  const [autoCorrecciones, setAutoCorrecciones] = useState(0)
  const [vistaPreviaActiva, setVistaPreviaActiva] = useState(true)
  const [medicamentosSeleccionados, setMedicamentosSeleccionados] = useState<MedicamentoPrescrito[]>([])
  const [showSummaryWarnings, setShowSummaryWarnings] = useState(false)
  const { logAction } = useAuditLog()
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const { isListening, start: startVoz, stop: stopVoz, supported: vozSoportada } = useSpeechRecognition({
    onResult: (texto, esFinal) => {
      if (!esFinal) return
      setDiagnostico((d) => (d ? d + ' ' : '') + texto.trim())
    }
  })

  const categorias = ['todas', ...Array.from(new Set(medicamentosDisponibles.map(m => m.categoria)))]
  const medicamentosFiltrados = medicamentosDisponibles.filter(m => (categoriaFiltro === 'todas' || m.categoria === categoriaFiltro) && (m.nombre_comercial.toLowerCase().includes(busqueda.toLowerCase()) || m.nombre_generico.toLowerCase().includes(busqueda.toLowerCase())))

  const agregarMedicamento = (m: any) => {
    if (medicamentosSeleccionados.length >= 8) {
      toast.error('Límite de 8 fármacos por receta. Crea una nueva receta para agregar más.')
      return
    }
    const nuevo: MedicamentoPrescrito = {
      medicamento_id: Date.now().toString(),
      nombre: m.nombre_comercial,
      concentracion: m.concentracion,
      dosis: m.dosis_recomendada || '',
      frecuencia: m.frecuencia_opciones?.[0] || '',
      duracion: m.max_dias ? `${m.max_dias} días` : '',
      via_administracion: m.forma_farmaceutica,
      indicaciones: '',
      cantidad_prescrita: 1,
      horarios: []
    }
    setMedicamentosSeleccionados((prev) => [...prev, nuevo])
    toast.success(`${m.nombre_comercial} agregado`)
    logAction({ action: 'RESOURCE_ACCESS', resourceType: 'medicamento', actionType: 'MED_ADD', details: { nombre: m.nombre_comercial } })
  }

  const actualizarMedicamento = (i: number, campo: keyof MedicamentoPrescrito, valor: any) => {
    const copia = [...medicamentosSeleccionados]
    copia[i] = { ...copia[i], [campo]: valor }
    setMedicamentosSeleccionados(copia)
  }

  const quitarMedicamento = (i: number) => {
    const med = medicamentosSeleccionados[i]
    setMedicamentosSeleccionados(medicamentosSeleccionados.filter((_, idx) => idx !== i))
    toast.success(`${med.nombre} eliminado`)
    logAction({ action: 'RESOURCE_ACCESS', resourceType: 'medicamento', actionType: 'MED_REMOVE', details: { nombre: med.nombre } })
  }

  const duplicarMedicamento = (i: number) => {
    if (medicamentosSeleccionados.length >= 8) {
      toast.error('Límite de 8 fármacos por receta. Crea una nueva receta para agregar más.')
      return
    }
    const base = medicamentosSeleccionados[i]
    const copia: MedicamentoPrescrito = { ...base, medicamento_id: Date.now().toString() + '_dup' }
    setMedicamentosSeleccionados(prev => {
      const next = [...prev]
      next.splice(i + 1, 0, copia)
      return next
    })
    toast.success(`${base.nombre} duplicado`)
    logAction({ action: 'RESOURCE_ACCESS', resourceType: 'medicamento', actionType: 'MED_DUP', details: { nombre: base.nombre } })
  }

  // Horarios por intervalo cada N horas
  const generarHorarios = (i: number) => {
    const med = medicamentosSeleccionados[i]
    const match = /cada\s+(\d+)\s*horas?/i.exec(med.frecuencia || '')
    if (!match) { toast.error('Frecuencia no soportada para horarios'); return }
    const interval = parseInt(match[1], 10)
    const start = new Date()
    start.setHours(8,0,0,0) // 08:00 por defecto
    const chips: string[] = []
    for (let h = 0; h < 24; h += interval) {
      const hh = (start.getHours() + h) % 24
      chips.push(`${String(hh).padStart(2,'0')}:00`)
    }
    actualizarMedicamento(i, 'horarios', chips)
  }

  const toggleVoz = () => {
    if (!vozSoportada) return toast.error('Voz no soportada')
    if (isListening) {
      stopVoz(); logAction({ action: 'ROUTE_ACCESS', resourceType: 'historial', actionType: 'VOICE_STOP' })
    } else {
      startVoz(); toast.success('Escuchando...'); logAction({ action: 'ROUTE_ACCESS', resourceType: 'historial', actionType: 'VOICE_START' })
    }
  }

  const corregir = async () => {
    if (!diagnostico.trim()) return toast.error('Ingresa diagnóstico primero')
    setCorrigiendo(true)
    try {
      const { corrected, matches } = await correctSpanishGrammar(diagnostico)
      setDiagnostico(corrected)
      setAutoCorrecciones((c) => c + matches.length)
      logAction({ action: 'RESOURCE_ACCESS', resourceType: 'historial', actionType: 'GRAMMAR_CORRECT', details: { matches: matches.length } })
      toast.success(`Correcciones: ${matches.length}`)
    } finally {
      setCorrigiendo(false)
    }
  }

  const crear = () => {
    if (!diagnostico.trim()) return toast.error('El diagnóstico es obligatorio')
    if (medicamentosSeleccionados.length === 0) return toast.error('Agrega al menos un medicamento')
    if (medicamentosSeleccionados.some(m => !m.dosis || !m.frecuencia || !m.duracion)) return toast.error('Completa dosis, frecuencia y duración')
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
    // Reset flujo para nueva prescripción
    setPaso(1); setDiagnostico(''); setMedicamentosSeleccionados([]); setObservaciones('')
  }

  const diagnosticoTags = ['Cefalea tensional', 'Rinitis alérgica', 'Lumbalgia mecánica', 'Gastroenteritis viral']

  // Evaluaciones y advertencias para el resumen
  const advertenciasAlergias = medicamentosSeleccionados.filter(m => {
    const alergiasTexto = (paciente.alergias || '').toLowerCase()
    return alergiasTexto && alergiasTexto.split(/[ ,;]+/).some(al => m.nombre.toLowerCase().includes(al))
  })
  const advertenciasCamposIncompletos = medicamentosSeleccionados.filter(m => !m.dosis || !m.frecuencia || !m.duracion)
  const advertenciasDuplicados = medicamentosSeleccionados.filter((m, idx) => medicamentosSeleccionados.findIndex(x => x.nombre.toLowerCase() === m.nombre.toLowerCase()) !== idx)

  const onKeyDownBuscar = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const first = medicamentosFiltrados[0]
      if (first) agregarMedicamento(first)
    }
  }

  // Notify external listeners of state changes (for v2 wrapper)
  useEffect(() => {
    onState?.({ paso, diagnostico, observaciones, medicamentosSeleccionados })
  }, [paso, diagnostico, observaciones, medicamentosSeleccionados, onState])

  // Imperative commands for external controller (v2 wrapper)
  useImperativeHandle(commandsRef, () => ({
    next: () => setPaso(p => Math.min(3, p + 1)),
    prev: () => setPaso(p => Math.max(1, p - 1)),
    signAndPdf: () => {
      crear()
    },
    saveDraft: () => {
      try {
        const key = `HC_RX_DRAFT_${paciente.id}`
        const payload = { paso, diagnostico, observaciones, medicamentosSeleccionados, ts: Date.now() }
        localStorage.setItem(key, JSON.stringify(payload))
        toast.success('Borrador guardado')
        logAction({ action: 'RESOURCE_ACCESS', resourceType: 'prescripcion', actionType: 'RX_DRAFT_SAVE' })
      } catch {}
    },
    addMedicineQuick: () => {
      const m = medicamentosFiltrados[0] ?? medicamentosDisponibles[0]
      if (m) agregarMedicamento(m)
    },
    toggleMic: () => toggleVoz(),
    focusSearch: () => {
      searchInputRef.current?.focus()
    },
  getState: () => ({ paso, diagnostico, observaciones, medicamentosSeleccionados }),
    addParsedMedicamentos: (items) => {
      if (!Array.isArray(items)) return
      const nuevos: MedicamentoPrescrito[] = items.map(it => ({
        medicamento_id: Date.now().toString() + Math.random().toString(16).slice(2),
        nombre: it.nombre,
        concentracion: '',
        dosis: it.dosis || '',
        frecuencia: it.frecuencia || '',
        duracion: it.duracion || '',
        via_administracion: it.via_administracion || 'VO',
        indicaciones: it.indicaciones || '',
        cantidad_prescrita: 1
      }))
      setMedicamentosSeleccionados(prev => [...prev, ...nuevos])
      if (nuevos.length) {
        toast.success(`${nuevos.length} medicamento(s) parseados`)
        logAction({ action: 'RESOURCE_ACCESS', resourceType: 'medicamento', actionType: 'MED_PARSE_ADD', details: { count: nuevos.length } })
      }
    },
    isMicActive: () => !!isListening,
    voiceSupported: () => !!vozSoportada
    ,restoreDraft: (s) => {
      try {
        if (!s) return
        setPaso(Math.min(3, Math.max(1, s.paso || 1)))
        setDiagnostico(s.diagnostico || '')
        setObservaciones(s.observaciones || '')
        setMedicamentosSeleccionados(Array.isArray(s.medicamentosSeleccionados) ? s.medicamentosSeleccionados.slice(0,8) : [])
        toast.success('Borrador restaurado')
      } catch {}
    }
    ,setDiagnostico: (txt) => setDiagnostico(txt)
    ,appendDiagnostico: (txt) => setDiagnostico(d => (d? d+' ': '') + (txt||''))
    ,correctGrammar: () => { if (!corrigiendo) corregir() }
    ,duplicateLast: () => {
      if (medicamentosSeleccionados.length === 0) return
      duplicarMedicamento(medicamentosSeleccionados.length - 1)
    }
  }), [paso, diagnostico, observaciones, medicamentosSeleccionados])

  return (
    <div className="space-y-6">
      {/* Indicador de progreso */}
      <div className="flex items-center justify-between text-xs font-medium">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 ${paso>=1?'text-primary':'text-gray-400'}`}><div className="w-5 h-5 rounded-full flex items-center justify-center border border-current">1</div>Diagnóstico</div>
          <span className="w-8 h-px bg-gradient-to-r from-primary/40 to-transparent" />
          <div className={`flex items-center gap-1 ${paso>=2?'text-primary':'text-gray-400'}`}><div className="w-5 h-5 rounded-full flex items-center justify-center border border-current">2</div>Medicamentos</div>
          <span className="w-8 h-px bg-gradient-to-r from-primary/40 to-transparent" />
          <div className={`flex items-center gap-1 ${paso>=3?'text-primary':'text-gray-400'}`}><div className="w-5 h-5 rounded-full flex items-center justify-center border border-current">3</div>Resumen</div>
        </div>
        <div className="text-gray-500">Correcciones gramáticas: {autoCorrecciones}</div>
      </div>
      <Tabs value={paso.toString()}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="1" className="flex items-center space-x-2"><Target className="h-4 w-4"/><span>Diagnóstico</span></TabsTrigger>
          <TabsTrigger value="2" className="flex items-center space-x-2"><Pill className="h-4 w-4"/><span>Medicamentos</span></TabsTrigger>
          <TabsTrigger value="3" className="flex items-center space-x-2"><ListChecks className="h-4 w-4"/><span>Resumen</span></TabsTrigger>
        </TabsList>
        <TabsContent value="1" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <span className="hc-badge hc-badge-success">Paso 1</span>
                Diagnóstico médico *
              </label>
              <div className="relative">
                <Textarea 
                  value={diagnostico} 
                  onChange={(e)=>setDiagnostico(e.target.value)} 
                  rows={5} 
                  className="hc-input pr-24 focus:ring-2 focus:ring-primary/60 transition-all" 
                  placeholder="Describe el diagnóstico detallado o usa el micrófono para dictar..."
                />
                <div className="absolute top-2 right-2 flex space-x-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" size="sm" onClick={toggleVoz} className={isListening ? 'bg-red-50 border-red-300' : ''}>
                      {isListening ? <MicOff className="h-4 w-4 text-red-600"/> : <Mic className="h-4 w-4"/>}
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" size="sm" onClick={corregir} disabled={corrigiendo} className="hc-tooltip" data-tooltip="Corregir gramática">
                      {corrigiendo ? <Loader2 className="h-4 w-4 animate-spin"/> : <Wand2 className="h-4 w-4"/>}
                    </Button>
                  </motion.div>
                </div>
              </div>
              <div>
                <div className="hc-divider text-xs mb-2">Sugerencias frecuentes</div>
                <div className="flex flex-wrap gap-2">
                  {diagnosticoTags.map(t => (
                    <motion.button 
                      key={t} 
                      type="button" 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="hc-badge hc-badge-info px-3 py-1.5 rounded-full text-xs hover:shadow-md transition-all cursor-pointer" 
                      onClick={()=>setDiagnostico(d=>d? d+' | '+t : t)}
                    >
                      + {t}
                    </motion.button>
                  ))}
                </div>
              </div>
              {(paciente.alergias || paciente.enfermedades_cronicas) && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-yellow-800">Información médica relevante</CardTitle></CardHeader>
                  <CardContent className="pt-0 text-xs text-yellow-700 space-y-1">
                    {paciente.alergias && <p><strong>Alergias:</strong> {paciente.alergias}</p>}
                    {paciente.enfermedades_cronicas && <p><strong>Enfermedades crónicas:</strong> {paciente.enfermedades_cronicas}</p>}
                  </CardContent>
                </Card>
              )}
            </div>
            {!hideInternalPreview && (
              <div className="lg:col-span-2 md:sticky md:top-2">
                {vistaPreviaActiva && (
                  <div className="rounded-xl border bg-gradient-to-br from-gray-50 to-white p-3 sm:p-4 max-h-[70vh] overflow-auto">
                    <PrescriptionPreview pacienteNombre={`${paciente.nombre} ${paciente.apellido_paterno}`} diagnostico={diagnostico} medicamentos={medicamentosSeleccionados.map((m,i)=>({...m,index:i})) as any} observaciones={observaciones} fecha={new Date()} medico={'Dr. Luna Rivera'} />
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-between">
            <div className="text-xs text-gray-500">{vozSoportada ? (isListening ? 'Escuchando...' : 'Micrófono disponible') : 'Reconocimiento de voz no soportado'}</div>
            <div className="space-x-2">
              <Button variant="outline" onClick={()=>setVistaPreviaActiva(v=>!v)}>{vistaPreviaActiva? 'Ocultar Vista Previa' : 'Mostrar Vista Previa'}</Button>
              <Button onClick={()=>setPaso(2)} disabled={!diagnostico.trim()}>Continuar</Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="2" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="flex-1 hc-input-group">
                  <Search className="hc-input-icon absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
                  <Input 
                    ref={searchInputRef} 
                    className="hc-input pl-10 focus:ring-2 focus:ring-primary/60 transition-all" 
                    placeholder="Buscar por nombre, genérico o categoría..." 
                    value={busqueda} 
                    onChange={(e)=>setBusqueda(e.target.value)} 
                    onKeyDown={onKeyDownBuscar} 
                  />
                </div>
                <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                  <SelectTrigger className="w-full sm:w-48 hc-input"><SelectValue placeholder="Categoría"/></SelectTrigger>
                  <SelectContent>
                    {categorias.map(c => <SelectItem key={c} value={c}>{c==='todas'?'Todas':c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-72 overflow-y-auto">
                {medicamentosFiltrados.map((m,idx)=>(
                  <motion.div 
                    key={idx} 
                    initial={{opacity:0,y:20}} 
                    animate={{opacity:1,y:0}} 
                    transition={{delay:idx*0.04}}
                    whileHover={{ scale: 1.02 }}
                    className="hc-card hc-card-hover border rounded-lg p-4 group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-sm flex items-center gap-1">
                          {m.nombre_comercial} 
                          {m.max_dias && <span className="hc-badge hc-badge-info">max {m.max_dias}d</span>}
                        </h4>
                        <p className="text-xs text-gray-500">{m.nombre_generico} · {m.concentracion}</p>
                        <p className="text-[10px] text-gray-500 mt-1">Dosis sugerida: {m.dosis_recomendada} · Frec: {m.frecuencia_opciones?.join(', ')}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">${m.precio}</Badge>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Button size="sm" variant="outline" className="w-full hc-btn-secondary" onClick={()=>agregarMedicamento(m)}>
                        <Plus className="h-3 w-3 mr-1"/> Agregar
                      </Button>
                    </div>
                  </motion.div>
                ))}
                {medicamentosFiltrados.length===0 && (
                  <div className="col-span-2 text-xs text-gray-500 italic">Sin resultados para la búsqueda.</div>
                )}
              </div>
            </div>
            <div className="lg:col-span-2 space-y-4">
              {medicamentosSeleccionados.map((med,i)=>(
                <motion.div
                  key={med.medicamento_id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="hc-card border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="hc-badge hc-badge-success">{i + 1}</span>
                        {med.nombre}
                      </CardTitle>
                      <CardDescription>{med.concentracion} · {med.via_administracion}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input placeholder="Dosis" value={med.dosis} onChange={(e)=>actualizarMedicamento(i,'dosis',e.target.value)} />
                      <Select value={med.frecuencia} onValueChange={(v)=>actualizarMedicamento(i,'frecuencia',v)}>
                        <SelectTrigger><SelectValue placeholder="Frecuencia"/></SelectTrigger>
                        <SelectContent>
                          {medicamentosDisponibles.find(m=>m.nombre_comercial===med.nombre)?.frecuencia_opciones?.map(op=> <SelectItem key={op} value={op}>{op}</SelectItem>)}
                          <SelectItem value="según necesidad">según necesidad</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="Duración (ej: 7 días)" value={med.duracion} onChange={(e)=>actualizarMedicamento(i,'duracion',e.target.value)} />
                    </div>
                    {/* Generador de horarios */}
                    <div className="flex items-center gap-2 text-xs">
                      <button type="button" className="px-2 py-1 rounded bg-gray-100" onClick={()=>generarHorarios(i)}>Generar horarios</button>
                      <div className="flex flex-wrap gap-1">
                        {(med.horarios||[]).map((h,hi)=>(
                          <button key={hi} type="button" className="px-2 py-0.5 rounded-full bg-primary/10 text-primary" onClick={()=>{
                            const next = [...(med.horarios||[])]
                            next.splice(hi,1)
                            actualizarMedicamento(i,'horarios',next)
                          }}>{h} ×</button>
                        ))}
                      </div>
                    </div>
                    <Textarea rows={2} placeholder="Indicaciones especiales" value={med.indicaciones} onChange={(e)=>actualizarMedicamento(i,'indicaciones',e.target.value)} />
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Cantidad: {med.cantidad_prescrita}</span>
                      <div className="flex items-center gap-3">
                        <button type="button" className="text-blue-600" onClick={()=>duplicarMedicamento(i)} title="Duplicar (Alt+D)">Duplicar</button>
                        <button type="button" className="text-red-600" onClick={()=>quitarMedicamento(i)}>Quitar</button>
                      </div>
                    </div>
                    {advertenciasAlergias.some(a=>a.medicamento_id===med.medicamento_id) && (
                      <div className="text-[11px] text-red-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3"/> Posible alergia relacionada</div>
                    )}
                    {advertenciasDuplicados.some(a=>a.medicamento_id===med.medicamento_id) && (
                      <div className="text-[11px] text-orange-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3"/> Posible duplicado de molécula</div>
                    )}
                  </CardContent>
                </Card>
                </motion.div>
              ))}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Observaciones (opcional)</label>
                <Textarea rows={3} className="hc-input" value={observaciones} onChange={(e)=>setObservaciones(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-xs">
            <div className="text-gray-500">Medicamentos agregados: {medicamentosSeleccionados.length}</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={()=>setPaso(1)}>Anterior</Button>
              <Button onClick={()=>setPaso(3)} disabled={medicamentosSeleccionados.length===0 || advertenciasCamposIncompletos.length>0}>Continuar</Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="3" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <Card className="border-primary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary"/>Resumen final</CardTitle>
                  <CardDescription>Verifica antes de generar la prescripción</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div><strong>Diagnóstico:</strong> {diagnostico || '—'}</div>
                  <div className="space-y-2">
                    <strong>Medicamentos:</strong>
                    {medicamentosSeleccionados.map(m => (
                      <div key={m.medicamento_id} className="text-xs pl-2 border-l">
                        {m.nombre} · {m.dosis}, {m.frecuencia}, {m.duracion}
                        {m.indicaciones && <span className="italic"> · {m.indicaciones}</span>}
                      </div>
                    ))}
                  </div>
                  <div><strong>Observaciones:</strong> {observaciones || '—'}</div>
                  {advertenciasAlergias.length>0 && (
                    <div className="text-red-600 text-xs flex items-center gap-1"><AlertTriangle className="h-3 w-3"/>Se detectaron posibles alergias asociadas. Confirmar manualmente.</div>
                  )}
                  {advertenciasCamposIncompletos.length>0 && (
                    <div className="text-orange-600 text-xs flex items-center gap-1"><AlertTriangle className="h-3 w-3"/>Hay medicamentos con campos incompletos. Completa antes de continuar.</div>
                  )}
                </CardContent>
              </Card>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={()=>setPaso(2)}>Anterior</Button>
                <Button variant="outline" onClick={()=>{window.print(); logAction({ action: 'RESOURCE_ACCESS', resourceType: 'prescripcion', actionType: 'RX_PRINT' })}}><Printer className="h-4 w-4 mr-2"/>Imprimir</Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={crear} disabled={advertenciasCamposIncompletos.length>0}><Pill className="h-4 w-4 mr-2"/>Generar Prescripción</Button>
              </div>
            </div>
            <div className="lg:col-span-2 md:sticky md:top-2">
              {vistaPreviaActiva && (
                <div className="rounded-xl border bg-gradient-to-br from-gray-50 to-white p-3 sm:p-4 max-h-[70vh] overflow-auto">
                  <PrescriptionPreview pacienteNombre={`${paciente.nombre} ${paciente.apellido_paterno}`} diagnostico={diagnostico} medicamentos={medicamentosSeleccionados.map((m,i)=>({...m,index:i})) as any} observaciones={observaciones} fecha={new Date()} medico={'Dr. Luna Rivera'} />
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
