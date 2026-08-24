import { SkipLinks } from "@/components/ui/SkipLinks";
import { wedding } from "@/data/wedding";
import type { Metadata, Viewport } from "next";
import { Caveat, Fraunces, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display-family",
  subsets: ["latin"],
  display: "swap",
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const annotation = Caveat({
  variable: "--font-annotation-family",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: wedding.site.title,
    template: `%s · ${wedding.couple.displayName}`,
  },
  description: wedding.site.description,
  metadataBase: new URL(wedding.site.canonicalUrl),
  openGraph: {
    title: wedding.site.title,
    description: wedding.site.description,
    type: "website",
    locale: "en_US",
  },
  robots:
    wedding.site.mode === "public"
      ? { index: true, follow: true }
      : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: wedding.colors.ivory,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${annotation.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-ivory font-sans text-forest">
        <SkipLinks />
        {children}
      </body>
    </html>
  );
}
