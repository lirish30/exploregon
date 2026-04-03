# Seed Data (Launch Scope)

This seed script populates Payload with launch-oriented placeholder editorial data aligned to:
- `files/exploregon_payload_prd.md`
- `files/exploregon_payload_build_plan.md`
- `files/exploregoncoast_sitemap_outline.xml`

## What it seeds

- `3` regions
- `5` core cities
- `25` listings
- `2` guides
- `1` itinerary
- `6` events
- globals: `homepage`, `navigation`, `siteSettings`, `footer`

Notes:
- Content is plausible and structured (no lorem ipsum).
- Where exact facts are uncertain, records are clearly marked as editorial seed placeholders.
- Script is idempotent by `slug` (upserts instead of duplicate inserts).

## Run

From repo root:

```bash
pnpm --filter @exploregon/cms seed
```

Required:
- working Payload DB connection in `.env` (`DATABASE_URI`)
- Payload secret set (`PAYLOAD_SECRET`)

The script uses `files/screen.png` as a reusable placeholder media asset.
