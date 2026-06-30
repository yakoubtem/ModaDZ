import Link from "next/link";
import { Store, BookOpen, ArrowRight, ShieldCheck, TrendingUp, Cpu, CreditCard } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-fd-background text-fd-foreground font-sans flex flex-col selection:bg-fd-primary/20">
      {/* Navigation Header */}
      <header className="border-b border-fd-border/30 bg-fd-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center bg-fd-primary/10 border border-fd-primary/30 p-1.5 rounded-md">
              <Store className="h-5 w-5 text-fd-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight">ModaDZ <span className="text-fd-primary">Docs</span></span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/docs/getting-started"
              className="text-xs font-semibold text-fd-muted-foreground hover:text-fd-foreground transition-colors duration-150"
            >
              Guide rapide
            </Link>
            <Link
              href="/docs/faq"
              className="text-xs font-semibold text-fd-muted-foreground hover:text-fd-foreground transition-colors duration-150"
            >
              FAQ
            </Link>
            <Link
              href="/docs/getting-started"
              className="px-4 py-2 rounded-md bg-fd-primary text-fd-primary-foreground text-xs font-bold shadow-md shadow-fd-primary/10 hover:shadow-lg hover:shadow-fd-primary/20 transition-all duration-200 cursor-pointer"
            >
              Accéder aux guides
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-24 sm:py-32">
          {/* Subtle decorative glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-fd-primary/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fd-primary/10 border border-fd-primary/20 text-[10px] font-bold text-fd-primary uppercase tracking-wider mb-6 animate-pulse">
              Centre d'aide officiel v1.0
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto">
              Gérez votre commerce de détail avec <span className="bg-gradient-to-r from-fd-primary via-[#E5C158] to-[#4D8B8B] bg-clip-text text-transparent">ModaDZ</span>
            </h1>

            <p className="mt-6 text-base sm:text-xl text-fd-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Le guide complet pour installer, configurer et maîtriser votre logiciel de point de vente et de gestion de boutique.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/docs/getting-started"
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-fd-primary text-fd-primary-foreground font-bold shadow-lg shadow-fd-primary/15 hover:shadow-xl hover:shadow-fd-primary/30 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer text-sm"
              >
                Commencer la configuration
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                href="/docs"
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg border border-fd-border bg-fd-card/50 hover:bg-fd-card text-fd-foreground font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <BookOpen className="h-4 w-4 text-fd-primary" />
                Parcourir la documentation
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="py-16 border-t border-fd-border/20 bg-fd-card/20 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Modules Principaux du Système</h2>
              <p className="text-sm text-fd-muted-foreground mt-3">Découvrez comment ModaDZ structure la gestion quotidienne de votre boutique.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div className="p-6 rounded-xl border border-fd-border/30 bg-fd-background/50 hover:border-fd-primary/50 transition-all duration-300 hover:shadow-md">
                <div className="h-10 w-10 rounded-lg bg-fd-primary/10 border border-fd-primary/20 flex items-center justify-center mb-4">
                  <CreditCard className="h-5 w-5 text-fd-primary" />
                </div>
                <h3 className="font-bold text-base">Point de Vente (POS)</h3>
                <p className="text-xs text-fd-muted-foreground mt-2 leading-relaxed">
                  Caisse enregistreuse rapide, scan de codes-barres, tickets de caisse, remises et encaissements multi-modes.
                </p>
                <Link href="/docs/pos" className="text-xs font-bold text-fd-primary hover:underline mt-4 inline-flex items-center gap-1">
                  En savoir plus <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Card 2 */}
              <div className="p-6 rounded-xl border border-fd-border/30 bg-fd-background/50 hover:border-fd-primary/50 transition-all duration-300 hover:shadow-md">
                <div className="h-10 w-10 rounded-lg bg-[#4D8B8B]/10 border border-[#4D8B8B]/20 flex items-center justify-center mb-4">
                  <Cpu className="h-5 w-5 text-[#4D8B8B]" />
                </div>
                <h3 className="font-bold text-base">Gestion de Stock</h3>
                <p className="text-xs text-fd-muted-foreground mt-2 leading-relaxed">
                  Variantes de tailles & couleurs, seuil de stock minimum, livraison fournisseur et inventaire physique simplifié.
                </p>
                <Link href="/docs/inventory" className="text-xs font-bold text-fd-primary hover:underline mt-4 inline-flex items-center gap-1">
                  En savoir plus <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Card 3 */}
              <div className="p-6 rounded-xl border border-fd-border/30 bg-fd-background/50 hover:border-fd-primary/50 transition-all duration-300 hover:shadow-md">
                <div className="h-10 w-10 rounded-lg bg-fd-primary/10 border border-fd-primary/20 flex items-center justify-center mb-4">
                  <TrendingUp className="h-5 w-5 text-fd-primary" />
                </div>
                <h3 className="font-bold text-base">Crédits & Dettes</h3>
                <p className="text-xs text-fd-muted-foreground mt-2 leading-relaxed">
                  Système de gestion des ardoises clients (crédits de confiance), historique des règlements et rappels.
                </p>
                <Link href="/docs/debt-management" className="text-xs font-bold text-fd-primary hover:underline mt-4 inline-flex items-center gap-1">
                  En savoir plus <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Card 4 */}
              <div className="p-6 rounded-xl border border-fd-border/30 bg-fd-background/50 hover:border-fd-primary/50 transition-all duration-300 hover:shadow-md">
                <div className="h-10 w-10 rounded-lg bg-[#4D8B8B]/10 border border-[#4D8B8B]/20 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-5 w-5 text-[#4D8B8B]" />
                </div>
                <h3 className="font-bold text-base">Rôles & Sécurité</h3>
                <p className="text-xs text-fd-muted-foreground mt-2 leading-relaxed">
                  Définition des accès pour les caissiers, gérants et administrateurs afin d'éliminer les fraudes de caisse.
                </p>
                <Link href="/docs/user-roles" className="text-xs font-bold text-fd-primary hover:underline mt-4 inline-flex items-center gap-1">
                  En savoir plus <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-fd-border/20 py-10 bg-fd-background">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-fd-muted-foreground">
          <p>© {new Date().getFullYear()} ModaDZ. Tous droits réservés.</p>
          <div className="flex gap-4">
            <Link href="/docs/architecture" className="hover:text-fd-foreground transition-colors duration-150">Architecture</Link>
            <Link href="/docs/changelog" className="hover:text-fd-foreground transition-colors duration-150">Changelog</Link>
            <Link href="/docs/settings" className="hover:text-fd-foreground transition-colors duration-150">Paramètres</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
