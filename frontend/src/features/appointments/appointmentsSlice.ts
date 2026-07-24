import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { appointmentsApi } from '../../api/appointmentsApi';
import { Appointment, AppointmentStatus, Modality } from '../../types';

interface AppointmentsState {
  items: Appointment[];
  status: 'idle' | 'loading' | 'failed';
}

const initialState: AppointmentsState = { items: [], status: 'idle' };

export const fetchAppointments = createAsyncThunk('appointments/fetchRange', async (params: { fromUtc: string; toUtc: string }) => {
  const { data } = await appointmentsApi.getByRange(params.fromUtc, params.toUtc);
  return data;
});

export const createAppointment = createAsyncThunk(
  'appointments/create',
  async (payload: { patientId: string; scheduledAtUtc: string; modalityRequested: Modality; reason: string }) => {
    const { data } = await appointmentsApi.create(payload);
    return data;
  }
);

export const updateAppointmentStatus = createAsyncThunk(
  'appointments/updateStatus',
  async (payload: { id: string; scheduledAtUtc: string; status: AppointmentStatus; assignedTechnologistId?: string }) => {
    const { data } = await appointmentsApi.update(payload.id, payload);
    return data;
  }
);

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex((a) => a.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});

export default appointmentsSlice.reducer;
