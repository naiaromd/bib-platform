"use client";

import { useState } from "react";

type InternalView = "today" | "crm" | "account" | "campaigns" | "approval" | "performance";

const workspaces: Array<[InternalView, string, string, string]> = [
  ["today", "01", "งานวันนี้", "สิ่งที่ต้องตัดสินใจและติดตาม"],
  ["crm", "02", "ลูกค้าและโอกาสขาย", "บุคคล องค์กร และขั้นตอนถัดไป"],
  ["campaigns", "03", "กิจกรรมและแคมเปญ", "Event Promotion และ Campaign"],
  ["approval", "04", "ข้อเสนอและการอนุมัติ", "รูปแบบธุรกิจและเอกสาร"],
  ["performance", "05", "ผลการดำเนินงาน", "เป้าหมาย คุณภาพ และความเสี่ยง"],
];

const leads = [
  { name: "โรงพยาบาลกรุงเทพ เชียงใหม่", status: "นัดสาธิต", score: 75, next: "ส่ง Term Sheet แบบ A", due: "วันนี้", owner: "ผู้รับผิดชอบ", segment: "โรงพยาบาล", model: "A", contact: "ฝ่ายจัดซื้อและทีมแพทย์", role: "ผู้ประเมินโครงการ", city: "เชียงใหม่", source: "การติดต่อโดยตรง", sourceId: "SRC-DIRECT", lastContact: "31 ก.ค. 2569", evidence: ["ยืนยันนิติบุคคล", "ประชุมเบื้องต้น", "ผู้มีอำนาจร่วมสาธิต"], risk: "ต้องยืนยันงบประมาณและรอบจัดซื้อ" },
  { name: "Dr. J Clinic", status: "ตรวจสัญญา", score: 60, next: "ขอข้อมูลยืนยันตัวตน", due: "วันนี้", owner: "ผู้รับผิดชอบ", segment: "คลินิกความงาม", model: "B", contact: "Dr. J", role: "แพทย์และผู้ตัดสินใจ", city: "กรุงเทพฯ", source: "การแนะนำ", sourceId: "SRC-REFERRAL", lastContact: "31 ก.ค. 2569", evidence: ["แพทย์เป็นผู้ตัดสินใจ", "ขอเอกสารสัญญา", "แจ้งสถานที่ติดตั้งแล้ว"], risk: "ทำสัญญาในนามบุคคล ต้องตรวจรายได้และเครดิต" },
  { name: "Modiolistics Clinic", status: "ติดต่อแล้ว", score: 35, next: "เชิญร่วมงาน CME และโทรติดตาม", due: "4 ส.ค.", owner: "ผู้รับผิดชอบ", segment: "คลินิกความงาม", model: "ยังไม่เลือก", contact: "ผู้รับผิดชอบ", role: "แพทย์", city: "กรุงเทพฯ", source: "CME Evidence Outreach", sourceId: "CMP-2608-01", lastContact: "10 ส.ค. 2568", evidence: ["ยืนยันสถานประกอบการ", "มีข้อมูลผู้ติดต่อ", "ติดต่อแล้ว"], risk: "ยังไม่มีการยืนยันนัดสาธิต" },
  { name: "Citycare Clinic", status: "สนใจสาธิต", score: 70, next: "ยืนยันวันสาธิตนอกสถานที่", due: "5 ส.ค.", owner: "ผู้รับผิดชอบ", segment: "คลินิก", model: "ยังไม่เลือก", contact: "ผู้รับผิดชอบ", role: "ผู้ประสานงาน", city: "ภูเก็ต", source: "Phuket Demo Roadshow 2026", sourceId: "EVT-2605-01", lastContact: "พ.ค. 2569", evidence: ["ตอบรับการสาธิต", "แจ้งช่วงวันที่สะดวก", "มีกรณีใช้งานที่ต้องการทดลอง"], risk: "ต้องยืนยันว่าผู้มีอำนาจเข้าร่วม" },
  { name: "LINNA Clinic", status: "ลูกค้าที่ใช้งาน", score: 100, next: "ตรวจรายงานรายได้", due: "2 ส.ค.", owner: "ผู้รับผิดชอบ", segment: "เวลเนส", model: "D2", contact: "ผู้จัดการ LINNA", role: "ผู้ดูแลบัญชี", city: "กรุงเทพฯ", source: "ลูกค้าปัจจุบัน", sourceId: "SRC-CUSTOMER", lastContact: "31 ก.ค. 2569", evidence: ["ลงนามสัญญาแล้ว", "ติดตั้งและฝึกอบรมแล้ว", "ส่งรายงานรายได้"], risk: "ยอดวันที่ 29 พ.ค. ไม่ตรงกับรายงานสรุป" },
  { name: "Wholeness Way Clinic", status: "ขอนัดทดลอง", score: 50, next: "ติดตามคำเชิญทดลองเครื่อง", due: "6 ส.ค.", owner: "ผู้รับผิดชอบ", segment: "กายภาพบำบัด", model: "ยังไม่เลือก", contact: "ผู้รับผิดชอบ", role: "ผู้ประสานงาน", city: "กรุงเทพฯ", source: "ค้นหารายชื่อโดยทีมขาย", sourceId: "SRC-OUTBOUND", lastContact: "6 ส.ค. 2568", evidence: ["ขอข้อมูลเพิ่มเติม", "แจ้งผู้รับผิดชอบ", "ส่งอีเมลแล้ว"], risk: "ยังไม่ยืนยันผู้มีอำนาจและวันสาธิต" },
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
  const [selectedAccount, setSelectedAccount] = useState(leads[0]);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const toast = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 2200);
  };
  const visibleLeads = leads.filter((lead) => Object.values(lead).flat().join(" ").toLowerCase().includes(query.toLowerCase()));
  const openAccount = (account: typeof leads[number]) => { setSelectedAccount(account); setView("account"); };

  return (
    <main className="v2-shell">
      <BrandHeader area="ไนน์ · ผู้บริหารการขาย" />

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
          <div className="v2-control-note"><b>หลักควบคุม</b><p>ระบบช่วยสรุป ผู้มีอำนาจเป็นผู้อนุมัติ</p></div>
        </aside>

        <div className="v2-work">
          <header className="v2-work-head">
            <div><span>BIB INTERNAL WORKSPACE</span><h2>{workspaces.find(([id]) => id === view)?.[2]}</h2></div>
            <label><i>⌕</i><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาลูกค้า งาน หรือเอกสาร" /></label>
            <button onClick={() => toast("เปิดแบบฟอร์มสร้างรายการใหม่แล้ว")}>＋ สร้างรายการ</button>
          </header>
          {view === "today" && <TodayView changeView={setView} toast={toast} />}
          {view === "crm" && <CrmView leads={visibleLeads} toast={toast} openAccount={openAccount} />}
          {view === "account" && <AccountView account={selectedAccount} back={() => setView("crm")} openSource={() => setView("campaigns")} toast={toast} />}
          {view === "campaigns" && <CampaignView toast={toast} openAccount={openAccount} />}
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
    <section className="v2-user-dashboard"><div className="v2-user-identity"><i>น</i><span><small>สวัสดี</small><h2>ไนน์</h2><p>ภาพรวมสำหรับผู้บริหารการขาย · 1 ส.ค. 2569</p></span></div><div className="v2-user-focus"><small>สิ่งที่ควรดูเป็นอันดับแรก</small><b>3 Lead ต้องยืนยันขั้นตอนถัดไป</b><button onClick={() => changeView("crm")}>เปิดรายการ →</button></div></section>
    <section className="v2-kicker-row"><div><span>CURRENT DASHBOARD</span><h2>ภาพรวมของไนน์วันนี้</h2><p>เรียงตามกำหนดเวลา ความเสี่ยง และโอกาสสร้างรายได้</p></div><em>ข้อมูลต้นแบบ</em></section>
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

function CrmView({ leads: items, toast, openAccount }: { leads: typeof leads; toast: (text: string) => void; openAccount: (account: typeof leads[number]) => void }) {
  return <div className="v2-view">
    <section className="v2-kicker-row"><div><span>CRM · PERSON → ORGANIZATION → OPPORTUNITY</span><h2>ลูกค้าและโอกาสขาย</h2><p>ติดตามบุคคล องค์กร และขั้นตอนถัดไป</p></div><button onClick={() => toast("เปิดแบบฟอร์มเพิ่มผู้ติดต่อแล้ว")}>＋ เพิ่มผู้ติดต่อ</button></section>
    <div className="v2-lifecycle">{[["ผู้สนใจ", "28"], ["ผ่านเกณฑ์", "14"], ["นัดสาธิต", "8"], ["เสนอราคา", "5"], ["เจรจา", "3"], ["ทำสัญญา", "2"]].map((item, index) => <article key={item[0]}><i>0{index + 1}</i><strong>{item[1]}</strong><span>{item[0]}</span></article>)}</div>
    <section className="v2-panel v2-table"><header><div><span>CONTACT & ACCOUNT VIEW</span><h3>รายการที่ต้องติดตาม</h3></div><em>{leads.length} รายการ</em></header>
      <div className="v2-table-head"><span>บุคคลหรือองค์กร</span><span>สถานะ</span><span>คะแนน</span><span>ขั้นตอนถัดไป</span><span>กำหนด</span></div>
      {items.map((lead) => <button key={lead.name} onClick={() => openAccount(lead)}><span className="v2-contact-card"><i>{lead.contact.replace(/^(นพ\.|พญ\.|Dr\.\s*)/i, "").trim().slice(0, 2)}</i><span><b>{lead.contact}</b><small>{lead.name} · {lead.owner}</small></span></span><em>{lead.status}</em><strong>{lead.score}</strong><span>{lead.next}</span><time>{lead.due}</time></button>)}
    </section>
    <section className="v2-segmentation"><article><span>PERSON</span><h3>บุคคล</h3><p>บทบาท อิทธิพลต่อการตัดสินใจ และความสนใจ</p></article><article><span>ORGANIZATION</span><h3>องค์กร</h3><p>ประเภทธุรกิจ สถานที่ และความพร้อม</p></article><article><span>RELATIONSHIP</span><h3>ความสัมพันธ์</h3><p>ผู้สนใจ ลูกค้า Supplier หรือ Ecosystem</p></article></section>
  </div>;
}

function AccountView({ account, back, openSource, toast }: { account: typeof leads[number]; back: () => void; openSource: () => void; toast: (text: string) => void }) {
  const [tab, setTab] = useState<"overview" | "demo" | "offer" | "activity" | "comments">("overview");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Array<{ author: string; text: string; date: string }>>([{ author: "ผู้ดูแลบัญชี", text: `ขั้นตอนถัดไป: ${account.next}`, date: "วันนี้" }]);
  const addComment = () => { if (!comment.trim()) return; setComments([{ author: "ผู้รับผิดชอบ", text: comment.trim(), date: "ขณะนี้" }, ...comments]); setComment(""); };
  const tabs: Array<[typeof tab, string]> = [["overview", "ภาพรวม"], ["demo", "การสาธิต"], ["offer", "ข้อเสนอและสัญญา"], ["activity", "บันทึกการติดต่อ"], ["comments", `ความคิดเห็น ${comments.length}`]];
  return <div className="v2-view v2-account-view">
    <button className="v2-back" onClick={back}>← กลับไปรายชื่อลูกค้า</button>
    <section className="v2-account-head">
      <div><span>{account.segment} · ผู้ดูแล {account.owner}</span><h2>{account.name}</h2><p>รูปแบบธุรกิจ {account.model} · {account.status}</p></div>
      <aside><small>คะแนนความพร้อม</small><strong>{account.score}</strong><em>จากหลักฐาน {account.evidence.length} รายการ</em></aside>
    </section>
    <nav className="v2-account-tabs" aria-label="ข้อมูลลูกค้า">{tabs.map(([id, label]) => <button className={tab === id ? "active" : ""} onClick={() => setTab(id)} key={id}>{label}</button>)}</nav>

    {tab === "overview" && <div className="v2-account-grid">
      <section><div className="v2-profile-grid"><article><span>ผู้ติดต่อ</span><b>{account.contact}</b></article><article><span>บทบาท</span><b>{account.role}</b></article><article><span>พื้นที่</span><b>{account.city}</b></article><article className="source"><span>แหล่งที่มา · {account.sourceId}</span><b>{account.source}</b><button onClick={openSource}>ย้อนดูต้นทาง →</button></article><article><span>ติดต่อล่าสุด</span><b>{account.lastContact}</b></article><article><span>ผู้ดูแล</span><b>{account.owner}</b></article></div>
      <section className="v2-panel v2-signal-list"><header><div><span>QUALIFICATION SIGNALS</span><h3>เหตุผลที่ระบบให้คะแนน</h3></div><em>ตรวจสอบได้</em></header>
        {account.evidence.map((item, index) => <article key={item}><i>✓</i><span><b>{item}</b><small>{index === 0 ? "ข้อมูลที่ลูกค้ายืนยัน" : "บันทึกจากกิจกรรมล่าสุด"}</small></span><strong>+{index === 2 ? 10 : 5}</strong></article>)}
        <article className="risk"><i>!</i><span><b>ความเสี่ยงที่ต้องจัดการ</b><small>{account.risk}</small></span><strong>ตรวจ</strong></article>
      </section></section>
      <section className="v2-panel v2-next-card"><header><div><span>NEXT BEST ACTION</span><h3>ขั้นตอนถัดไป</h3></div></header><strong>{account.next}</strong><p>กำหนด {account.due} · ผู้รับผิดชอบ {account.owner}</p><button onClick={() => toast(`บันทึกงาน ${account.next} แล้ว`)}>บันทึกว่าเริ่มดำเนินการ</button><button className="secondary" onClick={() => setTab("activity")}>เพิ่มบันทึกการติดต่อ</button></section>
    </div>}

    {tab === "demo" && <div className="v2-account-grid">
      <section className="v2-panel v2-demo-readiness"><header><div><span>DEMO READINESS</span><h3>ประเมินก่อนออกสาธิตนอกสถานที่</h3></div><em>{account.score >= 60 ? "ผ่านเกณฑ์" : "ต้องทบทวน"}</em></header>
        {["ยืนยันวันและเวลาจากลูกค้า", "ผู้มีอำนาจหรือผู้มีอิทธิพลเข้าร่วม", "มีโครงการเปิดหรือขยายบริการ", "สถานที่และใบอนุญาตมีความพร้อม"].map((item, index) => <label key={item}><input type="checkbox" defaultChecked={index < (account.score >= 60 ? 3 : 2)} /><span>{item}</span></label>)}
      </section>
      <section className="v2-panel v2-next-card"><header><div><span>DEMO OPTIONS</span><h3>รูปแบบการสาธิต</h3></div></header><button onClick={() => toast("สร้างคำเชิญสาธิตที่สำนักงานแล้ว")}>ที่สำนักงาน BIB</button><button className="secondary" onClick={() => toast("ส่งคำขออนุมัติสาธิตนอกสถานที่แล้ว")}>นอกสถานที่ · ขออนุมัติค่าใช้จ่าย</button><p>การสาธิตนอกสถานที่ต้องผ่านเกณฑ์ความพร้อมและระบุผู้เข้าร่วม</p></section>
    </div>}

    {tab === "offer" && <div className="v2-account-grid">
      <section className="v2-panel v2-offer-summary"><header><div><span>APPROVED COMMERCIAL PATH</span><h3>เงื่อนไขที่เสนอได้</h3></div><em>แบบ {account.model}</em></header><div><span>สถานะ</span><b>{account.status}</b></div><div><span>รูปแบบธุรกิจ</span><b>{account.model}</b></div><div><span>ข้อยกเว้น</span><b>{account.model === "D2" ? "ไม่มี MG · VAT รวมในส่วนแบ่ง" : "ยังไม่มี"}</b></div><div><span>เอกสารฉบับล่าสุด</span><b>{account.model === "A" ? "Term Sheet A" : account.model === "B" ? "สัญญาเช่าเพื่อซื้อ" : "บันทึกเงื่อนไข"}</b></div></section>
      <section className="v2-panel v2-next-card"><header><div><span>DOCUMENT ACTION</span><h3>จัดทำเอกสาร</h3></div></header><button onClick={() => toast("เปิดแบบสร้างเอกสารจากแม่แบบแล้ว")}>สร้างเอกสารจากแม่แบบ</button><button className="secondary" onClick={() => toast("เปิดขั้นตอนตรวจทานและแสดงความคิดเห็นแล้ว")}>ส่งให้ลูกค้าตรวจทาน</button><p>ลูกค้าเห็นเฉพาะฉบับที่ได้รับอนุมัติและข้อมูลของตนเอง</p></section>
    </div>}

    {tab === "activity" && <div className="v2-account-grid">
      <section className="v2-panel v2-activity"><header><div><span>ACTIVITY TIMELINE</span><h3>ประวัติการติดต่อ</h3></div><button onClick={() => toast("เปิดแบบบันทึกด้วยเสียงแล้ว")}>🎙 บันทึกด้วยเสียง</button></header>{[["31 ก.ค.", account.next, account.owner], ["28 ก.ค.", "ส่งข้อมูลผลิตภัณฑ์และหลักฐาน", "ระบบ"], ["25 ก.ค.", "สนทนาหลังจบกิจกรรม", account.owner]].map((item) => <article key={item.join("")}><time>{item[0]}</time><span><b>{item[1]}</b><small>บันทึกโดย {item[2]}</small></span></article>)}</section>
      <section className="v2-panel v2-next-card"><header><div><span>QUICK NOTE</span><h3>เพิ่มบันทึก</h3></div></header><textarea placeholder="สรุปสิ่งที่คุย ความกังวล และขั้นตอนถัดไป" /><button onClick={() => toast("บันทึกกิจกรรมและกำหนดงานถัดไปแล้ว")}>บันทึกพร้อมกำหนดงานถัดไป</button></section>
    </div>}
    {tab === "comments" && <div className="v2-account-grid">
      <section className="v2-panel v2-comments"><header><div><span>TEAM COMMENTS</span><h3>ความคิดเห็นต่อ Lead รายนี้</h3></div><em>{comments.length} รายการ</em></header>{comments.map((item, index) => <article key={`${item.date}-${index}`}><i>{item.author.slice(0, 1)}</i><span><b>{item.author}</b><p>{item.text}</p><small>{item.date}</small></span></article>)}</section>
      <section className="v2-panel v2-comment-compose"><header><div><span>ADD COMMENT</span><h3>เพิ่มความคิดเห็น</h3></div></header><textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="ระบุข้อสังเกต ความเสี่ยง หรือข้อเสนอแนะ" /><button onClick={addComment}>ส่งความคิดเห็น</button><p>ความคิดเห็นนี้เป็นข้อมูลภายใน ลูกค้าจะไม่เห็น</p></section>
    </div>}
  </div>;
}

function CampaignView({ toast, openAccount }: { toast: (text: string) => void; openAccount: (account: typeof leads[number]) => void }) {
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const campaigns = [
    { id: "EVT-2605-01", type: "EVENT", name: "Phuket Demo Roadshow", date: "25–30 พ.ค. 2569", owner: "ผู้รับผิดชอบ", leads: 10, qualified: 3, customers: 0, result: "Citycare Clinic สนใจสาธิต", status: "ติดตามผล", lead: leads.find((item) => item.name === "Citycare Clinic")! },
    { id: "EVT-WEBINAR", type: "EVENT", name: "Beauty Innovation Trend Webinar", date: "ข้อมูลจากแผ่นงาน Webinar", owner: "ผู้รับผิดชอบ", leads: 27, qualified: 0, customers: 0, result: "ต้องคัดกรองผู้ลงทะเบียน", status: "รอคัดกรอง", lead: leads.find((item) => item.name === "Modiolistics Clinic")! },
    { id: "CMP-2608-01", type: "CAMPAIGN", name: "CME Evidence Outreach", date: "ส.ค.–ก.ย. 2569", owner: "ผู้รับผิดชอบ", leads: 1, qualified: 1, customers: 0, result: "รอกำหนดเป้าหมายหลังอนุมัติ", status: "กำลังดำเนินการ", lead: leads.find((item) => item.name === "Modiolistics Clinic")! },
    { id: "PRO-2608-01", type: "PROMOTION", name: "Model A Event Offer", date: "สิ้นสุด 31 ส.ค. 2569", owner: "ผู้รับผิดชอบ", leads: 1, qualified: 1, customers: 0, result: "ราคา 2.15 ล้านบาท · 10 งวด", status: "รออนุมัติ", lead: leads.find((item) => item.name === "Dr. J Clinic")! },
  ];
  return <div className="v2-view">
    <section className="v2-kicker-row"><div><span>EVENT · PROMOTION · CAMPAIGN</span><h2>กิจกรรมที่ต้องสร้างผลลัพธ์</h2><p>ทุกกิจกรรมต้องมีเป้าหมาย ผู้ดูแล Lead และการติดตามผล</p></div><button onClick={() => toast("เปิดแบบสร้างกิจกรรมแล้ว")}>＋ สร้างกิจกรรม</button></section>
    <div className="v2-campaign-summary">{[["4", "แหล่ง Lead ที่กำลังติดตาม"], ["39", "Lead ที่ตรวจพบในต้นแบบ"], ["5", "ผ่านเกณฑ์เบื้องต้น"], ["3", "ผู้รับผิดชอบจากตารางเดิม"]].map((item) => <article key={item[1]}><strong>{item[0]}</strong><span>{item[1]}</span></article>)}</div>
    <section className="v2-source-table"><header><div><span>LEAD SOURCE PERFORMANCE</span><h3>ย้อนจาก Lead ถึงต้นทางและต้นทุน</h3></div><em>ค่าใช้จ่ายที่ยังไม่มีจะไม่คำนวณ</em></header><div className="head"><span>ต้นทาง</span><span>Lead</span><span>ผ่านเกณฑ์</span><span>ลูกค้า</span><span>ค่าใช้จ่าย</span><span>ต้นทุน/Lead</span><span>ต้นทุน/ลูกค้า</span></div>{campaigns.map((item) => { const cost = budgets[item.id] || 0; return <article key={item.id}><span><i>{item.id}</i><b>{item.name}</b><small>{item.type} · {item.owner}</small></span><strong>{item.leads}</strong><strong>{item.qualified}</strong><strong>{item.customers}</strong><label>฿<input aria-label={`ค่าใช้จ่าย ${item.name}`} type="number" min="0" placeholder="กรอก" value={budgets[item.id] || ""} onChange={(event) => setBudgets({ ...budgets, [item.id]: Number(event.target.value) })} /></label><em>{cost ? `฿${Math.round(cost / item.leads).toLocaleString("th-TH")}` : "รอข้อมูล"}</em><em>{cost && item.customers ? `฿${Math.round(cost / item.customers).toLocaleString("th-TH")}` : item.customers ? "฿0" : "ยังไม่มีลูกค้า"}</em></article>; })}</section>
    <section className="v2-campaign-list">{campaigns.map((item, index) => <article key={item.name}><i>0{index + 1}</i><div><span>{item.id} · {item.type} · {item.status}</span><h3>{item.name}</h3><p>{item.date} · ผู้ดูแล {item.owner}</p></div><dl><div><dt>จำนวน Lead</dt><dd>{item.leads} ราย</dd></div><div><dt>ผลล่าสุด</dt><dd>{item.result}</dd></div></dl><button onClick={() => openAccount(item.lead)}>ดู Lead ที่เกี่ยวข้อง →</button></article>)}</section>
    <section className="v2-owner-target"><header><div><span>SALES OWNERSHIP</span><h3>ผู้ดูแลตามตาราง Lead เดิม</h3></div><em>แหล่งข้อมูล: Lead Update.xlsx</em></header>{[["ผู้รับผิดชอบ", "พบชื่อในตารางรวม", "รอยืนยันเป้ารายบุคคล"], ["ผู้รับผิดชอบ", "มีแผ่นงานรายบุคคล", "รอยืนยันเป้ารายบุคคล"], ["ผู้รับผิดชอบ", "มีแผ่นงานรายบุคคลและ Roadshow", "รอยืนยันเป้ารายบุคคล"]].map((item) => <article key={item[0]}><i>{item[0].slice(0, 1)}</i><span><b>{item[0]}</b><small>{item[1]}</small></span><strong>{item[2]}</strong><button onClick={() => toast(`กรองรายการของ ${item[0]} แล้ว`)}>เปิดรายการ</button></article>)}</section>
  </div>;
}

function ApprovalView({ toast }: { toast: (text: string) => void }) {
  return <div className="v2-view">
    <section className="v2-kicker-row"><div><span>COMMERCIAL & DOCUMENT CONTROL</span><h2>อนุมัติก่อนออกเอกสาร</h2><p>ลูกค้าเห็นเฉพาะเงื่อนไขที่อนุมัติแล้ว</p></div><a href="/term-templates">สร้าง Term Sheet</a></section>
    <div className="v2-model-row">{[["A", "ซื้อแบบแบ่งชำระ", "มาตรฐาน"], ["B", "เช่าเพื่อซื้อ", "ต้องอนุมัติ"], ["C", "แบ่งรายได้ + MG", "ประเมิน Traffic"], ["D", "โครงการทดลอง", "ไม่เกิน 90 วัน"], ["D2", "พันธมิตรเชิงกลยุทธ์", "จำกัดสิทธิ์"]].map((item) => <article key={item[0]}><i>{item[0]}</i><span>{item[2]}</span><h3>{item[1]}</h3><button onClick={() => toast(`เปิดแบบประเมินรูปแบบ ${item[0]}`)}>ประเมินความเหมาะสม</button></article>)}</div>
    <div className="v2-split">
      <section className="v2-panel v2-approval-list"><header><div><span>PENDING DECISION</span><h3>รายการรออนุมัติ</h3></div><em>6 รายการ</em></header>
        {[["LINNA", "ยกเว้นเงินประกัน", "ผู้บริหาร + การเงิน"], ["Dr. J", "สัญญาเช่าเพื่อซื้อ แบบ B", "กฎหมาย"], ["Bangkok Hospital Chiangmai", "Term Sheet แบบ A", "ฝ่ายขาย"], ["Commission Memo", "อัตราขั้นบันได", "ผู้บริหาร"]].map((item) => <button key={item[1]} onClick={() => toast(`เปิดรายการ ${item[0]}`)}><i>○</i><span><small>{item[0]}</small><b>{item[1]}</b><em>{item[2]}</em></span><strong>→</strong></button>)}
      </section>
      <section className="v2-document-gate"><span>DOCUMENT HEALTH</span><h3>อ่าน · แก้ไข · อนุมัติ</h3><p>ติดตามรุ่น ผู้รับผิดชอบ และประวัติการอนุมัติ</p><a href="/">เปิดศูนย์ตรวจทานเอกสาร</a></section>
    </div>
  </div>;
}

function PerformanceView() {
  const [annualTarget, setAnnualTarget] = useState(8);
  const [sold, setSold] = useState(3);
  const [saved, setSaved] = useState(false);
  const remaining = Math.max(annualTarget - sold, 0);
  const monthsLeft = 5;
  const targetRevenue = annualTarget * 2150000;
  const bookedRevenue = sold * 2150000;
  const demosNeeded = remaining * 5;
  const qualifiedNeeded = Math.ceil(demosNeeded / .4);
  const newLeadsNeeded = qualifiedNeeded * 2;
  const sunaiTarget = Math.ceil(remaining / 3);
  const oiTarget = Math.ceil((remaining - sunaiTarget) / 2);
  const topTarget = Math.max(remaining - sunaiTarget - oiTarget, 0);
  return <div className="v2-view">
    <section className="v2-kicker-row"><div><span>PERFORMANCE & QUALITY</span><h2>ผลการดำเนินงาน</h2><p>รวมยอดขาย รูปแบบธุรกิจ และงานบริการ</p></div><em>อัปเดตล่าสุด 31 ก.ค.</em></section>
    <section className="v2-goal-builder">
      <header><div><span>ACTIONABLE SALES TARGET</span><h3>จากเป้าหมายยอดขายสู่งานที่ต้องทำ</h3><p>ระบบคำนวณย้อนกลับจากจำนวนเครื่องที่ต้องขาย</p></div><div className="v2-goal-inputs"><label>เป้าทั้งปี<input type="number" min="1" value={annualTarget} onChange={(event) => setAnnualTarget(Math.max(1, Number(event.target.value) || 1))} /></label><label>ขายแล้ว<input type="number" min="0" max={annualTarget} value={sold} onChange={(event) => setSold(Math.min(annualTarget, Math.max(0, Number(event.target.value) || 0)))} /></label></div></header>
      <div className="v2-goal-summary"><article><span>ต้องขายเพิ่ม</span><strong>{remaining}</strong><small>เครื่อง ภายใน {monthsLeft} เดือน</small></article><article><span>รายได้ที่ต้องเพิ่ม</span><strong>฿{(targetRevenue - bookedRevenue).toLocaleString("th-TH")}</strong><small>จากเป้ารวม ฿{targetRevenue.toLocaleString("th-TH")}</small></article><article><span>เป้าต่อเดือน</span><strong>{Math.ceil(remaining / monthsLeft)}</strong><small>เครื่อง หรือ ฿{Math.ceil((targetRevenue - bookedRevenue) / monthsLeft).toLocaleString("th-TH")}</small></article></div>
      <div className="v2-funnel-target">
        {[["01", "ผู้สนใจใหม่", newLeadsNeeded, `${Math.ceil(newLeadsNeeded / monthsLeft)} ราย/เดือน`], ["02", "ผู้สนใจที่ผ่านเกณฑ์", qualifiedNeeded, `${Math.ceil(qualifiedNeeded / monthsLeft)} ราย/เดือน`], ["03", "นัดสาธิต", demosNeeded, `${Math.ceil(demosNeeded / monthsLeft)} ครั้ง/เดือน`], ["04", "ข้อเสนอที่มีโอกาส", remaining * 2, `${Math.ceil((remaining * 2) / monthsLeft)} ฉบับ/เดือน`], ["05", "ปิดการขาย", remaining, `${Math.ceil(remaining / monthsLeft)} เครื่อง/เดือน`]].map((item, index) => <article key={item[1]}><i>{item[0]}</i><span><b>{item[1]}</b><small>{item[3]}</small></span><strong>{item[2]}</strong>{index < 4 && <em>→</em>}</article>)}
      </div>
      <div className="v2-action-breakdown"><article><span>งานสัปดาห์นี้</span><b>สร้างผู้สนใจใหม่ {Math.ceil(newLeadsNeeded / 20)} ราย</b><small>จากกิจกรรม ออนไลน์ และการแนะนำ</small></article><article><span>งานสัปดาห์นี้</span><b>ยืนยันนัดสาธิต {Math.ceil(demosNeeded / 20)} ราย</b><small>ให้ผู้มีอำนาจเข้าร่วมอย่างน้อย 1 ราย</small></article><article><span>งานบริหาร</span><b>ทบทวน Pipeline ทุกวันจันทร์</b><small>ทุกดีลต้องมีผู้ดูแลและขั้นตอนถัดไป</small></article><article><span>จุดเตือน</span><b>Pipeline ปัจจุบันยังไม่พอ {Math.max(remaining * 2 - 5, 0)} ดีล</b><small>ต้องเติมดีลที่ผ่านเกณฑ์ก่อนเพิ่ม Forecast</small></article></div>
      <section className="v2-sales-targets"><header><div><span>SALES TARGET BY OWNER</span><h4>ข้อเสนอการแบ่งเป้าตามผู้ดูแล</h4></div><em>คำแนะนำเบื้องต้น · ไม่ใช่เป้าที่อนุมัติแล้ว</em></header>{[["ผู้รับผิดชอบ", sunaiTarget], ["ผู้รับผิดชอบ", oiTarget], ["ผู้รับผิดชอบ", topTarget]].map((item) => <article key={item[0]}><i>{String(item[0]).slice(0, 1)}</i><span><b>{item[0]}</b><small>ต้องมีนัดสาธิตประมาณ {Number(item[1]) * 5} ครั้ง</small></span><strong>{item[1]} เครื่อง</strong></article>)}</section>
      <footer><span>สมมติฐาน: ผู้สนใจใหม่ 50% ผ่านเกณฑ์ · 40% ได้นัดสาธิต · สาธิต 20% ปิดการขาย</span><button onClick={() => setSaved(true)}>{saved ? "✓ บันทึกแล้ว" : "บันทึกเป็นเป้าหมายทีม"}</button></footer>
    </section>
    <div className="v2-metrics">{[["฿8.9M", "รายได้ถ่วงน้ำหนัก", "Pipeline ฿21.4M"], ["42%", "กำไรขั้นต้น", "หลังค่าตอบแทนและบริการ"], ["฿3.2M", "รายได้แบ่งรายได้ต่อปี", "แบบ C, D และ D2"], ["฿326K", "ประมาณการค่าตอบแทน", "รออนุมัติ 4 รายการ"]].map((item, index) => <article key={item[1]}><i>0{index + 1}</i><strong>{item[0]}</strong><span>{item[1]}</span><small>{item[2]}</small></article>)}</div>
    <div className="v2-split"><section className="v2-panel v2-pnl"><header><div><span>FORECAST P&L</span><h3>ประมาณการ 12 เดือน</h3></div></header>{[["รายได้ขายเครื่อง", "฿12,900,000"], ["รายได้แบ่งรายได้", "฿3,240,000"], ["ต้นทุนและการส่งมอบ", "(฿8,020,000)"], ["ค่าตอบแทน", "(฿326,000)"], ["Training/Service", "(฿740,000)"], ["กำไรประมาณการ", "฿7,054,000"]].map((item, index) => <p className={index === 5 ? "total" : ""} key={item[0]}><span>{item[0]}</span><strong>{item[1]}</strong></p>)}</section><section className="v2-panel v2-quality"><header><div><span>SYSTEM QUALITY</span><h3>สิ่งที่ต้องแก้ก่อนใช้จริง</h3></div><em>3 รายการ</em></header>{[["สูง", "สูตร Lead Score ใน Airtable ขึ้น Error"], ["สูง", "Dr. J ยังไม่มีข้อมูลนิติบุคคล"], ["กลาง", "LINNA ยังไม่มี Serial Number"]].map((item) => <article key={item[1]}><b>{item[0]}</b><span>{item[1]}</span><em>เปิดรายการ</em></article>)}</section></div>
  </div>;
}
