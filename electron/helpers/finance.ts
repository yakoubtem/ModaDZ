import { prisma } from "../db/client";

/**
 * Calculates a customer's active debt by summing up remaining balances
 * on all non-refunded sales.
 */
export async function calculateCustomerDebt(customerId: number, tx?: any): Promise<number> {
  const db = tx || prisma;
  const sales = await db.sale.findMany({
    where: {
      customerId,
      status: { not: "refunded" },
    },
    select: {
      total: true,
      amountPaid: true,
    },
  });

  return sales.reduce((sum: number, s: { total: number; amountPaid: number }) => {
    const remaining = s.total - s.amountPaid;
    return sum + (remaining > 0 ? remaining : 0);
  }, 0);
}
