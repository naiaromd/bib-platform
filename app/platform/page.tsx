"use client";

import { useMemo, useState } from "react";

type View = "dashboard" | "crm" | "demo" | "commercial" | "activation" | "intelligence" | "finance" | "quality";
type Role = "ผู้บริหาร" | "ฝ่ายขาย" | "การเงิน" | "กฎหมาย" | "ผู้ฝึกอบรม" | "บริการ" | "ลูกค้า";

const nav: Array<[View, string, string]> = [
  ["dashboard", "⌂", "ภาพรวม"],
  ["crm", "◎", "CRM และลูกค้า"],
  ["demo", "◇", "การสาธิต"],
  ["commercial", "฿", "ข้อเสนอและสัญญา"],
  ["activation", "✓", "ส่งมอบและบริการ"],
  ["intelligence", "✦", "Client Intelligence"],
  ["finance", "▥", "ประมาณการและ P&L"],
  ["quality", "◈", "คุณภาพระบบ"],
];

const contacts = [
  { name: "พญ.นภัส", relation: "Marketing Qualified Lead", account: "ยังไม่เชื่อมองค์กร", role: "แพทย์ / ผู้ตัดสินใจ", score: 45, temperature: "Warm", next: "ส่ง Evidence Room", source: "CCME" },
  { name: "Dr. J", relation: "Opportunity", account: "Dr.J Clinic", role: "เจ้าของกิจการ", score: 60, temperature: "Hot", next: "ทบทวน Model B", source: "Referral" },
  { name: "ผู้รับผิดชอบ", relation: "Customer", account: "LINNA Clinic", role: "ผู้ดูแลบัญชี", score: 100, temperature: "Active", next: "ส่งรายงานเดือน ก.ค.", source: "Direct" },
  { name: "ผู้รับผิดชอบ", relation: "Supplier", account: "Wellness Supply Asia", role: "ผู้จัดการฝ่ายขาย", score: 0, temperature: "Partner", next: "ตรวจรายการสินค้า", source: "Ecosystem" },
  { name: "ผู้รับผิดชอบ", relation: "Ecosystem Contact", account: "Thai Wellness Network", role: "ผู้พัฒนาธุรกิจ", score: 20, temperature: "Network", next: "เชิญเข้าร่วมกิจกรรม", source: "INTWF" },
];

const scoreRules: Array<[string, number]> = [
  ["ยืนยันนิติบุคคลและข้อมูลติดต่อ", 10],
  ["ผู้ติดต่อเป็นผู้ตัดสินใจ", 5],
  ["มีการประชุมเบื้องต้น", 10],
  ["เข้าร่วมการสาธิต", 5],
  ["ผู้ตัดสินใจเข้าร่วมการสาธิต", 10],
  ["ขอใบเสนอราคา", 10],
  ["ส่งหนังสือรับรอง", 10],
  ["เปิด Evidence/Term Sheet ซ้ำ หรือเริ่มเจรจา", 10],
  ["เปิดใบแจ้งหนี้", 10],
  ["ชำระเงินครั้งแรกหรือลงนามหนังสือจะซื้อจะขาย", 20],
  ["ไม่มีการตอบกลับ 14 วัน", -10],
  ["เลื่อนการสาธิตมากกว่า 2 ครั้ง", -15],
  ["สถานที่หรือใบอนุญาตยังไม่พร้อม", -20],
];

const pipeline = [
  ["ผู้สนใจ", 28, "—"], ["MQL", 14, "—"], ["นัดสาธิต", 8, "฿6.45M"],
  ["เสนอราคา", 5, "฿8.55M"], ["เจรจา", 3, "฿4.30M"], ["ทำสัญญา", 2, "฿2.15M"],
];

