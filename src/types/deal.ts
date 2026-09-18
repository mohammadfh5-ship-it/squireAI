export type Vertical = 'auto' | 'style' | 'night'

export type Confidence = 'confirmed_today' | 'typical_range' | 'unverified'

export type SourceType =
  | 'merchant'
  | 'groupon'
  | 'theater'
  | 'bank_perk'
  | 'other'

export type Deal = {
  id: string
  vertical: Vertical
  merchant: string
  title: string
  price_display: string
  price_low: number | null
  price_high: number | null
  currency: string
  zip_anchor: string
  distance_note: string
  why: string
  how_to_lock_in: string
  source_url: string
  source_type: SourceType
  confidence: Confidence
  verified_at: string
  expires_at: string | null
  kill_reason: string | null
  notes: string
}

export type SeedFile = {
  metro: string
  zip_anchor: string
  verified_at: string
  timezone: string
  product_notes?: string
  deals: Deal[]
}

export type Voice = 'squire' | 'valet' | 'buddy'

export type StyleKind = 'cut' | 'blowout' | 'nails' | 'any'
export type NightKind = 'movie' | 'comedy' | 'live' | 'subscription' | 'any'
export type AutoKind = 'any' | 'synthetic' | 'new_customer' | 'locked'
export type Timing =
  | 'tonight'
  | 'weekend'
  | 'tuesday'
  | 'wednesday'
  | 'anytime'

export type ParsedIntent = {
  vertical: Vertical | null
  zip: string
  raw: string
  styleKind: StyleKind
  nightKind: NightKind
  autoKind: AutoKind
  timing: Timing
  student: boolean
  military: boolean
}

export type SquireReply = {
  intro: string
  deals: Deal[]
  chips: string[]
  zip: string
  zipDisclaimer: string | null
  usedLlm: boolean
}
