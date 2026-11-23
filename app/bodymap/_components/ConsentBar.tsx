"use client";
import { useEffect, useState } from "react";
import { getConsent, setConsent } from "@/lib/bodymap/events";

/** แถบแจ้งการเก็บข้อมูลการใช้งาน (PDPA) · ขึ้นครั้งแรกครั้งเดียว */
export default function ConsentBar({ onAnswer }: { onAnswer: (v: "yes" | "no") => void }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(getConsent() === null); }, []);
  if (!show) return null;
  const answer = (v: "yes" | "no") => { setConsent(v); setShow(false); onAnswer(v); };
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur" role="region" aria-label="การเก็บข้อมูลการใช้งาน">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3">
        <p className="m-0 min-w-0 flex-1 basis-[260px] text-sm text-ink-2">
          หน้านี้เก็บข้อมูลการใช้งาน (จุดและหัวข้อที่กด) แบบไม่ระบุตัวตน เพื่อปรับเนื้อหาให้ตรงกับแพทย์ ตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => answer("no")} className="rounded-full border border-line bg-card px-4 py-1.5 text-sm text-ink-2 hover:border-ink">ไม่เก็บ</button>
          <button type="button" onClick={() => answer("yes")} className="rounded-full border border-ink bg-ink px-4 py-1.5 text-sm text-paper">ยอมรับ</button>
        </div>
      </div>
    </div>
  );
}
