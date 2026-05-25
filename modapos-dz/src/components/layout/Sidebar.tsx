import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/AuthContext";

const NAV_ITEMS = [
  { name: "Dashboard",  path: "/dashboard", icon: "dashboard" },
  { name: "POS",        path: "/pos",        icon: "point_of_sale" },
  { name: "Products",   path: "/products",   icon: "inventory_2" },
  { name: "Inventory",  path: "/inventory",  icon: "warehouse" },
  { name: "Customers",  path: "/customers",  icon: "group" },
  { name: "Sales",      path: "/sales",      icon: "payments" },
  { name: "Stats",      path: "/stats",      icon: "leaderboard" },
  { name: "Settings",   path: "/settings",   icon: "settings" },
];

export function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      {/* ── Brand ── */}
      <div style={{ marginBottom: "40px" }}>
        <h1 className="sidebar-logo-title">ModaDZ</h1>
        <p className="sidebar-logo-sub">Luxury Retail POS</p>
      </div>

      {/* ── CTA ── */}
      <button
        className="sidebar-cta"
        style={{ marginBottom: "32px" }}
        onClick={() => navigate("/pos")}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
        New Transaction
      </button>

      {/* ── Navigation ── */}
      <nav
        className="no-scrollbar"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          overflowY: "auto",
        }}
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item${isActive ? " active" : ""}`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: "22px",
                    fontVariationSettings: isActive
                      ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
                      : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                  }}
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div
        style={{
          borderTop: "1px solid rgba(208, 197, 175, 0.3)",
          paddingTop: "16px",
          marginTop: "16px",
        }}
      >
        <button className="nav-item" onClick={logout} style={{ gap: "12px" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
            account_circle
          </span>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <span style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "0.05em" }}>
              {user?.name || "User Profile"}
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "var(--color-secondary)",
                textTransform: "capitalize",
                fontWeight: 400,
                letterSpacing: "normal",
              }}
            >
              {user?.role || "Manager"}
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
}