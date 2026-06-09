import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/modules/auth/AuthContext";
import { useSettings } from "@/modules/settings/hooks/useSettings";
import { useCashRegister } from "./hooks/useCashRegister";
import { CashKPICards } from "./components/CashKPICards";
import { SessionsFilters } from "./components/SessionsFilters";
import { SessionsTable } from "./components/SessionsTable";
import { MovementsFilters } from "./components/MovementsFilters";
import { MovementsTable } from "./components/MovementsTable";
import { OpenSessionModal } from "./components/OpenSessionModal";
import { CloseSessionModal } from "./components/CloseSessionModal";
import { CashMovementModal } from "./components/CashMovementModal";
import { SessionDetailModal } from "./components/SessionDetailModal";
import { SessionReportPrint } from "./components/SessionReportPrint";
import { DailyCashReportPrint } from "./components/DailyCashReportPrint";
import { formatCurrency } from "@/lib/utils";

export function CashRegisterPage() {
  const { t, isRtl } = useTranslation();
  const { user, can } = useAuth();
  const { settings } = useSettings();

  const {
    activeSession,
    isActiveLoading,
    stats,
    isStatsLoading,
    sessions,
    sessionsTotal,
    sessionsPage,
    sessionsPageSize,
    isSessionsLoading,
    sessionFilter,
    sessionUserFilter,
    sessionFromDate,
    sessionToDate,
    handleSessionFilter,
    handleSessionUserFilter,
    handleSessionDateRange,
    handleSessionPageChange,
    handleResetSessionsFilters,

    movements,
    movementsTotal,
    movementsPage,
    movementsPageSize,
    isMovementsLoading,
    movementTypeFilter,
    movementUserFilter,
    movementFromDate,
    movementToDate,
    handleMovementTypeFilter,
    handleMovementUserFilter,
    handleMovementDateRange,
    handleMovementPageChange,
    handleResetMovementsFilters,

    openSession,
    closeSession,
    createMovement,
  } = useCashRegister(user?.id ?? 0);

  // Tab State
  const [activeTab, setActiveTab] = useState<"sessions" | "movements">("sessions");

  // Modal States
  const [isOpenSessionOpen, setIsOpenSessionOpen] = useState(false);
  const [isCloseSessionOpen, setIsCloseSessionOpen] = useState(false);
  const [activeCloseSessionId, setActiveCloseSessionId] = useState<number | null>(null);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

  // Printing State
  const [printDetails, setPrintDetails] = useState<any | null>(null);

  const handlePrintSession = async (sessionId: number) => {
    try {
      const details = await window.api.invoke("cashRegister:getSessionDetails", sessionId);
      setPrintDetails(details);
      setTimeout(() => {
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
            #session-report-print, #session-report-print * {
              visibility: visible !important;
            }
            #session-report-print {
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
      }, 150);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrintDailyReport = () => {
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
        #daily-cash-report-print, #daily-cash-report-print * {
          visibility: visible !important;
        }
        #daily-cash-report-print {
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

  const triggerCloseSession = (session: any) => {
    setActiveCloseSessionId(session.id);
    setIsCloseSessionOpen(true);
  };

  const canCloseThisSession = (sessionUserVal: number) => {
    return can("cashRegister.close") || sessionUserVal === user?.id;
  };

  return (
    <div
      id="cash-register-page"
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
            point_of_sale
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
            {t("cashRegister.title")}
          </span>
          {activeSession && (
            <span
              style={{
                padding: "2px 9px",
                borderRadius: "var(--radius-full)",
                background: "rgba(16,185,129,0.1)",
                color: "var(--color-success)",
                fontSize: 11,
                fontWeight: 700,
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              Session Active
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" }}>
          {/* Quick print daily A4 overview */}
          {can("cashRegister.view") && (
            <button className="btn-border" onClick={handlePrintDailyReport} style={{ gap: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>print</span>
              {t("common.buttons.print", { defaultValue: "Imprimer Rapport" })}
            </button>
          )}

          {can("cashRegister.manage") && !activeSession && !isActiveLoading && (
            <button className="btn-primary" onClick={() => setIsOpenSessionOpen(true)} style={{ gap: 6, marginBottom: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>lock_open</span>
              {t("cashRegister.open_modal.title")}
            </button>
          )}

          {activeSession && (
            <>
              <button className="btn-border" onClick={() => setIsMovementModalOpen(true)} style={{ gap: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>swap_horiz</span>
                {t("cashRegister.movement_modal.confirm")}
              </button>
              {canCloseThisSession(activeSession.userId) && (
                <button
                  className="btn-primary"
                  onClick={() => triggerCloseSession(activeSession)}
                  style={{
                    gap: 6,
                    background: "var(--color-error)",
                    borderColor: "var(--color-error)",
                    marginBottom: 0,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>lock</span>
                  {t("cashRegister.close_modal.title")}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <main style={{ padding: "32px", maxWidth: 1480, margin: "0 auto", width: "100%" }}>
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
              {t("cashRegister.title")}
            </h1>
            <p
              style={{
                fontSize: "var(--text-body-md)",
                color: "var(--color-secondary)",
                lineHeight: 1.6,
                maxWidth: 600,
              }}
            >
              {t("cashRegister.header_desc")}
            </p>
          </div>

          {/* Active register pill info */}
          {activeSession && (
            <div
              style={{
                background: "rgba(16,185,129,0.05)",
                border: "1px solid rgba(16,185,129,0.2)",
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
                  background: "rgba(16,185,129,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span className="material-symbols-outlined filled" style={{ fontSize: 20, color: "var(--color-success)" }}>
                  point_of_sale
                </span>
              </div>
              <div style={{ textAlign: isRtl ? "right" : "left" }}>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--color-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 3,
                  }}
                >
                  {t("cashRegister.close_modal.expected")} (Caisse active)
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 20,
                    color: "var(--color-success)",
                    letterSpacing: "-0.02em",
                    direction: "ltr",
                  }}
                >
                  {formatCurrency(activeSession.expectedBalance)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── KPI Cards ── */}
        {can("cashRegister.view") && (
          <CashKPICards stats={stats} isLoading={isStatsLoading} />
        )}

        {/* ── Tab Switcher ── */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 20,
            borderBottom: "1px solid rgba(208,197,175,0.2)",
            paddingBottom: 8,
            flexDirection: isRtl ? "row-reverse" : "row",
          }}
        >
          <button
            onClick={() => setActiveTab("sessions")}
            style={{
              padding: "8px 16px",
              background: "none",
              border: "none",
              fontFamily: "var(--font-display)",
              fontSize: 15,
              fontWeight: 700,
              color: activeTab === "sessions" ? "var(--color-primary)" : "var(--color-secondary)",
              borderBottom: activeTab === "sessions" ? "3px solid var(--color-primary)" : "3px solid transparent",
              cursor: "pointer",
              transition: "all 0.15s",
              marginBottom: -11,
            }}
          >
            {t("cashRegister.tabs.sessions")}
          </button>
          <button
            onClick={() => setActiveTab("movements")}
            style={{
              padding: "8px 16px",
              background: "none",
              border: "none",
              fontFamily: "var(--font-display)",
              fontSize: 15,
              fontWeight: 700,
              color: activeTab === "movements" ? "var(--color-primary)" : "var(--color-secondary)",
              borderBottom: activeTab === "movements" ? "3px solid var(--color-primary)" : "3px solid transparent",
              cursor: "pointer",
              transition: "all 0.15s",
              marginBottom: -11,
            }}
          >
            {t("cashRegister.tabs.movements")}
          </button>
        </div>

        {/* ── Tab Panels ── */}
        {activeTab === "sessions" ? (
          <>
            <SessionsFilters
              statusFilter={sessionFilter}
              userFilter={sessionUserFilter}
              from={sessionFromDate}
              to={sessionToDate}
              onStatusChange={handleSessionFilter}
              onUserChange={handleSessionUserFilter}
              onDateRange={handleSessionDateRange}
              onReset={handleResetSessionsFilters}
            />
            <SessionsTable
              sessions={sessions}
              isLoading={isSessionsLoading}
              total={sessionsTotal}
              page={sessionsPage}
              pageSize={sessionsPageSize}
              onViewDetail={setSelectedSessionId}
              onCloseSession={triggerCloseSession}
              onPageChange={handleSessionPageChange}
              canCloseSession={true}
            />
          </>
        ) : (
          <>
            <MovementsFilters
              typeFilter={movementTypeFilter}
              userFilter={movementUserFilter}
              from={movementFromDate}
              to={movementToDate}
              onTypeChange={handleMovementTypeFilter}
              onUserChange={handleMovementUserFilter}
              onDateRange={handleMovementDateRange}
              onReset={handleResetMovementsFilters}
            />
            <MovementsTable
              movements={movements}
              isLoading={isMovementsLoading}
              total={movementsTotal}
              page={movementsPage}
              pageSize={movementsPageSize}
              onPageChange={handleMovementPageChange}
            />
          </>
        )}
      </main>

      {/* ── Modals ── */}
      <OpenSessionModal
        isOpen={isOpenSessionOpen}
        onClose={() => setIsOpenSessionOpen(false)}
        onSubmit={openSession}
      />

      <CloseSessionModal
        isOpen={isCloseSessionOpen}
        sessionId={activeCloseSessionId}
        onClose={() => {
          setIsCloseSessionOpen(false);
          setActiveCloseSessionId(null);
        }}
        onSubmit={closeSession}
      />

      <CashMovementModal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        onSubmit={createMovement}
      />

      <SessionDetailModal
        isOpen={selectedSessionId !== null}
        sessionId={selectedSessionId}
        onClose={() => setSelectedSessionId(null)}
        onPrint={handlePrintSession}
      />

      {/* ── Printable templates (Print Media only) ── */}
      <SessionReportPrint
        details={printDetails}
        storeName={settings?.storeName}
        storePhone={settings?.storePhone}
        storeAddress={settings?.storeAddress}
      />

      <DailyCashReportPrint
        stats={stats}
        sessions={sessions}
        movements={movements}
        storeName={settings?.storeName}
        storePhone={settings?.storePhone}
        storeAddress={settings?.storeAddress}
      />

      <style>{`
        @media (max-width: 600px) {
          #cash-register-page main {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
export default CashRegisterPage;
