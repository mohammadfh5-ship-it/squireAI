import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { track } from '../lib/analytics'
import { SUGGESTED_CHIPS } from '../lib/intent'
import { keeperCounts, seed } from '../lib/seed'
import { answerAsk } from '../lib/squire'
import type { Deal, Voice } from '../types/deal'
import { DealCard } from './DealCard'

type ChatMsg = {
  id: string
  role: 'user' | 'squire'
  text: string
  deals?: Deal[]
  chips?: string[]
}

const VOICES: { id: Voice; label: string }[] = [
  { id: 'squire', label: 'Squire' },
  { id: 'valet', label: 'Valet' },
  { id: 'buddy', label: 'Buddy' },
]

function uid(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const WELCOME: ChatMsg = {
  id: 'welcome',
  role: 'squire',
  text: "Code Blue here — your SquireAI. Text me like a friend who already checked oil-change specials, salon chairs, and movie prices near 94107. I'll send 1–3 vetted options. Never a coupon dump. Never auto-pay.",
  chips: [...SUGGESTED_CHIPS],
}

export function ChatApp() {
  const [zip, setZip] = useState(seed.zip_anchor)
  const [voice, setVoice] = useState<Voice>('squire')
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<ChatMsg[]>([WELCOME])
  const [typing, setTyping] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [inventoryOpen, setInventoryOpen] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)
  const counts = useMemo(() => keeperCounts(), [])

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(t)
  }, [toast])

  async function send(text: string) {
    const query = text.trim()
    if (!query || typing) return
    setDraft('')
    const userMsg: ChatMsg = { id: uid(), role: 'user', text: query }
    setMessages((m) => [...m, userMsg])
    setTyping(true)
    track({ name: 'ask', query, zip })
    try {
      const reply = await answerAsk(query, zip, voice)
      if (reply.zip) setZip(reply.zip)
      setMessages((m) => [
        ...m,
        {
          id: uid(),
          role: 'squire',
          text: reply.intro,
          deals: reply.deals,
          chips: reply.chips,
        },
      ])
    } finally {
      setTyping(false)
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    void send(draft)
  }

  return (
    <div className="shell">
      <div className="phone">
        <header className="header">
          <div className="identity">
            <div className="avatar" aria-hidden="true">
              CB
            </div>
            <div>
              <p className="brand">SquireAI</p>
              <p className="persona">Code Blue · valet on duty</p>
            </div>
          </div>
          <label className="zip-field">
            <span>ZIP</span>
            <input
              inputMode="numeric"
              maxLength={5}
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
              aria-label="ZIP code"
            />
          </label>
        </header>

        <nav className="voice-row" aria-label="Squire voice">
          {VOICES.map((v) => (
            <button
              key={v.id}
              type="button"
              className={v.id === voice ? 'voice on' : 'voice'}
              onClick={() => setVoice(v.id)}
            >
              {v.label}
            </button>
          ))}
          <button
            type="button"
            className="voice"
            onClick={() => setInventoryOpen((o) => !o)}
          >
            Inventory
          </button>
        </nav>

        {inventoryOpen ? (
          <aside className="inventory">
            <p>
              {seed.metro} seed · ZIP {seed.zip_anchor} · verified {seed.verified_at}
            </p>
            <p>
              Keepers (kill_reason null): auto {counts.auto} · style {counts.style} ·
              night {counts.night}. Killed audits stay in JSON but never shortlist.
            </p>
          </aside>
        ) : null}

        <div className="thread" ref={scroller}>
          {messages.map((msg) => (
            <div key={msg.id} className={`row ${msg.role}`}>
              {msg.role === 'squire' ? (
                <div className="squire-stack">
                  <div className="bubble squire">{msg.text}</div>
                  {msg.deals?.map((deal) => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      onUsed={() => setToast('Noted — glad it landed. Still no auto-pay from me.')}
                      onWatch={(_, watching) =>
                        setToast(
                          watching
                            ? "Watching — I'll nudge you when this shifts (Phase 2)."
                            : 'Dropped from your watch list.',
                        )
                      }
                    />
                  ))}
                  {msg.chips && msg.chips.length > 0 ? (
                    <div className="chips">
                      {msg.chips.map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          className="chip"
                          onClick={() => void send(chip)}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="bubble user">{msg.text}</div>
              )}
            </div>
          ))}
          {typing ? (
            <div className="row squire">
              <div className="bubble squire typing" aria-label="Code Blue is typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          ) : null}
        </div>

        <form className="composer" onSubmit={onSubmit}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Oil change Saturday near me…"
            aria-label="Message Code Blue"
            autoComplete="off"
          />
          <button type="submit" className="send" disabled={!draft.trim() || typing}>
            Send
          </button>
        </form>
      </div>
      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  )
}
