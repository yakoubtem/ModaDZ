import type { CashSessionDetails } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface SessionReportPrintProps {
  details: CashSessionDetails | null;
  storeName?: string;
  storePhone?: string;
  storeAddress?: string;
}

export function SessionReportPrint({
  details,
  storeName,
  storePhone,
  storeAddress,
}: SessionReportPrintProps) {
  const { t, isRtl } = useTranslation();
  if (!details) return null;

  const { session, breakdown, movements } = details;
  const isClosed = session.status === "closed";

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
    <section id="session-report-print" className="print-only" dir={isRtl ? "rtl" : "ltr"}>
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
              Rapport de Session de Caisse #{session.id}
            </h1>
            <p style={{ fontSize: 12, color: "var(--color-secondary)", marginTop: 4 }}>
              Caissier: {session.user?.name ?? "—"}
            </p>
            <p style={{ fontSize: 12, color: "var(--color-secondary)", marginTop: 2 }}>
              Ouvert le: {formatDate(session.openedAt)}
            </p>
            {session.closedAt && (
              <p style={{ fontSize: 12, color: "var(--color-secondary)", marginTop: 2 }}>
                Clôturé le: {formatDate(session.closedAt)}
              </p>
            )}
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

        {/* Global Overview Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              border: "1px solid rgba(208,197,175,0.3)",
              borderRadius: "var(--radius-lg)",
              padding: 14,
              background: "rgba(208,197,175,0.06)",
            }}
          >
            <p style={{ fontSize: 11, textTransform: "uppercase", color: "var(--color-secondary)", margin: 0, fontWeight: 700 }}>
              Solde d'Ouverture
            </p>
            <p style={{ fontSize: 16, fontWeight: 700, margin: "4px 0 0", fontFamily: "var(--font-display)" }}>
              {formatCurrency(session.openingBalance)}
            </p>
          </div>
          <div
            style={{
              border: "1px solid rgba(208,197,175,0.3)",
              borderRadius: "var(--radius-lg)",
              padding: 14,
              background: "rgba(208,197,175,0.06)",
            }}
          >
            <p style={{ fontSize: 11, textTransform: "uppercase", color: "var(--color-secondary)", margin: 0, fontWeight: 700 }}>
              Solde Théorique (Attendu)
            </p>
            <p style={{ fontSize: 16, fontWeight: 700, margin: "4px 0 0", fontFamily: "var(--font-display)" }}>
              {formatCurrency(session.expectedBalance)}
            </p>
          </div>
          <div
            style={{
              border: "1px solid rgba(208,197,175,0.3)",
              borderRadius: "var(--radius-lg)",
              padding: 14,
              background: isClosed
                ? session.difference === 0
                  ? "rgba(16,185,129,0.06)"
                  : "rgba(239,68,68,0.06)"
                : "rgba(208,197,175,0.06)",
            }}
          >
            <p style={{ fontSize: 11, textTransform: "uppercase", color: "var(--color-secondary)", margin: 0, fontWeight: 700 }}>
              {isClosed ? "Solde Réel Compté (Écart)" : "Statut"}
            </p>
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                margin: "4px 0 0",
                fontFamily: "var(--font-display)",
                color: isClosed && session.difference !== 0 ? getDifferenceColor(session.difference ?? 0) : "inherit",
              }}
            >
              {isClosed
                ? `${formatCurrency(session.actualBalance ?? 0)} (${session.difference! > 0 ? "+" : ""}${formatCurrency(session.difference ?? 0)})`
                : "Session Active (Ouverte)"}
            </p>
          </div>
        </div>

        {/* Breakdown List */}
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 14,
            fontWeight: 700,
            borderBottom: "1px solid rgba(208,197,175,0.3)",
            paddingBottom: 6,
            marginBottom: 12,
          }}
        >
          Répartition des flux de trésorerie
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
          {/* Entries */}
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 700, color: "green", margin: "0 0 8px 0" }}>ENTRÉES (+)</h4>
            <table style={{ width: "100%", fontSize: 12 }}>
              <tbody>
                <tr style={{ height: 26, borderBottom: "1px solid #eee" }}>
                  <td>Ventes (Espèces)</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>{formatCurrency(breakdown.sales)}</td>
                </tr>
                <tr style={{ height: 26, borderBottom: "1px solid #eee" }}>
                  <td>Entrées de fonds (Cash In)</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>{formatCurrency(breakdown.cashIn)}</td>
                </tr>
                <tr style={{ height: 26, fontWeight: 700 }}>
                  <td>Total Entrées</td>
                  <td style={{ textAlign: "right" }}>{formatCurrency(breakdown.sales + breakdown.cashIn)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Exits */}
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 700, color: "red", margin: "0 0 8px 0" }}>SORTIES (-)</h4>
            <table style={{ width: "100%", fontSize: 12 }}>
              <tbody>
                <tr style={{ height: 26, borderBottom: "1px solid #eee" }}>
                  <td>Remboursements client</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>{formatCurrency(breakdown.refunds)}</td>
                </tr>
                <tr style={{ height: 26, borderBottom: "1px solid #eee" }}>
                  <td>Dépenses directes</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>{formatCurrency(breakdown.expenses)}</td>
                </tr>
                <tr style={{ height: 26, borderBottom: "1px solid #eee" }}>
                  <td>Règlements Fournisseurs</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>{formatCurrency(breakdown.supplierPayments)}</td>
                </tr>
                <tr style={{ height: 26, borderBottom: "1px solid #eee" }}>
                  <td>Sorties de fonds (Cash Out)</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>{formatCurrency(breakdown.cashOut)}</td>
                </tr>
                <tr style={{ height: 26, fontWeight: 700 }}>
                  <td>Total Sorties</td>
                  <td style={{ textAlign: "right" }}>
                    {formatCurrency(
                      breakdown.refunds + breakdown.expenses + breakdown.supplierPayments + breakdown.cashOut
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Movements Log */}
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 14,
            fontWeight: 700,
            borderBottom: "1px solid rgba(208,197,175,0.3)",
            paddingBottom: 6,
            marginBottom: 12,
          }}
        >
          Journal des mouvements de caisse
        </h3>
        <div style={{ border: "1px solid rgba(208,197,175,0.4)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ background: "rgba(208,197,175,0.15)", borderBottom: "1px solid rgba(208,197,175,0.4)" }}>
                <th style={{ padding: "8px 12px", textAlign: isRtl ? "right" : "left" }}>Heure</th>
                <th style={{ padding: "8px 12px", textAlign: isRtl ? "right" : "left" }}>Type</th>
                <th style={{ padding: "8px 12px", textAlign: isRtl ? "left" : "right" }}>Montant</th>
                <th style={{ padding: "8px 12px", textAlign: isRtl ? "right" : "left" }}>Motif & Remarques</th>
              </tr>
            </thead>
            <tbody>
              {movements && movements.length > 0 ? (
                movements.map((m, idx) => {
                  const isInput =
                    m.type === "sale" || m.type === "cash_in";
                  return (
                    <tr key={idx} style={{ borderBottom: "1px solid rgba(208,197,175,0.2)" }}>
                      <td style={{ padding: "8px 12px" }}>{new Date(m.createdAt).toLocaleTimeString()}</td>
                      <td style={{ padding: "8px 12px", fontWeight: 600 }}>{getMovementTypeLabel(m.type)}</td>
                      <td
                        style={{
                          padding: "8px 12px",
                          textAlign: isRtl ? "left" : "right",
                          fontWeight: 700,
                          color: isInput ? "green" : "red",
                        }}
                      >
                        {isInput ? "+" : "-"}
                        {formatCurrency(m.amount)}
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ fontWeight: 600 }}>{m.reason || "—"}</span>
                        {m.notes && <span style={{ color: "#777", display: "block", fontSize: 10 }}>{m.notes}</span>}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} style={{ padding: "16px", textAlign: "center", color: "#888" }}>
                    Aucun mouvement enregistré durant cette session.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Closing Notes */}
        {session.notes && (
          <div style={{ marginTop: 24, padding: 12, border: "1px dashed #d0c5af", borderRadius: "var(--radius-md)" }}>
            <p style={{ margin: "0 0 6px 0", fontWeight: 700, fontSize: 12 }}>Notes / Remarques :</p>
            <p style={{ margin: 0, fontSize: 11, color: "var(--color-secondary)" }}>{session.notes}</p>
          </div>
        )}

        {/* Signature */}
        <div style={{ marginTop: 60, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
          <div style={{ textAlign: "center", width: 180 }}>
            <p style={{ borderBottom: "1px solid #1e1810", paddingBottom: 40, margin: "0 0 6px 0" }}>
              Signature du Caissier
            </p>
            <p style={{ margin: 0, fontWeight: 600 }}>{session.user?.name}</p>
          </div>
          <div style={{ textAlign: "center", width: 180 }}>
            <p style={{ borderBottom: "1px solid #1e1810", paddingBottom: 40, margin: "0 0 6px 0" }}>
              Signature du Responsable
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
