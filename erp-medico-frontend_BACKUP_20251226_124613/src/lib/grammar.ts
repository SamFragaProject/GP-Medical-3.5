// Utilidad para corrección gramatical y ortográfica con LanguageTool (modo público)
// Docs: https://languagetool.org/http-api/swagger-ui/#/default/post_check

export interface GrammarMatchReplacement {
  value: string
}

export interface GrammarMatch {
  message: string
  shortMessage?: string
  offset: number
  length: number
  replacements: GrammarMatchReplacement[]
  sentence?: string
  rule?: {
    id?: string
    description?: string
    issueType?: string
    category?: { id?: string; name?: string }
  }
}

export interface GrammarResponse {
  matches: GrammarMatch[]
}

/**
 * Corrige un texto en español utilizando LanguageTool.
 * Nota: el endpoint público tiene límites y puede aplicar CORS. Usar para DEMO.
 */
export async function correctSpanishGrammar(text: string): Promise<{ corrected: string; matches: GrammarMatch[] }>
{
  if (!text || text.trim().length === 0) return { corrected: text, matches: [] }

  const params = new URLSearchParams()
  params.append('text', text)
  params.append('language', 'es')
  params.append('level', 'picky')

  const res = await fetch('https://api.languagetool.org/v2/check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!res.ok) {
    // Devolver el texto original si falla
    return { corrected: text, matches: [] }
  }

  const data: GrammarResponse = await res.json()
  const corrected = applyCorrections(text, data.matches)
  return { corrected, matches: data.matches }
}

/**
 * Aplica reemplazos de LanguageTool al texto, ordenando por offset descendente para no desplazar índices.
 */
export function applyCorrections(original: string, matches: GrammarMatch[]): string {
  let result = original
  // Ordenar por offset descendente
  const sorted = [...matches].sort((a, b) => b.offset - a.offset)
  for (const m of sorted) {
    if (!m.replacements || m.replacements.length === 0) continue
    const best = m.replacements[0].value
    result = result.slice(0, m.offset) + best + result.slice(m.offset + m.length)
  }
  return result
}
