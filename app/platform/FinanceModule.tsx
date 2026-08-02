"use client";

import { useEffect, useMemo, useState } from "react";

type Period = "monthly" | "quarterly" | "yearly";
type FinanceRow = {
  period_month: string; revenue_satang: number; cogs_satang: number; gross_profit_satang: number;
  opex_satang: number; net_profit_satang: number; entry_method: string; status: string; months: number;
};
type FinanceDocument = {
  id: string; document_type: string; period_start: string; period_end: string; file_name: string;
  object_key: string; source_sheet: string; status: string; review_note: string; created_at: string;
};
type Payload = {
  rows: FinanceRow[]; totals: Omit<FinanceRow, "period_month" | "entry_method" | "status" | "months">;
  documents: FinanceDocument[]; year: string; period: Period;
};

const periodLabels: Record<Period, string> = { monthly: "รายเดือน", quarterly: "รายไตรมาส", yearly: "รายปี" };
const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const baht = (satang: number) => new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(Number(satang || 0) / 100);
const percent = (part: number, total: number) => total ? `${((part / total) * 100).toFixed(1)}%` : "—";
function periodName(value: string) {
  if (value.includes("-Q")) return `ไตรมาส ${value.slice(-1)} · ${Number(value.slice(0, 4)) + 543}`;
  if (/^20\d{2}-\d{2}$/.test(value)) return `${monthNames[Number(value.slice(5, 7)) - 1]} ${Number(value.slice(0, 4)) + 543}`;
  return `ปี ${Number(value) + 543}`;
}

