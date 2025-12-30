// Simple feature flag utility for local development
// Reads from Vite env (VITE_HC_RX_V2) or localStorage('HC_RX_V2')

export function isHcRxV2Enabled(): boolean {
  try {
    // Prefer localStorage override for quick toggling during dev
    if (typeof window !== 'undefined') {
      const ls = window.localStorage.getItem('HC_RX_V2')
      if (ls !== null) return ls === 'true'
    }
  } catch {}

  // Fallback to Vite env flag
  // @ts-ignore - import.meta is provided by Vite
  const envVal = (import.meta as any)?.env?.VITE_HC_RX_V2 ?? (import.meta as any)?.env?.HC_RX_V2
  if (typeof envVal === 'string') return envVal === 'true' || envVal === '1'
  if (typeof envVal === 'boolean') return !!envVal
  // Enable by default in development to showcase new design
  try {
    // @ts-ignore
    if ((import.meta as any)?.env?.DEV) return true
  } catch {}
  return false
}

export function setHcRxV2Enabled(on: boolean) {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('HC_RX_V2', on ? 'true' : 'false')
    }
  } catch {}
}
