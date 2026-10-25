import { hasPermission } from '../components/rbac/permissions';

describe('RBAC permissions', () => {
  it('grants PATIENT_CREATE to Admin, Receptionist, and Technologist', () => {
    expect(hasPermission('Admin', 'PATIENT_CREATE')).toBe(true);
    expect(hasPermission('Receptionist', 'PATIENT_CREATE')).toBe(true);
    expect(hasPermission('Technologist', 'PATIENT_CREATE')).toBe(true);
  });

  it('denies PATIENT_CREATE to Radiologist', () => {
    expect(hasPermission('Radiologist', 'PATIENT_CREATE')).toBe(false);
  });

  it('grants REPORT_SIGN only to Admin and Radiologist', () => {
    expect(hasPermission('Radiologist', 'REPORT_SIGN')).toBe(true);
    expect(hasPermission('Admin', 'REPORT_SIGN')).toBe(true);
    expect(hasPermission('Technologist', 'REPORT_SIGN')).toBe(false);
  });

  it('denies all permissions when role is undefined', () => {
    expect(hasPermission(undefined, 'AUDIT_VIEW')).toBe(false);
  });

  it('restricts AUDIT_VIEW to Admin and Auditor only', () => {
    expect(hasPermission('Auditor', 'AUDIT_VIEW')).toBe(true);
    expect(hasPermission('Receptionist', 'AUDIT_VIEW')).toBe(false);
  });
});
