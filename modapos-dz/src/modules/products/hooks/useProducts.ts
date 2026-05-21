import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useIPC } from "@/hooks/useIPC";
import type {
  Product,
  PaginatedProducts,
  ProductStats,
  ProductFormData,
} from "@/types";

interface UseProductsParams {
  pageSize?: number;
}

export function useProducts({ pageSize = 20 }: UseProductsParams = {}) {
  const api = useIPC();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<ProductStats>({
    totalProducts: 0,
    totalVariants: 0,
    lowStockVariants: 0,
  });

  const load = useCallback(
    async (params?: {
      page?: number;
      search?: string;
      categoryId?: number | undefined;
    }) => {
      setIsLoading(true);
      try {
        const [result, productStats] = await Promise.all([
          api<PaginatedProducts>("products:getAll", {
            page: params?.page ?? page,
            pageSize,
            search: params?.search ?? search,
            categoryId: params?.categoryId ?? categoryId,
          }),
          api<ProductStats>("products:getStats"),
        ]);

        setProducts(result.products);
        setTotal(result.total);
        setStats(productStats);
        if (params?.page !== undefined) setPage(params.page);
      } catch {
        toast.error("Erreur lors du chargement des produits");
      } finally {
        setIsLoading(false);
      }
    },
    [api, page, pageSize, search, categoryId]
  );

  const create = useCallback(
    async (data: ProductFormData): Promise<boolean> => {
      try {
        await api("products:create", {
          name: data.name,
          sku: data.sku,
          price: parseFloat(data.price),
          description: data.description || undefined,
          categoryId: data.categoryId ? parseInt(data.categoryId) : undefined,
          imagePath: data.imagePath || undefined,
          variants: data.variants,
        });
        toast.success("Produit créé avec succès");
        await load({ page: 1 });
        setPage(1);
        return true;
      } catch {
        toast.error("Erreur lors de la création du produit");
        return false;
      }
    },
    [api, load]
  );

  const update = useCallback(
    async (id: number, data: ProductFormData): Promise<boolean> => {
      try {
        await api("products:update", id, {
          name: data.name,
          sku: data.sku,
          price: parseFloat(data.price),
          description: data.description || undefined,
          categoryId: data.categoryId ? parseInt(data.categoryId) : undefined,
          imagePath: data.imagePath || undefined,
          variants: data.variants,
        });
        toast.success("Produit mis à jour");
        await load();
        return true;
      } catch {
        toast.error("Erreur lors de la mise à jour");
        return false;
      }
    },
    [api, load]
  );

  const remove = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await api("products:delete", id);
        toast.success("Produit supprimé");
        await load();
        return true;
      } catch {
        toast.error("Erreur lors de la suppression");
        return false;
      }
    },
    [api, load]
  );

  const handleSearch = useCallback(
    (q: string) => {
      setSearch(q);
      setPage(1);
      load({ page: 1, search: q, categoryId });
    },
    [load, categoryId]
  );

  const handleCategoryFilter = useCallback(
    (catId: number | undefined) => {
      setCategoryId(catId);
      setPage(1);
      load({ page: 1, search, categoryId: catId });
    },
    [load, search]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      load({ page: newPage, search, categoryId });
    },
    [load, search, categoryId]
  );

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    products,
    total,
    page,
    pageSize,
    stats,
    isLoading,
    search,
    categoryId,
    load,
    create,
    update,
    remove,
    handleSearch,
    handleCategoryFilter,
    handlePageChange,
  };
}
