"use client";

import { useState } from "react";

type InternalView = "today" | "crm" | "approval" | "performance";

const workspaces: Array<[InternalView, string, string, string]> = [
  ["today", "01", "งานวันนี้", "สิ่งที่ต้องตัดสินใจและติดตาม"],
  ["crm", "02", "ลูกค้าและโอกาสขาย", "บุคคล องค์กร และขั้นตอนถัดไป"],
  ["approval", "03", "ข้อเสนอและการอนุมัติ", "Commercial Model และเอกสาร"],
  ["performance", "04", "ผลการดำเนินงาน", "Forecast คุณภาพ และความเสี่ยง"],
];

const leads = [
  ["โรงพยาบาลกรุงเทพ เชียงใหม่", "Demo", "75", "ส่ง Term Sheet แบบ A", "วันนี้"],
  ["Dr. J Clinic", "Contract", "60", "ขอข้อมูลยืนยันตัวตน", "วันนี้"],
  ["พญ.นภัส", "MQL", "45", "ส่ง Evidence Room", "1 ส.ค."],
  ["LINNA Clinic", "Active", "100", "ตรวจรายงานรายได้", "2 ส.ค."],
  ["Wellness Resort", "Negotiation", "55", "ยืนยันผู้ตัดสินใจ", "4 ส.ค."],
];

function BrandHeader({ area }: { area: string }) {
  return (
    <header className="v2-brand-header">
      <a href="/platform" className="v2-brand-lockup">
        <img src="/logos/bib-logo.png" alt="BIB" />
        <span />
        <img src="/logos/icoone-laser-med.png" alt="icoone laser med" />
      </a>
      <div className="v2-brand-copy"><b>PRACTICE INTELLIGENCE</b><span>Knowledge to decision · Decision to better practice</span></div>
      <nav aria-label="เลือกพื้นที่ใช้งาน">
        <a className="active" href="/platform">สำหรับทีม BIB</a>
        <a href="/explore">สำหรับผู้สนใจ</a>
        <a href="/client">สำหรับลูกค้า</a>
      </nav>
      <em>{area}</em>
    </header>
  );
}

export default function InternalPlatformPage() {
  const [view, setView] = useState<InternalView>("today");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const toast = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 2200);
  };
  const visibleLeads = leads.filter((lead) => lead.join(" ").toLowerCase().includes(query.toLowerCase()));

  return (
    <main className="v2-shell">
      <BrandHeader area="INTERNAL · RESTRICTED" />

      <section className="v2-layout">
        <aside className="v2-job-nav">
          <span>CHOOSE A JOB TO DO</span>
          <h2>พื้นที่ทำงาน</h2>
          <p>แสดงเฉพาะงานตามหน้าที่และสิทธิ์</p>
          <nav>
            {workspaces.map(([id, no, title, text]) => (
              <button key={id} className={view === id ? "active" : ""} onClick={() => setView(id)}>
                <i>{no}</i><span><b>{title}</b><small>{text}</small></span><em>↗</em>
              </button>
            ))}
          </nav>
          <div className="v2-control-note"><b>หลักควบคุม</b><p>ระบบช่วยสรุปและจัดลำดับ ส่วนผู้มีอำนาจเป็นผู้อนุมัติ</p></div>
        </aside>

        <div className="v2-work">
          <section className="v2-intro v2-module-hero">
            <div><span>ศูนย์ปฏิบัติงานภายใน</span><h1>เริ่มจากสิ่งที่ต้องทำ<br />ไม่ใช่เริ่มจากเมนู</h1><p>ข้อมูลลูกค้า ข้อเสนอ สัญญา และงานหลังการขายอยู่ในเส้นทางเดียวกัน</p></div>
            <aside><b>6</b><span>เรื่องที่ต้องตัดสินใจวันนี้</span><button onClick={() => setView("approval")}>เปิดรายการอนุมัติ</button></aside>
          </section>
          <header className="v2-work-head">
            <div><span>BIB INTERNAL WORKSPACE</span><h2>{workspaces.find(([id]) => id === view)?.[2]}</h2></div>
            <label><i>⌕</i><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาลูกค้า งาน หรือเอกสาร" /></label>
            <button onClick={() => toast("เปิดแบบฟอร์มสร้างรายการใหม่แล้ว")}>＋ สร้างรายการ</button>
          </header>

          {view === "today" && <TodayView changeView={setView} toast={toast} />}
          {view === "crm" && <CrmView leads={visibleLeads} toast={toast} />}
          {view === "approval" && <ApprovalView toast={toast} />}
          {view === "performance" && <PerformanceView />}
        </div>
      </section>
      {notice && <div className="v2-toast">✓ {notice}</div>}
    </main>
  );
}

