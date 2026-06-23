import type { SupplierDebtSummary } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface SupplierReportPrintProps {
  suppliers: SupplierDebtSummary[];
  totalDebt: number;
  debtorCount: number;
  storeName?: string;
  storePhone?: string;
  storeAddress?: string;
}

export function SupplierReportPrint({
  suppliers,
  totalDebt,
  debtorCount,
  storeName,
  storePhone,
  storeAddress,
}: SupplierReportPrintProps) {
  const { isRtl } = useTranslation();

  return (
    <section id="supplier-report-print" className="print-only print-only-container" dir={isRtl ? "rtl" : "ltr"}>
      <div style={{ fontFamily: "var(--font-body)", color: "#1e1810", padding: "10px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #1e1810", paddingBottom: 20, marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, margin: 0, color: "var(--color-primary)" }}>
              Rapport des Dettes Fournisseurs
            </h1>
            <p style={{ fontSize: 12, color: "var(--color-secondary)", marginTop: 4 }}>
              Généré le: {new Date().toLocaleDateString(isRtl ? "ar-DZ" : "fr-DZ")}
            </p>
          </div>
          <div style={{ textAlign: isRtl ? "left" : "right" }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{storeName || "ModaDZ"}</h2>
            {storeAddress && <p style={{ fontSize: 11, color: "var(--color-secondary)", margin: "2px 0" }}>{storeAddress}</p>}
            {storePhone && <p style={{ fontSize: 11, color: "var(--color-secondary)", margin: "2px 0" }}>{storePhone}</p>}
          </div>
        </div>

        {/* Global KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div style={{ border: "1px solid rgba(208,197,175,0.3)", borderRadius: "var(--radius-lg)", padding: 14, background: "rgba(186,26,26,0.06)" }}>
            <p style={{ fontSize: 11, textTransform: "uppercase", color: "var(--color-secondary)", margin: 0, fontWeight: 700 }}>
              Encours total dû
            </p>
            <p style={{ fontSize: 18, fontWeight: 700, margin: "4px 0 0", color: "var(--color-error)", fontFamily: "var(--font-display)" }}>
              {formatCurrency(totalDebt)}
            </p>
          </div>
          <div style={{ border: "1px solid rgba(208,197,175,0.3)", borderRadius: "var(--radius-lg)", padding: 14, background: "rgba(208,197,175,0.06)" }}>
            <p style={{ fontSize: 11, textTransform: "uppercase", color: "var(--color-secondary)", margin: 0, fontWeight: 700 }}>
              Morbide / Fournisseurs Créditeurs
            </p>
            <p style={{ fontSize: 18, fontWeight: 700, margin: "4px 0 0", fontFamily: "var(--font-display)" }}>
              {debtorCount}
            </p>
          </div>
        </div>

        {/* Suppliers Table */}
        <div style={{ border: "1px solid rgba(208,197,175,0.4)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(208,197,175,0.15)", borderBottom: "1px solid rgba(208,197,175,0.4)" }}>
                <th style={{ padding: "10px 14px", textAlign: isRtl ? "right" : "left", fontSize: 11, fontWeight: 700 }}>Fournisseur</th>
                <th style={{ padding: "10px 14px", textAlign: isRtl ? "right" : "left", fontSize: 11, fontWeight: 700 }}>Téléphone</th>
                <th style={{ padding: "10px 14px", textAlign: isRtl ? "left" : "right", fontSize: 11, fontWeight: 700 }}>Total Achats</th>
                <th style={{ padding: "10px 14px", textAlign: isRtl ? "left" : "right", fontSize: 11, fontWeight: 700 }}>Total Payé</th>
                <th style={{ padding: "10px 14px", textAlign: isRtl ? "left" : "right", fontSize: 11, fontWeight: 700 }}>Solde Dû</th>
                <th style={{ padding: "10px 14px", textAlign: isRtl ? "right" : "left", fontSize: 11, fontWeight: 700 }}>Dernier Achat</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid rgba(208,197,175,0.2)" }}>
                  <td style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600 }}>{s.name}</td>
                  <td style={{ padding: "10px 14px", fontSize: 11, color: "var(--color-secondary)" }}>{s.phone || "—"}</td>
                  <td style={{ padding: "10px 14px", fontSize: 11, textAlign: isRtl ? "left" : "right" }}>{formatCurrency(s.totalPurchases)}</td>
                  <td style={{ padding: "10px 14px", fontSize: 11, textAlign: isRtl ? "left" : "right", color: "var(--color-tertiary)" }}>{formatCurrency(s.totalPaid)}</td>
                  <td style={{ padding: "10px 14px", fontSize: 11, textAlign: isRtl ? "left" : "right", fontWeight: 700, color: s.currentDebt > 0 ? "var(--color-error)" : "inherit" }}>
                    {formatCurrency(s.currentDebt)}
                  </td>
                  <td style={{ padding: "10px 14px", fontSize: 11, color: "var(--color-secondary)" }}>{s.lastPurchaseDate ? formatDate(s.lastPurchaseDate) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
