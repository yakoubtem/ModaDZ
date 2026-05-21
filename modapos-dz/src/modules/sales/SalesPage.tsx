import { PageHeader, PageContent } from "@/components/layout/AppLayout";

export function SalesPage() {
  return (
    <>
      <PageHeader title="Historique des ventes" description="Toutes les transactions" />
      <PageContent>
        <p className="text-[var(--color-text-muted)] text-sm">Module Ventes — à construire</p>
      </PageContent>
    </>
  );
}
