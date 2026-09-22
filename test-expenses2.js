const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function run() {
  try {
    console.log("Inserting expense...");
    const expense = await prisma.expense.create({
      data: {
        title: "Test",
        amount: 100,
        category: "TestCat",
        expenseDate: new Date(),
      }
    });

    console.log("Fetching distinct expenses...");
    const distinctExpenses = await prisma.expense.findMany({
      select: { category: true },
      distinct: ["category"],
    });
    console.log(distinctExpenses);

    await prisma.expense.delete({ where: { id: expense.id } });
    console.log("Done");
  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
