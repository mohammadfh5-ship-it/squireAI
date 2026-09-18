# Code Blue — Confidence Rubric (Scout)

Used by Auto / Style / Night before any option reaches the companion reply.

## Labels (exactly one per deal)

| Label | When to use | User-facing copy |
| --- | --- | --- |
| `confirmed_today` | Price or special verified on a live merchant / official page (or voucher page with clear redeem terms) on the verification day. Location serves the anchor zip. | "confirmed today" |
| `typical_range` | Credible public signal (Maps price hints, chain menu ranges, recent reviews naming $, theater list prices that may vary by showtime) but not a firm same-day special. | "typical range — confirm at desk" |
| `unverified` | Tip, screenshot, hearsay, SEO aggregator, or stale scrape. **Never show as a priced option.** May exist only in Scout kill-log / research notes. | *(do not show)* |

## Rules
1. Default is `typical_range` when unsure. Never upgrade to `confirmed_today` without a `source_url` you opened today.
2. Max **1–3** options in a user reply; prefer fewer if confidence is mixed.
3. Mix of labels is fine; lead with highest confidence, then best value.
4. If every candidate is `unverified`, say you don't have a clean number yet — don't invent.
5. `verified_at` is ISO datetime in America/Los_Angeles. Stale after **24h** for `confirmed_today` (re-check or downgrade).
