"use client";

import { useMemo, useState } from "react";

type ModelCode = "A" | "B" | "C" | "D" | "D2";

const models: Record<ModelCode, {
  name: string;
  status: string;
  summary: string;
  amount: string;
  schedule: string[];
  controls: string[];
  documents: string[];
}> = {
  A: {
    name: "ซื้อเครื่องแบบแบ่งชำระ",
    status: "มาตรฐาน",
    summary: "ราคา 2,150,000 บาท รวมภาษีมูลค่าเพิ่ม · เป็นเจ้าของเมื่อชำระครบ",
    amount: "2,150,000.00",
    schedule: [
      "เงินยืนยันคำสั่งซื้อ 215,000 บาท",
      "ชำระวันส่งมอบ 215,000 บาท",
      "เช็คล่วงหน้า 8 งวด งวดละ 215,000 บาท ครบกำหนดวันที่ 25 ของเดือน",
    ],
    controls: ["รับเช็คล่วงหน้าครบก่อนส่งมอบ", "โอนกรรมสิทธิ์เมื่อชำระครบ", "ผิดนัด 2 งวดเข้าสู่กระบวนการติดตามตามสัญญา"],
    documents: ["ใบเสนอราคา", "ข้อเสนอเงื่อนไขทางการค้า", "สัญญาซื้อขายแบบแบ่งชำระ", "ตารางชำระเงิน", "หนังสือรับประกัน", "ใบส่งมอบและฝึกอบรม"],
  },
  B: {
    name: "เช่าเพื่อซื้อ",
    status: "ต้องได้รับอนุมัติ",
    summary: "24 เดือน · เงินประกัน 200,000 บาท · ค่าเช่า 100,000 บาทต่อเดือน",
    amount: "100,000.00 / เดือน",
    schedule: ["เงินประกันเครื่อง 200,000 บาท", "ค่าเช่ารายเดือน 100,000 บาท × 24 เดือน", "โอนกรรมสิทธิ์เมื่อปฏิบัติตามเงื่อนไขครบ"],
    controls: ["ตรวจเครดิตและผู้มีอำนาจลงนาม", "เครื่องเป็นทรัพย์สินของ BIB จนกว่าจะโอน", "ติดตามการชำระรายเดือน"],
    documents: ["ข้อเสนอเช่าเพื่อซื้อ", "แบบประเมินเครดิต", "สัญญาเช่าเพื่อซื้อ", "ตารางชำระเงิน", "หนังสือรับประกัน", "ใบส่งมอบและฝึกอบรม"],
  },
  C: {
    name: "แบ่งรายได้และมีรายได้ขั้นต่ำ",
    status: "ต้องได้รับอนุมัติ",
    summary: "BIB 30% / คู่ค้า 70% · รายได้ขั้นต่ำเริ่ม 50,000 บาท · 24 เดือน",
    amount: "30% หรือรายได้ขั้นต่ำ",
    schedule: ["เงินประกันเครื่อง 200,000 บาท", "แบ่งรายได้ BIB 30% / คู่ค้า 70%", "รายได้ขั้นต่ำปรับตามตาราง 50,000 → 70,000 → 90,000/100,000 บาท"],
    controls: ["ต้องมีข้อมูลจำนวนลูกค้าและยอดใช้บริการ", "รายงานยอดขายและจำนวนครั้งทุกเดือน", "BIB มีสิทธิตรวจสอบข้อมูล"],
    documents: ["ข้อเสนอแบ่งรายได้", "ผลประเมินศักยภาพ", "ตารางรายได้ขั้นต่ำ", "สัญญาแบ่งรายได้", "แบบรายงานรายเดือน", "หนังสือรับประกัน"],
  },
  D: {
    name: "โครงการทดลองเชิงกลยุทธ์",
    status: "จำกัด 90 วัน",
    summary: "BIB 40% / คู่ค้า 60% · ไม่มีรายได้ขั้นต่ำ · ไม่เกิน 90 วัน",
    amount: "40% ของรายได้สุทธิ",
    schedule: ["เงินประกันเครื่อง 200,000 บาท", "แบ่งรายได้ BIB 40% / คู่ค้า 60%", "ตัดสินใจซื้อ เปลี่ยนรูปแบบ หรือคืนเครื่องเมื่อครบ 90 วัน"],
    controls: ["ต้องกำหนดตัวชี้วัด 30/60/90 วัน", "ห้ามต่อระยะโดยแก้สัญญาเดิม", "ต้องมีแผนเปลี่ยนรูปแบบหรือคืนเครื่อง"],
    documents: ["กฎบัตรโครงการ 90 วัน", "ตัวชี้วัดความสำเร็จ", "ข้อเสนอแบ่งรายได้", "สัญญาทดลอง", "แบบรายงานรายเดือน", "บันทึกผลวันที่ 90"],
  },
  D2: {
    name: "แบ่งรายได้ระยะยาวเชิงกลยุทธ์",
    status: "อนุมัติเฉพาะกรณี",
    summary: "BIB 40% / คู่ค้า 60% · ไม่มีรายได้ขั้นต่ำ · 12 เดือน",
    amount: "40% ของรายได้สุทธิ",
    schedule: ["เงินประกัน 200,000 บาท หรือขอยกเว้นตามระดับความเสี่ยง", "แบ่งรายได้ BIB 40% / คู่ค้า 60%", "ทบทวนวันที่ 90 และทุกไตรมาส · ต่ออายุรวมไม่เกิน 36 เดือน"],
    controls: ["ผู้บริหารและฝ่ายการเงินอนุมัติ", "ไม่มีบริการที่ชำระเงินจริง 3 เดือน BIB มีสิทธิเรียกคืน", "ข้อยกเว้นต้องมีเลขที่อนุมัติ"],
    documents: ["บันทึกขออนุมัติข้อยกเว้น", "ข้อเสนอ D2", "สัญญาแบ่งรายได้ระยะยาว", "แบบรายงานรายเดือน", "ตารางทบทวนรายไตรมาส", "หนังสือรับประกัน"],
  },
};

