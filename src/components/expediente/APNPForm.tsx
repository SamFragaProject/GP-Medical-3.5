import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Heart, Save, Check, Activity, Coffee, Utensils, Moon, Pill, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'react-hot-toast';
import { apnpService } from '@/services/expedienteService';
import type { APNP } from '@/types/expediente';

const apnpSchema = z.object({
    tabaco: z.boolean().default(false),
    tabaco_cantidad: z.string().optional(),
    tabaco_tiempo: z.string().optional(),
    tabaco_frecuencia: z.string().optional(),
    alcohol: z.boolean().default(false),
    alcohol_frecuencia: z.string().optional(),
    alcohol_cantidad: z.string().optional(),
    drogas: z.boolean().default(false),
    drogas_tipo: z.string().optional(),
    drogas_frecuencia: z.string().optional(),
    medicamentos_habitual: z.string().optional(),
    ejercicio_frecuencia: z.string().optional(),
    ejercicio_tipo: z.string().optional(),
    sueno_horas: z.union([z.number(), z.string().transform(v => v === "" ? undefined : Number(v))]).optional(),
    sueno_calidad: z.string().optional(),
    alimentacion_tipo: z.string().optional(),
    cafe: z.boolean().default(false),
    cafe_tazas_diarias: z.union([z.number(), z.string().transform(v => v === "" ? undefined : Number(v))]).optional(),
});

type APNPFormValues = z.infer<typeof apnpSchema>;

interface APNPFormProps {
    expedienteId: string;
    data: APNP | null;
}

export function APNPForm({ expedienteId, data }: APNPFormProps) {
    const { register, handleSubmit, control, watch, formState: { isSubmitting, isDirty } } = useForm<APNPFormValues>({
        resolver: zodResolver(apnpSchema),
        defaultValues: data || {
            tabaco: false,
            alcohol: false,
            drogas: false,
            cafe: false,
        },
    });

    const tabacoChecked = watch('tabaco');
    const alcoholChecked = watch('alcohol');
    const drogasChecked = watch('drogas');
    const cafeChecked = watch('cafe');

    const onSubmit = async (values: APNPFormValues) => {
        try {
            await apnpService.createOrUpdate(expedienteId, values);
            toast.success('Antecedentes actualizados correctamente');
        } catch (error) {
            toast.error('Error al guardar los antecedentes');
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Heart className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">Antecedentes Personales No Patológicos</h3>
                        <p className="text-xs text-slate-500">Hábitos, estilo de vida y toxicomanías</p>
                    </div>
                </div>
                <Button
                    type="submit"
                    disabled={isSubmitting || !isDirty}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                    {isSubmitting ? 'Guardando...' : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Guardar Cambios
                        </>
                    )}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Toxicomanías */}
                <Card className="border shadow-md">
                    <CardHeader className="bg-slate-50/50">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Pill className="w-5 h-5 text-red-500" />
                            Toxicomanías
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {/* Tabaco */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Controller
                                    name="tabaco"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            id="tabaco"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                <Label htmlFor="tabaco" className="font-semibold text-slate-700">Tabaquismo</Label>
                            </div>

                            {tabacoChecked && (
                                <div className="grid grid-cols-2 gap-4 ml-6 animate-in slide-in-from-top-2 duration-200">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Cigarros al día</Label>
                                        <Input {...register('tabaco_cantidad')} placeholder="Ej: 5" size={1} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Años fumando</Label>
                                        <Input {...register('tabaco_tiempo')} placeholder="Ej: 10" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Alcohol */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Controller
                                    name="alcohol"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            id="alcohol"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                <Label htmlFor="alcohol" className="font-semibold text-slate-700">Alcoholismo</Label>
                            </div>

                            {alcoholChecked && (
                                <div className="grid grid-cols-2 gap-4 ml-6 animate-in slide-in-from-top-2 duration-200">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Frecuencia</Label>
                                        <Input {...register('alcohol_frecuencia')} placeholder="Ej: Semanal" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Cantidad</Label>
                                        <Input {...register('alcohol_cantidad')} placeholder="Ej: Moderada" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Drogas */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Controller
                                    name="drogas"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            id="drogas"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                <Label htmlFor="drogas" className="font-semibold text-slate-700">Otras sustancias</Label>
                            </div>

                            {drogasChecked && (
                                <div className="grid grid-cols-2 gap-4 ml-6 animate-in slide-in-from-top-2 duration-200">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Tipo</Label>
                                        <Input {...register('drogas_tipo')} placeholder="Especificar" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Frecuencia</Label>
                                        <Input {...register('drogas_frecuencia')} placeholder="Frecuencia" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Estilo de Vida */}
                <Card className="border shadow-md">
                    <CardHeader className="bg-slate-50/50">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-500" />
                            Estilo de Vida
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Utensils className="w-3 h-3" />
                                    Alimentación
                                </Label>
                                <Input {...register('alimentacion_tipo')} placeholder="Ej: Balanceada" />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Moon className="w-3 h-3" />
                                    Calidad de Sueño
                                </Label>
                                <Input {...register('sueno_calidad')} placeholder="Ej: Buena" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Horas de Sueño</Label>
                                <Input type="number" {...register('sueno_horas')} placeholder="7" />
                            </div>
                            <div className="space-y-2">
                                <Label>Ejercicio (Frecuencia)</Label>
                                <Input {...register('ejercicio_frecuencia')} placeholder="Ej: 3 veces/semana" />
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Controller
                                    name="cafe"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            id="cafe"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                <Label htmlFor="cafe" className="font-semibold text-slate-700 flex items-center gap-2">
                                    <Coffee className="w-4 h-4 text-amber-700" />
                                    Consumo de Café
                                </Label>
                            </div>

                            {cafeChecked && (
                                <div className="ml-6 animate-in slide-in-from-top-2 duration-200 w-1/2">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Tazas diarias</Label>
                                        <Input type="number" {...register('cafe_tazas_diarias')} placeholder="Ej: 2" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-emerald-600" />
                                Medicamentos Habituales
                            </Label>
                            <Input {...register('medicamentos_habitual')} placeholder="Lista de medicamentos que consume regularmente" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </form>
    );
}
