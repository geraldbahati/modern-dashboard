# Cloudflare Workers Hono Server

This is a Cloudflare Workers version of the Hono API server, designed to run on Cloudflare's edge network.

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Create a `.dev.vars` file in this directory for local development secrets:

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` with your actual values:

```env
AUTH_DATABASE_URL=postgresql://...
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your-secret-here
RESEND_API_KEY=your-api-key
```

**Important**: `.dev.vars` is for **secrets only**. Non-secret environment variables should be in `wrangler.jsonc` under the `vars` section.

### 3. Local Development

```bash
pnpm dev
```

This starts Wrangler's local development server at `http://localhost:8787`.

## Deployment

### Deploy to Cloudflare Workers

```bash
pnpm run deploy
```

### Configure Production Secrets

Set secrets using Wrangler CLI (not in wrangler.jsonc):

```bash
wrangler secret put AUTH_DATABASE_URL
wrangler secret put DATABASE_URL
wrangler secret put BETTER_AUTH_SECRET
wrangler secret put RESEND_API_KEY
```

## Type Generation

To generate TypeScript types based on your Worker configuration:

```bash
pnpm run cf-typegen
```

This generates a `worker-configuration.d.ts` file with your bindings.

## Differences from Node.js Server

### Environment Variables
- **Node.js server**: Uses `process.env` directly
- **Cloudflare Workers**: Uses `c.env` (Hono context) or Wrangler bindings
- We enable `nodejs_compat` flag for `process.env` support during development

### Security Middleware
- **Node.js server**: Uses Arcjet for rate limiting and bot protection
- **Cloudflare Workers**: Arcjet doesn't support Workers. Use Cloudflare's built-in features:
  - [Rate Limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
  - [WAF](https://developers.cloudflare.com/waf/)
  - [Bot Management](https://developers.cloudflare.com/bots/)

### Database
- Both use Neon's HTTP driver (`@neondatabase/serverless`), which works in Workers
- Connection pooling is handled by Neon's edge network

## Project Structure

```
apps/server-cloudflare/
├── src/
│   ├── index.ts              # Main Hono app
│   ├── lib/
│   │   ├── auth.ts           # Better Auth configuration
│   │   ├── db.ts             # Database middleware
│   │   └── rpc.ts            # oRPC handler
│   └── middleware/
│       ├── auth.ts           # Auth middleware
│       └── security.ts       # Security (placeholder)
├── wrangler.jsonc            # Wrangler configuration
├── .dev.vars                 # Local secrets (gitignored)
└── package.json
```

## API Endpoints

- `GET /` - Health check
- `GET /health` - Detailed health status
- `POST|GET /api/auth/**` - Better Auth endpoints
- `POST /api/rpc/*` - oRPC procedures
- `GET /api/session` - Current session info
- `GET /api/protected` - Example protected route

## Cloudflare Workers Limits

- **CPU time**: 50ms (free), 50ms/500ms (paid)
- **Memory**: 128MB
- **Request size**: 100MB
- **Subrequests**: 50 (free), 1000 (paid)

See [Cloudflare Workers Limits](https://developers.cloudflare.com/workers/platform/limits/) for details.

## Troubleshooting

### "process is not defined"
- Ensure `nodejs_compat` is enabled in `wrangler.jsonc`
- Check that environment variables are in `.dev.vars` or set via `wrangler secret`

### Database connection errors
- Verify `AUTH_DATABASE_URL` and `DATABASE_URL` are correct
- Ensure Neon database allows connections from Cloudflare IPs

### CORS issues
- Update `FRONTEND_URL` in `wrangler.jsonc` to match your frontend domain

## Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Hono Documentation](https://hono.dev/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
