import { useState, useEffect, useCallback } from 'react'
import { inventarioService, Producto } from '@/services/dataService'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

export interface InventoryStats {
    total: number
    ok: number
    bajo: number
    critico: number
    valorTotal: number
}

export function useInventory() {
    const { user } = useAuth()
    const [productos, setProductos] = useState<Producto[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<InventoryStats>({
        total: 0,
        ok: 0,
        bajo: 0,
        critico: 0,
        valorTotal: 0
    })

    const getEstado = (stock: number, minimo: number): 'ok' | 'bajo' | 'critico' | 'agotado' => {
        if (stock <= 0) return 'agotado'
        if (stock <= minimo * 0.5) return 'critico'
        if (stock <= minimo) return 'bajo'
        return 'ok'
    }

    const fetchInventory = useCallback(async () => {
        setLoading(true)
        try {
            const data = await inventarioService.getAll()
            setProductos(data)

            // Calculate stats
            const withEstado = data.map(p => ({
                ...p,
                estado: getEstado(p.stock_actual, p.stock_minimo)
            }))

            setStats({
                total: data.length,
                ok: withEstado.filter(i => i.estado === 'ok').length,
                bajo: withEstado.filter(i => i.estado === 'bajo').length,
                critico: withEstado.filter(i => i.estado === 'critico' || i.estado === 'agotado').length,
                valorTotal: data.reduce((acc, p) => acc + (p.stock_actual * p.precio_compra), 0)
            })
        } catch (error) {
            console.error('Error fetching inventory:', error)
            toast.error('Error al cargar inventario')
        } finally {
            setLoading(false)
        }
    }, [])

    const adjustStock = useCallback(async (
        productoId: string,
        cantidad: number,
        motivo: string,
        tipo: 'entrada' | 'salida' | 'ajuste' = cantidad > 0 ? 'entrada' : 'salida'
    ) => {
        if (!user) return false

        try {
            await inventarioService.registrarMovimiento({
                producto_id: productoId,
                tipo_movimiento: tipo,
                cantidad: cantidad,
                motivo: motivo,
                empresa_id: user.empresa_id,
                usuario_id: user.id
            })
            toast.success('Inventario actualizado')
            await fetchInventory()
            return true
        } catch (err) {
            toast.error('Error al actualizar stock')
            return false
        }
    }, [user, fetchInventory])

    const createProduct = useCallback(async (producto: Partial<Producto>) => {
        if (!user) return null

        try {
            const result = await inventarioService.upsertProducto({
                ...producto,
                empresa_id: user.empresa_id
            })
            toast.success('Producto creado')
            await fetchInventory()
            return result
        } catch (err) {
            toast.error('Error al crear producto')
            return null
        }
    }, [user, fetchInventory])

    const searchProducts = useCallback((query: string, categoria?: string) => {
        return productos.filter(p => {
            const matchQuery = !query ||
                p.nombre.toLowerCase().includes(query.toLowerCase()) ||
                p.codigo.toLowerCase().includes(query.toLowerCase())
            const matchCat = !categoria || categoria === 'todos' || p.categoria === categoria
            return matchQuery && matchCat
        }).map(p => ({
            ...p,
            estado: getEstado(p.stock_actual, p.stock_minimo)
        }))
    }, [productos])

    const getLowStockAlerts = useCallback(() => {
        return productos
            .filter(p => p.stock_actual <= p.stock_minimo)
            .map(p => ({
                ...p,
                estado: getEstado(p.stock_actual, p.stock_minimo),
                urgencia: p.stock_actual <= 0 ? 'critico' : p.stock_actual <= p.stock_minimo * 0.5 ? 'alto' : 'medio'
            }))
            .sort((a, b) => a.stock_actual - b.stock_actual)
    }, [productos])

    useEffect(() => {
        fetchInventory()
    }, [fetchInventory])

    return {
        productos,
        loading,
        stats,
        fetchInventory,
        adjustStock,
        createProduct,
        searchProducts,
        getLowStockAlerts,
        getEstado
    }
}
