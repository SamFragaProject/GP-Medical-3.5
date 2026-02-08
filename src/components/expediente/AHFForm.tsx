import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Users, Save, Check, ShieldAlert, Heart, Activity, AlertTriangle, Thermometer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'react-hot-toast';
import { ahfService } from '@/services/expedienteService';
import type { AHF } from '@/types/expediente';

const ahfSchema = z.object({
    diabetes: z.boolean().default(false),
    diabetes_quien: z.string().optional(),
    hipertension: z.boolean().default(false),
    hipertension_quien: z.string().optional(),
    cancer: z.boolean().default(false),
    cancer_tipo: z.string().optional(),
    cancer_quien: z.string().optional(),
    cardiopatias: z.boolean().default(false),
    cardiopatias_quien: z.string().optional(),
    enfermedades_mentales: z.boolean().default(false),
    enfermedades_mentales_quien: z.string().optional(),
    enfermedades_respiratorias: z.boolean().default(false),
    enfermedades_respiratorias_quien: z.string().optional(),
    otros: z.string().optional(),
});

type AHFFormValues = z.infer<typeof ahfSchema>;

interface AHFFormProps {
    expedienteId: string;
    data: AHF | null;
}

export function AHFForm({ expedienteId, data }: AHFFormProps) {
    const { register, handleSubmit, control, watch, formState: { isSubmitting, isDirty } } = useForm<AHFFormValues>({
        resolver: zodResolver(ahfSchema),
        defaultValues: data || {
            diabetes: false,
            hipertension: false,
            cancer: false,
            cardiopatias: false,
            enfermedades_mentales: false,
            enfermedades_respiratorias: false,
        },
    });

    const onSubmit = async (values: AHFFormValues) => {
        try {
            await ahfService.createOrUpdate(expedienteId, values);
            toast.success('Antecedentes heredofamiliares guardados');
        } catch (error) {
            toast.error('Error al guardar antecedentes');
            console.error(error);
        }
    };

    const watchAll = watch();

    const FamilyField = ({ name, label, icon: Icon, extraField }: any) => {
        const isChecked = watchAll[name as keyof AHFFormValues];

        return (
            <div className="space-y-4 p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isChecked ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <Label htmlFor={name} className="font-bold text-slate-700 cursor-pointer">{label}</Label>
                    </div>
                    <Controller
                        name={name}
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                id={name}
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                            />
                        )}
                    />
                </div>

                {isChecked && (
                    <div className="animate-in slide-in-from-top-2 duration-200 grid gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase font-bold text-slate-400">¿Quién? (Parentesco)</Label>
                            <Input
                                {...register(`${name}_quien` as any)}
                                placeholder="Ej: Padre, Abuela materna"
                                className="h-8 text-sm"
                            />
                        </div>
                        {extraField && (
                            <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase font-bold text-slate-400">Tipo/Detalle</Label>
                                <Input
                                    {...register(extraField)}
                                    placeholder="Detallar tipo o estado"
                                    className="h-8 text-sm"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">Antecedentes Heredofamiliares</h3>
                        <p className="text-xs text-slate-500">Historia médica familiar y genética</p>
                    </div>
                </div>
                <Button
                    type="submit"
                    disabled={isSubmitting || !isDirty}
                    className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20"
                >
                    {isSubmitting ? 'Guardando...' : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Guardar Cambios
                        </>
                    )}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FamilyField name="diabetes" label="Diabetes" icon={Activity} />
                <FamilyField name="hipertension" label="Hipertensión" icon={Heart} />
                <FamilyField name="cancer" label="Cáncer" icon={ShieldAlert} extraField="cancer_tipo" />
                <FamilyField name="cardiopatias" label="Cardiopatías" icon={Heart} />
                <FamilyField name="enfermedades_respiratorias" label="Resp. Crónicas" icon={Activity} />
                <FamilyField name="enfermedades_mentales" label="Mentales/Neurol." icon={Activity} />
            </div>

            <Card className="border shadow-md">
                <CardHeader className="bg-slate-50/50 py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Otros Antecedentes o Notas
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <Input
                        {...register('otros')}
                        placeholder="Otras enfermedades relevantes en la familia..."
                    />
                </CardContent>
            </Card>
        </form>
    );
}
