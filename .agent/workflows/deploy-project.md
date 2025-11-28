---
description: How to deploy the Turborepo project (Web to Vercel, Server to Vercel)
---

# Deploying Modern Dashboard

This project is a monorepo. The **only reliable way** to deploy it to Vercel (handling workspace dependencies correctly) is via **Git Integration**.

> [!IMPORTANT]
> **Do not use `vercel deploy` CLI** for the server app. It uploads files in isolation, breaking workspace dependencies (like `@workspace/api`).

## Prerequisites

1.  Push your code to a Git provider (GitHub, GitLab, Bitbucket).
2.  Log in to the [Vercel Dashboard](https://vercel.com/dashboard).

## 1. Deploying the Web App (`apps/web`)

1.  **New Project**: On Vercel, click **"Add New..."** > **"Project"**.
2.  **Import Git Repository**: Select your `modern-dashboard` repo.
3.  **Configure Project**:
    - **Project Name**: `modern-dashboard-web`
    - **Root Directory**: Click "Edit" and select `apps/web`.
    - **Framework Preset**: Next.js (Auto-detected).
4.  **Environment Variables**: Add your `.env` variables.
5.  **Deploy**: Click **Deploy**.

## 2. Deploying the Server App (`apps/server`)

1.  **New Project**: Click **"Add New..."** > **"Project"** (again).
2.  **Import Git Repository**: Select the **same** `modern-dashboard` repo.
3.  **Configure Project**:
    - **Project Name**: `modern-dashboard-server`
    - **Root Directory**: Click "Edit" and select `apps/server`.
    - **Framework Preset**: Select **Other**.
    - **Build Command**: Override and set to `npm run vercel-build` (or `echo 'Skipping build'`).
      - _Reason_: The default `build` script uses Bun, which Vercel doesn't support. We use the `api/index.ts` entry point instead.
    - **Output Directory**: Leave default (dist).
4.  **Environment Variables**: Add your `.env` variables.
5.  **Deploy**: Click **Deploy**.

## 3. Updating Deployments

Once set up, every time you `git push` to your main branch, Vercel will automatically redeploy both apps.

## Troubleshooting

- **"Unsupported URL Type workspace"**: This happens if you use Vercel CLI from a subdirectory. Use Git Integration as described above.
- **"File size > 2GB"**: Ensure `.vercelignore` exists in the root (we created this).
