
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import PatientRegistrationPage from '../pages/PatientRegistrationPage';
import PatientSearchPage from '../pages/PatientSearchPage';
import AppointmentSchedulingPage from '../pages/AppointmentSchedulingPage';
import WorklistPage from '../pages/WorklistPage';
import ReportManagementPage from '../pages/ReportManagementPage';
import AuditLogsPage from '../pages/AuditLogsPage';

import AppLayout from '../components/layout/AppLayout';
import RequireAuth from '../components/rbac/RequireAuth';
import RequireRole from '../components/rbac/RequireRole';

const AppRoutes: React.FC = () => (
  <Routes>
    {/* Always show the login page when opening the root URL. */}
    <Route
      path="/"
      element={<Navigate to="/login" replace />}
    />

    {/* Public route: accessible without authentication. */}
    <Route path="/login" element={<LoginPage />} />

    {/* Protected routes: require an access token. */}
    <Route element={<RequireAuth />}>
      <Route element={<AppLayout />}>
        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />

        <Route element={<RequireRole permission="PATIENT_CREATE" />}>
          <Route
            path="/patients/register"
            element={<PatientRegistrationPage />}
          />
        </Route>

        <Route
          path="/patients/search"
          element={<PatientSearchPage />}
        />

        <Route element={<RequireRole permission="APPOINTMENT_MANAGE" />}>
          <Route
            path="/appointments"
            element={<AppointmentSchedulingPage />}
          />
        </Route>

        <Route element={<RequireRole permission="WORKLIST_VIEW" />}>
          <Route
            path="/worklist"
            element={<WorklistPage />}
          />
        </Route>

        <Route element={<RequireRole permission="REPORT_WRITE" />}>
          <Route
            path="/reports"
            element={<ReportManagementPage />}
          />
          <Route
            path="/reports/new"
            element={<ReportManagementPage />}
          />
        </Route>

        <Route element={<RequireRole permission="AUDIT_VIEW" />}>
          <Route
            path="/audit-logs"
            element={<AuditLogsPage />}
          />
        </Route>
      </Route>
    </Route>

    {/* Unknown URLs return to login instead of bypassing the entry flow. */}
    <Route
      path="*"
      element={<Navigate to="/login" replace />}
    />
  </Routes>
);

export default AppRoutes;
