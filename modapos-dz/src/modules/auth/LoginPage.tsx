import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Store, Sparkles, ShoppingBag, Package, BarChart3 } from "lucide-react";
import { useIPC } from "@/hooks/useIPC";
import { useAuth } from "./AuthContext";
import type { User } from "@/types";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const features = [
  { icon: ShoppingBag, title: "Caisse ultra-rapide", desc: "Encaissez en quelques secondes avec des raccourcis clavier" },
  { icon: Package,     title: "Gestion des stocks",  desc: "Suivez vos produits et variantes en temps réel" },
  { icon: BarChart3,   title: "Analytiques avancées",desc: "Visualisez vos performances et tendances" },
];

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
    <div className="h-full w-full flex overflow-hidden bg-[var(--color-bg-base)] animate-fade-in">
      {/* ── Left Panel: Brand ────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />

        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/2 -translate-y-1/2 right-0 w-64 h-64 rounded-full bg-white/3" />

        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[var(--radius-lg)] bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <Store className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">ModaDZ</span>
          </div>

          {/* Main copy */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 w-fit mb-6">
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span className="text-blue-100 text-xs font-medium">Point of Sale Premium</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.1] tracking-tight mb-4">
              Gérez votre
              <br />
              <span className="text-blue-200">boutique</span>
              <br />
              intelligemment
            </h1>

            <p className="text-blue-100/80 text-base leading-relaxed max-w-sm">
              La solution tout-en-un pour les magasins de vêtements algériens. Rapide, élégante, efficace.
            </p>

            {/* Feature list */}
            <div className="mt-10 space-y-4">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-[var(--radius-md)] bg-white/10 border border-white/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-blue-200" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{title}</p>
                    <p className="text-blue-200/70 text-xs mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 text-blue-300/60 text-xs">
            <Lock className="w-3 h-3" />
            <span>Session locale sécurisée — vos données restent sur votre machine</span>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Login Form ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 overflow-y-auto">
        <div className="w-full max-w-[360px] animate-slide-up">
          {/* Mobile logo (visible on small screens only) */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-[var(--radius-lg)] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-[var(--shadow-md)]">
              <Store className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-[var(--color-text-primary)] font-bold text-lg">ModaDZ</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
              Bon retour 👋
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1.5">
              Connectez-vous à votre espace de gestion
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nom d'utilisateur"
              placeholder="votre_identifiant"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              autoComplete="username"
            />
            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              disabled={isLoading || !username || !password}
              isLoading={isLoading}
            >
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          {/* Security notice */}
          <div className="flex items-center justify-center gap-1.5 mt-8 text-[var(--color-text-muted)] text-xs">
            <Lock className="w-3 h-3" />
            <span>Session sécurisée locale</span>
          </div>
        </div>
      </div>
    </div>
  );
}
