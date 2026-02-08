import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, FileText, Calculator, Download, Plus } from 'lucide-react';
import { payrollService } from '@/services/payrollService';
import { Payroll, PayrollDetail } from '@/types/rrhh';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

export function NominaPanel() {
    const { user } = useAuth();
    const [payrolls, setPayrolls] = useState<Payroll[]>([]);
    const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
    const [details, setDetails] = useState<PayrollDetail[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.empresa_id) {
            loadPayrolls();
        }
    }, [user?.empresa_id]);

    const loadPayrolls = async () => {
        try {
            const data = await payrollService.getPayrolls(user?.empresa_id!);
            setPayrolls(data);
        } catch (error) {
            console.error(error);
            toast.error('Error cargando nóminas');
        }
    };

    const handleCreatePayroll = async () => {
        try {
            setLoading(true);
            const today = new Date();
            const start = new Date(today.getFullYear(), today.getMonth(), 1);
            const end = new Date(today.getFullYear(), today.getMonth(), 15);

            // 1. Crear Cabecera
            const newPayroll = await payrollService.createPayroll({
                empresa_id: user?.empresa_id!,
                titulo: `Nómina Quincenal ${today.toLocaleDateString()}`,
                periodo_inicio: start.toISOString(),
                periodo_fin: end.toISOString(),
                estado: 'borrador'
            });

            // 2. Generar Detalles
            await payrollService.generatePayrollDetails(newPayroll.id, user?.empresa_id!);

            toast.success('Nómina generada correctamente');
            loadPayrolls();
            handleSelectPayroll(newPayroll);
        } catch (error) {
            console.error(error);
            toast.error('Error generando nómina');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPayroll = async (payroll: Payroll) => {
        setSelectedPayroll(payroll);
        try {
            setLoading(true);
            const data = await payrollService.getPayrollDetails(payroll.id);
            setDetails(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Nóminas */}
            <div className="lg:col-span-1 space-y-4">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            Historial
                            <Button size="sm" onClick={handleCreatePayroll} disabled={loading}>
                                <Plus className="w-4 h-4 mr-1" /> Nueva
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {payrolls.map(p => (
                            <div
                                key={p.id}
                                onClick={() => handleSelectPayroll(p)}
                                className={`p-4 rounded-lg border cursor-pointer hover:bg-slate-50 transition-colors ${selectedPayroll?.id === p.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-medium text-sm">{p.titulo}</span>
                                    <Badge variant={(p.estado === 'pagada') ? 'default' : 'secondary'}>
                                        {p.estado}
                                    </Badge>
                                </div>
                                <div className="text-xs text-slate-500">
                                    Total: ${p.total_pagado.toLocaleString()}
                                </div>
                            </div>
                        ))}
                        {payrolls.length === 0 && (
                            <div className="text-center text-slate-400 py-8">
                                No hay nóminas registradas
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Detalle de Nómina */}
            <div className="lg:col-span-2">
                {selectedPayroll ? (
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>{selectedPayroll.titulo}</CardTitle>
                                    <CardDescription>
                                        Periodo: {new Date(selectedPayroll.periodo_inicio).toLocaleDateString()} - {new Date(selectedPayroll.periodo_fin).toLocaleDateString()}
                                    </CardDescription>
                                </div>
                                <Button variant="outline">
                                    <Download className="w-4 h-4 mr-2" /> Exportar PDF
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                                    <span className="text-xs text-emerald-600 uppercase font-bold">Total Percepciones</span>
                                    <div className="text-xl font-bold text-emerald-700">${selectedPayroll.total_percepciones.toLocaleString()}</div>
                                </div>
                                <div className="p-4 bg-rose-50 rounded-lg border border-rose-100">
                                    <span className="text-xs text-rose-600 uppercase font-bold">Total Deducciones</span>
                                    <div className="text-xl font-bold text-rose-700">${selectedPayroll.total_deducciones.toLocaleString()}</div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <span className="text-xs text-slate-600 uppercase font-bold">Neto a Pagar</span>
                                    <div className="text-xl font-bold text-slate-700">${selectedPayroll.total_pagado.toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-sm text-slate-700">Detalle por Empleado</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 text-slate-500">
                                            <tr>
                                                <th className="p-2 text-left">Empleado</th>
                                                <th className="p-2 text-right">Sueldo Base</th>
                                                <th className="p-2 text-right">Percepcion</th>
                                                <th className="p-2 text-right">Deduccion</th>
                                                <th className="p-2 text-right font-bold">Neto</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {details.map(d => (
                                                <tr key={d.id} className="border-t border-slate-100">
                                                    <td className="p-2">
                                                        <div className="font-medium text-slate-700">
                                                            {d.empleado?.nombre} {d.empleado?.apellido}
                                                        </div>
                                                        <div className="text-xs text-slate-400">
                                                            {typeof d.empleado?.puesto === 'string'
                                                                ? d.empleado.puesto
                                                                : (d.empleado?.puesto as any)?.nombre || ''}
                                                        </div>
                                                    </td>
                                                    <td className="p-2 text-right">${d.salario_base.toLocaleString()}</td>
                                                    <td className="p-2 text-right text-emerald-600">+${d.total_percepciones.toLocaleString()}</td>
                                                    <td className="p-2 text-right text-rose-600">-${d.total_deducciones.toLocaleString()}</td>
                                                    <td className="p-2 text-right font-bold">${d.neto_pagar.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg p-12 text-slate-400">
                        <Calculator className="w-12 h-12 mb-2" />
                        <span className="block">Seleccione una nómina para ver el detalle</span>
                    </div>
                )}
            </div>
        </div>
    );
}
