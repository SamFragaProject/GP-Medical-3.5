import React, { useState } from 'react';
import { 
  Grid3X3, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  MapPin,
  TrendingUp,
  Filter,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  NivelRiesgoREBATexto,
  type NivelRiesgoREBA,
  type MatrizRiesgoErgonomico
} from '@/types/nom036';

// Datos de ejemplo
const matrizEjemplo: MatrizRiesgoErgonomico[] = [
  {
    id: '1',
    empresa_id: 'e1',
    area: 'Almacén',
    puesto: 'Almacenista',
    numero_trabajadores: 8,
    riesgos: [
      { tipo: 'postura', descripcion: 'Flexión de tronco prolongada', severidad: 'moderado' },
      { tipo: 'fuerza', descripcion: 'Carga manual >25kg', severidad: 'severo' },
    ],
    evaluacion_reba: 9,
    evaluacion_niosh: 2.5,
    nivel_riesgo: 'muy_alto',
    medidas_preventivas: ['Capacitación en técnica de levantamiento'],
    medidas_correctivas: ['Implementar ayudas mecánicas'],
    estado: 'identificado',
    trabajadores: [
      { id: 't1', nombre: 'Juan Martínez', puesto: 'Almacenista' },
      { id: 't2', nombre: 'Pedro López', puesto: 'Almacenista' },
    ],
    fecha_evaluacion: '2026-02-01',
    fecha_proxima_evaluacion: '2026-08-01',
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-02-01T00:00:00Z',
  },
  {
    id: '2',
    empresa_id: 'e1',
    area: 'Producción',
    puesto: 'Operario de ensamblaje',
    numero_trabajadores: 15,
    riesgos: [
      { tipo: 'repeticion', descripcion: 'Movimientos repetitivos de muñeca', severidad: 'moderado' },
    ],
    evaluacion_reba: 5,
    nivel_riesgo: 'medio',
    medidas_preventivas: ['Pausas activas programadas'],
    medidas_correctivas: ['Rotación de puestos'],
    estado: 'en_control',
    trabajadores: [
      { id: 't3', nombre: 'María García', puesto: 'Operaria' },
    ],
    fecha_evaluacion: '2026-01-15',
    fecha_proxima_evaluacion: '2026-07-15',
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-01-15T00:00:00Z',
  },
  {
    id: '3',
    empresa_id: 'e1',
    area: 'Oficina',
    puesto: 'Analista',
    numero_trabajadores: 12,
    riesgos: [
      { tipo: 'postura', descripcion: 'Sedentarismo prolongado', severidad: 'leve' },
    ],
    evaluacion_reba: 2,
    nivel_riesgo: 'bajo',
    medidas_preventivas: ['Estaciones de trabajo ergonómicas'],
    estado: 'controlado',
    fecha_evaluacion: '2026-01-20',
    fecha_proxima_evaluacion: '2026-07-20',
    created_at: '2026-01-20T00:00:00Z',
    updated_at: '2026-01-20T00:00:00Z',
  },
  {
    id: '4',
    empresa_id: 'e1',
    area: 'Mantenimiento',
    puesto: 'Soldador',
    numero_trabajadores: 4,
    riesgos: [
      { tipo: 'postura', descripcion: 'Posturas forzadas', severidad: 'severo' },
      { tipo: 'fuerza', descripcion: 'Manipulación de herramientas pesadas', severidad: 'moderado' },
    ],
    evaluacion_reba: 11,
    nivel_riesgo: 'muy_alto',
    medidas_preventivas: ['EPP específico'],
    medidas_correctivas: ['Rediseño de puesto de trabajo', 'Ayudas mecánicas'],
    estado: 'identificado',
    fecha_evaluacion: '2026-02-05',
    fecha_proxima_evaluacion: '2026-08-05',
    created_at: '2026-02-05T00:00:00Z',
    updated_at: '2026-02-05T00:00:00Z',
  },
];

const estadoColors = {
  identificado: 'bg-slate-100 text-slate-800',
  en_control: 'bg-amber-100 text-amber-800',
  controlado: 'bg-emerald-100 text-emerald-800',
  seguimiento: 'bg-blue-100 text-blue-800',
};

