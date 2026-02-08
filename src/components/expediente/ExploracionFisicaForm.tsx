import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Stethoscope, Save, Activity, Heart, Thermometer, Ruler, Weight, Eye, Brain, Move, Clipboard, Wind, Droplets, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'react-hot-toast';
import { exploracionFisicaService } from '@/services/expedienteService';
import type { ExploracionFisica } from '@/types/expediente';
import { useQueryClient, useMutation } from '@tanstack/react-query';

const exploracionSchema = z.object({
    fecha_exploracion: z.string().default(() => new Date().toISOString().split('T')[0]),
    // Signos Vitales
    fc: z.union([z.number(), z.string().transform(v => v === "" ? undefined : Number(v))]).optional(),
    fr: z.union([z.number(), z.string().transform(v => v === "" ? undefined : Number(v))]).optional(),
    ta_sistolica: z.union([z.number(), z.string().transform(v => v === "" ? undefined : Number(v))]).optional(),
    ta_diastolica: z.union([z.number(), z.string().transform(v => v === "" ? undefined : Number(v))]).optional(),
    temperatura: z.union([z.number(), z.string().transform(v => v === "" ? undefined : Number(v))]).optional(),
    spo2: z.union([z.number(), z.string().transform(v => v === "" ? undefined : Number(v))]).optional(),
    glucosa: z.union([z.number(), z.string().transform(v => v === "" ? undefined : Number(v))]).optional(),
    // Antropometría
    peso_kg: z.union([z.number(), z.string().transform(v => v === "" ? undefined : Number(v))]).optional(),
    talla_cm: z.union([z.number(), z.string().transform(v => v === "" ? undefined : Number(v))]).optional(),
    imc: z.number().optional(),
    cintura_cm: z.union([z.number(), z.string().transform(v => v === "" ? undefined : Number(v))]).optional(),
    cadera_cm: z.union([z.number(), z.string().transform(v => v === "" ? undefined : Number(v))]).optional(),
    // Exploración
    aspecto_general: z.string().optional(),
    estado_general: z.string().optional(),
    piel: z.string().optional(),
    cabeza: z.string().optional(),
    ojos: z.string().optional(),
    oidos: z.string().optional(),
    nariz: z.string().optional(),
    boca: z.string().optional(),
    cuello: z.string().optional(),
    torax: z.string().optional(),
    pulmones: z.string().optional(),
    corazon: z.string().optional(),
    abdomen: z.string().optional(),
    extremidades_superiores: z.string().optional(),
    extremidades_inferiores: z.string().optional(),
    neurologico: z.string().optional(),
    reflejos: z.string().optional(),
    coordinacion: z.string().optional(),
    marcha: z.string().optional(),
    hallazgos_relevantes: z.string().optional(),
});

type ExploracionFisicaFormValues = z.infer<typeof exploracionSchema>;

interface ExploracionFisicaFormProps {
    expedienteId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
    initialData?: Partial<ExploracionFisica>;
}

