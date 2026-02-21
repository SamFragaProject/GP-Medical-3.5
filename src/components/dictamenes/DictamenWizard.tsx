import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  FileCheck,
  AlertTriangle,
  FileSignature,
  ChevronRight,
  ChevronLeft,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Award,
  Stethoscope,
  Calendar,
  Clock
} from 'lucide-react';
import { SignaturePad } from '@/components/shared/SignaturePad';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { usePermisosDinamicos } from '@/hooks/usePermisosDinamicos';
import { useAuth } from '@/contexts/AuthContext';
import { DictamenForm } from './DictamenForm';
import { ValidadorEstudios } from './ValidadorEstudios';
import { dictamenService } from '@/services/dictamenService';
import { toast } from 'react-hot-toast';
import type {
  TipoEvaluacionDictamen as TipoEvaluacion,
  ResultadoDictamen,
  RESULTADO_LABELS,
  TIPO_EVALUACION_LABELS
} from '@/types/dictamen';

// ══════════════════════════════════════════════════════════════
// SCHEMA ZOD — incluye datos del médico responsable
// ══════════════════════════════════════════════════════════════

const dictamenWizardSchema = z.object({
  paciente_id: z.string().min(1, 'Seleccione un paciente'),
  tipo_evaluacion: z.enum(['preempleo', 'ingreso', 'periodico', 'retorno', 'egreso', 'reubicacion', 'reincorporacion']),
  resultado: z.enum(['apto', 'apto_restricciones', 'no_apto_temporal', 'no_apto', 'evaluacion_complementaria']),
  restricciones: z.array(z.string()),
  restricciones_detalle: z.string().optional(),
  recomendaciones_medicas: z.string().optional(),
  recomendaciones_epp: z.array(z.string()),
  fecha_vigencia_inicio: z.string(),
  fecha_vigencia_fin: z.string().optional(),
  // Datos del médico responsable
  medico_nombre: z.string().min(1, 'Nombre del médico requerido'),
  cedula_profesional: z.string().min(6, 'Cédula profesional requerida (mín. 6 caracteres)'),
  especialidad_medico: z.string().optional(),
  firma_digital: z.string().optional(),
}).refine((data) => {
  if (data.resultado !== 'apto' && data.restricciones.length === 0) {
    return false;
  }
  return true;
}, {
  message: 'Debe seleccionar al menos una restricción cuando el resultado no es "Apto"',
  path: ['restricciones'],
});

export type DictamenWizardValues = z.infer<typeof dictamenWizardSchema>;

interface DictamenWizardProps {
  pacienteId?: string;
  onComplete: () => void;
  onCancel: () => void;
}

type WizardStep = 1 | 2 | 3 | 4;

const RESULTADO_BADGE: Record<string, { label: string; variant: string; color: string }> = {
  apto: { label: 'APTO', variant: 'success', color: 'bg-emerald-500 text-white' },
  apto_restricciones: { label: 'APTO CON RESTRICCIONES', variant: 'warning', color: 'bg-amber-500 text-white' },
  no_apto_temporal: { label: 'NO APTO TEMPORAL', variant: 'destructive', color: 'bg-orange-500 text-white' },
  no_apto: { label: 'NO APTO', variant: 'destructive', color: 'bg-rose-600 text-white' },
  evaluacion_complementaria: { label: 'EVALUACIÓN COMPLEMENTARIA', variant: 'default', color: 'bg-blue-500 text-white' },
};

const TIPO_EVAL_LABEL: Record<string, string> = {
  preempleo: 'Pre-empleo / Ingreso',
  ingreso: 'Ingreso',
  periodico: 'Examen Periódico',
  retorno: 'Retorno a Trabajo',
  egreso: 'Egreso / Término',
  reubicacion: 'Reubicación Laboral',
  reincorporacion: 'Reincorporación',
};

