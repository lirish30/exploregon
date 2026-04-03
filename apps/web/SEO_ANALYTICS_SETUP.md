# SEO and Analytics Setup Notes (MVP)

## Required environment variables

- `NEXT_PUBLIC_SITE_URL`: Canonical site URL (for example `https://exploregoncoast.com`)
- `NEXT_PUBLIC_GA4_MEASUREMENT_ID`: GA4 measurement ID (for example `G-XXXXXXXXXX`)
- `PAYLOAD_PUBLIC_SERVER_URL`: Payload base URL for media and API fetches

## What is wired in code

- Metadata + canonical tags are generated per route family.
- `app/sitemap.ts` emits static and dynamic URLs from Payload-backed route families.
- `app/robots.ts` advertises sitemap and allows crawl except `/api/*`.
- Breadcrumb JSON-LD is emitted wherever breadcrumb UI renders.
- Homepage emits `WebSite` JSON-LD.
- Listing pages emit `LocalBusiness` JSON-LD.
- GA4 `gtag.js` script is conditionally injected when `NEXT_PUBLIC_GA4_MEASUREMENT_ID` is set.

## Search Console checklist

1. Verify domain property for `exploregoncoast.com`.
2. Submit `https://exploregoncoast.com/sitemap.xml`.
3. Confirm canonical host matches `NEXT_PUBLIC_SITE_URL`.
4. Request indexing for homepage and first city/category/listing pages after deploy.

## Validation command

Run:

```bash
pnpm --filter @exploregon/web seo:validate
```

This checks built route families against `files/exploregoncoast_sitemap_outline.xml` and verifies metadata exports exist.
