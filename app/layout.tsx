import type { Metadata, Viewport } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const serif = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-serif", display: "swap" });
const sans = Montserrat({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "AXON Suplementos Naturais", template: "%s | AXON" },
  description: site.description,
  openGraph: { title: "AXON Suplementos Naturais", description: site.description, locale: "pt_BR", type: "website", siteName: "AXON" },
};

// Conteúdo vem da base de dados e muda pelo painel, por isso as páginas são renderizadas a cada pedido.
export const dynamic = "force-dynamic";

export const viewport: Viewport = { themeColor: "#10291F" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
