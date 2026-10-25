# PACS Backend (.NET 8 Web API)

Picture Archiving and Communication System API — patient/study/image/report management, DICOM storage, and HL7/FHIR interoperability.

## Installation

Requires .NET 8 SDK, PostgreSQL 15+, Redis 7+.

```bash
cd backend
dotnet restore PACS.sln
```

## Database Setup

### Option A — EF Core migrations (recommended)

```bash
# from backend/
dotnet tool install --global dotnet-ef   # if not already installed
dotnet ef migrations add InitialCreate --project src/PACS.Infrastructure --startup-project src/PACS.Api
dotnet ef database update --project src/PACS.Infrastructure --startup-project src/PACS.Api
```

In `Development`, `Program.cs` also calls `db.Database.Migrate()` automatically on startup for convenience.

### Option B — Reference SQL scripts

`database/scripts/00_schema.sql` contains the same schema as a plain DDL script (tables, PKs, FKs, indexes) for manual review or non-EF deployments. `01_seed_roles_and_admin.sql` seeds the six baseline roles and a placeholder `admin` user.

> **Important:** the seeded admin password hash in `01_seed_roles_and_admin.sql` is a non-functional placeholder. Generate a real BCrypt hash before relying on it, e.g. via a small script:
> ```csharp
> Console.WriteLine(BCrypt.Net.BCrypt.HashPassword("YourStrongPassword!"));
> ```
> and update the seed row (or register the admin through a one-time setup endpoint you add before exposing the API publicly).

Configure the connection string via `ConnectionStrings:PostgreSql` in `appsettings.json` / `appsettings.Development.json`, or the `ConnectionStrings__PostgreSql` environment variable (as done in `docker-compose.yml`).

### Schema Overview

| Table | Key relationships |
|---|---|
| `Patients` | — |
| `Appointments` | → `Patients` |
| `Studies` | → `Patients` |
| `SeriesList` | → `Studies` |
| `Images` | → `SeriesList` |
| `Reports` | → `Studies` |
| `Users` | → `Roles` |
| `Roles` | — |
| `AuditLogs` | (references `Users.Id` informally, not FK-enforced, so audit rows survive user deletion) |

All tables include `CreatedAtUtc`, `UpdatedAtUtc`, `IsDeleted` (soft delete) from `BaseEntity`. Unique indexes protect `PatientNumber` (MRN), `StudyInstanceUid`, `AccessionNumber`, `SeriesInstanceUid`, `SopInstanceUid`, `Username`, `Email`, and `Role.Name`.

## Running Locally

```bash
export ConnectionStrings__PostgreSql="Host=localhost;Port=5432;Database=pacs_db;Username=pacs_user;Password=devpassword"
export ConnectionStrings__Redis="localhost:6379"
export Jwt__Secret="local-dev-secret-min-32-characters-long"

dotnet run --project src/PACS.Api
```

API available at `http://localhost:5000` (or the port shown on startup); Swagger UI at `/swagger`.

## API Documentation

Interactive Swagger/OpenAPI docs are served at `/swagger` in every environment (restrict via network policy/API gateway before exposing publicly). Summary of endpoints:

