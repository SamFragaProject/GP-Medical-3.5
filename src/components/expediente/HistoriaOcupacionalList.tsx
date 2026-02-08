import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Briefcase, Plus, Trash2, Edit2, Calendar, MapPin, AlertCircle, Save, X, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { historiaOcupacionalService } from '@/services/expedienteService';
import type { HistoriaOcupacional } from '@/types/expediente';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useForm, Controller } from 'react-hook-form';

interface HistoriaOcupacionalListProps {
    expedienteId: string;
    data: HistoriaOcupacional[];
}

export function HistoriaOcupacionalList({ expedienteId, data }: HistoriaOcupacionalListProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHistoria, setEditingHistoria] = useState<HistoriaOcupacional | null>(null);
    const queryClient = useQueryClient();

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<Partial<HistoriaOcupacional>>();

    const mutation = useMutation({
        mutationFn: (values: any) => {
            if (editingHistoria) {
                return historiaOcupacionalService.update(editingHistoria.id, values);
            }
            return historiaOcupacionalService.create({ ...values, expediente_id: expedienteId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['historia-ocupacional', expedienteId] });
            toast.success(editingHistoria ? 'Registro actualizado' : 'Antecedente laboral añadido');
            handleCloseModal();
        },
        onError: () => {
            toast.error('Error al procesar la solicitud');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: historiaOcupacionalService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['historia-ocupacional', expedienteId] });
            toast.success('Registro eliminado');
        }
    });

    const handleOpenAdd = () => {
        setEditingHistoria(null);
        reset({
            empresa_anterior: '',
            puesto: '',
            antiguedad: '',
            riesgos_fisicos: '',
            riesgos_quimicos: '',
            riesgos_biologicos: '',
            riesgos_ergonomicos: '',
            riesgos_psicosociales: '',
            riesgos_electricos: false,
            riesgos_mecanicos: false,
            epp_adecuado: true
        });
        setIsModalOpen(true);
    };

    const handleEdit = (historia: HistoriaOcupacional) => {
        setEditingHistoria(historia);
        reset(historia);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingHistoria(null);
    };

    const onSubmit = (values: any) => {
        mutation.mutate(values);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">Historia Ocupacional</h3>
                        <p className="text-xs text-slate-500">Cronología laboral y riesgos previstos</p>
                    </div>
                </div>
                <Button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Antecedente
                </Button>
            </div>

            <div className="grid gap-4">
                {data.length === 0 ? (
                    <Card className="p-12 text-center border-dashed border-2">
                        <Briefcase className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 font-medium">No hay antecedentes laborales registrados</p>
                        <Button variant="outline" onClick={handleOpenAdd} className="mt-4">
                            Añadir el primero
                        </Button>
                    </Card>
                ) : (
                    data.map((historia) => (
                        <Card key={historia.id} className="group hover:shadow-lg transition-all border-l-4 border-l-blue-500">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-lg text-slate-900">{historia.puesto}</h4>
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                                                {historia.antiguedad || 'Sin tiempo especificado'}
                                            </Badge>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4 text-slate-400" />
                                                {historia.empresa_anterior}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                {historia.fecha_inicio ? new Date(historia.fecha_inicio).toLocaleDateString() : 'Inicio N/A'} - {historia.fecha_fin ? new Date(historia.fecha_fin).toLocaleDateString() : 'Fin N/A'}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {historia.riesgos_fisicos && <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">Físicos</Badge>}
                                            {historia.riesgos_quimicos && <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">Químicos</Badge>}
                                            {historia.riesgos_biologicos && <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">Biológicos</Badge>}
                                            {historia.riesgos_ergonomicos && <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">Ergonómicos</Badge>}
                                            {historia.riesgos_electricos && <Badge variant="outline" className="border-yellow-200 text-yellow-700 bg-yellow-50">Eléctricos</Badge>}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(historia)}>
                                            <Edit2 className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                if (confirm('¿Eliminar este registro?')) deleteMutation.mutate(historia.id)
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Modal para agregar/editar */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-blue-600" />
                            {editingHistoria ? 'Editar Registro Laboral' : 'Nuevo Antecedente Laboral'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Empresa Anterior</Label>
                                <Input {...register('empresa_anterior', { required: true })} placeholder="Nombre de la empresa" />
                            </div>
                            <div className="space-y-2">
                                <Label>Puesto / Función</Label>
                                <Input {...register('puesto', { required: true })} placeholder="Ej: Operador de montacargas" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Antigüedad</Label>
                                <Input {...register('antiguedad')} placeholder="Ej: 3 años" />
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha Inicio</Label>
                                <Input type="date" {...register('fecha_inicio')} />
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha Fin</Label>
                                <Input type="date" {...register('fecha_fin')} />
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <Label className="text-blue-700 font-bold flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                Riesgos Identificados en el Puesto
                            </Label>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Riesgos Físicos (Ruido, Temp, Ilum)</Label>
                                        <Input {...register('riesgos_fisicos')} placeholder="Describir..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Riesgos Químicos (Polvos, Humos)</Label>
                                        <Input {...register('riesgos_quimicos')} placeholder="Describir..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Riesgos Biológicos</Label>
                                        <Input {...register('riesgos_biologicos')} placeholder="Describir..." />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Riesgos Ergonómicos</Label>
                                        <Input {...register('riesgos_ergonomicos')} placeholder="Describir..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Riesgos Psicosociales</Label>
                                        <Input {...register('riesgos_psicosociales')} placeholder="Describir..." />
                                    </div>
                                    <div className="flex gap-6 pt-2">
                                        <div className="flex items-center gap-2">
                                            <Controller
                                                name="riesgos_electricos"
                                                control={control}
                                                render={({ field }) => (
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} id="r_elec" />
                                                )}
                                            />
                                            <Label htmlFor="r_elec" className="text-xs">Eléctricos</Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Controller
                                                name="riesgos_mecanicos"
                                                control={control}
                                                render={({ field }) => (
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} id="r_mec" />
                                                )}
                                            />
                                            <Label htmlFor="r_mec" className="text-xs">Mecánicos</Label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-amber-500" />
                                    EPP Utilizado
                                </Label>
                                <Input {...register('epp_utilizado')} placeholder="Casco, guantes, tapones..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Incidentes / Accidentes</Label>
                                <Input {...register('accidentes_laborales')} placeholder="Describir si hubo..." />
                            </div>
                        </div>

                        <DialogFooter className="pt-6">
                            <Button type="button" variant="ghost" onClick={handleCloseModal}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={mutation.isPending}>
                                {mutation.isPending ? 'Guardando...' : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        {editingHistoria ? 'Actualizar' : 'Guardar'}
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
