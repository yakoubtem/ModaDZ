import { TopBar } from "@/components/layout/AppLayout";

const STAT_CARDS = [
  { label: "CA Total (mois)", value: "€124,500", icon: "trending_up", trend: "+8%", trendUp: true },
  { label: "Ticket Moyen", value: "€285", icon: "receipt_long", trend: "+3.2%", trendUp: true },
  { label: "Transactions", value: "437", icon: "point_of_sale", trend: "+12", trendUp: true },
  { label: "Taux de retour", value: "2.1%", icon: "keyboard_return", trend: "-0.3%", trendUp: false },
];

export function StatsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopBar
        title="Statistiques"
        description="Analyses et performances de votre boutique."
      />

      <main
        style={{
          padding: "var(--space-container)",
          maxWidth: 1440,
          margin: "0 auto",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-section)",
        }}
        className="animate-fade-in"
      >
        {/* KPI row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "var(--space-card-gap)",
          }}
        >
          {STAT_CARDS.map((card) => (
            <div key={card.label} className="kpi-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <span style={{ fontSize: "var(--text-label-md)", fontWeight: "var(--fw-label-md)", letterSpacing: "var(--ls-label-md)", color: "var(--color-secondary)" }}>
                  {card.label}
                </span>
                <div className="kpi-icon">
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{card.icon}</span>
                </div>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-headline-lg)",
                  fontWeight: "var(--fw-headline-lg)",
                  color: "var(--color-on-surface)",
                  marginBottom: "8px",
                }}
              >
                {card.value}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "14px" }}>
                <span
                  style={{
                    color: card.trendUp ? "var(--color-tertiary)" : "var(--color-error)",
                    display: "flex",
                    alignItems: "center",
                    fontWeight: 600,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                    {card.trendUp ? "trending_up" : "trending_down"}
                  </span>
                  {card.trend}
                </span>
                <span style={{ color: "var(--color-secondary)" }}>vs mois dernier</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts grid */}
        <div style={{ display: "grid", gridTemplateColumns: "8fr 4fr", gap: "var(--space-card-gap)" }}>
          {/* Revenue chart */}
          <div
            className="glass-card"
            style={{ borderRadius: "var(--radius-xl)", padding: "24px", height: 400, display: "flex", flexDirection: "column" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-headline-md)",
                  fontWeight: "var(--fw-headline-md)",
                  color: "var(--color-on-surface)",
                }}
              >
                Évolution du chiffre d'affaires
              </h3>
              <select
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--color-secondary)",
                  fontSize: "var(--text-body-sm)",
                  fontFamily: "var(--font-body)",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option>Cette semaine</option>
                <option>Ce mois</option>
                <option>Cette année</option>
              </select>
            </div>
            <div
              style={{
                flex: 1,
                background: "rgba(245,243,238,0.5)",
                borderRadius: "var(--radius-lg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(208,197,175,0.2)",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--color-outline)", opacity: 0.5, display: "block", marginBottom: "8px" }}>show_chart</span>
                <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)" }}>Zone de visualisation du graphique</p>
              </div>
            </div>
          </div>

          {/* Donut chart */}
          <div
            className="glass-card"
            style={{ borderRadius: "var(--radius-xl)", padding: "24px", height: 400, display: "flex", flexDirection: "column" }}
          >
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-headline-md)",
                fontWeight: "var(--fw-headline-md)",
                color: "var(--color-on-surface)",
                marginBottom: "24px",
              }}
            >
              Répartition des ventes
            </h3>
            <div
              style={{
                flex: 1,
                background: "rgba(245,243,238,0.5)",
                borderRadius: "var(--radius-lg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(208,197,175,0.2)",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--color-outline)", opacity: 0.5, display: "block", marginBottom: "8px" }}>pie_chart</span>
                <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)" }}>Par catégorie</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-card-gap)" }}>
          {["Meilleurs produits", "Meilleurs vendeurs"].map((title) => (
            <div
              key={title}
              className="glass-card"
              style={{ borderRadius: "var(--radius-xl)", padding: "24px", height: 280 }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-headline-md)",
                  fontWeight: "var(--fw-headline-md)",
                  color: "var(--color-on-surface)",
                  marginBottom: "24px",
                }}
              >
                {title}
              </h3>
              <div
                style={{
                  height: 180,
                  background: "rgba(245,243,238,0.5)",
                  borderRadius: "var(--radius-lg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(208,197,175,0.2)",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 32, color: "var(--color-outline)", opacity: 0.4 }}>bar_chart</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
