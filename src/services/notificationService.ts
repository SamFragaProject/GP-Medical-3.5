import { supabase } from '@/lib/supabase'
import { Notificacion } from '@/types/notifications'
import { inventoryService } from './inventoryService'

export const notificationService = {
    // === GESTIÓN BÁSICA ===
    async getNotificaciones(userId: string) {
        const { data, error } = await supabase
            .from('notificaciones')
            .select('*')
            .eq('usuario_id', userId)
            .order('created_at', { ascending: false })
            .limit(20) // Traer solo las últimas 20

        if (error) throw error
        return data as Notificacion[]
    },

    async getUnreadCount(userId: string) {
        const { count, error } = await supabase
            .from('notificaciones')
            .select('*', { count: 'exact', head: true })
            .eq('usuario_id', userId)
            .eq('leida', false)

        if (error) throw error
        return count || 0
    },

    async markAsRead(id: string) {
        const { error } = await supabase
            .from('notificaciones')
            .update({ leida: true })
            .eq('id', id)

        if (error) throw error
    },

    async markAllAsRead(userId: string) {
        const { error } = await supabase
            .from('notificaciones')
            .update({ leida: true })
            .eq('usuario_id', userId)
            .eq('leida', false)

        if (error) throw error
    },

    async createNotification(notificacion: Partial<Notificacion>) {
        const { error } = await supabase
            .from('notificaciones')
            .insert(notificacion)

        if (error) console.error('Error creando notificacion:', error)
    },

    // === EMAIL NOTIFICATIONS ===
    async sendEmail(to: string[], subject: string, html: string, from?: string) {
        const { data, error } = await supabase.functions.invoke('send-email', {
            body: { to, subject, html, from }
        })

        if (error) {
            console.error('Error sending email:', error)
            throw error // Re-throw para manejarlo en UI si es necesario
        }

        return data
    },

    // === LÓGICA DE NEGOCIO (ALERTAS) ===

    // Esta función debería ejecutarse periódicamente o al cargar el dashboard
    // Verifica el inventario y crea alertas si es necesario
    async checkInventoryAlerts(empresaId: string, userId: string) {
        try {
            // 1. Obtener stats actuales
            const stats = await inventoryService.getStats(empresaId)

            // 2. Revisar si ya existen notificaciones recientes (para no spammear)
            // Simplificación: Traemos las últimas notificaciones del día
            const today = new Date().toISOString().split('T')[0]
            const { data: recentNotifs } = await supabase
                .from('notificaciones')
                .select('titulo')
                .eq('usuario_id', userId)
                .gte('created_at', today)

            const recentTitles = recentNotifs?.map(n => n.titulo) || []

            // 3. Generar Alerta de Stock Bajo
            if (stats.lowStockItems > 0) {
                const title = `⚠️ Stock Bajo: ${stats.lowStockItems} items`
                if (!recentTitles.includes(title)) {
                    await this.createNotification({
                        empresa_id: empresaId,
                        usuario_id: userId,
                        titulo: title,
                        mensaje: 'Hay medicamentos con stock por debajo del mínimo. Revise el inventario.',
                        tipo: 'warning',
                        link: '/inventario'
                    })
                }
            }

            // 4. Generar Alerta de Caducidad
            if (stats.expiredItems > 0) {
                const title = `🚨 Caducidad: ${stats.expiredItems} items por vencer`
                if (!recentTitles.includes(title)) {
                    await this.createNotification({
                        empresa_id: empresaId,
                        usuario_id: userId,
                        titulo: title,
                        mensaje: 'Medicamentos próximos a caducar o caducados. Acción requerida.',
                        tipo: 'error',
                        link: '/inventario'
                    })
                }
            }

        } catch (error) {
            console.error('Error checking inventory alerts:', error)
        }
    }
}
