import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { reportsApi } from '../../api/reportsApi';
import { Report } from '../../types';

interface ReportsState {
  current: Report | null;
  status: 'idle' | 'loading' | 'failed';
}

const initialState: ReportsState = { current: null, status: 'idle' };

export const createReport = createAsyncThunk('reports/create', async (payload: { studyId: string; findings: string; impression?: string }) => {
  const { data } = await reportsApi.create(payload);
  return data;
});

export const updateReport = createAsyncThunk('reports/update', async (payload: { id: string; findings: string; impression?: string }) => {
  const { data } = await reportsApi.update(payload.id, payload);
  return data;
});

export const signReport = createAsyncThunk('reports/sign', async (payload: { id: string; attestationNote: string }) => {
  const { data } = await reportsApi.sign(payload.id, payload.attestationNote);
  return data;
});

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createReport.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(updateReport.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(signReport.fulfilled, (state, action) => {
        state.current = action.payload;
      });
  },
});

export default reportsSlice.reducer;
