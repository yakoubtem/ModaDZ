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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/modules/auth/AuthContext";
import { Badge } from "@/components/ui/Badge";

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
  { to: "/pos",       icon: ShoppingCart,    label: "Caisse",          badge: "F1" },
  { to: "/products",  icon: Package,         label: "Produits" },
  { to: "/inventory", icon: Warehouse,       label: "Inventaire" },
  { to: "/customers", icon: Users,           label: "Clients" },
  { to: "/sales",     icon: Receipt,         label: "Historique" },
  { to: "/stats",     icon: BarChart3,       label: "Statistiques" },
];

export function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="flex flex-col w-[220px] min-w-[220px] h-full bg-[var(--color-sidebar-bg)] border-r border-[var(--color-border)]">
      {/* Logo / App Name */}
      <div className="flex items-center gap-2.5 px-4 h-[56px] border-b border-[var(--color-border)] drag-region shrink-0">
        <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--color-accent)] flex items-center justify-center shrink-0 no-drag">
          <Store className="w-4 h-4 text-white" />
        </div>
        <div className="no-drag">
          <p className="text-sm font-semibold text-[var(--color-text-primary)] leading-none">
            ModaDZ
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
            Gestion de magasin
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)]",
                "text-sm transition-all duration-150 select-none",
                isActive
                  ? "bg-[var(--color-sidebar-active)] text-[var(--color-text-primary)] font-medium"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-text-primary)]"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive
                      ? "text-[var(--color-accent)]"
                      : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)]"
                  )}
                />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && (
                  <Badge variant="default" className="text-[10px] px-1.5 py-0 font-mono">
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: Settings + User */}
      <div className="border-t border-[var(--color-border)] px-2 py-3 space-y-0.5 shrink-0">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)]",
              "text-sm transition-all duration-150",
              isActive
                ? "bg-[var(--color-sidebar-active)] text-[var(--color-text-primary)] font-medium"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-text-primary)]"
            )
          }
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span>Paramètres</span>
        </NavLink>

        {/* User card */}
        <div className="flex items-center gap-2.5 px-3 py-2 mt-1">
          <div className="w-7 h-7 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white text-xs font-semibold shrink-0">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">
              {user?.name}
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)] capitalize">
              {user?.role}
            </p>
          </div>
          <button
            onClick={logout}
            title="Déconnexion"
            className="w-6 h-6 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
