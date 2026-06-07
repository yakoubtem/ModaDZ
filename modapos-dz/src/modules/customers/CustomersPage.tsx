import { useState } from "react";
import { TopBar } from "@/components/layout/AppLayout";
import { useCustomers } from "./hooks/useCustomers";
import { CustomerTable } from "./components/CustomerTable";
import { CustomerFormModal } from "./components/CustomerFormModal";
import { CustomerProfileModal } from "./components/CustomerProfileModal";
import type { CustomerWithStats } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

export function CustomersPage() {
  const { t } = useTranslation();
  const {
    customers,
    total,
    page,
    pageSize,
    isLoading,
    search,
    selectedCustomer,
    isProfileOpen,
    handleSearch,
    handlePageChange,
    openProfile,
    closeProfile,
    create,
    update,
    remove,
  } = useCustomers();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerWithStats | null>(null);

  const handleEdit = (customer: CustomerWithStats) => { setEditingCustomer(customer); setIsFormOpen(true); };
  const handleFormSubmit = async (data: { name: string; phone?: string; email?: string; notes?: string }): Promise<boolean> => {
    if (editingCustomer) return update(editingCustomer.id, data);
    return create(data);
  };
  const handleFormClose = () => { setIsFormOpen(false); setEditingCustomer(null); };
  const handleEditFromProfile = () => {
    if (!selectedCustomer) return;
    const asStats: CustomerWithStats = {
      ...selectedCustomer,
      totalOrders: selectedCustomer.stats.totalOrders,
      totalSpent: selectedCustomer.stats.totalSpent,
      debt: selectedCustomer.stats.debt,
      lastPurchaseDate: selectedCustomer.stats.lastPurchaseDate,
    };
    closeProfile();
    setTimeout(() => handleEdit(asStats), 150);
  };

  const debtCount = customers.filter(c => c.debt > 0).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopBar
        title=""
        actions={
          <div style={{ display: "flex", gap: "12px" }}>
            <button className="btn-border" style={{ padding: "8px 16px", borderRadius: "var(--radius-md)" }}>
              {t("common.buttons.notifications")}
            </button>
            <button className="btn-checkout">{t("common.buttons.checkout")}</button>
          </div>
        }
      />

      <main style={{ padding: "var(--space-container)", maxWidth: 1440, margin: "0 auto", width: "100%" }}>
        {/* Page header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "var(--space-section)",
            paddingTop: "32px",
          }}
        >
          <div style={{ maxWidth: 640 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-headline-lg)",
                  fontWeight: "var(--fw-headline-lg)",
                  color: "var(--color-on-surface)",
                }}
              >
                {t("customers.title")}
              </h2>
              {debtCount > 0 && (
                <span className="chip chip-error" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span>
                  {debtCount} {t("customers.debts_count")}
                </span>
              )}
            </div>
            <p style={{ fontSize: "var(--text-body-md)", color: "var(--color-on-surface-variant)" }}>
              {t("customers.subtitle")}
            </p>
          </div>

          <button
            className="btn-primary"
            onClick={() => { setEditingCustomer(null); setIsFormOpen(true); }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>person_add</span>
            {t("customers.add_customer")}
          </button>
        </div>

        {/* Search + stat grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "8fr 4fr",
            gap: "var(--space-card-gap)",
            marginBottom: "var(--space-card-gap)",
          }}
        >
          {/* Search */}
          <div
            style={{
              background: "rgba(255,255,255,0.6)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid var(--color-surface-variant)",
              borderRadius: "var(--radius-xl)",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <span className="material-symbols-outlined" style={{ color: "var(--color-outline)" }}>search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={t("customers.search_placeholder_long")}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: "var(--text-body-md)",
                fontFamily: "var(--font-body)",
                color: "var(--color-on-surface)",
              }}
            />
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-on-surface-variant)", display: "flex", alignItems: "center" }}>
              <span className="material-symbols-outlined">tune</span>
            </button>
          </div>

          {/* Mini stat */}
          <div
            style={{
              background: "rgba(255,255,255,0.6)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid var(--color-surface-variant)",
              borderRadius: "var(--radius-xl)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <p style={{ fontSize: "var(--text-label-sm)", letterSpacing: "var(--ls-label-sm)", color: "var(--color-on-surface-variant)", textTransform: "uppercase", marginBottom: "4px" }}>
              {t("customers.total_active")}
            </p>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-headline-lg)",
                fontWeight: "var(--fw-headline-lg)",
                color: "var(--color-on-surface)",
              }}
            >
              {total.toLocaleString("fr-DZ")}
            </p>
          </div>
        </div>

        {/* Customer table */}
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
          <CustomerTable
            customers={customers}
            isLoading={isLoading}
            total={total}
            page={page}
            pageSize={pageSize}
            onEdit={handleEdit}
            onDelete={(c) => remove(c.id)}
            onViewProfile={openProfile}
            onPageChange={handlePageChange}
          />
        </div>
      </main>

      <CustomerFormModal isOpen={isFormOpen} onClose={handleFormClose} onSubmit={handleFormSubmit} editCustomer={editingCustomer} />
      <CustomerProfileModal isOpen={isProfileOpen} customer={selectedCustomer} onClose={closeProfile} onEdit={handleEditFromProfile} />
    </div>
  );
}
