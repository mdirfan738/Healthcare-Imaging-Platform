# Healthcare Imaging Platform

A production-grade reference implementation of a two-tier radiology platform:

- **RIS** (Radiology Information System) — React/TypeScript frontend for patient registration, scheduling, worklist, and reporting.
- **PACS** (Picture Archiving and Communication System) — .NET 8 Web API backend for patient/study/image management, DICOM storage, and reporting, with HL7/FHIR interoperability.

Built to demonstrate DICOM, HL7/FHIR, and HIPAA-aligned security practices in a realistic, deployable stack.

> New here? Start with [`docs/architecture.md`](docs/architecture.md) for diagrams, then jump to [Setup Instructions](#setup-instructions) below.

---

## Table of Contents

- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Folder Structure](#folder-structure)
- [Setup Instructions](#setup-instructions)
- [CI/CD Flow](#cicd-flow)
- [Security Controls](#security-controls)
- [Deployment Guide](#deployment-guide)
- [Further Documentation](#further-documentation)

---

## Architecture

See [`docs/architecture.md`](docs/architecture.md) for full diagrams (system context, layered backend, DICOM upload sequence, CI/CD flow). Summary:

```
[Receptionist/Tech/Radiologist/Admin]
            │  HTTPS
            ▼
   RIS Frontend (React, Nginx :3000)
            │  REST + JWT
            ▼
   PACS API (.NET 8, :8080) ──► Redis (cache)
            │
            ├──► PostgreSQL (patients, studies, series, images, reports, users, audit)
            └──► DICOM file storage (volume)

   Prometheus scrapes /metrics on PACS API → Grafana dashboards
```

The backend follows a **Clean Architecture** layering:

| Layer | Responsibility |
|---|---|
| `PACS.Domain` | Entities and enums only — no dependencies |
| `PACS.Application` | DTOs and service interfaces (contracts) |
| `PACS.Infrastructure` | EF Core, Redis, fo-dicom, JWT, HL7/FHIR, and service implementations |
| `PACS.Api` | Controllers, middleware, DI composition root (`Program.cs`) |

## Technology Stack

**Frontend (RIS):** React.js, TypeScript, Material UI, Redux Toolkit, Axios, React Router, Jest, ESLint

**Backend (PACS):** .NET 8 Web API, PostgreSQL, Entity Framework Core, Redis, JWT auth, Swagger, Serilog, xUnit, fo-dicom, HL7.Fhir.R4

**DevOps:** Docker, Docker Compose, GitHub Actions, GHCR, CodeQL, Gitleaks, Trivy, Prometheus, Grafana

## Folder Structure

```
healthcare-platform/
├── frontend/                      # RIS - React/TypeScript
│   ├── src/
│   │   ├── api/                   # Axios clients per feature
│   │   ├── app/                   # Redux store, typed hooks
│   │   ├── components/            # layout, RBAC guards, shared UI
│   │   ├── features/              # Redux slices per domain
│   │   ├── pages/                 # Route-level page components
│   │   ├── routes/                # React Router configuration
│   │   ├── theme/                 # MUI theme
│   │   └── __tests__/             # Jest tests
│   ├── Dockerfile
│   └── nginx.conf
├── backend/                        # PACS - .NET 8
│   ├── src/
│   │   ├── PACS.Domain/           # Entities, enums
│   │   ├── PACS.Application/      # DTOs, interfaces
│   │   ├── PACS.Infrastructure/   # EF Core, Redis, DICOM, JWT, HL7/FHIR, services
│   │   └── PACS.Api/              # Controllers, Program.cs, middleware
│   ├── tests/PACS.UnitTests/      # xUnit tests
│   ├── PACS.sln
│   └── Dockerfile
├── database/scripts/               # Reference DDL + seed SQL
├── devops/
│   ├── monitoring/
│   │   ├── prometheus/            # prometheus.yml
│   │   └── grafana/               # datasources + dashboards (API health, perf, DB)
│   └── security/                  # .gitleaks.toml
├── docs/architecture.md            # Mermaid diagrams
├── .github/
│   ├── workflows/                 # ci.yml, codeql-scheduled.yml, deploy.yml
│   ├── codeql/codeql-config.yml
│   └── dependabot.yml
├── docker-compose.yml
└── .env.example
```

## Setup Instructions

### Prerequisites
- Docker + Docker Compose v2
- (For local, non-Docker dev) .NET 8 SDK, Node.js 20+, PostgreSQL 15, Redis 7

### Quick start (Docker Compose)

```bash
git clone <this-repo>
cd healthcare-platform
cp .env.example .env
# edit .env: set strong POSTGRES_PASSWORD, REDIS_PASSWORD, JWT_SECRET

docker compose up -d --build
```

Services will be available at:

| Service | URL |
|---|---|
| RIS Frontend | http://localhost:3000 |
| PACS API (Swagger) | http://localhost:8080/swagger |
| PACS API health | http://localhost:8080/health |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 (default `admin` / value of `GRAFANA_ADMIN_PASSWORD`) |

The Postgres seed script creates baseline roles and a placeholder `admin` user — see [`backend/README.md`](backend/README.md#database-setup) for how to set a real password before first login.

### Local (non-Docker) development

See [`frontend/README.md`](frontend/README.md) and [`backend/README.md`](backend/README.md) for running each service directly with `npm start` / `dotnet run`.

## CI/CD Flow

GitHub Actions pipeline (`.github/workflows/ci.yml`) runs on every push/PR:

1. **Build Dependencies** — `npm install` (frontend), `dotnet restore` (backend)
2. **Code Quality** — ESLint + `tsc --noEmit` (frontend), `dotnet format --verify-no-changes` (backend)
3. **Unit Testing** — Jest and xUnit, both with coverage artifacts uploaded
4. **Security Scanning** — CodeQL (JS/TS + C#), Gitleaks, `npm audit --audit-level=high`, `dotnet list package --vulnerable`, Trivy container scan — **any critical/high finding fails the pipeline**
5. **Build** — `npm run build`, `dotnet publish`
6. **Docker Build** — builds both images, Trivy-scans them, pushes to GHCR on `main`/`develop`

A separate weekly `codeql-scheduled.yml` runs a deeper `security-extended` CodeQL scan. `deploy.yml` handles deployment via SSH + Docker Compose after a successful pipeline run on `main`.

Full breakdown: [`devops/README.md`](devops/README.md).

## Security Controls

- **AuthN/AuthZ:** JWT access tokens (15 min) + hashed, rotating refresh tokens (7 days); role-based `[Authorize(Roles=...)]` on every controller action, mirrored by frontend RBAC guards.
- **Audit logging:** Every PHI-touching action (patient CRUD, study/report changes, image upload/download, login/logout) writes an immutable `AuditLogs` row with actor, IP, timestamp, and outcome — reviewable by Admin/Auditor roles only.
- **Data protection:** Passwords hashed with BCrypt; refresh tokens stored as SHA-256 hashes, never in plaintext; soft-delete on Patients/Studies/Reports preserves clinical history instead of destructive deletes.
- **Report integrity:** Signed reports are immutable and carry a SHA-256 content-integrity hash computed at signing time.
- **Transport/API:** HTTPS redirection, scoped CORS policy, request size limits on DICOM uploads, centralized exception handling that never leaks stack traces.
- **Supply chain:** CodeQL, Gitleaks, `npm audit`, NuGet vulnerability scan, and Trivy container scanning gate every merge to `main`; Dependabot keeps dependencies current.
- **Interoperability without over-exposure:** FHIR/HL7 mappers convert internal entities to standard resources on demand rather than exposing internal schema directly.

This is a reference platform, not a certified medical device or a complete HIPAA compliance program — see [`backend/README.md`](backend/README.md#authentication-flow) for what production hardening (secrets management, network segmentation, BAAs, etc.) would still be needed.

## Deployment Guide

Deployment is intentionally simple: **Docker Compose only** (no Kubernetes, Helm, or service mesh). See [`devops/README.md`](devops/README.md#deployment-steps) for the full guide, including the SSH-based `deploy.yml` GitHub Actions job.

## Further Documentation

- [`frontend/README.md`](frontend/README.md) — RIS install, env vars, testing, build
- [`backend/README.md`](backend/README.md) — PACS install, DB setup, API docs, auth flow, DICOM integration
- [`devops/README.md`](devops/README.md) — CI/CD, security scanning, Docker, deployment, monitoring
- [`docs/architecture.md`](docs/architecture.md) — diagrams
