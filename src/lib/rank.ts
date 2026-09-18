import type { Confidence, Deal, ParsedIntent } from '../types/deal'

/** Soft-flag conflict groups from the 94107 merge log. At most one id per group. */
export const CONFLICT_GROUPS: readonly (readonly string[])[] = [
  ['style-ringolevio-blowout', 'style-marine-cut-union'],
  [
    'sf94107-auto-firestone-mission-15off',
    'sf94107-auto-firestone-mission-pennzoil-25-25',
  ],
  [
    'sf94107-auto-midas-dalycity-4499',
    'sf94107-auto-midas-dalycity-10-20off',
  ],
  [
    'sf94107-auto-vioc-soma-15off',
    'sf94107-auto-vioc-soma-20off-new',
    'sf94107-auto-groupon-vioc-soma-5339',
  ],
  [
    'sf94107-night-regal-stonestown-value-day-799',
    'sf94107-night-regal-stonestown-rewards-tue-popcorn',
  ],
]

const NEVER_AS_MOVIE_TICKETS = new Set([
  'sf94107-night-chase-sapphire-stubhub-300',
  'sf94107-night-capital-one-entertainment-8pct',
])

const SUBSCRIPTION_IDS = new Set(['sf94107-night-regal-unlimited-prepaid'])

const STALE_CONFIRMED_MS = 24 * 60 * 60 * 1000

export function parseMiles(note: string): number {
  if (/in-zip/i.test(note)) return 0.2
  const range = note.match(
    /~?\s*(\d+(?:\.\d+)?)\s*[–—-]\s*(\d+(?:\.\d+)?)\s*mi/i,
  )
  if (range) return (Number(range[1]) + Number(range[2])) / 2
  const single = note.match(/~?\s*(\d+(?:\.\d+)?)\s*mi/i)
  if (single) return Number(single[1])
  if (/program/i.test(note)) return 40
  return 8
}

export function isInZip(deal: Deal): boolean {
  return /in-zip/i.test(deal.distance_note)
}

export function weekdayInPt(at: Date = new Date()): number {
  const day = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    timeZone: 'America/Los_Angeles',
  }).format(at)
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(day)
}

export function isTueOnly(deal: Deal): boolean {
  const blob = `${deal.title} ${deal.notes} ${deal.price_display}`.toLowerCase()
  return /tue-only|every tuesday|\btuesdays\b|\btuesday\b|tue\/wed/.test(blob)
}

export function isTueWed(deal: Deal): boolean {
  const blob = `${deal.title} ${deal.notes}`.toLowerCase()
  return /tue\/wed|tuesdays & wednesdays|tuesdays and wednesdays/.test(blob)
}

export function displayConfidence(deal: Deal, now: Date = new Date()): Confidence {
  if (deal.confidence !== 'confirmed_today') return deal.confidence
  const verified = Date.parse(deal.verified_at)
  if (Number.isNaN(verified)) return 'typical_range'
  if (now.getTime() - verified > STALE_CONFIRMED_MS) return 'typical_range'
  return 'confirmed_today'
}

export function confidenceLabel(confidence: Confidence): string {
  if (confidence === 'confirmed_today') return 'confirmed today'
  if (confidence === 'typical_range') return 'typical range — confirm at desk'
  return 'unverified'
}

function blob(deal: Deal): string {
  return `${deal.merchant} ${deal.title} ${deal.notes}`.toLowerCase()
}

function matchesStyle(deal: Deal, intent: ParsedIntent): boolean {
  const b = blob(deal)
  const nails = /nail|mani|pedi|vinylux|gel/.test(b)
  const blowout = /blowout|blow-dry|blow dry/.test(b)
  if (intent.styleKind === 'nails') return nails
  if (intent.styleKind === 'blowout') return blowout || /condition & style|cut\+style/.test(b)
  if (intent.styleKind === 'cut') return !nails
  return true
}

function eligibleNight(deal: Deal, intent: ParsedIntent): boolean {
  if (intent.nightKind === 'subscription') {
    return SUBSCRIPTION_IDS.has(deal.id) || deal.source_type === 'theater'
  }
  if (intent.nightKind === 'live') {
    return (
      NEVER_AS_MOVIE_TICKETS.has(deal.id) ||
      deal.id.includes('punchline') ||
      deal.source_type === 'bank_perk'
    )
  }
  if (intent.nightKind === 'comedy') {
    return deal.id.includes('punchline') || NEVER_AS_MOVIE_TICKETS.has(deal.id)
  }

  // Casual movie / tickets: never pitch StubHub $300 or Cap One Entertainment 8%.
  if (NEVER_AS_MOVIE_TICKETS.has(deal.id)) return false
  if (SUBSCRIPTION_IDS.has(deal.id)) return false
  if (deal.id.includes('punchline')) return false
  if (deal.id.includes('savor-3pct')) return false
  if (deal.id.includes('student') && !intent.student) return false
  if (deal.id.includes('military') && !intent.military) return false
  return deal.source_type === 'theater' || deal.vertical === 'night'
}

