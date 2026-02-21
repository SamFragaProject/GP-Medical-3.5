import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, Info, X, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { RestriccionMedicaCatalogo } from '@/types/dictamen';

interface SelectorRestriccionesProps {
  selected: string[];
  onChange: (value: string[]) => void;
  puestoId?: string;
}

// ══════════════════════════════════════════════════════════════
// CATÁLOGO DE RESTRICCIONES CODIFICADAS POR PUESTO
// Cada restricción tiene puestos_aplicables y riesgos_relacionados
// para filtrado contextual según el puesto del trabajador.
// ══════════════════════════════════════════════════════════════

const CATALOGO_RESTRICCIONES: RestriccionMedicaCatalogo[] = [
  // ── FÍSICAS ──
  {
    id: 'R-F001', codigo: 'R-F001',
    descripcion: 'No realizar levantamiento manual de cargas superiores a 15 kg',
    descripcion_corta: 'No levantar cargas >15 kg',
    tipo_restriccion: 'fisica',
    puestos_aplicables: ['operador', 'montacarguista', 'almacenista', 'técnico'],
    riesgos_relacionados: ['ergonómico', 'lumbalgia', 'hernia discal'],
    duracion_default_dias: 90, requiere_revision: true, prioridad: 1, activo: true,
    created_at: '', updated_at: ''
  },
  {
    id: 'R-F002', codigo: 'R-F002',
    descripcion: 'No realizar trabajo en alturas mayores a 1.8 metros sin arnés de seguridad',
    descripcion_corta: 'No trabajar en alturas',
    tipo_restriccion: 'fisica',
    puestos_aplicables: ['operador', 'técnico', 'soldador', 'electricista'],
    riesgos_relacionados: ['caída', 'vértigo', 'hipoacusia'],
    duracion_default_dias: 180, requiere_revision: true, prioridad: 1, activo: true,
    created_at: '', updated_at: ''
  },
  {
    id: 'R-F003', codigo: 'R-F003',
    descripcion: 'No operar maquinaria pesada ni vehículos industriales',
    descripcion_corta: 'No operar maquinaria pesada',
    tipo_restriccion: 'fisica',
    puestos_aplicables: ['montacarguista', 'operador', 'chofer'],
    riesgos_relacionados: ['atrapamiento', 'neurológico', 'visual'],
    duracion_default_dias: 60, requiere_revision: true, prioridad: 1, activo: true,
    created_at: '', updated_at: ''
  },
  {
    id: 'R-F004', codigo: 'R-F004',
    descripcion: 'No realizar movimientos repetitivos de miembros superiores por más de 2 horas continuas',
    descripcion_corta: 'Limitar movimientos repetitivos',
    tipo_restriccion: 'fisica',
    puestos_aplicables: ['operador', 'técnico', 'administrativo', 'soldador'],
    riesgos_relacionados: ['túnel carpiano', 'tendinitis', 'ergonómico'],
    duracion_default_dias: 60, requiere_revision: true, prioridad: 2, activo: true,
    created_at: '', updated_at: ''
  },
  {
    id: 'R-F005', codigo: 'R-F005',
    descripcion: 'No mantener postura sedente prolongada (máximo 2 horas sin pausas activas)',
    descripcion_corta: 'Limitar postura sedente',
    tipo_restriccion: 'fisica',
    puestos_aplicables: ['administrativo', 'chofer', 'montacarguista'],
    riesgos_relacionados: ['lumbalgia', 'ergonómico', 'cardiovascular'],
    duracion_default_dias: 30, requiere_revision: false, prioridad: 3, activo: true,
    created_at: '', updated_at: ''
  },
  {
    id: 'R-F006', codigo: 'R-F006',
    descripcion: 'No realizar esfuerzos de empuje o tracción superiores a 25 kg',
    descripcion_corta: 'No empujar/tirar >25 kg',
    tipo_restriccion: 'fisica',
    puestos_aplicables: ['operador', 'almacenista', 'técnico'],
    riesgos_relacionados: ['ergonómico', 'lumbalgia', 'hombro'],
    duracion_default_dias: 90, requiere_revision: true, prioridad: 2, activo: true,
    created_at: '', updated_at: ''
  },
  {
    id: 'R-F007', codigo: 'R-F007',
    descripcion: 'No trabajar en espacios confinados',
    descripcion_corta: 'No ingresar espacios confinados',
    tipo_restriccion: 'fisica',
    puestos_aplicables: ['operador', 'técnico', 'soldador'],
    riesgos_relacionados: ['asfixia', 'neurológico', 'cardiovascular'],
    duracion_default_dias: 180, requiere_revision: true, prioridad: 1, activo: true,
    created_at: '', updated_at: ''
  },

  // ── QUÍMICAS ──
  {
    id: 'R-Q001', codigo: 'R-Q001',
    descripcion: 'No manipular sustancias tóxicas, solventes orgánicos ni productos químicos sin EPP completo',
    descripcion_corta: 'No manipular químicos tóxicos',
    tipo_restriccion: 'quimica',
    puestos_aplicables: ['operador', 'técnico', 'soldador'],
    riesgos_relacionados: ['intoxicación', 'dermatitis', 'respiratorio'],
    duracion_default_dias: 90, requiere_revision: true, prioridad: 1, activo: true,
    created_at: '', updated_at: ''
  },
  {
    id: 'R-Q002', codigo: 'R-Q002',
    descripcion: 'No exponerse a polvos o partículas en suspensión sin respirador certificado',
    descripcion_corta: 'No exposición a polvos',
    tipo_restriccion: 'quimica',
    puestos_aplicables: ['operador', 'técnico', 'soldador', 'almacenista'],
    riesgos_relacionados: ['neumoconiosis', 'respiratorio', 'alergias'],
    duracion_default_dias: 180, requiere_revision: true, prioridad: 1, activo: true,
    created_at: '', updated_at: ''
  },

  // ── BIOLÓGICAS ──
  {
    id: 'R-B001', codigo: 'R-B001',
    descripcion: 'No manipular sustancias biológicas ni residuos peligrosos biológicos infecciosos',
    descripcion_corta: 'No contacto con RPBI',
    tipo_restriccion: 'biologica',
    puestos_aplicables: ['técnico', 'operador'],
    riesgos_relacionados: ['infección', 'biológico'],
    duracion_default_dias: 60, requiere_revision: true, prioridad: 2, activo: true,
    created_at: '', updated_at: ''
  },

  // ── PSICOSOCIALES ──
  {
    id: 'R-P001', codigo: 'R-P001',
    descripcion: 'No laborar en turnos nocturnos ni jornadas mayores a 8 horas',
    descripcion_corta: 'No turno nocturno / jornada >8h',
    tipo_restriccion: 'psicosocial',
    puestos_aplicables: ['operador', 'montacarguista', 'chofer', 'técnico', 'administrativo'],
    riesgos_relacionados: ['fatiga', 'estrés', 'trastorno del sueño'],
    duracion_default_dias: 90, requiere_revision: true, prioridad: 2, activo: true,
    created_at: '', updated_at: ''
  },
  {
    id: 'R-P002', codigo: 'R-P002',
    descripcion: 'No desempeñar funciones de supervisión o alta responsabilidad temporalmente',
    descripcion_corta: 'No funciones de alta responsabilidad',
    tipo_restriccion: 'psicosocial',
    puestos_aplicables: ['administrativo', 'técnico'],
    riesgos_relacionados: ['estrés laboral', 'burnout', 'ansiedad'],
    duracion_default_dias: 60, requiere_revision: true, prioridad: 3, activo: true,
    created_at: '', updated_at: ''
  },

  // ── AMBIENTALES ──
  {
    id: 'R-A001', codigo: 'R-A001',
    descripcion: 'No exponerse a ruido superior a 85 dB sin protección auditiva doble',
    descripcion_corta: 'No exposición a ruido >85 dB',
    tipo_restriccion: 'ambiental',
    puestos_aplicables: ['operador', 'técnico', 'soldador', 'montacarguista'],
    riesgos_relacionados: ['hipoacusia', 'NOM-011', 'ruido'],
    duracion_default_dias: 180, requiere_revision: true, prioridad: 1, activo: true,
    created_at: '', updated_at: ''
  },
  {
    id: 'R-A002', codigo: 'R-A002',
    descripcion: 'No exponerse a temperaturas extremas (>40°C o <5°C) sin equipo adecuado',
    descripcion_corta: 'No temperaturas extremas',
    tipo_restriccion: 'ambiental',
    puestos_aplicables: ['operador', 'técnico', 'soldador'],
    riesgos_relacionados: ['golpe de calor', 'hipotermia', 'cardiovascular'],
    duracion_default_dias: 90, requiere_revision: true, prioridad: 2, activo: true,
    created_at: '', updated_at: ''
  },
  {
    id: 'R-A003', codigo: 'R-A003',
    descripcion: 'No exponerse a vibraciones cuerpo entero o mano-brazo sin amortiguamiento',
    descripcion_corta: 'No vibraciones mano-brazo',
    tipo_restriccion: 'ambiental',
    puestos_aplicables: ['operador', 'montacarguista', 'chofer', 'técnico'],
    riesgos_relacionados: ['síndrome de Raynaud', 'ergonómico', 'neurológico'],
    duracion_default_dias: 90, requiere_revision: true, prioridad: 2, activo: true,
    created_at: '', updated_at: ''
  },
  {
    id: 'R-A004', codigo: 'R-A004',
    descripcion: 'No conducir vehículos de la empresa ni equipo de transporte',
    descripcion_corta: 'No conducir vehículos',
    tipo_restriccion: 'fisica',
    puestos_aplicables: ['chofer', 'montacarguista', 'operador'],
    riesgos_relacionados: ['neurológico', 'visual', 'cardiovascular'],
    duracion_default_dias: 90, requiere_revision: true, prioridad: 1, activo: true,
    created_at: '', updated_at: ''
  },
  {
    id: 'R-A005', codigo: 'R-A005',
    descripcion: 'No realizar soldadura ni trabajos con arco eléctrico',
    descripcion_corta: 'No soldadura ni arco eléctrico',
    tipo_restriccion: 'fisica',
    puestos_aplicables: ['soldador', 'técnico'],
    riesgos_relacionados: ['quemadura', 'UV', 'respiratorio'],
    duracion_default_dias: 60, requiere_revision: true, prioridad: 1, activo: true,
    created_at: '', updated_at: ''
  },
  {
    id: 'R-A006', codigo: 'R-A006',
    descripcion: 'No exponerse a iluminación deficiente ni realizar tareas de precisión visual sin corrección óptica',
    descripcion_corta: 'Requiere corrección óptica',
    tipo_restriccion: 'ambiental',
    puestos_aplicables: ['operador', 'técnico', 'administrativo', 'chofer'],
    riesgos_relacionados: ['visual', 'cefalea', 'fatiga ocular'],
    duracion_default_dias: 365, requiere_revision: false, prioridad: 3, activo: true,
    created_at: '', updated_at: ''
  },
];

