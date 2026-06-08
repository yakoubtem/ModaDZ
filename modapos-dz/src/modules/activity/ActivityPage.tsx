import { useState, useEffect, useCallback } from "react";
import { TopBar } from "@/components/layout/AppLayout";
import { useIPC } from "@/hooks/useIPC";
import { useTranslation } from "@/hooks/useTranslation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import type { ActivityLog, PaginatedActivityLogs, User } from "@/types";

const MODULE_OPTIONS = [
  { value: "all", label: "Tous les modules" },
  { value: "Product", label: "Produits" },
  { value: "Customer", label: "Clients" },
  { value: "Sale", label: "Ventes" },
  { value: "Purchase", label: "Achats" },
  { value: "Expense", label: "Dépenses" },
  { value: "User", label: "Utilisateurs" },
  { value: "Settings", label: "Paramètres" },
];

export function ActivityPage() {
  const { t, isRtl } = useTranslation();
  const api = useIPC();

  // Logs state
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [isLoading, setIsLoading] = useState(false);

  // Filters state
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const [entityType, setEntityType] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // Users list for dropdown
  const [users, setUsers] = useState<Pick<User, "id" | "name">[]>([]);

  // Load users list
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersList = await api<any[]>("users:getAll");
        setUsers(usersList || []);
      } catch {
        // silent
      }
    };
    fetchUsers();
  }, [api]);

  // Load logs
  const loadLogs = useCallback(
    async (p: number, q: string, uid: number | undefined, mod: string, f: string, tVal: string) => {
      setIsLoading(true);
      try {
        const result = await api<PaginatedActivityLogs>("activityLogs:getAll", {
          page: p,
          pageSize,
          search: q || undefined,
          userId: uid,
          entityType: mod,
          from: f || undefined,
          to: tVal || undefined,
        });
        setLogs(result.logs || []);
        setTotal(result.total || 0);
        setPage(result.page || 1);
      } catch {
        toast.error(t("activity.toasts.load_error") || "Impossible de charger le journal d'activité.");
      } finally {
        setIsLoading(false);
      }
    },
    [api, pageSize, t]
  );

  useEffect(() => {
    loadLogs(1, search, userId, entityType, from, to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    loadLogs(1, val, userId, entityType, from, to);
  };

  const handleUserChange = (uid: number | undefined) => {
    setUserId(uid);
    loadLogs(1, search, uid, entityType, from, to);
  };

  const handleModuleChange = (mod: string) => {
    setEntityType(mod);
    loadLogs(1, search, userId, mod, from, to);
  };

  const handleDateRangeChange = (fromDate: string, toDate: string) => {
    setFrom(fromDate);
    setTo(toDate);
    loadLogs(1, search, userId, entityType, fromDate, toDate);
  };

  const handlePageChange = (p: number) => {
    loadLogs(p, search, userId, entityType, from, to);
  };

  const handleResetFilters = () => {
    setSearch("");
    setUserId(undefined);
    setEntityType("all");
    setFrom("");
    setTo("");
    loadLogs(1, "", undefined, "all", "", "");
  };

  const handleExportCSV = async () => {
    const headers = [
      t("activity.table.date") || "Date & Heure",
      t("activity.table.user") || "Utilisateur",
      t("activity.table.action") || "Action",
      t("activity.table.module") || "Module",
      t("activity.table.description") || "Description",
    ];

    try {
      // Fetch all logs matching active filters for export
      const result = await api<PaginatedActivityLogs>("activityLogs:getAll", {
        page: 1,
        pageSize: 100000,
        search: search || undefined,
        userId,
        entityType,
        from: from || undefined,
        to: to || undefined,
      });

      const rows = result.logs.map((log) => [
        formatDate(log.createdAt),
        log.user?.name || "Système",
        log.action,
        log.entityType,
        log.description,
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((r) => r.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")),
      ].join("\n");

      const defaultFilename = `journal_activite_modadz_${Date.now()}.csv`;
      const success = await api<boolean>("activityLogs:exportCSV", csvContent, defaultFilename);
      if (success) {
        toast.success(t("activity.toasts.export_success") || "Journal exporté avec succès.");
      }
    } catch {
      toast.error(t("activity.toasts.export_error") || "Erreur d'exportation.");
    }
  };

  const totalPages = Math.ceil(total / pageSize);
  const fromIndex = (page - 1) * pageSize + 1;
  const toIndex = Math.min(page * pageSize, total);

  // Helper to format action badge style
  const getActionStyle = (action: string): React.CSSProperties => {
    const norm = action.toUpperCase();
    if (norm.includes("CREATE") || norm.includes("AJOUT")) {
      return {
        background: "rgba(39, 104, 104, 0.1)",
        color: "var(--color-tertiary)",
        border: "1px solid rgba(39, 104, 104, 0.2)",
      };
    }
    if (norm.includes("DELETE") || norm.includes("SUPPR") || norm.includes("CANCEL") || norm.includes("ANNUL")) {
      return {
        background: "rgba(186, 26, 26, 0.07)",
        color: "var(--color-error)",
        border: "1px solid rgba(186, 26, 26, 0.18)",
      };
    }
    if (norm.includes("UPDATE") || norm.includes("MODIF")) {
      return {
        background: "rgba(212, 175, 55, 0.1)",
        color: "#b39126",
        border: "1px solid rgba(212, 175, 55, 0.2)",
      };
    }
    return {
      background: "rgba(26, 26, 26, 0.06)",
      color: "var(--color-secondary)",
      border: "1px solid rgba(26, 26, 26, 0.12)",
    };
  };

  const hasActiveFilters = search || userId !== undefined || entityType !== "all" || from || to;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopBar title="" />

      <main style={{ padding: "var(--space-container)", maxWidth: 1440, margin: "0 auto", width: "100%" }}>
        {/* Page header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "var(--space-section)",
            paddingTop: "32px",
            flexDirection: isRtl ? "row-reverse" : "row",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-headline-lg)",
                fontWeight: "var(--fw-headline-lg)",
                color: "var(--color-on-surface)",
                marginBottom: "8px",
              }}
            >
              {t("activity.title")}
            </h2>
            <p style={{ fontSize: "var(--text-body-md)", color: "var(--color-on-surface-variant)" }}>
              {t("activity.subtitle")}
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexDirection: isRtl ? "row-reverse" : "row" }}>
            <button className="btn-border" onClick={() => loadLogs(page, search, userId, entityType, from, to)} title="Actualiser">
              <RefreshCw style={{ width: 16, height: 16 }} />
            </button>
            <button className="btn-primary" onClick={handleExportCSV}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                download
              </span>
              {t("activity.filters.export_btn") || "Exporter CSV"}
            </button>
          </div>
        </div>

        {/* Filters Card */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid var(--color-surface-variant)",
            borderRadius: "var(--radius-xl)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <div>
              <Input
                placeholder={t("activity.search_placeholder") || "Rechercher une action..."}
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                leftIcon={<span className="material-symbols-outlined text-sm">search</span>}
              />
            </div>

            <div>
              <Select
                value={userId !== undefined ? String(userId) : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  handleUserChange(val ? Number(val) : undefined);
                }}
              >
                <option value="">{t("activity.filters.all_users") || "Tous les utilisateurs"}</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Select
                value={entityType}
                onChange={(e) => handleModuleChange(e.target.value)}
              >
                {MODULE_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <Input
                type="date"
                value={from}
                onChange={(e) => handleDateRangeChange(e.target.value, to)}
                style={{ flex: 1 }}
              />
              <span style={{ color: "var(--color-outline)", fontSize: "14px" }}>→</span>
              <Input
                type="date"
                value={to}
                onChange={(e) => handleDateRangeChange(from, e.target.value)}
                style={{ flex: 1 }}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleResetFilters}
                className="btn-border"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  fontSize: "var(--text-label-sm)",
                  cursor: "pointer",
                }}
              >
                <span className="material-symbols-outlined text-sm" style={{ fontSize: "16px" }}>
                  close
                </span>
                Réinitialiser
              </button>
            </div>
          )}
        </div>

        {/* Logs Table */}
        <div
          style={{
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid var(--color-surface-variant)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-soft)",
            overflow: "hidden",
          }}
        >
          {isLoading ? (
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 52, borderRadius: 8 }} />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div
              style={{
                padding: "64px 24px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--color-outline)", opacity: 0.5 }}>
                history
              </span>
              <p style={{ fontSize: "var(--text-body-md)", color: "var(--color-secondary)" }}>
                {t("activity.table.no_logs") || "Aucune activité enregistrée"}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-body-sm)" }}>
                  <thead>
                    <tr style={{ background: "rgba(245,243,238,0.7)", borderBottom: "1px solid rgba(208,197,175,0.3)" }}>
                      <th style={{ padding: "14px 20px", textAlign: isRtl ? "right" : "left", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-secondary)", whiteSpace: "nowrap", width: "180px" }}>
                        {t("activity.table.date") || "Date & Heure"}
                      </th>
                      <th style={{ padding: "14px 20px", textAlign: isRtl ? "right" : "left", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-secondary)", whiteSpace: "nowrap", width: "150px" }}>
                        {t("activity.table.user") || "Utilisateur"}
                      </th>
                      <th style={{ padding: "14px 20px", textAlign: isRtl ? "right" : "left", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-secondary)", whiteSpace: "nowrap", width: "120px" }}>
                        {t("activity.table.action") || "Action"}
                      </th>
                      <th style={{ padding: "14px 20px", textAlign: isRtl ? "right" : "left", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-secondary)", whiteSpace: "nowrap", width: "120px" }}>
                        {t("activity.table.module") || "Module"}
                      </th>
                      <th style={{ padding: "14px 20px", textAlign: isRtl ? "right" : "left", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-secondary)" }}>
                        {t("activity.table.description") || "Description"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => {
                      const moduleLabel = MODULE_OPTIONS.find((m) => m.value === log.entityType)?.label || log.entityType;
                      return (
                        <tr
                          key={log.id}
                          style={{
                            borderBottom: "1px solid rgba(208,197,175,0.15)",
                            transition: "background 0.1s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(212,175,55,0.04)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <td style={{ padding: "14px 20px", color: "var(--color-secondary)" }}>
                            {formatDate(log.createdAt)}
                          </td>
                          <td style={{ padding: "14px 20px", fontWeight: 600, color: "var(--color-on-surface)" }}>
                            {log.user?.name || "Système"}
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "2px 8px",
                                borderRadius: "var(--radius-full)",
                                fontSize: "11px",
                                fontWeight: 700,
                                ...getActionStyle(log.action),
                              }}
                            >
                              {log.action}
                            </span>
                          </td>
                          <td style={{ padding: "14px 20px", color: "var(--color-secondary)" }}>
                            {moduleLabel}
                          </td>
                          <td style={{ padding: "14px 20px", color: "var(--color-on-surface)" }}>
                            {log.description}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div
                  style={{
                    padding: "16px 24px",
                    borderTop: "1px solid rgba(208,197,175,0.3)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "rgba(245,243,238,0.3)",
                  }}
                >
                  <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)" }}>
                    {t("activity.table.pagination", { from: fromIndex, to: toIndex, total }) || `Affichage de ${fromIndex} à ${toIndex} sur ${total} événements`}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1}
                      style={{
                        width: 36,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "var(--radius-md)",
                        background: "none",
                        border: "1px solid rgba(208,197,175,0.3)",
                        cursor: page <= 1 ? "default" : "pointer",
                        opacity: page <= 1 ? 0.4 : 1,
                        color: "var(--color-secondary)",
                      }}
                    >
                      {isRtl ? <ChevronRight style={{ width: 16, height: 16 }} /> : <ChevronLeft style={{ width: 16, height: 16 }} />}
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const p = i + 1;
                      return (
                        <button
                          key={p}
                          onClick={() => handlePageChange(p)}
                          style={{
                            width: 36,
                            height: 36,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: p === page ? 700 : 500,
                            borderRadius: "var(--radius-md)",
                            border: "none",
                            cursor: "pointer",
                            background: p === page ? "var(--color-primary)" : "transparent",
                            color: p === page ? "white" : "var(--color-secondary)",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {p}
                        </button>
                      );
                    })}
                    {totalPages > 5 && (
                      <span style={{ fontSize: 12, color: "var(--color-secondary)", padding: "0 4px" }}>…{totalPages}</span>
                    )}
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages}
                      style={{
                        width: 36,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "var(--radius-md)",
                        background: "none",
                        border: "1px solid rgba(208,197,175,0.3)",
                        cursor: page >= totalPages ? "default" : "pointer",
                        opacity: page >= totalPages ? 0.4 : 1,
                        color: "var(--color-secondary)",
                      }}
                    >
                      {isRtl ? <ChevronLeft style={{ width: 16, height: 16 }} /> : <ChevronRight style={{ width: 16, height: 16 }} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
