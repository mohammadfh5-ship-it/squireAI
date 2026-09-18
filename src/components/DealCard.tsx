import type { Deal } from '../types/deal'
import { toggleWatch, track, watchedIds } from '../lib/analytics'
import { confidenceLabel, displayConfidence, parseMiles } from '../lib/rank'

function firstUrl(text: string, fallback: string): string {
  const match = text.match(/https?:\/\/[^\s)]+/i)
  return match?.[0] ?? fallback
}

type Props = {
  deal: Deal
  onUsed: (id: string) => void
  onWatch: (id: string, watching: boolean) => void
}

export function DealCard({ deal, onUsed, onWatch }: Props) {
  const confidence = displayConfidence(deal)
  const miles = parseMiles(deal.distance_note)
  const href = firstUrl(deal.how_to_lock_in, deal.source_url)
  const watching = watchedIds().includes(deal.id)
  const confClass =
    confidence === 'confirmed_today' ? 'badge badge-confirmed' : 'badge badge-typical'

  return (
    <article className="deal-card">
      <header className="deal-card-top">
        <p className="deal-merchant">{deal.merchant}</p>
        <span className={confClass}>{confidenceLabel(confidence)}</span>
      </header>
      <h3 className="deal-title">{deal.title}</h3>
      <p className="deal-price">{deal.price_display}</p>
      <p className="deal-meta">
        <span>{deal.distance_note}</span>
        {Number.isFinite(miles) ? (
          <span className="deal-miles">{miles.toFixed(1)} mi</span>
        ) : null}
      </p>
      <p className="deal-why">
        <strong>Why · </strong>
        {deal.why}
      </p>
      <p className="deal-lock">
        <strong>Lock in · </strong>
        {deal.how_to_lock_in}
      </p>
      <p className="deal-consent">You spend. Squire never auto-pays.</p>
      <div className="deal-actions">
        <a
          className="btn btn-primary"
          href={href}
          target="_blank"
          rel="noreferrer"
          onClick={() => track({ name: 'option_tap', dealId: deal.id })}
        >
          Open
        </a>
        <button
          type="button"
          className="btn"
          onClick={() => {
            const next = toggleWatch(deal.id)
            track({ name: 'watch', dealId: deal.id })
            onWatch(deal.id, next)
          }}
        >
          {watching ? 'Watching' : 'Watch'}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            track({ name: 'used_this', dealId: deal.id })
            onUsed(deal.id)
          }}
        >
          I used this
        </button>
      </div>
    </article>
  )
}
