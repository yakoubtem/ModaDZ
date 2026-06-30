import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/modules/auth/LoginPage";
import { DashboardPage } from "@/modules/dashboard/DashboardPage";
import { POSPage } from "@/modules/pos/POSPage";
import { ProductsPage } from "@/modules/products/ProductsPage";
import { InventoryPage } from "@/modules/inventory/InventoryPage";
import { CustomersPage } from "@/modules/customers/CustomersPage";
import { SalesPage } from "@/modules/sales/SalesPage";
import { StatsPage } from "@/modules/statistics/StatsPage";
import { SettingsPage } from "@/modules/settings/SettingsPage";
import { DebtsPage } from "@/modules/debts/DebtsPage";
import { ExpensesPage } from "@/modules/expenses/ExpensesPage";
import { UsersPage } from "@/modules/users/UsersPage";
import { BackupsPage } from "@/modules/settings/BackupsPage";
import { AccessDenied } from "@/components/AccessDenied";
import { SuppliersPage } from "@/modules/suppliers/SuppliersPage";
import { PurchasesPage } from "@/modules/purchases/PurchasesPage";
import { ActivityPage } from "@/modules/activity/ActivityPage";
import { SupplierDebtsPage } from "@/modules/supplierDebts/SupplierDebtsPage";
import { CashRegisterPage } from "@/modules/cashRegister/CashRegisterPage";
import { LabelsPage } from "@/modules/labels/LabelsPage";
import { useAuth } from "@/modules/auth/AuthContext";
import { useLicense } from "@/contexts/LicenseContext";
import { LicenseActivationPage } from "@/modules/auth/LicenseActivationPage";
import { LicenseGeneratorPage } from "@/modules/admin/LicenseGeneratorPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PermissionGuard({ permission, children }: { permission: string; children: React.ReactNode }) {
  const { can } = useAuth();
  return can(permission) ? <>{children}</> : <Navigate to="/access-denied" replace />;
}

function IndexRedirect() {
  const { can } = useAuth();
  if (can("dashboard.view")) {
    return <Navigate to="/dashboard" replace />;
  }
  if (can("pos.use")) {
    return <Navigate to="/pos" replace />;
  }
  return <Navigate to="/access-denied" replace />;
}

export default function App() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { licenseState } = useLicense();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "l") {
        if (user && user.role === "admin") {
          navigate("/admin-generator");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [user, navigate]);

  if (licenseState === "loading") {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0c0e14" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--color-primary, #d4af37)", animation: "spin 1s linear infinite" }}>
            progress_activity
          </span>
          <span style={{ color: "#94a3b8", fontSize: 14, fontFamily: "var(--font-body)" }}>Vérification de la licence...</span>
        </div>
      </div>
    );
  }

  if (licenseState === "unlicensed") {
    return <LicenseActivationPage />;
  }

  if (licenseState === "locked") {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="/admin-generator" element={<ProtectedRoute><LicenseGeneratorPage /></ProtectedRoute>} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="settings" element={<PermissionGuard permission="settings.manage"><SettingsPage /></PermissionGuard>} />
          <Route path="*" element={<Navigate to="/settings" replace />} />
        </Route>
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/access-denied" element={<AccessDenied />} />
      <Route path="/admin-generator" element={<ProtectedRoute><LicenseGeneratorPage /></ProtectedRoute>} />

      {/* Protected — all inside AppLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<IndexRedirect />} />
        <Route path="dashboard" element={<PermissionGuard permission="dashboard.view"><DashboardPage /></PermissionGuard>} />
        <Route path="pos" element={<PermissionGuard permission="pos.use"><POSPage /></PermissionGuard>} />
        <Route path="products" element={<PermissionGuard permission="products.view"><ProductsPage /></PermissionGuard>} />
        <Route path="inventory" element={<PermissionGuard permission="inventory.view"><InventoryPage /></PermissionGuard>} />
        <Route path="labels" element={<PermissionGuard permission="labels.view"><LabelsPage /></PermissionGuard>} />
        <Route path="customers" element={<PermissionGuard permission="customers.view"><CustomersPage /></PermissionGuard>} />
        <Route path="sales" element={<PermissionGuard permission="sales.view"><SalesPage /></PermissionGuard>} />
        <Route path="debts" element={<PermissionGuard permission="debts.view"><DebtsPage /></PermissionGuard>} />
        <Route path="supplier-debts" element={<PermissionGuard permission="supplierDebts.view"><SupplierDebtsPage /></PermissionGuard>} />
        <Route path="expenses" element={<PermissionGuard permission="expenses.view"><ExpensesPage /></PermissionGuard>} />
        <Route path="cash-register" element={<PermissionGuard permission="cashRegister.view"><CashRegisterPage /></PermissionGuard>} />
        <Route path="suppliers" element={<PermissionGuard permission="suppliers.view"><SuppliersPage /></PermissionGuard>} />
        <Route path="purchases" element={<PermissionGuard permission="purchases.view"><PurchasesPage /></PermissionGuard>} />
        <Route path="activity" element={<PermissionGuard permission="activity.view"><ActivityPage /></PermissionGuard>} />
        <Route path="stats" element={<PermissionGuard permission="reports.view"><StatsPage /></PermissionGuard>} />
        <Route path="users" element={<PermissionGuard permission="users.manage"><UsersPage /></PermissionGuard>} />
        <Route path="settings" element={<PermissionGuard permission="settings.manage"><SettingsPage /></PermissionGuard>} />
        <Route path="backups" element={<PermissionGuard permission="backups.manage"><BackupsPage /></PermissionGuard>} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
