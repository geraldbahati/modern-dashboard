# Cloudflare Workers Deployment Checklist

Use this checklist to deploy your Hono API server to Cloudflare Workers.

## ✅ Pre-Deployment Checklist

### Local Setup (Complete)

- [x] `.dev.vars` created with actual credentials
- [x] `.gitignore` configured to exclude secrets
- [x] `wrangler.jsonc` configured
- [x] Local server tested and working on `http://localhost:8787`
- [x] Health endpoint responding: `GET /health`
- [x] Root endpoint responding: `GET /`

### Production Configuration

- [ ] Update `wrangler.jsonc` with production URLs:
  ```jsonc
  {
    "vars": {
      "NODE_ENV": "production",
      "BETTER_AUTH_URL": "https://server-cloudflare.geraldbahati.workers.dev",
      "FRONTEND_URL": "https://modern-dashboard-web.pages.dev"
    }
  }
  ```

- [ ] Verify worker name in `wrangler.jsonc`:
  ```jsonc
  {
    "name": "modern-dashboard-server"
  }
  ```

## 🚀 Deployment Steps

### Step 1: Login to Cloudflare

```bash
cd apps/server-cloudflare
pnpm wrangler login
```

**Verify**: Browser should open for Cloudflare authentication

### Step 2: Set Production Secrets

```bash
# Set each secret (you'll be prompted for values)
pnpm wrangler secret put AUTH_DATABASE_URL
# Paste: postgresql://neondb_owner:npg_wXcHi90pbIqJ@ep-silent-star-admtvudn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

pnpm wrangler secret put DATABASE_URL
# Paste: postgresql://neondb_owner:npg_OcDdmWM5xT0I@ep-noisy-bar-ablnbns3-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require

pnpm wrangler secret put BETTER_AUTH_SECRET
# Paste: faGmOQ2PAliPd4SuoKaMjpxW2qnH8UUr

pnpm wrangler secret put RESEND_API_KEY
# Paste: re_gv883RRn_Q5oNkwXZvuJET8rppTdcUUMP

# OAuth secrets
pnpm wrangler secret put GOOGLE_CLIENT_ID
# Paste: 1072758171701-8u2e5h1qlf71tc2pvcd0eso760obh5qj.apps.googleusercontent.com

pnpm wrangler secret put GOOGLE_CLIENT_SECRET
# Paste: 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

pnpm wrangler secret put GITHUB_CLIENT_ID
# Paste: Ov23li6sQs2HCZWwSrPS

pnpm wrangler secret put GITHUB_CLIENT_SECRET
# Paste: 9662286fba2f934fe1069cdfcc6e4e6b2552c1d3
```

**Verify secrets**:
```bash
pnpm wrangler secret list
```

### Step 3: Deploy

```bash
pnpm deploy
```

**Expected output**:
```
✨ Built successfully
✨ Uploaded successfully
✨ Published to https://modern-dashboard-server.<your-subdomain>.workers.dev
```

### Step 4: Verify Deployment

```bash
# Test health endpoint
curl https://modern-dashboard-server.<your-subdomain>.workers.dev/health

# Expected response:
# {"status":"healthy","timestamp":"2025-12-01T..."}
```

## 🔍 Post-Deployment Verification

### API Endpoints to Test

1. **Health Check**:
   ```bash
   curl https://server-cloudflare.geraldbahati.workers.dev/health
   ```
   ✅ Should return: `{"status":"healthy","timestamp":"..."}`

2. **Root Endpoint**:
   ```bash
   curl https://server-cloudflare.geraldbahati.workers.dev/
   ```
   ✅ Should return: `{"status":"ok","message":"Hono server is running"}`

3. **Auth Endpoints**:
   ```bash
   curl https://server-cloudflare.geraldbahati.workers.dev/api/auth/get-session
   ```
   ✅ Should return session info or auth error

### Monitor Deployment

