-- ============================================================================
-- PACS / RIS Reference Schema (PostgreSQL 15+)
-- This mirrors the EF Core model in PACS.Infrastructure.Data.ApplicationDbContext.
-- In normal operation, schema is created/updated via EF Core migrations:
--     dotnet ef database update --project src/PACS.Infrastructure --startup-project src/PACS.Api
-- This file is provided as a readable reference and for non-EF deployments.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()

-- ---------------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------------
CREATE TABLE "Roles" (
    "Id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Name"          VARCHAR(50) NOT NULL,
    "RoleType"      INT NOT NULL,
    "Description"   TEXT NULL,
    "CreatedAtUtc"  TIMESTAMPTZ NOT NULL DEFAULT now(),
    "UpdatedAtUtc"  TIMESTAMPTZ NULL,
    "IsDeleted"     BOOLEAN NOT NULL DEFAULT false
);
CREATE UNIQUE INDEX "IX_Roles_Name" ON "Roles" ("Name");

-- ---------------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------------
CREATE TABLE "Users" (
    "Id"                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Username"                  VARCHAR(100) NOT NULL,
    "Email"                     VARCHAR(255) NOT NULL,
    "PasswordHash"              TEXT NOT NULL,
    "FullName"                  VARCHAR(200) NOT NULL,
    "IsActive"                  BOOLEAN NOT NULL DEFAULT true,
    "RoleId"                    UUID NOT NULL REFERENCES "Roles"("Id") ON DELETE RESTRICT,
    "RefreshTokenHash"          TEXT NULL,
    "RefreshTokenExpiresAtUtc"  TIMESTAMPTZ NULL,
    "LastLoginUtc"              TIMESTAMPTZ NULL,
    "CreatedAtUtc"              TIMESTAMPTZ NOT NULL DEFAULT now(),
    "UpdatedAtUtc"              TIMESTAMPTZ NULL,
    "IsDeleted"                 BOOLEAN NOT NULL DEFAULT false
);
CREATE UNIQUE INDEX "IX_Users_Username" ON "Users" ("Username");
CREATE UNIQUE INDEX "IX_Users_Email" ON "Users" ("Email");
CREATE INDEX "IX_Users_RoleId" ON "Users" ("RoleId");

-- ---------------------------------------------------------------------------
-- Patients
-- ---------------------------------------------------------------------------
CREATE TABLE "Patients" (
    "Id"                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "PatientNumber"       VARCHAR(64) NOT NULL,   -- MRN
    "FirstName"           VARCHAR(100) NOT NULL,
    "LastName"            VARCHAR(100) NOT NULL,
    "DateOfBirth"         DATE NOT NULL,
    "Gender"              VARCHAR(20) NOT NULL,
    "PhoneNumber"         VARCHAR(30) NULL,
    "Email"               VARCHAR(255) NULL,
    "Address"             TEXT NULL,
    "NationalId"          VARCHAR(100) NULL,
    "InsuranceProvider"   VARCHAR(200) NULL,
    "InsuranceNumber"     VARCHAR(100) NULL,
    "CreatedAtUtc"        TIMESTAMPTZ NOT NULL DEFAULT now(),
    "UpdatedAtUtc"        TIMESTAMPTZ NULL,
    "IsDeleted"           BOOLEAN NOT NULL DEFAULT false
);
CREATE UNIQUE INDEX "IX_Patients_PatientNumber" ON "Patients" ("PatientNumber");
CREATE INDEX "IX_Patients_LastName_FirstName" ON "Patients" ("LastName", "FirstName");
CREATE INDEX "IX_Patients_DateOfBirth" ON "Patients" ("DateOfBirth");
CREATE INDEX "IX_Patients_NationalId" ON "Patients" ("NationalId");

