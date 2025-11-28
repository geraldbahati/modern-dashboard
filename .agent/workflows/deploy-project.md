---
description: How to deploy the Turborepo project (Web to Vercel, Server to Docker)
---

# Deploying Modern Dashboard

This project is a monorepo with two main applications:

1.  **Web App (`apps/web`)**: Next.js application.
2.  **Server App (`apps/server`)**: Hono application running on Bun.

## 1. Deploying the Web App (Vercel)

The `apps/web` application is optimized for Vercel.

1.  Push your code to a Git repository (GitHub, GitLab, Bitbucket).
2.  Import the project into Vercel.
3.  Vercel should automatically detect the Next.js app.
4.  **Root Directory**: Keep it as `./`.
5.  **Framework Preset**: Next.js.
6.  **Build Command**: `cd apps/web && npx next build` (or let Vercel auto-detect `turbo build`).
    - _Note_: The `vercel.json` in the root is configured to ignore build steps if only the server changed, optimizing build usage.
7.  **Environment Variables**: Add your `.env` variables to Vercel.

## 2. Deploying the Server App (Docker)

The `apps/server` application uses Bun. The best way to deploy it is via Docker to preserve the runtime.

### Prerequisites

- Docker installed and running.
- A cloud provider that supports Docker (Railway, Fly.io, DigitalOcean, AWS App Runner, etc.).

### Local Build Test

To test the build locally:

```bash
docker build -f apps/server/Dockerfile . -t modern-dashboard-server
docker run -p 3001:3001 modern-dashboard-server
```

### Deploying to Railway (Example)

1.  Connect your GitHub repo to Railway.
2.  Add a service from the repo.
3.  Configure the service:
    - **Dockerfile Path**: `apps/server/Dockerfile`
    - **Context**: `/` (Root of the monorepo)
4.  Add Environment Variables.
5.  Railway will build and deploy the container.

### Deploying to Fly.io (Example)

1.  Install `flyctl`.
2.  Run `fly launch` in the root.
3.  When asked for the Dockerfile, specify `apps/server/Dockerfile`.
4.  Follow the prompts.

## 3. CLI Deployment & Remote Caching (Optional)

Since you are logged into Turbo and Vercel, you can set up Remote Caching and deploy via CLI.

### Remote Caching (TurboRepo)

Link your local project to your Vercel/Turbo remote cache to speed up builds.

```bash
npx turbo link
```

Follow the prompts to select your Vercel scope.

### Vercel CLI Deployment

To deploy the web app directly from your terminal:

> [!NOTE]
> Do not run `turbo deploy`. TurboRepo does not have a built-in deploy command unless you define it. Use `vercel deploy` instead.

### Vercel CLI Deployment (Recommended Method)

To avoid errors with directory selection and file size limits, **navigate to the app directory first**.

**1. Deploying the Web App:**

```bash
cd apps/web
vercel deploy
```

- **Project Name**: `modern-dashboard-web`
- **Directory**: It will automatically detect `./` (which is correct because you are inside `apps/web`).

**2. Deploying the Server App:**

```bash
cd apps/server
vercel deploy
```

- **Project Name**: `modern-dashboard-server`
- **Directory**: It will automatically detect `./`.

## Troubleshooting

- **Docker Build Fails**: Ensure you are running the build from the **root** of the monorepo, not inside `apps/server`.
  - Correct: `docker build -f apps/server/Dockerfile .`
  - Incorrect: `cd apps/server && docker build .`
- **Missing Dependencies**: The Dockerfile uses `turbo prune` to isolate dependencies. If a package is missing, check if it's correctly listed in `package.json`.
