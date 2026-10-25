
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Menu,
  Plus,
  RefreshCw,
  Search,
  Stethoscope,
  Users,
} from "lucide-react";
import "./Dashboard.css";

const summaryCards = [
  {
    label: "Require Action",
    value: "—",
    description: "Cases awaiting action",
    icon: Activity,
    tone: "red",
    path: "/cases/require-action",
  },
  {
    label: "Review Required",
    value: "—",
    description: "Awaiting radiologist review",
    icon: Stethoscope,
    tone: "orange",
    path: "/cases/review-required",
  },
  {
    label: "Pending Orders",
    value: "—",
    description: "Orders to be processed",
    icon: Clock3,
    tone: "blue",
    path: "/cases/pending-orders",
  },
  {
    label: "Completed Reports",
    value: "—",
    description: "Final reports available",
    icon: CheckCircle2,
    tone: "green",
    path: "/cases/final-report",
  },
];

const quickActions = [
  {
    label: "Require Action",
    description: "Review cases needing attention",
    icon: Activity,
    path: "/cases/require-action",
  },
  {
    label: "Review Required",
    description: "Open the review worklist",
    icon: FileText,
    path: "/cases/review-required",
  },
  {
    label: "Patient Search",
    description: "Find a patient or study",
    icon: Search,
    path: "/patients/search",
  },
  {
    label: "Manage Radiologists",
    description: "Open radiologist management",
    icon: Users,
    path: "/radiologists",
  },
];

export default function Dashboard({ onMenuClick }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  function handleRefresh() {
    // Connect this handler to your real dashboard API refresh
    // when the dashboard endpoint is available.
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 350);
  }

  const filteredActions = quickActions.filter((action) =>
    `${action.label} ${action.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="lm-dashboard">
      <header className="lm-topbar">
        <div className="lm-topbar-left">
          <button
            type="button"
            className="lm-icon-button lm-mobile-menu"
            aria-label="Open navigation"
            onClick={onMenuClick}
          >
            <Menu size={21} />
          </button>

          <div>
            <div className="lm-breadcrumb">
              Workspace <span>/</span> Dashboard
            </div>
            <h1>Dashboard</h1>
          </div>
        </div>

        <div className="lm-topbar-right">
          <span className="lm-system-status">
            <span />
            Radiology workspace
          </span>

          <button
            className="lm-icon-button"
            type="button"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={19} />
          </button>

          <div className="lm-user-avatar" title="Current user">
            LM
          </div>
        </div>
      </header>

      <section className="lm-dashboard-content">
        <div className="lm-welcome-row">
          <div>
            <p className="lm-eyebrow">RADIOLOGY OPERATIONS</p>
            <h2>Welcome to live-matters</h2>
            <p className="lm-welcome-description">
              Your radiology workflow, all in one place.
            </p>
          </div>

          <button
            className="lm-button lm-button-secondary"
            onClick={handleRefresh}
            type="button"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "lm-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <section
          className="lm-summary-grid"
          aria-label="Case summary"
        >
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <button
                key={card.label}
                type="button"
                className="lm-summary-card"
                onClick={() => navigate(card.path)}
              >
                <div className="lm-summary-top">
                  <span className={`lm-summary-icon ${card.tone}`}>
                    <Icon size={21} />
                  </span>
                  <ArrowUpRight
                    className="lm-card-arrow"
                    size={17}
                  />
                </div>

                <span className="lm-summary-label">
                  {card.label}
                </span>
                <strong className="lm-summary-value">
                  {card.value}
                </strong>
                <span className="lm-summary-description">
                  {card.description}
                </span>
              </button>
            );
          })}
        </section>

        <section className="lm-feature-banner">
          <div className="lm-banner-icon">
            <Activity size={28} />
          </div>

          <div className="lm-banner-copy">
            <span>CONNECTED RADIOLOGY WORKFLOW</span>
            <h3>Better images. Faster decisions.</h3>
            <p>
              Manage studies, coordinate radiologists, and keep
              your reporting workflow organised.
            </p>
          </div>

          <button
            type="button"
            className="lm-button lm-button-light"
            onClick={() => navigate("/cases/require-action")}
          >
            Open worklist <ArrowRight size={16} />
          </button>
        </section>

        <div className="lm-section-heading">
          <div>
            <h3>Quick access</h3>
            <p>Jump directly to a frequently used module.</p>
          </div>
        </div>

        <div className="lm-quick-grid">
          {filteredActions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.path}
                type="button"
                className="lm-quick-card"
                onClick={() => navigate(action.path)}
              >
                <span className="lm-quick-icon">
                  <Icon size={21} />
                </span>
                <span className="lm-quick-copy">
                  <strong>{action.label}</strong>
                  <small>{action.description}</small>
                </span>
                <ArrowRight size={17} className="lm-quick-arrow" />
              </button>
            );
          })}
        </div>

        <section className="lm-worklist-panel">
          <div className="lm-worklist-header">
            <div>
              <h3>Recent studies</h3>
              <p>Your latest radiology worklist.</p>
            </div>

            <button
              type="button"
              className="lm-button lm-button-secondary"
              onClick={() => navigate("/cases/require-action")}
            >
              View worklist <ArrowRight size={16} />
            </button>
          </div>

          <div className="lm-worklist-toolbar">
            <div className="lm-search-box">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Find a module..."
                aria-label="Search quick access modules"
              />
            </div>

            <div className="lm-date-label">
              <CalendarDays size={16} />
              Today's workspace
            </div>
          </div>

          <div className="lm-empty-state">
            <span className="lm-empty-icon">
              <FileText size={27} />
            </span>
            <h4>No study data loaded</h4>
            <p>
              Connect the existing studies API to display real
              patient studies, statuses, and reporting activity here.
            </p>
            <button
              type="button"
              className="lm-button lm-button-primary"
              onClick={() => navigate("/cases/require-action")}
            >
              Open case list <ArrowRight size={16} />
            </button>
          </div>
        </section>

        <footer className="lm-dashboard-footer">
          <span>live-matters</span>
          <span>Radiology Information System</span>
        </footer>
      </section>
    </main>
  );
}
