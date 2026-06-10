const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

async function main() {
  console.log("=== Starting Stress Test Seeding ===");

  // 1. Ensure at least one User exists
  let user = await prisma.user.findFirst();
  if (!user) {
    console.log("No user found. Creating default admin...");
    user = await prisma.user.create({
      data: {
        name: "Admin Stress",
        username: "admin_stress",
        password: "password123",
        role: "admin",
        isActive: true,
      },
    });
  }
  const userId = user.id;
  console.log(`Using User ID: ${userId}`);

  // 2. Create Categories
  console.log("Creating categories...");
  const categoriesData = [
    { name: "Hauts (Stress)" },
    { name: "Bas (Stress)" },
    { name: "Chaussures (Stress)" },
    { name: "Accessoires (Stress)" },
  ];
  const categories = [];
  for (const cat of categoriesData) {
    const record = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    categories.push(record);
  }

  // 3. Create 100 Suppliers
  console.log("Creating 100 suppliers...");
  const suppliers = [];
  const supplierTx = [];
  for (let i = 1; i <= 100; i++) {
    supplierTx.push(
      prisma.supplier.create({
        data: {
          name: `Fournisseur Stress #${i}`,
          phone: `0550000${String(i).padStart(3, "0")}`,
          email: `supplier${i}@stress.com`,
          address: `Adresse Supplier ${i}, Alger`,
        },
      })
    );
  }
  const createdSuppliers = await prisma.$transaction(supplierTx);
  console.log(`Successfully created ${createdSuppliers.length} suppliers.`);

  // 4. Create 100 Customers
  console.log("Creating 100 customers...");
  const customerTx = [];
  for (let i = 1; i <= 100; i++) {
    customerTx.push(
      prisma.customer.create({
        data: {
          name: `Client Stress #${i}`,
          phone: `0660000${String(i).padStart(3, "0")}`,
          email: `client${i}@stress.com`,
          notes: `Note Client ${i}`,
        },
      })
    );
  }
  const createdCustomers = await prisma.$transaction(customerTx);
  console.log(`Successfully created ${createdCustomers.length} customers.`);

  // 5. Create 1000 Products with Variants
  console.log("Creating 1000 products with variants (in batches of 100)...");
  const variantIds = [];
  const variantMap = new Map(); // variantId -> { price, costPrice }

  for (let batch = 0; batch < 10; batch++) {
    const productTx = [];
    for (let i = 1; i <= 100; i++) {
      const idx = batch * 100 + i;
      const price = 1000 + Math.floor(Math.random() * 8000); // 1000 to 9000
      const costPrice = Math.floor(price * 0.6); // 60% of price
      const catId = categories[idx % categories.length].id;

      productTx.push(
        prisma.product.create({
          data: {
            name: `Produit Stress #${idx}`,
            sku: `SKU-STRESS-${String(idx).padStart(5, "0")}`,
            price,
            costPrice,
            categoryId: catId,
            isActive: true,
            barcodeType: "auto",
            variants: {
              create: [
                { size: "M", color: "Noir", stock: 500, barcode: `BAR-M-${idx}` },
                { size: "L", color: "Bleu", stock: 500, barcode: `BAR-L-${idx}` },
              ],
            },
          },
          include: { variants: true },
        })
      );
    }

    const createdProducts = await prisma.$transaction(productTx);
    for (const prod of createdProducts) {
      for (const v of prod.variants) {
        variantIds.push(v.id);
        variantMap.set(v.id, { price: prod.price, costPrice: prod.costPrice });
      }
    }
    console.log(`Created ${variantIds.length / 2} / 1000 products...`);
  }

  // 6. Create 10000 Sales
  console.log("Creating 10000 sales (in batches of 1000)...");
  let totalSalesCreated = 0;

  for (let batch = 0; batch < 10; batch++) {
    const saleTx = [];
    for (let i = 1; i <= 1000; i++) {
      const saleIndex = batch * 1000 + i;
      const customer = createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
      const itemsCount = 1 + Math.floor(Math.random() * 3); // 1 to 3 items
      const saleItems = [];
      let total = 0;

      for (let k = 0; k < itemsCount; k++) {
        const vId = variantIds[Math.floor(Math.random() * variantIds.length)];
        const details = variantMap.get(vId);
        const quantity = 1 + Math.floor(Math.random() * 2); // 1 or 2
        const unitPrice = details.price;
        const costPrice = details.costPrice;
        const profit = (unitPrice - costPrice) * quantity;

        total += unitPrice * quantity;

        saleItems.push({
          variantId: vId,
          quantity,
          unitPrice,
          costPrice,
          profit,
        });
      }

      // Format receipt number
      const dateStr = "20260610";
      const receiptNumber = `REC-STRESS-${dateStr}-${String(saleIndex).padStart(6, "0")}`;

      saleTx.push(
        prisma.sale.create({
          data: {
            userId,
            customerId: customer.id,
            total,
            discount: 0,
            tax: 0,
            status: "completed",
            paymentMethod: "cash",
            receiptNumber,
            amountPaid: total,
            notes: `Vente stress test #${saleIndex}`,
            items: {
              create: saleItems,
            },
          },
        })
      );
    }

    await prisma.$transaction(saleTx);
    totalSalesCreated += 1000;
    console.log(`Created ${totalSalesCreated} / 10000 sales...`);
  }

  console.log("=== Stress Test Seeding Finished Successfully ===");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