const readiness = [
  ["CRM และ Segmentation", "พร้อมทดสอบ", "Contact/Account แยกกัน"],
  ["Demo Qualification", "พร้อมทดสอบ", "มีคะแนนและคำแนะนำ"],
  ["Commercial A–D2", "พร้อมทดสอบ", "มี Approval Gate"],
  ["Document Review", "พร้อมทดสอบ", "มี Comment และการตัดสินใจ"],
  ["Delivery/Warranty", "ต้นแบบ", "รอข้อมูลเครื่องจริง"],
  ["Client Intelligence", "ต้นแบบ", "40 Programs และ Evidence Loop"],
  ["Service/Reorder", "ต้นแบบ", "รอ Stock จริง"],
  ["Forecast/P&L", "ต้นแบบ", "ใช้ Scenario Data"],
];

export default function PlatformPage() {
  const [view, setView] = useState<View>("dashboard");
  const [role, setRole] = useState<Role>("ผู้บริหาร");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(contacts[0]);
  const [message, setMessage] = useState("");
  const filtered = useMemo(() => contacts.filter((c) => `${c.name} ${c.account} ${c.relation} ${c.role}`.toLowerCase().includes(search.toLowerCase())), [search]);
  const notify = (text: string) => { setMessage(text); window.setTimeout(() => setMessage(""), 2200); };

  return (
    <main className="pi-shell">
      <aside className="pi-sidebar">
        <a className="pi-brand" href="/platform">
          <div><img src="/logos/bib-logo.png" alt="BIB" /><img src="/logos/icoone-laser-med.png" alt="icoone" /></div>
          <strong>Practice Intelligence</strong><span>ระบบบริหารลูกค้าและคู่ค้า</span>
        </a>
        <nav>
          <p>พื้นที่ทำงาน</p>
          {nav.map(([id, icon, label]) => <button key={id} className={view === id ? "active" : ""} onClick={() => setView(id)}><i>{icon}</i><span>{label}</span>{id === "quality" && <b>3</b>}</button>)}
        </nav>
        <div className="pi-role"><span>มุมมองผู้ใช้งาน</span><select value={role} onChange={(e) => setRole(e.target.value as Role)}>{["ผู้บริหาร", "ฝ่ายขาย", "การเงิน", "กฎหมาย", "ผู้ฝึกอบรม", "บริการ", "ลูกค้า"].map((x) => <option key={x}>{x}</option>)}</select><small>แสดงเฉพาะข้อมูลตามสิทธิ์</small></div>
      </aside>

      <section className="pi-main">
        <header className="pi-topbar">
          <div><span>BIB PRACTICE INTELLIGENCE</span><h1>{nav.find(([id]) => id === view)?.[2]}</h1></div>
          <label><i>⌕</i><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาลูกค้า ผู้ติดต่อ เอกสาร หรืองาน" /></label>
          <button onClick={() => notify("สร้างรายการใหม่แล้ว")}>＋ สร้างรายการ</button><em>{role.slice(0, 2)}</em>
        </header>

        <div className="pi-content">
          {view === "dashboard" && <>
            <section className="pi-hero"><div><p>วันศุกร์ที่ 31 กรกฎาคม 2569</p><h2>วันนี้มี 6 เรื่องที่ควรตัดสินใจ</h2><span>เรียงตามผลกระทบต่อรายได้ ความเสี่ยง และกำหนดเวลา</span></div><button onClick={() => setView("crm")}>เปิดศูนย์งานขาย</button></section>
            <div className="pi-kpis">
              {[["◎", "ผู้สนใจที่ต้องติดตาม", "14", "Hot 5 · Warm 9"], ["◇", "การสาธิตสัปดาห์นี้", "8", "นอกสถานที่ 3"], ["฿", "Pipeline ที่มีน้ำหนัก", "฿8.9M", "เพิ่มขึ้น 12%"], ["!", "รายการต้องอนุมัติ", "6", "ครบกำหนดวันนี้ 2"]].map((x) => <article key={x[1]}><i>{x[0]}</i><span>{x[1]}</span><strong>{x[2]}</strong><small>{x[3]}</small></article>)}
            </div>
            <div className="pi-two">
              <section className="pi-card"><header><div><span>งานเร่งด่วน</span><h3>สิ่งที่ต้องทำวันนี้</h3></div></header><div className="pi-tasks">
                {[["LINNA", "อนุมัติข้อยกเว้นเงินประกัน", "วันนี้"], ["Dr.J Clinic", "ตรวจ KYC ก่อนส่งสัญญา Model B", "วันนี้"], ["Bangkok Hospital Chiangmai", "ทบทวน Term Sheet Model A", "1 ส.ค."], ["CCME Leads", "คัดเลือก 5 รายสำหรับ Demo", "2 ส.ค."]].map((x) => <button key={x[1]} onClick={() => notify(`เปิดงาน ${x[0]}`)}><i>○</i><div><span>{x[0]}</span><strong>{x[1]}</strong><small>{x[2]}</small></div><b>›</b></button>)}
              </div></section>
              <section className="pi-card"><header><div><span>Sales Pipeline</span><h3>มูลค่าตามขั้นตอน</h3></div><button onClick={() => setView("crm")}>เปิด CRM</button></header><div className="pi-pipeline">{pipeline.slice(2).map((x, i) => <div key={x[0]}><span>{x[0]}</span><i><b style={{ width: `${88 - i * 17}%` }} /></i><strong>{x[2]}</strong></div>)}</div></section>
            </div>
            <section className="pi-card pi-readiness"><header><div><span>MVP READINESS</span><h3>ความพร้อมสำหรับการทดสอบ</h3></div><em>8 โมดูล</em></header><div>{readiness.map((x) => <article key={x[0]}><i className={x[1] === "พร้อมทดสอบ" ? "ready" : ""}>{x[1] === "พร้อมทดสอบ" ? "✓" : "…"}</i><strong>{x[0]}</strong><span>{x[1]}</span><small>{x[2]}</small></article>)}</div></section>
          </>}

          {view === "crm" && <>
            <ViewHead eyebrow="CRM แบบวงจรชีวิต" title="บุคคล องค์กร และความสัมพันธ์" text="Contact อยู่ในระบบได้แม้ยังไม่มี Account และเปลี่ยนสถานะตามความสัมพันธ์จริง" action="เพิ่มผู้ติดต่อ" onClick={() => notify("เปิดแบบฟอร์มผู้ติดต่อใหม่")} />
            <div className="pi-lifecycle">{pipeline.map((x) => <article key={x[0]}><span>{x[0]}</span><strong>{x[1]}</strong><small>{x[2]}</small></article>)}</div>
            <div className="pi-crm">
              <section className="pi-card pi-contact-table"><header><div><span>CONTACT MASTER</span><h3>ผู้ติดต่อทั้งหมด</h3></div><em>{filtered.length} รายการ</em></header><div className="contact-row head"><span>ชื่อและประเภท</span><span>องค์กร</span><span>บทบาท</span><span>คะแนน</span><span>ขั้นตอนถัดไป</span></div>
                {filtered.map((c) => <button className={`contact-row ${selected.name === c.name ? "selected" : ""}`} key={c.name} onClick={() => setSelected(c)}><span><strong>{c.name}</strong><small>{c.relation} · {c.source}</small></span><span>{c.account}</span><span>{c.role}</span><span><b>{c.score || "—"}</b><small>{c.temperature}</small></span><span>{c.next}</span></button>)}
              </section>
              <aside className="pi-contact-detail"><i>{selected.name.slice(0, 2)}</i><span>{selected.relation}</span><h3>{selected.name}</h3><p>{selected.role}</p><dl><div><dt>องค์กร</dt><dd>{selected.account}</dd></div><div><dt>แหล่งที่มา</dt><dd>{selected.source}</dd></div><div><dt>Lead Score</dt><dd>{selected.score}</dd></div></dl><button onClick={() => notify(`สร้างกิจกรรมติดตาม ${selected.name}`)}>สร้างกิจกรรมติดตาม</button><button className="secondary" onClick={() => setView(selected.relation === "Customer" ? "intelligence" : "demo")}>{selected.relation === "Customer" ? "เปิด Client 360" : "เปิด Trust Journey"}</button></aside>
            </div>
            <section className="pi-card pi-segmentation"><header><div><span>อ้างอิง WOW OS</span><h3>Master Segmentation ร่วม</h3></div><em>บุคคล ≠ องค์กร</em></header><div><article><b>PERSON</b><h4>กลุ่มบทบาท → บทบาทเฉพาะ</h4><p>ผู้บริหาร · ผู้เชี่ยวชาญด้านการบำบัด · สุขภาพและโภชนาการ · สุขภาวะทางใจ · ฝ่ายสนับสนุน</p></article><article><b>ORGANIZATION</b><h4>ประเภทองค์กร → ประเภทย่อย</h4><p>คลินิก · โรงพยาบาล · Wellness · Resort · Physio · Supplier · Network</p></article><article><b>RELATIONSHIP</b><h4>ความสัมพันธ์กับ BIB</h4><p>Subscriber · MQL · Opportunity · Customer · Supplier · Partner · Ecosystem</p></article></div></section>
          </>}

          {view === "demo" && <>
            <ViewHead eyebrow="TRUST JOURNEY" title="เปลี่ยนความสนใจให้เป็นความมั่นใจ" text="ส่งข้อมูลตรงกับข้อกังวล ก่อนขอนัดสาธิตหรือข้อเสนอ" action="สร้างลิงก์ Trust Room" onClick={() => notify("สร้างลิงก์ Trust Room แล้ว")} />
            <div className="pi-three">
              <TrustCard number="01" title="เข้าใจความต้องการ"><p>เลือกเป้าหมาย: ปรับรูปทรง · ดูแลเนื้อเยื่อ · หลังหัตถการ · สร้างบริการใหม่</p></TrustCard>
              <TrustCard number="02" title="Evidence Room เฉพาะบุคคล"><ul><li>หลักการทำงาน</li><li>งานวิจัยและข้อจำกัด</li><li>Use Case จริง</li><li>คำถามที่แพทย์มักถาม</li></ul></TrustCard>
              <TrustCard number="03" title="เลือกขั้นตอนต่อไป"><select><option>Demo ที่สำนักงาน BIB</option><option>Demo นอกสถานที่</option><option>ประชุมออนไลน์ก่อน</option></select><button onClick={() => notify("บันทึกคำขอ Demo แล้ว")}>ขอนัดสาธิต</button></TrustCard>
            </div>
            <div className="pi-two">
              <section className="pi-card pi-qualification"><header><div><span>DEMO QUALIFICATION</span><h3>Demo นอกสถานที่</h3></div><em>ขั้นต่ำ 50 คะแนน</em></header><strong>45</strong><i><b style={{ width: "45%" }} /></i><ul><li>✓ ระบุผู้ตัดสินใจแล้ว</li><li>✓ มี Initial Meeting</li><li>○ ยังไม่มี Site Readiness</li></ul><p>คำแนะนำ: Demo ที่สำนักงานก่อน หากยืนยัน Site และผู้ตัดสินใจ ระบบจะเปิด On-site Demo</p></section>
              <section className="pi-card pi-score"><header><div><span>SCORING MODEL</span><h3>คะแนนจากพฤติกรรมจริง</h3></div><em>ฉบับ 1.1</em></header><div>{scoreRules.map(([label, score]) => <p key={label}><span>{label}</span><strong className={score < 0 ? "negative" : ""}>{score > 0 ? "+" : ""}{score}</strong></p>)}</div></section>
            </div>
          </>}

          {view === "commercial" && <>
            <ViewHead eyebrow="COMMERCIAL CONTROL" title="รูปแบบการค้า A–D2" text="ระบบแนะนำรูปแบบที่เหมาะสม และส่งข้อยกเว้นเข้ากระบวนการอนุมัติ" link="/term-templates" action="สร้าง Term Sheet" />
            <div className="pi-models">{[["A", "ซื้อแบบแบ่งชำระ", "฿2.15M", "มาตรฐาน"], ["B", "เช่าเพื่อซื้อ", "24 เดือน", "ต้องอนุมัติ"], ["C", "แบ่งรายได้ + MG", "30/70", "ประเมิน Traffic"], ["D", "โครงการทดลอง", "90 วัน", "40/60"], ["D2", "Strategic Revenue Share", "40/60", "จำกัดสิทธิ์"]].map((x) => <article key={x[0]}><i>{x[0]}</i><span>{x[3]}</span><h3>{x[1]}</h3><strong>{x[2]}</strong><button onClick={() => notify(`เลือก Model ${x[0]} เพื่อประเมิน`)}>ประเมินความเหมาะสม</button></article>)}</div>
            <div className="pi-two"><section className="pi-card pi-flow-card"><header><div><span>WORKFLOW</span><h3>จากข้อเสนอถึงสัญญา</h3></div></header>{["ประเมินรูปแบบ", "ขออนุมัติข้อเสนอ", "ส่ง Term Sheet", "เจรจาและสร้างฉบับใหม่", "Review/Approve", "E-Sign", "สร้างงานส่งมอบ"].map((x, i) => <p key={x}><i>{i + 1}</i><strong>{x}</strong><span>{i < 3 ? "พร้อม" : "รอดำเนินการ"}</span></p>)}</section><section className="pi-handoff"><i>▤</i><h3>ศูนย์ตรวจทานเอกสาร</h3><p>รายการด้านซ้าย เนื้อหาตรงกลาง และการตัดสินใจด้านขวา</p><a href="/">เปิด Document Health</a></section></div>
          </>}

          {view === "activation" && <>
            <ViewHead eyebrow="PARTNER SUCCESS" title="ส่งมอบ Warranty Training Service และ Reorder" text="เมื่อสัญญาสมบูรณ์ ระบบสร้างงานหลังการขายอัตโนมัติ" action="สร้างแผนส่งมอบ" onClick={() => notify("สร้างแผนส่งมอบแล้ว")} />
            <div className="pi-steps">{["ตรวจการชำระ", "เตรียมเครื่อง", "นัดส่งมอบ", "ลงนาม Warranty", "ฝึกอบรม", "เปิดบัญชี Active"].map((x, i) => <article className={i < 3 ? "done" : i === 3 ? "current" : ""} key={x}><i>{i < 3 ? "✓" : i + 1}</i><strong>{x}</strong><span>{i < 3 ? "เสร็จแล้ว" : i === 3 ? "กำลังทำ" : "รอ"}</span></article>)}</div>
            <div className="pi-three">{[["เครื่อง", "icoone Laser Med", "Serial รอวันส่งมอบ · Site LINNA"], ["Warranty", "12 เดือนหลังตรวจรับ", "แจ้งเตือน 60/30 วันก่อนหมด"], ["Training", "18 ชั่วโมง · 4 คน", "รอมอบหมาย Trainer และประเมิน"]].map((x) => <section className="pi-card pi-info" key={x[0]}><span>{x[0]}</span><h3>{x[1]}</h3><p>{x[2]}</p><button onClick={() => notify(`เปิดรายละเอียด ${x[0]}`)}>ดูรายละเอียด</button></section>)}</div>
            <section className="pi-card pi-reorder"><header><div><span>SMART REORDER</span><h3>รายการแนะนำสำหรับ LINNA</h3></div><em>จากการใช้บริการ</em></header>{[["ชุด Bodywear", "คงเหลือประมาณ 8 ชุด", "แนะนำ 12 ชุด", "฿24,000"], ["แผ่นกรอง", "ครบกำหนดตรวจ", "แนะนำ 2 ชุด", "฿8,500"], ["อุปกรณ์ดูแลหัวใช้งาน", "ใช้ไป 78%", "แนะนำ 1 ชุด", "฿5,200"]].map((x) => <article key={x[0]}><i>▣</i><div><strong>{x[0]}</strong><span>{x[1]}</span></div><b>{x[2]}</b><em>{x[3]}</em><button onClick={() => notify(`เพิ่ม ${x[0]} ในคำขอราคา`)}>ขอราคา</button></article>)}</section>
          </>}

          {view === "intelligence" && <>
            <section className="pi-intel-hero"><div><span>CLIENT INTELLIGENCE · FUTURE KILLING FEATURE</span><h2>ช่วยลูกค้าเลือก ขาย และพัฒนาบริการได้ดีขึ้น</h2><p>เปลี่ยน 40 Programs ให้เป็นระบบแนะนำที่เชื่อมความต้องการ Protocol หลักฐาน และผลลัพธ์จริง</p><a href="/linna">เปิด LINNA Client Portal</a></div><aside><strong>40</strong><span>Programs</span><small>Personalized by goal · profile · readiness</small></aside></section>
            <div className="pi-intel-layers">{[["1", "KNOW", "Controlled Knowledge", "Claim, Protocol, Contraindication และ Evidence ชุดเดียวกัน"], ["2", "RECOMMEND", "Personalized Service", "แนะนำจากเป้าหมายและความพร้อม โดยผู้เชี่ยวชาญอนุมัติ"], ["3", "PERFORM", "Sales Intelligence", "Conversion, Repeat, Utilization และโอกาสขายเพิ่ม"], ["4", "LEARN", "Real-use Evidence", "Outcome พร้อม Consent และ Quality Review"]].map((x) => <article key={x[0]}><i>{x[0]}</i><span>{x[1]}</span><h3>{x[2]}</h3><p>{x[3]}</p></article>)}</div>
            <div className="pi-two">
              <section className="pi-card pi-recommend"><header><div><span>PERSONALIZED JOURNEY</span><h3>ตัวอย่างการแนะนำบริการ</h3></div><em>ต้องมี Human Approval</em></header><label>เป้าหมาย<select><option>ดูแลรูปทรงและความกระชับ</option><option>ดูแลเนื้อเยื่อหลังหัตถการ</option></select></label><label>บริเวณ<select><option>ลำตัว</option><option>ใบหน้า</option><option>ขา</option></select></label><div><span>ระบบแนะนำ</span><h4>Body Shape Journey · 6–10 ครั้ง</h4><p>ดึงจาก Approved Program Library ไม่สร้าง Protocol อิสระ</p><button onClick={() => notify("ส่งให้ผู้เชี่ยวชาญตรวจแล้ว")}>ส่งให้ผู้เชี่ยวชาญตรวจ</button></div></section>
              <section className="pi-card pi-evidence"><header><div><span>RETURN BUSINESS LOOP</span><h3>Evidence Reward ในอนาคต</h3></div><em>แผนระยะถัดไป</em></header>{[["ใช้ Protocol ที่ควบคุม", "ความสม่ำเสมอ"], ["เก็บ Outcome และ Consent", "Use Case Evidence"], ["ผ่าน Quality Review", "Evidence Credit"], ["รับการสนับสนุนเพิ่ม", "Training · Content · Lead"]].map((x, i) => <article key={x[0]}><i>{i + 1}</i><div><strong>{x[0]}</strong><span>{x[1]}</span></div></article>)}<p>Reward ให้จากคุณภาพข้อมูล ไม่ใช่ผลลัพธ์เชิงบวก และต้องผ่าน Ethics/Privacy Review</p></section>
            </div>
          </>}

          {view === "finance" && <>
            <ViewHead eyebrow="FORECAST & P&L" title="จาก Pipeline สู่ผลทางการเงิน" text="การเปลี่ยน Model, Stage, Revenue Report และ Commission สะท้อนในประมาณการ" action="คำนวณใหม่" onClick={() => notify("อัปเดต Scenario แล้ว")} />
            <div className="pi-kpis">{[["฿", "Weighted Revenue", "฿8.9M", "Pipeline ฿21.4M"], ["%", "Gross Margin", "42%", "หลัง Commission/Service"], ["↗", "Revenue Share ARR", "฿3.2M", "C, D และ D2"], ["●", "Commission Forecast", "฿326K", "รออนุมัติ 4"]].map((x) => <article key={x[1]}><i>{x[0]}</i><span>{x[1]}</span><strong>{x[2]}</strong><small>{x[3]}</small></article>)}</div>
            <div className="pi-two"><section className="pi-card pi-pnl"><header><div><span>FORECAST P&L</span><h3>ประมาณการ 12 เดือน</h3></div></header>{[["รายได้ขายเครื่อง", "฿12,900,000"], ["รายได้ Revenue Share", "฿3,240,000"], ["ต้นทุนเครื่องและส่งมอบ", "(฿8,020,000)"], ["ค่าตอบแทนการขาย", "(฿326,000)"], ["Training/Service Cost", "(฿740,000)"], ["กำไรประมาณการ", "฿7,054,000"]].map((x, i) => <p className={i === 5 ? "total" : ""} key={x[0]}><span>{x[0]}</span><strong>{x[1]}</strong></p>)}</section><section className="pi-card pi-mix"><header><div><span>COMMERCIAL MIX</span><h3>สัดส่วนรายได้</h3></div></header>{[["A — Purchase", 55], ["B — Rent-to-Own", 22], ["C — Revenue Share + MG", 12], ["D/D2 — Strategic", 11]].map((x) => <p key={String(x[0])}><span>{x[0]}</span><i><b style={{ width: `${x[1]}%` }} /></i><strong>{x[1]}%</strong></p>)}</section></div>
          </>}

          {view === "quality" && <>
            <ViewHead eyebrow="TRUST & QUALITY" title="ตรวจระบบจาก 3 มุมมอง" text="User, Developer และ Brand Director ใช้เกณฑ์ต่างกันแต่เห็นสถานะร่วมกัน" action="ตรวจระบบอีกครั้ง" onClick={() => notify("เริ่มตรวจระบบแล้ว")} />
            <div className="pi-quality">{[["U", "USER VIEW", "ใช้งานสำเร็จหรือไม่", ["✓ เมนูตามบทบาท", "✓ งานหลักไม่เกิน 5 ขั้นตอน", "! Mobile Review ต้องทดสอบ", "✓ ภาษาไทยเป็นหลัก"]], ["D", "DEVELOPER VIEW", "ข้อมูลถูกต้องหรือไม่", ["✓ State Transition", "✓ Required Fields", "! Automation Retry เป็น Todo", "✓ Audit Event"]], ["B", "BRAND DIRECTOR", "แบรนด์สม่ำเสมอหรือไม่", ["✓ BIB + icoone CI", "✓ Kanit–Muli", "! ภาพบางส่วนรอสิทธิ์", "✓ Claim Boundary"]]].map((x) => <section key={String(x[0])}><i>{x[0]}</i><span>{x[1]}</span><h3>{x[2]}</h3><ul>{(x[3] as string[]).map((v) => <li className={v.startsWith("!") ? "warn" : ""} key={v}>{v}</li>)}</ul></section>)}</div>
            <section className="pi-card pi-issues"><header><div><span>DATA QUALITY</span><h3>สิ่งที่ต้องแก้ก่อนใช้งานจริง</h3></div><em>3 รายการ</em></header>{[["สูง", "Dr.J ไม่มีหนังสือรับรองนิติบุคคล", "Finance / Legal", "Blocked"], ["กลาง", "LINNA ยังไม่มี Serial Number", "Service", "Open"], ["ต่ำ", "MQL 4 รายไม่มี Organization", "Sales", "Review"]].map((x) => <article key={x[1]}><b className={x[0] === "สูง" ? "high" : ""}>{x[0]}</b><strong>{x[1]}</strong><span>{x[2]}</span><em>{x[3]}</em><button>เปิดรายการ</button></article>)}</section>
          </>}
        </div>
      </section>
      {message && <div className="pi-toast">✓ {message}</div>}
    </main>
  );
}

function ViewHead({ eyebrow, title, text, action, onClick, link }: { eyebrow: string; title: string; text: string; action: string; onClick?: () => void; link?: string }) {
  return <section className="pi-view-head"><div><span>{eyebrow}</span><h2>{title}</h2><p>{text}</p></div>{link ? <a href={link}>{action}</a> : <button onClick={onClick}>＋ {action}</button>}</section>;
}

function TrustCard({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <section className="pi-card pi-trust"><i>{number}</i><span>ขั้นตอนที่ {number}</span><h3>{title}</h3>{children}</section>;
}