-- ---------------------------------------------------------------------------
-- Appointments
-- ---------------------------------------------------------------------------
CREATE TABLE "Appointments" (
    "Id"                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "PatientId"                UUID NOT NULL REFERENCES "Patients"("Id") ON DELETE RESTRICT,
    "ScheduledAtUtc"           TIMESTAMPTZ NOT NULL,
    "ModalityRequested"        INT NOT NULL,
    "Reason"                   TEXT NOT NULL,
    "Status"                   INT NOT NULL DEFAULT 0,
    "AssignedTechnologistId"   UUID NULL REFERENCES "Users"("Id") ON DELETE SET NULL,
    "CreatedAtUtc"             TIMESTAMPTZ NOT NULL DEFAULT now(),
    "UpdatedAtUtc"             TIMESTAMPTZ NULL,
    "IsDeleted"                BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX "IX_Appointments_PatientId" ON "Appointments" ("PatientId");
CREATE INDEX "IX_Appointments_ScheduledAtUtc" ON "Appointments" ("ScheduledAtUtc");

-- ---------------------------------------------------------------------------
-- Studies
-- ---------------------------------------------------------------------------
CREATE TABLE "Studies" (
    "Id"                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "StudyInstanceUid"       VARCHAR(128) NOT NULL,  -- DICOM (0020,000D)
    "AccessionNumber"        VARCHAR(64) NOT NULL,
    "PatientId"              UUID NOT NULL REFERENCES "Patients"("Id") ON DELETE RESTRICT,
    "Modality"               INT NOT NULL,
    "StudyDescription"       VARCHAR(255) NOT NULL,
    "ScheduledDateUtc"       TIMESTAMPTZ NOT NULL,
    "PerformedDateUtc"       TIMESTAMPTZ NULL,
    "Status"                 INT NOT NULL DEFAULT 0,
    "ReferringPhysician"     VARCHAR(200) NULL,
    "AssignedRadiologistId"  UUID NULL REFERENCES "Users"("Id") ON DELETE SET NULL,
    "CreatedAtUtc"           TIMESTAMPTZ NOT NULL DEFAULT now(),
    "UpdatedAtUtc"           TIMESTAMPTZ NULL,
    "IsDeleted"              BOOLEAN NOT NULL DEFAULT false
);
CREATE UNIQUE INDEX "IX_Studies_StudyInstanceUid" ON "Studies" ("StudyInstanceUid");
CREATE UNIQUE INDEX "IX_Studies_AccessionNumber" ON "Studies" ("AccessionNumber");
CREATE INDEX "IX_Studies_PatientId" ON "Studies" ("PatientId");
CREATE INDEX "IX_Studies_ScheduledDateUtc" ON "Studies" ("ScheduledDateUtc");
CREATE INDEX "IX_Studies_Status" ON "Studies" ("Status");
CREATE INDEX "IX_Studies_AssignedRadiologistId" ON "Studies" ("AssignedRadiologistId");

-- ---------------------------------------------------------------------------
-- Series
-- ---------------------------------------------------------------------------
CREATE TABLE "SeriesList" (
    "Id"                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "SeriesInstanceUid"    VARCHAR(128) NOT NULL, -- DICOM (0020,000E)
    "StudyId"              UUID NOT NULL REFERENCES "Studies"("Id") ON DELETE CASCADE,
    "SeriesNumber"         INT NOT NULL,
    "Modality"             VARCHAR(10) NOT NULL,
    "SeriesDescription"    VARCHAR(255) NULL,
    "BodyPartExamined"     VARCHAR(100) NULL,
    "CreatedAtUtc"         TIMESTAMPTZ NOT NULL DEFAULT now(),
    "UpdatedAtUtc"         TIMESTAMPTZ NULL,
    "IsDeleted"            BOOLEAN NOT NULL DEFAULT false
);
CREATE UNIQUE INDEX "IX_Series_SeriesInstanceUid" ON "SeriesList" ("SeriesInstanceUid");
CREATE INDEX "IX_Series_StudyId" ON "SeriesList" ("StudyId");

-- ---------------------------------------------------------------------------
-- Images (DICOM instances)
-- ---------------------------------------------------------------------------
CREATE TABLE "Images" (
    "Id"                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "SopInstanceUid"              VARCHAR(128) NOT NULL, -- DICOM (0008,0018)
    "SeriesId"                    UUID NOT NULL REFERENCES "SeriesList"("Id") ON DELETE CASCADE,
    "InstanceNumber"              INT NOT NULL,
    "StoragePath"                 TEXT NOT NULL,
    "FileSizeBytes"               BIGINT NOT NULL,
    "SopClassUid"                 VARCHAR(128) NULL,
    "TransferSyntaxUid"           VARCHAR(128) NOT NULL,
    "Rows"                        INT NULL,
    "Columns"                     INT NULL,
    "PhotometricInterpretation"   VARCHAR(50) NULL,
    "CreatedAtUtc"                TIMESTAMPTZ NOT NULL DEFAULT now(),
    "UpdatedAtUtc"                TIMESTAMPTZ NULL,
    "IsDeleted"                   BOOLEAN NOT NULL DEFAULT false
);
CREATE UNIQUE INDEX "IX_Images_SopInstanceUid" ON "Images" ("SopInstanceUid");
CREATE INDEX "IX_Images_SeriesId" ON "Images" ("SeriesId");

-- ---------------------------------------------------------------------------
-- Reports
-- ---------------------------------------------------------------------------
CREATE TABLE "Reports" (
    "Id"                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "StudyId"            UUID NOT NULL REFERENCES "Studies"("Id") ON DELETE RESTRICT,
    "Findings"           TEXT NOT NULL,
    "Impression"         TEXT NULL,
    "Status"             INT NOT NULL DEFAULT 0,
    "AuthorId"           UUID NOT NULL REFERENCES "Users"("Id") ON DELETE RESTRICT,
    "SignedById"         UUID NULL REFERENCES "Users"("Id") ON DELETE SET NULL,
    "SignedAtUtc"        TIMESTAMPTZ NULL,
    "DigitalSignature"   TEXT NULL, -- SHA-256 content-integrity hash, set at signing time
    "Version"            INT NOT NULL DEFAULT 1,
    "CreatedAtUtc"       TIMESTAMPTZ NOT NULL DEFAULT now(),
    "UpdatedAtUtc"       TIMESTAMPTZ NULL,
    "IsDeleted"          BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX "IX_Reports_StudyId" ON "Reports" ("StudyId");
CREATE INDEX "IX_Reports_Status" ON "Reports" ("Status");

-- ---------------------------------------------------------------------------
-- AuditLogs (immutable — no UPDATE/DELETE grants in production; see devops/README)
-- ---------------------------------------------------------------------------
CREATE TABLE "AuditLogs" (
    "Id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "UserId"         UUID NULL,
    "Username"       VARCHAR(100) NOT NULL,
    "Action"         VARCHAR(100) NOT NULL,
    "EntityType"     VARCHAR(100) NOT NULL,
    "EntityId"       VARCHAR(100) NULL,
    "IpAddress"      VARCHAR(64) NULL,
    "Details"        TEXT NULL,
    "Success"        BOOLEAN NOT NULL DEFAULT true,
    "CreatedAtUtc"   TIMESTAMPTZ NOT NULL DEFAULT now(),
    "UpdatedAtUtc"   TIMESTAMPTZ NULL,
    "IsDeleted"      BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX "IX_AuditLogs_CreatedAtUtc" ON "AuditLogs" ("CreatedAtUtc");
CREATE INDEX "IX_AuditLogs_EntityType_EntityId" ON "AuditLogs" ("EntityType", "EntityId");
CREATE INDEX "IX_AuditLogs_UserId" ON "AuditLogs" ("UserId");
CREATE INDEX "IX_AuditLogs_Action" ON "AuditLogs" ("Action");
