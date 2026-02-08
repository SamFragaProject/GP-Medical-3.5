import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { 
  Stethoscope, 
  AlertTriangle, 
  Shield, 
  Calendar,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { SelectorRestricciones } from './SelectorRestricciones';
import type { DictamenWizardValues } from './DictamenWizard';
import type { ResultadoDictamen } from '@/types/dictamen';

const resultadosDictamen: { value: ResultadoDictamen; label: string; color: string; descripcion: string }[] = [
  { 
    value: 'apto', 
    label: 'Apto', 
    color: 'bg-emerald-500',
    descripcion: 'Sin restricciones para el puesto'
  },
  { 
    value: 'apto_restricciones', 
    label: 'Apto con Restricciones', 
    color: 'bg-amber-500',
    descripcion: 'Puede laborar con limitaciones específicas'
  },
  { 
    value: 'no_apto_temporal', 
    label: 'No Apto Temporal', 
    color: 'bg-orange-500',
    descripcion: 'No puede laborar temporalmente'
  },
  { 
    value: 'no_apto', 
    label: 'No Apto', 
    color: 'bg-rose-500',
    descripcion: 'No puede laborar en el puesto evaluado'
  },
  { 
    value: 'evaluacion_complementaria', 
    label: 'Evaluación Complementaria', 
    color: 'bg-blue-500',
    descripcion: 'Se requieren estudios adicionales'
  },
];

const recomendacionesEPP = [
  { id: 'lentes_seguridad', label: 'Lentes de seguridad' },
  { id: 'casco', label: 'Casco de seguridad' },
  { id: 'guantes', label: 'Guantes de protección' },
  { id: 'zapatos_seguridad', label: 'Zapatos de seguridad' },
  { id: 'tapones_auditivos', label: 'Tapones auditivos' },
  { id: 'protector_auditivo', label: 'Protector auditivo de copa' },
  { id: 'mascarilla', label: 'Mascarilla / Respirador' },
  { id: 'overol', label: 'Overol / Bata' },
  { id: 'arnes', label: 'Arnés de seguridad' },
  { id: 'careta_soldar', label: 'Careta para soldar' },
];

export function DictamenForm() {
  const { register, watch, setValue, control, formState: { errors } } = useFormContext<DictamenWizardValues>();
  
  const resultado = watch('resultado');
  const restricciones = watch('restricciones') || [];
  const recomendaciones_epp = watch('recomendaciones_epp') || [];

  const handleResultadoChange = (value: ResultadoDictamen) => {
    setValue('resultado', value);
    if (value === 'apto') {
      setValue('restricciones', []);
    }
  };

  const toggleEPP = (eppId: string) => {
    const current = recomendaciones_epp;
    if (current.includes(eppId)) {
      setValue('recomendaciones_epp', current.filter(id => id !== eppId));
    } else {
      setValue('recomendaciones_epp', [...current, eppId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Resultado Principal */}
      <Card className="border shadow-md">
        <CardHeader className="bg-slate-50/50">
          <CardTitle className="text-lg flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-emerald-600" />
            Resultado de la Evaluación
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resultadosDictamen.map((res) => (
              <button
                key={res.value}
                type="button"
                onClick={() => handleResultadoChange(res.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  resultado === res.value
                    ? 'border-emerald-500 bg-emerald-50 shadow-md'
                    : 'border-slate-200 hover:border-emerald-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-4 h-4 rounded-full ${res.color}`} />
                  <span className="font-semibold text-slate-900">{res.label}</span>
                </div>
                <p className="text-xs text-slate-500">{res.descripcion}</p>
              </button>
            ))}
          </div>
          {errors.resultado && (
            <p className="text-sm text-red-500 mt-2">{errors.resultado.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Restricciones */}
      {resultado !== 'apto' && (
        <Card className="border shadow-md border-amber-200">
          <CardHeader className="bg-amber-50/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Restricciones
              {restricciones.length === 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">Requerido</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <SelectorRestricciones
              selected={restricciones}
              onChange={(value) => setValue('restricciones', value)}
            />
            {errors.restricciones && (
              <p className="text-sm text-red-500">{errors.restricciones.message}</p>
            )}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Detalle de Restricciones
              </Label>
              <Textarea
                {...register('restricciones_detalle')}
                placeholder="Especifique las restricciones detalladas..."
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recomendaciones Médicas */}
      <Card className="border shadow-md">
        <CardHeader className="bg-slate-50/50">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Recomendaciones Médicas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Textarea
            {...register('recomendaciones_medicas')}
            placeholder="Ingrese las recomendaciones médicas para el paciente..."
            className="min-h-[120px]"
          />
        </CardContent>
      </Card>

      {/* EPP Recomendado */}
      <Card className="border shadow-md">
        <CardHeader className="bg-slate-50/50">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            Equipo de Protección Personal (EPP)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {recomendacionesEPP.map((epp) => (
              <button
                key={epp.id}
                type="button"
                onClick={() => toggleEPP(epp.id)}
                className={`p-3 rounded-lg border text-left text-sm transition-all duration-200 ${
                  recomendaciones_epp.includes(epp.id)
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 hover:border-emerald-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    recomendaciones_epp.includes(epp.id)
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-slate-300'
                  }`}>
                    {recomendaciones_epp.includes(epp.id) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="font-medium">{epp.label}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vigencia */}
      <Card className="border shadow-md">
        <CardHeader className="bg-slate-50/50">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Vigencia del Dictamen
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Fecha de Inicio <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                {...register('fecha_vigencia_inicio')}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Fecha de Vencimiento
              </Label>
              <Input
                type="date"
                {...register('fecha_vigencia_fin')}
              />
              <p className="text-xs text-slate-500">
                Dejar en blanco para dictámenes sin fecha de vencimiento
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