function TodayView({ changeView, toast }: { changeView: (view: InternalView) => void; toast: (text: string) => void }) {
  return <div className="v2-view">
    <section className="v2-kicker-row"><div><span>TODAY · 31 JUL 2026</span><h2>ภาพรวมที่นำไปสู่การลงมือทำ</h2><p>เรียงตามผลกระทบต่อรายได้ ความเสี่ยง และกำหนดเวลา</p></div><em>ข้อมูลทดสอบ</em></section>
    <div className="v2-metrics">
      {[["14", "ผู้สนใจที่ต้องติดตาม", "Hot 5 · Warm 9"], ["8", "นัดสาธิตสัปดาห์นี้", "นอกสถานที่ 3"], ["฿8.9M", "Pipeline ที่มีน้ำหนัก", "เพิ่มขึ้น 12%"], ["6", "รายการรออนุมัติ", "ครบกำหนดวันนี้ 2"]].map((item, index) => <article key={item[1]}><i>0{index + 1}</i><strong>{item[0]}</strong><span>{item[1]}</span><small>{item[2]}</small></article>)}
    </div>
    <div className="v2-split">
      <section className="v2-panel v2-action-list"><header><div><span>NEXT BEST ACTION</span><h3>สิ่งที่ต้องทำวันนี้</h3></div><button onClick={() => changeView("crm")}>ดูลูกค้าทั้งหมด</button></header>
        {[
          ["LINNA", "ตรวจข้อยกเว้นเงินประกัน", "การเงิน · วันนี้"],
          ["Dr. J Clinic", "ตรวจข้อมูลก่อนส่งสัญญาแบบ B", "กฎหมาย · วันนี้"],
          ["Bangkok Hospital Chiangmai", "ทบทวน Term Sheet แบบ A", "ฝ่ายขาย · 1 ส.ค."],
          ["CCME Leads", "คัดเลือก 5 รายสำหรับการสาธิต", "ฝ่ายขาย · 2 ส.ค."],
        ].map((item, index) => <button className="v2-action" key={item[1]} onClick={() => toast(`เปิดงาน ${item[0]}`)}><i>{index + 1}</i><span><small>{item[0]}</small><b>{item[1]}</b><em>{item[2]}</em></span><strong>→</strong></button>)}
      </section>
      <section className="v2-panel v2-pipeline"><header><div><span>PIPELINE</span><h3>มูลค่าตามขั้นตอน</h3></div><button onClick={() => changeView("performance")}>ดูประมาณการ</button></header>
        {[["นัดสาธิต", "฿6.45M", 82], ["เสนอราคา", "฿8.55M", 69], ["เจรจา", "฿4.30M", 48], ["ทำสัญญา", "฿2.15M", 34]].map((item) => <div key={item[0]}><span>{item[0]}</span><i><b style={{ width: `${item[2]}%` }} /></i><strong>{item[1]}</strong></div>)}
      </section>
    </div>
    <section className="v2-panel v2-progress"><header><div><span>END-TO-END JOURNEY</span><h3>สถานะการทำงานทั้งระบบ</h3></div><em>8 ขั้นตอน</em></header><div>{["รับ Lead", "ประเมิน", "สาธิต", "เสนอเงื่อนไข", "ทำสัญญา", "ส่งมอบ", "ฝึกอบรม", "ดูแลต่อเนื่อง"].map((label, index) => <article className={index < 5 ? "done" : index === 5 ? "current" : ""} key={label}><i>{index < 5 ? "✓" : index + 1}</i><span>{label}</span></article>)}</div></section>
  </div>;
}

