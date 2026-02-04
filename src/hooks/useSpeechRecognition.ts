// Hook para reconocimiento de voz en español usando Web Speech API
// Referencia: MDN Web Speech API (SpeechRecognition)
import { useCallback, useEffect, useRef, useState } from 'react'

interface UseSpeechRecognitionOptions {
  lang?: string
  continuous?: boolean
  interimResults?: boolean
  onResult?: (finalText: string, isFinal: boolean) => void
  onError?: (error: string) => void
}

interface UseSpeechRecognitionReturn {
  transcript: string
  isListening: boolean
  start: () => void
  stop: () => void
  reset: () => void
  supported: boolean
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const {
    lang = 'es-ES',
    continuous = true,
    interimResults = true,
    onResult,
    onError,
  } = options

  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  const supported = typeof window !== 'undefined' && (
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  )

  useEffect(() => {
    if (!supported) return
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = lang
    recognition.continuous = continuous
    recognition.interimResults = interimResults

    recognition.onresult = (event: any) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i]
        if (res.isFinal) {
          final += res[0].transcript
        } else {
          interim += res[0].transcript
        }
      }
      const combined = (transcript + ' ' + final).trim()
      if (final) {
        setTranscript(combined)
        onResult?.(combined, true)
      } else if (interim) {
        onResult?.(transcript + ' ' + interim, false)
      }
    }

    recognition.onerror = (event: any) => {
      onError?.(event.error)
    }

    recognition.onend = () => {
      // Auto-reiniciar si está en modo continuous y seguía escuchando
      if (continuous && isListening) {
        try { recognition.start() } catch {}
      } else {
        setIsListening(false)
      }
    }

    recognitionRef.current = recognition
    return () => {
      recognition.stop()
    }
  }, [lang, continuous, interimResults, onResult, onError, isListening, transcript, supported])

  const start = useCallback(() => {
    if (!supported) return
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (err) {
        onError?.('No se pudo iniciar reconocimiento')
      }
    }
  }, [supported, isListening, onError])

  const stop = useCallback(() => {
    if (!supported) return
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }, [supported, isListening])

  const reset = useCallback(() => {
    setTranscript('')
  }, [])

  return { transcript, isListening, start, stop, reset, supported }
}
