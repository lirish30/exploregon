# App Router Notes

## CMS one-off pages

- Payload collection: `pages`
- Route mapping: `/<slug>` via `src/app/[slug]/page.tsx`
- Publish requirement: page `status` must be `published`
- Rich text body is rendered from Payload Lexical JSON

## Special case: `/map`

- `/map` is also sourced from the `pages` collection (slug must be `map`)
- If no published `map` page exists in Payload, the route returns `notFound()`

## Reserved top-level slugs

These are owned by app routes and should not be used as `pages.slug` values:

- `cities`
- `categories`
- `listings`
- `guides`
- `events`
- `itineraries`
- `regions`
- `weather-tides`
