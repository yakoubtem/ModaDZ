import { Navigate, Route, Routes } from "react-router-dom";
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
import { useAuth } from "@/modules/auth/AuthContext";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected — all inside AppLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"  element={<DashboardPage />} />
        <Route path="pos"        element={<POSPage />} />
        <Route path="products"   element={<ProductsPage />} />
        <Route path="inventory"  element={<InventoryPage />} />
        <Route path="customers"  element={<CustomersPage />} />
        <Route path="sales"      element={<SalesPage />} />
        <Route path="debts"      element={<DebtsPage />} />
        <Route path="stats"      element={<StatsPage />} />
        <Route path="settings"   element={<SettingsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
