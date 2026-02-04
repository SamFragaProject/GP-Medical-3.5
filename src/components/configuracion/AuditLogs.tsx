// Audit Logs del Sistema
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  User,
  Activity,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react'
import { useConfiguracion } from '@/hooks/useConfiguracion'
import { AuditLog } from '@/types/configuracion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'

// Datos simulados para demo
const generateSampleLogs = (): AuditLog[] => {
  const actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT', 'BACKUP', 'RESTORE']
  const resources = ['Usuario', 'Empresa', 'Protocolo', 'Configuración', 'Sistema', 'Facturación', 'Backup']
  const users = ['Dr. Carlos Mendoza', 'Dra. María González', 'Ing. Roberto Silva', 'Sistema']
  const ipAddresses = ['192.168.1.100', '10.0.0.50', '192.168.1.101', '192.168.1.102']
  
  const logs: AuditLog[] = []
  
  for (let i = 0; i < 50; i++) {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 30))
    date.setHours(Math.floor(Math.random() * 24))
    date.setMinutes(Math.floor(Math.random() * 60))
    
    logs.push({
      id: `log-${i}`,
      userId: `user-${Math.floor(Math.random() * 3) + 1}`,
      userName: users[Math.floor(Math.random() * users.length)],
      action: actions[Math.floor(Math.random() * actions.length)],
      resource: resources[Math.floor(Math.random() * resources.length)],
      details: {
        description: `Acción realizada en ${resources[Math.floor(Math.random() * resources.length)]}`,
        previousValue: Math.random() > 0.5 ? 'valor_anterior' : null,
        newValue: Math.random() > 0.5 ? 'nuevo_valor' : null,
        additionalInfo: `Información adicional del log ${i}`
      },
      ipAddress: ipAddresses[Math.floor(Math.random() * ipAddresses.length)],
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: date
    })
  }
  
  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

function LogDetailModal({ log, onOpenChange }: { log: AuditLog; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Detalles del Log</h2>
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha y hora
                </label>
                <p className="text-sm text-gray-900">{log.timestamp.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario
                </label>
                <p className="text-sm text-gray-900">{log.userName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Acción
                </label>
                <Badge variant={log.action === 'DELETE' ? 'destructive' : 'default'}>
                  {log.action}
                </Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recurso afectado
                </label>
                <p className="text-sm text-gray-900">{log.resource}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detalles de la acción
              </label>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección IP
                </label>
                <p className="text-sm text-gray-900">{log.ipAddress}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Navegador
                </label>
                <p className="text-sm text-gray-900 text-xs truncate" title={log.userAgent}>
                  {log.userAgent}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Dialog>
  )
}

function LogItem({ log, onView }: { log: AuditLog; onView: (log: AuditLog) => void }) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'UPDATE':
        return <Activity className="h-4 w-4 text-blue-600" />
      case 'DELETE':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'LOGIN':
        return <User className="h-4 w-4 text-green-600" />
      case 'LOGOUT':
        return <User className="h-4 w-4 text-gray-600" />
      case 'EXPORT':
      case 'IMPORT':
      case 'BACKUP':
      case 'RESTORE':
        return <Info className="h-4 w-4 text-purple-600" />
      default:
        return <Activity className="h-4 w-4 text-blue-600" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800'
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800'
      case 'DELETE':
        return 'bg-red-100 text-red-800'
      case 'LOGIN':
        return 'bg-green-100 text-green-800'
      case 'LOGOUT':
        return 'bg-gray-100 text-gray-800'
      case 'EXPORT':
      case 'IMPORT':
      case 'BACKUP':
      case 'RESTORE':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <motion.div
      whileHover={{ y: -1 }}
      className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer"
      onClick={() => onView(log)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="flex-shrink-0">
            {getActionIcon(log.action)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <Badge variant="secondary" className={getActionColor(log.action)}>
                {log.action}
              </Badge>
              <span className="text-sm font-medium text-gray-900">
                {log.resource}
              </span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-1">
              {log.details.description || 'Sin descripción disponible'}
            </p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <User size={12} />
                <span>{log.userName}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock size={12} />
                <span>{log.timestamp.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin size={12} />
                <span>{log.ipAddress}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onView(log)
            }}
          >
            <Eye size={14} />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export function AuditLogs() {
  const { settings } = useConfiguracion()
  const [logs] = useState<AuditLog[]>(generateSampleLogs())
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>(logs)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Obtener usuarios únicos para el filtro
  const uniqueUsers = [...new Set(logs.map(log => log.userName))].sort()
  const uniqueActions = [...new Set(logs.map(log => log.action))].sort()

  // Aplicar filtros
  React.useEffect(() => {
    let filtered = logs

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (actionFilter) {
      filtered = filtered.filter(log => log.action === actionFilter)
    }

    if (userFilter) {
      filtered = filtered.filter(log => log.userName === userFilter)
    }

    if (dateFilter) {
      const today = new Date()
      const filterDate = new Date()
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          filtered = filtered.filter(log => log.timestamp >= filterDate)
          break
        case 'week':
          filterDate.setDate(today.getDate() - 7)
          filtered = filtered.filter(log => log.timestamp >= filterDate)
          break
        case 'month':
          filterDate.setMonth(today.getMonth() - 1)
          filtered = filtered.filter(log => log.timestamp >= filterDate)
          break
      }
    }

    setFilteredLogs(filtered)
  }, [logs, searchTerm, actionFilter, userFilter, dateFilter])

  const handleViewLog = (log: AuditLog) => {
    setSelectedLog(log)
    setShowDetailModal(true)
  }

  const handleExport = () => {
    const csvContent = [
      ['Fecha', 'Usuario', 'Acción', 'Recurso', 'Descripción', 'IP'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp.toISOString(),
        log.userName,
        log.action,
        log.resource,
        log.details.description || '',
        log.ipAddress
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Estadísticas
  const stats = {
    total: logs.length,
    today: logs.filter(log => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return log.timestamp >= today
    }).length,
    actions: {
      CREATE: logs.filter(log => log.action === 'CREATE').length,
      UPDATE: logs.filter(log => log.action === 'UPDATE').length,
      DELETE: logs.filter(log => log.action === 'DELETE').length,
      LOGIN: logs.filter(log => log.action === 'LOGIN').length
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-1">
            Registro detallado de todas las acciones del sistema
          </p>
        </div>
        <Button onClick={handleExport} className="flex items-center space-x-2">
          <Download size={16} />
          <span>Exportar CSV</span>
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total logs</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
            <div className="text-sm text-gray-600">Hoy</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.actions.CREATE}</div>
            <div className="text-sm text-gray-600">Creaciones</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.actions.UPDATE}</div>
            <div className="text-sm text-gray-600">Actualizaciones</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.actions.LOGIN}</div>
            <div className="text-sm text-gray-600">Logins</div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en logs..."
              className="pl-10"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todas las acciones</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos los usuarios</option>
            {uniqueUsers.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todo el tiempo</option>
            <option value="today">Hoy</option>
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
          </select>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          Mostrando {filteredLogs.length} de {logs.length} registros
        </div>
      </Card>

      {/* Lista de logs */}
      <div className="space-y-3">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <LogItem log={log} onView={handleViewLog} />
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-600">No se encontraron logs que coincidan con los filtros</p>
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {showDetailModal && selectedLog && (
        <LogDetailModal
          log={selectedLog}
          onOpenChange={(open) => {
            if (!open) {
              setShowDetailModal(false)
              setSelectedLog(null)
            }
          }}
        />
      )}
    </div>
  )
}