### Auth (`/api/v1/auth`)
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/login` | Authenticate, returns access + refresh token | Anonymous |
| POST | `/refresh` | Exchange refresh token for a new pair | Anonymous |
| POST | `/logout` | Revoke the caller's refresh token | Bearer |

### Patients (`/api/v1/patients`)
| Method | Path | Description | Roles |
|---|---|---|---|
| POST | `/` | Register patient | Admin, Receptionist, Technologist |
| PUT | `/{id}` | Update patient | Admin, Receptionist |
| DELETE | `/{id}` | Soft-delete patient | Admin |
| GET | `/{id}` | Get by ID | Any authenticated |
| GET | `/` | Search (name, MRN, national ID, paged) | Any authenticated |

### Appointments (`/api/v1/appointments`)
| Method | Path | Description | Roles |
|---|---|---|---|
| POST | `/` | Schedule appointment | Admin, Receptionist |
| PUT | `/{id}` | Update status/time/technologist | Admin, Receptionist, Technologist |
| GET | `/?fromUtc&toUtc` | List within date range | Any authenticated |

### Studies (`/api/v1/studies`)
| Method | Path | Description | Roles |
|---|---|---|---|
| POST | `/` | Create study | Admin, Technologist, Receptionist |
| PUT | `/{id}` | Update status/radiologist assignment | Admin, Technologist, Radiologist |
| GET | `/{id}` | Get by ID | Any authenticated |
| GET | `/` | Search (patient, modality, status, date range) | Any authenticated |
| GET | `/worklist/{radiologistId}` | Radiologist's open worklist | Admin, Radiologist |

### Images (`/api/v1/images`)
| Method | Path | Description | Roles |
|---|---|---|---|
| POST | `/upload` | Upload DICOM Part 10 file (multipart) | Admin, Technologist |
| GET | `/{id}/download` | Download DICOM instance | Any authenticated |
| GET | `/` | Search metadata by study/series/modality | Any authenticated |

### Reports (`/api/v1/reports`)
| Method | Path | Description | Roles |
|---|---|---|---|
| POST | `/` | Create draft report | Admin, Radiologist |
| PUT | `/{id}` | Update draft/preliminary report | Admin, Radiologist |
| POST | `/{id}/sign` | Sign and finalize (immutable after) | Admin, Radiologist |
| GET | `/{id}` | Get by ID | Any authenticated |

### Audit Logs (`/api/v1/audit-logs`)
| Method | Path | Description | Roles |
|---|---|---|---|
| GET | `/` | Search audit trail | Admin, Auditor |

### Operations
| Path | Purpose |
|---|---|
| `/health` | Liveness/readiness (checks PostgreSQL + Redis) |
| `/metrics` | Prometheus scrape endpoint |

## Authentication Flow

1. `POST /auth/login` verifies the BCrypt password hash, issues a JWT access token (default 15 min, `Jwt:AccessTokenMinutes`) and an opaque refresh token (7 days). The refresh token is returned to the client but stored server-side only as a SHA-256 hash.
2. Subsequent requests send `Authorization: Bearer <accessToken>`; `PACS.Api` validates issuer, audience, signature, and expiry (30s clock skew tolerance).
3. When the access token expires, the client calls `POST /auth/refresh` with the refresh token; the server hashes it, looks up the matching user, and — if not expired — issues a new access/refresh pair (refresh token rotation).
4. `POST /auth/logout` clears the stored refresh-token hash, revoking future refreshes.
5. Every login attempt (success or failure) and logout writes an `AuditLogs` entry.

Role claims (`ClaimTypes.Role`) drive `[Authorize(Roles = "...")]` on every controller action — see the API table above for the exact role requirements per endpoint.

## DICOM Integration

`PACS.Infrastructure.Dicom.DicomStorageService` uses **fo-dicom** to:
1. Validate that an uploaded stream is a well-formed DICOM Part 10 file (`DicomFile.Open`).
2. Parse key metadata: `SOPInstanceUID`, `SOPClassUID`, `InstanceNumber`, `Rows`/`Columns`, `PhotometricInterpretation`, and the file's `TransferSyntax`.
3. Persist the raw `.dcm` file to disk under `{Dicom:StoragePath}/{seriesId}/{sopInstanceUid}.dcm` (a Docker volume in `docker-compose.yml`; swap for object storage — S3/Azure Blob — in production by re-implementing `IDicomStorageService`).
4. Store the extracted metadata + storage path in the `Images` table.

Upload/download flow: `ImagesController` → `ImageService` → `IDicomStorageService`, with every upload/download recorded via `IAuditLogService`. Max upload size is capped at 200 MB per instance (`ImagesController.MaxUploadBytes`); adjust for your modality mix.

### HL7 / FHIR

`PACS.Infrastructure.Hl7Fhir` provides:
- `FhirPatientMapper.ToFhirPatient(...)` — maps `Patient` → FHIR R4 `Patient` resource (identifiers, name, gender, birth date, phone).
- `FhirPatientMapper.ToHl7v2Adt(...)` — builds a minimal HL7 v2 `ADT^A04` message for legacy HIS integrations.
- `FhirDiagnosticReportMapper.ToFhirDiagnosticReport(...)` — maps a signed `Report` → FHIR R4 `DiagnosticReport`.

These mappers are provided as building blocks for an interoperability endpoint/integration engine; wire them into a `/fhir/Patient`, `/fhir/DiagnosticReport`, or an outbound HL7 feed as your integration requirements dictate.

## Testing

```bash
cd backend
dotnet test PACS.sln
```

With coverage (same as CI):

```bash
dotnet test PACS.sln --collect:"XPlat Code Coverage" --results-directory ./coverage
```

`tests/PACS.UnitTests` covers:
- `PatientService` — creation, unique MRN generation, soft delete, search filtering
- `ReportService` — signing sets status/hash correctly; editing a signed report throws
- `JwtService` — token generation/validation round-trip, garbage-token rejection, refresh-token hash determinism

Tests use EF Core's in-memory provider (no real database required) and Moq for interface mocking.

## Project Structure

```
backend/
├── src/
│   ├── PACS.Domain/          Entities/, Enums/
│   ├── PACS.Application/     DTOs/, Interfaces/
│   ├── PACS.Infrastructure/  Data/ (DbContext, AuditLogService), Security/ (JWT),
│   │                         Caching/ (Redis), Dicom/ (fo-dicom), Hl7Fhir/, Services/
│   └── PACS.Api/             Controllers/, Middleware/, Program.cs, appsettings*.json
├── tests/PACS.UnitTests/
├── PACS.sln
├── Dockerfile
└── .dockerignore
```
