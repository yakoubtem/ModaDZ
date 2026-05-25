import { TopBar } from "@/components/layout/AppLayout";

export function InventoryPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <TopBar title="Inventory" />

      {/* Empty state — matches Stitch Inventaire design */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-container)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative ambient blob */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            opacity: 0.3,
          }}
        >
          <div
            style={{
              width: 600,
              height: 600,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
        </div>

        {/* Glass empty state card */}
        <div
          className="glass-card"
          style={{
            borderRadius: "24px",
            padding: "48px",
            maxWidth: 640,
            width: "100%",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 128,
              height: 128,
              marginBottom: "32px",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(212,175,55,0.1)",
                borderRadius: "50%",
                animation: "pulse 2s infinite",
              }}
            />
            <div
              style={{
                width: 96,
                height: 96,
                background: "var(--color-surface)",
                borderRadius: "50%",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                border: "1px solid rgba(212,175,55,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 48,
                  color: "var(--color-primary)",
                  fontVariationSettings: "'wght' 200",
                }}
              >
                shelves
              </span>
            </div>
          </div>

          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-display-lg)",
              fontWeight: "var(--fw-display-lg)",
              color: "var(--color-on-surface)",
              marginBottom: "16px",
              letterSpacing: "var(--ls-display-lg)",
              lineHeight: "var(--lh-display-lg)",
            }}
          >
            L'inventaire est vide
          </h3>
          <p
            style={{
              fontSize: "var(--text-body-lg)",
              color: "var(--color-secondary)",
              marginBottom: "40px",
              maxWidth: 400,
              lineHeight: "var(--lh-body-lg)",
            }}
          >
            Votre espace de stockage attend d'être organisé. Ajoutez vos collections et pièces exclusives pour commencer à gérer votre boutique.
          </p>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
            <button className="btn-primary" style={{ padding: "16px 32px", fontSize: 16 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add_circle</span>
              Ajouter un produit
            </button>
            <button className="btn-outline" style={{ padding: "16px 32px" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>upload_file</span>
              Importer CSV
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
