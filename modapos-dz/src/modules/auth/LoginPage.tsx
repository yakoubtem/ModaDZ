import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Store } from "lucide-react";
import { useIPC } from "@/hooks/useIPC";
import { useAuth } from "./AuthContext";
import type { User } from "@/types";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const api = useIPC();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await api<User | null>("users:verifyCredentials", { username, password });
      if (user) {
        login(user);
        navigate("/dashboard", { replace: true });
      } else {
        toast.error("Nom d'utilisateur ou mot de passe incorrect");
        setPassword("");
      }
    } catch (error) {
      console.error("Login IPC error:", error);
      toast.error("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[var(--color-bg-base)] animate-fade-in">
      <div className="w-full max-w-sm p-8 bg-[var(--color-bg-surface)] rounded-[var(--radius-xl)] shadow-lg border border-[var(--color-border)]">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-[var(--radius-xl)] bg-[var(--color-accent)] flex items-center justify-center shadow-[var(--shadow-glow)]">
            <Store className="w-8 h-8 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">ModaDZ</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Connectez-vous à votre compte
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full mt-2" disabled={isLoading || !username || !password}>
            {isLoading ? "Connexion..." : "Se connecter"}
          </Button>
        </form>

        {/* Lock icon */}
        <div className="flex items-center justify-center gap-1.5 mt-6 text-[var(--color-text-muted)] text-xs">
          <Lock className="w-3 h-3" />
          <span>Session sécurisée locale</span>
        </div>
      </div>
    </div>
  );
}
