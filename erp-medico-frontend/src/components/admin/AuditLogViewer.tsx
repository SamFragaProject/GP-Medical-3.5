/**
 * MediFlow ERP - Audit Log Viewer Component
 * For Super Admin to view system-wide audit trail
 */

import React, { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import {
    Eye,
    Edit,
    Trash2,
    Plus,
    Download,
    ArrowLeftRight,
    Shield,
    User,
    Calendar,
    RefreshCw,
    Filter,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    Search
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Skeleton } from '@/components/ui/skeleton'

// ============================================================
// TYPES
// ============================================================

interface AuditLogRecord {
    id: string
    entity_type: string
    entity_id: string
    action: string
    user_id: string | null
    user_email: string | null
    user_role: string | null
    timestamp: string
    ip_address: string | null
    user_agent: string | null
    old_values: Record<string, unknown> | null
    new_values: Record<string, unknown> | null
    changes: Record<string, { old: unknown; new: unknown }> | null
    empresa_id: string | null
    notes: string | null
}

interface AuditLogFilters {
    entityType?: string
    action?: string
    userId?: string
    dateFrom?: string
    dateTo?: string
    search?: string
}

// ============================================================
// CONSTANTS
// ============================================================

const ACTION_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    CREATE: { icon: Plus, color: 'green', label: 'Crear' },
    READ: { icon: Eye, color: 'blue', label: 'Ver' },
    UPDATE: { icon: Edit, color: 'yellow', label: 'Editar' },
    DELETE: { icon: Trash2, color: 'red', label: 'Eliminar' },
    VIEW: { icon: Eye, color: 'blue', label: 'Ver' },
    EXPORT: { icon: Download, color: 'purple', label: 'Exportar' },
    TRANSITION: { icon: ArrowLeftRight, color: 'orange', label: 'Transición' },
    LOGIN: { icon: User, color: 'green', label: 'Login' },
    LOGOUT: { icon: User, color: 'gray', label: 'Logout' },
    PERMISSION_DENIED: { icon: Shield, color: 'red', label: 'Acceso Denegado' }
}

const ENTITY_LABELS: Record<string, string> = {
    cita: 'Cita',
    consulta: 'Consulta',
    paciente: 'Paciente',
    factura: 'Factura',
    receta: 'Receta',
    orden_laboratorio: 'Orden Lab',
    empleado: 'Empleado',
    vacaciones: 'Vacaciones',
    inventario: 'Inventario',
    usuario: 'Usuario',
    empresa: 'Empresa',
    session: 'Sesión'
}

// ============================================================
// COMPONENT
// ============================================================

