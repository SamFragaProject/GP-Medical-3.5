import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';

// Tipos
interface EmpresaEnvio {
  id: string;
  nombre: string;
  logo: string;
  precio: number;
  tiempoEstimado: number;
  disponible: boolean;
  rating: number;
}

interface EstadoEnvio {
  id: string;
  nombre: string;
  iconos: string;
  color: string;
  completado: boolean;
}

interface NotificacionEnvio {
  id: string;
  mensaje: string;
  timestamp: Date;
  tipo: 'info' | 'success' | 'warning' | 'error';
}

// Empresas de envío disponibles en Querétaro
const EMPRESAS_ENVIO: EmpresaEnvio[] = [
  {
    id: 'rappi',
    nombre: 'Rappi',
    logo: '🏃‍♂️',
    precio: 45,
    tiempoEstimado: 25,
    disponible: true,
    rating: 4.8
  },
  {
    id: 'dhl',
    nombre: 'DHL Express',
    logo: '📦',
    precio: 80,
    tiempoEstimado: 120,
    disponible: true,
    rating: 4.5
  },
  {
    id: 'fedex',
    nombre: 'FedEx',
    logo: '🚛',
    precio: 75,
    tiempoEstimado: 180,
    disponible: true,
    rating: 4.6
  },
  {
    id: 'uber-eats',
    nombre: 'Uber Eats',
    logo: '🍔',
    precio: 40,
    tiempoEstimado: 30,
    disponible: false,
    rating: 4.7
  },
  {
    id: 'estafeta',
    nombre: 'Estafeta',
    logo: '📮',
    precio: 55,
    tiempoEstimado: 240,
    disponible: true,
    rating: 4.3
  }
];

// Estados del envío
const ESTADOS_ENVIO: EstadoEnvio[] = [
  { id: 'pendiente', nombre: 'Pendiente de recolección', iconos: '📋', color: 'bg-yellow-500', completado: false },
  { id: 'recolectado', nombre: 'Recolectado', iconos: '📦', color: 'bg-blue-500', completado: false },
  { id: 'transito', nombre: 'En tránsito', iconos: '🚚', color: 'bg-purple-500', completado: false },
  { id: 'entregado', nombre: 'Entregado', iconos: '✅', color: 'bg-green-500', completado: false }
];

