import { UserRole } from '../../types';

// Central RBAC permission map. Keep in sync with backend [Authorize(Roles = "...")] attributes.
export const PERMISSIONS = {
  PATIENT_CREATE: ['Admin', 'Receptionist', 'Technologist'] as UserRole[],
  PATIENT_EDIT: ['Admin', 'Receptionist'] as UserRole[],
  PATIENT_DELETE: ['Admin'] as UserRole[],
  APPOINTMENT_MANAGE: ['Admin', 'Receptionist', 'Technologist'] as UserRole[],
  STUDY_CREATE: ['Admin', 'Technologist', 'Receptionist'] as UserRole[],
  STUDY_UPDATE: ['Admin', 'Technologist', 'Radiologist'] as UserRole[],
  IMAGE_UPLOAD: ['Admin', 'Technologist'] as UserRole[],
  REPORT_WRITE: ['Admin', 'Radiologist'] as UserRole[],
  REPORT_SIGN: ['Admin', 'Radiologist'] as UserRole[],
  WORKLIST_VIEW: ['Admin', 'Radiologist'] as UserRole[],
  AUDIT_VIEW: ['Admin', 'Auditor'] as UserRole[],
};

export type PermissionKey = keyof typeof PERMISSIONS;

export function hasPermission(role: UserRole | undefined, permission: PermissionKey): boolean {
  if (!role) return false;
  return PERMISSIONS[permission].includes(role);
}
