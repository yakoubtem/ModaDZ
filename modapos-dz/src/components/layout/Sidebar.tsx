import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Boxes, 
  Users, 
  Receipt, 
  BarChart3, 
  Settings,
  LogOut,
  Shirt
} from "lucide-react";
import { useAuth } from "@/modules/auth/AuthContext";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Tableau de bord", path: "/dashboard", icon: LayoutDashboard },
  { name: "Caisse (POS)", path: "/pos", icon: ShoppingBag },
  { name: "Produits", path: "/products", icon: Package },
  { name: "Inventaire", path: "/inventory", icon: Boxes },
  { name: "Clients", path: "/customers", icon: Users },
  { name: "Ventes", path: "/sales", icon: Receipt },
  { name: "Statistiques", path: "/stats", icon: BarChart3 },
  { name: "Paramètres", path: "/settings", icon: Settings },
];

export function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="w-[256px] flex flex-col h-full bg-[var(--color-bg-subtle)] border-r border-[var(--color-border)] relative z-20">
      {/* ── Brand / Logo ── */}
      <div className="h-[72px] px-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-text-primary)] flex items-center justify-center shadow-[var(--shadow-xs)]">
          <Shirt className="w-4 h-4 text-[var(--color-bg-surface)] stroke-[2px]" />
        </div>
        <div>
          <h1 className="text-[16px] font-bold tracking-tight text-[var(--color-text-primary)] leading-none">
            ModaDZ
          </h1>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1 scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] font-medium transition-all duration-200 group",
                  isActive
                    ? "text-[var(--color-text-primary)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-xs)] border border-[var(--color-border)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-overlay)] border border-transparent"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon 
                    className={cn(
                      "w-[18px] h-[18px] shrink-0 transition-transform duration-200",
                      isActive ? "stroke-[2px] text-[var(--color-text-primary)]" : "stroke-[1.5px] group-hover:text-[var(--color-text-primary)]"
                    )} 
                  />
                  <span className="text-[13px] tracking-tight">
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="p-3">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] text-[var(--color-text-secondary)] font-medium transition-all hover:bg-[var(--color-danger-subtle)] hover:text-[var(--color-danger)] active:scale-[0.98] group"
        >
          <LogOut className="w-[18px] h-[18px] stroke-[1.5px] transition-transform group-hover:-translate-x-1 group-hover:text-[var(--color-danger)]" />
          <span className="text-[13px]">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
