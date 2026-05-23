import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  Users,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Store,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/modules/auth/AuthContext";

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
  { to: "/pos",       icon: ShoppingCart,    label: "Caisse",       badge: "F1" },
  { to: "/products",  icon: Package,         label: "Produits" },
  { to: "/inventory", icon: Warehouse,       label: "Inventaire" },
  { to: "/customers", icon: Users,           label: "Clients" },
  { to: "/sales",     icon: Receipt,         label: "Historique" },
  { to: "/stats",     icon: BarChart3,       label: "Statistiques" },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full bg-[var(--color-sidebar-bg)]",
        "border-r border-[var(--color-border)] shadow-[1px_0_0_0_var(--color-border)]",
        "transition-all duration-300 ease-in-out shrink-0",
        collapsed ? "w-[68px] min-w-[68px]" : "w-[260px] min-w-[260px]"
      )}
    >
      {/* ── Brand ── */}
      <div
        className={cn(
          "flex items-center h-[68px] border-b border-[var(--color-border)] drag-region shrink-0",
          "transition-all duration-300",
          collapsed ? "justify-center px-0" : "px-5 gap-3"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center shrink-0 no-drag rounded-[12px]",
            "bg-gradient-to-br from-blue-600 to-blue-800",
            "shadow-[0_4px_12px_rgba(37,99,235,0.35)]",
            "w-9 h-9"
          )}
        >
          <Store className="w-[18px] h-[18px] text-white" />
        </div>

        {!collapsed && (
          <div className="no-drag min-w-0 overflow-hidden">
            <p className="text-[14px] font-bold text-[var(--color-text-primary)] leading-none tracking-tight">
              ModaDZ
            </p>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-[3px] font-medium">
              Point de vente
            </p>
          </div>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-5 px-3">
        {!collapsed && (
          <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.10em] px-3 mb-2">
            Menu
          </p>
        )}

        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center rounded-[10px] select-none",
                  "text-[13.5px] font-medium transition-all duration-150",
                  collapsed
                    ? "h-10 w-10 justify-center mx-auto"
                    : "gap-3 px-3 py-2.5",
                  isActive
                    ? [
                        "bg-[var(--color-accent-subtle)] text-[var(--color-accent)]",
                        "font-semibold",
                        "shadow-[0_0_0_1px_var(--color-accent-border)]",
                      ]
                    : [
                        "text-[var(--color-text-secondary)]",
                        "hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-text-primary)]",
                      ]
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Left bar */}
                  {isActive && !collapsed && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[20px] bg-[var(--color-accent)] rounded-r-full" />
                  )}

                  <item.icon
                    className={cn(
                      "shrink-0 transition-colors",
                      collapsed ? "w-[18px] h-[18px]" : "w-[16px] h-[16px]",
                      isActive
                        ? "text-[var(--color-accent)]"
                        : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)]"
                    )}
                  />

                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent-border)]">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}

                  {/* Tooltip when collapsed */}
                  {collapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 rounded-[8px] bg-[var(--color-text-primary)] text-white text-[12px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-[var(--shadow-lg)]">
                      {item.label}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* ── Bottom Section ── */}
      <div className="border-t border-[var(--color-border)] px-3 py-4 shrink-0 space-y-1">
        {/* Settings link */}
        <NavLink
          to="/settings"
          title={collapsed ? "Paramètres" : undefined}
          className={({ isActive }) =>
            cn(
              "group relative flex items-center rounded-[10px] select-none",
              "text-[13.5px] font-medium transition-all duration-150",
              collapsed ? "h-10 w-10 justify-center mx-auto" : "gap-3 px-3 py-2.5",
              isActive
                ? "bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-semibold shadow-[0_0_0_1px_var(--color-accent-border)]"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-text-primary)]"
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && !collapsed && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[20px] bg-[var(--color-accent)] rounded-r-full" />
              )}
              <Settings
                className={cn(
                  "w-[16px] h-[16px] shrink-0",
                  isActive ? "text-[var(--color-accent)]" : "text-[var(--color-text-muted)]"
                )}
              />
              {!collapsed && <span>Paramètres</span>}
              {collapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 rounded-[8px] bg-[var(--color-text-primary)] text-white text-[12px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-[var(--shadow-lg)]">
                  Paramètres
                </div>
              )}
            </>
          )}
        </NavLink>

        {/* User row */}
        {!collapsed ? (
          <div className="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-[10px] hover:bg-[var(--color-sidebar-hover)] transition-colors cursor-default">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[12px] font-bold shrink-0 shadow-sm ring-2 ring-white">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate leading-tight">
                {user?.name}
              </p>
              <p className="text-[11px] text-[var(--color-text-muted)] capitalize mt-[2px]">
                {user?.role}
              </p>
            </div>
            <button
              onClick={logout}
              title="Déconnexion"
              className="w-7 h-7 flex items-center justify-center rounded-[8px] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)] transition-colors shrink-0"
            >
              <LogOut className="w-[14px] h-[14px]" />
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            title="Déconnexion"
            className="group relative flex items-center justify-center h-10 w-10 mx-auto rounded-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)] transition-colors"
          >
            <LogOut className="w-[16px] h-[16px]" />
            <div className="absolute left-full ml-3 px-3 py-1.5 rounded-[8px] bg-[var(--color-text-primary)] text-white text-[12px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-[var(--shadow-lg)]">
              Déconnexion
            </div>
          </button>
        )}
      </div>

      {/* ── Collapse Toggle ── */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className={cn(
          "absolute -right-[13px] top-[68px] translate-y-8 z-20 no-drag",
          "w-[26px] h-[26px] rounded-full",
          "bg-white border border-[var(--color-border)]",
          "flex items-center justify-center",
          "shadow-[var(--shadow-md)]",
          "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
          "hover:bg-[var(--color-bg-elevated)] transition-all duration-150"
        )}
        title={collapsed ? "Développer" : "Réduire"}
      >
        {collapsed ? (
          <ChevronRight className="w-[11px] h-[11px]" />
        ) : (
          <ChevronLeft className="w-[11px] h-[11px]" />
        )}
      </button>
    </aside>
  );
}
