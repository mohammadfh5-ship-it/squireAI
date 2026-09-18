import { describe, expect, it } from 'vitest'
import { parseIntent } from './intent'
import { shortlistDeals } from './rank'
import { keepersOnly, seed } from './seed'

const keepers = keepersOnly()
const thu = new Date('2026-09-17T19:00:00-07:00')
const fri = new Date('2026-09-18T19:00:00-07:00')
const tue = new Date('2026-09-15T19:00:00-07:00')

function ids(query: string, at: Date = fri): string[] {
  return shortlistDeals(keepers, parseIntent(query, '94107'), at).map((d) => d.id)
}

function list(query: string, at: Date = fri) {
  return shortlistDeals(keepers, parseIntent(query, '94107'), at)
}

describe('seed keepers', () => {
  it('only recommends kill_reason null', () => {
    expect(keepers.every((d) => d.kill_reason == null)).toBe(true)
    expect(seed.deals.some((d) => d.kill_reason != null)).toBe(true)
  })
})

describe('oil / haircut / movie shortlists', () => {
  it('oil change returns 1–3 auto keepers from seed', () => {
    const deals = list('oil change this weekend near 94107')
    expect(deals.length).toBeGreaterThanOrEqual(1)
    expect(deals.length).toBeLessThanOrEqual(3)
    expect(deals.every((d) => d.vertical === 'auto' && d.kill_reason == null)).toBe(
      true,
    )
  })

  it('haircut returns 1–3 style keepers from seed', () => {
    const deals = list('haircut near me')
    expect(deals.length).toBeGreaterThanOrEqual(1)
    expect(deals.length).toBeLessThanOrEqual(3)
    expect(deals.every((d) => d.vertical === 'style' && d.kill_reason == null)).toBe(
      true,
    )
    const shops = deals.map((d) => d.merchant.split('—')[0].trim())
    expect(new Set(shops).size).toBe(shops.length)
  })

  it('movies tonight returns 1–3 night keepers from seed', () => {
    const deals = list('movies tonight', fri)
    expect(deals.length).toBeGreaterThanOrEqual(1)
    expect(deals.length).toBeLessThanOrEqual(3)
    expect(deals.every((d) => d.vertical === 'night' && d.kill_reason == null)).toBe(
      true,
    )
  })
})

describe('soft ranking', () => {
  it('does not pair Ringolevio and Marine Haute', () => {
    const set = new Set(ids('salon blowout or haircut'))
    expect(
      set.has('style-ringolevio-blowout') && set.has('style-marine-cut-union'),
    ).toBe(false)
  })

  it('does not pair twin Firestone or twin Midas', () => {
    const oil = ids('oil change saturday near 94107')
    expect(oil.filter((id) => id.includes('firestone')).length).toBeLessThanOrEqual(1)
    expect(oil.filter((id) => id.includes('midas')).length).toBeLessThanOrEqual(1)
  })

  it('does not mix VIOC Groupon with VIOC desk coupons', () => {
    const oil = ids('oil change near 94107')
    const vioc = oil.filter((id) => id.includes('vioc'))
    expect(vioc.length).toBeLessThanOrEqual(1)
  })

  it('never pitches Chase StubHub $300 or Cap One Entertainment 8% as movie tickets', () => {
    const movies = ids('movie tickets tonight', fri)
    expect(movies.some((id) => id.includes('stubhub'))).toBe(false)
    expect(movies.some((id) => id.includes('entertainment-8pct'))).toBe(false)
  })

  it('does not treat Unlimited as a casual tonight ticket', () => {
    const movies = ids('movies tonight', fri)
    expect(movies.some((id) => id.includes('unlimited'))).toBe(false)
  })

  it('still surfaces Tuesday windows when asked for Tuesday', () => {
    const movies = list('cheap tuesday movies', tue)
    expect(movies.length).toBeGreaterThan(0)
    expect(
      movies.some((d) => /tuesday|tue\/wed|tuesdays/i.test(`${d.title} ${d.notes}`)),
    ).toBe(true)
  })

  it('prefers closer auto shops over Daly City when asking near 94107', () => {
    const oil = list('oil change near me', thu)
    const firstMiles = oil[0]
      ? Number.parseFloat(
          /~?\s*(\d+(?:\.\d+)?)/.exec(oil[0].distance_note)?.[1] ?? '99',
        )
      : 99
    expect(firstMiles).toBeLessThan(4)
  })
})
