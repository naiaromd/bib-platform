"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./login.module.css";

type Profile = "internal" | "approver" | "client" | "prospect";

const profiles: Array<{ id: Profile; number: string; title: string; description: string }> = [
  { id: "internal", number: "01", title: "ทีม BIB", description: "งานวันนี้ CRM นัดสาธิต และหลักฐานผลลัพธ์" },
  { id: "approver", number: "02", title: "ผู้อนุมัติเอกสาร", description: "ตรวจทาน แสดงความคิดเห็น ส่งกลับแก้ไข หรืออนุมัติภายใน" },
  { id: "client", number: "03", title: "ลูกค้า LINNA", description: "ข้อมูลบัญชี ผลการดำเนินงาน การฝึกอบรม และบริการ" },
  { id: "prospect", number: "04", title: "ผู้สนใจ icoone", description: "ข้อมูลประกอบการตัดสินใจและการขอนัดสาธิต" },
];

export default function LoginPage() {
  const searchParams = useSearchParams();
  const requestedProfile = searchParams.get("profile");
  const [profile, setProfile] = useState<Profile>(() => profiles.some((item) => item.id === requestedProfile) ? requestedProfile as Profile : "internal");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const selected = useMemo(() => profiles.find((item) => item.id === profile)!, [profile]);

  async function enter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch("/api/demo-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, pin, next: searchParams.get("next") || "" }),
      });
      const result = await response.json() as { error?: string; redirectTo?: string };
      if (!response.ok) {
        setMessage(result.error || "ไม่สามารถเข้าสู่พื้นที่ทดลองได้");
        return;
      }
      window.location.assign(result.redirectTo || "/");
    } catch {
      setMessage("การเชื่อมต่อขัดข้อง กรุณาลองอีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <img src="/logos/bib-logo.png" alt="BIB" />
          <span />
          <img src="/logos/icoone-laser-med.png" alt="icoone laser med" />
        </div>
        <div><strong>PRACTICE INTELLIGENCE</strong><span>Knowledge to decision · Decision to better practice</span></div>
        <em>ระบบทดลอง</em>
      </header>

      <section className={styles.content}>
        <div className={styles.introduction}>
          <span>BIB × ICOONE THAILAND</span>
          <h1>เข้าสู่พื้นที่<br />สำหรับการทดลองใช้</h1>
          <p>เลือกมุมมองที่ต้องการ ระบบจะแสดงข้อมูลและเครื่องมือให้เหมาะกับผู้ใช้งานแต่ละประเภท</p>
          <aside><b>ไม่ต้องสมัครสมาชิก</b><span>ใช้รหัสทดสอบที่ BIB จัดให้</span></aside>
        </div>

        <form className={styles.card} onSubmit={enter}>
          <header><span>เลือกพื้นที่ใช้งาน</span><h2>คุณต้องการเข้าดูในฐานะใด</h2></header>
          <div className={styles.profiles}>
            {profiles.map((item) => (
              <button type="button" key={item.id} className={profile === item.id ? styles.selected : ""} onClick={() => { setProfile(item.id); setMessage(""); }}>
                <i>{item.number}</i><span><strong>{item.title}</strong><small>{item.description}</small></span><b>{profile === item.id ? "✓" : ""}</b>
              </button>
            ))}
          </div>
          {profile !== "prospect" && (
            <label className={styles.pin}><span>รหัสสำหรับทดลอง</span><input value={pin} onChange={(event) => setPin(event.target.value)} autoComplete="one-time-code" required placeholder="กรอกรหัสที่ได้รับจาก BIB" /></label>
          )}
          {message && <p className={styles.error}>{message}</p>}
          <button className={styles.submit} disabled={submitting}>{submitting ? "กำลังเปิดพื้นที่…" : profile === "prospect" ? "เปิดข้อมูลสำหรับผู้สนใจ" : `เข้าสู่พื้นที่${selected.title}`}</button>
          <small className={styles.note}>ข้อมูลในระบบนี้จัดทำเพื่อการทดสอบรูปแบบการใช้งาน ยังไม่ใช่ระบบสมาชิกจริง</small>
        </form>
      </section>
    </main>
  );
}
