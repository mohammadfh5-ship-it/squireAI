export type AnalyticsEvent =
  | { name: 'ask'; query: string; zip: string }
  | { name: 'option_tap'; dealId: string }
  | { name: 'used_this'; dealId: string }
  | { name: 'watch'; dealId: string }

const KEY = 'squireai.events'

export function track(event: AnalyticsEvent): void {
  try {
    const prev = JSON.parse(sessionStorage.getItem(KEY) ?? '[]') as AnalyticsEvent[]
    prev.push(event)
    sessionStorage.setItem(KEY, JSON.stringify(prev.slice(-80)))
  } catch {
    // storage blocked — ignore
  }
}

const WATCH_KEY = 'squireai.watch'

export function watchedIds(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(WATCH_KEY) ?? '[]') as unknown
    return Array.isArray(raw) ? raw.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function toggleWatch(id: string): boolean {
  const current = new Set(watchedIds())
  if (current.has(id)) current.delete(id)
  else current.add(id)
  localStorage.setItem(WATCH_KEY, JSON.stringify([...current]))
  return current.has(id)
}
