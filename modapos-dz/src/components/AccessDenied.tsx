import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { useAuth } from "@/modules/auth/AuthContext";
import { Button } from "@/components/ui/Button";

export function AccessDenied() {
  const { can, logout } = useAuth();
  const navigate = useNavigate();

  const handleGoHome = () => {
    if (can("dashboard.view")) {
      navigate("/dashboard");
    } else if (can("pos.use")) {
      navigate("/pos");
    } else {
      logout();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--color-surface-container-low)",
        padding: "24px",
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: "480px",
          width: "100%",
          padding: "40px",
          borderRadius: "var(--radius-2xl)",
          textAlign: "center",
          border: "1px solid rgba(208, 197, 175, 0.3)",
          boxShadow: "var(--shadow-elevated)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Warning Icon Container */}
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "var(--radius-2xl)",
            background: "rgba(186, 26, 26, 0.1)",
            border: "1px solid rgba(186, 26, 26, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
            color: "var(--color-error)",
          }}
        >
          <ShieldAlert size={40} />
        </div>

        {/* Heading */}
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "24px",
            fontWeight: 700,
            color: "var(--color-on-surface)",
            marginBottom: "12px",
            letterSpacing: "-0.01em",
          }}
        >
          Accès Refusé
        </h2>

        {/* Description */}
        <p
          style={{
            fontSize: "14px",
            color: "var(--color-secondary)",
            lineHeight: 1.6,
            marginBottom: "32px",
          }}
        >
          Vous ne disposez pas des autorisations nécessaires pour accéder à cette ressource. Veuillez contacter l'administrateur système si vous pensez qu'il s'agit d'une erreur.
        </p>

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px", width: "100%" }}>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            <ArrowLeft size={16} />
            Retour
          </Button>
          <Button
            variant="primary"
            onClick={handleGoHome}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            <Home size={16} />
            Accueil
          </Button>
        </div>
      </div>
    </div>
  );
}
