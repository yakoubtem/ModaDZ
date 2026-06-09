import { useState, useCallback, useEffect } from "react";
import { useIPC } from "@/hooks/useIPC";
import type {
  CashSession,
  CashMovement,
  CashRegisterStatistics,
  CashSessionFilter,
  CashMovementTypeFilter,
} from "@/types";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

export function useCashRegister(userId: number) {
  const api = useIPC();
  const { t } = useTranslation();

  // Active Session State
  const [activeSession, setActiveSession] = useState<CashSession | null>(null);
  const [isActiveLoading, setIsActiveLoading] = useState(false);

  // Statistics State
  const [stats, setStats] = useState<CashRegisterStatistics | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  // Sessions Tab State
  const [sessions, setSessions] = useState<CashSession[]>([]);
  const [sessionsTotal, setSessionsTotal] = useState(0);
  const [sessionsPage, setSessionsPage] = useState(1);
  const [sessionsPageSize] = useState(20);
  const [isSessionsLoading, setIsSessionsLoading] = useState(false);
  const [sessionFilter, setSessionFilter] = useState<CashSessionFilter>("all");
  const [sessionUserFilter, setSessionUserFilter] = useState<number | undefined>(undefined);
  const [sessionFromDate, setSessionFromDate] = useState("");
  const [sessionToDate, setSessionToDate] = useState("");

  // Movements Tab State
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [movementsTotal, setMovementsTotal] = useState(0);
  const [movementsPage, setMovementsPage] = useState(1);
  const [movementsPageSize] = useState(20);
  const [isMovementsLoading, setIsMovementsLoading] = useState(false);
  const [movementTypeFilter, setMovementTypeFilter] = useState<CashMovementTypeFilter>("all");
  const [movementUserFilter, setMovementUserFilter] = useState<number | undefined>(undefined);
  const [movementFromDate, setMovementFromDate] = useState("");
  const [movementToDate, setMovementToDate] = useState("");

  // ─── Load Active Session ───
  const loadActiveSession = useCallback(async () => {
    if (!userId) return;
    setIsActiveLoading(true);
    try {
      const result = await api<CashSession | null>("cashRegister:getActiveSession", { userId });
      setActiveSession(result);
    } catch {
      toast.error(t("cashRegister.toasts.error_load_active_session", { defaultValue: "Impossible de charger la caisse active" }));
    } finally {
      setIsActiveLoading(false);
    }
  }, [api, userId, t]);

  // ─── Load Stats ───
  const loadStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const result = await api<CashRegisterStatistics>("cashRegister:getStatistics");
      setStats(result);
    } catch {
      toast.error(t("cashRegister.toasts.error_load_stats", { defaultValue: "Impossible de charger les statistiques" }));
    } finally {
      setIsStatsLoading(false);
    }
  }, [api, t]);

  // ─── Load Sessions ───
  const loadSessionsPage = useCallback(async (
    p: number,
    statusFilter: CashSessionFilter,
    userFilter: number | undefined,
    from: string,
    to: string
  ) => {
    setIsSessionsLoading(true);
    try {
      const result = await api<{ sessions: CashSession[]; total: number }>("cashRegister:getSessions", {
        page: p,
        pageSize: sessionsPageSize,
        status: statusFilter === "all" ? undefined : statusFilter,
        userId: userFilter,
        from: from || undefined,
        to: to || undefined,
      });
      setSessions(result.sessions);
      setSessionsTotal(result.total);
      setSessionsPage(p);
    } catch {
      toast.error(t("cashRegister.toasts.error_load_sessions", { defaultValue: "Impossible de charger les sessions" }));
    } finally {
      setIsSessionsLoading(false);
    }
  }, [api, sessionsPageSize, t]);

  // ─── Load Movements ───
  const loadMovementsPage = useCallback(async (
    p: number,
    typeFilter: CashMovementTypeFilter,
    userFilter: number | undefined,
    from: string,
    to: string
  ) => {
    setIsMovementsLoading(true);
    try {
      const result = await api<{ movements: CashMovement[]; total: number }>("cashRegister:getMovements", {
        page: p,
        pageSize: movementsPageSize,
        type: typeFilter,
        userId: userFilter,
        from: from || undefined,
        to: to || undefined,
      });
      setMovements(result.movements);
      setMovementsTotal(result.total);
      setMovementsPage(p);
    } catch {
      toast.error(t("cashRegister.toasts.error_load_movements", { defaultValue: "Impossible de charger les mouvements" }));
    } finally {
      setIsMovementsLoading(false);
    }
  }, [api, movementsPageSize, t]);

  // ─── Initial Load ───
  useEffect(() => {
    loadActiveSession();
    loadStats();
    loadSessionsPage(1, "all", undefined, "", "");
    loadMovementsPage(1, "all", undefined, "", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ─── Refresh All ───
  const refreshAll = useCallback(() => {
    loadActiveSession();
    loadStats();
    loadSessionsPage(sessionsPage, sessionFilter, sessionUserFilter, sessionFromDate, sessionToDate);
    loadMovementsPage(movementsPage, movementTypeFilter, movementUserFilter, movementFromDate, movementToDate);
  }, [
    loadActiveSession,
    loadStats,
    loadSessionsPage,
    loadMovementsPage,
    sessionsPage,
    sessionFilter,
    sessionUserFilter,
    sessionFromDate,
    sessionToDate,
    movementsPage,
    movementTypeFilter,
    movementUserFilter,
    movementFromDate,
    movementToDate,
  ]);

  // ─── Actions ───

  const openSession = useCallback(async (openingBalance: number, notes?: string) => {
    try {
      await api("cashRegister:openSession", { userId, openingBalance, notes });
      toast.success(t("cashRegister.toasts.open_success"));
      refreshAll();
      return true;
    } catch (err: any) {
      toast.error(err.message || t("cashRegister.toasts.error_open", { defaultValue: "Erreur lors de l'ouverture" }));
      return false;
    }
  }, [api, userId, refreshAll, t]);

  const closeSession = useCallback(async (sessionId: number, actualBalance: number, notes?: string) => {
    try {
      await api("cashRegister:closeSession", { sessionId, actualBalance, notes, closedBy: userId });
      toast.success(t("cashRegister.toasts.close_success"));
      refreshAll();
      return true;
    } catch (err: any) {
      toast.error(err.message || t("cashRegister.toasts.error_close", { defaultValue: "Erreur lors de la clôture" }));
      return false;
    }
  }, [api, userId, refreshAll, t]);

  const createMovement = useCallback(async (type: "cash_in" | "cash_out", amount: number, reason: string, notes?: string) => {
    if (!activeSession) {
      toast.error(t("cashRegister.toasts.error_no_session"));
      return false;
    }
    try {
      await api("cashRegister:createMovement", {
        sessionId: activeSession.id,
        type,
        amount,
        reason,
        notes,
        createdBy: userId,
      });
      toast.success(t("cashRegister.toasts.movement_success"));
      refreshAll();
      return true;
    } catch (err: any) {
      toast.error(err.message || t("cashRegister.toasts.error_movement", { defaultValue: "Erreur de mouvement" }));
      return false;
    }
  }, [api, activeSession, userId, refreshAll, t]);

  // ─── Handlers ───
  const handleSessionFilter = (status: CashSessionFilter) => {
    setSessionFilter(status);
    loadSessionsPage(1, status, sessionUserFilter, sessionFromDate, sessionToDate);
  };

  const handleSessionUserFilter = (uid: number | undefined) => {
    setSessionUserFilter(uid);
    loadSessionsPage(1, sessionFilter, uid, sessionFromDate, sessionToDate);
  };

  const handleSessionDateRange = (from: string, to: string) => {
    setSessionFromDate(from);
    setSessionToDate(to);
    loadSessionsPage(1, sessionFilter, sessionUserFilter, from, to);
  };

  const handleSessionPageChange = (p: number) => {
    loadSessionsPage(p, sessionFilter, sessionUserFilter, sessionFromDate, sessionToDate);
  };

  const handleMovementTypeFilter = (type: CashMovementTypeFilter) => {
    setMovementTypeFilter(type);
    loadMovementsPage(1, type, movementUserFilter, movementFromDate, movementToDate);
  };

  const handleMovementUserFilter = (uid: number | undefined) => {
    setMovementUserFilter(uid);
    loadMovementsPage(1, movementTypeFilter, uid, movementFromDate, movementToDate);
  };

  const handleMovementDateRange = (from: string, to: string) => {
    setMovementFromDate(from);
    setMovementToDate(to);
    loadMovementsPage(1, movementTypeFilter, movementUserFilter, from, to);
  };

  const handleMovementPageChange = (p: number) => {
    loadMovementsPage(p, movementTypeFilter, movementUserFilter, movementFromDate, movementToDate);
  };

  const handleResetSessionsFilters = () => {
    setSessionFilter("all");
    setSessionUserFilter(undefined);
    setSessionFromDate("");
    setSessionToDate("");
    loadSessionsPage(1, "all", undefined, "", "");
  };

  const handleResetMovementsFilters = () => {
    setMovementTypeFilter("all");
    setMovementUserFilter(undefined);
    setMovementFromDate("");
    setMovementToDate("");
    loadMovementsPage(1, "all", undefined, "", "");
  };

  return {
    activeSession,
    isActiveLoading,
    stats,
    isStatsLoading,
    refreshActiveSession: loadActiveSession,

    // Sessions list
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

    // Movements list
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

    // Actions
    openSession,
    closeSession,
    createMovement,
    refreshAll,
  };
}
