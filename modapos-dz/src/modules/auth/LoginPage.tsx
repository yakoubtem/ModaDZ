import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIPC } from "@/hooks/useIPC";
import { useAuth } from "./AuthContext";
import type { User } from "@/types";
import { toast } from "sonner";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div
      style={{
        height: "100vh",
        width: "100%",
        display: "flex",
        overflow: "hidden",
        background: "var(--color-background)",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* ── Left Panel: Brand ── */}
      <div
        style={{
          display: "none",
          width: "50%",
          position: "relative",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "40px",
          background: "rgba(228, 226, 221, 0.2)",
          overflow: "hidden",
        }}
        className="login-left-panel"
      >
        {/* Ambient blobs */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "-10%",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,175,55,0.3) 0%, transparent 70%)",
            filter: "blur(80px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-20%",
            right: "-10%",
            width: 800,
            height: 800,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(115,92,0,0.1) 0%, transparent 70%)",
            filter: "blur(100px)",
            pointerEvents: "none",
          }}
        />

        {/* Top logo */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-headline-md)",
              fontWeight: 500,
              color: "var(--color-on-surface)",
              letterSpacing: "-0.01em",
            }}
          >
            ModaDZ
            <span style={{ color: "var(--color-primary-container)" }}>.</span>
          </h1>
        </div>

        {/* Center content */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "64px" }}>
          <div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-display-lg)",
                fontWeight: "var(--fw-display-lg)",
                lineHeight: "var(--lh-display-lg)",
                letterSpacing: "var(--ls-display-lg)",
                color: "var(--color-on-surface)",
                marginBottom: "24px",
                maxWidth: "480px",
              }}
            >
              L'élégance au service de la performance.
            </h2>
            <p
              style={{
                fontSize: "var(--text-body-lg)",
                color: "var(--color-on-surface-variant)",
                maxWidth: "400px",
                lineHeight: "var(--lh-body-lg)",
              }}
            >
              Une expérience de vente repensée pour les boutiques d'exception. Gérez vos transactions avec précision et fluidité.
            </p>
          </div>

          {/* Feature cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "420px" }}>
            {[
              { icon: "speed", title: "Encaissement Ultra-Rapide", desc: "Fluidifiez le passage en caisse." },
              { icon: "inventory_2", title: "Gestion d'Inventaire Précise", desc: "Suivi en temps réel des stocks." },
            ].map((f) => (
              <div key={f.icon} className="glass-login" style={{ padding: "16px", borderRadius: "16px", display: "flex", alignItems: "center", gap: "16px" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "rgba(251,249,244,0.8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-primary-container)",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    flexShrink: 0,
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {f.icon}
                  </span>
                </div>
                <div>
                  <p style={{ fontSize: "var(--text-label-md)", fontWeight: "var(--fw-label-md)", letterSpacing: "var(--ls-label-md)", color: "var(--color-on-surface)", marginBottom: "2px" }}>{f.title}</p>
                  <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-on-surface-variant)" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: "var(--text-label-sm)", letterSpacing: "var(--ls-label-sm)", color: "rgba(79,70,53,0.6)", textTransform: "uppercase" }}>
            Système POS Premium © 2024
          </p>
        </div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 32px",
          background: "var(--color-surface)",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={{ marginBottom: "48px" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-headline-lg)",
                fontWeight: "var(--fw-headline-lg)",
                color: "var(--color-on-surface)",
                marginBottom: "8px",
              }}
            >
              Bon retour 👋
            </h2>
            <p style={{ fontSize: "var(--text-body-md)", color: "var(--color-on-surface-variant)" }}>
              Veuillez vous connecter pour accéder à votre espace de vente.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Username */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label
                htmlFor="username"
                style={{
                  fontSize: "var(--text-label-sm)",
                  fontWeight: "var(--fw-label-sm)",
                  letterSpacing: "var(--ls-label-sm)",
                  color: "var(--color-on-surface)",
                  textTransform: "uppercase",
                }}
              >
                Identifiant
              </label>
              <div style={{ position: "relative" }}>
                <span
                  className="material-symbols-outlined"
                  style={{
                    position: "absolute",
                    left: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--color-on-surface-variant)",
                    pointerEvents: "none",
                    fontSize: 22,
                  }}
                >
                  person
                </span>
                <input
                  id="username"
                  type="text"
                  className="input-glass"
                  style={{ paddingLeft: 48, paddingTop: 16, paddingBottom: 16 }}
                  placeholder="nom@boutique.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label
                  htmlFor="password"
                  style={{
                    fontSize: "var(--text-label-sm)",
                    fontWeight: "var(--fw-label-sm)",
                    letterSpacing: "var(--ls-label-sm)",
                    color: "var(--color-on-surface)",
                    textTransform: "uppercase",
                  }}
                >
                  Mot de passe
                </label>
                <a
                  href="#"
                  style={{
                    fontSize: "var(--text-label-sm)",
                    fontWeight: "var(--fw-label-sm)",
                    letterSpacing: "var(--ls-label-sm)",
                    color: "var(--color-primary)",
                    textDecoration: "none",
                  }}
                >
                  Oublié ?
                </a>
              </div>
              <div style={{ position: "relative" }}>
                <span
                  className="material-symbols-outlined"
                  style={{
                    position: "absolute",
                    left: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--color-on-surface-variant)",
                    pointerEvents: "none",
                    fontSize: 22,
                  }}
                >
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="input-glass"
                  style={{ paddingLeft: 48, paddingRight: 48, paddingTop: 16, paddingBottom: 16 }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "var(--color-on-surface-variant)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <div style={{ marginTop: "16px" }}>
              <button
                type="submit"
                className="btn-login"
                disabled={isLoading || !username || !password}
                style={{ opacity: isLoading || !username || !password ? 0.6 : 1 }}
              >
                {isLoading ? "Connexion..." : "Se connecter"}
                {!isLoading && (
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    arrow_forward
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Security note */}
          <div
            style={{
              marginTop: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              color: "var(--color-on-surface-variant)",
              opacity: 0.7,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>gpp_good</span>
            <span style={{ fontSize: "var(--text-label-sm)", letterSpacing: "var(--ls-label-sm)", textTransform: "uppercase" }}>
              Session sécurisée locale
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .login-left-panel { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
