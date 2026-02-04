import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { inventoryService } from '@/services/inventoryService';
import { InventarioItem, InventoryStats } from '@/types/inventory';
import { InventoryStatsCards } from '@/components/inventory/InventoryStatsCards';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, RefreshCw, Filter, Receipt, Boxes, Package, Sparkles, ChevronRight, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ComponenteProveedores } from '@/components/inventario/ComponenteProveedores';
import { ComponenteOrdenesCompra } from '@/components/inventario/ComponenteOrdenesCompra';
import { InventoryReports } from '@/components/inventario/InventoryReports';
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

export default function InventoryPage() {
    const { user } = useAuth();
    const [items, setItems] = useState<InventarioItem[]>([]);
    const [stats, setStats] = useState<InventoryStats>({ totalItems: 0, lowStockItems: 0, expiredItems: 0, totalValue: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const loadData = async () => {
        if (!user?.empresa_id) return;
        setLoading(true);
        try {
            const [fetchedItems, fetchedStats] = await Promise.all([
                inventoryService.getInventario(user.empresa_id, searchTerm),
                inventoryService.getStats(user.empresa_id)
            ]);
            setItems(fetchedItems);
            setStats(fetchedStats);
        } catch (error) {
            console.error('Error loading inventory:', error);
            toast.error('Error al cargar el inventario');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user?.empresa_id]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadData();
    };

    const handleEdit = (item: InventarioItem) => {
        toast('Edición próximamente', { icon: '🛠️' });
    };

    const handleHistory = (item: InventarioItem) => {
        toast('Historial próximamente', { icon: '📜' });
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12">
            {/* Header Premium */}
            <PremiumPageHeader
                title="Farmacia & Abastecimiento"
                subtitle="Gestión integral de recetas, inventario crítico, compras y proveedores certificados"
                icon={Boxes}
                badge="MÓDULO DE SUMINISTROS"
                actions={
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={loadData}
                            disabled={loading}
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-black h-12 rounded-2xl px-6"
                        >
                            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Sincronizar
                        </Button>
                        <Button
                            className="bg-white text-blue-600 hover:bg-white/90 font-black h-12 rounded-2xl px-6 shadow-xl shadow-blue-900/20"
                            onClick={() => toast('Función próximamente', { icon: '✨' })}
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            Nuevo Producto
                        </Button>
                    </div>
                }
            />

            <div className="container mx-auto px-6 -mt-4 relative z-10 space-y-8">
                {/* Stats Cards Premium */}
                <InventoryStatsCards stats={stats} />

                {/* Tabs de Navegación Estilizadas */}
                <Tabs defaultValue="inventory" className="space-y-8">
                    <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                        <TabsList className="bg-white/80 backdrop-blur-md border border-slate-200 p-1.5 rounded-[2rem] shadow-sm h-16 w-full lg:w-auto overflow-x-auto">
                            <TabsTrigger value="inventory" className="rounded-full px-8 py-3 font-black text-sm uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300">
                                <Package className="w-4 h-4 mr-2" />
                                Inventario
                            </TabsTrigger>
                            <TabsTrigger value="orders" className="rounded-full px-8 py-3 font-black text-sm uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300">
                                <Receipt className="w-4 h-4 mr-2" />
                                Órdenes
                            </TabsTrigger>
                            <TabsTrigger value="suppliers" className="rounded-full px-8 py-3 font-black text-sm uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300">
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Proveedores
                            </TabsTrigger>
                            <TabsTrigger value="reports" className="rounded-full px-8 py-3 font-black text-sm uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300">
                                <Boxes className="w-4 h-4 mr-2" />
                                Kardex
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-4 w-full lg:w-96">
                            <form onSubmit={handleSearch} className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Buscar por nombre, SKU o activo..."
                                    className="pl-12 h-14 bg-white border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all shadow-sm w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </form>
                            <Button variant="outline" className="h-14 w-14 rounded-2xl border-slate-200 bg-white shadow-sm">
                                <Filter className="h-5 w-5 text-slate-400" />
                            </Button>
                        </div>
                    </div>

                    <TabsContent value="inventory" className="mt-0 outline-none">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                    <Sparkles className="w-5 h-5 text-blue-500" />
                                    Stock de Farmacia Actual
                                </h2>
                                <Button
                                    variant="link"
                                    className="text-blue-600 font-bold p-0 flex items-center gap-2"
                                    onClick={() => window.location.href = '/facturacion'}
                                >
                                    Ir a Punto de Venta
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>

                            <InventoryTable
                                items={items}
                                onEdit={handleEdit}
                                onHistory={handleHistory}
                            />
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="orders">
                        <Card className="rounded-[2rem] border-0 shadow-xl overflow-hidden min-h-[400px]">
                            <ComponenteOrdenesCompra />
                        </Card>
                    </TabsContent>

                    <TabsContent value="suppliers">
                        <Card className="rounded-[2rem] border-0 shadow-xl overflow-hidden min-h-[400px]">
                            <ComponenteProveedores />
                        </Card>
                    </TabsContent>

                    <TabsContent value="reports">
                        <Card className="rounded-[2rem] border-0 shadow-xl overflow-hidden min-h-[400px]">
                            <InventoryReports />
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