```bash
# View live logs
pnpm wrangler tail

# View logs in dashboard
# Visit: https://dash.cloudflare.com/
# Navigate to: Workers & Pages → modern-dashboard-server → Logs
```

## 🔗 Update Frontend Configuration

After deploying the server, update your Next.js web app:

### Option 1: Deploy Next.js to Cloudflare Workers

```bash
cd apps/web

# Update wrangler.jsonc
# Set NEXT_PUBLIC_API_URL and NEXT_PUBLIC_AUTH_URL

# Deploy
pnpm deploy
```

### Option 2: Update Environment Variables

If frontend is deployed elsewhere:

```bash
# Set these environment variables in your deployment platform
NEXT_PUBLIC_API_URL=https://server-cloudflare.geraldbahati.workers.dev
NEXT_PUBLIC_AUTH_URL=https://server-cloudflare.geraldbahati.workers.dev/api/auth
BETTER_AUTH_URL=https://server-cloudflare.geraldbahati.workers.dev
```

## 🎯 Custom Domain (Optional)

### Configure Custom Domain in Cloudflare

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Workers & Pages → `modern-dashboard-server`
3. Settings → Triggers → Custom Domains
4. Click "Add Custom Domain"
5. Enter: `api.yourdomain.com`

### Update Configuration

After setting custom domain:

```jsonc
// wrangler.jsonc
{
  "vars": {
    "BETTER_AUTH_URL": "https://api.yourdomain.com",
    "FRONTEND_URL": "https://yourdomain.com"
  }
}
```

Redeploy:
```bash
pnpm deploy
```

## 📊 Monitoring & Maintenance

### View Analytics

Dashboard → Workers & Pages → modern-dashboard-server → Analytics

**Metrics to monitor**:
- Requests per minute
- Error rate
- CPU time usage
- Success rate

### Update Deployment

To deploy updates:

```bash
# Make your code changes
# ...

# Redeploy
cd apps/server-cloudflare
pnpm deploy
```

### Rollback (if needed)

Dashboard → Workers & Pages → modern-dashboard-server → Deployments → Select previous version → Rollback

## 🔧 Troubleshooting

### Deployment fails

**Check**:
- Wrangler is logged in: `pnpm wrangler whoami`
- All dependencies installed: `pnpm install`
- TypeScript compiles: `pnpm tsc --noEmit`

### Runtime errors

**Check**:
- All secrets are set: `pnpm wrangler secret list`
- Database URLs are correct
- CORS configuration matches frontend URL

### Database connection errors

**Verify**:
- Neon databases are accessible
- Connection strings include `?sslmode=require`
- IP restrictions allow Cloudflare Workers

## 📝 Current Configuration

**Worker Name**: `modern-dashboard-server`
**Production URL**: `https://server-cloudflare.geraldbahati.workers.dev`
**Frontend URL**: `https://modern-dashboard-web.pages.dev`

**Secrets Set**:
- ✅ AUTH_DATABASE_URL
- ✅ DATABASE_URL
- ✅ BETTER_AUTH_SECRET
- ✅ RESEND_API_KEY
- ✅ GOOGLE_CLIENT_ID
- ✅ GOOGLE_CLIENT_SECRET
- ✅ GITHUB_CLIENT_ID
- ✅ GITHUB_CLIENT_SECRET

## 🎉 Success Criteria

Your deployment is successful when:

- [x] Worker deploys without errors
- [ ] Health endpoint responds: `https://server-cloudflare.geraldbahati.workers.dev/health`
- [ ] Auth endpoints work: `/api/auth/*`
- [ ] RPC endpoints work: `/api/rpc/*`
- [ ] Frontend can communicate with API
- [ ] User authentication works end-to-end
- [ ] Database queries execute successfully

## 📚 Resources

- [Cloudflare Workers Dashboard](https://dash.cloudflare.com/)
- [Wrangler Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Project README](./README.md)
- [Deployment Guide](./CLOUDFLARE.md)
