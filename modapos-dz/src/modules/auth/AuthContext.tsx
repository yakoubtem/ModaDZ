import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = sessionStorage.getItem("modadz_user");
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((user: User) => {
    setUser(user);
    sessionStorage.setItem("modadz_user", JSON.stringify(user));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem("modadz_user");
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user }}
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
