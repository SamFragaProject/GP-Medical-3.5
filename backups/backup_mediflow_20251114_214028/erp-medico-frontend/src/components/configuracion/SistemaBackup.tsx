// Sistema de Backup y Restore
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Database, 
  Download, 
  Upload, 
  Clock, 
  HardDrive,
  Calendar,
  Settings,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Info
} from 'lucide-react'
import { useConfiguracion } from '@/hooks/useConfiguracion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'
import toast from 'react-hot-toast'

function BackupProgress() {
  const { settings, performBackup } = useConfiguracion()
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleManualBackup = async () => {
    setIsRunning(true)
    setProgress(0)
    
    // Simular progreso de backup
    const intervals = [
      { progress: 20, message: 'Preparando datos...' },
      { progress: 40, message: 'Comprimiendo archivos...' },
      { progress: 60, message: 'Encriptando backup...' },
      { progress: 80, message: 'Subiendo al servidor...' },
      { progress: 100, message: 'Backup completado' }
    ]

    for (const interval of intervals) {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setProgress(interval.progress)
      if (interval.progress === 100) {
        performBackup()
        toast.success('Backup manual completado exitosamente')
      }
    }
    
    setIsRunning(false)
  }

  const nextBackupInDays = settings.backup.nextBackup 
    ? Math.ceil((settings.backup.nextBackup.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const isOverdue = nextBackupInDays < 0

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-primary p-3 rounded-lg">
            <Database className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Backup Automático</h3>
            <p className="text-sm text-gray-600">
              Sistema de respaldo automático configurado
            </p>
          </div>
        </div>
        <Badge variant={settings.backup.autoBackup ? 'default' : 'secondary'}>
          {settings.backup.autoBackup ? 'Activo' : 'Inactivo'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary mb-1">
            {settings.backup.frequency}
          </div>
          <div className="text-sm text-gray-600">Frecuencia</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold mb-1 ${isOverdue ? 'text-red-600' : 'text-green-600'}`}>
            {Math.abs(nextBackupInDays)}d
          </div>
          <div className="text-sm text-gray-600">
            {isOverdue ? 'Vencido hace' : 'Próximo en'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {settings.backup.retentionDays}
          </div>
          <div className="text-sm text-gray-600">Días de retención</div>
        </div>
      </div>

      {isRunning && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Creando backup...</span>
            <span className="text-sm text-gray-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {settings.backup.lastBackup && (
            <div className="text-sm text-gray-600">
              Último backup: {settings.backup.lastBackup.toLocaleString()}
            </div>
          )}
          {isOverdue && (
            <Badge variant="destructive" className="flex items-center space-x-1">
              <AlertTriangle size={12} />
              <span>Backup pendiente</span>
            </Badge>
          )}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleManualBackup}
            disabled={isRunning}
            className="flex items-center space-x-2"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Backup Manual</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}

function BackupHistory() {
  const { settings } = useConfiguracion()
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null)

  // Simular historial de backups
  const backupHistory = [
    {
      id: '1',
      date: new Date('2024-03-15'),
      size: '45.2 MB',
      status: 'completed',
      type: 'automatic',
      filename: 'mediflow-backup-2024-03-15.json'
    },
    {
      id: '2',
      date: new Date('2024-03-14'),
      size: '44.8 MB',
      status: 'completed',
      type: 'automatic',
      filename: 'mediflow-backup-2024-03-14.json'
    },
    {
      id: '3',
      date: new Date('2024-03-13'),
      size: '44.5 MB',
      status: 'completed',
      type: 'manual',
      filename: 'mediflow-backup-2024-03-13-manual.json'
    }
  ]

  const handleRestore = (backupId: string) => {
    setSelectedBackup(backupId)
    setShowRestoreModal(true)
  }

  const confirmRestore = () => {
    toast.success('Restauración iniciada. El sistema estará disponible en unos minutos.')
    setShowRestoreModal(false)
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500 p-3 rounded-lg">
            <HardDrive className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Historial de Backups</h3>
            <p className="text-sm text-gray-600">Respaldos disponibles para restauración</p>
          </div>
        </div>
        <Button variant="outline" className="flex items-center space-x-2">
          <Upload className="h-4 w-4" />
          <span>Importar Backup</span>
        </Button>
      </div>

      <div className="space-y-4">
        {backupHistory.map((backup) => (
          <div
            key={backup.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">
                  Backup del {backup.date.toLocaleDateString()}
                </h4>
                <p className="text-sm text-gray-600">{backup.filename}</p>
                <div className="flex items-center space-x-3 mt-1">
                  <Badge variant="outline">{backup.type}</Badge>
                  <span className="text-xs text-gray-500">{backup.size}</span>
                  <span className="text-xs text-gray-500">
                    {backup.date.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRestore(backup.id)}
                className="flex items-center space-x-1"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Restaurar</span>
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showRestoreModal} onOpenChange={(open) => !open && setShowRestoreModal(false)}>
        <div className="max-w-md mx-auto">
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Confirmar Restauración</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              Esta acción sobrescribirá todos los datos actuales con el backup seleccionado. 
              Se recomienda crear un backup manual antes de continuar.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Advertencia</p>
                  <p>Esta acción no se puede deshacer. Asegúrate de tener una copia de seguridad actual.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowRestoreModal(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmRestore}
                className="bg-red-600 hover:bg-red-700"
              >
                Confirmar Restauración
              </Button>
            </div>
          </Card>
        </div>
      </Dialog>
    </Card>
  )
}

function BackupSettings() {
  const { settings, updateBackup } = useConfiguracion()
  const [formData, setFormData] = useState({
    autoBackup: settings.backup.autoBackup,
    frequency: settings.backup.frequency,
    retentionDays: settings.backup.retentionDays,
    backupLocation: settings.backup.backupLocation
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateBackup(formData)
  }

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gray-500 p-3 rounded-lg">
          <Settings className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Configuración de Backup</h3>
          <p className="text-sm text-gray-600">Ajusta los parámetros del sistema de respaldo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="autoBackup"
            checked={formData.autoBackup}
            onChange={(e) => setFormData({ ...formData, autoBackup: e.target.checked })}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="autoBackup" className="ml-2 text-sm text-gray-700">
            Habilitar backup automático
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frecuencia de backup
            </label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={!formData.autoBackup}
            >
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Días de retención
            </label>
            <Input
              type="number"
              value={formData.retentionDays}
              onChange={(e) => setFormData({ ...formData, retentionDays: Number(e.target.value) })}
              placeholder="30"
              min="1"
              max="365"
              disabled={!formData.autoBackup}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ubicación de backups
          </label>
          <Input
            value={formData.backupLocation}
            onChange={(e) => setFormData({ ...formData, backupLocation: e.target.value })}
            placeholder="/backups/mediflow"
            disabled={!formData.autoBackup}
          />
          <p className="text-xs text-gray-500 mt-1">
            Ruta donde se almacenarán los archivos de backup
          </p>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Guardar Configuración</span>
          </Button>
        </div>
      </form>
    </Card>
  )
}

export function SistemaBackup() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sistema de Backup</h1>
        <p className="text-gray-600 mt-1">
          Gestiona los respaldos automáticos y manuales del sistema
        </p>
      </div>

      {/* Info Card */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-500 p-2 rounded-lg">
            <Info className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Información sobre Backups</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Los backups incluyen configuraciones, datos de usuarios y configuraciones del sistema</li>
              <li>• Se recomienda mantener al menos 30 días de backups históricos</li>
              <li>• Los backups manuales son útiles antes de actualizaciones importantes</li>
              <li>• La restauración puede tardar varios minutos dependiendo del tamaño</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Backup Progress */}
      <BackupProgress />

      {/* Backup History */}
      <BackupHistory />

      {/* Backup Settings */}
      <BackupSettings />
    </div>
  )
}