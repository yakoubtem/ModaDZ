import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import VersionSelector from "@/components/version-selector";
import { Store } from "lucide-react";

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <div className="flex items-center gap-2 font-bold text-fd-foreground">
        <div className="flex items-center justify-center bg-fd-primary/10 border border-fd-primary/30 p-1.5 rounded-md">
          <Store className="h-4 w-4 text-fd-primary" />
        </div>
        <span className="tracking-tight">ModaDZ <span className="text-fd-primary">Docs</span></span>
      </div>
    ),
    children: (
      <div className="ml-2 sm:ml-4 flex items-center">
        <VersionSelector />
      </div>
    ),
  },
  links: [
    {
      text: "Guide de Démarrage",
      url: "/docs/getting-started",
      active: "nested-url",
    },
    {
      text: "FAQ",
      url: "/docs/faq",
      active: "nested-url",
    },
    {
      text: "Assistance",
      url: "/docs/troubleshooting",
      active: "nested-url",
    },
  ],
};
