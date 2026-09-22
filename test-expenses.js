const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function ensureExpenseCategories() {
  try {
    const DEFAULT_CATEGORIES = [
      "Loyer",
      "Salaires",
      "Transport",
      "Marketing",
      "Fournisseurs",
      "Internet & Téléphone",
      "Électricité & Eau",
      "Maintenance",
      "Emballage",
      "Impôts & Taxes",
      "Divers",
    ];

    console.log("1. Fetching existing categories...");
    const existing = await prisma.expenseCategory.findMany({ select: { name: true } });
    const existingNames = new Set(existing.map((c) => c.name));

    const toCreate = DEFAULT_CATEGORIES.filter((name) => !existingNames.has(name)).map((name) => ({
      name,
      isSystem: true,
    }));

    if (toCreate.length > 0) {
      console.log("2. Creating DEFAULT_CATEGORIES...", toCreate.length);
      await prisma.expenseCategory.createMany({ data: toCreate });
    }

    console.log("3. Fetching distinct expenses...");
    const distinctExpenses = await prisma.expense.findMany({
      select: { category: true },
      distinct: ["category"],
    });

    const expenseNames = distinctExpenses
      .map((e) => e.category)
      .filter((name) => name && !existingNames.has(name));

    if (expenseNames.length > 0) {
      console.log("4. Creating distinct expenses...", expenseNames.length);
      await prisma.expenseCategory.createMany({
        data: expenseNames.map((name) => ({ name, isSystem: false })),
      });
    }

    console.log("5. Done!");
  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    await prisma.$disconnect();
  }
}

ensureExpenseCategories();
