import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Sans_Thai, Inter } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-display",
  display: "swap",
});

const body = IBM_Plex_Sans_Thai({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const mono = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const noindex = process.env.NEXT_PUBLIC_NOINDEX === "true";

export const metadata: Metadata = {
  title: "BIB × icoone · SEE THE UNSEEN",
  description:
    "icoone® Laser Med สำหรับคลินิก · สำรวจบริเวณและโปรแกรมที่คลินิกคุณจัดเป็นบริการได้",
  robots: noindex ? { index: false, follow: false } : undefined,
  openGraph: {
    title: "BIB × icoone · SEE THE UNSEEN",
    description: "เครื่อง icoone® Laser Med สำหรับคลินิก · 40 โปรแกรม · 4 หัว",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
