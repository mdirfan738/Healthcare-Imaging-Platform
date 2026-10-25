# RIS Frontend

React + TypeScript frontend for the Radiology Information System.

## Installation

```bash
cd frontend
npm install
```

Requires Node.js 20+.

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the PACS API (including `/api/v1`) | `http://localhost:8080/api/v1` |
| `VITE_ENV` | Environment label (informational) | `development` |

Vite only reads `VITE_*` variables and inlines them at **build** time — changing `.env.local` requires restarting `npm run dev` or rebuilding.

## Running Locally

```bash
npm run dev
```

Runs at http://localhost:3000. Make sure the PACS API is running (see [`../backend/README.md`](../backend/README.md)) and `VITE_API_BASE_URL` points at it.

Default login (after seeding via the backend): username `admin` (see backend README for setting a real password before first use — the seeded hash is a placeholder).

## Testing

```bash
npm test                # watch mode
npm run test:coverage   # single run + coverage report (used in CI)
```

Tests use Vitest + React Testing Library and live under `src/__tests__/`. Current coverage includes:
- `authSlice` reducer behavior (login pending/fulfilled/rejected, logout, error clearing)
- RBAC `hasPermission` logic for every role/permission combination
- `StatusChip` rendering
- `LoginPage` form rendering and interaction

Run linting and type-checking (also run in CI):

```bash
npm run lint
npm run type-check
```

## Build Process

```bash
npm run build
```

Outputs an optimized static bundle to `build/`, which is what the Docker image serves via Nginx (see `Dockerfile` and `nginx.conf`). The Nginx config:
- Falls back to `index.html` for all client-side routes (SPA routing)
- Aggressively caches hashed static assets, never caches `index.html`
- Sets baseline security headers (`X-Frame-Options`, `X-Content-Type-Options`, etc.)

## Project Structure

```
src/
├── api/            # One Axios module per feature (patientsApi, studiesApi, ...)
├── app/            # Redux store + typed useAppDispatch/useAppSelector hooks
├── components/
│   ├── common/     # PageHeader, StatusChip, LoadingOverlay
│   ├── layout/     # AppLayout (sidebar nav, app bar, role-filtered menu)
│   └── rbac/       # permissions.ts, RequireAuth, RequireRole, Can
├── features/       # Redux Toolkit slices, one per domain (auth, patients, ...)
├── pages/          # Route-level screens
├── routes/         # AppRoutes.tsx — all route definitions + guards
├── theme/          # MUI theme (palette, typography)
└── types/          # Shared TypeScript interfaces mirroring backend DTOs
```

## Authentication & RBAC

- On login, the API returns a short-lived JWT access token + a longer-lived refresh token; both are stored in `localStorage` and the access token is attached to every request via an Axios interceptor.
- A response interceptor catches `401`s, performs a single silent refresh-token exchange (queuing concurrent requests during the refresh), and retries the original request — or redirects to `/login` if the refresh itself fails.
- `<RequireAuth />` gates all authenticated routes; `<RequireRole permission="...">` gates specific routes by role; the `<Can permission="...">` component conditionally renders buttons/menu items (e.g., hiding "Sign Report" from non-radiologists) without duplicating route-level checks.
- The permission → role mapping lives in `components/rbac/permissions.ts` and is intentionally kept in sync with the backend's `[Authorize(Roles = "...")]` attributes — the frontend check is a UX convenience, **not** a security boundary; the API enforces authorization independently.
