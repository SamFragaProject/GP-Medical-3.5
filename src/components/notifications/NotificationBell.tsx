import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, Info, AlertTriangle, AlertCircle, CheckCircle, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { notificationService } from '@/services/notificationService'
import { Notificacion } from '@/types/notifications'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

export function NotificationBell() {
    const { user } = useAuth()
    const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const loadNotifications = async () => {
        if (!user) return
        try {
            // First check for new alerts
            if (user.empresa_id) {
                await notificationService.checkInventoryAlerts(user.empresa_id, user.id)
            }

            // Then load
            const [data, count] = await Promise.all([
                notificationService.getNotificaciones(user.id),
                notificationService.getUnreadCount(user.id)
            ])
            setNotificaciones(data)
            setUnreadCount(count)
        } catch (error) {
            console.error('Error loading notifications', error)
        }
    }

    // Poll every minute or on mount
    useEffect(() => {
        loadNotifications()
        const interval = setInterval(loadNotifications, 60000)
        return () => clearInterval(interval)
    }, [user?.id])

    const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            await notificationService.markAsRead(id)
            setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error(error)
        }
    }

    const handleMarkAllRead = async () => {
        if (!user) return
        try {
            await notificationService.markAllAsRead(user.id)
            setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
            setUnreadCount(0)
            toast.success('Todas marcadas como leídas')
        } catch (error) {
            console.error(error)
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle size={16} className="text-amber-500" />
            case 'error': return <AlertCircle size={16} className="text-red-500" />
            case 'success': return <CheckCircle size={16} className="text-emerald-500" />
            default: return <Info size={16} className="text-blue-500" />
        }
    }

    const getBgColor = (type: string) => {
        switch (type) {
            case 'warning': return 'bg-amber-50'
            case 'error': return 'bg-red-50'
            case 'success': return 'bg-emerald-50'
            default: return 'bg-blue-50'
        }
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                title="Notificaciones"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden text-left"
                        >
                            <div className="flex items-center justify-between p-4 border-b bg-gray-50/50">
                                <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                                    >
                                        <Check size={12} /> Marcar todas leídas
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto">
                                {notificaciones.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <Bell className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                                        <p className="text-sm">No tienes notificaciones</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {notificaciones.map(notif => (
                                            <div
                                                key={notif.id}
                                                className={`p-4 hover:bg-gray-50 transition-colors relative group ${!notif.leida ? 'bg-blue-50/30' : ''}`}
                                            >
                                                {!notif.leida && (
                                                    <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-indigo-500" />
                                                )}

                                                <Link
                                                    to={notif.link || '#'}
                                                    onClick={() => !notif.leida && handleMarkAsRead(notif.id, {} as any)}
                                                    className="flex gap-3"
                                                >
                                                    <div className={`mt-1 h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center ${getBgColor(notif.tipo)}`}>
                                                        {getIcon(notif.tipo)}
                                                    </div>
                                                    <div className="flex-1 min-w-0 pr-4">
                                                        <p className={`text-sm font-medium ${!notif.leida ? 'text-gray-900' : 'text-gray-700'}`}>
                                                            {notif.titulo}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                                            {notif.mensaje}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 mt-2">
                                                            {new Date(notif.created_at).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
