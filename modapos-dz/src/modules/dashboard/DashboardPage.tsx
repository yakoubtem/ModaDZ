import { PageHeader, PageContent } from "@/components/layout/AppLayout";
import { SkeletonCard } from "@/components/ui/Skeleton";

export function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de votre magasin"
      />
      <PageContent>
        <div className="grid grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <p className="mt-8 text-center text-[var(--color-text-muted)] text-sm">
          Module Dashboard — à construire
        </p>
      </PageContent>
    </>
  );
}
