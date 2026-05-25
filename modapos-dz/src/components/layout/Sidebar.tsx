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
  Shirt,
  ChevronRight,
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
  const { logout, user } = useAuth();

  return (
    <aside className="w-[272px] h-screen shrink-0 bg-white border-r border-neutral-200/70 shadow-[1px_0_0_rgba(0,0,0,0.03)] flex flex-col">

      {/* ───────────────── Logo / Brand ───────────────── */}
      <div className="h-[84px] px-6 flex items-center justify-between border-b border-neutral-100">
        <div className="flex items-center gap-4">

          {/* Logo */}
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-100">
            <Shirt className="w-5 h-5 text-white stroke-[2px]" />
          </div>

          {/* Brand Text */}
          <div>
            <h1 className="text-[17px] font-semibold tracking-tight text-neutral-900 leading-none">
              ModaDZ
            </h1>

            <p className="text-[12px] text-neutral-500 mt-1">
              Gestion de magasin
            </p>
          </div>
        </div>

        <button className="w-8 h-8 rounded-xl border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors">
          <ChevronRight className="w-4 h-4 text-neutral-500" />
        </button>
      </div>

      {/* ───────────────── Navigation ───────────────── */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-2 scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group overflow-hidden",

                  isActive
                    ? "bg-blue-50 text-blue-700 shadow-sm"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-blue-600" />
                  )}

                  {/* Icon */}
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200",

                      isActive
                        ? "bg-white shadow-sm"
                        : "group-hover:bg-white"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-[18px] h-[18px] transition-all duration-200",

                        isActive
                          ? "text-blue-700 stroke-[2px]"
                          : "text-neutral-500 stroke-[1.75px] group-hover:text-neutral-900"
                      )}
                    />
                  </div>

                  {/* Text */}
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium tracking-tight">
                      {item.name}
                    </span>
                  </div>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ───────────────── Footer ───────────────── */}
      <div className="border-t border-neutral-100 p-4 space-y-4">

        {/* User Card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-50 border border-neutral-100">

          {/* Avatar */}
          <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
            {user?.name?.charAt(0) || "A"}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium text-neutral-900 truncate">
              {user?.name || "Admin"}
            </p>

            <p className="text-[12px] text-neutral-500 capitalize">
              {user?.role || "Administrateur"}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-neutral-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-neutral-200 group-hover:border-red-100 transition-all">
            <LogOut className="w-[18px] h-[18px] stroke-[1.75px]" />
          </div>

          <span className="text-[14px] font-medium tracking-tight">
            Déconnexion
          </span>
        </button>
      </div>
    </aside>
  );
}