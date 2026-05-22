import { useEffect, useState } from "react";
import { useIPC } from "@/hooks/useIPC";
import type { DashboardSummary } from "@/types";
import { toast } from "sonner";

export function useDashboard(days: number = 30) {
  const api = useIPC();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        setIsLoading(true);
        const result = await api<DashboardSummary>("dashboard:getSummary", { days });
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          toast.error("Impossible de charger les données du tableau de bord");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [api, days]);

  return { data, isLoading };
}