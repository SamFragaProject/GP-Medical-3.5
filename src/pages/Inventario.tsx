/**
 * Gestión de Inventario Médico Premium
 * 
 * Control de insumos, medicamentos y equipo médico con estética GPMedical Premium
 */
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, Search, Plus, AlertTriangle, CheckCircle,
  TrendingDown, TrendingUp, Filter, MoreVertical,
  Pill, Syringe, Stethoscope, ShoppingCart, Loader2,
  ArrowUpRight, ArrowDownLeft, Database, Boxes,
  ChevronRight, Sparkles, RefreshCcw, Minus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { inventarioService, Producto } from '@/services/dataService'
import { useAuth } from '@/contexts/AuthContext'
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader'
import { PremiumMetricCard } from '@/components/ui/PremiumMetricCard'
import { NewProductDialog } from '@/components/inventario/NewProductDialog'
import toast from 'react-hot-toast'

export default function Inventario() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('todos')
  const [loading, setLoading] = useState(true)
  const [productos, setProductos] = useState<Producto[]>([])
  const [isNewProductOpen, setIsNewProductOpen] = useState(false)

  const fetchProductos = async () => {
    setLoading(true)
    try {
      const data = await inventarioService.getAll()
      setProductos(data)
    } catch (error) {
      console.error('Error fetching inventory:', error)
      toast.error('Error al cargar inventario')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchProductos()
  }, [])

  const getEstado = (stock: number, minimo: number): 'ok' | 'bajo' | 'critico' | 'agotado' => {
    if (stock <= 0) return 'agotado'
    if (stock <= minimo * 0.5) return 'critico'
    if (stock <= minimo) return 'bajo'
    return 'ok'
  }

  const getEstadoConfig = (estado: 'ok' | 'bajo' | 'critico' | 'agotado') => {
    const configs = {
      ok: { label: 'En Stock', color: 'bg-emerald-500/10 text-emerald-600', border: 'border-emerald-200', icon: CheckCircle },
      bajo: { label: 'Stock Bajo', color: 'bg-amber-500/10 text-amber-600', border: 'border-amber-200', icon: TrendingDown },
      critico: { label: 'Crítico', color: 'bg-orange-500/10 text-orange-600', border: 'border-orange-200', icon: AlertTriangle },
      agotado: { label: 'Agotado', color: 'bg-rose-500/10 text-rose-600', border: 'border-rose-200', icon: AlertTriangle },
    }
    return configs[estado]
  }

  const getCategoriaIcon = (categoria: string) => {
    const icons: Record<string, any> = { medicamento: Pill, insumo: Syringe, equipo: Stethoscope }
    return icons[categoria] || Package
  }

  const itemsMapped = productos.map(p => ({
    ...p,
    estado: getEstado(p.stock_actual, p.stock_minimo)
  }))

  const filteredItems = itemsMapped.filter(item => {
    const matchSearch = item.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.codigo.toLowerCase().includes(searchQuery.toLowerCase())
    const matchTab = activeTab === 'todos' || item.categoria === activeTab
    return matchSearch && matchTab
  })

  const stats = {
    total: productos.length,
    ok: itemsMapped.filter(i => i.estado === 'ok').length,
    bajo: itemsMapped.filter(i => i.estado === 'bajo').length,
    critico: itemsMapped.filter(i => i.estado === 'critico' || i.estado === 'agotado').length,
  }

  const handleAdjustStock = async (productoId: string, cantidad: number, motivo: string) => {
    if (!user) return
    const toastId = toast.loading('Actualizando stock...')
    try {
      await inventarioService.registrarMovimiento({
        producto_id: productoId,
        tipo_movimiento: cantidad > 0 ? 'entrada' : 'salida',
        cantidad: Math.abs(cantidad),
        motivo: motivo,
        empresa_id: user.empresa_id,
        usuario_id: user.id
      })
      toast.success('Inventario actualizado', { id: toastId })
      fetchProductos()
    } catch (err) {
      toast.error('Error al actualizar stock', { id: toastId })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Header Premium */}
      <PremiumPageHeader
        title="Gestión de Inventario"
        subtitle="Control avanzado de medicamentos, insumos y equipo médico certificado"
        icon={Boxes}
        badge="SISTEMA ACTIVO"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={fetchProductos}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-black h-12 rounded-2xl px-6"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Sincronizar
            </Button>
            <Button
              variant="premium"
              className="h-12 px-8 shadow-xl shadow-emerald-500/20"
              onClick={() => setIsNewProductOpen(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Item
            </Button>
          </div>
        }
      />

      <div className="container mx-auto px-6 -mt-4 relative z-40">
        {/* Stats Grid Premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <PremiumMetricCard
            title="Total Items"
            value={stats.total}
            subtitle="Catálogo registrado"
            icon={Package}
            gradient="emerald"
          />
          <PremiumMetricCard
            title="Suministro Saludable"
            value={stats.ok}
            subtitle="En niveles óptimos"
            icon={CheckCircle}
            gradient="emerald"
            trend={{ value: 92, isPositive: true }}
          />
          <PremiumMetricCard
            title="Stock Bajo"
            value={stats.bajo}
            subtitle="Requiere atención"
            icon={TrendingDown}
            gradient="amber"
          />
          <PremiumMetricCard
            title="Estado Crítico"
            value={stats.critico}
            subtitle="Acción inmediata"
            icon={AlertTriangle}
            gradient="rose"
          />
        </div>

        {/* Controles y Tabla */}
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full lg:w-auto">
              <TabsList className="bg-white/40 backdrop-blur-md border border-white/60 p-1.5 rounded-2xl shadow-sm h-14">
                <TabsTrigger value="todos" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all">
                  Todos
                </TabsTrigger>
                <TabsTrigger value="medicamento" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all">
                  Medicamentos
                </TabsTrigger>
                <TabsTrigger value="insumo" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all">
                  Insumos
                </TabsTrigger>
                <TabsTrigger value="equipo" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all">
                  Equipos
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Rastrear por nomenclatura o código activo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 bg-white/50 backdrop-blur-sm border-white/60 rounded-2xl focus:ring-4 focus:ring-emerald-100 transition-all shadow-sm font-bold"
                />
              </div>
              <Button variant="outline" className="h-14 w-14 rounded-2xl border-slate-200 bg-white">
                <Filter className="w-5 h-5 text-slate-400" />
              </Button>
            </div>
          </div>

          <Card className="border-0 shadow-2xl shadow-blue-900/5 bg-white/70 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="text-left py-6 px-8 text-xs font-black text-slate-400 uppercase tracking-widest">Producto</th>
                      <th className="text-left py-6 px-8 text-xs font-black text-slate-400 uppercase tracking-widest">Stock Actual</th>
                      <th className="text-left py-6 px-8 text-xs font-black text-slate-400 uppercase tracking-widest">Información</th>
                      <th className="text-left py-6 px-8 text-xs font-black text-slate-400 uppercase tracking-widest">Estado</th>
                      <th className="text-center py-6 px-8 text-xs font-black text-slate-400 uppercase tracking-widest">Ajuste Rápido</th>
                      <th className="text-right py-6 px-8 text-xs font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <AnimatePresence mode="popLayout">
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="py-24 text-center">
                            <div className="flex flex-col items-center gap-4">
                              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                              <p className="text-slate-500 font-bold animate-pulse text-lg tracking-tight">Sincronizando inventario médico...</p>
                            </div>
                          </td>
                        </tr>
                      ) : filteredItems.length > 0 ? filteredItems.map((item, index) => {
                        const estadoConfig = getEstadoConfig(item.estado)
                        const CategoriaIcon = getCategoriaIcon(item.categoria)
                        const EstadoIcon = estadoConfig.icon

                        return (
                          <motion.tr
                            key={item.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-emerald-50/40 transition-colors group"
                          >
                            <td className="py-6 px-8">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all duration-300">
                                  <CategoriaIcon className="w-6 h-6 text-slate-600" />
                                </div>
                                <div>
                                  <p className="font-black text-slate-800 text-lg leading-tight">{item.nombre}</p>
                                  <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest mt-1 group-hover:text-blue-500 transition-colors">
                                    REF: {item.codigo}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-6 px-8">
                              <div className="flex items-center gap-3">
                                <span className="text-3xl font-black text-slate-900 tracking-tighter">
                                  {item.stock_actual}
                                </span>
                                <div className="flex flex-col">
                                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Mínimo: {item.stock_minimo}</span>
                                  <span className="text-[11px] text-slate-500 font-bold">{item.unidad_medida}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-6 px-8">
                              <div className="space-y-1">
                                <p className="text-sm text-slate-600 font-bold flex items-center gap-2">
                                  <Database className="w-3.5 h-3.5 text-slate-400" />
                                  {item.descripcion || 'Bodega Central'}
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium">Lote: 2024-X45 • Vence: 12/26</p>
                              </div>
                            </td>
                            <td className="py-6 px-8">
                              <Badge className={`${estadoConfig.color} border-2 ${estadoConfig.border} shadow-none px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center w-fit gap-2`}>
                                <EstadoIcon className="w-3.5 h-3.5" />
                                {estadoConfig.label}
                              </Badge>
                            </td>
                            <td className="py-6 px-8">
                              <div className="flex items-center justify-center gap-2">
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-10 w-10 rounded-xl border-slate-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm"
                                    onClick={() => handleAdjustStock(item.id, 1, 'Entrada rápida')}
                                  >
                                    <Plus className="w-5 h-5" />
                                  </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-10 w-10 rounded-xl border-slate-200 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all shadow-sm"
                                    onClick={() => handleAdjustStock(item.id, -1, 'Salida rápida')}
                                  >
                                    <Minus className="w-5 h-5" />
                                  </Button>
                                </motion.div>
                              </div>
                            </td>
                            <td className="py-6 px-8 text-right">
                              <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-100">
                                <ChevronRight className="w-5 h-5 text-slate-400" />
                              </Button>
                            </td>
                          </motion.tr>
                        )
                      }) : (
                        <tr>
                          <td colSpan={6} className="py-32 text-center text-slate-400">
                            <div className="flex flex-col items-center gap-4 opacity-30">
                              <Boxes className="w-20 h-20" />
                              <p className="text-xl font-bold">No se encontraron productos coincidientes</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerta de items críticos Premium */}
        <AnimatePresence>
          {stats.critico > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="mt-8"
            >
              <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-rose-500 to-rose-600 p-8 shadow-2xl shadow-rose-500/30 text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30 shrink-0">
                    <AlertTriangle className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="text-2xl font-black mb-2 flex items-center gap-3 justify-center md:justify-start">
                      <Sparkles className="w-5 h-5" />
                      Reposición Prioritaria Requerida
                    </h4>
                    <p className="text-rose-50 font-medium">
                      Se han detectado <span className="font-black text-white">{stats.critico} items</span> con stock agotado o nivel crítico.
                      La disponibilidad de estos insumos es esencial para el flujo operativo.
                    </p>
                  </div>
                  <Button className="bg-white text-rose-600 hover:bg-rose-50 font-black h-14 rounded-2xl px-8 shadow-xl">
                    Generar Orden de Compra
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dialog Nuevo Producto */}
      <NewProductDialog
        open={isNewProductOpen}
        onOpenChange={setIsNewProductOpen}
        onSuccess={fetchProductos}
      />
    </div>
  )
}
