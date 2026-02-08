import React, { useState } from 'react';
import { 
  Ear, 
  Users, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  HardHat,
  GraduationCap,
  ChevronRight,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { SemaforoNOM011Badge } from './SemaforoNOM011';
import type { ResumenProgramaNOM011, TrabajadorExpuesto } from '@/types/nom011';

// Datos de ejemplo
const resumenEjemplo: ResumenProgramaNOM011 = {
  anio: 2026,
  trabajadores_expuestos: 45,
  trabajadores_estudiados: 38,
  porcentaje_avance: 84,
  semaforos: {
    verde: 30,
    amarillo: 5,
    rojo: 3,
  },
  epp: {
    entregado: 40,
    capacitado: 35,
  },
  capacitaciones: {
    programadas: 4,
    realizadas: 2,
  },
  estudios_por_mes: [
    { mes: 'Ene', cantidad: 8 },
    { mes: 'Feb', cantidad: 12 },
    { mes: 'Mar', cantidad: 6 },
    { mes: 'Abr', cantidad: 0 },
    { mes: 'May', cantidad: 0 },
    { mes: 'Jun', cantidad: 0 },
    { mes: 'Jul', cantidad: 0 },
    { mes: 'Ago', cantidad: 0 },
    { mes: 'Sep', cantidad: 0 },
    { mes: 'Oct', cantidad: 0 },
    { mes: 'Nov', cantidad: 0 },
    { mes: 'Dic', cantidad: 0 },
  ],
};

const trabajadoresRiesgoEjemplo: TrabajadorExpuesto[] = [
  {
    id: '1',
    paciente_id: 'p1',
    empresa_id: 'e1',
    programa_id: 'pr1',
    puesto: 'Operador de maquinaria',
    area: 'Producción',
    nivel_exposicion_db: 92,
    tiempo_exposicion_horas: 8,
    epp_entregado: true,
    fecha_entrega_epp: '2026-01-15',
    tipo_epp: 'Protector auditivo de copa',
    audiometria_base_completada: true,
    fecha_audiometria_base: '2026-01-10',
    audiometria_anual_completada: true,
    fecha_audiometria_anual: '2026-02-05',
    semaforo_actual: 'rojo',
    paciente: {
      id: 'p1',
      nombre: 'Juan Carlos',
      apellido_paterno: 'Martínez',
      apellido_materno: 'López',
    },
    created_at: '2026-01-10T00:00:00Z',
    updated_at: '2026-02-05T00:00:00Z',
  },
  {
    id: '2',
    paciente_id: 'p2',
    empresa_id: 'e1',
    programa_id: 'pr1',
    puesto: 'Soldador',
    area: 'Manufactura',
    nivel_exposicion_db: 88,
    tiempo_exposicion_horas: 6,
    epp_entregado: true,
    fecha_entrega_epp: '2026-01-20',
    tipo_epp: 'Tapones auditivos',
    audiometria_base_completada: true,
    fecha_audiometria_base: '2026-01-15',
    audiometria_anual_completada: true,
    fecha_audiometria_anual: '2026-02-06',
    semaforo_actual: 'rojo',
    paciente: {
      id: 'p2',
      nombre: 'Roberto',
      apellido_paterno: 'Hernández',
      apellido_materno: 'Flores',
    },
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-02-06T00:00:00Z',
  },
  {
    id: '3',
    paciente_id: 'p3',
    empresa_id: 'e1',
    programa_id: 'pr1',
    puesto: 'Operario de prensa',
    area: 'Producción',
    nivel_exposicion_db: 85,
    tiempo_exposicion_horas: 8,
    epp_entregado: false,
    audiometria_base_completada: true,
    fecha_audiometria_base: '2026-01-12',
    audiometria_anual_completada: true,
    fecha_audiometria_anual: '2026-02-04',
    semaforo_actual: 'amarillo',
    paciente: {
      id: 'p3',
      nombre: 'María Elena',
      apellido_paterno: 'García',
      apellido_materno: 'Santos',
    },
    created_at: '2026-01-12T00:00:00Z',
    updated_at: '2026-02-04T00:00:00Z',
  },
];

const COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

export function ProgramaAnualNOM011() {
  const [resumen] = useState<ResumenProgramaNOM011>(resumenEjemplo);
  const [trabajadoresRiesgo] = useState<TrabajadorExpuesto[]>(trabajadoresRiesgoEjemplo);

  const datosSemaforo = [
    { name: 'Normal', value: resumen.semaforos.verde, color: '#22c55e' },
    { name: 'Observación', value: resumen.semaforos.amarillo, color: '#f59e0b' },
    { name: 'Daño', value: resumen.semaforos.rojo, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Ear className="w-8 h-8 text-emerald-600" />
            Programa Anual NOM-011
          </h1>
          <p className="text-slate-500">
            Conservación de la Audición - Año {resumen.anio}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full">
            <FileText className="w-4 h-4 mr-2" />
            Reporte
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full">
            <Calendar className="w-4 h-4 mr-2" />
            Nueva Audiometría
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border shadow-md">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Trabajadores Expuestos</p>
                <p className="text-2xl font-bold text-slate-900">{resumen.trabajadores_expuestos}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-md">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Estudios Completados</p>
                <p className="text-2xl font-bold text-slate-900">{resumen.trabajadores_estudiados}</p>
                <p className="text-xs text-emerald-600">
                  {resumen.porcentaje_avance}% del programa
                </p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <Progress value={resumen.porcentaje_avance} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card className="border shadow-md">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">EPP Entregado</p>
                <p className="text-2xl font-bold text-slate-900">{resumen.epp.entregado}</p>
                <p className="text-xs text-slate-500">
                  {Math.round((resumen.epp.entregado / resumen.trabajadores_expuestos) * 100)}% cobertura
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <HardHat className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-md">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Capacitaciones</p>
                <p className="text-2xl font-bold text-slate-900">{resumen.capacitaciones.realizadas}</p>
                <p className="text-xs text-slate-500">
                  de {resumen.capacitaciones.programadas} programadas
                </p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <Progress 
              value={(resumen.capacitaciones.realizadas / resumen.capacitaciones.programadas) * 100} 
              className="mt-2 h-1.5" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estudios por mes */}
        <Card className="border shadow-md">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Estudios por Mes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resumen.estudios_por_mes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [`${value} estudios`, 'Cantidad']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="cantidad" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribución de semáforos */}
        <Card className="border shadow-md">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-emerald-600" />
              Distribución de Resultados
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[250px] flex items-center">
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie
                    data={datosSemaforo}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {datosSemaforo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {datosSemaforo.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-slate-600 flex-1">{item.name}</span>
                    <span className="font-bold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trabajadores en riesgo */}
      <Card className="border shadow-md border-rose-100">
        <CardHeader className="bg-rose-50/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-rose-800">
              <AlertTriangle className="w-5 h-5" />
              Trabajadores con Riesgo Auditivo
            </CardTitle>
            <Badge variant="destructive">{trabajadoresRiesgo.length} casos</Badge>
          </div>
          <CardDescription className="text-rose-600">
            Trabajadores con semáforo amarillo o rojo que requieren seguimiento
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {trabajadoresRiesgo.map((trabajador) => (
              <div 
                key={trabajador.id} 
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-rose-100 hover:border-rose-200 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <SemaforoNOM011Badge estado={trabajador.semaforo_actual || 'verde'} />
                  <div>
                    <p className="font-semibold text-slate-900">
                      {trabajador.paciente?.nombre} {trabajador.paciente?.apellido_paterno}
                    </p>
                    <p className="text-sm text-slate-500">
                      {trabajador.puesto} • {trabajador.area}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="text-slate-400">
                        Exposición: {trabajador.nivel_exposicion_db} dB
                      </span>
                      {!trabajador.epp_entregado && (
                        <Badge variant="outline" className="text-rose-600 border-rose-200">
                          Sin EPP
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="rounded-full">
                  Ver detalle
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