function CrmView({ leads, toast }: { leads: string[][]; toast: (text: string) => void }) {
  return <div className="v2-view">
    <section className="v2-kicker-row"><div><span>CRM · PERSON → ORGANIZATION → OPPORTUNITY</span><h2>เห็นความสัมพันธ์ก่อนเห็นยอดขาย</h2><p>Contact อยู่ในระบบได้แม้ยังไม่มี Account และไม่จำเป็นต้องเป็นลูกค้าเสมอไป</p></div><button onClick={() => toast("เปิดแบบฟอร์มเพิ่มผู้ติดต่อแล้ว")}>＋ เพิ่มผู้ติดต่อ</button></section>
    <div className="v2-lifecycle">{[["ผู้สนใจ", "28"], ["MQL", "14"], ["นัดสาธิต", "8"], ["เสนอราคา", "5"], ["เจรจา", "3"], ["ทำสัญญา", "2"]].map((item, index) => <article key={item[0]}><i>0{index + 1}</i><strong>{item[1]}</strong><span>{item[0]}</span></article>)}</div>
    <section className="v2-panel v2-table"><header><div><span>CONTACT & ACCOUNT VIEW</span><h3>รายการที่ต้องติดตาม</h3></div><em>{leads.length} รายการ</em></header>
      <div className="v2-table-head"><span>บุคคลหรือองค์กร</span><span>สถานะ</span><span>คะแนน</span><span>ขั้นตอนถัดไป</span><span>กำหนด</span></div>
      {leads.map((lead) => <button key={lead[0]} onClick={() => toast(`เปิดข้อมูล ${lead[0]}`)}><span><b>{lead[0]}</b><small>เปิดข้อมูล 360°</small></span><em>{lead[1]}</em><strong>{lead[2]}</strong><span>{lead[3]}</span><time>{lead[4]}</time></button>)}
    </section>
    <section className="v2-segmentation"><article><span>PERSON</span><h3>บุคคล</h3><p>บทบาท อิทธิพลต่อการตัดสินใจ และความสนใจ</p></article><article><span>ORGANIZATION</span><h3>องค์กร</h3><p>ประเภทธุรกิจ สถานที่ และความพร้อม</p></article><article><span>RELATIONSHIP</span><h3>ความสัมพันธ์</h3><p>ผู้สนใจ ลูกค้า Supplier หรือ Ecosystem</p></article></section>
  </div>;
}

