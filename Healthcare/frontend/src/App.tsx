
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Construction,
} from "lucide-react";

import { useAppSelector } from "./app/hooks";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";

import "./styles.css";

type FeaturePageConfig = {
  path: string;
  title: string;
  group: string;
  description: string;
};

type FeaturePageProps = {
  page: FeaturePageConfig;
};

const featurePages: FeaturePageConfig[] = [
  { path: "/settings/general", title: "General Settings", group: "Settings", description: "Configure application-wide preferences." },
  { path: "/settings/users", title: "User Management", group: "Settings", description: "Manage authorised application users." },
  { path: "/settings/roles", title: "Roles & Permissions", group: "Settings", description: "Manage access permissions and roles." },
  { path: "/masters/hospitals", title: "Hospital Master", group: "Masters", description: "Manage hospital master records." },
  { path: "/masters/modalities", title: "Modality Master", group: "Masters", description: "Manage radiology modalities." },
  { path: "/masters/departments", title: "Department Master", group: "Masters", description: "Manage department information." },
  { path: "/masters/studies", title: "Study Master", group: "Masters", description: "Configure study types and master data." },
  { path: "/radiologists", title: "Manage Radiologist", group: "Administration", description: "Manage radiologist records and availability." },
  { path: "/profile", title: "Update Profile", group: "Account", description: "View and update your profile information." },
  { path: "/cases/require-action", title: "Require Action", group: "Case List", description: "Review cases that require further action." },
  { path: "/cases/review-required", title: "Review Required", group: "Case List", description: "Review studies awaiting radiologist attention." },
  { path: "/cases/pending-orders", title: "Pending Orders", group: "Case List", description: "Manage orders awaiting processing." },
  { path: "/cases/in-progress", title: "In Progress", group: "Case List", description: "Track studies currently being processed." },
  { path: "/cases/final-report", title: "Final Report", group: "Case List", description: "Access completed radiology reports." },
  { path: "/cases/final-report-mobile", title: "Final Report — Mobile View", group: "Case List", description: "Access the responsive final-report workflow." },
  { path: "/cases/24-hour-recheck", title: "24 Hour Recheck", group: "Case List", description: "Review cases requiring a follow-up check." },
  { path: "/patients/search", title: "Patient Search", group: "Case List", description: "Find patient and study records." },
  { path: "/finance/receivables", title: "Accounts Receivable", group: "Finance", description: "Manage outstanding receivables." },
  { path: "/finance/transactions", title: "My Transactions", group: "Finance", description: "View your transaction history." },
  { path: "/finance/payables", title: "Accounts Payables", group: "Finance", description: "Manage payable records." },
  { path: "/reports/quick", title: "Quick Reports", group: "Reports", description: "Access frequently used reports." },
  { path: "/reports/studies", title: "Study Reports", group: "Reports", description: "Analyse study and reporting activity." },
  { path: "/reports/financial", title: "Financial Reports", group: "Reports", description: "Review financial reporting information." },
  { path: "/reports/operational", title: "Operational Reports", group: "Reports", description: "Review operational performance." },
  { path: "/communications", title: "Communications", group: "Operations", description: "Manage application communications." },
  { path: "/housekeeping/audit-logs", title: "Audit Logs", group: "House Keeping", description: "Review system audit events." },
  { path: "/housekeeping/activity", title: "System Activity", group: "House Keeping", description: "Review system activity and maintenance." },
];

function RequireAuth() {
  const accessToken = useAppSelector(
    (state) => state.auth.accessToken
  );
  const location = useLocation();

  if (!accessToken) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
}

function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="lm-app-layout">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="lm-app-main">
        <Routes>
          <Route
            path="/dashboard"
            element={
              <Dashboard
                onMenuClick={() => setMobileOpen(true)}
              />
            }
          />

          {featurePages.map((page) => (
            <Route
              key={page.path}
              path={page.path}
              element={<FeaturePage page={page} />}
            />
          ))}

          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />
        </Routes>
      </div>
    </div>
  );
}

function FeaturePage({ page }: FeaturePageProps) {
  const location = useLocation();

  return (
    <main className="lm-dashboard">
      <header className="lm-topbar">
        <div className="lm-topbar-left">
          <div>
            <div className="lm-breadcrumb">
              {page.group} <span>/</span> {page.title}
            </div>
            <h1>{page.title}</h1>
          </div>
        </div>
      </header>

      <section className="lm-dashboard-content">
        <div className="lm-feature-page-card">
          <div className="lm-feature-page-icon">
            <Construction size={27} />
          </div>

          <span className="lm-eyebrow">
            {page.group.toUpperCase()}
          </span>

          <h2>{page.title}</h2>
          <p>{page.description}</p>

          <div className="lm-feature-page-notice">
            <strong>Module implementation pending</strong>
            <span>
              This route is registered and ready for its dedicated
              screen. Forms, data tables, permissions and API
              operations will be added in the next implementation
              stage.
            </span>
          </div>

          <div className="lm-feature-page-actions">
            <button
              type="button"
              className="lm-button lm-button-secondary"
              onClick={() => window.history.back()}
            >
              <ArrowLeft size={16} />
              Go back
            </button>

            <a
              href="/dashboard"
              className="lm-button lm-button-primary"
            >
              Dashboard
              <ArrowRight size={16} />
            </a>
          </div>

          <small className="lm-route-label">
            Route: {location.pathname}
          </small>
        </div>
      </section>
    </main>
  );
}

function App() {
  // Clear a previous browser session before rendering routes.
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setSessionChecked(true);
  }, []);

  if (!sessionChecked) {
    return null;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route element={<RequireAuth />}>
          <Route
            path="/*"
            element={<AppLayout />}
          />
        </Route>

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
