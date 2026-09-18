import type { ParsedIntent } from '../types/deal'
import { mergeLlmIntent } from './intent'

type LlmPayload = Partial<ParsedIntent> & {
  vertical?: ParsedIntent['vertical']
  zip?: string | null
}

export async function maybeRefineIntent(
  text: string,
  fallback: ParsedIntent,
): Promise<{ intent: ParsedIntent; usedLlm: boolean }> {
  if (!import.meta.env.DEV) {
    return { intent: fallback, usedLlm: false }
  }

  const ctrl = new AbortController()
  const timer = window.setTimeout(() => ctrl.abort(), 2500)

  try {
    const res = await fetch('/api/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: ctrl.signal,
    })
    if (!res.ok || res.status === 204) {
      return { intent: fallback, usedLlm: false }
    }
    const payload = (await res.json()) as LlmPayload
    return { intent: mergeLlmIntent(fallback, payload), usedLlm: true }
  } catch {
    return { intent: fallback, usedLlm: false }
  } finally {
    window.clearTimeout(timer)
  }
}
