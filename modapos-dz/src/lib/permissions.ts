import type { UserRole } from "@/types";

export const PERMISSIONS: Record<UserRole, string[]> = {
  admin: ["*"],

  manager: [
    "dashboard.view",
    "pos.use",
    "products.view",
    "products.manage", // Create/Edit products (no products.delete)
    "inventory.view",
    "inventory.manage",
    "customers.view",
    "customers.manage",
    "sales.view",
    "sales.create",
    "sales.refund",
    "debts.view",
    "debts.manage",
    "debts.payment",
    "expenses.view",
    "expenses.create", // Create expenses (no expenses.delete)
    "reports.view",
    "suppliers.view",
    "suppliers.manage",
    "purchases.view",
    "purchases.manage",
    "activity.view",
  ],

  cashier: [
    "pos.use",
    "sales.create",
    "customers.view",
    "customers.manage", // Cashier can select and edit customers in POS
    "debts.view", // For payments
    "debts.payment", // Receive debt payments
  ],
};

/**
 * Helper function to check if a role has a specific permission.
 */
export function hasPermission(role: UserRole | undefined, permission: string): boolean {
  if (!role) return false;
  const userPerms = PERMISSIONS[role];
  if (!userPerms) return false;
  if (userPerms.includes("*")) return true;
  return userPerms.includes(permission);
}
