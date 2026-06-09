import { useState, useCallback } from "react";
import { useSupplierDebts } from "./hooks/useSupplierDebts";
import { useSupplierDebtDetails } from "./hooks/useSupplierDebtDetails";
import { SupplierDebtKPICards } from "./components/SupplierDebtKPICards";
import { SupplierDebtFilters } from "./components/SupplierDebtFilters";
import { SupplierDebtTable } from "./components/SupplierDebtTable";
import { SupplierDebtModal } from "./components/SupplierDebtModal";
import { SupplierPaymentFormModal } from "./components/SupplierPaymentFormModal";
import { SupplierStatementPrint } from "./components/SupplierStatementPrint";
import { SupplierReportPrint } from "./components/SupplierReportPrint";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuth } from "@/modules/auth/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useSettings } from "@/modules/settings/hooks/useSettings";
import * as XLSX from "xlsx";

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

export function SupplierDebtsPage() {
  const { t, isRtl } = useTranslation();
  const { can } = useAuth();
  const { settings } = useSettings();

  const {
    suppliers, stats, total, page, pageSize,
    isLoading, isStatsLoading,
    search, filter, sort, fromDate, toDate, minAmount, maxAmount,
    refresh, handleSearch, handleFilter, handleSort, handlePageChange,
    handleDateRange, handleAmountRange, handleResetFilters
  } = useSupplierDebts();

  const { detail, isLoading: detailLoading, load, clear } = useSupplierDebtDetails();

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [activeSupplier, setActiveSupplier] = useState<{ id: number; name: string; currentDebt: number } | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const openDetail = useCallback(async (id: number) => {
    setIsDetailOpen(true);
    await load(id);
  }, [load]);

  const closeDetail = useCallback(() => {
    setIsDetailOpen(false);
    setTimeout(clear, 300);
  }, [clear]);

  const openQuickPayment = useCallback((supplier: { id: number; name: string; currentDebt: number }) => {
    setActiveSupplier(supplier);
    setIsPaymentOpen(true);
  }, []);

  const closePayment = useCallback(() => {
    setIsPaymentOpen(false);
    setActiveSupplier(null);
  }, []);

  const handlePaymentSuccess = useCallback(() => {
    if (detail) load(detail.id);
    refresh();
  }, [detail, load, refresh]);

  // Export CSV
  const handleExportCSV = () => {
    const rows = suppliers.map((s) => ({
      [t("supplierDebts.table.supplier")]: s.name,
      [t("supplierDebts.table.phone")]: s.phone ?? "",
      [t("supplierDebts.table.total_purchases")]: s.totalPurchases,
      [t("supplierDebts.table.total_paid")]: s.totalPaid,
      [t("supplierDebts.table.current_debt")]: s.currentDebt,
      [t("supplierDebts.table.last_purchase")]: s.lastPurchaseDate ?? "",
    }));
    exportCSV(rows, `dettes_fournisseurs_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  // Export Excel
  const handleExportExcel = () => {
    const rows = suppliers.map((s) => ({
      [t("supplierDebts.table.supplier")]: s.name,
      [t("supplierDebts.table.phone")]: s.phone ?? "",
      [t("supplierDebts.table.total_purchases")]: s.totalPurchases,
      [t("supplierDebts.table.total_paid")]: s.totalPaid,
      [t("supplierDebts.table.current_debt")]: s.currentDebt,
      [t("supplierDebts.table.last_purchase")]: s.lastPurchaseDate ? formatDate(s.lastPurchaseDate) : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t("supplierDebts.table.list_header"));
    XLSX.writeFile(workbook, `dettes_fournisseurs_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Export PDF (Report of all supplier debts)
  const handleExportPDF = () => {
    const printStyle = document.createElement("style");
    printStyle.innerHTML = `
      @media print {
        @page {
          size: A4 portrait !important;
          margin: 15mm !important;
        }
        body * {
          visibility: hidden !important;
        }
        #supplier-report-print, #supplier-report-print * {
          visibility: visible !important;
        }
        #supplier-report-print {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          background: white !important;
          color: black !important;
        }
      }
    `;
    document.head.appendChild(printStyle);
    window.print();
    document.head.removeChild(printStyle);
  };

  // Print single supplier statement Timeline A4
  const handlePrintStatement = async (supplierId: number) => {
    // 1. If not already loaded, load it
    await load(supplierId);
    // 2. Inject statement print layout styles
    const printStyle = document.createElement("style");
    printStyle.innerHTML = `
      @media print {
        @page {
          size: A4 portrait !important;
          margin: 15mm !important;
        }
        body * {
          visibility: hidden !important;
        }
        #supplier-statement-print, #supplier-statement-print * {
          visibility: visible !important;
        }
        #supplier-statement-print {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          background: white !important;
          color: black !important;
        }
      }
    `;
    document.head.appendChild(printStyle);
    // 3. Trigger print
    window.print();
    // 4. Cleanup style
    document.head.removeChild(printStyle);
  };

  const debtorCount = suppliers.filter((s) => s.currentDebt > 0).length;

  return (
    <div
      id="supplier-debts-page"
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
          flexDirection: isRtl ? "row-reverse" : "row",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
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
            {t("supplierDebts.title")}
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
              {debtorCount} {t("supplierDebts.debtors_count_label")}
            </span>
          )}
        </div>

        {can("supplierDebts.manage") && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" }}>
            <button className="btn-border" onClick={handleExportCSV} style={{ gap: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>table_view</span>
              CSV
            </button>
            <button className="btn-border" onClick={handleExportExcel} style={{ gap: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>grid_on</span>
              Excel
            </button>
            <button className="btn-border" onClick={handleExportPDF} style={{ gap: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>picture_as_pdf</span>
              PDF
            </button>
          </div>
        )}
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
            flexDirection: isRtl ? "row-reverse" : "row",
          }}
        >
          <div style={{ textAlign: isRtl ? "right" : "left" }}>
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
              {t("supplierDebts.header_title")}
            </h1>
            <p
              style={{
                fontSize: "var(--text-body-md)",
                color: "var(--color-secondary)",
                lineHeight: 1.6,
                maxWidth: 480,
              }}
            >
              {t("supplierDebts.header_desc")}
            </p>
          </div>

          {/* Total debt pill */}
          {can("supplierDebts.manage") && stats && stats.totalDebt > 0 && (
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
                flexDirection: isRtl ? "row-reverse" : "row",
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
              <div style={{ textAlign: isRtl ? "right" : "left" }}>
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
                  {t("supplierDebts.total_outstanding")}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 20,
                    color: "var(--color-error)",
                    letterSpacing: "-0.02em",
                    direction: "ltr",
                  }}
                >
                  {formatCurrency(stats.totalDebt)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── KPI Cards ── */}
        {can("supplierDebts.manage") && (
          <SupplierDebtKPICards stats={stats} isLoading={isStatsLoading} />
        )}

        {/* ── Filters + Table ── */}
        <SupplierDebtFilters
          search={search}
          filter={filter}
          sort={sort}
          onSearch={handleSearch}
          onFilter={handleFilter}
          onSort={handleSort}
        />

        {/* Advanced Filters Trigger */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-primary)",
              fontSize: 12,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontFamily: "var(--font-body)",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              {showAdvanced ? "tune" : "tune"}
            </span>
            {showAdvanced ? "Masquer les filtres avancés" : "Afficher les filtres avancés (Date, Montant)"}
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvanced && (
          <div
            className="animate-fade-in"
            style={{
              background: "rgba(255,255,255,0.75)",
              border: "1px solid rgba(208,197,175,0.25)",
              borderRadius: "var(--radius-xl)",
              padding: "18px 24px",
              marginBottom: 16,
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 16,
            }}
          >
            {/* Date range filter */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--color-secondary)", textTransform: "uppercase" }}>
                Période des achats
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => handleDateRange(e.target.value, toDate)}
                  style={{
                    flex: 1, padding: "8px 12px", border: "1px solid rgba(208,197,175,0.3)",
                    borderRadius: "var(--radius-md)", fontSize: 12, fontFamily: "var(--font-body)",
                    background: "var(--color-sand)"
                  }}
                />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => handleDateRange(fromDate, e.target.value)}
                  style={{
                    flex: 1, padding: "8px 12px", border: "1px solid rgba(208,197,175,0.3)",
                    borderRadius: "var(--radius-md)", fontSize: 12, fontFamily: "var(--font-body)",
                    background: "var(--color-sand)"
                  }}
                />
              </div>
            </div>

            {/* Amount range filter */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--color-secondary)", textTransform: "uppercase" }}>
                Plage de dette (DZD)
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={minAmount}
                  onChange={(e) => handleAmountRange(e.target.value, maxAmount)}
                  style={{
                    flex: 1, padding: "8px 12px", border: "1px solid rgba(208,197,175,0.3)",
                    borderRadius: "var(--radius-md)", fontSize: 12, fontFamily: "var(--font-body)",
                    background: "var(--color-sand)"
                  }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxAmount}
                  onChange={(e) => handleAmountRange(minAmount, e.target.value)}
                  style={{
                    flex: 1, padding: "8px 12px", border: "1px solid rgba(208,197,175,0.3)",
                    borderRadius: "var(--radius-md)", fontSize: 12, fontFamily: "var(--font-body)",
                    background: "var(--color-sand)"
                  }}
                />
              </div>
            </div>

            {/* Reset advanced */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}>
              <button
                className="btn-border"
                onClick={handleResetFilters}
                style={{ padding: "8px 16px", fontSize: 12, gap: 5 }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                Réinitialiser
              </button>
            </div>
          </div>
        )}

        <SupplierDebtTable
          suppliers={suppliers}
          isLoading={isLoading}
          total={total}
          page={page}
          pageSize={pageSize}
          onViewDetail={openDetail}
          onRecordPayment={openQuickPayment}
          onPrintStatement={handlePrintStatement}
          onPageChange={handlePageChange}
        />
      </main>

      {/* ── Supplier Detail Statement Modal ── */}
      <SupplierDebtModal
        isOpen={isDetailOpen}
        detail={detail}
        isLoading={detailLoading}
        onClose={closeDetail}
        onPaymentSuccess={handlePaymentSuccess}
        onPrintStatement={handlePrintStatement}
      />

      {/* ── Quick Record Payment Modal ── */}
      {activeSupplier && (
        <SupplierPaymentFormModal
          isOpen={isPaymentOpen}
          supplierId={activeSupplier.id}
          supplierName={activeSupplier.name}
          currentDebt={activeSupplier.currentDebt}
          onClose={closePayment}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* ── Printable templates (Print Media only) ── */}
      <SupplierStatementPrint
        supplierDetail={detail}
        storeName={settings?.storeName}
        storePhone={settings?.storePhone}
        storeAddress={settings?.storeAddress}
      />

      <SupplierReportPrint
        suppliers={suppliers}
        totalDebt={stats?.totalDebt ?? 0}
        debtorCount={debtorCount}
        storeName={settings?.storeName}
        storePhone={settings?.storePhone}
        storeAddress={settings?.storeAddress}
      />

      <style>{`
        @media (max-width: 600px) {
          #supplier-debts-page main {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