export function AuditLogViewer() {
    const [logs, setLogs] = useState<AuditLogRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filters, setFilters] = useState<AuditLogFilters>({})
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)

    const PAGE_SIZE = 25

    const loadLogs = useCallback(async (reset = false) => {
        setLoading(true)
        setError(null)

        try {
            let query = supabase
                .from('audit_log')
                .select('*')
                .order('timestamp', { ascending: false })
                .range(reset ? 0 : page * PAGE_SIZE, (reset ? 0 : page) * PAGE_SIZE + PAGE_SIZE - 1)

            // Apply filters
            if (filters.entityType) {
                query = query.eq('entity_type', filters.entityType)
            }
            if (filters.action) {
                query = query.eq('action', filters.action)
            }
            if (filters.userId) {
                query = query.eq('user_id', filters.userId)
            }
            if (filters.dateFrom) {
                query = query.gte('timestamp', filters.dateFrom)
            }
            if (filters.dateTo) {
                query = query.lte('timestamp', filters.dateTo)
            }
            if (filters.search) {
                query = query.or(`user_email.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`)
            }

            const { data, error: fetchError } = await query

            if (fetchError) throw fetchError

            if (reset) {
                setLogs(data || [])
                setPage(0)
            } else {
                setLogs(prev => [...prev, ...(data || [])])
            }

            setHasMore((data?.length || 0) === PAGE_SIZE)
        } catch (err: any) {
            console.error('Error loading audit logs:', err)
            setError(err.message || 'Error al cargar logs')
        } finally {
            setLoading(false)
        }
    }, [filters, page])

    useEffect(() => {
        loadLogs(true)
    }, [filters])

    const toggleRow = (id: string) => {
        setExpandedRows(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(new Date(dateString))
    }

    const getActionBadge = (action: string) => {
        const config = ACTION_CONFIG[action] || { icon: AlertCircle, color: 'gray', label: action }
        const Icon = config.icon

        const colorClasses: Record<string, string> = {
            green: 'bg-green-100 text-green-700',
            blue: 'bg-blue-100 text-blue-700',
            yellow: 'bg-yellow-100 text-yellow-700',
            red: 'bg-red-100 text-red-700',
            purple: 'bg-purple-100 text-purple-700',
            orange: 'bg-orange-100 text-orange-700',
            gray: 'bg-gray-100 text-gray-700'
        }

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colorClasses[config.color]}`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </span>
        )
    }

    return (
        <Card className="w-full">
            <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-500" />
                        Registro de Auditoría
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => loadLogs(true)}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Buscar por email o notas..."
                            className="pl-9"
                            value={filters.search || ''}
                            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                        />
                    </div>

                    <Select
                        value={filters.entityType || 'all'}
                        onValueChange={(v) => setFilters(f => ({ ...f, entityType: v === 'all' ? undefined : v }))}
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Entidad" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {Object.entries(ENTITY_LABELS).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.action || 'all'}
                        onValueChange={(v) => setFilters(f => ({ ...f, action: v === 'all' ? undefined : v }))}
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Acción" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {Object.entries(ACTION_CONFIG).map(([key, config]) => (
                                <SelectItem key={key} value={key}>{config.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Input
                        type="date"
                        className="w-[150px]"
                        value={filters.dateFrom || ''}
                        onChange={(e) => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                        placeholder="Desde"
                    />
                    <Input
                        type="date"
                        className="w-[150px]"
                        value={filters.dateTo || ''}
                        onChange={(e) => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                        placeholder="Hasta"
                    />
                </div>
            </CardHeader>

            <CardContent>
                {error ? (
                    <div className="text-center py-8 text-red-500">
                        <AlertCircle className="w-10 h-10 mx-auto mb-2" />
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[40px]"></TableHead>
                                    <TableHead>Fecha/Hora</TableHead>
                                    <TableHead>Acción</TableHead>
                                    <TableHead>Entidad</TableHead>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead>Rol</TableHead>
                                    <TableHead>Notas</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && logs.length === 0 ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={7}>
                                                <Skeleton className="h-10 w-full" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                            No se encontraron registros
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <React.Fragment key={log.id}>
                                            <TableRow
                                                className="cursor-pointer hover:bg-gray-50"
                                                onClick={() => toggleRow(log.id)}
                                            >
                                                <TableCell>
                                                    {expandedRows.has(log.id) ? (
                                                        <ChevronUp className="w-4 h-4 text-gray-400" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600 whitespace-nowrap">
                                                    {formatDate(log.timestamp)}
                                                </TableCell>
                                                <TableCell>{getActionBadge(log.action)}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-xs">
                                                        {ENTITY_LABELS[log.entity_type] || log.entity_type}
                                                    </Badge>
                                                    <span className="ml-2 text-xs text-gray-400 font-mono">
                                                        {log.entity_id.slice(0, 8)}...
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {log.user_email || <span className="text-gray-400 italic">Sistema</span>}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {log.user_role || '-'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate text-sm text-gray-500">
                                                    {log.notes || '-'}
                                                </TableCell>
                                            </TableRow>

                                            {/* Expanded Details */}
                                            {expandedRows.has(log.id) && (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="bg-gray-50 p-4">
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            className="space-y-4"
                                                        >
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                                <div>
                                                                    <span className="text-gray-500 block">ID Completo:</span>
                                                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{log.entity_id}</code>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500 block">User ID:</span>
                                                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{log.user_id || 'N/A'}</code>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500 block">IP:</span>
                                                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{log.ip_address || 'N/A'}</code>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500 block">User Agent:</span>
                                                                    <span className="text-xs text-gray-600 line-clamp-2">{log.user_agent || 'N/A'}</span>
                                                                </div>
                                                            </div>

                                                            {log.changes && Object.keys(log.changes).length > 0 && (
                                                                <div>
                                                                    <span className="text-gray-500 block mb-2 font-medium">Cambios:</span>
                                                                    <div className="bg-white border rounded-lg p-3 space-y-2">
                                                                        {Object.entries(log.changes).map(([field, { old: oldVal, new: newVal }]) => (
                                                                            <div key={field} className="flex items-center gap-2 text-sm">
                                                                                <span className="font-medium text-gray-700">{field}:</span>
                                                                                <code className="bg-red-50 text-red-700 px-2 py-0.5 rounded line-through">
                                                                                    {JSON.stringify(oldVal)}
                                                                                </code>
                                                                                <span className="text-gray-400">→</span>
                                                                                <code className="bg-green-50 text-green-700 px-2 py-0.5 rounded">
                                                                                    {JSON.stringify(newVal)}
                                                                                </code>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Load More */}
                {hasMore && logs.length > 0 && (
                    <div className="text-center pt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setPage(p => p + 1)
                                loadLogs(false)
                            }}
                            disabled={loading}
                        >
                            {loading ? 'Cargando...' : 'Cargar más'}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
