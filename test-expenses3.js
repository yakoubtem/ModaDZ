const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function run() {
  try {
    console.log("Creating categories with skipDuplicates...");
    await prisma.expenseCategory.createMany({
      data: [{ name: "Test1" }, { name: "Test1" }],
      skipDuplicates: true,
    });
    console.log("Success");
  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