function ApprovalView({ toast }: { toast: (text: string) => void }) {
  return <div className="v2-view">
    <section className="v2-kicker-row"><div><span>COMMERCIAL & DOCUMENT CONTROL</span><h2>อนุมัติเงื่อนไขก่อนสร้างเอกสาร</h2><p>ลูกค้าเห็นเฉพาะรูปแบบที่ผ่านการประเมินและอนุมัติแล้ว</p></div><a href="/term-templates">สร้าง Term Sheet</a></section>
    <div className="v2-model-row">{[["A", "ซื้อแบบแบ่งชำระ", "มาตรฐาน"], ["B", "เช่าเพื่อซื้อ", "ต้องอนุมัติ"], ["C", "แบ่งรายได้ + MG", "ประเมิน Traffic"], ["D", "โครงการทดลอง", "ไม่เกิน 90 วัน"], ["D2", "พันธมิตรเชิงกลยุทธ์", "จำกัดสิทธิ์"]].map((item) => <article key={item[0]}><i>{item[0]}</i><span>{item[2]}</span><h3>{item[1]}</h3><button onClick={() => toast(`เปิดแบบประเมินรูปแบบ ${item[0]}`)}>ประเมินความเหมาะสม</button></article>)}</div>
    <div className="v2-split">
      <section className="v2-panel v2-approval-list"><header><div><span>PENDING DECISION</span><h3>รายการรออนุมัติ</h3></div><em>6 รายการ</em></header>
        {[["LINNA", "ยกเว้นเงินประกัน", "ผู้บริหาร + การเงิน"], ["Dr. J", "สัญญาเช่าเพื่อซื้อ แบบ B", "กฎหมาย"], ["Bangkok Hospital Chiangmai", "Term Sheet แบบ A", "ฝ่ายขาย"], ["Commission Memo", "อัตราขั้นบันได", "ผู้บริหาร"]].map((item) => <button key={item[1]} onClick={() => toast(`เปิดรายการ ${item[0]}`)}><i>○</i><span><small>{item[0]}</small><b>{item[1]}</b><em>{item[2]}</em></span><strong>→</strong></button>)}
      </section>
      <section className="v2-document-gate"><span>DOCUMENT HEALTH</span><h3>อ่าน · แสดงความคิดเห็น<br />ขอแก้ไข · อนุมัติ</h3><p>เอกสารทุกฉบับมีผู้รับผิดชอบ รุ่น และประวัติการตัดสินใจ</p><a href="/">เปิดศูนย์ตรวจทานเอกสาร</a></section>
    </div>
  </div>;
}

function PerformanceView() {
  return <div className="v2-view">
    <section className="v2-kicker-row"><div><span>PERFORMANCE & QUALITY</span><h2>ตัวเลขที่เชื่อมกับงานจริง</h2><p>Pipeline, Commercial Model และงานบริการสะท้อนในประมาณการชุดเดียวกัน</p></div><em>อัปเดตล่าสุด 31 ก.ค.</em></section>
    <div className="v2-metrics">{[["฿8.9M", "รายได้ถ่วงน้ำหนัก", "Pipeline ฿21.4M"], ["42%", "กำไรขั้นต้น", "หลัง Commission/Service"], ["฿3.2M", "Revenue Share ARR", "แบบ C, D และ D2"], ["฿326K", "ประมาณการค่าตอบแทน", "รออนุมัติ 4 รายการ"]].map((item, index) => <article key={item[1]}><i>0{index + 1}</i><strong>{item[0]}</strong><span>{item[1]}</span><small>{item[2]}</small></article>)}</div>
    <div className="v2-split"><section className="v2-panel v2-pnl"><header><div><span>FORECAST P&L</span><h3>ประมาณการ 12 เดือน</h3></div></header>{[["รายได้ขายเครื่อง", "฿12,900,000"], ["รายได้แบ่งรายได้", "฿3,240,000"], ["ต้นทุนและการส่งมอบ", "(฿8,020,000)"], ["ค่าตอบแทน", "(฿326,000)"], ["Training/Service", "(฿740,000)"], ["กำไรประมาณการ", "฿7,054,000"]].map((item, index) => <p className={index === 5 ? "total" : ""} key={item[0]}><span>{item[0]}</span><strong>{item[1]}</strong></p>)}</section><section className="v2-panel v2-quality"><header><div><span>SYSTEM QUALITY</span><h3>สิ่งที่ต้องแก้ก่อนใช้จริง</h3></div><em>3 รายการ</em></header>{[["สูง", "สูตร Lead Score ใน Airtable ขึ้น Error"], ["สูง", "Dr. J ยังไม่มีข้อมูลนิติบุคคล"], ["กลาง", "LINNA ยังไม่มี Serial Number"]].map((item) => <article key={item[1]}><b>{item[0]}</b><span>{item[1]}</span><em>เปิดรายการ</em></article>)}</section></div>
  </div>;
}
