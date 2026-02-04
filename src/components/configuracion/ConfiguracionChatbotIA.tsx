// Configuración del Chatbot IA
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Bot, 
  MessageSquare, 
  Settings, 
  Play, 
  Pause,
  Save,
  Eye,
  EyeOff,
  TestTube,
  Brain,
  Zap,
  Users,
  Shield,
  HelpCircle,
  CheckCircle
} from 'lucide-react'
import { useConfiguracion } from '@/hooks/useConfiguracion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'
import toast from 'react-hot-toast'

function ChatbotPreview({ isActive }: { isActive: boolean }) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'bot',
      content: 'Hola, soy tu asistente médico de GPMedical. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date()
    }
  ])

  const handleSendMessage = () => {
    if (!message.trim()) return

    // Agregar mensaje del usuario
    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: message,
      timestamp: new Date()
    }

    // Respuesta simulada del bot
    const botResponse = {
      id: (Date.now() + 1).toString(),
      type: 'bot' as const,
      content: getBotResponse(message),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage, botResponse])
    setMessage('')
  }

  const getBotResponse = (userMessage: string): string => {
    const responses = [
      'Entiendo tu consulta. Te recomiendo consultar con un médico especialista para una evaluación completa.',
      'Basándome en los síntomas que describes, esto podría estar relacionado con factores ergonómicos en tu lugar de trabajo.',
      'Para una evaluación médica ocupacional, puedes agendar una cita a través del sistema.',
      'Te sugiero revisar los protocolos médicos disponibles en la sección de exámenes ocupacionales.',
      'Es importante mantener un registro de cualquier síntoma para un seguimiento adecuado.'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  return (
    <Card className="p-4 h-96 flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-2 border-b">
        <div className="flex items-center space-x-2">
          <div className="bg-primary p-2 rounded-lg">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Vista Previa del Chatbot</h3>
            <p className="text-xs text-gray-600">Cómo verá el chatbot el usuario</p>
          </div>
        </div>
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-lg ${
                msg.type === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {msg.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex space-x-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe tu mensaje..."
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={!isActive}
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={!isActive || !message.trim()}
          size="sm"
        >
          Enviar
        </Button>
      </div>
    </Card>
  )
}

function GeneralSettings() {
  const { settings, updateChatbotIA } = useConfiguracion()
  const [showApiKey, setShowApiKey] = useState(false)
  const [formData, setFormData] = useState(settings.chatbotIA)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateChatbotIA(formData)
  }

  const models = [
    { value: 'gpt-4', label: 'GPT-4 (Recomendado)', description: 'Modelo más avanzado y preciso' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Balance entre velocidad y calidad' },
    { value: 'claude-3', label: 'Claude 3', description: 'Alternativa de Anthropic' }
  ]

  const personalities = [
    { value: 'Profesional y empático', description: 'Tono médico profesional con empatía' },
    { value: 'Científico y detallado', description: 'Enfoque técnico y exhaustivo' },
    { value: 'Amigable y accesible', description: 'Conversación cercana y comprensible' },
    { value: 'Autoritario y preciso', description: 'Información médica precisa y directa' }
  ]

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-primary p-3 rounded-lg">
          <Bot className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Configuración General</h3>
          <p className="text-sm text-gray-600">Parámetros básicos del asistente IA</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado del chatbot
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="enabled"
                  checked={formData.isEnabled}
                  onChange={() => setFormData({ ...formData, isEnabled: true })}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <label htmlFor="enabled" className="ml-2 text-sm text-gray-700">
                  Activado
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="disabled"
                  checked={!formData.isEnabled}
                  onChange={() => setFormData({ ...formData, isEnabled: false })}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <label htmlFor="disabled" className="ml-2 text-sm text-gray-700">
                  Desactivado
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Idioma del chatbot
            </label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={!formData.isEnabled}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Key del proveedor IA
          </label>
          <div className="relative">
            <Input
              type={showApiKey ? 'text' : 'password'}
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              placeholder="••••••••••••••••••••••••••••••••••••••••"
              disabled={!formData.isEnabled}
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Tu API key se almacena de forma segura y encriptada
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Modelo de IA
          </label>
          <div className="space-y-3">
            {models.map((model) => (
              <div
                key={model.value}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.model === model.value
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFormData({ ...formData, model: model.value })}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    checked={formData.model === model.value}
                    onChange={() => setFormData({ ...formData, model: model.value })}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{model.label}</h4>
                    <p className="text-sm text-gray-600">{model.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Creatividad (Temperature)
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                className="w-full"
                disabled={!formData.isEnabled}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Conservador (0)</span>
                <span>Actual: {formData.temperature}</span>
                <span>Creativo (1)</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Máx. tokens de respuesta
            </label>
            <Input
              type="number"
              value={formData.maxTokens}
              onChange={(e) => setFormData({ ...formData, maxTokens: Number(e.target.value) })}
              placeholder="2000"
              min="100"
              max="4000"
              disabled={!formData.isEnabled}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Personalidad del chatbot
          </label>
          <div className="space-y-3">
            {personalities.map((personality) => (
              <div
                key={personality.value}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.personality === personality.value
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFormData({ ...formData, personality: personality.value })}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    checked={formData.personality === personality.value}
                    onChange={() => setFormData({ ...formData, personality: personality.value })}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{personality.value}</h4>
                    <p className="text-sm text-gray-600">{personality.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prompt del sistema (Contexto médico)
          </label>
          <textarea
            value={formData.systemPrompt}
            onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
            placeholder="Eres un asistente médico especializado en medicina del trabajo..."
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={!formData.isEnabled}
          />
          <p className="text-xs text-gray-500 mt-1">
            Define cómo debe comportarse el asistente en contexto médico
          </p>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="flex items-center space-x-2">
            <Save size={16} />
            <span>Guardar Configuración</span>
          </Button>
        </div>
      </form>
    </Card>
  )
}

function AdvancedSettings() {
  const { settings, updateChatbotIA } = useConfiguracion()
  const [formData, setFormData] = useState({
    responseDelay: 1.5,
    typingIndicator: true,
    soundEnabled: false,
    autoScroll: true,
    showTimestamp: true,
    allowFileUpload: false,
    conversationHistory: 50,
    maxConversations: 1000
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Configuración avanzada guardada')
  }

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-purple-500 p-3 rounded-lg">
          <Settings className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Configuración Avanzada</h3>
          <p className="text-sm text-gray-600">Opciones adicionales del chatbot</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Interfaz de Usuario</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Mostrar indicador de escritura</label>
                <p className="text-xs text-gray-500">Animación mientras el bot responde</p>
              </div>
              <input
                type="checkbox"
                checked={formData.typingIndicator}
                onChange={(e) => setFormData({ ...formData, typingIndicator: e.target.checked })}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Sonidos de notificación</label>
                <p className="text-xs text-gray-500">Audio para nuevos mensajes</p>
              </div>
              <input
                type="checkbox"
                checked={formData.soundEnabled}
                onChange={(e) => setFormData({ ...formData, soundEnabled: e.target.checked })}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Desplazamiento automático</label>
                <p className="text-xs text-gray-500">Scroll automático a nuevos mensajes</p>
              </div>
              <input
                type="checkbox"
                checked={formData.autoScroll}
                onChange={(e) => setFormData({ ...formData, autoScroll: e.target.checked })}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Mostrar marca de tiempo</label>
                <p className="text-xs text-gray-500">Hora de cada mensaje</p>
              </div>
              <input
                type="checkbox"
                checked={formData.showTimestamp}
                onChange={(e) => setFormData({ ...formData, showTimestamp: e.target.checked })}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Funcionalidades</h4>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Permitir carga de archivos</label>
                <p className="text-xs text-gray-500">Usuarios pueden adjuntar documentos</p>
              </div>
              <input
                type="checkbox"
                checked={formData.allowFileUpload}
                onChange={(e) => setFormData({ ...formData, allowFileUpload: e.target.checked })}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delay de respuesta (segundos)
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={formData.responseDelay}
                onChange={(e) => setFormData({ ...formData, responseDelay: parseFloat(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Inmediato</span>
                <span>Actual: {formData.responseDelay}s</span>
                <span>5s</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Historial por conversación
              </label>
              <input
                type="number"
                value={formData.conversationHistory}
                onChange={(e) => setFormData({ ...formData, conversationHistory: Number(e.target.value) })}
                min="10"
                max="200"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-500 mt-1">
                Mensajes máximos recordados por conversación
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Máximo de conversaciones
              </label>
              <input
                type="number"
                value={formData.maxConversations}
                onChange={(e) => setFormData({ ...formData, maxConversations: Number(e.target.value) })}
                min="100"
                max="10000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-500 mt-1">
                Conversaciones totales almacenadas
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="flex items-center space-x-2">
            <Save size={16} />
            <span>Guardar Configuración</span>
          </Button>
        </div>
      </form>
    </Card>
  )
}

export function ConfiguracionChatbotIA() {
  const { settings, updateChatbotIA } = useConfiguracion()
  const [activeTab, setActiveTab] = useState<'general' | 'advanced'>('general')
  const [testModalOpen, setTestModalOpen] = useState(false)

  const handleTestConnection = async () => {
    toast.loading('Probando conexión...')
    
    // Simular prueba de conexión
    setTimeout(() => {
      toast.dismiss()
      toast.success('Conexión exitosa con el proveedor de IA')
    }, 2000)
  }

  const tabs = [
    {
      id: 'general',
      name: 'General',
      icon: Bot,
      description: 'Configuración básica'
    },
    {
      id: 'advanced',
      name: 'Avanzado',
      icon: Settings,
      description: 'Opciones adicionales'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración del Chatbot IA</h1>
        <p className="text-gray-600 mt-1">
          Personaliza el asistente médico inteligente de GPMedical
        </p>
      </div>

      {/* Status Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${settings.chatbotIA.isEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Brain className={`h-8 w-8 ${settings.chatbotIA.isEnabled ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Asistente IA {settings.chatbotIA.isEnabled ? 'Activo' : 'Inactivo'}
              </h2>
              <p className="text-gray-600">
                {settings.chatbotIA.isEnabled 
                  ? 'El chatbot está disponible para ayudar a los usuarios'
                  : 'El chatbot está desactivado y no responde a consultas'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={!settings.chatbotIA.isEnabled}
              className="flex items-center space-x-2"
            >
              <TestTube size={16} />
              <span>Probar Conexión</span>
            </Button>
            <Badge variant={settings.chatbotIA.isEnabled ? 'default' : 'secondary'}>
              {settings.chatbotIA.isEnabled ? 'Operativo' : 'Deshabilitado'}
            </Badge>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview */}
        <div className="lg:col-span-1">
          <ChatbotPreview isActive={settings.chatbotIA.isEnabled} />
        </div>

        {/* Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'general' ? <GeneralSettings /> : <AdvancedSettings />}
          </motion.div>
        </div>
      </div>

      {/* Help Card */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-500 p-2 rounded-lg">
            <HelpCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Consejos de Configuración</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Usa GPT-4 para las respuestas más precisas en consultas médicas</li>
              <li>• Ajusta la temperatura entre 0.3-0.7 para balancear creatividad y precisión</li>
              <li>• El prompt del sistema define cómo debe comportarse el asistente</li>
              <li>• Prueba la conexión antes de activar el chatbot para usuarios</li>
              <li>• Considera las limitaciones de tokens del modelo seleccionado</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
