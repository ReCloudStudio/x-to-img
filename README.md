# X to Image API

Convert X/Twitter tweets to PNG images. Deployable on Cloudflare Workers or Deno Deploy.

## Tech Stack

- **Runtime**: Cloudflare Workers / Deno Deploy / [Bun](https://bun.sh)
- **Framework**: [Hono](https://hono.dev)
- **Font**: [Maple Mono CN](https://github.com/subframe7536/maple-font) (via GitHub Releases CDN)
- **Rendering**: [Satori](https://github.com/vercel/satori) + [resvg-wasm](https://github.com/nicedoc/resvg-js)

## Setup

```bash
bun install
```

## Deploy to Cloudflare Workers

```bash
npx wrangler kv:namespace create FONT_KV        # first time only, copy id into wrangler.jsonc
npx wrangler secret put API_TOKEN               # optional
npx wrangler deploy
```

## Deploy to Deno Deploy

```bash
deployctl deploy --project=x-to-img --entrypoint src/index.ts
```

Deno Deploy uses built-in Deno KV for font caching (no setup needed).

## Local Development

```bash
bun run bun:dev              # Bun
npx wrangler dev             # CF Workers emulator
deno task dev                # Deno (requires --unstable-kv)
```

## Font Caching

Font files are downloaded from GitHub Releases on first cold start and cached:

| Platform | Cache |
|----------|-------|
| Cloudflare Workers | KV namespace (`FONT_KV`) |
| Deno Deploy | Deno KV (automatic) |
| Bun | In-memory only (per process) |

## Authentication

If `API_TOKEN` is set, all `/api/*` routes require:

```
Authorization: Bearer <your-secret-token>
```

## API

### GET /api/convert

```
GET /api/convert?url=<tweet_url>&theme=light|dim|dark
```

### POST /api/convert

```json
POST /api/convert
{
  "url": "https://x.com/user/status/123",
  "theme": "dark"
}
```

Returns `image/png`.

### Health Check

```
GET /health
```
