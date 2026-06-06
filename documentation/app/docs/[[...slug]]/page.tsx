import { source } from "@/lib/source";
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { Callout } from "fumadocs-ui/components/callout";
import { Card, Cards } from "fumadocs-ui/components/card";
import { Steps, Step } from "fumadocs-ui/components/steps";
import { Tabs, Tab } from "fumadocs-ui/components/tabs";
import ScreenshotGallery from "@/components/screenshot-gallery";
import { Metadata } from "next";

interface ParamProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function Page({ params }: ParamProps) {
  const resolvedParams = await params;
  const page = source.getPage(resolvedParams.slug);

  if (!page) {
    notFound();
  }

  const MDX = page.data.body;

  return (
    <DocsPage 
      toc={page.data.toc} 
      full={page.data.full}
    >
      <DocsTitle className="text-3xl font-extrabold tracking-tight text-fd-foreground">
        {page.data.title}
      </DocsTitle>
      {page.data.description && (
        <DocsDescription className="text-base text-fd-muted-foreground mt-2">
          {page.data.description}
        </DocsDescription>
      )}
      <DocsBody className="prose dark:prose-invert max-w-none mt-6">
        <MDX 
          components={{ 
            Callout, 
            Card, 
            Cards, 
            Steps, 
            Step, 
            Tabs, 
            Tab,
            ScreenshotGallery 
          }} 
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({ params }: ParamProps): Promise<Metadata> {
  const resolvedParams = await params;
  const page = source.getPage(resolvedParams.slug);

  if (!page) {
    return {};
  }

  return {
    title: `${page.data.title} - Guide ModaDZ POS`,
    description: page.data.description || `Documentation d'aide pour ${page.data.title} sur le système POS ModaDZ.`,
    openGraph: {
      title: `${page.data.title} - Guide ModaDZ POS`,
      description: page.data.description || `Documentation d'aide pour ${page.data.title} sur le système POS ModaDZ.`,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `Documentation ModaDZ - ${page.data.title}`,
        },
      ],
    },
  };
}