export function MatrizRiesgosErgonomicos() {
  const [matriz, setMatriz] = useState<MatrizRiesgoErgonomico[]>(matrizEjemplo);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroNivel, setFiltroNivel] = useState<NivelRiesgoREBA | 'todos'>('todos');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  const areasFiltradas = matriz.filter(m => {
    const matchesSearch = m.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.puesto?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNivel = filtroNivel === 'todos' || m.nivel_riesgo === filtroNivel;
    return matchesSearch && matchesNivel;
  });

  // Calcular estadísticas
  const stats = {
    total: matriz.length,
    porNivel: {
      negligible: matriz.filter(m => m.nivel_riesgo === 'negligible').length,
      bajo: matriz.filter(m => m.nivel_riesgo === 'bajo').length,
      medio: matriz.filter(m => m.nivel_riesgo === 'medio').length,
      alto: matriz.filter(m => m.nivel_riesgo === 'alto').length,
      muy_alto: matriz.filter(m => m.nivel_riesgo === 'muy_alto').length,
    },
    totalTrabajadores: matriz.reduce((acc, m) => acc + m.numero_trabajadores, 0),
    riesgosCriticos: matriz.filter(m => m.nivel_riesgo === 'muy_alto').length,
  };

  const chartData = [
    { name: 'Negligible', value: stats.porNivel.negligible, color: '#22c55e' },
    { name: 'Bajo', value: stats.porNivel.bajo, color: '#84cc16' },
    { name: 'Medio', value: stats.porNivel.medio, color: '#eab308' },
    { name: 'Alto', value: stats.porNivel.alto, color: '#f97316' },
    { name: 'Muy Alto', value: stats.porNivel.muy_alto, color: '#ef4444' },
  ];

  const getColorPorRiesgo = (nivel: NivelRiesgoREBA): string => {
    const colors: Record<NivelRiesgoREBA, string> = {
      negligible: '#22c55e',
      bajo: '#84cc16',
      medio: '#eab308',
      alto: '#f97316',
      muy_alto: '#ef4444',
    };
    return colors[nivel];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Grid3X3 className="w-8 h-8 text-emerald-600" />
            Matriz de Riesgos Ergonómicos
          </h1>
          <p className="text-slate-500">
            Mapa de calor de riesgos ergonómicos por área
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full">
            <TrendingUp className="w-4 h-4 mr-2" />
            Nueva Evaluación
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border shadow-md">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Áreas Evaluadas</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-md">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Trabajadores</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalTrabajadores}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-md">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Riesgo Alto/Muy Alto</p>
                <p className="text-2xl font-bold text-rose-600">{stats.porNivel.alto + stats.porNivel.muy_alto}</p>
              </div>
              <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-md">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Áreas Controladas</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {matriz.filter(m => m.estado === 'controlado').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mapa de Calor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filtros */}
          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Buscar área o puesto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  className="px-3 py-2 rounded-md border border-gray-200 bg-white text-sm"
                  value={filtroNivel}
                  onChange={(e) => setFiltroNivel(e.target.value as NivelRiesgoREBA | 'todos')}
                >
                  <option value="todos">Todos los niveles</option>
                  <option value="negligible">Negligible</option>
                  <option value="bajo">Bajo</option>
                  <option value="medio">Medio</option>
                  <option value="alto">Alto</option>
                  <option value="muy_alto">Muy Alto</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Grid de áreas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {areasFiltradas.map((area) => (
              <Card 
                key={area.id} 
                className="border shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedArea(selectedArea === area.id ? null : area.id)}
              >
                <CardHeader className="py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{area.area}</CardTitle>
                      <CardDescription>{area.puesto}</CardDescription>
                    </div>
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getColorPorRiesgo(area.nivel_riesgo) }}
                    />
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{area.numero_trabajadores} trabajadores</span>
                    </div>
                    <Badge className={estadoColors[area.estado]}>
                      {area.estado === 'identificado' && 'Identificado'}
                      {area.estado === 'en_control' && 'En Control'}
                      {area.estado === 'controlado' && 'Controlado'}
                      {area.estado === 'seguimiento' && 'Seguimiento'}
                    </Badge>
                  </div>
                  
                  {area.evaluacion_reba && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-500">REBA:</span>
                      <span className="font-mono font-bold">{area.evaluacion_reba}</span>
                      <span 
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ 
                          backgroundColor: `${getColorPorRiesgo(area.nivel_riesgo)}20`,
                          color: getColorPorRiesgo(area.nivel_riesgo)
                        }}
                      >
                        {NivelRiesgoREBATexto[area.nivel_riesgo].texto}
                      </span>
                    </div>
                  )}

                  {selectedArea === area.id && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-700 mb-2">Riesgos Identificados:</p>
                        <div className="space-y-1">
                          {area.riesgos.map((riesgo, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <AlertTriangle className="w-3 h-3 text-amber-500" />
                              <span>{riesgo.descripcion}</span>
                              <Badge variant="outline" className="text-xs">
                                {riesgo.severidad}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {area.medidas_correctivas.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-700 mb-2">Medidas Correctivas:</p>
                          <ul className="text-sm text-slate-600 space-y-1">
                            {area.medidas_correctivas.map((medida, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-emerald-500">•</span>
                                {medida}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {area.trabajadores && area.trabajadores.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-700 mb-2">Trabajadores Expuestos:</p>
                          <div className="flex flex-wrap gap-1">
                            {area.trabajadores.map((t) => (
                              <Badge key={t.id} variant="secondary" className="text-xs">
                                {t.nombre}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Gráficas */}
        <div className="space-y-4">
          <Card className="border shadow-md">
            <CardHeader className="bg-slate-50/50">
              <CardTitle className="text-lg">Distribución de Riesgos</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Leyenda */}
          <Card className="border shadow-md">
            <CardHeader className="bg-slate-50/50 py-4">
              <CardTitle className="text-base">Leyenda de Riesgo</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {Object.entries(NivelRiesgoREBATexto).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: value.color }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{value.texto}</p>
                      <p className="text-xs text-slate-500">{value.accion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
