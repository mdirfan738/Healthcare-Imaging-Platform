import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { studiesApi } from '../../api/studiesApi';
import { Study } from '../../types';

interface WorklistState {
  items: Study[];
  total: number;
  status: 'idle' | 'loading' | 'failed';
}

const initialState: WorklistState = { items: [], total: 0, status: 'idle' };

export const fetchWorklist = createAsyncThunk('worklist/fetch', async (params: { radiologistId: string; page?: number; pageSize?: number }) => {
  const { data } = await studiesApi.worklist(params.radiologistId, params.page, params.pageSize);
  return data;
});

const worklistSlice = createSlice({
  name: 'worklist',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorklist.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchWorklist.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(fetchWorklist.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default worklistSlice.reducer;
