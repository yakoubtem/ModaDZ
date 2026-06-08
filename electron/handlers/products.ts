import { IpcMain, dialog, app } from "electron";
import fs from "fs";
import path from "path";
import { prisma } from "../db/client";
import { logActivity } from "./activityLogs";

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
          data: {
            ...productData,
            variants: {
              create: (variants ?? []).map(({ id: _id, ...v }: any) => v),
            },
          },
          include: { category: true, variants: true },
        });

        await logActivity(
          tx,
          currentUserId,
          "CREATE",
          "Product",
          String(product.id),
          `Création du produit ${product.name} (SKU: ${product.sku})`
        );

        return product;
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

          // Upsert submitted variants
          for (const variant of variants ?? []) {
            if (variant.id) {
              await tx.productVariant.update({
                where: { id: variant.id },
                data: {
                  size: variant.size,
                  color: variant.color,
                  stock: variant.stock,
                  barcode: variant.barcode ?? null,
                },
              });
            } else {
              await tx.productVariant.create({
                data: {
                  productId: id,
                  size: variant.size,
                  color: variant.color,
                  stock: variant.stock,
                  barcode: variant.barcode ?? null,
                },
              });
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

          return product;
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
