import axiosClient from './axiosClient';
import { AuditLogEntry, PagedResult } from '../types';

export const auditLogsApi = {
  search: (params: Record<string, unknown>) => axiosClient.get<PagedResult<AuditLogEntry>>('/audit-logs', { params }),
};