export function DictamenWizard({ pacienteId, onComplete, onCancel }: DictamenWizardProps) {
  const { puede } = usePermisosDinamicos();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [estudiosValidos, setEstudiosValidos] = useState(false);
  const [estudiosFaltantes, setEstudiosFaltantes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPacienteId, setSelectedPacienteId] = useState<string>(pacienteId || '');
  const [tipoEvaluacion, setTipoEvaluacion] = useState<TipoEvaluacion>('preempleo');

  // Calcular vigencia por defecto (365 días para periódicos, 180 para pre-empleo)
  const defaultVigenciaDays = tipoEvaluacion === 'periodico' ? 365 : tipoEvaluacion === 'egreso' ? 0 : 180;
  const hoy = new Date().toISOString().split('T')[0];
  const vigenciaDefault = defaultVigenciaDays > 0
    ? new Date(Date.now() + defaultVigenciaDays * 86400000).toISOString().split('T')[0]
    : '';

  const methods = useForm<DictamenWizardValues>({
    resolver: zodResolver(dictamenWizardSchema),
    defaultValues: {
      paciente_id: pacienteId || '',
      tipo_evaluacion: 'preempleo',
      resultado: 'apto',
      restricciones: [],
      restricciones_detalle: '',
      recomendaciones_medicas: '',
      recomendaciones_epp: [],
      fecha_vigencia_inicio: hoy,
      fecha_vigencia_fin: vigenciaDefault,
      medico_nombre: user?.nombre ? `${user.nombre} ${user.apellido_paterno || ''}`.trim() : '',
      cedula_profesional: '',
      especialidad_medico: 'Medicina del Trabajo',
      firma_digital: '',
    },
  });

  const { watch, handleSubmit, setValue, formState: { errors } } = methods;
  const resultado = watch('resultado');
  const restricciones = watch('restricciones');
  const medicoNombre = watch('medico_nombre');
  const cedulaPro = watch('cedula_profesional');

  useEffect(() => {
    if (pacienteId) {
      setSelectedPacienteId(pacienteId);
      setValue('paciente_id', pacienteId);
    }
  }, [pacienteId, setValue]);

  // Actualizar vigencia cuando cambia el tipo de evaluación
  useEffect(() => {
    const days = tipoEvaluacion === 'periodico' ? 365 : tipoEvaluacion === 'egreso' ? 0 : 180;
    if (days > 0) {
      setValue('fecha_vigencia_fin', new Date(Date.now() + days * 86400000).toISOString().split('T')[0]);
    } else {
      setValue('fecha_vigencia_fin', '');
    }
  }, [tipoEvaluacion, setValue]);

  const handleValidacionChange = (valido: boolean, faltantes: string[]) => {
    setEstudiosValidos(valido);
    setEstudiosFaltantes(faltantes);
  };

  const canAdvance = () => {
    switch (currentStep) {
      case 1:
        return selectedPacienteId && tipoEvaluacion;
      case 2:
        return estudiosValidos;
      case 3:
        return resultado && (resultado === 'apto' || restricciones.length > 0);
      case 4:
        return medicoNombre && cedulaPro && cedulaPro.length >= 6;
      default:
        return false;
    }
  };

  const onSubmit = async (values: DictamenWizardValues) => {
    if (!puede('dictamenes', 'crear')) {
      toast.error('No tiene permisos para crear dictámenes');
      return;
    }

    setIsSubmitting(true);
    try {
      await dictamenService.crear({
        empresa_id: user?.empresa_id || '',
        paciente_id: values.paciente_id,
        tipo_evaluacion: values.tipo_evaluacion,
        resultado: values.resultado,
        resultado_detalle: values.restricciones_detalle,
        restricciones: values.restricciones.map(code => ({
          codigo: code,
          descripcion: code,
          tipo: 'fisica' as const,
        })),
        restricciones_otras: values.restricciones_detalle,
        recomendaciones_medicas: values.recomendaciones_medicas
          ? values.recomendaciones_medicas.split('\n').filter(Boolean)
          : [],
        recomendaciones_epp: values.recomendaciones_epp,
        recomendaciones_adicionales: '',
        vigencia_inicio: values.fecha_vigencia_inicio,
        vigencia_fin: values.fecha_vigencia_fin || undefined,
        medico_nombre: values.medico_nombre,
        cedula_profesional: values.cedula_profesional,
        especialidad_medico: values.especialidad_medico || undefined,
        medico_responsable_id: user?.id || undefined,
      }, {
        id: user?.id || '',
        email: user?.email || '',
        nombre: user?.nombre,
        apellido_paterno: user?.apellido_paterno,
        rol: user?.rol as any,
        empresa_id: user?.empresa_id,
      } as any);

      toast.success('Dictamen creado y registrado exitosamente');
      onComplete();
    } catch (error: any) {
      console.error('Error creando dictamen:', error);
      toast.error(error?.message || 'Error al crear el dictamen');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Paciente', icon: User },
    { number: 2, title: 'Estudios', icon: FileCheck },
    { number: 3, title: 'Resultado', icon: AlertTriangle },
    { number: 4, title: 'Firma & Médico', icon: FileSignature },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <Card className="border shadow-md rounded-2xl">
              <CardHeader className="bg-slate-50/50 rounded-t-2xl">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-600" />
                  Selección de Paciente y Tipo de Evaluación
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Paciente <span className="text-red-500">*</span>
                    </Label>
                    <div className="p-3 border rounded-xl bg-slate-50">
                      <p className="text-sm text-slate-500">
                        {selectedPacienteId ? '✅ Paciente seleccionado' : 'Buscar paciente...'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Tipo de Evaluación <span className="text-red-500">*</span>
                    </Label>
                    <select
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm font-medium"
                      value={tipoEvaluacion}
                      onChange={(e) => {
                        setTipoEvaluacion(e.target.value as TipoEvaluacion);
                        setValue('tipo_evaluacion', e.target.value as TipoEvaluacion);
                      }}
                    >
                      <option value="preempleo">Pre-empleo / Ingreso</option>
                      <option value="periodico">Examen Periódico</option>
                      <option value="retorno">Retorno a Trabajo</option>
                      <option value="egreso">Egreso / Término</option>
                      <option value="reubicacion">Reubicación Laboral</option>
                      <option value="reincorporacion">Reincorporación</option>
                    </select>
                  </div>
                </div>

                {/* Info de vigencia automática */}
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <p className="text-xs text-blue-700 font-medium">
                    Vigencia automática: <strong>{defaultVigenciaDays > 0 ? `${defaultVigenciaDays} días` : 'Sin vigencia (egreso)'}</strong> — puede modificarse en el paso 3
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {selectedPacienteId && (
              <ValidadorEstudios
                pacienteId={selectedPacienteId}
                tipoEvaluacion={tipoEvaluacion}
                onValidacionChange={handleValidacionChange}
              />
            )}
            {!estudiosValidos && estudiosFaltantes.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    Estudios pendientes
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Complete los estudios faltantes antes de continuar con el dictamen.
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <FormProvider {...methods}>
            <DictamenForm />
          </FormProvider>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Resumen del dictamen */}
            <Card className="border shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-emerald-50/30 rounded-t-2xl">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-emerald-600" />
                  Resumen del Dictamen
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tipo</p>
                    <p className="text-sm font-bold text-slate-900">{TIPO_EVAL_LABEL[tipoEvaluacion]}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Resultado</p>
                    <Badge className={`${RESULTADO_BADGE[resultado]?.color || 'bg-slate-500 text-white'} text-[10px] font-black uppercase tracking-wider`}>
                      {RESULTADO_BADGE[resultado]?.label || resultado}
                    </Badge>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Restricciones</p>
                    <p className="text-sm font-bold text-slate-900">{restricciones.length} seleccionadas</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vigencia</p>
                    <p className="text-sm font-bold text-slate-900">{watch('fecha_vigencia_fin') || 'Sin vencimiento'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Datos del médico */}
            <Card className="border-2 border-blue-200 shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50/30">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  Médico Responsable — Datos Legales
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  Estos datos se estamparán en el documento PDF oficial del dictamen
                </p>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      Nombre Completo del Médico <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      {...methods.register('medico_nombre')}
                      placeholder="Dr. / Dra. Nombre completo"
                      className="rounded-xl h-11"
                    />
                    {errors.medico_nombre && (
                      <p className="text-xs text-rose-500 font-medium">{errors.medico_nombre.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      Cédula Profesional <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      {...methods.register('cedula_profesional')}
                      placeholder="Número de cédula profesional"
                      className="rounded-xl h-11"
                    />
                    {errors.cedula_profesional && (
                      <p className="text-xs text-rose-500 font-medium">{errors.cedula_profesional.message}</p>
                    )}
                    <p className="text-[10px] text-slate-400 font-medium">
                      La cédula será verificada y aparecerá en el documento oficial
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">
                    Especialidad Médica
                  </Label>
                  <select
                    className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm font-medium"
                    {...methods.register('especialidad_medico')}
                  >
                    <option value="Medicina del Trabajo">Medicina del Trabajo</option>
                    <option value="Medicina General">Medicina General</option>
                    <option value="Salud Ocupacional">Salud Ocupacional</option>
                    <option value="Medicina Familiar">Medicina Familiar</option>
                    <option value="Medicina Interna">Medicina Interna</option>
                    <option value="Otorrinolaringología">Otorrinolaringología</option>
                    <option value="Oftalmología">Oftalmología</option>
                    <option value="Neumología">Neumología</option>
                    <option value="Cardiología">Cardiología</option>
                    <option value="Traumatología">Traumatología y Ortopedia</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Firma digital */}
            <Card className="border shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileSignature className="w-5 h-5 text-emerald-600" />
                  Firma Electrónica del Médico
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500 font-medium">
                    Dibuje su firma en el recuadro inferior
                  </p>
                  <button
                    type="button"
                    onClick={() => setValue('firma_digital', '')}
                    className="text-[10px] font-black uppercase text-rose-400 hover:text-rose-300 transition-colors px-3 py-1 rounded-lg hover:bg-rose-50"
                  >
                    Limpiar Firma
                  </button>
                </div>

                <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden p-4 hover:border-emerald-300 transition-colors">
                  <SignaturePad
                    onSave={(signatureUrl) => setValue('firma_digital', signatureUrl)}
                    onClear={() => setValue('firma_digital', '')}
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs text-emerald-700 font-bold">
                      Firma con validez legal
                    </p>
                    <p className="text-[10px] text-emerald-600 mt-0.5">
                      Esta firma será estampada digitalmente en el dictamen PDF junto con su cédula profesional ({cedulaPro || '---'}) y nombre ({medicoNombre || '---'}).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;

          return (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                    : isCompleted
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-slate-100 text-slate-400'
                    }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`mt-2 text-sm font-medium ${isActive ? 'text-emerald-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <Separator />

      {/* Step Content */}
      <div className="min-h-[400px]">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => currentStep === 1 ? onCancel() : setCurrentStep((prev) => (prev - 1) as WizardStep)}
          className="rounded-full"
        >
          {currentStep === 1 ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </>
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </>
          )}
        </Button>

        {currentStep < 4 ? (
          <Button
            type="button"
            onClick={() => setCurrentStep((prev) => (prev + 1) as WizardStep)}
            disabled={!canAdvance()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full"
          >
            Siguiente
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || !canAdvance()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Guardando...' : 'Firmar y Finalizar Dictamen'}
          </Button>
        )}
      </div>
    </div>
  );
}
