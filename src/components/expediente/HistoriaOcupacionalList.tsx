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
        <div className="space-y-6 relative z-10 w-full">
            <div className="flex justify-between items-center p-5 rounded-3xl bg-slate-900/60 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#0ea5e9]/10 rounded-2xl flex items-center justify-center border border-[#0ea5e9]/20 shadow-[inset_0_2px_10px_rgba(14,165,233,0.1)]">
                        <Briefcase className="w-6 h-6 text-[#0ea5e9]" style={{ filter: 'drop-shadow(0 0 8px rgba(14,165,233,0.5))' }} />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-white text-lg tracking-tight">Historia Ocupacional</h3>
                        <p className="text-sm font-medium text-slate-400">Cronología laboral y riesgos previstos</p>
                    </div>
                </div>
                <Button onClick={handleOpenAdd} className="bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] text-white shadow-[0_0_20px_rgba(14,165,233,0.3)] border-none rounded-xl font-bold tracking-wide">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar
                </Button>
            </div>

            <div className="grid gap-4 w-full">
                {data.length === 0 ? (
                    <div className="p-16 text-center rounded-3xl border border-white/5 bg-slate-900/40 backdrop-blur-md relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0ea5e9]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        <Briefcase className="w-16 h-16 mx-auto mb-6 text-slate-600 drop-shadow-md" />
                        <p className="text-slate-300 font-bold text-lg mb-2">Sin registros laborales</p>
                        <p className="text-slate-500 font-medium text-sm mb-6 max-w-sm mx-auto">Comienza añadiendo el primer empleo o antecedente de exposición ocupacional del paciente.</p>
                        <Button variant="outline" onClick={handleOpenAdd} className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.2)] transition-all group-hover:border-[#0ea5e9]/30">
                            <Plus className="w-4 h-4 mr-2" /> Añadir Primer Registro
                        </Button>
                    </div>
                ) : (
                    data.map((historia) => (
                        <div key={historia.id} className="group relative rounded-3xl p-[1px] bg-gradient-to-br from-white/10 to-transparent hover:from-[#0ea5e9]/40 hover:to-transparent transition-all duration-500">
                            <div className="bg-slate-950/80 backdrop-blur-2xl p-6 rounded-[23px] relative z-10 w-full overflow-hidden flex flex-col md:flex-row gap-6 items-start">
                                {/* Ambient Glow */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#0ea5e9]/5 rounded-full blur-[60px] pointer-events-none -translate-y-1/2 translate-x-1/3 group-hover:bg-[#0ea5e9]/10 transition-colors" />

                                <div className="flex-1 space-y-4 relative z-10 w-full">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1.5">
                                                <h4 className="font-extrabold text-xl text-white tracking-tight">{historia.puesto}</h4>
                                                <Badge className="bg-[#0ea5e9]/20 text-[#0ea5e9] border-[#0ea5e9]/30 border text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 shadow-[0_0_10px_rgba(14,165,233,0.2)] hover:bg-[#0ea5e9]/30">
                                                    {historia.antiguedad || 'N/A'}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm font-medium text-slate-400">
                                                <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                                                    <MapPin className="w-3.5 h-3.5 text-amber-500 drop-shadow-[0_0_4px_rgba(245,158,11,0.5)]" />
                                                    <span className="text-white/90">{historia.empresa_anterior}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-500">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {historia.fecha_inicio ? new Date(historia.fecha_inicio).toLocaleDateString() : 'N/A'} - {historia.fecha_fin ? new Date(historia.fecha_fin).toLocaleDateString() : 'Actual'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-1 border-t border-white/5 mt-3">
                                        {historia.riesgos_fisicos && <span className="px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider drop-shadow-sm">Físicos</span>}
                                        {historia.riesgos_quimicos && <span className="px-2 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider drop-shadow-sm">Químicos</span>}
                                        {historia.riesgos_biologicos && <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider drop-shadow-sm">Biológicos</span>}
                                        {historia.riesgos_ergonomicos && <span className="px-2 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider drop-shadow-sm">Ergonómicos</span>}
                                        {historia.riesgos_psicosociales && <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider drop-shadow-sm">Psicosociales</span>}
                                        {historia.riesgos_electricos && <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider drop-shadow-sm">Eléctricos</span>}
                                    </div>
                                </div>

                                <div className="flex flex-row md:flex-col gap-2 relative z-10">
                                    <Button variant="outline" size="icon" onClick={() => handleEdit(historia)} className="bg-white/5 border-white/10 hover:bg-[#0ea5e9]/20 hover:border-[#0ea5e9]/50 hover:text-[#0ea5e9] rounded-xl transition-all">
                                        <Edit2 className="w-4 h-4 text-slate-400 hover:text-inherit" />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => { if (confirm('¿Eliminar este registro?')) deleteMutation.mutate(historia.id) }} className="bg-white/5 border-white/10 hover:bg-rose-500/20 hover:border-rose-500/50 hover:text-rose-400 rounded-xl transition-all">
                                        <Trash2 className="w-4 h-4 text-slate-400 hover:text-inherit" />
                                    </Button>
                                </div>
                            </div>
                        </div>
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
