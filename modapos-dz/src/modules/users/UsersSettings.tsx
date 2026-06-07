import { useState } from "react";
import { useUsers } from "./hooks/useUsers";
import { UserFormModal } from "./components/UserFormModal";
import type { User } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

export function UsersSettings() {
  const { users, isLoading, createUser, updateUser, deleteUser } = useUsers();
  const { t, isRtl } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedUser(undefined);
    setModalOpen(true);
  };

  const handleSave = async (data: any) => {
    if (selectedUser) {
      const success = await updateUser(selectedUser.id, data);
      if (success) setModalOpen(false);
    } else {
      const success = await createUser(data);
      if (success) setModalOpen(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--color-on-surface)", fontFamily: "var(--font-display)" }}>
            {t("users.header_title")}
          </h3>
          <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)", marginTop: 4 }}>
            {t("users.header_desc")}
          </p>
        </div>
        <button className="btn-primary" onClick={handleAdd}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span>
          {t("users.add_user")}
        </button>
      </div>

      {/* Table */}
      <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid rgba(208,197,175,0.3)" }}>
        {isLoading ? (
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 52, borderRadius: 8 }} />
            ))}
          </div>
        ) : users.length === 0 ? (
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
              group
            </span>
            <p style={{ fontSize: "var(--text-body-md)", color: "var(--color-secondary)" }}>
              {t("users.empty_state")}
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-body-sm)" }}>
            <thead>
              <tr style={{ background: "rgba(245,243,238,0.7)", borderBottom: "1px solid rgba(208,197,175,0.3)" }}>
                {[
                  { key: "name", label: t("users.table.name") },
                  { key: "role", label: t("users.table.role") },
                  { key: "created", label: t("users.table.created_at") },
                  { key: "actions", label: t("users.table.actions"), alignRight: true }
                ].map((h) => (
                  <th
                    key={h.key}
                    style={{
                      padding: "14px 20px",
                      textAlign: h.alignRight ? (isRtl ? "left" : "right") : (isRtl ? "right" : "left"),
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--color-secondary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  style={{
                    borderBottom: "1px solid rgba(208,197,175,0.15)",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(212,175,55,0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Name */}
                  <td style={{ padding: "14px 20px", color: "var(--color-on-surface)", fontWeight: 500, textAlign: isRtl ? "right" : "left" }}>
                    {user.name}
                  </td>

                  {/* Role badge */}
                  <td style={{ padding: "14px 20px", textAlign: isRtl ? "right" : "left" }}>
                    {(() => {
                      const config = user.role === "admin"
                        ? { bg: "rgba(212,175,55,0.12)", color: "var(--color-primary)", border: "rgba(212,175,55,0.25)", label: t("common.roles.admin") }
                        : user.role === "manager"
                        ? { bg: "rgba(77,139,139,0.12)", color: "var(--color-tertiary)", border: "rgba(77,139,139,0.25)", label: t("common.roles.manager") }
                        : { bg: "rgba(208,197,175,0.15)", color: "var(--color-secondary)", border: "rgba(208,197,175,0.3)", label: t("common.roles.cashier") };
                      return (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "4px 12px",
                            borderRadius: "999px",
                            fontSize: 12,
                            fontWeight: 700,
                            background: config.bg,
                            color: config.color,
                            border: `1px solid ${config.border}`,
                          }}
                        >
                          {config.label}
                        </span>
                      );
                    })()}
                  </td>

                  {/* Created at */}
                  <td style={{ padding: "14px 20px", fontSize: 12, color: "var(--color-secondary)", textAlign: isRtl ? "right" : "left" }}>
                    {new Date(user.createdAt).toLocaleDateString(isRtl ? "ar-DZ" : "fr-FR", { year: "numeric", month: "long", day: "numeric" })}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "14px 20px", textAlign: isRtl ? "left" : "right" }}>
                    {deleteConfirmId === user.id ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: isRtl ? "flex-start" : "flex-end" }}>
                        <button
                          onClick={() => { deleteUser(user.id); setDeleteConfirmId(null); }}
                          className="btn-primary"
                          style={{ padding: "6px 14px", fontSize: 12, height: 36, background: "var(--color-error)" }}
                        >
                          {t("common.buttons.yes")}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          style={{
                            height: 36, padding: "0 12px",
                            background: "none",
                            border: "1px solid rgba(208,197,175,0.3)",
                            borderRadius: "var(--radius-md)",
                            cursor: "pointer",
                            color: "var(--color-secondary)",
                            fontSize: 12,
                          }}
                        >
                          {t("common.buttons.no")}
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: isRtl ? "flex-start" : "flex-end" }}>
                        <button
                          onClick={() => handleEdit(user)}
                          className="btn-border"
                          style={{ padding: "6px 14px", fontSize: 12, height: 36 }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
                          {t("common.buttons.edit")}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(user.id)}
                          style={{
                            height: 36,
                            padding: "6px 14px",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            borderRadius: "var(--radius-md)",
                            background: "none",
                            border: "1px solid rgba(220,38,38,0.2)",
                            cursor: "pointer",
                            color: "var(--color-error)",
                            fontSize: 12,
                            fontWeight: 500,
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(220,38,38,0.06)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
                          {t("common.buttons.delete")}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer count */}
      {users.length > 0 && (
        <div style={{ padding: "0 4px" }}>
          <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)", textAlign: isRtl ? "right" : "left" }}>
            {t(users.length === 1 ? "users.total_users" : "users.total_users_plural", { count: users.length })}
          </p>
        </div>
      )}

      {modalOpen && (
        <UserFormModal
          user={selectedUser}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}