// Todos los puestos posibles
const PUESTOS_DISPONIBLES = [
  { id: 'operador', label: 'Operador' },
  { id: 'montacarguista', label: 'Montacarguista' },
  { id: 'técnico', label: 'Técnico' },
  { id: 'administrativo', label: 'Administrativo' },
  { id: 'chofer', label: 'Chofer / Conductor' },
  { id: 'soldador', label: 'Soldador' },
  { id: 'almacenista', label: 'Almacenista' },
  { id: 'electricista', label: 'Electricista' },
];

const tipoCategoriaColors: Record<string, string> = {
  fisica: 'bg-orange-100 text-orange-700 border-orange-200',
  quimica: 'bg-purple-100 text-purple-700 border-purple-200',
  biologica: 'bg-rose-100 text-rose-700 border-rose-200',
  psicosocial: 'bg-blue-100 text-blue-700 border-blue-200',
  ambiental: 'bg-teal-100 text-teal-700 border-teal-200',
};

const categorias = ['todas', 'fisica', 'quimica', 'biologica', 'psicosocial', 'ambiental'];
const categoriaLabels: Record<string, string> = {
  todas: 'Todas',
  fisica: 'Físicas',
  quimica: 'Químicas',
  biologica: 'Biológicas',
  psicosocial: 'Psicosociales',
  ambiental: 'Ambientales',
};