export default function FinanceModule({ toast }: { toast: (message: string) => void }) {
  const [period, setPeriod] = useState<Period>("monthly");
  const [year, setYear] = useState("2026");
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEntry, setShowEntry] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [entry, setEntry] = useState({ periodMonth: "2026-06", revenue: "", cogs: "", opex: "", note: "" });
  const [upload, setUpload] = useState({ documentType: "งบทดลองรายเดือน", periodStart: "2026-06-01", periodEnd: "2026-06-30" });
  const [file, setFile] = useState<File | null>(null);

  const load = () => {
    setLoading(true);
    fetch(`/api/finance?period=${period}&year=${year}`, { cache: "no-store" }).then(async (response) => {
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "โหลดข้อมูลไม่สำเร็จ");
      setData(payload);
    }).catch((error) => toast(error instanceof Error ? error.message : "โหลดข้อมูลไม่สำเร็จ")).finally(() => setLoading(false));
  };
  useEffect(load, [period, year]);

  const maxRevenue = useMemo(() => Math.max(...(data?.rows || []).map((row) => Math.abs(row.revenue_satang)), 1), [data]);
  const saveEntry = async () => {
    const response = await fetch("/api/finance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry) });
    const payload = await response.json();
    if (!response.ok) return toast(payload.error || "บันทึกไม่สำเร็จ");
    toast("บันทึกยอดแล้ว และส่งเข้ารอตรวจสอบ"); setShowEntry(false); load();
  };
  const uploadFile = async () => {
    if (!file) return toast("กรุณาเลือกไฟล์");
    const form = new FormData();
    form.set("file", file); form.set("documentType", upload.documentType); form.set("periodStart", upload.periodStart); form.set("periodEnd", upload.periodEnd);
    const response = await fetch("/api/finance/files", { method: "POST", body: form });
    const payload = await response.json();
    if (!response.ok) return toast(payload.error || "อัปโหลดไม่สำเร็จ");
    toast("จัดเก็บไฟล์แล้ว และส่งเข้ารอตรวจสอบ"); setShowUpload(false); setFile(null); load();
  };

  const totals = data?.totals || { revenue_satang: 0, cogs_satang: 0, gross_profit_satang: 0, opex_satang: 0, net_profit_satang: 0 };
  return <div className="v2-view v2-finance-view">
    <section className="v2-kicker-row"><div><span>EXECUTIVE FINANCE · ACTUAL</span><h2>ภาพรวมการเงิน icoone</h2><p>แยกข้อมูลจริงออกจากงบประมาณและประมาณการ</p></div><div className="v2-finance-actions"><button onClick={() => setShowUpload(!showUpload)}>แนบไฟล์</button><button className="primary" onClick={() => setShowEntry(!showEntry)}>＋ กรอกยอด</button></div></section>
    <section className="v2-finance-filter"><div>{(["monthly", "quarterly", "yearly"] as Period[]).map((item) => <button className={period === item ? "active" : ""} onClick={() => setPeriod(item)} key={item}>{periodLabels[item]}</button>)}</div><label>ปี<select value={year} onChange={(event) => setYear(event.target.value)}><option value="2026">2569</option></select></label><em>{loading ? "กำลังโหลด" : `ข้อมูลถึง ${data?.documents[0]?.period_end || "ยังไม่มีข้อมูล"}`}</em></section>
    {showEntry && <section className="v2-finance-form"><header><div><span>MANUAL ENTRY</span><h3>บันทึกยอดสรุปประจำเดือน</h3></div><em>สถานะเริ่มต้น: รอตรวจสอบ</em></header><div><label>รอบเดือน<input type="month" value={entry.periodMonth} onChange={(event) => setEntry({ ...entry, periodMonth: event.target.value })} /></label><label>รายได้<input type="number" value={entry.revenue} onChange={(event) => setEntry({ ...entry, revenue: event.target.value })} /></label><label>ต้นทุนขาย<input type="number" value={entry.cogs} onChange={(event) => setEntry({ ...entry, cogs: event.target.value })} /></label><label>ค่าใช้จ่ายดำเนินงาน<input type="number" value={entry.opex} onChange={(event) => setEntry({ ...entry, opex: event.target.value })} /></label><label className="wide">หมายเหตุ<input value={entry.note} onChange={(event) => setEntry({ ...entry, note: event.target.value })} placeholder="ที่มาและรายการปรับปรุง" /></label><button onClick={saveEntry}>บันทึกและส่งตรวจ</button></div></section>}
    {showUpload && <section className="v2-finance-form"><header><div><span>DOCUMENT REGISTER</span><h3>จัดเก็บไฟล์การเงินตามช่วงเวลา</h3></div><em>ไฟล์เก็บแยกจากตัวเลขที่ค้นหา</em></header><div><label>ประเภทเอกสาร<input value={upload.documentType} onChange={(event) => setUpload({ ...upload, documentType: event.target.value })} /></label><label>เริ่มรอบ<input type="date" value={upload.periodStart} onChange={(event) => setUpload({ ...upload, periodStart: event.target.value })} /></label><label>สิ้นสุดรอบ<input type="date" value={upload.periodEnd} onChange={(event) => setUpload({ ...upload, periodEnd: event.target.value })} /></label><label className="wide">ไฟล์<input type="file" accept=".xlsx,.xls,.csv,.pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} /></label><button onClick={uploadFile}>อัปโหลดและส่งตรวจ</button></div></section>}
    <div className="v2-metrics v2-finance-metrics">
      {[[baht(totals.revenue_satang), "รายได้", `ช่วง ${periodLabels[period]} · ${year}`], [baht(totals.gross_profit_satang), "กำไรขั้นต้น", `อัตรา ${percent(totals.gross_profit_satang, totals.revenue_satang)}`], [baht(totals.net_profit_satang), "กำไรสุทธิ", `อัตรา ${percent(totals.net_profit_satang, totals.revenue_satang)}`], [baht(totals.opex_satang), "ค่าใช้จ่ายดำเนินงาน", "ยังไม่รวมข้อมูลเดือนที่ไม่มีในระบบ"]].map((item, index) => <article key={item[1]}><i>0{index + 1}</i><strong className={String(item[0]).includes("-") ? "negative" : ""}>{item[0]}</strong><span>{item[1]}</span><small>{item[2]}</small></article>)}
    </div>
    <section className="v2-finance-table"><header><div><span>PROFIT & LOSS</span><h3>{periodLabels[period]} · ปี {Number(year) + 543}</h3></div><em>ยอดไม่รวม VAT · รอตรวจสอบ</em></header><div className="head"><span>ช่วงเวลา</span><span>รายได้</span><span>ต้นทุนขาย</span><span>กำไรขั้นต้น</span><span>ค่าใช้จ่าย</span><span>กำไรสุทธิ</span><span>สถานะ</span></div>{data?.rows.map((row) => <article key={row.period_month}><span><b>{periodName(row.period_month)}</b><i><em style={{ width: `${Math.max(Math.abs(row.revenue_satang) / maxRevenue * 100, 2)}%` }} /></i></span><strong>{baht(row.revenue_satang)}</strong><span>{baht(row.cogs_satang)}</span><span>{baht(row.gross_profit_satang)}<small>{percent(row.gross_profit_satang, row.revenue_satang)}</small></span><span>{baht(row.opex_satang)}</span><strong className={row.net_profit_satang < 0 ? "negative" : "positive"}>{baht(row.net_profit_satang)}</strong><em>{row.status}</em></article>)}{!loading && !data?.rows.length && <p>ยังไม่มีข้อมูลในช่วงเวลานี้</p>}</section>
    <section className="v2-finance-documents"><header><div><span>SOURCE REGISTER</span><h3>แฟ้มข้อมูลการเงิน</h3></div><em>เก็บช่วงเวลา รุ่นเอกสาร และสถานะตรวจสอบ</em></header><div className="head"><span>เอกสาร</span><span>ช่วงเวลา</span><span>แหล่งข้อมูล</span><span>สถานะ</span></div>{data?.documents.map((document) => <article key={document.id}><span><b>{document.file_name}</b><small>{document.document_type}</small></span><span>{document.period_start} – {document.period_end}</span><span>{document.source_sheet || (document.object_key ? "ไฟล์จัดเก็บในระบบ" : "ทะเบียนจากไฟล์ต้นทาง")}</span><em>{document.status}</em></article>)}</section>
    <section className="v2-data-quality-note"><b>ขอบเขตข้อมูล</b><span>ข้อมูลจริงปัจจุบันมาจากงบทดลองเดือนมกราคม–พฤษภาคม 2569 ไม่ควรรวมกับงบประมาณหรือประมาณการ และยังต้องให้ฝ่ายการเงินตรวจสอบก่อนใช้ตัดสินใจภายนอก</span></section>
  </div>;
}
