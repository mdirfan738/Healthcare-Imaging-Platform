import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { patientsApi, CreatePatientPayload } from '../../api/patientsApi';
import { Patient } from '../../types';

interface PatientsState {
  results: Patient[];
  total: number;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: PatientsState = {
  results: [],
  total: 0,
  status: 'idle',
  error: null,
};

export const searchPatients = createAsyncThunk(
  'patients/search',
  async (params: {
    name?: string;
    patientNumber?: string;
    nationalId?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const { data } = await patientsApi.search(params);
    return data;
  }
);

export const createPatient = createAsyncThunk(
  'patients/create',
  async (payload: CreatePatientPayload, { rejectWithValue }) => {
    try {
      const { data } = await patientsApi.create(payload);
      return data;
    } catch (err: unknown) {
      let message = 'Failed to register patient.';

      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err
      ) {
        const response = (err as {
          response?: {
            data?: {
              message?: string;
            };
          };
        }).response;

        message = response?.data?.message ?? message;
      }

      return rejectWithValue(message);
    }
  }
);

const patientsSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(searchPatients.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(searchPatients.fulfilled, (state, action) => {
        state.status = 'idle';
        state.results = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(searchPatients.rejected, (state) => {
        state.status = 'failed';
        state.error = 'Failed to search patients.';
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.results = [action.payload, ...state.results];
        state.total += 1;
        state.error = null;
      })
      .addCase(createPatient.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? 'Failed to register patient.';
      });
  },
});

export default patientsSlice.reducer;