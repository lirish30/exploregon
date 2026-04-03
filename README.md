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

4. Quality checks:

```bash
pnpm lint
pnpm typecheck
pnpm format
```

## Notes

- This scaffold is Phase 0 foundation only (no feature pages built).
- Payload schema files are placeholders for the required PRD collections/globals and will be implemented in schema-lock phase.
- Route-family placeholders exist for required dynamic paths, but page implementations are intentionally deferred.
