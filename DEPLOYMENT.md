# Deployment Checklist

## 1) Deploy Backend (Railway)

Set these environment variables:

- `BACKEND_PORT=4000`
- `FRONTEND_ORIGIN=https://livestreamlab.live`
- `SESSION_SECRET=<strong-random-secret>`
- `SESSION_TTL_SECONDS=604800`
- `ADMIN_GOOGLE_IDS=<comma-separated founder IDs>`
- `ADMIN_TWITCH_IDS=<comma-separated founder IDs>`
- `ADMIN_X_IDS=<comma-separated founder IDs>`
- `ADMIN_YOUTUBE_IDS=<comma-separated founder IDs>`
- `ADMIN_PHANTOM_IDS=<comma-separated founder wallet addresses>`
- `WEB3_NAME_PRICE=500`

Notes:

- Expose backend at `https://api.livestreamlab.live`
- Ensure backend process starts `backend/app.js`

## 2) Deploy Frontend (Vercel)

Set these environment variables:

- `NEXT_PUBLIC_BACKEND_ORIGIN=https://api.livestreamlab.live`
- `DASHBOARD_API_BASE_URL=https://api.livestreamlab.live`
- `DASHBOARD_API_TOKEN=` (optional, only if needed for proxy auth)

Notes:

- Build command: `npm run build`
- Start command: `npm run start`

## 3) DNS Mapping

- `livestreamlab.live` -> Vercel project
- `www.livestreamlab.live` -> Vercel project (optional)
- `api.livestreamlab.live` -> Railway service

## 4) Production Smoke Tests

Run the included script:

```powershell
./scripts/smoke-production.ps1 -FrontendOrigin "https://livestreamlab.live" -BackendOrigin "https://api.livestreamlab.live"
```

Optional mutating test (creates a unique name purchase attempt):

```powershell
./scripts/smoke-production.ps1 -FrontendOrigin "https://livestreamlab.live" -BackendOrigin "https://api.livestreamlab.live" -RunMutatingTests
```

Checks include:

- frontend + backend reachability
- refresh redirect behavior (`/dashboard/home` via backend)
- auth login/session
- web3 name check + name state
- optional name purchase + viewer profile route

## 5) Troubleshooting: Global 404 Failures

If smoke returns 404 for frontend and backend origins, DNS or platform target mapping is usually incorrect.

Validate quickly:

```powershell
Invoke-WebRequest https://livestreamlab.live/ -UseBasicParsing -MaximumRedirection 0
Invoke-WebRequest https://api.livestreamlab.live/ -UseBasicParsing -MaximumRedirection 0
```

Expected behavior:

- frontend origin should return app HTML for `/` and `/login`
- backend origin should return backend JSON for `/`
- backend origin should return `302` for `/dashboard/home` with `Accept: text/html`

Fix checklist:

- ensure `livestreamlab.live` and `www.livestreamlab.live` point to the correct Vercel project
- ensure `api.livestreamlab.live` points to the correct Railway service
- confirm Railway service has `FRONTEND_ORIGIN=https://livestreamlab.live`
- confirm Vercel project has `NEXT_PUBLIC_BACKEND_ORIGIN=https://api.livestreamlab.live`
- redeploy both services after env updates
