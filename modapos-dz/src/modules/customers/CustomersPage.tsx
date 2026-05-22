import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { PageHeader, PageContent } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCustomers } from "./hooks/useCustomers";
import { CustomerTable } from "./components/CustomerTable";
import { CustomerFormModal } from "./components/CustomerFormModal";
import { CustomerProfileModal } from "./components/CustomerProfileModal";
import type { CustomerWithStats } from "@/types";
import { formatCurrency } from "@/lib/utils";

export function CustomersPage() {
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

  const handleEdit = (customer: CustomerWithStats) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: {
    name: string;
    phone?: string;
    email?: string;
    notes?: string;
  }): Promise<boolean> => {
    if (editingCustomer) {
      return update(editingCustomer.id, data);
    }
    return create(data);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingCustomer(null);
  };

  // When editing from within the profile modal
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
    setTimeout(() => handleEdit(asStats), 150); // allow modal close animation
  };

  // Summary stats
  const totalDebt = customers.reduce((s, c) => s + c.debt, 0);

  return (
    <>
      <PageHeader
        title="Clients"
        description={`${total} client${total !== 1 ? "s" : ""} enregistré${total !== 1 ? "s" : ""}`}
        actions={
          <>
            {totalDebt > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--color-danger-subtle)] border border-[var(--color-danger)]/30 text-sm text-[var(--color-danger)]">
                <span className="font-medium">Créances:</span>
                <span className="tabular-nums font-bold">{formatCurrency(totalDebt)}</span>
              </div>
            )}
            <Button
              variant="primary"
              size="md"
              className="gap-2"
              onClick={() => {
                setEditingCustomer(null);
                setIsFormOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              Nouveau client
            </Button>
          </>
        }
      />

      <PageContent>
        {/* Search */}
        <div className="mb-4">
          <Input
            placeholder="Rechercher par nom, téléphone ou email…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Table */}
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
      </PageContent>

      {/* Form modal (create / edit) */}
      <CustomerFormModal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        editCustomer={editingCustomer}
      />

      {/* Profile modal */}
      <CustomerProfileModal
        isOpen={isProfileOpen}
        customer={selectedCustomer}
        onClose={closeProfile}
        onEdit={handleEditFromProfile}
      />
    </>
  );
}
