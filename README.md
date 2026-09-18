# SquireAI

Premium local-deals squire companion (Code Blue MVP).

SquireAI is a mobile-first web thread: you text a need in plain English, and **Code Blue** answers like a valet who already checked — **1–3 vetted options**, not a coupon dump. Default market-test ZIP is **94107** (San Francisco / Mission Bay). Inventory is a Scout-gated JSON seed that works **offline**.

Never auto-pay. Never invent a sticker price. Killed audits stay in the seed (`kill_reason` set) so Scout can train filters; **only `kill_reason: null` keepers** are user-facing.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc + Vite production build
npm test         # ranking / keeper assertions
npm run preview  # serve the production build
```

Demo asks (empty-state chips, or type them):

- `Oil change this weekend near 94107`
- `Haircut near me`
- `Movies tonight`

You should get a squire shortlist from the real seed: price, why, confidence, distance, and how to lock in.

## How it works

1. **Intent** — keyword parser for three verticals (`auto` / `style` / `night`), plus ZIP, timing, and a few modifiers (synthetic, new customer, nails vs cut, Tuesday, student/military). Optional LLM refine in `npm run dev` only.
2. **Keepers** — `src/data/seed-94107.json` filtered to `kill_reason == null`. Unverified confidence never ships as a priced card.
3. **Soft ranking** (see `src/lib/rank.ts` and `docs/MERGE_LOG.md`):
   - Prefer closer / in-ZIP.
   - Do not shortlist Ringolevio + Marine Haute together (shared Union St redeem address).
   - Do not pair twin Firestone Mission offers, or twin Midas Daly City offers.
   - VIOC Groupon vs VIOC desk coupons = same SoMa shop; at most one VIOC card, with voucher vs desk left as a Scout note.
   - Never pitch Chase StubHub $300 or Capital One Entertainment 8% as movie tickets.
   - Regal Unlimited is a subscription/prepaid plan — not a casual “tonight” ticket.
   - Tuesday-only windows (AMC 50% Tue/Wed, Alamo BFD, Stonestown Value Day / popcorn) are labeled; they are not sold as tonight when the PT weekday does not match.
4. **Cards** — `price_display` from seed only; confidence is `confirmed today` or `typical range — confirm at desk` (24h stale `confirmed_today` downgrades per `docs/TRUST_RUBRIC.md`). CTAs open a source URL. Watch is a **UI stub**.

## Optional LLM

Keyword fallback is required and always on. For a richer intent parse during **dev**:

```bash
cp .env.example .env
# set OPENAI_API_KEY or LLM_API_KEY
npm run dev
```

Vite middleware `POST /api/intent` calls OpenAI if a key is present. Production/preview builds skip the network call so the static app stays offline-capable. Ranking still uses seed keepers — the model does not invent prices or merchants.

## Inventory & docs

| Path | Role |
| --- | --- |
| `src/data/seed-94107.json` | Metro seed (43 deals; keepers: auto 10, style 15, night 12) |
| `docs/DEAL_SCHEMA.md` | Deal object + kill rules |
| `docs/TRUST_RUBRIC.md` | Confidence labels |
| `docs/PRODUCT_BRIEF.md` | Product promise |
| `docs/MERGE_LOG.md` | Style / night / auto merge notes and soft flags |

Edit the JSON, reload. The in-app **Inventory** chip shows keeper counts.

## Phase 2 — iMessage / Photon

This MVP is a **web stand-in for the iMessage thread** so we can market-test tone and shortlists before native Messages rails.

Not in this build:

- A real iMessage number or Apple Messages for Business
- [Photon](https://www.photon.codes/) / RCS / SMS gateway
- Merchant onboarding or payments

Phase 2 would wrap the same `answerAsk` + seed ranking behind a Messages bot (Photon or equivalent), keep consent for anything that spends, and turn **Watch** into real nudges.

## Stack

Vite + React + TypeScript. Deep-navy premium thread UI inspired by messaging — original chrome (no Apple trademarks, bubble tails, or iOS IP).

## Scripts

| Command | What |
| --- | --- |
| `npm run dev` | Local thread + optional `/api/intent` |
| `npm run build` | Typecheck and production bundle |
| `npm test` | Soft-ranking and keeper tests |
| `npm run preview` | Serve `dist/` |
