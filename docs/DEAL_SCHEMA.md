# Code Blue Scout — Deal Schema

Reusable deal object for market-test metro inventory (iMessage companion trust layer).
Product promise: surface **1–3 vetted options only**; never a coupon dump; never auto-pay.

## Confidence labels (required)

| Label | Meaning |
| --- | --- |
| `confirmed_today` | Live price and/or special is dated or clearly currently advertised on a primary public page (merchant, theater, bank perk, or official coupon host) at verification time. |
| `typical_range` | Directionally useful, but final amount **must be confirmed at desk / checkout**. Used when only discount-off base is known, aggregator/secondary reporting, or page blocked. |

Do **not** present fabricated dollar amounts as `confirmed_today`.

## Fields

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stable slug, e.g. `sf94107-auto-vioc-soma-15off` |
| `vertical` | enum | `auto` \| `style` \| `night` |
| `merchant` | string | Brand / shop / theater name |
| `title` | string | Short human offer title |
| `price_display` | string | User-facing string (may be "$15 off", "$35 buzz cut", "50% off Tue/Wed") |
| `price_low` | number \| null | Lowest numeric USD if known; null if discount-only or unknown |
| `price_high` | number \| null | Upper bound if a range; else null |
| `currency` | string | Always `USD` for US metro seeds |
| `zip_anchor` | string | Market-test ZIP (e.g. `94107`) |
| `distance_note` | string | Human distance / neighborhood relative to anchor |
| `why` | string | Why this is a vetted option (trust copy, not SEO fluff) |
| `how_to_lock_in` | string | url / phone / walk-in instructions (no auto-pay) |
| `source_url` | string | Primary URL used for verification |
| `source_type` | enum | `merchant` \| `groupon` \| `theater` \| `bank_perk` \| `other` |
| `confidence` | enum | `confirmed_today` \| `typical_range` |
| `verified_at` | string | ISO 8601 datetime with PT offset (e.g. `2026-09-17T22:03:53-07:00`) |
| `expires_at` | string \| null | ISO date/datetime if known; else null |
| `kill_reason` | string \| null | Null if alive/recommended-eligible; filled if killed |
| `notes` | string | Caveats, blockers, asterisks, franchise limits |

## Kill rules (do not recommend)

- Expired Groupon-style vouchers
- Bait pricing with heavy asterisks / franchise traps
- No redeemable location near the ZIP anchor
- Prices only in SEO spam / aggregator fluff without a merchant page

## Seed file shape

```json
{
  "metro": "San Francisco",
  "zip_anchor": "94107",
  "verified_at": "2026-09-17T22:03:53-07:00",
  "timezone": "America/Los_Angeles",
  "deals": [ /* Deal objects */ ]
}
```

Killed examples stay in the same `deals` array with `kill_reason` set so Scout can train filters without recommending them.
