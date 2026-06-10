import { IpcMain, dialog, app } from "electron";
import fs from "fs";
import path from "path";
import { prisma } from "../db/client";
import { logActivity } from "./activityLogs";
import { requirePermission } from "../helpers/rbac";

interface GetAllParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: number;
}

interface VariantInput {
  id?: number;
  size: string;
  color: string;
  stock: number;
  barcode?: string;
}

interface ProductInput {
  name: string;
  sku: string;
  price: number;
  description?: string;
  categoryId?: number;
  imagePath?: string;
  variants?: VariantInput[];
}

function generateBarcodeValue(barcodeType: string, variantId: number): string {
  if (barcodeType === "ean13") {
    const base = `200${String(variantId).padStart(9, "0")}`;
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(base.charAt(i), 10);
      sum += digit * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return `${base}${checkDigit}`;
  } else {
    // Code128 / QR fallback: MDZ-XXXXXX
    return `MDZ-${String(variantId).padStart(6, "0")}`;
  }
}

export function registerProductHandlers(ipcMain: IpcMain) {
  // ─── Get All (paginated + filtered) ───────────────────────
  ipcMain.handle("products:getAll", async (_e, params?: GetAllParams) => {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where = {
      isActive: true,
      ...(params?.categoryId ? { categoryId: params.categoryId } : {}),
      ...(params?.search
        ? {
            OR: [
              { name: { contains: params.search } },
              { sku: { contains: params.search } },
            ],
          }
        : {}),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          variants: { orderBy: [{ size: "asc" }, { color: "asc" }] },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total, page, pageSize };
  });

  // ─── Get By ID ────────────────────────────────────────────
  ipcMain.handle("products:getById", async (_e, id: number) => {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: { orderBy: [{ size: "asc" }, { color: "asc" }] },
      },
    });
  });

  ipcMain.handle("products:create", async (_e, data: ProductInput) => {
    const { variants, currentUserId, ...productData } = data as any;
    try {
      return await prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: productData,
        });

        const createdVariants = [];
        for (const v of variants ?? []) {
          if (v.stock < 0) {
            throw new Error("Le stock ne peut pas être négatif.");
          }
          const variant = await tx.productVariant.create({
            data: {
              productId: product.id,
              size: v.size,
              color: v.color,
              stock: v.stock,
              barcode: v.barcode && v.barcode.trim() ? v.barcode.trim() : null,
            },
          });

          if (!variant.barcode) {
            const generated = generateBarcodeValue(productData.barcodeType || "auto", variant.id);
            const updated = await tx.productVariant.update({
              where: { id: variant.id },
              data: { barcode: generated },
            });
            createdVariants.push(updated);
          } else {
            createdVariants.push(variant);
          }
        }

        await logActivity(
          tx,
          currentUserId,
          "CREATE",
          "Product",
          String(product.id),
          `Création du produit ${product.name} (SKU: ${product.sku}) avec ${createdVariants.length} variante(s)`
        );

        return {
          ...product,
          variants: createdVariants,
        };
      });
    } catch (error: any) {
      if (error.code === "P2002") {
        throw new Error("Un produit avec ce SKU existe déjà.");
      }
      throw error;
    }
  });

  ipcMain.handle(
    "products:update",
    async (_e, id: number, data: ProductInput) => {
      const { variants, currentUserId, ...productData } = data as any;

      try {
        return await prisma.$transaction(async (tx) => {
          // Get old product to see if imagePath changed
          const oldProduct = await tx.product.findUnique({
            where: { id },
            select: { imagePath: true },
          });

          if (oldProduct && oldProduct.imagePath && oldProduct.imagePath !== productData.imagePath) {
            try {
              const oldFullPath = path.join(app.getPath("userData"), oldProduct.imagePath);
              if (fs.existsSync(oldFullPath)) fs.unlinkSync(oldFullPath);
            } catch (err) {
              console.error("Error deleting old image:", err);
            }
          }

          // Find existing variant IDs for this product
          const existing = await tx.productVariant.findMany({
            where: { productId: id },
            select: { id: true },
          });
          const existingIds = existing.map((v) => v.id);
          const submittedIds = (variants ?? [])
            .filter((v: any) => v.id !== undefined)
            .map((v: any) => v.id as number);

          // Delete variants no longer in the form (only if not referenced by sales)
          const toDelete = existingIds.filter((vid) => !submittedIds.includes(vid));
          for (const variantId of toDelete) {
            const count = await tx.saleItem.count({ where: { variantId } });
            if (count === 0) {
              await tx.productVariant.delete({ where: { id: variantId } });
            }
          }

          const updatedVariants = [];
          // Upsert submitted variants
          for (const variant of variants ?? []) {
            if (variant.stock < 0) {
              throw new Error("Le stock ne peut pas être négatif.");
            }
            if (variant.id) {
              let finalBarcode = variant.barcode && variant.barcode.trim() ? variant.barcode.trim() : null;
              if (!finalBarcode) {
                finalBarcode = generateBarcodeValue(productData.barcodeType || "auto", variant.id);
              }

              const updated = await tx.productVariant.update({
                where: { id: variant.id },
                data: {
                  size: variant.size,
                  color: variant.color,
                  stock: variant.stock,
                  barcode: finalBarcode,
                },
              });
              updatedVariants.push(updated);
            } else {
              const created = await tx.productVariant.create({
                data: {
                  productId: id,
                  size: variant.size,
                  color: variant.color,
                  stock: variant.stock,
                  barcode: variant.barcode && variant.barcode.trim() ? variant.barcode.trim() : null,
                },
              });

              if (!created.barcode) {
                const generated = generateBarcodeValue(productData.barcodeType || "auto", created.id);
                const updated = await tx.productVariant.update({
                  where: { id: created.id },
                  data: { barcode: generated },
                });
                updatedVariants.push(updated);
              } else {
                updatedVariants.push(created);
              }
            }
          }

          const product = await tx.product.update({
            where: { id },
            data: productData,
            include: { category: true, variants: true },
          });

          await logActivity(
            tx,
            currentUserId,
            "UPDATE",
            "Product",
            String(product.id),
            `Modification du produit ${product.name} (SKU: ${product.sku})`
          );

          return {
            ...product,
            variants: updatedVariants,
          };
        });
      } catch (error: any) {
        if (error.code === "P2002") {
          throw new Error("Un produit avec ce SKU existe déjà.");
        }
        throw error;
      }
    }
  );

  // ─── Soft Delete ─────────────────────────────────────────
  ipcMain.handle("products:delete", async (_e, id: number, currentUserId?: number) => {
    await requirePermission(currentUserId, "products.delete");
    const product = await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
    await logActivity(
      prisma,
      currentUserId,
      "DELETE",
      "Product",
      String(product.id),
      `Désactivation (suppression) du produit ${product.name} (SKU: ${product.sku})`
    );
    return product;
  });

  // ─── Search (for POS quick lookup) ───────────────────────
  ipcMain.handle("products:search", async (_e, query: string) => {
    return prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query } },
          { sku: { contains: query } },
          { variants: { some: { barcode: { contains: query } } } },
        ],
      },
      include: { category: true, variants: true },
      take: 20,
    });
  });

  // ─── Get Stats (counts for page header) ──────────────────
  ipcMain.handle("products:getStats", async () => {
    const [totalProducts, totalVariants, lowStockVariants] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.productVariant.count(),
      prisma.productVariant.count({ where: { stock: { lte: 5 } } }),
    ]);
    return { totalProducts, totalVariants, lowStockVariants };
  });

  // ─── Image Upload ─────────────────────────────────────────
  // Opens a native file dialog, copies the chosen image into userData/images/,
  // and returns the relative path (used with the media:// custom protocol).
  ipcMain.handle("products:selectImage", async () => {
    const result = await dialog.showOpenDialog({
      title: "Choisir une image produit",
      properties: ["openFile"],
      filters: [
        { name: "Images", extensions: ["jpg", "jpeg", "png", "webp", "gif"] },
      ],
    });

    if (result.canceled || !result.filePaths[0]) return null;

    const src = result.filePaths[0];
    const ext = path.extname(src).toLowerCase();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const imagesDir = path.join(app.getPath("userData"), "images");
    const dest = path.join(imagesDir, filename);

    fs.mkdirSync(imagesDir, { recursive: true });
    fs.copyFileSync(src, dest);

    // Return relative path — renderer renders it as <img src="media://images/filename" />
    return `images/${filename}`;
  });

  // ─── Delete Saved Image ───────────────────────────────────
  ipcMain.handle("products:deleteImage", async (_e, imagePath: string) => {
    try {
      const fullPath = path.join(app.getPath("userData"), imagePath);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      return true;
    } catch {
      return false;
    }
  });

  // ─── Export CSV ───────────────────────────────────────────
  ipcMain.handle("products:exportCSV", async (_e, csvContent: string, defaultFilename: string) => {
    try {
      const result = await dialog.showSaveDialog({
        title: "Exporter les produits",
        defaultPath: defaultFilename,
        filters: [{ name: "CSV Files", extensions: ["csv"] }],
      });

      if (result.canceled || !result.filePath) return false;

      // Add UTF-8 BOM to make Excel display Arabic/French accents correctly
      const bom = "\uFEFF";
      fs.writeFileSync(result.filePath, bom + csvContent, "utf-8");
      return true;
    } catch (err) {
      console.error("Failed to save CSV file:", err);
      return false;
    }
  });
}
