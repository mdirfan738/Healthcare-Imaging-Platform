import axiosClient from './axiosClient';
import { PagedResult, Patient } from '../types';

export interface CreatePatientPayload {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  nationalId?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
}

export const patientsApi = {
  create: (payload: CreatePatientPayload) => axiosClient.post<Patient>('/patients', payload),
  update: (id: string, payload: Partial<CreatePatientPayload>) => axiosClient.put<Patient>(`/patients/${id}`, payload),
  remove: (id: string) => axiosClient.delete(`/patients/${id}`),
  getById: (id: string) => axiosClient.get<Patient>(`/patients/${id}`),
  search: (params: { name?: string; patientNumber?: string; nationalId?: string; page?: number; pageSize?: number }) =>
    axiosClient.get<PagedResult<Patient>>('/patients', { params }),
};
