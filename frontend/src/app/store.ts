import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import patientsReducer from '../features/patients/patientsSlice';
import appointmentsReducer from '../features/appointments/appointmentsSlice';
import worklistReducer from '../features/worklist/worklistSlice';
import reportsReducer from '../features/reports/reportsSlice';
import auditLogsReducer from '../features/auditLogs/auditLogsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    patients: patientsReducer,
    appointments: appointmentsReducer,
    worklist: worklistReducer,
    reports: reportsReducer,
    auditLogs: auditLogsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
