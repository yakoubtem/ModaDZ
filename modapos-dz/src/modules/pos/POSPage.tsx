import { PageHeader, PageContent } from "@/components/layout/AppLayout";

export function POSPage() {
  return (
    <>
      <PageHeader title="Caisse" description="Point de vente" />
      <PageContent>
        <p className="text-[var(--color-text-muted)] text-sm">Module POS — à construire</p>
      </PageContent>
    </>
  );
}