function eligibleAuto(deal: Deal, intent: ParsedIntent): boolean {
  if (intent.autoKind === 'locked') return deal.source_type === 'groupon' || deal.price_low != null
  return true
}

export function filterCandidates(deals: Deal[], intent: ParsedIntent): Deal[] {
  if (!intent.vertical) return []
  return deals.filter((deal) => {
    if (deal.kill_reason != null) return false
    if (deal.confidence === 'unverified') return false
    if (deal.vertical !== intent.vertical) return false
    if (intent.vertical === 'style' && !matchesStyle(deal, intent)) return false
    if (intent.vertical === 'night' && !eligibleNight(deal, intent)) return false
    if (intent.vertical === 'auto' && !eligibleAuto(deal, intent)) return false
    return true
  })
}

function scoreDeal(deal: Deal, intent: ParsedIntent, now: Date): number {
  const miles = parseMiles(deal.distance_note)
  let score = 0
  const conf = displayConfidence(deal, now)
  score += conf === 'confirmed_today' ? 22 : 8
  score += Math.max(0, 18 - miles * 3.2)
  if (isInZip(deal)) score += 10
  if (miles <= 1.2) score += 8

  if (intent.vertical === 'auto') {
    if (intent.autoKind === 'new_customer' && /new customer/.test(blob(deal))) {
      score += 16
    }
    if (intent.autoKind === 'synthetic' && /synthetic|pennzoil/.test(blob(deal))) {
      score += 14
    }
    if (intent.autoKind === 'locked' && deal.source_type === 'groupon') score += 12
    if (intent.autoKind === 'any' && deal.source_type === 'merchant') score += 6
    if (intent.autoKind === 'any' && deal.id.includes('groupon-vioc')) score -= 4
  }

  if (intent.vertical === 'style') {
    if (intent.styleKind === 'cut' && /buzz|haircut|fade|barber/.test(blob(deal))) {
      score += 8
    }
    if (intent.styleKind === 'cut' && /blowout/.test(blob(deal))) score -= 6
  }

  const tue = isTueOnly(deal)
  const tueWed = isTueWed(deal)
  const weekday = weekdayInPt(now)
  const windowOpen =
    (tueWed && (weekday === 2 || weekday === 3)) || (tue && !tueWed && weekday === 2)

  if (intent.timing === 'tuesday' && (tue || tueWed)) score += 18
  if (intent.timing === 'wednesday' && tueWed) score += 18
  if (
    (intent.timing === 'tonight' || intent.timing === 'weekend') &&
    tue &&
    !windowOpen
  ) {
    score -= 20
  }
  if (intent.timing === 'tonight' && SUBSCRIPTION_IDS.has(deal.id)) score -= 80

  return score
}

function conflictIndex(id: string): number {
  return CONFLICT_GROUPS.findIndex((group) => group.includes(id))
}

function confRank(deal: Deal, now: Date): number {
  return displayConfidence(deal, now) === 'confirmed_today' ? 1 : 0
}

function valueRank(deal: Deal): number {
  return deal.price_low ?? 500
}

/** Greedy 1–3 with conflict groups; display order is confidence then value/distance. */
export function shortlistDeals(
  deals: Deal[],
  intent: ParsedIntent,
  now: Date = new Date(),
  max = 3,
): Deal[] {
  const candidates = filterCandidates(deals, intent)
  const ranked = candidates
    .map((deal) => ({ deal, score: scoreDeal(deal, intent, now) }))
    .sort((a, b) => b.score - a.score)

  const picked: Deal[] = []
  const usedGroups = new Set<number>()

  for (const { deal } of ranked) {
    const group = conflictIndex(deal.id)
    if (group >= 0 && usedGroups.has(group)) continue
    picked.push(deal)
    if (group >= 0) usedGroups.add(group)
    if (picked.length >= max) break
  }

  picked.sort((a, b) => {
    const conf = confRank(b, now) - confRank(a, now)
    if (conf !== 0) return conf
    const va = valueRank(a)
    const vb = valueRank(b)
    if (a.price_low != null && b.price_low != null && va !== vb) return va - vb
    return parseMiles(a.distance_note) - parseMiles(b.distance_note)
  })

  return picked
}

export function tueCaveats(deals: Deal[], intent: ParsedIntent, now: Date = new Date()): string[] {
  const weekday = weekdayInPt(now)
  const notes: string[] = []
  for (const deal of deals) {
    if (!isTueOnly(deal)) continue
    const wed = isTueWed(deal)
    const open = wed ? weekday === 2 || weekday === 3 : weekday === 2
    if (open) continue
    if (intent.timing === 'tonight' || intent.timing === 'weekend' || intent.timing === 'anytime') {
      notes.push(
        wed
          ? `${deal.merchant.split('—')[0].trim()} ${deal.title} is Tue/Wed — not tonight.`
          : `${deal.merchant.split('—')[0].trim()} is Tuesday-only.`,
      )
    }
  }
  return notes
}
