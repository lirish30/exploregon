# ExplOregon Coast

Payload CMS + Next.js App Router foundation scaffold for ExplOregon Coast.

## Local Development

1. Install dependencies:

```bash
pnpm install
```

2. Copy env template:

```bash
cp .env.example .env
```

3. Run CMS and frontend in separate terminals:

```bash
pnpm dev:cms
pnpm dev:web
```

4. Open:

- CMS admin: `http://localhost:3001/admin`
- Website: `http://localhost:3000`

If port `3001` is already used on your machine, run CMS on another port:

```bash
PAYLOAD_PORT=3002 pnpm dev:cms
```

SQLite is the default local CMS DB (`apps/cms/payload.db`), so Docker is not required for local login/publishing.
If you want Postgres instead, set `DATABASE_URI`/`DATABASE_URL` in `apps/cms/.env`, then run:

```bash
pnpm cms:db:up
pnpm cms:migrate
```

5. Quality checks:

```bash
pnpm lint
pnpm typecheck
pnpm format
```

## Notes

- This scaffold is Phase 0 foundation only (no feature pages built).
- Payload schema files are placeholders for the required PRD collections/globals and will be implemented in schema-lock phase.
- Route-family placeholders exist for required dynamic paths, but page implementations are intentionally deferred.
- Sitewide typography rule: use `Instrument Serif` for headings/headlines and `Instrument Sans` for body/UI text. Do not override this mapping.
