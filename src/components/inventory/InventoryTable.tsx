import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, History, Package, Pill, FlaskConical, Stethoscope, ChevronRight, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { InventarioItem, InventoryStatus } from '@/types/inventory';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface InventoryTableProps {
    items: InventarioItem[];
    onEdit: (item: InventarioItem) => void;
    onDelete?: (id: string) => void;
    onHistory: (item: InventarioItem) => void;
}

const getStatusConfig = (status: InventoryStatus, stock: number, minStock: number) => {
    if (stock === 0) return { label: 'Agotado', color: 'bg-rose-500/10 text-rose-600 border-rose-200', icon: AlertTriangle };
    if (stock <= minStock) return { label: 'Stock Bajo', color: 'bg-amber-500/10 text-amber-600 border-amber-200', icon: AlertTriangle };

    switch (status) {
        case 'disponible': return { label: 'Disponible', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200', icon: CheckCircle2 };
        case 'caducado': return { label: 'Caducado', color: 'bg-rose-500/10 text-rose-600 border-rose-200', icon: Clock };
        case 'cuarentena': return { label: 'Cuarentena', color: 'bg-slate-500/10 text-slate-600 border-slate-200', icon: Package };
        default: return { label: status, color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: Package };
    }
};

export function InventoryTable({ items, onEdit, onDelete, onHistory }: InventoryTableProps) {
    return (
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-blue-100/50 shadow-2xl shadow-blue-900/5 overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-b border-blue-50 hover:bg-transparent">
                        <TableHead className="py-6 px-8 text-xs font-black text-slate-400 uppercase tracking-widest">Producto / SKU</TableHead>
                        <TableHead className="py-6 px-8 text-xs font-black text-slate-400 uppercase tracking-widest">Presentación</TableHead>
                        <TableHead className="py-6 px-8 text-xs font-black text-slate-400 uppercase tracking-widest">Caducidad</TableHead>
                        <TableHead className="py-6 px-8 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Existencia</TableHead>
                        <TableHead className="py-6 px-8 text-xs font-black text-slate-400 uppercase tracking-widest">Estado</TableHead>
                        <TableHead className="py-6 px-8 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="py-24 text-center">
                                <div className="flex flex-col items-center gap-4 opacity-30">
                                    <Package className="w-20 h-20 text-slate-400" />
                                    <p className="text-xl font-bold text-slate-800">No hay productos en el inventario</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        items.map((item, index) => {
                            const status = getStatusConfig(item.estado, item.stock_actual, item.stock_minimo);

                            return (
                                <motion.tr
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="border-b border-slate-50 hover:bg-blue-50/40 transition-colors group"
                                >
                                    <TableCell className="py-6 px-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all duration-300">
                                                <Pill className="w-6 h-6 text-slate-600" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-800 text-lg leading-tight">{item.nombre_comercial}</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest group-hover:text-blue-500 transition-colors">
                                                        {item.sku || 'SIN SKU'}
                                                    </span>
                                                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                                    <span className="text-xs text-slate-500 font-medium">{item.nombre_generico}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6 px-8">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-700">{item.presentacion}</span>
                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-tight">Lote: {item.lote || 'N/A'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6 px-8">
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                            {item.fecha_caducidad ? format(new Date(item.fecha_caducidad), 'dd MMM yyyy', { locale: es }) : '-'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6 px-8 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-2xl font-black text-slate-900 tracking-tighter">{item.stock_actual}</span>
                                            <span className="text-[10px] text-slate-400 font-black uppercase">Mín. {item.stock_minimo}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6 px-8">
                                        <Badge className={`${status.color} border-2 shadow-none px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center w-fit gap-2`}>
                                            <status.icon className="w-3.5 h-3.5" />
                                            {status.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-6 px-8 text-right">
                                        <div className="flex justify-end gap-3">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onHistory(item)}
                                                className="h-10 w-10 rounded-xl hover:bg-white shadow-sm border border-transparent hover:border-slate-100"
                                            >
                                                <History className="h-5 h-5 text-slate-400 hover:text-blue-500 transition-colors" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onEdit(item)}
                                                className="h-10 w-10 rounded-xl hover:bg-white shadow-sm border border-transparent hover:border-slate-100"
                                            >
                                                <Edit className="h-5 h-5 text-slate-400 hover:text-blue-500 transition-colors" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-10 w-10 rounded-xl hover:bg-white shadow-sm border border-transparent hover:border-slate-100"
                                            >
                                                <ChevronRight className="h-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </motion.tr>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
