import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BIB | ศูนย์ตรวจทานและอนุมัติเอกสาร",
  description: "ศูนย์ตรวจทาน แสดงความคิดเห็น และอนุมัติเอกสารเชิงพาณิชย์ของ BIB",
  openGraph: {
    title: "BIB | ศูนย์ตรวจทานและอนุมัติเอกสาร",
    description: "ตรวจทาน · แสดงความคิดเห็น · อนุมัติ · ลงนาม",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "BIB | ศูนย์ตรวจทานและอนุมัติเอกสาร",
    description: "ตรวจทาน · แสดงความคิดเห็น · อนุมัติ · ลงนาม",
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
