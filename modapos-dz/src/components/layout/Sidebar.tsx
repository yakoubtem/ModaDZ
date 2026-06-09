import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useLicense } from "@/contexts/LicenseContext";
import { toast } from "sonner";

const NAV_ITEMS = [
  { key: "common.sidebar.dashboard",  path: "/dashboard", icon: "dashboard",              permission: "dashboard.view" },
  { key: "common.sidebar.pos",        path: "/pos",        icon: "point_of_sale",          permission: "pos.use" },
  { key: "common.sidebar.products",   path: "/products",   icon: "inventory_2",            permission: "products.view" },
  { key: "common.sidebar.inventory",  path: "/inventory",  icon: "warehouse",              permission: "inventory.view" },
  { key: "common.sidebar.labels",     path: "/labels",     icon: "qr_code",                permission: "labels.view" },
  { key: "common.sidebar.customers",  path: "/customers",  icon: "group",                  permission: "customers.view" },
  { key: "common.sidebar.sales",      path: "/sales",      icon: "payments",               permission: "sales.view" },
  { key: "common.sidebar.debts",      path: "/debts",      icon: "account_balance_wallet", permission: "debts.view" },
  { key: "common.sidebar.supplierDebts", path: "/supplier-debts", icon: "account_balance_wallet", permission: "supplierDebts.view" },
  { key: "common.sidebar.expenses",   path: "/expenses",   icon: "receipt_long",           permission: "expenses.view" },
  { key: "common.sidebar.cashRegister", path: "/cash-register", icon: "point_of_sale",   permission: "cashRegister.view" },
  { key: "common.sidebar.suppliers",  path: "/suppliers",  icon: "local_shipping",         permission: "suppliers.view" },
  { key: "common.sidebar.purchases",  path: "/purchases",  icon: "shopping_cart",          permission: "purchases.view" },
  { key: "common.sidebar.activity",   path: "/activity",   icon: "history",                permission: "activity.view" },
  { key: "common.sidebar.stats",      path: "/stats",      icon: "leaderboard",            permission: "reports.view" },
  { key: "common.sidebar.users",      path: "/users",      icon: "shield",                 permission: "users.manage" },
  { key: "common.sidebar.settings",   path: "/settings",   icon: "settings",               permission: "settings.manage" },
  { key: "common.sidebar.backups",    path: "/backups",    icon: "hard_drive",             permission: "backups.manage" },
];

export function Sidebar() {
  const { logout, user, can } = useAuth();
  const navigate = useNavigate();
  const { t, isRtl } = useTranslation();
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

  return (
    <aside className="sidebar">
      {/* ── Brand ── */}
      <div style={{ marginBottom: "40px", textAlign: isRtl ? "right" : "left" }}>
        <h1 className="sidebar-logo-title">ModaDZ</h1>
        <p className="sidebar-logo-sub">{t("common.login.subtitle")}</p>
      </div>

      {/* ── CTA ── */}
      {can("pos.use") && (
        <button
          className="sidebar-cta"
          style={{
            marginBottom: "32px",
            flexDirection: isRtl ? "row-reverse" : "row",
            opacity: isLocked ? 0.4 : 1,
            cursor: isLocked ? "not-allowed" : "pointer"
          }}
          onClick={() => {
            if (isLocked) {
              toast.error("Votre licence a expiré. Veuillez la renouveler dans les paramètres.");
              return;
            }
            navigate("/pos");
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
          {t("common.sidebar.new_transaction")}
        </button>
      )}

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
        {NAV_ITEMS.filter((item) => can(item.permission)).map((item) => {
          const isItemDisabled = isLocked && item.path !== "/settings";
          return (
            <NavLink
              key={item.path}
              to={isItemDisabled ? "#" : item.path}
              className={({ isActive }) =>
                `nav-item${isActive ? " active" : ""}`
              }
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                textAlign: isRtl ? "right" : "left",
                opacity: isItemDisabled ? 0.35 : 1,
                pointerEvents: isItemDisabled ? "none" : "auto",
                cursor: isItemDisabled ? "not-allowed" : "pointer",
              }}
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
                  <span>{t(item.key)}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div
        style={{
          borderTop: "1px solid rgba(208, 197, 175, 0.3)",
          paddingTop: "16px",
          marginTop: "16px",
        }}
      >
        <button
          className="nav-item"
          onClick={logout}
          style={{
            gap: "12px",
            flexDirection: isRtl ? "row-reverse" : "row",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
            account_circle
          </span>
          <div style={{ display: "flex", flexDirection: "column", alignItems: isRtl ? "flex-end" : "flex-start" }}>
            <span style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "0.05em" }}>
              {user?.name || t("common.sidebar.profile")}
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
              {formatRole(user?.role)}
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
}