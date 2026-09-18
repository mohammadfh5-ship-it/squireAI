import type { Deal, SeedFile } from '../types/deal'
import raw from '../data/seed-94107.json' with { type: 'json' }

export const DEFAULT_ZIP = '94107'

export const seed = raw as SeedFile

export function isKeeper(deal: Deal): boolean {
  return deal.kill_reason == null
}

export function keepersOnly(deals: Deal[] = seed.deals): Deal[] {
  return deals.filter(isKeeper)
}

export function keeperCounts(deals: Deal[] = seed.deals): {
  auto: number
  style: number
  night: number
  killed: number
  total: number
} {
  const keepers = keepersOnly(deals)
  return {
    auto: keepers.filter((d) => d.vertical === 'auto').length,
    style: keepers.filter((d) => d.vertical === 'style').length,
    night: keepers.filter((d) => d.vertical === 'night').length,
    killed: deals.filter((d) => d.kill_reason != null).length,
    total: deals.length,
  }
}
