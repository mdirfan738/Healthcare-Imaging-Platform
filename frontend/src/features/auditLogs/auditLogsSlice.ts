import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { auditLogsApi } from '../../api/auditLogsApi';
import { AuditLogEntry } from '../../types';

interface AuditLogsState {
  items: AuditLogEntry[];
  total: number;
  status: 'idle' | 'loading' | 'failed';
}

const initialState: AuditLogsState = { items: [], total: 0, status: 'idle' };

export const searchAuditLogs = createAsyncThunk('auditLogs/search', async (params: Record<string, unknown>) => {
  const { data } = await auditLogsApi.search(params);
  return data;
});

const auditLogsSlice = createSlice({
  name: 'auditLogs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(searchAuditLogs.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(searchAuditLogs.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(searchAuditLogs.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default auditLogsSlice.reducer;
