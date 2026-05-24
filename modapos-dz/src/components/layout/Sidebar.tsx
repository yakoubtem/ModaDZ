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
    <aside className="w-[280px] flex flex-col h-full bg-[var(--color-bg-surface)] shadow-[var(--shadow-md)] relative z-20">
      {/* ── Brand / Logo ── */}
      <div className="h-[88px] px-8 flex items-center gap-4">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-hover)] flex items-center justify-center shadow-[var(--shadow-sm)] shadow-[var(--color-accent)]/20">
          <Shirt className="w-6 h-6 text-white stroke-[2px]" />
        </div>
        <div>
          <h1 className="text-[22px] font-extrabold tracking-tight text-[var(--color-text-primary)] leading-none">
            ModaDZ
          </h1>
          <p className="text-[11px] uppercase tracking-[0.15em] font-bold text-[var(--color-text-muted)] mt-1.5">
            Point de vente
          </p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-4 px-5 space-y-2 scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3.5 px-4 py-3.5 rounded-[var(--radius-xl)] font-semibold transition-all duration-300 group relative overflow-hidden",
                  isActive
                    ? "text-[var(--color-accent)] bg-[var(--color-accent-subtle)]/70 shadow-[var(--shadow-sm)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-overlay)]/50"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon 
                    className={cn(
                      "w-[22px] h-[22px] shrink-0 transition-transform duration-300",
                      isActive ? "stroke-[2.5px] scale-105" : "stroke-[2px] group-hover:scale-110"
                    )} 
                  />
                  <span className="text-[15px] tracking-tight">
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="p-5">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-[var(--radius-xl)] text-[var(--color-text-secondary)] font-semibold transition-all hover:bg-[var(--color-danger-subtle)] hover:text-[var(--color-danger)] active:scale-[0.98] group"
        >
          <LogOut className="w-[22px] h-[22px] stroke-[2px] transition-transform group-hover:-translate-x-1" />
          <span className="text-[15px]">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
