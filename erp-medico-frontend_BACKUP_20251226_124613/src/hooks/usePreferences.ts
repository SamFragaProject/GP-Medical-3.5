import { useEffect, useState, useCallback } from 'react'
import { User } from '@/types/auth'

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  startPage: string
  sidebarDensity: 'comfortable' | 'compact'
  dashboardWidgets: string[]
  language: 'es' | 'en'
  reducedMotion: boolean
}

const DEFAULT_PREFS: UserPreferences = {
  theme: 'light',
  startPage: '/dashboard',
  sidebarDensity: 'comfortable',
  dashboardWidgets: ['pacientes', 'citas', 'examenes', 'ingresos'],
  language: 'es',
  reducedMotion: false,
}

export function usePreferences(user: User | null) {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFS)
  const [loaded, setLoaded] = useState(false)

  // Load preferences for current user
  useEffect(() => {
    if (!user) {
      setPrefs(DEFAULT_PREFS)
      setLoaded(false)
      return
    }
    const key = `mediflow_prefs_${user.id}`
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        const parsed = JSON.parse(stored)
        setPrefs({ ...DEFAULT_PREFS, ...parsed })
      } else {
        localStorage.setItem(key, JSON.stringify(DEFAULT_PREFS))
      }
    } catch (e) {
      console.error('Error cargando preferencias', e)
    } finally {
      setLoaded(true)
    }
  }, [user])

  const updatePreferences = useCallback(<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPrefs(prev => {
      const next = { ...prev, [key]: value }
      if (user) {
        localStorage.setItem(`mediflow_prefs_${user.id}`, JSON.stringify(next))
      }
      return next
    })
  }, [user])

  const toggleWidget = useCallback((widgetId: string) => {
    setPrefs(prev => {
      const exists = prev.dashboardWidgets.includes(widgetId)
      const nextWidgets = exists ? prev.dashboardWidgets.filter(w => w !== widgetId) : [...prev.dashboardWidgets, widgetId]
      const next = { ...prev, dashboardWidgets: nextWidgets }
      if (user) {
        localStorage.setItem(`mediflow_prefs_${user.id}`, JSON.stringify(next))
      }
      return next
    })
  }, [user])

  return { prefs, loaded, updatePreferences, toggleWidget }
}
