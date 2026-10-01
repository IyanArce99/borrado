import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/shell/footer";
import { Header } from "@/components/shell/header";
import { MenuOverlay } from "@/components/shell/menu-overlay";
import { SearchOverlay } from "@/components/shell/search-overlay";
import { TabBar } from "@/components/shell/tab-bar";
import { THEME_INIT_SCRIPT } from "@/components/shell/theme";
import { Toaster } from "@/components/shell/toaster";
import { UIProvider } from "@/components/shell/ui-provider";
import { SITE_URL } from "@/lib/site";
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BORRADO · Las viviendas que desaparecen del mercado en Madrid",
    template: "%s · BORRADO",
  },
  description:
    "BORRADO registra diariamente las viviendas que desaparecen del mercado observado en Madrid y conserva su rastro. Desaparecido ≠ vendido.",
  applicationName: "BORRADO",
  openGraph: { siteName: "BORRADO", locale: "es_ES", type: "website" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0d" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" data-theme="light" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-dvh flex-col pb-[84px] lg:pb-0">
        <UIProvider>
          <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:bg-ink focus:px-3 focus:py-2 focus:text-bg">
            Saltar al contenido
          </a>
          <Header />
          <div id="contenido" className="flex-1">
            {children}
          </div>
          <Footer />
          <TabBar />
          <MenuOverlay />
          <SearchOverlay />
          <Toaster />
        </UIProvider>
      </body>
    </html>
  );
}
