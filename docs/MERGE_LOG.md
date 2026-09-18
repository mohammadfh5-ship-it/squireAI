# Merge log — seed-94107 style inventory

Merged the 12 Scout-gated Style keepers (11 clean + 1 required-edit) from `seed-94107-style.json` into the inventory seed after the 2026-09-17 PT kill-check. Existing baseline keepers and killed audits were retained; no Dogpatch Barber or J.Roland duplicates were added.

- Added Style keepers: Episode, Joe Hamer, Ringolevio, Marine Haute, Hair by Liz, Lisa's, Temurgoldclub, PJ Nava, BARBER GSHARP, Quince Spa, Nail Box, and Nail It Studio.
- Normalized each merged deal with `currency: USD` and string `how_to_lock_in`.
- Promoted Temurgoldclub and PJ Nava to `confirmed_today` per the Scout Booksy-live note.
- Added soft-flag notes for the Ringolevio/Marine shared address, GSharp distance, and Episode/Lisa eligibility caveats.
- Nail It Studio now shows the confirmed `$90` gel price with `price_low`/`price_high` set to 90; the computed `$81` email discount was removed from user-facing pricing.
- Synced the merged inventory exactly to `app/src/data/seed-94107.json`.

## Validation

Keeper counts (`kill_reason: null`): auto: 3, night: 3, style: 15.
Both JSON seeds parse successfully.

## Night merge — 2026-09-17 PT

Merged all 9 Scout-gated Night keepers from `seed-94107-night.json` after the 2026-09-17 PT kill-check. The gate reported 9 clean keepers, 0 required edits, 0 kills, and no Metreon/Alamo baseline duplicates.

- Normalized each merged deal with `currency: USD` and string `how_to_lock_in`.
- Added explicit `deal.notes` soft flags: Chase StubHub/viagogo and Capital One Entertainment 8% are never movie-ticket pitches; Regal Unlimited is subscription/prepaid; Stonestown Value Day and popcorn are Tue-only and ~5 mi from 94107; Punch Line remains venue-only until a show price is confirmed.
- Retained all existing auto/style/night keepers and killed audits.
- Synced the merged inventory exactly to `app/src/data/seed-94107.json`.

## Validation

Keeper counts (`kill_reason: null`): auto: 3, night: 12, style: 15. Total deals: 33 (including 3 killed audits). Both JSON seeds parse successfully; IDs are unique.


## Auto merge — 2026-09-17 PT

Merged the 7 Scout-approved Auto keepers from `seed-94107-auto.json` after the Auto kill-check in `GATE_AUTO_94107.md` / `.json`. Existing Style + Night merges, baseline Auto inventory, and prior killed audits were retained.

- Added Auto keepers: Firestone Mission $15 off; Firestone Pennzoil $25 off + $25 prepaid card; Midas Daly City $44.99; Midas Daly City $10/$20 off; SpeeDee Daly City WESD10/WESD15; Groupon VIOC SoMa from $53.39; and Groupon Veloce from $53.91.
- Affirmed and retained 3 killed audits with `kill_reason`: Pep Boys (no redeemable location near 94107), Costco South San Francisco (oil changes not offered), and stale Firestone $29.99 (expired/superseded).
- Flattened Auto `how_to_lock_in` objects to strings, enforced `currency: USD`, and retained schema confidence values (`confirmed_today` / `typical_range`).
- Added soft flags: do not pair both Firestone or both Midas offers in one 1–3; Daly City is farther; Veloce requires an appointment and may add fees; Groupon VIOC is the same shop as baseline VIOC desk coupons, so voucher vs desk pricing must be explained before shortlisting together.
- Synced the merged inventory exactly to `app/src/data/seed-94107.json`.

## Validation

Keeper counts (`kill_reason: null`): auto: 10, night: 12, style: 15. Total deals: 43 (including 6 killed audits). Both JSON seeds parse successfully; IDs are unique; all records use string `how_to_lock_in`, valid confidence enums, and `USD`.
