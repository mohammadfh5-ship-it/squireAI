# Code Blue — iMessage Squire MVP

## Brand
Premium concierge / valet / squire buddy. Feel-good and money-smart. Not a coupon dump. Speaks like a trusted friend who already checked.

## Promise
Text the friend who already checked oil-change deals, salon openings, and movie prices near you — before you leave the couch.

## MVP scope (first market test)
Three verticals, one chat surface:
1. **Auto** — oil change / quick service
2. **Style** — salon / barber
3. **Night** — movies / tickets

## Experience
1. User texts a need in plain English (+ optional zip/location)
2. Companion returns **1–3 vetted options**: price, why this one, distance/timing, how to lock it in
3. Never auto-pay; consent for anything that spends
4. Tone: warm squire — competent, brief, premium

## Deliverables for this repo
Build a working **web MVP** that simulates the iMessage thread (chat UI) so we can market-test the experience before native Messages rails (Photon later).

### Must include
- Chat UI that feels like messaging a premium buddy (mobile-first)
- Intent parsing for the three verticals (can be LLM-backed or rule+LLM hybrid; stub OK if keys missing)
- Location/zip input
- Response cards: 1–3 options with price, why, CTA
- Sample/mock local deal data for a default metro (configurable) so demos work offline
- Confidence labels: "confirmed" vs "typical range — confirm at desk"
- Simple admin or JSON seed for deals so Code Blue bots can iterate inventory
- Clear README: how to run, how to demo, env vars

### Nice to have
- Proactive "watch" stubs (UI only)
- Personality switcher (squire voice samples)
- Analytics events: ask → option tap → "I used this"

### Out of scope
- Real iMessage number / Photon integration (document as Phase 2)
- Real payments
- Merchant onboarding portal

## Success for market test
Someone can open the app, ask "oil change this weekend near 94107", get a shortlist that feels like a squire answered, and understand the savings.

## Tone examples
User: oil change saturday near me  
Squire: Got you. Three solid options near 94107 — best value first.

1. **Jiffy Lube Folsom** — ~$49 conventional (today’s special) · 1.2 mi · walk-in ok  
   Why: cheapest verified today, no upsell bait on the ad.  
   Next: Open map · Call

(Keep it short. One witty line max. Never spam five more deals.)
