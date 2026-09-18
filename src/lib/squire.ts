import type { ParsedIntent, SquireReply, Voice } from '../types/deal'
import { parseIntent, SUGGESTED_CHIPS } from './intent'
import { maybeRefineIntent } from './llm'
import { shortlistDeals, tueCaveats } from './rank'
import { DEFAULT_ZIP, keepersOnly, seed } from './seed'

const VOICE_LEAD: Record<Voice, (n: number, zip: string) => string> = {
  squire: (n, zip) =>
    n === 1
      ? `Got you. One vetted option near ${zip}.`
      : `Got you. ${n === 2 ? 'Two' : 'Three'} solid options near ${zip} — best value first.`,
  valet: (n, zip) =>
    n === 1
      ? `Already ran the block. One I'd actually send you near ${zip}.`
      : `Already ran the block. ${n === 2 ? 'Two' : 'Three'} near ${zip} — no coupon dump.`,
  buddy: (n, zip) =>
    n === 1
      ? `Checked for you. This is the one I'd use near ${zip}.`
      : `Checked for you. ${n === 2 ? 'Two' : 'Three'} near ${zip} I'd actually use.`,
}

function wittyLine(intent: ParsedIntent): string {
  if (intent.vertical === 'auto') return "Walk-in first; I'll never auto-pay."
  if (intent.vertical === 'style') return 'Book the chair — you spend, I just scouted.'
  if (intent.vertical === 'night') return 'Tickets stay in your hands. No auto-buy.'
  return ''
}

export async function answerAsk(
  text: string,
  zipFallback: string,
  voice: Voice,
  now: Date = new Date(),
): Promise<SquireReply> {
  const fallback = parseIntent(text, zipFallback)
  const { intent, usedLlm } = await maybeRefineIntent(text, fallback)
  const zip = intent.zip || zipFallback || DEFAULT_ZIP
  const zipDisclaimer =
    zip !== seed.zip_anchor
      ? `I'm seeded on ${seed.zip_anchor} (${seed.metro} / Mission Bay) for this market test — showing that inventory, not invented shops for ${zip}.`
      : null

  if (!intent.vertical) {
    return {
      intro:
        "I can check oil changes, haircuts and salons, or a movie night near you. Plain English is fine — I'll keep it to 1–3 vetted options.",
      deals: [],
      chips: [...SUGGESTED_CHIPS],
      zip,
      zipDisclaimer,
      usedLlm,
    }
  }

  const deals = shortlistDeals(keepersOnly(), intent, now)
  if (deals.length === 0) {
    return {
      intro:
        "I don't have a clean vetted number for that yet — and I won't invent one. Try oil change, a haircut, or movies near 94107.",
      deals: [],
      chips: [...SUGGESTED_CHIPS],
      zip,
      zipDisclaimer,
      usedLlm,
    }
  }

  const caveats = tueCaveats(deals, intent, now)
  const lines = [VOICE_LEAD[voice](deals.length, seed.zip_anchor), wittyLine(intent)]
  if (zipDisclaimer) lines.push(zipDisclaimer)
  if (caveats[0]) lines.push(caveats[0])
  if (
    intent.vertical === 'night' &&
    intent.nightKind !== 'live' &&
    intent.nightKind !== 'subscription'
  ) {
    const pitchedBad = deals.some(
      (d) => d.id.includes('stubhub') || d.id.includes('entertainment-8pct'),
    )
    if (pitchedBad) {
      lines.push('Chase StubHub and Capital One Entertainment 8% are live-event perks, not movie tickets.')
    }
  }

  return {
    intro: lines.filter(Boolean).join(' '),
    deals,
    chips: [],
    zip,
    zipDisclaimer,
    usedLlm,
  }
}
