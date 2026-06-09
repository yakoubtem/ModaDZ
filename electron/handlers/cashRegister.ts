import { IpcMain } from "electron";
import { prisma } from "../db/client";
import { logActivity } from "./activityLogs";

// Expose helper to record automatic movements from other handlers
export async function logAutomaticCashMovement(
  tx: any,
  params: {
    userId: number;
    type: "sale" | "refund" | "expense" | "supplier_payment" | "cash_in" | "cash_out";
    amount: number;
    reason: string;
    notes?: string;
  }
) {
  const db = tx || prisma;

  // Find the user's active session
  const activeSession = await db.cashSession.findFirst({
    where: { userId: params.userId, status: "open" },
  });

  if (!activeSession) {
    throw new Error(
      "Aucune session de caisse active trouvée pour cet utilisateur. Veuillez d'abord ouvrir la caisse."
    );
  }

  // Create the cash movement
  await db.cashMovement.create({
    data: {
      sessionId: activeSession.id,
      type: params.type,
      amount: params.amount,
      reason: params.reason,
      notes: params.notes || null,
      createdBy: params.userId,
    },
  });
}

export function registerCashRegisterHandlers(ipcMain: IpcMain) {
  // ─── Get Active Session ───
  ipcMain.handle("cashRegister:getActiveSession", async (_e, params: { userId: number }) => {
    return prisma.cashSession.findFirst({
      where: { userId: params.userId, status: "open" },
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  });

  // ─── Open Cash Session ───
  ipcMain.handle("cashRegister:openSession", async (_e, data: { userId: number; openingBalance: number; notes?: string }) => {
    const { userId, openingBalance, notes } = data;

    if (openingBalance < 0) {
      throw new Error("Le solde d'ouverture ne peut pas être négatif.");
    }

    // Check if user already has an active session
    const existing = await prisma.cashSession.findFirst({
      where: { userId, status: "open" },
    });

    if (existing) {
      throw new Error("Une session de caisse est déjà active pour cet utilisateur.");
    }

    return prisma.$transaction(async (tx) => {
      const session = await tx.cashSession.create({
        data: {
          userId,
          openingBalance,
          expectedBalance: openingBalance,
          notes: notes ?? null,
          status: "open",
        },
      });

      await logActivity(
        tx,
        userId,
        "OPEN_SESSION",
        "CashSession",
        String(session.id),
        `Ouverture de la session de caisse #${session.id} avec un solde de ${openingBalance} DZD`
      );

      return session;
    });
  });

  // ─── Close Cash Session ───
  ipcMain.handle("cashRegister:closeSession", async (_e, data: { sessionId: number; actualBalance: number; notes?: string; closedBy: number }) => {
    const { sessionId, actualBalance, notes, closedBy } = data;

    const session = await prisma.cashSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.status !== "open") {
      throw new Error("Session de caisse introuvable ou déjà clôturée.");
    }

    return prisma.$transaction(async (tx) => {
      // Aggregate all movements during this session
      const movementsSum = await tx.cashMovement.aggregate({
        where: { sessionId },
        _sum: { amount: true },
      });

      const totalMovements = movementsSum._sum.amount ?? 0;
      const expectedBalance = session.openingBalance + totalMovements;
      const difference = actualBalance - expectedBalance;

      const updated = await tx.cashSession.update({
        where: { id: sessionId },
        data: {
          closedAt: new Date(),
          expectedBalance,
          actualBalance,
          difference,
          notes: notes ?? null,
          status: "closed",
        },
        include: {
          user: { select: { id: true, name: true } },
        },
      });

      let diffDesc = `Clôture équilibrée`;
      if (difference !== 0) {
        diffDesc = `Clôture avec écart de ${difference} DZD`;
      }

      await logActivity(
        tx,
        closedBy,
        "CLOSE_SESSION",
        "CashSession",
        String(sessionId),
        `Fermeture de la session de caisse #${sessionId} par l'utilisateur #${closedBy}. ${diffDesc}`
      );

      return updated;
    });
  });

  // ─── Get Sessions List (Paginated) ───
  ipcMain.handle("cashRegister:getSessions", async (_e, params?: { page?: number; pageSize?: number; status?: string; userId?: number; from?: string; to?: string }) => {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params?.status) {
      where.status = params.status;
    }
    if (params?.userId) {
      where.userId = params.userId;
    }
    if (params?.from || params?.to) {
      where.openedAt = {};
      if (params.from) {
        const fromDate = new Date(params.from);
        fromDate.setHours(0, 0, 0, 0);
        where.openedAt.gte = fromDate;
      }
      if (params.to) {
        const toDate = new Date(params.to);
        toDate.setHours(23, 59, 59, 999);
        where.openedAt.lte = toDate;
      }
    }

    const [sessions, total] = await Promise.all([
      prisma.cashSession.findMany({
        where,
        include: {
          user: { select: { id: true, name: true } },
        },
        orderBy: { openedAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.cashSession.count({ where }),
    ]);

    return { sessions, total, page, pageSize };
  });

  // ─── Get Movements List (Paginated) ───
  ipcMain.handle("cashRegister:getMovements", async (_e, params?: { page?: number; pageSize?: number; sessionId?: number; type?: string; userId?: number; from?: string; to?: string }) => {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params?.sessionId) {
      where.sessionId = params.sessionId;
    }
    if (params?.type && params.type !== "all") {
      where.type = params.type;
    }
    if (params?.userId) {
      where.createdBy = params.userId;
    }
    if (params?.from || params?.to) {
      where.createdAt = {};
      if (params.from) {
        const fromDate = new Date(params.from);
        fromDate.setHours(0, 0, 0, 0);
        where.createdAt.gte = fromDate;
      }
      if (params.to) {
        const toDate = new Date(params.to);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }

    const [movements, total] = await Promise.all([
      prisma.cashMovement.findMany({
        where,
        include: {
          session: {
            include: {
              user: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.cashMovement.count({ where }),
    ]);

    return { movements, total, page, pageSize };
  });

  // ─── Create Manual Movement (Cash In / Cash Out) ───
  ipcMain.handle("cashRegister:createMovement", async (_e, data: { sessionId: number; type: "cash_in" | "cash_out"; amount: number; reason: string; notes?: string; createdBy: number }) => {
    const { sessionId, type, amount, reason, notes, createdBy } = data;

    if (amount <= 0) {
      throw new Error("Le montant du mouvement doit être supérieur à 0.");
    }
    if (!reason?.trim()) {
      throw new Error("Le motif du mouvement est requis.");
    }

    const session = await prisma.cashSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.status !== "open") {
      throw new Error("Session de caisse fermée ou introuvable.");
    }

    return prisma.$transaction(async (tx) => {
      const movement = await tx.cashMovement.create({
        data: {
          sessionId,
          type,
          amount: type === "cash_in" ? amount : -amount,
          reason: reason.trim(),
          notes: notes ?? null,
          createdBy,
        },
      });

      await logActivity(
        tx,
        createdBy,
        "CASH_MOVEMENT",
        "CashMovement",
        String(movement.id),
        `Mouvement de caisse enregistré: ${type === "cash_in" ? "+" : "-"}${amount} DZD pour le motif: "${reason}"`
      );

      return movement;
    });
  });

  // ─── Get Live Session Details (Computed Summary) ───
  ipcMain.handle("cashRegister:getSessionDetails", async (_e, sessionId: number) => {
    const session = await prisma.cashSession.findUnique({
      where: { id: sessionId },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    if (!session) {
      throw new Error("Session de caisse introuvable.");
    }

    const movements = await prisma.cashMovement.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });

    const breakdown = {
      openingBalance: session.openingBalance,
      sales: 0,
      refunds: 0,
      expenses: 0,
      supplierPayments: 0,
      cashIn: 0,
      cashOut: 0,
      expectedBalance: session.openingBalance,
    };

    movements.forEach((m) => {
      if (m.type === "sale") breakdown.sales += m.amount;
      else if (m.type === "refund") breakdown.refunds += Math.abs(m.amount);
      else if (m.type === "expense") breakdown.expenses += Math.abs(m.amount);
      else if (m.type === "supplier_payment") breakdown.supplierPayments += Math.abs(m.amount);
      else if (m.type === "cash_in") breakdown.cashIn += m.amount;
      else if (m.type === "cash_out") breakdown.cashOut += Math.abs(m.amount);
    });

    breakdown.expectedBalance =
      session.openingBalance +
      breakdown.sales +
      breakdown.cashIn -
      breakdown.refunds -
      breakdown.expenses -
      breakdown.supplierPayments -
      breakdown.cashOut;

    return {
      session,
      breakdown,
      movements,
    };
  });

  // ─── Get General Dashboard Statistics ───
  ipcMain.handle("cashRegister:getStatistics", async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Compute expected balance in all open sessions
    const openSessions = await prisma.cashSession.findMany({
      where: { status: "open" },
      include: { movements: true },
    });

    let openExpectedSum = 0;
    for (const s of openSessions) {
      const mSum = s.movements.reduce((sum, m) => sum + m.amount, 0);
      openExpectedSum += s.openingBalance + mSum;
    }

    // Compute cash closed today
    const closedToday = await prisma.cashSession.aggregate({
      where: { status: "closed", closedAt: { gte: today } },
      _sum: { actualBalance: true },
    });
    const closedTodaySum = closedToday._sum.actualBalance ?? 0;

    const cashToday = openExpectedSum + closedTodaySum;

    // Today's total movements count
    const cashMovementsCount = await prisma.cashMovement.count({
      where: { createdAt: { gte: today } },
    });

    // Total open sessions count
    const openSessionsCount = await prisma.cashSession.count({
      where: { status: "open" },
    });

    // Total cumulative differences of closed sessions
    const diffAgg = await prisma.cashSession.aggregate({
      where: { status: "closed" },
      _sum: { difference: true },
    });
    const cashDifference = diffAgg._sum.difference ?? 0;

    // Get currently open registers list for widget
    const openRegistersList = openSessions.map((s) => {
      const currentExpected = s.openingBalance + s.movements.reduce((sum, m) => sum + m.amount, 0);
      return {
        id: s.id,
        userId: s.userId,
        openedAt: s.openedAt.toISOString(),
        openingBalance: s.openingBalance,
        expectedBalance: currentExpected,
      };
    });

    // Fetch cashier user names for widget list
    const userIds = openRegistersList.map((r) => r.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u.name]));

    const openRegisters = openRegistersList.map((r) => ({
      ...r,
      userName: userMap.get(r.userId) || `Utilisateur #${r.userId}`,
    }));

    return {
      cashToday,
      cashMovementsCount,
      openSessionsCount,
      cashDifference,
      openRegisters,
    };
  });
}
