import type { Metadata } from "next";
import Thanks from "./Thanks";

export const dynamic = "force-static";
export const metadata: Metadata = { title: "ขอบคุณ · Body Map", robots: { index: false, follow: false } };
export default function Page() { return <Thanks />; }
