// Wrapper V2 del generador de prescripciones detrás del flag HC_RX_V2
// Proporciona: Grid 12 (7 editor / 5 vista previa), panel de contexto, footer fijo con acciones y atajos.
// No modifica el componente interno original.
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { PrescripcionBuilderInline, PrescripcionBuilderInlineState } from './PrescripcionBuilderInline'
import { AIAssistPanel } from './AIAssistPanel'
import { CIE10Search } from './CIE10Search'
import { isHcRxV2Enabled } from '@/lib/flags'
import { PrescriptionPreview } from './PrescriptionPreview'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Pill, Mic, MicOff, Save, ArrowLeft, ArrowRight, FileSignature, Info } from 'lucide-react'
import Fuse from 'fuse.js'
import { medicamentosDisponibles } from './PrescripcionBuilderInline'
import toast from 'react-hot-toast'
import { useAuditLog } from '@/hooks/useAuditLog'
import './hc_rx_v2.css'
import { useAuth } from '@/contexts/AuthContext'

interface WrapperProps {
  paciente: {
    id: string
    nombre: string
    apellido_paterno: string
    apellido_materno?: string
    alergias?: string
    enfermedades_cronicas?: string
  }
  onCreated?: (p: any) => void
}

export function PrescripcionBuilderWrapperV2(props: WrapperProps) {
  const { user } = useAuth()
  const enabled = isHcRxV2Enabled()
  const [state, setState] = useState<PrescripcionBuilderInlineState | null>(null)
  const commandsRef = useRef<any>(null)
  const [drawer, setDrawer] = useState<string | null>(null) // simple drawer state placeholder
  const [previewScrollKey] = useState(() => Date.now())
  const [focusElement, setFocusElement] = useState<HTMLElement | null>(null)
  const [mode, setMode] = useState<'manual' | 'rapido' | 'voz'>(() => {
    if (typeof window !== 'undefined') {
      const m = localStorage.getItem('HC_RX_MODE_LAST') as any
      if (m === 'manual' || m === 'rapido' || m === 'voz') return m
    }
    return 'manual'
  })
  const [rapidText, setRapidText] = useState('')
  const [showHelpModes, setShowHelpModes] = useState(false)
  const [fuzzyQuery, setFuzzyQuery] = useState('')
  const [fuzzyResults, setFuzzyResults] = useState<any[]>([])
  const fuseRef = useRef<any>(null)
  const { logAction } = useAuditLog()
  const [showDraftBanner, setShowDraftBanner] = useState(false)
  const [lastSaved, setLastSaved] = useState<string>('')
  const [codigosCIE10, setCodigosCIE10] = useState<Array<{ codigo: string; descripcion: string }>>([])

  // Track focus to restore after step changes (acceptance criteria)
  useEffect(() => {
    if (focusElement) focusElement.focus()
  }, [state?.paso])

  const onState = useCallback((s: PrescripcionBuilderInlineState) => setState(s), [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!enabled) return
      if (e.key === 'F2') { e.preventDefault(); commandsRef.current?.toggleMic(); return }
      if (e.altKey && e.key.toLowerCase() === 'n') { e.preventDefault(); commandsRef.current?.addMedicineQuick(); return }
      if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); commandsRef.current?.next(); return }
      if (e.ctrlKey && e.key === '/') { e.preventDefault(); commandsRef.current?.focusSearch(); return }
      if (e.altKey && e.key.toLowerCase() === 's') { e.preventDefault(); commandsRef.current?.signAndPdf(); return }
      if (e.altKey && e.key.toLowerCase() === 'd') { e.preventDefault(); commandsRef.current?.duplicateLast?.(); return }
      if (e.shiftKey && e.key === '?') { e.preventDefault(); setShowHelpModes(s => !s); return }
      if (e.key === 'Escape') { if (drawer) { e.preventDefault(); setDrawer(null) } else if (showHelpModes) { e.preventDefault(); setShowHelpModes(false) } }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [drawer, enabled, showHelpModes])

  // Open telemetry
  useEffect(() => { if (enabled) logAction({ action: 'ROUTE_ACCESS', resourceType: 'historial', actionType: 'HC_OPEN' }) }, [enabled])
  // Mode telemetry
  useEffect(() => { if (enabled) logAction({ action: 'RESOURCE_ACCESS', resourceType: 'prescripcion', actionType: 'RX_MODE_CHANGE', details: { mode } }) }, [mode])

  // Autosave every 10s when dirty
  useEffect(() => {
    if (!enabled) return
    const key = `HC_RX_DRAFT_${props.paciente.id}`
    try {
      const raw = localStorage.getItem(key)
      if (raw) setShowDraftBanner(true)
    } catch { }
    const interval = setInterval(() => {
      if (!state) return
      const snapshot = JSON.stringify(state)
      if (snapshot !== lastSaved) {
        commandsRef.current?.saveDraft?.()
        const ts = new Date()
        const stamp = ts.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
        toast.success(`Borrador guardado ${stamp}`)
        setLastSaved(snapshot)
        logAction({ action: 'RESOURCE_ACCESS', resourceType: 'prescripcion', actionType: 'RX_SAVE_DRAFT' })
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [enabled, state, lastSaved])

  // Persist mode
  useEffect(() => {
    try { localStorage.setItem('HC_RX_MODE_LAST', mode) } catch { }
  }, [mode])

  const parseRapid = () => {
    if (!rapidText.trim()) { toast.error('Ingresa texto para parsear'); return }
    const lines = rapidText.split(/[;\n]+/).map(l => l.trim()).filter(Boolean)
    const freqMap: Record<string, string> = { 'c/6h': 'cada 6 horas', 'c/8h': 'cada 8 horas', 'c/12h': 'cada 12 horas', 'c/24h': 'cada 24 horas' }
    const parsed: { nombre: string; dosis?: string; frecuencia?: string; duracion?: string; via_administracion?: string }[] = []
    for (const line of lines) {
      const regex = /^(?<nombre>[a-zA-ZÁÉÍÓÚÑáéíóúñ ]+?)\s+(?<dosisNum>\d+[\/,\.]?\d*)\s*(?<dosisUnit>mg|g|mcg|ml)?\s*(?<via>VO|IV|IM|SC)?\s*(?<freq>c\/\d+h|PRN|prn|segun\s+necesidad)?\s*(?:x\s*(?<duracion>\d+d))?/i
      const m = line.match(regex)
      if (m && m.groups) {
        const nombre = m.groups.nombre.trim()
        const dosis = [m.groups.dosisNum, m.groups.dosisUnit].filter(Boolean).join(' ')
        const via = m.groups.via || 'VO'
        let frecuencia = m.groups.freq || ''
        frecuencia = freqMap[frecuencia] || (frecuencia.toLowerCase() === 'prn' ? 'según necesidad' : frecuencia)
        const duracion = m.groups.duracion ? m.groups.duracion.replace('d', ' días') : ''
        parsed.push({ nombre, dosis, frecuencia, duracion, via_administracion: via })
      } else {
        const dur = /x\s*(\d+)d/.exec(line)
        const nombreToken = line.split(/\s+/)[0]
        parsed.push({ nombre: nombreToken, duracion: dur ? dur[1] + ' días' : undefined })
      }
    }
    if (!parsed.length) { toast.error('No se pudo parsear'); return }
    commandsRef.current?.addParsedMedicamentos(parsed)
    setRapidText('')
    if (state?.paso === 1) commandsRef.current?.next()
  }

  // Fuzzy search init
  useEffect(() => {
    if (!fuseRef.current) {
      fuseRef.current = new Fuse(medicamentosDisponibles, { keys: ['nombre_comercial', 'nombre_generico', 'categoria'], threshold: 0.3 })
    }
  }, [])

  useEffect(() => {
    if (fuzzyQuery.trim().length === 0) { setFuzzyResults([]); return }
    const res = fuseRef.current.search(fuzzyQuery.trim()).slice(0, 8).map((r: any) => r.item)
    setFuzzyResults(res)
  }, [fuzzyQuery])

  const saveDraft = () => {
    commandsRef.current?.saveDraft()
  }
  const signPdf = () => {
    window.print()
    toast.success('PDF generado')
    commandsRef.current?.signAndPdf()
    logAction({ action: 'RESOURCE_ACCESS', resourceType: 'prescripcion', actionType: 'RX_PDF_VIEW' })
  }

  if (!enabled) {
    // Fallback: render original inline component
    return <PrescripcionBuilderInline paciente={props.paciente} onCreated={props.onCreated} />
  }

  return (
    <div className="relative hc-fade-in" data-hc-rx-v2>
      {showDraftBanner && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 rounded-lg border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 text-sm text-amber-900 flex items-center justify-between shadow-md"
          role="alert"
        >
          <div className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            <span className="font-medium">Borrador encontrado - última edición guardada</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="border-amber-400 text-amber-700 hover:bg-amber-100" onClick={() => {
              try { const raw = localStorage.getItem(`HC_RX_DRAFT_${props.paciente.id}`); if (raw) { const s = JSON.parse(raw); commandsRef.current?.restoreDraft?.(s) } } catch { }
              setShowDraftBanner(false)
            }}>Restaurar</Button>
            <Button size="sm" variant="ghost" className="text-amber-600 hover:bg-amber-100" onClick={() => { try { localStorage.removeItem(`HC_RX_DRAFT_${props.paciente.id}`) } catch { } setShowDraftBanner(false) }}>Descartar</Button>
          </div>
        </motion.div>
      )}
      <div className="grid grid-cols-12 gap-6">
        {/* Columna editor */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          {/* Segmented control modos - Estilos mejorados */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
            <div role="radiogroup" aria-label="Modo de ingreso" className="hc-segmented-control">
              {(['manual', 'rapido', 'voz'] as const).map(opt => (
                <motion.button
                  key={opt}
                  role="radio"
                  aria-checked={mode === opt}
                  onClick={() => setMode(opt)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="hc-segmented-btn"
                >{opt === 'manual' ? '✍️ Manual' : opt === 'rapido' ? '⚡ Rápido' : '🎤 Voz'}</motion.button>
              ))}
            </div>
            <div className="text-[11px] text-gray-600 flex items-center gap-2" aria-live="polite">
              {mode === 'manual' && 'Modo manual: usa formularios y búsqueda estándar.'}
              {mode === 'rapido' && 'Modo rápido: pega texto estructurado y parsea medicamentos.'}
              {mode === 'voz' && 'Modo voz: dicta diagnóstico y notas, controla con F2.'}
              <button onClick={() => setShowHelpModes(s => !s)} className="ml-auto px-2 py-1 rounded bg-gray-100 text-gray-600 text-[10px] flex items-center gap-1" title="¿Qué es cada modo? (Shift+?)"><Info className="h-3 w-3" />Ayuda</button>
            </div>
            {showHelpModes && (
              <div className="text-[11px] bg-white border rounded p-3 space-y-1" role="region" aria-label="Ayuda modos">
                <p><strong>Manual:</strong> Interfaz completa paso a paso.</p>
                <p><strong>Rápido:</strong> Pega líneas como "amoxicilina 500 mg VO c/8h x 7d; paracetamol 500 mg PRN" y presiona Parsear.</p>
                <p><strong>Voz:</strong> F2 inicia/detiene dictado del diagnóstico. Puedes corregir gramática luego.</p>
                <p>Atajos: F2 voz · Alt+N nuevo medicamento · Ctrl+Enter continuar · Alt+S firmar · Ctrl+/ búsqueda · Esc cerrar.</p>
              </div>
            )}
          </motion.div>
          {mode === 'rapido' && state?.paso === 2 && (
            <div className="space-y-2">
              <label className="text-xs font-medium">Entrada rápida (separa medicamentos con ;)</label>
              <textarea
                value={rapidText}
                onChange={e => setRapidText(e.target.value)}
                rows={3}
                placeholder="Ej: amoxicilina 500 mg VO c/8h x 7d; paracetamol 500 mg PRN; ibuprofeno 400 mg VO c/8h x 5d"
                className="w-full text-xs p-2 border rounded-md focus:ring-2 focus:ring-primary/60"
              />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={parseRapid}>Parsear</Button>
                <Button size="sm" variant="ghost" disabled={!rapidText.trim()} onClick={() => setRapidText('')}>Limpiar</Button>
              </div>
            </div>
          )}
          {mode === 'voz' && state?.paso === 1 && (
            <div className="text-[11px] text-primary flex items-center gap-2">
              {commandsRef.current?.voiceSupported?.() ? (commandsRef.current?.isMicActive?.() ? 'Dictando... (F2 para detener)' : 'Micrófono listo (F2 para dictar)') : 'Voz no soportada, usa modo manual'}
            </div>
          )}
          <PrescripcionBuilderInline
            paciente={props.paciente}
            onCreated={props.onCreated}
            variant="external"
            hideInternalPreview
            onState={onState}
            commandsRef={commandsRef}
          />

          {/* Panel de IA Asistida */}
          {state?.paso === 1 && (
            <>
              <AIAssistPanel
                diagnostico={state.diagnostico}
                medicamentos={state.medicamentosSeleccionados}
                onInsert={(type, content) => {
                  if (type === 'diagnostico') {
                    commandsRef.current?.appendDiagnostico?.(content)
                    logAction({ action: 'RESOURCE_ACCESS', resourceType: 'prescripcion', actionType: 'RX_AI_SUGGEST', details: { type, content: content.substring(0, 50) } })
                  } else if (type === 'plan') {
                    commandsRef.current?.appendDiagnostico?.(' | ' + content)
                  } else if (type === 'observacion') {
                    commandsRef.current?.appendDiagnostico?.(' | Indicaciones: ' + content)
                  }
                }}
                onCorrect={() => commandsRef.current?.correctGrammar?.()}
              />

              {/* Buscador CIE-10 */}
              <Card className="mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <span className="hc-badge hc-badge-info">CIE-10</span>
                    Codificación diagnóstica
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CIE10Search
                    selectedCodes={codigosCIE10}
                    onAdd={(item) => {
                      setCodigosCIE10(prev => [...prev, item])
                      toast.success(`${item.codigo} agregado`)
                      logAction({ action: 'RESOURCE_ACCESS', resourceType: 'prescripcion', actionType: 'RX_CIE10_ADD', details: { codigo: item.codigo } })
                    }}
                    onRemove={(codigo) => {
                      setCodigosCIE10(prev => prev.filter(c => c.codigo !== codigo))
                      toast.success('Código eliminado')
                    }}
                    placeholder="Buscar código CIE-10 por nombre o código..."
                  />
                </CardContent>
              </Card>
            </>
          )}

          {/* Fuzzy selector avanzado (categorías + resultados) */}
          {state?.paso === 2 && (
            <Card className="mt-2">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Búsqueda Universal (Ctrl+/)</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <input
                  type="text"
                  value={fuzzyQuery}
                  onChange={e => setFuzzyQuery(e.target.value)}
                  placeholder="Buscar por nombre, genérico o categoría..."
                  className="w-full px-3 py-2 text-xs border rounded-md focus:ring-2 focus:ring-primary/60"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto">
                  {(fuzzyResults.length ? fuzzyResults : medicamentosDisponibles.slice(0, 8)).map((m: any, idx: number) => (
                    <div key={idx} className="border rounded-md p-2 flex flex-col gap-1 hover:border-primary">
                      <div className="text-xs font-medium">{m.nombre_comercial} <span className="text-[10px] text-gray-500">{m.concentracion}</span></div>
                      <div className="text-[10px] text-gray-500">{m.nombre_generico} · {m.categoria}</div>
                      <button
                        type="button"
                        onClick={() => commandsRef.current?.addParsedMedicamentos?.([{ nombre: m.nombre_comercial, dosis: m.dosis_recomendada, frecuencia: m.frecuencia_opciones?.[0], duracion: m.max_dias ? m.max_dias + ' días' : '' }])}
                        className="text-[10px] mt-1 px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20"
                      >Añadir</button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {/* Panel de contexto */}
          <Card className="mt-2">
            <CardHeader className="pb-2 flex flex-row justify-between items-center">
              <CardTitle className="text-sm">Información relevante</CardTitle>
              {props.paciente.alergias && (
                <Badge variant="destructive" className="text-xs flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Alergias</Badge>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2 text-xs">
                {props.paciente.alergias && (
                  <button onClick={() => setDrawer('alergias')} className="px-2 py-1 rounded-full bg-red-100 text-red-700">Alergias</button>
                )}
                {props.paciente.enfermedades_cronicas && (
                  <button onClick={() => setDrawer('cronicas')} className="px-2 py-1 rounded-full bg-amber-100 text-amber-700">Enf. crónicas</button>
                )}
                <button onClick={() => setDrawer('signos')} className="px-2 py-1 rounded-full bg-blue-100 text-blue-700">Signos vitales</button>
                <button onClick={() => setDrawer('estudios')} className="px-2 py-1 rounded-full bg-purple-100 text-purple-700">Últimos estudios</button>
                <button onClick={() => setDrawer('recetas')} className="px-2 py-1 rounded-full bg-green-100 text-green-700">Recetas previas</button>
              </div>
              {drawer && (
                <div className="mt-3 text-xs border rounded-md p-3 bg-gray-50" role="dialog" aria-label={`Detalle ${drawer}`}>
                  <div className="flex justify-between mb-2">
                    <strong className="capitalize">{drawer}</strong>
                    <button className="text-gray-500" onClick={() => setDrawer(null)}>Cerrar (Esc)</button>
                  </div>
                  <p className="text-gray-600">Contenido demo de {drawer}. Aquí se listarían datos clínicos detallados.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Columna vista previa */}
        <div className="col-span-12 lg:col-span-5">
          <div className="sticky top-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="hc-preview-sticky"
              aria-label="Vista previa de receta"
              role="region"
            >
              <PrescriptionPreview
                pacienteNombre={`${props.paciente.nombre} ${props.paciente.apellido_paterno}`}
                diagnostico={state?.diagnostico || ''}
                medicamentos={(state?.medicamentosSeleccionados || []).map((m, i) => ({ ...m, index: i })) as any}
                observaciones={state?.observaciones || ''}
                fecha={new Date()}
                medico={user ? `${user.nombre} ${user.apellido_paterno || ''} ${user.apellido_materno || ''}`.trim() : 'Dr. Usuario'}
              />
            </motion.div>
          </div>
        </div>
      </div>
      {/* Footer fijo con estilos mejorados */}
      <div className="hc-footer-sticky flex items-center justify-between gap-3" role="toolbar" aria-label="Acciones de prescripción">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span>Paso {state?.paso}/3</span>
          <span>Medicamentos: {state?.medicamentosSeleccionados.length || 0}</span>
          <span>Modo: {mode}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={saveDraft} title="Guardar borrador (autosave próximamente)"><Save className="h-4 w-4 mr-1" />Guardar borrador</Button>
          <Button variant="outline" size="sm" onClick={() => commandsRef.current?.prev()} disabled={state?.paso === 1}><ArrowLeft className="h-4 w-4 mr-1" />Anterior</Button>
          {state?.paso! < 3 && (
            <Button size="sm" onClick={() => commandsRef.current?.next()} disabled={state?.paso === 3 || (state?.paso === 1 && !(state?.diagnostico || '').trim()) || (state?.paso === 2 && (state?.medicamentosSeleccionados.length || 0) === 0)}><ArrowRight className="h-4 w-4 mr-1" />Siguiente</Button>
          )}
          {state?.paso === 3 && (
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={signPdf} title="Firmar y generar PDF (Alt+S)"><FileSignature className="h-4 w-4 mr-1" />Firmar & PDF</Button>
          )}
          {state?.paso === 2 && <Button variant="outline" size="sm" onClick={() => commandsRef.current?.duplicateLast?.()} title="Duplicar último (Alt+D)">Duplicar último</Button>}
        </div>
      </div>
    </div>
  )
}
