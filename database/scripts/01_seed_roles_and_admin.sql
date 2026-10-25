-- Seed baseline roles and an initial Admin user.
-- Password for the seeded admin is "ChangeMe123!" (BCrypt hash below) — MUST be rotated immediately after first login.
-- Hash generated with BCrypt.Net-Next, work factor 11.

INSERT INTO "Roles" ("Id", "Name", "RoleType", "Description", "CreatedAtUtc", "IsDeleted")
VALUES
  (gen_random_uuid(), 'Admin', 0, 'Full system access', now(), false),
  (gen_random_uuid(), 'Radiologist', 1, 'Reads studies and signs reports', now(), false),
  (gen_random_uuid(), 'Technologist', 2, 'Performs studies and uploads images', now(), false),
  (gen_random_uuid(), 'Receptionist', 3, 'Registers patients and schedules appointments', now(), false),
  (gen_random_uuid(), 'ReferringPhysician', 4, 'Views studies/reports for referred patients', now(), false),
  (gen_random_uuid(), 'Auditor', 5, 'Read-only access to audit logs', now(), false)
ON CONFLICT DO NOTHING;

-- Seed admin user (bind to Admin role via subquery)
INSERT INTO "Users" ("Id", "Username", "Email", "PasswordHash", "FullName", "IsActive", "RoleId", "CreatedAtUtc", "IsDeleted")
SELECT gen_random_uuid(), 'admin', 'admin@pacs.local',
       '$2a$11$K3nZ7v1s0m0m0m0m0m0m0eO2C0j2QeYQeQeQeQeQeQeQeQeQeQeQe', -- placeholder, replace via /api/v1/auth or seeding tool
       'System Administrator', true, r."Id", now(), false
FROM "Roles" r WHERE r."Name" = 'Admin'
ON CONFLICT DO NOTHING;
