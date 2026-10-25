import axiosClient from './axiosClient';
import { Appointment, AppointmentStatus, Modality } from '../types';

export const appointmentsApi = {
  create: (payload: { patientId: string; scheduledAtUtc: string; modalityRequested: Modality; reason: string }) =>
    axiosClient.post<Appointment>('/appointments', payload),
  update: (id: string, payload: { scheduledAtUtc: string; status: AppointmentStatus; assignedTechnologistId?: string }) =>
    axiosClient.put<Appointment>(`/appointments/${id}`, payload),
  getByRange: (fromUtc: string, toUtc: string) =>
    axiosClient.get<Appointment[]>('/appointments', { params: { fromUtc, toUtc } }),
};
