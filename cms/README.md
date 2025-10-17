# Zeiler CMS (/cms)

This Strapi instance powers the new zeiler.me headless CMS. It runs Strapi v5 with SQLite in development and can be switched to PostgreSQL/MySQL for production.

## Prerequisites

- Node.js 18–22 (aligns with `.nvmrc` if present)
- npm 8+
- A populated `.env` based on `.env.example`

## Installation

```bash
npm install
```

## Environment variables

1. Copy `.env.example` to `.env`.
2. Replace all `changeme` placeholders with freshly generated secrets.
3. Set `STRAPI_URL` to the public base URL of the CMS (defaults to `http://localhost:1337`).
4. For non-SQLite setups provide the appropriate `DATABASE_*` variables.

## Development workflow

```bash
npm run develop
```

This starts Strapi in watch mode with hot reload. The GraphQL Playground is available at `${STRAPI_URL}/graphql` when `NODE_ENV=development`.

## Production build

```bash
npm run build
npm run start
```

`build` compiles the admin panel. `start` serves the compiled admin in production mode.

## Included plugins & customisations

- **GraphQL** (`@strapi/plugin-graphql`): exposes `/graphql` for queries & mutations.
- **Markdown custom field**: `plugin::markdown-field.markdown` stores Markdown in `Page.body` with an embedded editor.
- **Local upload configuration**: defaults to storing media in `public/uploads`. Override via `UPLOAD_PROVIDER_*` env vars for S3-compatible storage.

## Useful scripts

- `npm run strapi` – access the Strapi CLI
- `npm run console` – open the Strapi interactive console
- `npm run upgrade` – run Strapi upgrade checks

For content migration utilities see `../MIGRATION.md`.
