import type { CashRegisterStatistics, CashSession, CashMovement } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface DailyCashReportPrintProps {
  stats: CashRegisterStatistics | null;
  sessions: CashSession[];
  movements: CashMovement[];
  storeName?: string;
  storePhone?: string;
  storeAddress?: string;
}

export function DailyCashReportPrint({
  stats,
  sessions,
  movements,
  storeName,
  storePhone,
  storeAddress,
}: DailyCashReportPrintProps) {
  const { t, isRtl } = useTranslation();

  const getDifferenceColor = (diff: number) => {
    if (diff === 0) return "#10b981";
    if (Math.abs(diff) <= 1000) return "#f59e0b";
    return "#ef4444";
  };

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case "sale":
        return t("cashRegister.types.sale");
      case "refund":
        return t("cashRegister.types.refund");
      case "expense":
        return t("cashRegister.types.expense");
      case "supplier_payment":
        return t("cashRegister.types.supplier_payment");
      case "cash_in":
        return t("cashRegister.types.cash_in");
      case "cash_out":
        return t("cashRegister.types.cash_out");
      default:
        return type;
    }
  };

  return (
    <section id="daily-cash-report-print" className="print-only print-only-container" dir={isRtl ? "rtl" : "ltr"}>
      <div style={{ fontFamily: "var(--font-body)", color: "#1e1810", padding: "20px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: "2px solid #1e1810",
            paddingBottom: 20,
            marginBottom: 20,
            flexDirection: isRtl ? "row-reverse" : "row",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                fontWeight: 700,
                margin: 0,
                color: "var(--color-primary)",
              }}
            >
              Rapport Journalier de Caisse
            </h1>
            <p style={{ fontSize: 12, color: "var(--color-secondary)", marginTop: 4 }}>
              Date: {new Date().toLocaleDateString(isRtl ? "ar-DZ" : "fr-DZ")}
            </p>
          </div>
          <div style={{ textAlign: isRtl ? "left" : "right" }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{storeName || "ModaDZ"}</h2>
            {storeAddress && (
              <p style={{ fontSize: 11, color: "var(--color-secondary)", margin: "2px 0" }}>{storeAddress}</p>
            )}
            {storePhone && (
              <p style={{ fontSize: 11, color: "var(--color-secondary)", margin: "2px 0" }}>{storePhone}</p>
            )}
          </div>
        </div>

        {/* KPIs Summary */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div style={{ border: "1px solid rgba(208,197,175,0.3)", borderRadius: "var(--radius-lg)", padding: 12, background: "rgba(208,197,175,0.06)" }}>
            <p style={{ fontSize: 10, textTransform: "uppercase", color: "var(--color-secondary)", margin: 0, fontWeight: 700 }}>
              Fonds de Caisse Actuel
            </p>
            <p style={{ fontSize: 15, fontWeight: 700, margin: "4px 0 0", fontFamily: "var(--font-display)" }}>
              {stats ? formatCurrency(stats.cashToday) : "—"}
            </p>
          </div>
          <div style={{ border: "1px solid rgba(208,197,175,0.3)", borderRadius: "var(--radius-lg)", padding: 12, background: "rgba(208,197,175,0.06)" }}>
            <p style={{ fontSize: 10, textTransform: "uppercase", color: "var(--color-secondary)", margin: 0, fontWeight: 700 }}>
              Mouvements du jour
            </p>
            <p style={{ fontSize: 15, fontWeight: 700, margin: "4px 0 0", fontFamily: "var(--font-display)" }}>
              {stats ? stats.cashMovementsCount : "—"}
            </p>
          </div>
          <div style={{ border: "1px solid rgba(208,197,175,0.3)", borderRadius: "var(--radius-lg)", padding: 12, background: "rgba(208,197,175,0.06)" }}>
            <p style={{ fontSize: 10, textTransform: "uppercase", color: "var(--color-secondary)", margin: 0, fontWeight: 700 }}>
              Sessions Actives
            </p>
            <p style={{ fontSize: 15, fontWeight: 700, margin: "4px 0 0", fontFamily: "var(--font-display)" }}>
              {stats ? stats.openSessionsCount : "—"}
            </p>
          </div>
          <div style={{ border: "1px solid rgba(208,197,175,0.3)", borderRadius: "var(--radius-lg)", padding: 12, background: stats?.cashDifference !== 0 ? "rgba(239,68,68,0.06)" : "rgba(16,185,129,0.06)" }}>
            <p style={{ fontSize: 10, textTransform: "uppercase", color: "var(--color-secondary)", margin: 0, fontWeight: 700 }}>
              Écarts Cumulés
            </p>
            <p style={{ fontSize: 15, fontWeight: 700, margin: "4px 0 0", fontFamily: "var(--font-display)", color: stats && stats.cashDifference !== 0 ? getDifferenceColor(stats.cashDifference) : "inherit" }}>
              {stats ? formatCurrency(stats.cashDifference) : "—"}
            </p>
          </div>
        </div>

        {/* Sessions list */}
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 13,
            fontWeight: 700,
            borderBottom: "1px solid rgba(208,197,175,0.3)",
            paddingBottom: 6,
            marginBottom: 12,
          }}
        >
          Sessions de caisse
        </h3>
        <div style={{ border: "1px solid rgba(208,197,175,0.4)", borderRadius: "var(--radius-lg)", overflow: "hidden", marginBottom: 24 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
            <thead>
              <tr style={{ background: "rgba(208,197,175,0.15)", borderBottom: "1px solid rgba(208,197,175,0.4)" }}>
                <th style={{ padding: "8px 10px", textAlign: isRtl ? "right" : "left" }}>Caissier</th>
                <th style={{ padding: "8px 10px", textAlign: isRtl ? "right" : "left" }}>Ouverture</th>
                <th style={{ padding: "8px 10px", textAlign: isRtl ? "right" : "left" }}>Clôture</th>
                <th style={{ padding: "8px 10px", textAlign: isRtl ? "left" : "right" }}>Solde Initial</th>
                <th style={{ padding: "8px 10px", textAlign: isRtl ? "left" : "right" }}>Solde Théorique</th>
                <th style={{ padding: "8px 10px", textAlign: isRtl ? "left" : "right" }}>Solde Réel</th>
                <th style={{ padding: "8px 10px", textAlign: isRtl ? "left" : "right" }}>Écart</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length > 0 ? (
                sessions.map((s, idx) => {
                  const isClosed = s.status === "closed";
                  return (
                    <tr key={idx} style={{ borderBottom: "1px solid rgba(208,197,175,0.2)" }}>
                      <td style={{ padding: "8px 10px", fontWeight: 600 }}>{s.user?.name}</td>
                      <td style={{ padding: "8px 10px" }}>{new Date(s.openedAt).toLocaleTimeString()}</td>
                      <td style={{ padding: "8px 10px" }}>{s.closedAt ? new Date(s.closedAt).toLocaleTimeString() : "Session Active"}</td>
                      <td style={{ padding: "8px 10px", textAlign: isRtl ? "left" : "right" }}>{formatCurrency(s.openingBalance)}</td>
                      <td style={{ padding: "8px 10px", textAlign: isRtl ? "left" : "right" }}>{formatCurrency(s.expectedBalance)}</td>
                      <td style={{ padding: "8px 10px", textAlign: isRtl ? "left" : "right" }}>{isClosed ? formatCurrency(s.actualBalance ?? 0) : "—"}</td>
                      <td style={{ padding: "8px 10px", textAlign: isRtl ? "left" : "right", fontWeight: 700, color: isClosed && s.difference !== 0 ? getDifferenceColor(s.difference ?? 0) : "inherit" }}>
                        {isClosed ? (s.difference! > 0 ? `+${formatCurrency(s.difference!)}` : formatCurrency(s.difference!)) : "—"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: "12px", textAlign: "center", color: "#888" }}>
                    Aucune session enregistrée pour cette période.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Movements list */}
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 13,
            fontWeight: 700,
            borderBottom: "1px solid rgba(208,197,175,0.3)",
            paddingBottom: 6,
            marginBottom: 12,
          }}
        >
          Derniers Mouvements
        </h3>
        <div style={{ border: "1px solid rgba(208,197,175,0.4)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
            <thead>
              <tr style={{ background: "rgba(208,197,175,0.15)", borderBottom: "1px solid rgba(208,197,175,0.4)" }}>
                <th style={{ padding: "8px 10px", textAlign: isRtl ? "right" : "left" }}>Heure</th>
                <th style={{ padding: "8px 10px", textAlign: isRtl ? "right" : "left" }}>Caissier</th>
                <th style={{ padding: "8px 10px", textAlign: isRtl ? "right" : "left" }}>Type</th>
                <th style={{ padding: "8px 10px", textAlign: isRtl ? "left" : "right" }}>Montant</th>
                <th style={{ padding: "8px 10px", textAlign: isRtl ? "right" : "left" }}>Motif & Notes</th>
              </tr>
            </thead>
            <tbody>
              {movements.length > 0 ? (
                movements.map((m, idx) => {
                  const isInput = m.type === "sale" || m.type === "cash_in";
                  return (
                    <tr key={idx} style={{ borderBottom: "1px solid rgba(208,197,175,0.2)" }}>
                      <td style={{ padding: "8px 10px" }}>{new Date(m.createdAt).toLocaleTimeString()}</td>
                      <td style={{ padding: "8px 10px" }}>{m.session?.user?.name ?? "—"}</td>
                      <td style={{ padding: "8px 10px", fontWeight: 600 }}>{getMovementTypeLabel(m.type)}</td>
                      <td style={{ padding: "8px 10px", textAlign: isRtl ? "left" : "right", fontWeight: 700, color: isInput ? "green" : "red" }}>
                        {isInput ? "+" : "-"}
                        {formatCurrency(m.amount)}
                      </td>
                      <td style={{ padding: "8px 10px" }}>
                        {m.reason || "—"} {m.notes && <span style={{ color: "#777", fontSize: 9 }}>({m.notes})</span>}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: "12px", textAlign: "center", color: "#888" }}>
                    Aucun mouvement enregistré pour cette période.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
