import type {
  AutoKind,
  NightKind,
  ParsedIntent,
  StyleKind,
  Timing,
  Vertical,
} from '../types/deal'
import { DEFAULT_ZIP } from './seed'

const AUTO_RE =
  /\b(oil(?:\s*change)?|lube|jiffy|valvoline|vioc|firestone|midas|speedee|pennzoil|synthetic|car\s*service|auto(?:\s*shop)?|quick[\s-]?lube|vehicle)\b/i

const STYLE_RE =
  /\b(hair\s*cut|haircut|barber|salon|fade|buzz(?:\s*cut)?|nails?|mani(?:cure)?|pedi(?:cure)?|blow\s*out|blowout|blow-?dry|grooming|shave|gel(?:\s*mani)?|stylist|cut\s+and\s+style)\b/i

const NIGHT_RE =
  /\b(movies?|film|tickets?|cinema|theat(?:er|re)|amc|alamo|regal|comedy|punch\s*line|night\s*out|tonight|showtime|stubhub|concert|show|metreon|drafthouse)\b/i

function countHits(re: RegExp, text: string): number {
  return text.match(new RegExp(re.source, 'gi'))?.length ?? 0
}

function zipFrom(text: string, fallback: string): string {
  const found = text.match(/\b(\d{5})\b/)
  return found?.[1] ?? fallback
}

function styleKind(text: string): StyleKind {
  if (/\b(nails?|mani(?:cure)?|pedi(?:cure)?|gel)\b/i.test(text)) return 'nails'
  if (/\b(blow\s*out|blowout|blow-?dry)\b/i.test(text)) return 'blowout'
  if (
    /\b(hair\s*cut|haircut|barber|fade|buzz|salon|shave|cut)\b/i.test(text)
  ) {
    return 'cut'
  }
  return 'any'
}

function nightKind(text: string): NightKind {
  if (/\b(unlimited|subscription|monthly|prepaid)\b/i.test(text)) {
    return 'subscription'
  }
  if (/\b(stubhub|viagogo|concert|chase\s*center|live\s*event|comedy|punch\s*line)\b/i.test(text)) {
    return /\b(comedy|punch\s*line)\b/i.test(text) ? 'comedy' : 'live'
  }
  if (/\b(movies?|film|cinema|theat(?:er|re)|amc|alamo|regal|tickets?|showtime|metreon)\b/i.test(text)) {
    return 'movie'
  }
  return 'any'
}

function autoKind(text: string): AutoKind {
  if (/\b(new\s*customer|first[\s-]?time|first visit)\b/i.test(text)) {
    return 'new_customer'
  }
  if (/\b(groupon|voucher|lock(?:ed)?\s*price|floor price)\b/i.test(text)) {
    return 'locked'
  }
  if (/\b(synthetic|pennzoil)\b/i.test(text)) return 'synthetic'
  return 'any'
}

function timingOf(text: string): Timing {
  if (/\b(tue(?:s|sday)?)\b/i.test(text)) return 'tuesday'
  if (/\b(wed(?:s|nesday)?)\b/i.test(text)) return 'wednesday'
  if (/\b(tonight|this evening|today|now|after work)\b/i.test(text)) {
    return 'tonight'
  }
  if (/\b(weekend|saturday|sunday|sat\b|sun\b)\b/i.test(text)) return 'weekend'
  return 'anytime'
}

function pickVertical(text: string): Vertical | null {
  const auto = countHits(AUTO_RE, text)
  const style = countHits(STYLE_RE, text)
  const night = countHits(NIGHT_RE, text)
  const scored: { v: Vertical; n: number }[] = [
    { v: 'auto', n: auto },
    { v: 'style', n: style },
    { v: 'night', n: night },
  ]
  scored.sort((a, b) => b.n - a.n)
  if (scored[0].n === 0) return null
  return scored[0].v
}

export const SUGGESTED_CHIPS = [
  'Oil change this weekend near 94107',
  'Haircut near me',
  'Movies tonight',
] as const

export function parseIntent(
  text: string,
  zipFallback: string = DEFAULT_ZIP,
): ParsedIntent {
  return {
    vertical: pickVertical(text),
    zip: zipFrom(text, zipFallback),
    raw: text,
    styleKind: styleKind(text),
    nightKind: nightKind(text),
    autoKind: autoKind(text),
    timing: timingOf(text),
    student: /\bstudent\b/i.test(text),
    military: /\b(military|veteran|vet\b)\b/i.test(text),
  }
}

export function mergeLlmIntent(
  fallback: ParsedIntent,
  llm: Partial<ParsedIntent> & { zip?: string | null; vertical?: Vertical | null },
): ParsedIntent {
  const zip =
    llm.zip && /^\d{5}$/.test(llm.zip) ? llm.zip : fallback.zip
  return {
    ...fallback,
    vertical: llm.vertical === undefined ? fallback.vertical : llm.vertical,
    zip,
    styleKind: llm.styleKind ?? fallback.styleKind,
    nightKind: llm.nightKind ?? fallback.nightKind,
    autoKind: llm.autoKind ?? fallback.autoKind,
    timing: llm.timing ?? fallback.timing,
    student: llm.student ?? fallback.student,
    military: llm.military ?? fallback.military,
  }
}
