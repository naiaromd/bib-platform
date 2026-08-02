"use client";

import { useEffect, useState } from "react";

type ClientView = "home" | "business" | "academy" | "support";
type Dashboard = {
  account?: { legal_name: string; display_name: string; commercial_model: string; account_status: string };
  performance?: { report_month: string; reported_gross_revenue: number; eligible_gross_revenue: number; linna_share: number; bib_share_vat_inclusive: number; eligible_paid_sessions: number; total_usage_minutes: number; exception_count: number; status: string };
  deployment?: { model: string; serial_number: string; installed_at: string; cumulative_hours: number; status: string };
  warranty?: { starts_at: string; ends_at: string; status: string };
  training?: { total: number; completed: number };
  service?: { total: number };
  orders?: { total: number };
};

const money = (value?: number) => value == null ? "ยังไม่มีข้อมูล" : new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 2 }).format(value);

export default function ClientPage() {
  const [view, setView] = useState<ClientView>("home");
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const toast = (text: string) => { setNotice(text); window.setTimeout(() => setNotice(""), 2200); };
  const nav: Array<[ClientView, string, string]> = [["home", "01", "ภาพรวม"], ["business", "02", "พัฒนาธุรกิจ"], ["academy", "03", "การฝึกอบรม"], ["support", "04", "บริการและอุปกรณ์"]];

  useEffect(() => {
    fetch("/api/client-dashboard", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "โหลดข้อมูลไม่สำเร็จ");
        setData(payload);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "โหลดข้อมูลไม่สำเร็จ"));
  }, []);

  const account = data?.account;
  const report = data?.performance;
  return <main className="v2-shell v2-client">
    <header className="v2-brand-header">
      <a href="/client" className="v2-brand-lockup"><img src="/logos/bib-logo.png" alt="BIB" /><span /><img src="/logos/icoone-laser-med.png" alt="icoone laser med" /></a>
      <div className="v2-brand-copy"><b>พื้นที่ข้อมูลลูกค้า</b><span>ข้อมูลเพื่อพัฒนาบริการและผลประกอบการ</span></div>
      <nav><a href="/platform">สำหรับทีม BIB</a><a href="/explore">สำหรับผู้สนใจ</a><a className="active" href="/client">สำหรับลูกค้า</a></nav>
      <em>{account ? `${account.display_name} · ${account.commercial_model}` : "กำลังโหลด"}</em>
    </header>
    <section className="v2-layout">
      <aside className="v2-job-nav">
        <span>พื้นที่ลูกค้า LINNA</span><h2>พื้นที่ของคุณ</h2><p>แสดงเฉพาะข้อมูลที่มีแหล่งอ้างอิงหรือบันทึกในระบบ</p>
        <nav>{nav.map(([id, no, label]) => <button className={view === id ? "active" : ""} onClick={() => setView(id)} key={id}><i>{no}</i><span><b>{label}</b><small>{id === "home" ? "ภาพรวมและข้อมูลล่าสุด" : id === "business" ? "บริการและหลักฐาน" : id === "academy" ? "ความพร้อมของทีม" : "เครื่องและงานบริการ"}</small></span><em>↗</em></button>)}</nav>
        <div className="v2-control-note"><b>{account?.legal_name || "กำลังตรวจข้อมูลนิติบุคคล"}</b><p>ยืนยันจากหนังสือรับรองบริษัท</p></div>
      </aside>
      <div className="v2-work">
        <section className="v2-client-welcome v2-module-hero"><div><span>พื้นที่ข้อมูล LINNA Clinic</span><h1>ข้อมูลจริง<br />พร้อมแหล่งที่มา</h1><p>{account?.legal_name || "กำลังโหลดข้อมูล"}</p></div><aside><span>สถานะข้อมูล</span><b>{error ? "โหลดไม่สำเร็จ" : data ? "เชื่อมฐานระบบแล้ว" : "กำลังโหลด"}</b><small>ไม่มีการแสดงตัวเลขจำลอง</small><a href="/documents/linna-company-certificate.pdf" target="_blank">ดูหนังสือรับรอง</a></aside></section>
        <section className="v2-client-body">
          {error && <section className="v2-evidence-loop"><span>ไม่สามารถโหลดข้อมูล</span><h3>{error}</h3><p>กรุณาเข้าสู่ระบบใหม่หรือติดต่อ BIB</p></section>}
          {view === "home" && <><section className="v2-kicker-row"><div><span>ข้อมูลล่าสุด</span><h2>สรุปจากฐานระบบ</h2><p>ข้อมูลนิติบุคคลยืนยันแล้ว ส่วนรายงานผลยังรอตรวจสอบ</p></div><em>{report?.report_month || "ยังไม่มีรอบรายงาน"}</em></section>
            <div className="v2-metrics client-metrics-v2">
              {[[money(report?.reported_gross_revenue), "รายได้ที่นำเข้า", report ? "รอตรวจสอบยอด" : "ยังไม่มีข้อมูล"], [report ? `${(report.total_usage_minutes / 60).toFixed(1)} ชม.` : "ยังไม่มีข้อมูล", "เวลาบริการที่รายงาน", report ? `${report.exception_count} รายการต้องตรวจ` : "ยังไม่มีข้อมูล"], [data ? `${data.training?.completed || 0}/${data.training?.total || 0} คน` : "กำลังโหลด", "ผลการฝึกอบรม", data?.training?.total ? "จากประวัติในระบบ" : "ยังไม่มีประวัติยืนยัน"], [data ? `${data.service?.total || 0} รายการ` : "กำลังโหลด", "งานบริการที่เปิดอยู่", "จากรายการในระบบ"]].map((item, index) => <article key={item[1]}><i>0{index + 1}</i><strong>{item[0]}</strong><span>{item[1]}</span><small>{item[2]}</small></article>)}
            </div>
            <div className="v2-split"><section className="v2-panel v2-client-next"><header><div><span>สิ่งที่ต้องยืนยัน</span><h3>ข้อมูลที่ยังขาด</h3></div></header>{[["หมายเลขเครื่องและวันติดตั้ง", data?.deployment?.serial_number ? "บันทึกแล้ว" : "รอข้อมูล", "เปิดข้อมูลเครื่อง"], ["วันเริ่มและสิ้นสุดการรับประกัน", data?.warranty ? "บันทึกแล้ว" : "รอเอกสาร", "เปิดเอกสาร"], ["รายชื่อและผลประเมินผู้ปฏิบัติงาน", data?.training?.total ? "มีข้อมูล" : "รอบันทึก", "เปิดการฝึกอบรม"]].map((item) => <article key={item[0]}><i>○</i><span><b>{item[0]}</b><small>{item[1]}</small></span><button onClick={() => toast(item[2])}>{item[2]}</button></article>)}</section><section className="v2-panel v2-program-preview"><header><div><span>แหล่งข้อมูล</span><h3>สถานะความน่าเชื่อถือ</h3></div></header><strong>3</strong><span>ระดับข้อมูล</span><p>ยืนยันจากเอกสาร · นำเข้ารอตรวจ · บันทึกในระบบ</p><a href="/linna?view=documents">ดูเอกสาร</a></section></div>
          </>}
          {view === "business" && <><section className="v2-kicker-row"><div><span>บริการและหลักฐาน</span><h2>ใช้เฉพาะข้อมูลที่ผ่านการยืนยัน</h2><p>เมนูและแนวทางที่ยังเป็นฉบับร่างต้องให้ LINNA และ BIB ตรวจทานก่อนใช้</p></div><a href="/linna?view=treatments">เปิดเมนูฉบับร่าง</a></section><section className="v2-evidence-loop"><span>การเก็บผลลัพธ์</span><h3>บริการจริง → ขอความยินยอม → เก็บผล → ตรวจคุณภาพ → ใช้เป็นหลักฐาน</h3><p>ระบบจะไม่สรุปผลหรือคำกล่าวอ้างจนกว่าผู้รับผิดชอบจะตรวจและอนุมัติ</p></section></>}
          {view === "academy" && <><section className="v2-kicker-row"><div><span>การฝึกอบรม</span><h2>ความพร้อมของผู้ปฏิบัติงาน</h2><p>แสดงเฉพาะรายชื่อ ผลประเมิน และใบรับรองที่บันทึกจริง</p></div><em>{data?.training?.total ? `${data.training.total} คน` : "ยังไม่มีข้อมูลยืนยัน"}</em></section><section className="v2-evidence-loop"><span>สถานะ</span><h3>{data?.training?.total ? `ผ่านการประเมิน ${data.training.completed || 0} จาก ${data.training.total} คน` : "รอบันทึกรายชื่อและผลประเมิน"}</h3><p>กรุณาเพิ่มผู้ปฏิบัติงานและแนบผลการฝึกอบรมก่อนแสดงความพร้อม</p></section></>}
          {view === "support" && <><section className="v2-kicker-row"><div><span>บริการหลังการขาย</span><h2>เครื่อง การรับประกัน และบริการ</h2><p>แสดงสถานะจากทะเบียนเครื่องและประวัติงานจริง</p></div><button onClick={() => toast("เปิดแบบฟอร์มแจ้งปัญหาแล้ว")}>＋ แจ้งปัญหา</button></section><div className="v2-support-grid">
            {[["เครื่องและการรับประกัน", data?.deployment?.model || "icoone Laser Med", data?.warranty ? `${data.warranty.starts_at} – ${data.warranty.ends_at}` : "รอหมายเลขเครื่อง วันติดตั้ง และเอกสารรับประกัน"], ["ประวัติบริการ", `${data?.service?.total || 0} รายการเปิดอยู่`, "นับจากรายการที่บันทึกในระบบ"], ["การสั่งซื้อ", `${data?.orders?.total || 0} รายการ`, "ยังไม่คาดการณ์สต็อกจนกว่าจะมีข้อมูลการใช้จริง"], ["คลังความรู้", "เอกสารที่ได้รับสิทธิ์", "คู่มือและแนวทางที่ผ่านการควบคุม"]].map((item, index) => <article key={item[0]}><i>0{index + 1}</i><span>{item[0]}</span><h3>{item[1]}</h3><p>{item[2]}</p><button onClick={() => toast(`เปิด${item[0]}แล้ว`)}>เปิดข้อมูล</button></article>)}
          </div></>}
        </section>
      </div>
    </section>
    {notice && <div className="v2-toast">✓ {notice}</div>}
  </main>;
}
