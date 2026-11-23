"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

/** หน้าขอบคุณ · แสดงรหัสอ้างอิงของลีด · LINE OA ยังไม่เชื่อม จึงบอกว่าทีมจะติดต่อกลับ */
export default function Thanks() {
  const [ref, setRef] = useState("");
  const [line, setLine] = useState(false);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setRef(q.get("ref") ?? "");
    setLine(q.get("line") === "1");
  }, []);
  return (
    <main className="mx-auto max-w-[640px] px-4 py-16 text-center">
      <p className="m-0 text-sm text-muted">icoone Laser Med</p>
      <h1 className="mb-3 mt-1 text-3xl font-semibold leading-tight text-ink">ได้รับข้อมูลแล้ว ขอบคุณครับ</h1>
      <p className="m-0 text-ink-2">{line ? "ทีมจะติดต่อกลับทาง LINE ตามไอดี LINE ที่ให้ไว้" : "ทีมจะติดต่อกลับตามเบอร์โทรที่ให้ไว้"}</p>
      {ref ? (
        <div className="mx-auto mt-6 max-w-[360px] rounded-2xl border border-line bg-paper p-5">
          <p className="m-0 text-sm text-muted">รหัสอ้างอิงของคุณ</p>
          <p className="m-0 break-all text-2xl font-semibold tracking-wide text-ink">{ref}</p>
          <p className="m-0 mt-1 text-sm text-ink-2">แจ้งรหัสนี้กับทีม เพื่อคุยต่อจากแผนดูแลที่คุณดูไว้</p>
        </div>
      ) : null}
      <Link href="/bodymap" className="mt-8 inline-block rounded-full border border-ink px-5 py-2 text-sm text-ink hover:bg-ink hover:text-paper">กลับไปดูแผนดูแล</Link>
    </main>
  );
}
