import { useState, useEffect, useCallback, useRef } from "react";
import { useIPC } from "@/hooks/useIPC";
import type { Product, PaginatedProducts } from "@/types";

interface UsePOSSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  categoryId: number | undefined;
  setCategoryId: (id: number | undefined) => void;
  products: Product[];
  isSearching: boolean;
  clearSearch: () => void;
}

/**
 * Handles product search for the POS grid.
 * - Empty query: loads the first 40 active products (filtered by categoryId if set)
 * - With query: searches by name, SKU, or barcode (200ms debounce)
 * - Barcode scanner support: if query contains only digits and length >= 4,
 *   the debounce is bypassed for instant lookup
 * - categoryId: when set, filters the initial load by DB category
 */
export function usePOSSearch(): UsePOSSearchReturn {
  const api = useIPC();
  const [query, setQueryState] = useState("");
  const [categoryId, setCategoryIdState] = useState<number | undefined>(undefined);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(
    async (q: string, catId?: number) => {
      setIsSearching(true);
      try {
        if (q.length === 0) {
          const result = await api<PaginatedProducts>("products:getAll", {
            page: 1,
            pageSize: 40,
            categoryId: catId,
          });
          setProducts(result.products);
        } else {
          const results = await api<Product[]>("products:search", q);
          setProducts(results);
        }
      } catch {
        // silently fail — don't toast on every keystroke
      } finally {
        setIsSearching(false);
      }
    },
    [api]
  );

  const setQuery = useCallback(
    (q: string) => {
      setQueryState(q);
      if (timerRef.current) clearTimeout(timerRef.current);

      // Barcodes are typically all-digit strings — bypass debounce
      const isLikelyBarcode = /^\d{4,}$/.test(q.trim());
      const delay = isLikelyBarcode ? 0 : 200;

      timerRef.current = setTimeout(() => doSearch(q, categoryId), delay);
    },
    [doSearch, categoryId]
  );

  const setCategoryId = useCallback(
    (id: number | undefined) => {
      setCategoryIdState(id);
      doSearch("", id);
      setQueryState("");
    },
    [doSearch]
  );

  const clearSearch = useCallback(() => {
    setQueryState("");
    doSearch("", categoryId);
  }, [doSearch, categoryId]);

  // Initial load
  useEffect(() => {
    doSearch("", undefined);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { query, setQuery, categoryId, setCategoryId, products, isSearching, clearSearch };
}

