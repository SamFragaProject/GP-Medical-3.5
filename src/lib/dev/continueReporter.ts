// Lightweight client to push structured events/errors to the local continue-feed server
// All entries are appended to .continue/analysis-feed.md and .continue/analysis-feed.ndjson

interface ContinueEntry {
  type?: string
  level?: 'info' | 'warn' | 'error'
  message?: string
  data?: any
  path?: string
  timestamp?: number
}

const ENDPOINT = 'http://localhost:5051/report'

export async function reportContinue(entry: ContinueEntry) {
  try {
    await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: entry.type || 'event',
        level: entry.level || 'info',
        message: entry.message || '',
        data: entry.data || null,
        path: entry.path || (typeof window !== 'undefined' ? window.location.pathname : ''),
        timestamp: entry.timestamp || Date.now()
      })
    })
  } catch (e) {
    // Silenciar errores de red para no romper la UI
    // console.debug('continue reporter failed', e)
  }
}

// Helper específicos
export const reportError = (message: string, data?: any) => reportContinue({ type: 'error', level: 'error', message, data })
export const reportWarn = (message: string, data?: any) => reportContinue({ type: 'warn', level: 'warn', message, data })
export const reportEvent = (message: string, data?: any) => reportContinue({ type: 'event', level: 'info', message, data })
