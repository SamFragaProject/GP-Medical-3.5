import { useEffect, useState } from 'react';
import { getFirebaseMessaging, getToken, onMessage } from '@/lib/firebase/config';
import { getSupabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export function usePushNotifications() {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const supabase = getSupabase();

  useEffect(() => {
    // Verificar si el navegador soporta notificaciones
    if (!('Notification' in window)) {
      console.log('Este navegador no soporta notificaciones');
      return;
    }

    setPermission(Notification.permission);
  }, []);

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        const messaging = getFirebaseMessaging();
        if (!messaging) return null;

        // Obtener token FCM
        const currentToken = await getToken(messaging, {
          vapidKey: VAPID_KEY,
        });

        if (currentToken) {
          setToken(currentToken);

          // Guardar token en Supabase
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from('usuarios')
              .update({ fcm_token: currentToken })
              .eq('id', user.id);
          }

          return currentToken;
        }
      }

      return null;
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      return null;
    }
  };

  // Escuchar mensajes en foreground
  useEffect(() => {
    const messaging = getFirebaseMessaging();
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Mensaje recibido:', payload);

      // Mostrar notificación con Sonner
      toast(payload.notification?.title || 'Nueva notificación', {
        description: payload.notification?.body,
        action: payload.data?.url ? {
          label: 'Ver',
          onClick: () => window.open(payload.data?.url, '_blank'),
        } : undefined,
      });
    });

    return () => unsubscribe();
  }, []);

  return {
    token,
    permission,
    requestPermission,
    isSupported: 'Notification' in window,
  };
}
