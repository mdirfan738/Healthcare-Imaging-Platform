
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Activity,
  Settings,
  Database,
  Users,
  UserRound,
  Monitor,
  ClipboardList,
  CreditCard,
  Receipt,
  Wallet,
  FileBarChart,
  Files,
  MessageSquare,
  House,
  ChevronRight,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  HeartPulse,
  X,
} from "lucide-react";
import "./Sidebar.css";

const menuItems = [
  {
    title: "Settings",
    icon: Settings,
    children: [
      { title: "General Settings", path: "/settings/general" },
      { title: "User Management", path: "/settings/users" },
      { title: "Roles & Permissions", path: "/settings/roles" },
    ],
  },
  {
    title: "Masters",
    icon: Database,
    children: [
      { title: "Hospital Master", path: "/masters/hospitals" },
      { title: "Modality Master", path: "/masters/modalities" },
      { title: "Department Master", path: "/masters/departments" },
      { title: "Study Master", path: "/masters/studies" },
    ],
  },
  {
    title: "Manage Radiologist",
    icon: Users,
    path: "/radiologists",
  },
  {
    title: "Update Profile",
    icon: UserRound,
    path: "/profile",
  },
  {
    title: "Case List",
    icon: Monitor,
    children: [
      {
        title: "Require Action",
        path: "/cases/require-action",
        badge: "—",
      },
      {
        title: "Review Required",
        path: "/cases/review-required",
        badge: "—",
      },
      {
        title: "Pending Orders",
        path: "/cases/pending-orders",
        badge: "—",
      },
      {
        title: "In Progress",
        path: "/cases/in-progress",
        badge: "—",
      },
      {
        title: "Final Report",
        path: "/cases/final-report",
      },
      {
        title: "Final Report (Mobile View)",
        path: "/cases/final-report-mobile",
      },
      {
        title: "24 Hour Recheck",
        path: "/cases/24-hour-recheck",
      },
      {
        title: "Patient Search",
        path: "/patients/search",
      },
    ],
  },
  {
    title: "Accounts Receivable",
    icon: CreditCard,
    path: "/finance/receivables",
  },
  {
    title: "My Transactions",
    icon: Receipt,
    path: "/finance/transactions",
  },
  {
    title: "Accounts Payables",
    icon: Wallet,
    path: "/finance/payables",
  },
  {
    title: "Quick Reports",
    icon: FileBarChart,
    path: "/reports/quick",
  },
  {
    title: "Reports",
    icon: Files,
    children: [
      { title: "Study Reports", path: "/reports/studies" },
      { title: "Financial Reports", path: "/reports/financial" },
      { title: "Operational Reports", path: "/reports/operational" },
    ],
  },
  {
    title: "Communications",
    icon: MessageSquare,
    path: "/communications",
  },
  {
    title: "House Keeping",
    icon: House,
    children: [
      { title: "Audit Logs", path: "/housekeeping/audit-logs" },
      { title: "System Activity", path: "/housekeeping/activity" },
    ],
  },
];

function hasActiveChild(item, pathname) {
  return item.children?.some(
    (child) =>
      pathname === child.path ||
      pathname.startsWith(`${child.path}/`)
  );
}

export default function Sidebar({ mobileOpen = false, onClose }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState({
    "Case List": true,
  });

  const toggleMenu = (title) => {
    setExpanded((previous) => ({
      ...previous,
      [title]: !previous[title],
    }));
  };

  return (
    <>
      {mobileOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          "lm-sidebar",
          collapsed ? "lm-sidebar--collapsed" : "",
          mobileOpen ? "lm-sidebar--mobile-open" : "",
        ].join(" ")}
      >
        <div className="lm-sidebar-brand">
          <div className="lm-brand-mark">
            <HeartPulse size={25} strokeWidth={2.5} />
          </div>

          {!collapsed && (
            <div className="lm-brand-text">
              <strong>live-matters</strong>
              <span>Radiology Information System</span>
            </div>
          )}

          <button
            className="lm-sidebar-collapse"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? (
              <PanelLeftOpen size={19} />
            ) : (
              <PanelLeftClose size={19} />
            )}
          </button>

          <button
            className="lm-sidebar-close"
            aria-label="Close sidebar"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="lm-sidebar-caption">
          {!collapsed && "WORKSPACE"}
        </div>

        <nav className="lm-navigation" aria-label="Main navigation">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isExpanded = Boolean(expanded[item.title]);
            const hasChildren = Boolean(item.children);
            const activeParent = hasActiveChild(
              item,
              location.pathname
            );

            return (
              <div className="lm-nav-group" key={item.title}>
                {hasChildren ? (
                  <button
                    type="button"
                    className={[
                      "lm-nav-link",
                      activeParent ? "lm-nav-link--parent-active" : "",
                      isExpanded ? "lm-nav-link--expanded" : "",
                    ].join(" ")}
                    onClick={() => toggleMenu(item.title)}
                    title={collapsed ? item.title : undefined}
                    aria-expanded={isExpanded}
                  >
                    <Icon size={19} className="lm-nav-icon" />

                    {!collapsed && (
                      <>
                        <span className="lm-nav-label">
                          {item.title}
                        </span>
                        {isExpanded ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </>
                    )}
                  </button>
                ) : (
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    title={collapsed ? item.title : undefined}
                    className={({ isActive }) =>
                      [
                        "lm-nav-link",
                        isActive ? "lm-nav-link--active" : "",
                      ].join(" ")
                    }
                  >
                    <Icon size={19} className="lm-nav-icon" />
                    {!collapsed && (
                      <span className="lm-nav-label">
                        {item.title}
                      </span>
                    )}
                  </NavLink>
                )}

                {hasChildren && isExpanded && !collapsed && (
                  <div className="lm-submenu">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          [
                            "lm-submenu-link",
                            isActive ? "lm-submenu-link--active" : "",
                          ].join(" ")
                        }
                      >
                        <span className="lm-submenu-dot" />
                        <span className="lm-submenu-label">
                          {child.title}
                        </span>

                        {child.badge && (
                          <span className="lm-menu-badge">
                            {child.badge}
                          </span>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="lm-sidebar-footer">
            <div className="lm-footer-status">
              <span className="lm-status-dot" />
              <span>Radiology workspace</span>
            </div>
            <small>live-matters · Clinical operations</small>
          </div>
        )}
      </aside>
    </>
  );
}
