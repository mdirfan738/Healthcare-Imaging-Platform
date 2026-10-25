# DevOps Guide

CI/CD, security scanning, Docker, deployment, and monitoring for the Healthcare Imaging Platform.

## GitHub Actions Workflow Explanation

Three workflows live in `.github/workflows/`:

### `ci.yml` — main pipeline (push/PR to `main`/`develop`)

Jobs run in this dependency order:

1. **Build Dependencies** — `frontend-deps` (`npm install`), `backend-deps` (`dotnet restore`), in parallel.
2. **Code Quality** — `frontend-code-quality` (ESLint + `tsc --noEmit`), `backend-code-quality` (`dotnet format --verify-no-changes`), each depending on their `-deps` job.
3. **Unit Testing** — `frontend-tests` (Jest + coverage, uploaded as an artifact), `backend-tests` (xUnit + `XPlat Code Coverage`, uploaded as an artifact).
4. **Security Scanning** (runs in parallel with/after the above): `codeql-analysis` (JS/TS + C#, matrix job), `gitleaks-scan`, `npm-audit` (`--audit-level=high`), `dotnet-vulnerability-scan` (`dotnet list package --vulnerable`, fails on any "critical"/"high severity" match).
5. **Build** — `frontend-build` (`npm run build`, needs tests + audit to pass), `backend-build` (`dotnet publish`, needs tests + vuln scan to pass).
6. **Docker Build + Push** — `docker-build-push` (only on push to `main`/`develop`): builds both images, **Trivy-scans each before pushing** (`exit-code: 1` on CRITICAL/HIGH), then pushes to GHCR tagged with both the commit SHA and `latest`.

### `codeql-scheduled.yml` — weekly deep scan
Runs `security-extended` CodeQL queries every Monday 03:00 UTC (broader/slower ruleset than the PR-time scan) and is also manually triggerable.

### `deploy.yml` — deployment
Triggered automatically when `ci.yml` completes successfully on `main`, or manually via `workflow_dispatch` (choose `staging`/`production`). SSHes into the target host, pulls the latest images from GHCR, and re-runs `docker compose up -d`. See [Deployment Steps](#deployment-steps).

`dependabot.yml` keeps npm, NuGet, Docker base images, and GitHub Actions themselves up to date on a weekly cadence.

## Security Scanning Details

| Tool | What it checks | Where configured | Failure behavior |
|---|---|---|---|
| **CodeQL** | Static analysis for security + quality issues in JS/TS and C# | `.github/codeql/codeql-config.yml`, run via `github/codeql-action` | Findings surface in the Security tab; `security-extended` queries run weekly |
| **Gitleaks** | Hardcoded secrets/credentials in the diff and history | `devops/security/.gitleaks.toml` (allowlists known placeholder strings like `CHANGE_ME_*`, `devpassword`) | Action exits non-zero → job fails on any real match |
| **npm audit** | Known-vulnerable JS dependencies | `frontend/package.json` | `--audit-level=high` → fails on high/critical |
| **dotnet vulnerability scan** | Known-vulnerable NuGet packages (incl. transitive) | n/a (uses `dotnet list package --vulnerable`) | Custom check greps for "critical"/"high severity" and fails the step |
| **Trivy** | OS + library vulnerabilities inside built container images | Inline in `ci.yml` (`aquasecurity/trivy-action`) | `severity: CRITICAL,HIGH`, `exit-code: 1` → blocks the push-to-GHCR step |

**Net effect:** a critical vulnerability, a leaked secret, or a high-risk finding in either app or either image blocks the pipeline before anything reaches GHCR or production.

The Gitleaks allowlist exists because this reference repo intentionally ships example config files (`appsettings.json`, `docker-compose.yml`, seed SQL) containing clearly-labeled placeholder values (`CHANGE_ME_...`, `devpassword`) — these are not real secrets, but without an allowlist entry Gitleaks would still (correctly) flag the pattern. Real deployments should inject actual secrets via environment variables / a secrets manager and never commit them, placeholder or not.

## Docker Build Process

Both `backend/Dockerfile` and `frontend/Dockerfile` are multi-stage:

**Backend (`backend/Dockerfile`):**
1. `mcr.microsoft.com/dotnet/sdk:8.0` — restores + `dotnet publish`s `PACS.Api`
2. `mcr.microsoft.com/dotnet/aspnet:8.0` — copies only the publish output; runs as a non-root `pacsuser`; exposes `8080`; `HEALTHCHECK` hits `/health`

**Frontend (`frontend/Dockerfile`):**
1. `node:20-alpine` — `npm install` + `npm run build` (bakes in `REACT_APP_API_BASE_URL` as a build arg)
2. `nginx:1.27-alpine` — serves the static `build/` output via `nginx.conf` (SPA fallback routing, cache headers, security headers); runs as the non-root `nginx` user; exposes `3000`; `HEALTHCHECK` curls `/`

Images are tagged with both the commit SHA (immutable, for rollback) and `latest`, and pushed to `ghcr.io/<org>/<repo>/pacs-api` and `ghcr.io/<org>/<repo>/ris-frontend`.

## Deployment Steps

Deployment is deliberately simple — **Docker Compose on a single host, no Kubernetes/Helm/service mesh**:

### Manual deployment

```bash
git clone <repo> && cd healthcare-imaging-platform
cp .env.example .env   # set real secrets
docker compose up -d --build
```

### Automated deployment (`deploy.yml`)

1. `ci.yml` completes successfully on `main` (or you manually dispatch `deploy.yml`).
2. GitHub Actions SSHes into `secrets.DEPLOY_HOST` as `secrets.DEPLOY_USER` using `secrets.DEPLOY_SSH_KEY`.
3. On the host: `git pull`, `docker login ghcr.io`, `docker compose pull pacs-api ris-frontend`, `docker compose up -d --remove-orphans`, prune dangling images, then a smoke-test `curl` against `/health`.

Required repository secrets: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `GHCR_PAT` (or reuse `GITHUB_TOKEN` if the deploy host can auth against GHCR that way).

Rolling back is `docker compose up -d` after tagging/pulling a previous commit-SHA image tag.

## Monitoring Setup

`docker-compose.yml` runs `prometheus`, `grafana`, and `postgres-exporter` alongside the app services.

- **Prometheus** (`devops/monitoring/prometheus/prometheus.yml`) scrapes:
  - `pacs-api:8080/metrics` (via `prometheus-net.AspNetCore`, wired up in `Program.cs` with `UseHttpMetrics()` / `MapMetrics()`)
  - `postgres-exporter:9187` (via `prometheuscommunity/postgres-exporter`)
- **Grafana** (`devops/monitoring/grafana/`) is provisioned automatically (datasource + dashboards) on startup:
  - `api-health.json` — up/down status, request rate by status code, 5xx error rate, p50/p95/p99 latency, in-flight requests
  - `app-performance.json` — .NET GC heap size, process CPU, requests by endpoint, thread pool size, DICOM upload latency
  - `database-metrics.json` — Postgres up/down, active connections, commit/rollback rate, DB size, rows fetched/returned, cache hit ratio

Access Grafana at `http://localhost:3001` using `GRAFANA_ADMIN_USER` / `GRAFANA_ADMIN_PASSWORD` from `.env`.

`Serilog` (configured in `Program.cs`) writes structured logs to console and to `/var/log/pacs/pacs-*.log` (a Docker volume), which is a natural extension point for shipping to an ELK/Loki stack if needed later.
