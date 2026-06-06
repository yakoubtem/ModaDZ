import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { RootProvider } from "fumadocs-ui/provider/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Documentation ModaDZ",
  description: "Documentation officielle de ModaDZ POS - Le logiciel de point de vente et de gestion de magasin moderne pour commerces de détail.",
  metadataBase: new URL("https://docs.modadz.com"),
  openGraph: {
    title: "Documentation ModaDZ",
    description: "Documentation officielle de ModaDZ POS - Le logiciel de point de vente et de gestion de magasin moderne pour commerces de détail.",
    type: "website",
    locale: "fr_DZ",
    siteName: "ModaDZ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