const initialClient = {
  name: "Bangkok Hospital Chiangmai Co., Ltd.",
  taxId: "[IDENTIFIER OMITTED]",
  address: "[ADDRESS OMITTED]",
  contact: "",
  salesperson: "Redacted Person",
};

export default function TermTemplatesPage() {
  const [model, setModel] = useState<ModelCode>("A");
  const [client, setClient] = useState(initialClient);
  const [stage, setStage] = useState("ร่าง");
  const current = models[model];
  const quoteNo = useMemo(() => `TS-2026-${model}-0013`, [model]);

  return (
    <main className="template-shell">
      <aside className="template-sidebar">
        <div className="brand">
          <div className="brand-lockup">
            <img src="/logos/bib-logo.png" alt="BIB" className="bib-logo" />
            <img src="/logos/icoone-laser-med.png" alt="icoone Laser Med" className="icoone-logo" />
          </div>
          <div><strong>ศูนย์ข้อมูลและการอนุมัติ</strong><span>BIB PRACTICE INTELLIGENCE</span></div>
        </div>
        <nav>
          <p className="nav-label">พื้นที่ทำงาน</p>
          <a className="template-nav-link" href="/platform"><span>⌂</span> BIB Practice Intelligence</a>
          <a className="template-nav-link" href="/"><span>✓</span> การอนุมัติเชิงพาณิชย์</a>
          <a className="template-nav-link active" href="/term-templates"><span>▦</span> แม่แบบข้อเสนอ</a>
          <p className="nav-label">ทะเบียนกลาง</p>
          <a className="template-nav-link" href="/"><span>◎</span> ลูกค้าและข้อมูลการขาย</a>
          <a className="template-nav-link" href="/"><span>◇</span> รูปแบบการค้า A–D2</a>
          <a className="template-nav-link" href="/"><span>≡</span> คลังสัญญาและเอกสาร</a>
        </nav>
        <div className="security-card"><span>🔒</span><div><strong>ควบคุมสิทธิ์ตามบทบาท</strong><p>ลูกค้าเห็นเฉพาะรูปแบบที่ได้รับอนุมัติให้เสนอ</p></div></div>
      </aside>

      <section className="template-workspace">
        <header className="template-topbar">
          <div><span>BIB / ข้อเสนอเชิงพาณิชย์</span><h1>คลังแม่แบบ Term Sheet</h1></div>
          <div className="template-stage"><small>สถานะเอกสาร</small><strong>{stage}</strong></div>
        </header>

        <section className="template-builder">
          <aside className="template-controls">
            <div className="control-head"><span>ขั้นตอนที่ 1</span><h2>เลือกรูปแบบการค้า</h2><p>ระบบจะแสดงเฉพาะรูปแบบที่ฝ่ายขายได้รับอนุมัติ</p></div>
            <div className="model-picker">
              {(Object.keys(models) as ModelCode[]).map((code) => (
                <button key={code} className={model === code ? "active" : ""} onClick={() => { setModel(code); setStage("ร่าง"); }}>
                  <i>{code}</i><div><strong>{models[code].name}</strong><small>{models[code].status}</small></div>
                </button>
              ))}
            </div>
            <div className="control-head compact"><span>ขั้นตอนที่ 2</span><h2>ข้อมูลผู้รับข้อเสนอ</h2></div>
            <div className="client-fields">
              <label><span>ชื่อนิติบุคคล</span><input value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} /></label>
              <label><span>เลขประจำตัวผู้เสียภาษี</span><input value={client.taxId} onChange={(e) => setClient({ ...client, taxId: e.target.value })} /></label>
              <label><span>ที่อยู่</span><textarea value={client.address} onChange={(e) => setClient({ ...client, address: e.target.value })} /></label>
              <label><span>ผู้ประสานงาน</span><input value={client.contact} onChange={(e) => setClient({ ...client, contact: e.target.value })} placeholder="ชื่อ ตำแหน่ง โทรศัพท์ หรืออีเมล" /></label>
            </div>
            <div className="template-actions">
              <button onClick={() => { setStage("สร้างเอกสารแล้ว"); window.print(); }}>พิมพ์หรือบันทึก PDF</button>
              <button className="primary" onClick={() => setStage("รอตรวจทาน")}>ส่งเข้ากระบวนการตรวจทาน</button>
            </div>
          </aside>

          <section className="template-preview-panel">
            <header><div><span>ตัวอย่างเอกสารแบบเรียลไทม์</span><strong>{quoteNo}</strong></div><em>{current.status}</em></header>
            <div className="term-paper-stack">
            <article className="term-paper">
              <div className="term-paper-head">
                <div><img src="/logos/bib-logo.png" alt="BIB" /><strong>IplusQ</strong><p>9/1 Rattanathibet Soi 10<br />Bangkrasor, Muang Nonthaburi 11000<br />[CONTACT OMITTED]· www.iplusq.com</p></div>
                <div><h2>TERM SHEET</h2><strong>{quoteNo}</strong><p>Commercial Model {model}</p></div>
              </div>
              <div className="term-form-grid">
                <div className="term-field span-2"><span>เสนอแก่ / ชื่อนิติบุคคล</span><strong>{client.name || "กรอกชื่อนิติบุคคล"}</strong></div>
                <div className="term-field"><span>เลขประจำตัวผู้เสียภาษี</span><strong>{client.taxId || "-"}</strong></div>
                <div className="term-field"><span>วันที่จัดทำ</span><strong>30/07/2026</strong></div>
                <div className="term-field span-2"><span>ที่อยู่ตามหนังสือรับรอง</span><p>{client.address || "กรอกที่อยู่"}</p></div>
                <div className="term-field"><span>ผู้ประสานงาน</span><strong>{client.contact || "—"}</strong></div>
                <div className="term-field"><span>ผู้รับผิดชอบของ BIB</span><strong>{client.salesperson}</strong></div>
              </div>
              <table className="term-price-table">
                <thead><tr><th>#</th><th>รายการและรายละเอียด</th><th>จำนวน</th><th>เงื่อนไขหลัก</th></tr></thead>
                <tbody><tr><td>1</td><td><strong>icoone® Laser Med</strong><small>{current.name}<br />{current.summary}</small></td><td>1 เครื่อง</td><td>{current.amount}</td></tr></tbody>
                <tfoot><tr><td colSpan={3}>มูลค่าหรือฐานการคำนวณ</td><td>{current.amount}</td></tr></tfoot>
              </table>
              <div className="term-sections">
                <section><h3>กำหนดการชำระและการแบ่งรายได้</h3><ul>{current.schedule.map((x) => <li key={x}>{x}</li>)}</ul></section>
                <section><h3>การควบคุมความเสี่ยง</h3><ul>{current.controls.map((x) => <li key={x}>{x}</li>)}</ul></section>
              </div>
              <div className="term-page-note">ข้อเสนอฉบับนี้ใช้เพื่อประกอบการพิจารณา เงื่อนไขที่มีผลผูกพันให้เป็นไปตามสัญญาที่ลงนามครบถ้วน</div>
              <footer><span>หน้า 1 จาก 2</span><strong>BIB · {quoteNo}</strong></footer>
            </article>

            <article className="term-paper term-paper-page-two">
              <div className="term-continuation-head">
                <div className="term-continuation-brand"><img src="/logos/bib-logo.png" alt="BIB" /><img src="/logos/icoone-laser-med.png" alt="icoone Laser Med" /></div>
                <div><span>รายละเอียดประกอบข้อเสนอ</span><strong>{quoteNo}</strong><p>Commercial Model {model} · {current.name}</p></div>
              </div>

              <div className="term-detail-grid">
                <section>
                  <h3>การส่งมอบและติดตั้ง</h3>
                  <div className="term-clause-row"><span>สถานที่ติดตั้ง</span><strong>{client.address || "รอยืนยันสถานที่ติดตั้ง"}</strong></div>
                  <div className="term-clause-row"><span>กำหนดส่งมอบ</span><strong>ภายใน 45 วันหลังยืนยันการผลิต เว้นแต่ตกลงเป็นหนังสืออย่างอื่น</strong></div>
                  <div className="term-clause-row"><span>ค่าขนส่ง</span><strong>จัดส่งภายในประเทศไทยโดยไม่มีค่าใช้จ่าย</strong></div>
                </section>
                <section>
                  <h3>การรับประกันและบริการ</h3>
                  <div className="term-clause-row"><span>ระยะรับประกัน</span><strong>1 ปี นับจากวันที่ลงนามรับมอบเครื่อง</strong></div>
                  <div className="term-clause-row"><span>การฝึกอบรม</span><strong>ฝึกอบรม 3 วัน และทบทวนทุก 6 เดือนในปีแรก</strong></div>
                  <div className="term-clause-row"><span>เงื่อนไขรับประกัน</span><strong>เป็นไปตามหนังสือรับประกันและข้อกำหนดการใช้งานของผู้ผลิต</strong></div>
                </section>
                <section>
                  <h3>ภาษีและการชำระเงิน</h3>
                  <div className="term-clause-row"><span>ภาษีมูลค่าเพิ่ม</span><strong>รวมอยู่ในราคาหรือยอดที่ระบุ เว้นแต่ระบุเป็นอย่างอื่น</strong></div>
                  <div className="term-clause-row"><span>ผู้รับชำระ</span><strong>I Plus Q Co., Ltd.</strong></div>
                  <div className="term-clause-row"><span>บัญชีธนาคาร</span><strong>ธนาคารกรุงเทพ · 2333013643 · SWIFT BKKBTHBK</strong></div>
                </section>
                <section>
                  <h3>เอกสารที่ใช้ประกอบ</h3>
                  <ul>{current.documents.map((x) => <li key={x}>{x}</li>)}</ul>
                </section>
              </div>

              <div className="term-acceptance">
                <h3>การรับทราบและยืนยันข้อเสนอ</h3>
                <p>ผู้รับข้อเสนอรับทราบว่าเอกสารนี้เป็นสรุปเงื่อนไขเบื้องต้น การซื้อขาย การเช่า การแบ่งรายได้ การรับประกัน และหน้าที่ของคู่สัญญาจะมีผลเมื่อคู่สัญญาลงนามในสัญญาฉบับสมบูรณ์แล้ว</p>
                <div className="term-signature-grid">
                  <div><span>สำหรับผู้รับข้อเสนอ</span><i /><strong>ชื่อ–นามสกุล / ผู้มีอำนาจลงนาม</strong><small>วันที่ ____________________</small></div>
                  <div><span>สำหรับบริษัท ไอพลัสคิว จำกัด</span><i /><strong>ผู้มีอำนาจลงนาม</strong><small>วันที่ ____________________</small></div>
                </div>
              </div>
              <footer><span>หน้า 2 จาก 2</span><strong>BIB · {quoteNo}</strong></footer>
            </article>
            </div>
          </section>

          <aside className="template-package">
            <div className="control-head"><span>ชุดเอกสารอัตโนมัติ</span><h2>เอกสารสำหรับแบบ {model}</h2><p>สร้างจากข้อมูลลูกค้าและฉบับแม่แบบเดียวกัน</p></div>
            <ol>{current.documents.map((doc, index) => <li key={doc}><i>{index + 1}</i><div><strong>{doc}</strong><small>{index < 2 ? "พร้อมสร้าง" : "สร้างหลังผ่านการตรวจทาน"}</small></div><span>{index < 2 ? "✓" : "○"}</span></li>)}</ol>
            <div className="template-version">
              <span>แม่แบบที่ใช้งาน</span><strong>Commercial Model {model} · ฉบับ 1.0</strong>
              <small>อ้างอิง Commercial Model Registry และใบเสนอราคา QT-2026000013</small>
            </div>
            <div className="template-flow">
              <span className="done">ข้อมูลลูกค้า</span><i />
              <span className={stage !== "ร่าง" ? "done" : ""}>สร้างเอกสาร</span><i />
              <span className={stage === "รอตรวจทาน" ? "current" : ""}>ตรวจทาน</span><i />
              <span>ลงนาม</span>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}
