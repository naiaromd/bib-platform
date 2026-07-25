import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BIB Commercial Health",
  description: "Role-based commercial review and approval center for BIB.",
  openGraph: {
    title: "BIB Commercial Health",
    description: "Review · Approve · E‑Signature",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "BIB Commercial Health",
    description: "Review · Approve · E‑Signature",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