export function SelectorRestricciones({ selected, onChange, puestoId }: SelectorRestriccionesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('todas');
  const [hoveredRestriccion, setHoveredRestriccion] = useState<string | null>(null);
  const [filtroPuesto, setFiltroPuesto] = useState<string>(puestoId || '');

  useEffect(() => {
    if (puestoId) setFiltroPuesto(puestoId);
  }, [puestoId]);

  const restriccionesFiltradas = CATALOGO_RESTRICCIONES.filter(r => {
    const matchesSearch = r.descripcion_corta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = categoriaSeleccionada === 'todas' || r.tipo_restriccion === categoriaSeleccionada;
    const matchesPuesto = !filtroPuesto || r.puestos_aplicables.includes(filtroPuesto.toLowerCase());
    return matchesSearch && matchesCategoria && matchesPuesto && !selected.includes(r.id);
  });

  const restriccionesSeleccionadas = CATALOGO_RESTRICCIONES.filter(r => selected.includes(r.id));

  const toggleRestriccion = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const removeRestriccion = (id: string) => {
    onChange(selected.filter(s => s !== id));
  };

  return (
    <div className="space-y-4">
      {/* Restricciones seleccionadas */}
      {restriccionesSeleccionadas.length > 0 && (
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <p className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-emerald-500 text-white rounded-lg flex items-center justify-center text-xs font-black">
              {restriccionesSeleccionadas.length}
            </span>
            Restricciones seleccionadas
          </p>
          <div className="flex flex-wrap gap-2">
            {restriccionesSeleccionadas.map((r) => (
              <Badge
                key={r.id}
                variant="secondary"
                className="bg-white border border-emerald-200 text-emerald-800 pl-2 pr-1 py-1.5 rounded-lg"
              >
                <span className="font-mono text-[10px] text-emerald-500 mr-1.5">{r.codigo}</span>
                <span className="mr-1 text-xs font-semibold">{r.descripcion_corta}</span>
                {r.duracion_default_dias && (
                  <span className="text-[10px] text-emerald-400 mr-1">({r.duracion_default_dias}d)</span>
                )}
                <button
                  type="button"
                  onClick={() => removeRestriccion(r.id)}
                  className="ml-1 p-0.5 hover:bg-rose-100 rounded text-rose-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Filtro por puesto */}
      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
        <Briefcase className="w-4 h-4 text-blue-600" />
        <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">Filtrar por puesto:</span>
        <select
          className="flex-1 h-8 px-3 rounded-lg border border-blue-200 bg-white text-sm font-medium text-slate-700"
          value={filtroPuesto}
          onChange={e => setFiltroPuesto(e.target.value)}
        >
          <option value="">Todos los puestos</option>
          {PUESTOS_DISPONIBLES.map(p => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
        {filtroPuesto && (
          <Badge className="bg-blue-500 text-white border-none text-[10px] font-black">
            {restriccionesFiltradas.length + restriccionesSeleccionadas.filter(r => r.puestos_aplicables.includes(filtroPuesto)).length} aplicables
          </Badge>
        )}
      </div>

      {/* Búsqueda y filtros por categoría */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar restricción por código o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categorias.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoriaSeleccionada(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors uppercase tracking-wider ${categoriaSeleccionada === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {categoriaLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de restricciones */}
      <ScrollArea className="h-[260px] border rounded-xl">
        <div className="p-2 space-y-1.5">
          {restriccionesFiltradas.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No se encontraron restricciones</p>
              {filtroPuesto && <p className="text-xs text-slate-400 mt-1">Prueba quitando el filtro de puesto</p>}
            </div>
          ) : (
            restriccionesFiltradas.map((restriccion) => (
              <div
                key={restriccion.id}
                className="relative"
                onMouseEnter={() => setHoveredRestriccion(restriccion.id)}
                onMouseLeave={() => setHoveredRestriccion(null)}
              >
                <button
                  type="button"
                  onClick={() => toggleRestriccion(restriccion.id)}
                  className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{restriccion.codigo}</span>
                        <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider border rounded-md ${tipoCategoriaColors[restriccion.tipo_restriccion] || ''}`}>
                          {restriccion.tipo_restriccion}
                        </Badge>
                        {restriccion.requiere_revision && (
                          <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200 bg-amber-50 font-bold rounded-md">
                            Rev. requerida
                          </Badge>
                        )}
                      </div>
                      <p className="font-semibold text-sm text-slate-900 mt-1.5">{restriccion.descripcion_corta}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        {restriccion.duracion_default_dias && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            ⏱ {restriccion.duracion_default_dias} días
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-medium">
                          👷 {restriccion.puestos_aplicables.join(', ')}
                        </span>
                      </div>
                    </div>
                    <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                  </div>
                </button>

                {/* Tooltip */}
                {hoveredRestriccion === restriccion.id && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-1 p-4 bg-slate-800 text-white text-xs rounded-xl shadow-2xl border border-slate-700">
                    <p className="font-bold mb-1">{restriccion.descripcion_corta}</p>
                    <p className="opacity-90 leading-relaxed">{restriccion.descripcion}</p>
                    <div className="flex items-center gap-4 mt-2 pt-2 border-t border-slate-700">
                      <span className="text-slate-400">Riesgos: {restriccion.riesgos_relacionados.join(', ')}</span>
                    </div>
                    <div className="absolute -top-1 left-4 w-2 h-2 bg-slate-800 rotate-45"></div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {selected.length === 0 && (
        <p className="text-sm text-amber-600 flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4" />
          Seleccione al menos una restricción del catálogo
        </p>
      )}
    </div>
  );
}
