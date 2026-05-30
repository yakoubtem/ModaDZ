import { useState, useCallback } from "react";
import { useDebts } from "./hooks/useDebts";
import { useDebtDetails } from "./hooks/useDebtDetails";
import { DebtKPICards } from "./components/DebtKPICards";
import { DebtFilters } from "./components/DebtFilters";
import { DebtTable } from "./components/DebtTable";

import { CustomerDebtModal } from "./components/CustomerDebtModal";
import { formatCurrency } from "@/lib/utils";

// ─── Export CSV helper ────────────────────────────────────

function exportCSV(data: object[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = (row as Record<string, unknown>)[h];
      return typeof val === "string" && val.includes(",") ? `"${val}"` : String(val ?? "");
    }).join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Page ─────────────────────────────────────────────────

export function DebtsPage() {
  const {
    customers, stats, total, page, pageSize,
    isLoading, isStatsLoading,
    search, filter, sort,
    refresh, handleSearch, handleFilter, handleSort, handlePageChange,
  } = useDebts();

  const { detail, isLoading: detailLoading, load, clear } = useDebtDetails();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openDetail = useCallback(async (id: number) => {
    setIsModalOpen(true);
    await load(id);
  }, [load]);

  const closeDetail = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(clear, 300);
  }, [clear]);

  const handlePaymentSuccess = useCallback(() => {
    if (detail) load(detail.id);
    refresh();
  }, [detail, load, refresh]);

  const handleExportCSV = () => {
    const rows = customers.map((c) => ({
      Client: c.name,
      Téléphone: c.phone ?? "",
      "Total achats": c.totalPurchases,
      "Total payé": c.totalPaid,
      "Dette actuelle": c.currentDebt,
      "Dernier achat": c.lastPurchaseDate ?? "",
      Statut: c.currentDebt <= 0 ? "Soldé" : c.currentDebt < 5000 ? "Faible" : c.currentDebt < 50000 ? "Moyenne" : "Élevée",
    }));
    exportCSV(rows, `dettes_modadz_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportPDF = () => window.print();

  const debtorCount = customers.filter((c) => c.currentDebt > 0).length;

  return (
    <div
      id="debts-page"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "var(--color-surface-container)",
      }}
    >
      {/* ── Top bar ── */}
      <div
        style={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(208,197,175,0.2)",
          padding: "0 32px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="material-symbols-outlined filled" style={{ fontSize: 22, color: "var(--color-primary)" }}>
            account_balance_wallet
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 16,
              color: "var(--color-on-surface)",
              letterSpacing: "-0.01em",
            }}
          >
            Gestion des Dettes
          </span>
          {debtorCount > 0 && (
            <span
              style={{
                padding: "2px 9px",
                borderRadius: "var(--radius-full)",
                background: "rgba(186,26,26,0.1)",
                color: "var(--color-error)",
                fontSize: 11,
                fontWeight: 700,
                border: "1px solid rgba(186,26,26,0.2)",
              }}
            >
              {debtorCount} débiteur{debtorCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="btn-border" onClick={handleExportCSV} style={{ gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>table_view</span>
            CSV
          </button>
          <button className="btn-border" onClick={handleExportPDF} style={{ gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>picture_as_pdf</span>
            PDF
          </button>
        </div>
      </div>

      <main
        style={{
          padding: "32px",
          maxWidth: 1480,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* ── Page Header ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 32,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 28,
                fontWeight: 700,
                color: "var(--color-on-surface)",
                letterSpacing: "-0.02em",
                marginBottom: 8,
              }}
            >
              Tableau des dettes
            </h1>
            <p
              style={{
                fontSize: "var(--text-body-md)",
                color: "var(--color-secondary)",
                lineHeight: 1.6,
                maxWidth: 480,
              }}
            >
              Suivez les créances clients et les paiements en attente. Enregistrez des
              remboursements et consultez l'historique de chaque débiteur.
            </p>
          </div>

          {/* Total debt pill */}
          {stats && stats.totalDebt > 0 && (
            <div
              style={{
                background: "rgba(186,26,26,0.06)",
                border: "1px solid rgba(186,26,26,0.18)",
                borderRadius: "var(--radius-xl)",
                padding: "16px 24px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "var(--radius-full)",
                  background: "rgba(186,26,26,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span className="material-symbols-outlined filled" style={{ fontSize: 20, color: "var(--color-error)" }}>
                  account_balance_wallet
                </span>
              </div>
              <div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--color-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 3,
                  }}
                >
                  Encours total
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 20,
                    color: "var(--color-error)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {formatCurrency(stats.totalDebt)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── KPI Cards ── */}
        <DebtKPICards stats={stats} isLoading={isStatsLoading} />

        {/* ── Filters + Table ── */}
        <DebtFilters
          search={search}
          filter={filter}
          sort={sort}
          onSearch={handleSearch}
          onFilter={handleFilter}
          onSort={handleSort}
        />
        <DebtTable
          customers={customers}
          isLoading={isLoading}
          total={total}
          page={page}
          pageSize={pageSize}
          onViewDetail={openDetail}
          onPageChange={handlePageChange}
        />
      </main>

      {/* ── Customer Debt Modal ── */}
      <CustomerDebtModal
        isOpen={isModalOpen}
        detail={detail}
        isLoading={detailLoading}
        onClose={closeDetail}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* ── Responsive styles ── */}
      <style>{`
        @media (max-width: 600px) {
          #debts-page main {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
