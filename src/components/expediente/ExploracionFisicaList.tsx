import React, { useState } from 'react';
import { Stethoscope, Plus, Eye, Calendar, Activity, ChevronRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ExploracionFisica } from '@/types/expediente';
import { ExploracionFisicaForm } from './ExploracionFisicaForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ExploracionFisicaListProps {
    expedienteId: string;
    data: ExploracionFisica[];
}

export function ExploracionFisicaList({ expedienteId, data }: ExploracionFisicaListProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedExploracion, setSelectedExploracion] = useState<ExploracionFisica | null>(null);

    const handleOpenAdd = () => {
        setSelectedExploracion(null);
        setIsAddModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Stethoscope className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">Exploraciones Físicas</h3>
                        <p className="text-xs text-slate-500">Revisiones por sistemas y signos vitales</p>
                    </div>
                </div>
                <Button onClick={handleOpenAdd} className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Exploración
                </Button>
            </div>

            {data.length === 0 ? (
                <Card className="p-12 text-center border-dashed border-2">
                    <Stethoscope className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">No hay exploraciones físicas registradas</p>
                    <Button variant="outline" onClick={handleOpenAdd} className="mt-4">
                        Empezar primera revisión
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.map((exploracion) => (
                        <Card key={exploracion.id} className="group hover:shadow-md transition-all cursor-pointer border-l-4 border-l-emerald-500">
                            <CardContent className="p-5">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span className="font-bold text-slate-900">
                                                {new Date(exploracion.fecha_exploracion).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-3 text-xs">
                                            <div className="bg-slate-50 px-2 py-1 rounded border flex items-center gap-1">
                                                <Activity className="w-3 h-3 text-emerald-600" />
                                                <span className="font-medium">IMC: {exploracion.imc || 'N/A'}</span>
                                            </div>
                                            <div className="bg-slate-50 px-2 py-1 rounded border flex items-center gap-1">
                                                <Heart className="w-3 h-3 text-red-600" />
                                                <span className="font-medium">TA: {exploracion.ta_sistolica || '--'}/{exploracion.ta_diastolica || '--'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal para Agregar */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="w-5 h-5 text-emerald-600" />
                            Nueva Exploración Física
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <ExploracionFisicaForm
                            expedienteId={expedienteId}
                            onSuccess={() => setIsAddModalOpen(false)}
                            onCancel={() => setIsAddModalOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
