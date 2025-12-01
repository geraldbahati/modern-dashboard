# Deploying Next.js to Cloudflare Workers

This guide explains how to deploy the Next.js web app to Cloudflare Workers using the OpenNext Cloudflare adapter.

## Prerequisites

- Cloudflare account
- Wrangler CLI installed (already added as devDependency)
- Access to your database URLs (Neon PostgreSQL)

## Local Development

For local development, continue using the Next.js dev server:

```bash
pnpm dev
```

This provides the best developer experience with hot reloading.

## Preview with Cloudflare Runtime

To test your app in the Cloudflare Workers runtime locally:

```bash
pnpm preview
```

This command:
1. Builds your app with the OpenNext adapter
2. Starts a local Wrangler dev server using the `workerd` runtime

**Important**: Use `preview` for integration testing as it's more accurate to the production environment than `dev`.

## Deployment

### 1. First-time Setup

Login to Cloudflare via Wrangler:

```bash
pnpm wrangler login
```

### 2. Configure Environment Variables

The app needs the following environment variables. Set them as Wrangler secrets:

```bash
# Navigate to the web app directory
cd apps/web

# Set secrets (you'll be prompted to enter each value)
pnpm wrangler secret put BETTER_AUTH_SECRET
pnpm wrangler secret put BETTER_AUTH_URL
pnpm wrangler secret put AUTH_DATABASE_URL
pnpm wrangler secret put RESEND_API_KEY

# Optional OAuth secrets
pnpm wrangler secret put GOOGLE_CLIENT_ID
pnpm wrangler secret put GOOGLE_CLIENT_SECRET
pnpm wrangler secret put GITHUB_CLIENT_ID
pnpm wrangler secret put GITHUB_CLIENT_SECRET
```

### 3. Configure Build-time Environment Variables

For `NEXT_PUBLIC_*` variables that need to be embedded in the build, update `wrangler.jsonc`:

```jsonc
{
  // ... existing config
  "vars": {
    "NEXT_PUBLIC_AUTH_URL": "https://your-api-domain.com/api/auth"
  }
}
```

Or set them via environment variables before deploying:

```bash
NEXT_PUBLIC_AUTH_URL=https://your-api.com/api/auth pnpm deploy
```

### 4. Deploy

```bash
pnpm deploy
```

This will:
1. Build your Next.js app with the OpenNext adapter
2. Bundle it for Cloudflare Workers
3. Deploy to your Cloudflare account

Your app will be available at:
- `https://modern-dashboard-web.<your-subdomain>.workers.dev`

### 5. Configure Custom Domain (Optional)

1. Go to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your Worker (`modern-dashboard-web`)
3. Go to **Settings** → **Triggers**
4. Add a custom domain

Update your environment variables to match:

```bash
pnpm wrangler secret put NEXT_PUBLIC_AUTH_URL
# Enter: https://yourdomain.com/api/auth
```

## Architecture Considerations

### API Communication

The Next.js app communicates with the Hono API server. In production:

1. **Client-side requests** use `NEXT_PUBLIC_API_URL` (browser → API)
2. **Server-side requests** (Server Actions, RSC) also use `NEXT_PUBLIC_API_URL`

For best performance, deploy both:
- Next.js app → Cloudflare Workers
- Hono API → Cloudflare Workers (already configured in `apps/server-cloudflare`)

### Database Access

- The app uses Neon's HTTP driver which works perfectly in Workers
- No connection pooling needed - Neon handles this at the edge

### Static Assets

OpenNext automatically handles static assets:
- Images, fonts, and public files are served via Workers Assets
- Optimized for Cloudflare's CDN

## Supported Next.js Features

✅ App Router
✅ Server Components
✅ Server Actions
✅ Middleware
✅ Partial Prerendering (PPR)
✅ Image Optimization (via Cloudflare Images)
✅ ISR (Incremental Static Regeneration)
✅ Streaming
✅ `next/after` async work

## Configuration Files

### `wrangler.jsonc`

Main Cloudflare Workers configuration:
- Worker entry point: `.open-next/worker.js`
- Assets directory: `.open-next/assets`
- Compatibility date and flags

### `open-next.config.ts`

OpenNext adapter configuration:
- Cache settings
- Route handlers
- Custom configurations

See [OpenNext Cloudflare docs](https://opennext.js.org/cloudflare) for advanced configuration.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js dev server (Node.js) |
| `pnpm preview` | Build and preview with Cloudflare runtime |
| `pnpm deploy` | Build and deploy to Cloudflare |
| `pnpm cf-typegen` | Generate TypeScript types for Cloudflare env |

## Troubleshooting

### Build Errors

If the build fails, check:
1. All dependencies are installed: `pnpm install`
2. TypeScript compiles: `pnpm tsc --noEmit`
3. Next.js builds locally: `pnpm build`

### Runtime Errors

For errors in production:
1. Check Wrangler logs: `pnpm wrangler tail`
2. Verify environment variables are set
3. Test locally with `pnpm preview` first

### Environment Variables Not Working

- `NEXT_PUBLIC_*` vars must be set at build time
- Regular secrets must be set via `wrangler secret put`
- Secrets are not visible in `wrangler.jsonc`

## Performance Tips

1. **Enable Cloudflare Images** for optimized image delivery
2. **Use ISR** for static-ish pages that change occasionally
3. **Enable Caching** in `open-next.config.ts`
4. **Deploy close to users** - Workers run globally

## Resources

- [OpenNext Cloudflare Adapter](https://opennext.js.org/cloudflare)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Next.js on Cloudflare Guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
