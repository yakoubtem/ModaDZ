import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { User } from "@/types";
import { hasPermission } from "@/lib/permissions";

interface AuthContextValue {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  can: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("modadz_user");
      const parsed = stored ? (JSON.parse(stored) as User) : null;
      if (parsed && window.api && window.api.invoke) {
        window.api.invoke("auth:setCurrentUser", parsed.id).catch(() => {});
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const login = useCallback((user: User) => {
    setUser(user);
    localStorage.setItem("modadz_user", JSON.stringify(user));
    if (window.api && window.api.invoke) {
      window.api.invoke("auth:setCurrentUser", user.id).catch(() => {});
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("modadz_user");
    if (window.api && window.api.invoke) {
      window.api.invoke("auth:setCurrentUser", null).catch(() => {});
    }
  }, []);

  const can = useCallback((permission: string) => {
    return hasPermission(user?.role, permission);
  }, [user?.role]);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user, can }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
