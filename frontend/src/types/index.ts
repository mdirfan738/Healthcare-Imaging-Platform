export type UserRole =
  | 'Admin'
  | 'Radiologist'
  | 'Technologist'
  | 'Receptionist'
  | 'ReferringPhysician'
  | 'Auditor';

export interface AuthUser {
  username: string;
  fullName: string;
  role: UserRole;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
  username: string;
  fullName: string;
  role: UserRole;
}

export interface Patient {
  id: string;
  patientNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber?: string;
  email?: string;
  insuranceProvider?: string;
  createdAtUtc: string;
}

export type Modality = 'CR' | 'CT' | 'MR' | 'US' | 'XA' | 'NM' | 'PT' | 'DX' | 'MG' | 'RF' | 'OT';

export type StudyStatus = 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled' | 'Verified';

export interface Study {
  id: string;
  studyInstanceUid: string;
  accessionNumber: string;
  patientId: string;
  patientName: string;
  modality: Modality;
  studyDescription: string;
  scheduledDateUtc: string;
  performedDateUtc?: string;
  status: StudyStatus;
  assignedRadiologistId?: string;
}

export type AppointmentStatus = 'Scheduled' | 'CheckedIn' | 'Completed' | 'Cancelled' | 'NoShow';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  scheduledAtUtc: string;
  modalityRequested: Modality;
  reason: string;
  status: AppointmentStatus;
  assignedTechnologistId?: string;
}

export type ReportStatus = 'Draft' | 'Preliminary' | 'Finalized' | 'Signed' | 'Amended';

export interface Report {
  id: string;
  studyId: string;
  findings: string;
  impression?: string;
  status: ReportStatus;
  authorId: string;
  signedById?: string;
  signedAtUtc?: string;
  version: number;
}

export interface AuditLogEntry {
  id: string;
  username: string;
  action: string;
  entityType: string;
  entityId?: string;
  ipAddress?: string;
  success: boolean;
  createdAtUtc: string;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
