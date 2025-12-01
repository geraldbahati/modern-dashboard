# Deploying Hono API Server to Cloudflare Workers

This guide explains how to deploy the Hono API server to Cloudflare Workers.

## Prerequisites

- Cloudflare account ([sign up](https://dash.cloudflare.com/sign-up))
- Wrangler CLI (already installed in package.json)
- Neon PostgreSQL databases (auth + app)
- Environment variables ready

## Local Development

For local development, use Wrangler's dev server:

```bash
cd apps/server-cloudflare
pnpm dev
```

This provides:
- Local Cloudflare Workers runtime (`workerd`)
- Hot reloading
- Access to `.dev.vars` secrets
- Runs on **http://localhost:8787**

## Production Deployment

### 1. First-Time Setup

Login to Cloudflare:

```bash
pnpm wrangler login
```

### 2. Configure Environment Variables

The server needs both **non-secret variables** (in `wrangler.jsonc`) and **secrets** (via Wrangler CLI).

#### Update `wrangler.jsonc`:

```jsonc
{
  "name": "modern-dashboard-server",
  "vars": {
    "NODE_ENV": "production",
    "BETTER_AUTH_URL": "https://modern-dashboard-server.your-subdomain.workers.dev",
    "FRONTEND_URL": "https://modern-dashboard-web.your-subdomain.workers.dev"
  }
}
```

#### Set Secrets:

```bash
cd apps/server-cloudflare

# Required secrets
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

When prompted, paste the value for each secret.

### 3. Deploy

```bash
pnpm deploy
```

This will:
1. Bundle your Hono app
2. Upload to Cloudflare Workers
3. Deploy to your account

Your API will be available at:
- `https://modern-dashboard-server.<your-subdomain>.workers.dev`

### 4. Verify Deployment

Test the health endpoint:

```bash
curl https://modern-dashboard-server.<your-subdomain>.workers.dev/health
```

Expected response:
```json
{"status":"healthy","timestamp":"2025-12-01T..."}
```

### 5. Configure Custom Domain (Optional)

For a custom domain like `api.yourdomain.com`:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select Workers & Pages → `modern-dashboard-server`
3. Go to **Settings** → **Triggers** → **Custom Domains**
4. Click **Add Custom Domain**
5. Enter your domain (e.g., `api.yourdomain.com`)

Update `wrangler.jsonc`:

```jsonc
{
  "vars": {
    "BETTER_AUTH_URL": "https://api.yourdomain.com",
    "FRONTEND_URL": "https://yourdomain.com"
  }
}
```

Update your Next.js web app's environment variables:

```bash
# In apps/web
pnpm wrangler secret put NEXT_PUBLIC_API_URL
# Enter: https://api.yourdomain.com
```

Redeploy both:

```bash
# Server
cd apps/server-cloudflare && pnpm deploy

# Web
cd apps/web && pnpm deploy
```

## Architecture

### API Communication

The Cloudflare Workers server provides:

1. **Better Auth endpoints**: `POST|GET /api/auth/**`
2. **oRPC procedures**: `POST /api/rpc/*`
3. **Health checks**: `GET /health`

### Database Access

- Uses Neon's HTTP driver (`@neondatabase/serverless`)
- Perfect for Workers environment (no TCP connections)
- Dual databases: auth + app

### Security Features

Since Arcjet doesn't work in Cloudflare Workers, we use:

- **WAF**: Basic pattern matching for SQL injection, XSS, path traversal
- **Bot Detection**: User-Agent based (allows search engines, blocks scrapers)
- **Rate Limiting**: Cloudflare's native rate limiting API (requires paid plan)

For production, enable Cloudflare's built-in security:
- [Cloudflare WAF](https://developers.cloudflare.com/waf/)
- [Bot Management](https://developers.cloudflare.com/bots/)
- [Rate Limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)

### Rate Limiting Setup (Paid Plan)

Uncomment in `wrangler.jsonc`:

```jsonc
{
  "rate_limiting": {
    "limits": [
      {
        "binding": "AUTH_RATE_LIMITER",
        "simple": {
          "limit": 10,
          "period": 60
        }
      },
      {
        "binding": "API_RATE_LIMITER",
        "simple": {
          "limit": 100,
          "period": 60
        }
      }
    ]
  }
}
```

## Supported Features

✅ Hono web framework
✅ Better Auth (email/password, 2FA, passkeys, OAuth)
✅ oRPC type-safe procedures
✅ Drizzle ORM with Neon
✅ CORS configuration
✅ Session management
✅ Role-based access control (RBAC)
✅ Multi-session support

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check (basic) |
| `/health` | GET | Health check (detailed) |
| `/api/auth/**` | POST/GET | Better Auth endpoints |
| `/api/rpc/*` | POST | oRPC procedures |
| `/api/session` | GET | Get current session |
| `/api/protected` | GET | Example protected route |

## Environment Variables Reference

### Non-Secret (wrangler.jsonc `vars`)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `BETTER_AUTH_URL` | Server URL | `https://api.yourdomain.com` |
| `FRONTEND_URL` | Frontend URL | `https://yourdomain.com` |

### Secrets (via `wrangler secret put`)

| Variable | Description | Required |
|----------|-------------|----------|
| `AUTH_DATABASE_URL` | Auth database connection string | ✅ Yes |
| `DATABASE_URL` | App database connection string | ✅ Yes |
| `BETTER_AUTH_SECRET` | Auth secret (min 32 chars) | ✅ Yes |
| `RESEND_API_KEY` | Email service API key | ✅ Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ❌ Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | ❌ Optional |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | ❌ Optional |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | ❌ Optional |

## Cloudflare Workers Limits

| Resource | Free Plan | Paid Plan |
|----------|-----------|-----------|
| CPU Time | 10ms | 50ms / 500ms |
| Memory | 128MB | 128MB |
| Request Size | 100MB | 100MB |
| Subrequests | 50 | 1000 |
| KV Reads | 100,000/day | Unlimited |
| KV Writes | 1,000/day | Unlimited |

See [Cloudflare Workers Limits](https://developers.cloudflare.com/workers/platform/limits/) for details.

## Troubleshooting

### "process is not defined"

**Solution**: Ensure `nodejs_compat` is enabled in `wrangler.jsonc`:

```jsonc
{
  "compatibility_flags": ["nodejs_compat"]
}
```

### Database Connection Errors

**Check**:
1. `AUTH_DATABASE_URL` and `DATABASE_URL` are correct
2. Neon database is accessible
3. Connection strings include `?sslmode=require`

### CORS Issues

**Solution**: Update `FRONTEND_URL` in `wrangler.jsonc` to match your frontend domain.

### Secrets Not Working

**Check**:
1. Secrets were set via `wrangler secret put` (not in `.dev.vars` for production)
2. You're logged into the correct Cloudflare account
3. Secrets are set for the correct Worker name

List secrets:
```bash
pnpm wrangler secret list
```

### Rate Limiting Not Working

**Note**: Rate limiting requires a Workers Paid plan ($5/month). If you see errors about `limits.cpu_ms`, comment out the `rate_limiting` section in `wrangler.jsonc`.

## Monitoring

### View Logs

```bash
# Tail live logs
pnpm wrangler tail

# Tail with filters
pnpm wrangler tail --status error
pnpm wrangler tail --method POST
```

### Cloudflare Dashboard

View analytics and logs:
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Workers & Pages → `modern-dashboard-server`
3. Check:
   - **Metrics**: Requests, errors, CPU time
   - **Logs**: Real-time logs
   - **Analytics**: Usage stats

## Updating Deployment

To update your deployment:

```bash
# Make code changes
# ...

# Redeploy
pnpm deploy
```

## Rollback

If something goes wrong, you can rollback to a previous deployment:

1. Go to Cloudflare Dashboard
2. Workers & Pages → `modern-dashboard-server`
3. **Deployments** tab
4. Find the previous working deployment
5. Click **Rollback**

## Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Hono Framework](https://hono.dev/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [Better Auth Documentation](https://www.better-auth.com/)
- [Neon Serverless Driver](https://neon.tech/docs/serverless/serverless-driver)
- [oRPC Documentation](https://orpc.unnoq.com/)

## Next Steps

After deploying the server:

1. Deploy the Next.js web app to Cloudflare Workers (see `apps/web/CLOUDFLARE.md`)
2. Update Next.js environment variables to point to your deployed API
3. Configure custom domains for both server and web app
4. Enable Cloudflare WAF and Bot Management in the dashboard
5. Set up monitoring and alerts
