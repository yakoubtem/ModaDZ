import { PageHeader, PageContent } from "@/components/layout/AppLayout";

export function ProductsPage() {
  return (
    <>
      <PageHeader title="Produits" description="Gestion du catalogue" />
      <PageContent>
        <p className="text-[var(--color-text-muted)] text-sm">Module Produits — à construire</p>
      </PageContent>
    </>
  );
}
