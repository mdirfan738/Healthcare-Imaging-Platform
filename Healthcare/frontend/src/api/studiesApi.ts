import axiosClient from './axiosClient';
import { PagedResult, Study, Modality, StudyStatus } from '../types';

export const studiesApi = {
  create: (payload: { patientId: string; modality: Modality; studyDescription: string; scheduledDateUtc: string; referringPhysician?: string }) =>
    axiosClient.post<Study>('/studies', payload),
  update: (id: string, payload: { status: StudyStatus; performedDateUtc?: string; assignedRadiologistId?: string }) =>
    axiosClient.put<Study>(`/studies/${id}`, payload),
  getById: (id: string) => axiosClient.get<Study>(`/studies/${id}`),
  search: (params: Record<string, unknown>) => axiosClient.get<PagedResult<Study>>('/studies', { params }),
  worklist: (radiologistId: string, page = 1, pageSize = 20) =>
    axiosClient.get<PagedResult<Study>>(`/studies/worklist/${radiologistId}`, { params: { page, pageSize } }),
};
