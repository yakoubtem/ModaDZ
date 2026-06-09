import type { DebtSupplierDetail } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface SupplierStatementPrintProps {
  supplierDetail: DebtSupplierDetail | null;
  storeName?: string;
  storePhone?: string;
  storeAddress?: string;
}

export function SupplierStatementPrint({
  supplierDetail,
  storeName,
  storePhone,
  storeAddress,
}: SupplierStatementPrintProps) {
  const { t, isRtl } = useTranslation();

  if (!supplierDetail) return null;

  // Re-sort chronological ascending to show a timeline starting from opening balance
  const chronologicalTimeline = [...supplierDetail.timeline].reverse();
  const closingBalance = supplierDetail.summary.currentDebt;

  return (
    <section id="supplier-statement-print" className="print-only" dir={isRtl ? "rtl" : "ltr"}>
      <div style={{ fontFamily: "var(--font-body)", color: "#1e1810", padding: "10px" }}>
        {/* Header Block */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #1e1810", paddingBottom: 20, marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, margin: 0, color: "var(--color-primary)" }}>
              {t("statement.title")}
            </h1>
            <p style={{ fontSize: 13, color: "var(--color-secondary)", marginTop: 4 }}>
              {t("statement.supplier")}: <strong>{supplierDetail.name}</strong>
            </p>
            {supplierDetail.phone && <p style={{ fontSize: 12, margin: "2px 0" }}>{t("supplierDebts.table.phone")}: {supplierDetail.phone}</p>}
            {supplierDetail.email && <p style={{ fontSize: 12, margin: "2px 0" }}>Email: {supplierDetail.email}</p>}
          </div>

          <div style={{ textAlign: isRtl ? "left" : "right" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{storeName || "ModaDZ"}</h2>
            <p style={{ fontSize: 12, color: "var(--color-secondary)", marginTop: 4 }}>{storeAddress || "Alger, Algérie"}</p>
            {storePhone && <p style={{ fontSize: 12, margin: "2px 0" }}>{storePhone}</p>}
            <p style={{ fontSize: 11, color: "var(--color-secondary)", marginTop: 6 }}>
              {t("statement.period")}: {t("expenses.report.all_periods")}
            </p>
          </div>
        </div>

        {/* Balance Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div style={{ border: "1px solid rgba(208,197,175,0.3)", borderRadius: "var(--radius-lg)", padding: 16, background: "rgba(208,197,175,0.06)" }}>
            <p style={{ fontSize: 11, textTransform: "uppercase", color: "var(--color-secondary)", margin: 0, fontWeight: 700 }}>
              {t("statement.opening_balance")}
            </p>
            <p style={{ fontSize: 18, fontWeight: 700, margin: "4px 0 0", fontFamily: "var(--font-display)" }}>
              {formatCurrency(0)}
            </p>
          </div>
          <div style={{ border: "1px solid rgba(208,197,175,0.3)", borderRadius: "var(--radius-lg)", padding: 16, background: "rgba(39,104,104,0.06)" }}>
            <p style={{ fontSize: 11, textTransform: "uppercase", color: "var(--color-secondary)", margin: 0, fontWeight: 700 }}>
              {t("supplierDebts.supplier_debts.total_paid")}
            </p>
            <p style={{ fontSize: 18, fontWeight: 700, margin: "4px 0 0", color: "var(--color-tertiary)", fontFamily: "var(--font-display)" }}>
              {formatCurrency(supplierDetail.summary.totalPaid)}
            </p>
          </div>
          <div style={{ border: "1px solid rgba(208,197,175,0.3)", borderRadius: "var(--radius-lg)", padding: 16, background: "rgba(186,26,26,0.06)" }}>
            <p style={{ fontSize: 11, textTransform: "uppercase", color: "var(--color-secondary)", margin: 0, fontWeight: 700 }}>
              {t("statement.closing_balance")}
            </p>
            <p style={{ fontSize: 18, fontWeight: 700, margin: "4px 0 0", color: "var(--color-error)", fontFamily: "var(--font-display)" }}>
              {formatCurrency(closingBalance)}
            </p>
          </div>
        </div>

        {/* Transactions Table */}
        <div style={{ border: "1px solid rgba(208,197,175,0.4)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(208,197,175,0.15)", borderBottom: "1px solid rgba(208,197,175,0.4)" }}>
                <th style={{ padding: "10px 14px", textAlign: isRtl ? "right" : "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>{t("statement.date")}</th>
                <th style={{ padding: "10px 14px", textAlign: isRtl ? "right" : "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>{t("statement.type")}</th>
                <th style={{ padding: "10px 14px", textAlign: isRtl ? "right" : "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>{t("statement.ref")}</th>
                <th style={{ padding: "10px 14px", textAlign: isRtl ? "left" : "right", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>{t("statement.amount")}</th>
                <th style={{ padding: "10px 14px", textAlign: isRtl ? "left" : "right", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>{t("statement.balance")}</th>
              </tr>
            </thead>
            <tbody>
              {chronologicalTimeline.map((tx, idx) => {
                const isPurchase = tx.type === "purchase";
                const desc = isPurchase
                  ? t("statement.purchase_desc", { ref: tx.reference })
                  : t("statement.payment_desc", { method: t("common.payment_methods." + tx.reference.split("-")[0].toLowerCase(), { defaultValue: "espèces" }), ref: tx.reference });

                return (
                  <tr key={idx} style={{ borderBottom: "1px solid rgba(208,197,175,0.2)" }}>
                    <td style={{ padding: "12px 14px", fontSize: 12 }}>{formatDate(tx.date)}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12, fontWeight: 600, color: isPurchase ? "#1e1810" : "var(--color-tertiary)" }}>
                      {desc}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12, fontFamily: "var(--font-display)" }}>{tx.reference}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12, textAlign: isRtl ? "left" : "right", fontWeight: 700, color: isPurchase ? "#1e1810" : "var(--color-tertiary)" }}>
                      {isPurchase ? "" : "-"}{formatCurrency(tx.amount)}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12, textAlign: isRtl ? "left" : "right", fontWeight: 700, fontFamily: "var(--font-display)" }}>
                      {formatCurrency(tx.runningBalance)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
