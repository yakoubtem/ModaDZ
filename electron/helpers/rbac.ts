import { prisma } from "../db/client";

// Global cache for the currently logged-in user ID
let currentUserId: number | null = null;

export function setCurrentUserId(userId: number | null) {
  currentUserId = userId;
}

export function getCurrentUserId(): number | null {
  return currentUserId;
}

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ["*"],
  manager: [
    "dashboard.view",
    "pos.use",
    "products.view",
    "products.manage",
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
    "expenses.create",
    "reports.view",
    "suppliers.view",
    "suppliers.manage",
    "purchases.view",
    "purchases.manage",
    "supplierDebts.view",
    "supplierDebts.manage",
    "supplierPayments.create",
    "cashRegister.view",
    "cashRegister.manage",
    "cashRegister.close",
    "activity.view",
    "labels.view",
    "labels.print",
    "labels.manage",
  ],
  cashier: [
    "pos.use",
    "sales.create",
    "customers.view",
    "customers.manage",
    "debts.view",
    "debts.payment",
    "cashRegister.view",
    "cashRegister.manage",
    "labels.view",
    "labels.print",
  ],
};

export async function checkPermission(userId: number | undefined | null, permission: string): Promise<boolean> {
  const finalUserId = userId !== undefined ? userId : currentUserId;
  if (!finalUserId) return false;
  
  const user = await prisma.user.findUnique({ where: { id: finalUserId } });
  if (!user || !user.isActive) return false;
  
  const role = user.role;
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  if (perms.includes("*")) return true;
  return perms.includes(permission);
}

export async function requirePermission(userId: number | undefined | null, permission: string): Promise<void> {
  const allowed = await checkPermission(userId, permission);
  if (!allowed) {
    throw new Error("Permission denied");
  }
}