export function ExploracionFisicaForm({ expedienteId, onSuccess, onCancel, initialData }: ExploracionFisicaFormProps) {
    const queryClient = useQueryClient();

    const { register, handleSubmit, watch, setValue, control, formState: { errors, isSubmitting } } = useForm<ExploracionFisicaFormValues>({
        resolver: zodResolver(exploracionSchema),
        defaultValues: initialData || {
            fecha_exploracion: new Date().toISOString().split('T')[0],
        }
    });

    const peso = watch('peso_kg');
    const talla = watch('talla_cm');

    // Cálculo automático de IMC
    useEffect(() => {
        if (peso && talla) {
            const imc = parseFloat((Number(peso) / ((Number(talla) / 100) ** 2)).toFixed(2));
            setValue('imc', imc);
        }
    }, [peso, talla, setValue]);

    const mutation = useMutation({
        mutationFn: (values: any) => exploracionFisicaService.create({ ...values, expediente_id: expedienteId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exploracion-fisica', expedienteId] });
            toast.success('Exploración física guardada');
            if (onSuccess) onSuccess();
        }
    });

    const onSubmit = (values: ExploracionFisicaFormValues) => {
        mutation.mutate(values);
    };

    const SectionTitle = ({ icon: Icon, title, color }: any) => (
        <div className="flex items-center gap-2 mb-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800">{title}</h4>
        </div>
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-500">
            {/* Signos Vitales y Antropometría */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border shadow-md">
                    <CardHeader className="bg-slate-50/50 py-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-600" />
                            Signos Vitales
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase text-slate-400">F. Cardiaca (LPM)</Label>
                            <Input type="number" {...register('fc')} placeholder="72" className="h-9" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase text-slate-400">F. Resp (RPM)</Label>
                            <Input type="number" {...register('fr')} placeholder="18" className="h-9" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase text-slate-400">Temp (°C)</Label>
                            <Input type="number" step="0.1" {...register('temperatura')} placeholder="36.5" className="h-9" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase text-slate-400">Presión Sistólica</Label>
                            <Input type="number" {...register('ta_sistolica')} placeholder="120" className="h-9" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase text-slate-400">Presión Diastólica</Label>
                            <Input type="number" {...register('ta_diastolica')} placeholder="80" className="h-9" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase text-slate-400">SpO2 (%)</Label>
                            <Input type="number" {...register('spo2')} placeholder="98" className="h-9" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border shadow-md">
                    <CardHeader className="bg-slate-50/50 py-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Ruler className="w-4 h-4 text-blue-600" />
                            Antropometría
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase text-slate-400">Peso (kg)</Label>
                            <Input type="number" step="0.1" {...register('peso_kg')} placeholder="70.5" className="h-9" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase text-slate-400">Talla (cm)</Label>
                            <Input type="number" {...register('talla_cm')} placeholder="175" className="h-9" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase text-slate-400">IMC</Label>
                            <div className="h-9 flex items-center px-3 bg-slate-100 rounded-md font-bold text-blue-700 border">
                                {watch('imc') || '--'}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase text-slate-400">Cintura (cm)</Label>
                            <Input type="number" {...register('cintura_cm')} className="h-9" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase text-slate-400">Cadera (cm)</Label>
                            <Input type="number" {...register('cadera_cm')} className="h-9" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Exploración Física Sistematizada */}
            <Card className="border shadow-md">
                <CardHeader className="bg-slate-50 border-b">
                    <CardTitle className="flex items-center gap-2 text-md">
                        <Stethoscope className="w-5 h-5 text-emerald-600" />
                        Exploración por Sistemas
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    {/* Cabeza y Cuello */}
                    <div>
                        <SectionTitle icon={Eye} title="Cabeza y Órganos de los Sentidos" color="bg-blue-100 text-blue-600" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs">Ojos / Visión</Label>
                                <Textarea {...register('ojos')} className="h-20 resize-none" placeholder="Isocoria, reflejos..." />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Oídos / Audición</Label>
                                <Textarea {...register('oidos')} className="h-20 resize-none" placeholder="Conductos integrados..." />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Boca / Garganta</Label>
                                <Textarea {...register('boca')} className="h-20 resize-none" placeholder="Dentición, orofaringe..." />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Tórax y Abdomen */}
                    <div>
                        <SectionTitle icon={Wind} title="Cardio-Respiratorio y Abdomen" color="bg-red-100 text-red-600" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs">Tórax / Corazón</Label>
                                <Textarea {...register('torax')} className="h-20 resize-none" placeholder="Ruidos cardiacos rítmicos..." />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Campos Pulmonares</Label>
                                <Textarea {...register('pulmones')} className="h-20 resize-none" placeholder="Murmullo vesicular..." />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Abdomen</Label>
                                <Textarea {...register('abdomen')} className="h-20 resize-none" placeholder="Blando, depresible..." />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Neurológico y Musculoesquelético */}
                    <div>
                        <SectionTitle icon={Brain} title="Neurológico y Musculoesquelético" color="bg-purple-100 text-purple-600" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs">Sistema Osteomuscular (Extremidades)</Label>
                                <Textarea {...register('extremidades_superiores')} className="h-24 resize-none" placeholder="Arcos de movilidad, fuerza..." />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Neurológico / Reflejos / Marcha</Label>
                                <Textarea {...register('neurologico')} className="h-24 resize-none" placeholder="Consciente, orientado, reflejos..." />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Hallazgos y Resultados */}
                    <div className="bg-amber-50/30 p-6 rounded-xl border border-amber-100">
                        <SectionTitle icon={Clipboard} title="Hallazgos Relevantes y Conclusiones" color="bg-amber-100 text-amber-600" />
                        <Textarea {...register('hallazgos_relevantes')} className="min-h-[100px] border-amber-200" placeholder="Resumen de anomalías encontradas..." />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-3 pb-8">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 min-w-[150px]" disabled={mutation.isPending}>
                    {mutation.isPending ? 'Guardando...' : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Guardar Exploración
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
