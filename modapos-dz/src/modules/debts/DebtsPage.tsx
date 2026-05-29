import { useState, useCallback } from "react";
import { TopBar } from "@/components/layout/AppLayout";
import { useDebts } from "./hooks/useDebts";
import { useDebtDetails } from "./hooks/useDebtDetails";
import { DebtKPICards } from "./components/DebtKPICards";
import { DebtFilters } from "./components/DebtFilters";
import { DebtTable } from "./components/DebtTable";
import { TopDebtorsWidget } from "./components/TopDebtorsWidget";
import { CustomerDebtModal } from "./components/CustomerDebtModal";
import { formatCurrency } from "@/lib/utils";

// ─── Export CSV helper ────────────────────────────────────

function exportCSV(data: object[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((h) => {
        const val = (row as Record<string, unknown>)[h];
        return typeof val === "string" && val.includes(",")
          ? `"${val}"`
          : String(val ?? "");
      })
      .join(",")
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

// ─── Main Page ────────────────────────────────────────────

export function DebtsPage() {
  const {
    customers,
    stats,
    total,
    page,
    pageSize,
    isLoading,
    isStatsLoading,
    search,
    filter,
    sort,
    refresh,
    handleSearch,
    handleFilter,
    handleSort,
    handlePageChange,
  } = useDebts();

  const { detail, isLoading: detailLoading, load, clear } = useDebtDetails();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openDetail = useCallback(
    async (id: number) => {
      setIsModalOpen(true);
      await load(id);
    },
    [load]
  );

  const closeDetail = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(clear, 300);
  }, [clear]);

  const handlePaymentSuccess = useCallback(() => {
    // Reload both modal detail and the list/stats
    if (detail) {
      load(detail.id);
    }
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
      Statut:
        c.currentDebt <= 0
          ? "Soldé"
          : c.currentDebt < 5000
          ? "Faible"
          : c.currentDebt < 50000
          ? "Moyenne"
          : "Élevée",
    }));
    exportCSV(rows, `dettes_modadz_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const debtorCount = customers.filter((c) => c.currentDebt > 0).length;

  return (
    <div
      id="debts-page"
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      {/* Top App Bar */}
      <TopBar
        title=""
        actions={
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-border" onClick={handleExportCSV}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                table_view
              </span>
              Exporter CSV
            </button>
            <button className="btn-border" onClick={handleExportPDF}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                picture_as_pdf
              </span>
              Exporter PDF
            </button>
          </div>
        }
      />

      <main
        style={{
          padding: "var(--space-container)",
          maxWidth: 1440,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* ── Page Header ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "var(--space-section)",
            paddingTop: 32,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-headline-lg)",
                  fontWeight: "var(--fw-headline-lg)",
                  color: "var(--color-on-surface)",
                }}
              >
                Gestion des Dettes
              </h2>
              {debtorCount > 0 && (
                <span
                  className="chip chip-error"
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
                    warning
                  </span>
                  {debtorCount} débiteur{debtorCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <p style={{ fontSize: "var(--text-body-md)", color: "var(--color-on-surface-variant)" }}>
              Suivez et gérez les créances de votre clientèle. Enregistrez des paiements
              et consultez l'historique de chaque client.
            </p>
          </div>

          {stats && stats.totalDebt > 0 && (
            <div
              className="alert-card alert-card-error"
              style={{ minWidth: 220 }}
            >
              <span className="material-symbols-outlined filled" style={{ fontSize: 20, color: "var(--color-error)", flexShrink: 0 }}>
                account_balance_wallet
              </span>
              <div>
                <p style={{ fontSize: 11, color: "var(--color-secondary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Encours total
                </p>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--color-error)" }}>
                  {formatCurrency(stats.totalDebt)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── KPI Cards ── */}
        <DebtKPICards stats={stats} isLoading={isStatsLoading} />

        {/* ── Main content: Table + Widget ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: "var(--space-card-gap)",
            alignItems: "start",
          }}
        >
          {/* Left column: filters + table */}
          <div>
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
            {/* Footer summary */}
            {!isLoading && total > 0 && (
              <p
                style={{
                  fontSize: "var(--text-body-sm)",
                  color: "var(--color-secondary)",
                  textAlign: "right",
                  marginTop: 12,
                }}
              >
                Affichage de {Math.min((page - 1) * pageSize + 1, total)}–
                {Math.min(page * pageSize, total)} sur {total} clients
              </p>
            )}
          </div>

          {/* Right column: top debtors widget */}
          <div style={{ position: "sticky", top: 80 }}>
            <TopDebtorsWidget
              customers={customers}
              isLoading={isLoading}
              onViewDetail={openDetail}
            />
          </div>
        </div>
      </main>

      {/* ── Customer Debt Modal ── */}
      <CustomerDebtModal
        isOpen={isModalOpen}
        detail={detail}
        isLoading={detailLoading}
        onClose={closeDetail}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
