# Cloudflare Workers Hono Server

This is a Cloudflare Workers version of the Hono API server, designed to run on Cloudflare's edge network.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# From the monorepo root
pnpm install

# Or from this directory
cd apps/server-cloudflare && pnpm install
```

### 2. Configure Environment Variables

Create a `.dev.vars` file in this directory for local development secrets:

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` with your actual values:

```env
# Database URLs (Neon PostgreSQL)
AUTH_DATABASE_URL=postgresql://user:password@host.neon.tech/auth_db?sslmode=require
DATABASE_URL=postgresql://user:password@host.neon.tech/app_db?sslmode=require

# Better Auth (min 32 characters)
BETTER_AUTH_SECRET=your-super-secret-random-string-here

# Email Service
RESEND_API_KEY=re_your_resend_api_key_here

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

**Important**: `.dev.vars` is for **secrets only**. Non-secret environment variables (URLs, NODE_ENV, etc.) should be configured in `wrangler.jsonc` under the `vars` section.

### 3. Update Non-Secret Variables

Edit `wrangler.jsonc` for development:

```jsonc
{
  "vars": {
    "NODE_ENV": "development",
    "BETTER_AUTH_URL": "http://localhost:8787",  // Local Wrangler dev server
    "FRONTEND_URL": "http://localhost:3000"      // Next.js dev server
  }
}
```

### 4. Start Local Development

```bash
pnpm dev
```

This starts Wrangler's local development server at **http://localhost:8787** using the Cloudflare Workers runtime (`workerd`).

## 📦 Deployment to Cloudflare Workers

### Prerequisites

- Cloudflare account (free tier works for testing)
- Wrangler CLI (already installed as devDependency)
- Production database URLs (Neon PostgreSQL)

### Step 1: Login to Cloudflare

```bash
pnpm wrangler login
```

This will open a browser window to authenticate with Cloudflare.

### Step 2: Update Production Configuration

Edit `wrangler.jsonc` and update the `vars` section for production:

```jsonc
{
  "name": "modern-dashboard-server",  // This will be your Worker name
  "vars": {
    "NODE_ENV": "production",
    "BETTER_AUTH_URL": "https://modern-dashboard-server.your-subdomain.workers.dev",
    "FRONTEND_URL": "https://modern-dashboard-web.your-subdomain.workers.dev"
  }
}
```

### Step 3: Set Production Secrets

**IMPORTANT**: Never put secrets in `wrangler.jsonc` or commit them to git. Use Wrangler's secret management:

```bash
# Navigate to this directory
cd apps/server-cloudflare

# Set each secret (you'll be prompted to enter the value)
pnpm wrangler secret put AUTH_DATABASE_URL
pnpm wrangler secret put DATABASE_URL
pnpm wrangler secret put BETTER_AUTH_SECRET
pnpm wrangler secret put RESEND_API_KEY

# Optional OAuth secrets
pnpm wrangler secret put GOOGLE_CLIENT_ID
pnpm wrangler secret put GOOGLE_CLIENT_SECRET
pnpm wrangler secret put GITHUB_CLIENT_ID
pnpm wrangler secret put GITHUB_CLIENT_SECRET
```

### Step 4: Deploy

```bash
pnpm deploy
```

Your API will be live at:
- **Production URL**: `https://modern-dashboard-server.<your-subdomain>.workers.dev`
- Example endpoints:
  - Health: `https://modern-dashboard-server.<your-subdomain>.workers.dev/health`
  - Auth: `https://modern-dashboard-server.<your-subdomain>.workers.dev/api/auth/*`
  - RPC: `https://modern-dashboard-server.<your-subdomain>.workers.dev/api/rpc/*`

### Step 5: Configure Custom Domain (Optional)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your Worker: `modern-dashboard-server`
3. Navigate to **Settings** → **Triggers** → **Custom Domains**
4. Add your custom domain (e.g., `api.yourdomain.com`)

Update `wrangler.jsonc` to reflect the custom domain:

```jsonc
{
  "vars": {
    "BETTER_AUTH_URL": "https://api.yourdomain.com",
    "FRONTEND_URL": "https://yourdomain.com"
  }
}
```

Then redeploy:

```bash
pnpm deploy
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
- **Node.js server**: Uses Arcjet for rate limiting, WAF, and bot protection
- **Cloudflare Workers**: Uses native Cloudflare features:
  - **Rate Limiting**: Configured via `limits` in `wrangler.jsonc`
    - `AUTH_RATE_LIMITER`: 10 requests/minute for auth routes
    - `API_RATE_LIMITER`: 100 requests/minute for API routes
  - **WAF**: Basic pattern matching for SQL injection, XSS, path traversal
  - **Bot Detection**: User-Agent based detection (allows search engines, blocks scrapers)

  For production:
  - Enable [Cloudflare WAF](https://developers.cloudflare.com/waf/) in dashboard
  - Enable [Bot Management](https://developers.cloudflare.com/bots/) for advanced bot detection
  - Adjust rate limits in `wrangler.jsonc` based on your needs

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
