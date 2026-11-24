import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

// Serifa de título (só peso 400) e sans de texto: o contraste entre as duas faz o tom editorial da loja.
const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const text = Manrope({
  variable: "--font-text",
  subsets: ["latin"],
  display: "swap",
});

const title = `${siteConfig.name} — ${siteConfig.slogan}`;

export const metadata: Metadata = {
  title,
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    locale: "pt_PT",
    type: "website",
  },
  robots: siteConfig.indexable ? { index: true, follow: true } : { index: false, follow: false },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#10291F",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-PT" className={`${display.variable} ${text.variable}`}>
      <body>{children}</body>
    </html>
  );
}
