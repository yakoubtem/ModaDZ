import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useLicense } from "@/contexts/LicenseContext";
import { toast } from "sonner";

const NAV_ITEMS = [
  { key: "common.sidebar.dashboard", path: "/dashboard", icon: "dashboard", permission: "dashboard.view" },
  { key: "common.sidebar.pos", path: "/pos", icon: "point_of_sale", permission: "pos.use" },
  { key: "common.sidebar.products", path: "/products", icon: "inventory_2", permission: "products.view" },
  { key: "common.sidebar.inventory", path: "/inventory", icon: "warehouse", permission: "inventory.view" },
  { key: "common.sidebar.labels", path: "/labels", icon: "qr_code", permission: "labels.view" },
  { key: "common.sidebar.customers", path: "/customers", icon: "group", permission: "customers.view" },
  { key: "common.sidebar.sales", path: "/sales", icon: "payments", permission: "sales.view" },
  { key: "common.sidebar.debts", path: "/debts", icon: "account_balance_wallet", permission: "debts.view" },
  { key: "common.sidebar.supplierDebts", path: "/supplier-debts", icon: "account_balance_wallet", permission: "supplierDebts.view" },
  { key: "common.sidebar.expenses", path: "/expenses", icon: "receipt_long", permission: "expenses.view" },
  { key: "common.sidebar.cashRegister", path: "/cash-register", icon: "point_of_sale", permission: "cashRegister.view" },
  { key: "common.sidebar.suppliers", path: "/suppliers", icon: "local_shipping", permission: "suppliers.view" },
  { key: "common.sidebar.purchases", path: "/purchases", icon: "shopping_cart", permission: "purchases.view" },
  { key: "common.sidebar.activity", path: "/activity", icon: "history", permission: "activity.view" },
  { key: "common.sidebar.stats", path: "/stats", icon: "leaderboard", permission: "reports.view" },
  { key: "common.sidebar.users", path: "/users", icon: "shield", permission: "users.manage" },
  { key: "common.sidebar.settings", path: "/settings", icon: "settings", permission: "settings.manage" },
  { key: "common.sidebar.backups", path: "/backups", icon: "hard_drive", permission: "backups.manage" },
];

export function Sidebar() {
  const { logout, user, can } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { licenseState } = useLicense();

  const isLocked = licenseState === "locked" || licenseState === "expired_grace";

  const formatRole = (role?: string) => {
    switch (role) {
      case "admin": return t("common.roles.admin");
      case "manager": return t("common.roles.manager");
      case "cashier": return t("common.roles.cashier");
      default: return role || t("common.roles.manager");
    }
  };

  // Split nav: bottom items (settings, backups) go to footer
  const BOTTOM_KEYS = ["common.sidebar.settings", "common.sidebar.backups", "common.sidebar.users"];
  const mainItems = NAV_ITEMS.filter((i) => can(i.permission) && !BOTTOM_KEYS.includes(i.key));
  const bottomItems = NAV_ITEMS.filter((i) => can(i.permission) && BOTTOM_KEYS.includes(i.key));

  return (
    <aside className="sidebar">
      {/* ── Logo mark ── */}
      <div className="sidebar-brand">
        <img
          src="/logo/ModaDZ logo.png"
          alt="ModaDZ"
        />
      </div>

      <div className="sidebar-divider" />

      {/* ── CTA: New Transaction ── */}
      {can("pos.use") && (
        <button
          className="sidebar-cta"
          data-tooltip={t("common.sidebar.new_transaction")}
          style={{
            opacity: isLocked ? 0.4 : 1,
            cursor: isLocked ? "not-allowed" : "pointer",
          }}
          onClick={() => {
            if (isLocked) {
              toast.error("Votre licence a expiré. Veuillez la renouveler dans les paramètres.");
              return;
            }
            navigate("/pos");
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>add</span>
        </button>
      )}

      <div className="sidebar-divider" />

      {/* ── Main Navigation ── */}
      <nav
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2px",
          overflowY: "auto",
          overflowX: "visible",
          width: "100%",
          paddingTop: "4px",
        }}
      >
        {mainItems.map((item) => {
          const isItemDisabled = isLocked && item.path !== "/settings";
          return (
            <NavLink
              key={item.path}
              to={isItemDisabled ? "#" : item.path}
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
              data-tooltip={t(item.key)}
              style={{
                opacity: isItemDisabled ? 0.3 : 1,
                pointerEvents: isItemDisabled ? "none" : "auto",
              }}
            >
              {({ isActive }) => (
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
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Footer: Settings + User ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2px",
          paddingTop: "8px",
          borderTop: "1px solid rgba(208, 197, 175, 0.4)",
          marginTop: "8px",
          width: "100%",
          overflowX: "visible",
        }}
      >
        {bottomItems.map((item) => {
          const isItemDisabled = isLocked && item.path !== "/settings";
          return (
            <NavLink
              key={item.path}
              to={isItemDisabled ? "#" : item.path}
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
              data-tooltip={t(item.key)}
              style={{
                opacity: isItemDisabled ? 0.3 : 1,
                pointerEvents: isItemDisabled ? "none" : "auto",
              }}
            >
              {({ isActive }) => (
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
              )}
            </NavLink>
          );
        })}

        {/* User avatar button */}
        <button
          className="nav-item"
          data-tooltip={`${user?.name || "Profil"} · ${formatRole(user?.role)}`}
          onClick={logout}
          style={{ marginTop: "4px" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
            account_circle
          </span>
        </button>
      </div>
    </aside>
  );
}