const SistemaEnvios: React.FC = () => {
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<EmpresaEnvio | null>(null);
  const [direccion, setDireccion] = useState('');
  const [envioActivo, setEnvioActivo] = useState<any>(null);
  const [estadoActual, setEstadoActual] = useState<EstadoEnvio | null>(null);
  const [notificaciones, setNotificaciones] = useState<NotificacionEnvio[]>([]);
  const [mostrarTracking, setMostrarTracking] = useState(false);
  const [mapaSimulado, setMapaSimulado] = useState(false);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);

  // Coordenadas simuladas para Querétaro
  const COORDENADAS_QUERETARO = {
    centro: { lat: 20.5888, lng: -100.3899 },
    direccionActual: { lat: 20.5888, lng: -100.3899 },
    destino: { lat: 20.6153, lng: -100.4017 }
  };

  // Iniciar envío
  const iniciarEnvio = useCallback(() => {
    if (!empresaSeleccionada || !direccion.trim()) return;

    const nuevoEnvio = {
      id: Math.random().toString(36).substr(2, 9),
      empresa: empresaSeleccionada,
      direccion,
      fechaInicio: new Date(),
      estado: 'pendiente'
    };

    setEnvioActivo(nuevoEnvio);
    setEstadoActual(ESTADOS_ENVIO[0]);
    
    // Agregar notificación inicial
    agregarNotificacion({
      mensaje: `Envío iniciado con ${empresaSeleccionada.nombre}`,
      tipo: 'info' as const
    });

    setMostrarTracking(true);
  }, [empresaSeleccionada, direccion]);

  // Simular progreso del envío
  useEffect(() => {
    if (!envioActivo || !estadoActual) return;

    const interval = setInterval(() => {
      setTiempoTranscurrido(prev => prev + 1);
      
      // Simular cambio de estado basado en tiempo
      if (tiempoTranscurrido === 300) { // 5 minutos
        cambiarEstado('recolectado');
        agregarNotificacion({
          mensaje: 'Paquete recolectado exitosamente',
          tipo: 'success' as const
        });
      } else if (tiempoTranscurrido === 600) { // 10 minutos
        cambiarEstado('transito');
        agregarNotificacion({
          mensaje: 'Paquete en tránsito hacia destino',
          tipo: 'info' as const
        });
      } else if (tiempoTranscurrido === 900) { // 15 minutos
        cambiarEstado('entregado');
        agregarNotificacion({
          mensaje: '¡Paquete entregado exitosamente!',
          tipo: 'success' as const
        });
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [envioActivo, estadoActual, tiempoTranscurrido]);

  // Cambiar estado del envío
  const cambiarEstado = (nuevoEstado: string) => {
    const estado = ESTADOS_ENVIO.find(e => e.id === nuevoEstado);
    if (estado) {
      setEstadoActual(estado);
    }
  };

  // Agregar notificación
  const agregarNotificacion = (notificacion: Omit<NotificacionEnvio, 'id' | 'timestamp'>) => {
    const nuevaNotificacion: NotificacionEnvio = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      ...notificacion
    };
    setNotificaciones(prev => [nuevaNotificacion, ...prev]);
  };

  // Formatear tiempo
  const formatearTiempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calcular tiempo restante estimado
  const calcularTiempoRestante = () => {
    if (!empresaSeleccionada || !envioActivo) return 0;
    const tiempoTotal = empresaSeleccionada.tiempoEstimado * 60; // Convertir a segundos
    return Math.max(0, tiempoTotal - tiempoTranscurrido);
  };

  // Renderizar mapa simulado
  const renderMapaSimulado = () => (
    <div className="relative w-full h-64 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <div className="text-sm font-medium text-gray-600">
            Mapa interactivo - Querétaro
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Simulación de ubicación en tiempo real
          </div>
        </div>
      </div>
      
      {/* Marcadores simulados */}
      <div className="absolute top-1/4 left-1/4 animate-bounce">
        <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg"></div>
        <div className="text-xs font-bold mt-1 text-center">📍 Origen</div>
      </div>
      
      <div className="absolute bottom-1/4 right-1/4 animate-pulse">
        <div className="w-4 h-4 bg-green-500 rounded-full shadow-lg"></div>
        <div className="text-xs font-bold mt-1 text-center">🏁 Destino</div>
      </div>
      
      {/* Ruta simulada */}
      <div className="absolute inset-0">
        <svg className="w-full h-full">
          <path
            d="M 80 80 Q 200 100 320 180"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeDasharray="5,5"
            fill="none"
            className="animate-pulse"
          />
        </svg>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
          🚚 Sistema de Envíos Rápidos
        </h1>
        <p className="text-gray-600">Servicio especializado para Querétaro - Entregas en el mismo día</p>
      </div>

      <Tabs defaultValue="crear" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="crear">Crear Envío</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        {/* Crear Envío */}
        <TabsContent value="crear" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              📍 Nueva Solicitud de Envío
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Dirección de entrega en Querétaro:</label>
                <Input
                  placeholder="Ej: Av. Tecnológico 123, Querétaro, Qro."
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Seleccionar empresa de envío:</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {EMPRESAS_ENVIO.map((empresa) => (
                    <Card
                      key={empresa.id}
                      className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                        empresaSeleccionada?.id === empresa.id 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      } ${!empresa.disponible ? 'opacity-50' : ''}`}
                      onClick={() => empresa.disponible && setEmpresaSeleccionada(empresa)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-2xl">{empresa.logo}</div>
                        <Badge variant={empresa.disponible ? 'default' : 'secondary'}>
                          {empresa.disponible ? 'Disponible' : 'No disponible'}
                        </Badge>
                      </div>
                      <div className="font-medium">{empresa.nombre}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        ⏱️ {empresa.tiempoEstimado} min • 💰 ${empresa.precio} MXN
                      </div>
                      <div className="text-xs text-yellow-600 mt-1">
                        ⭐ {empresa.rating}/5.0
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {empresaSeleccionada && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <h3 className="font-medium mb-2">📊 Resumen del envío:</h3>
                  <div className="space-y-1 text-sm">
                    <div>🏢 Empresa: {empresaSeleccionada.nombre}</div>
                    <div>💰 Costo: ${empresaSeleccionada.precio} MXN</div>
                    <div>⏱️ Tiempo estimado: {empresaSeleccionada.tiempoEstimado} minutos</div>
                    <div>📍 Zona: Querétaro, Qro.</div>
                  </div>
                </Card>
              )}

              <Button
                onClick={iniciarEnvio}
                disabled={!empresaSeleccionada || !direccion.trim()}
                className="w-full"
                size="lg"
              >
                🚀 Iniciar Envío
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Tracking */}
        <TabsContent value="tracking" className="space-y-6">
          {envioActivo ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Estado del envío */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  📊 Estado del Envío #{envioActivo.id}
                </h2>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl mb-2">{estadoActual?.iconos}</div>
                    <Badge className={`${estadoActual?.color} text-white`}>
                      {estadoActual?.nombre}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Tiempo transcurrido:</div>
                      <div className="font-mono text-lg">{formatearTiempo(tiempoTranscurrido)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Tiempo restante estimado:</div>
                      <div className="font-mono text-lg">{formatearTiempo(calcularTiempoRestante())}</div>
                    </div>
                  </div>

                  {/* Timeline de estados */}
                  <div className="space-y-3 mt-6">
                    <h3 className="font-medium">Progreso del envío:</h3>
                    {ESTADOS_ENVIO.map((estado, index) => {
                      const completado = tiempoTranscurrido >= (index + 1) * 300;
                      return (
                        <div key={estado.id} className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            completado ? estado.color : 'bg-gray-200'
                          }`}>
                            <span className="text-sm">{estado.iconos}</span>
                          </div>
                          <div className={`flex-1 ${completado ? 'font-medium' : 'text-gray-500'}`}>
                            {estado.nombre}
                          </div>
                          {completado && (
                            <div className="text-green-600 text-sm">✓</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>

              {/* Mapa y ubicación */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    🗺️ Ubicación en Tiempo Real
                  </h2>
                  <Button
                    onClick={() => setMapaSimulado(true)}
                    variant="outline"
                    size="sm"
                  >
                    Ver mapa completo
                  </Button>
                </div>
                
                {renderMapaSimulado()}
                
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Origen:</span>
                    <span>Farmacia Central, Querétaro</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Destino:</span>
                    <span>{direccion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Repartidor:</span>
                    <span>En camino...</span>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium mb-2">No hay envíos activos</h3>
              <p className="text-gray-600">Crea un nuevo envío para comenzar el tracking</p>
            </Card>
          )}

          {/* Notificaciones */}
          {notificaciones.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                🔔 Notificaciones
              </h2>
              <div className="space-y-3">
                {notificaciones.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      notif.tipo === 'success' ? 'border-green-500 bg-green-50' :
                      notif.tipo === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                      notif.tipo === 'error' ? 'border-red-500 bg-red-50' :
                      'border-blue-500 bg-blue-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>{notif.mensaje}</div>
                      <div className="text-xs text-gray-500">
                        {notif.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Historial */}
        <TabsContent value="historial" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              📋 Historial de Envíos
            </h2>
            <div className="text-center text-gray-600">
              <div className="text-4xl mb-2">📊</div>
              <p>Funcionalidad de historial próximamente</p>
              <p className="text-sm">Aquí podrás ver todos tus envíos anteriores</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog del mapa */}
      <Dialog open={mapaSimulado} onOpenChange={setMapaSimulado}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Mapa Interactivo - Envío en Tiempo Real</DialogTitle>
          </DialogHeader>
          <div className="h-96">
            {renderMapaSimulado()}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-sm space-y-2">
              <div><strong>Empresa:</strong> {envioActivo?.empresa?.nombre}</div>
              <div><strong>Estado:</strong> {estadoActual?.nombre}</div>
              <div><strong>Dirección:</strong> {direccion}</div>
            </div>
            <div className="text-sm space-y-2">
              <div><strong>Precio:</strong> ${envioActivo?.empresa?.precio} MXN</div>
              <div><strong>Tiempo estimado:</strong> {envioActivo?.empresa?.tiempoEstimado} min</div>
              <div><strong>Tiempo transcurrido:</strong> {formatearTiempo(tiempoTranscurrido)}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SistemaEnvios;
