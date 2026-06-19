# LiveStreamLab

## Local Run

Use the one-command launcher:

```powershell
./scripts/start-local.ps1
```

Optional custom ports:

```powershell
./scripts/start-local.ps1 -FrontendPort 3000 -BackendPort 4000
```

The script now wires these automatically:

- `FRONTEND_ORIGIN` for backend route-refresh fallback
- `NEXT_PUBLIC_BACKEND_ORIGIN` for frontend auth/web3 calls

## Refresh 404 Fix

If hard-refreshing routes like `/dashboard/home` or `/creator/buy-name` gives 404 in your deployed environment, set backend `FRONTEND_ORIGIN` to your real frontend URL. The backend will redirect browser HTML requests to frontend routes instead of returning JSON 404.

## Web3 Name System

Implemented endpoints:

- `GET /web3/name/check?name=anthony`
- `POST /web3/name/purchase` (auth required)
- `GET /web3/name/my` (auth required)
- `GET /web3/name/profile/:name`

Frontend routes:

- `/creator/buy-name`
- `/u/:name`

## Environment Files

- Backend template: `backend/.env.example`
- Frontend template: `frontend/.env.example`
