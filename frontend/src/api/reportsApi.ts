import axiosClient from './axiosClient';
import { Report } from '../types';

export const reportsApi = {
  create: (payload: { studyId: string; findings: string; impression?: string }) =>
    axiosClient.post<Report>('/reports', payload),
  update: (id: string, payload: { findings: string; impression?: string }) =>
    axiosClient.put<Report>(`/reports/${id}`, payload),
  sign: (id: string, attestationNote: string) => axiosClient.post<Report>(`/reports/${id}/sign`, { attestationNote }),
  getById: (id: string) => axiosClient.get<Report>(`/reports/${id}`),
};
