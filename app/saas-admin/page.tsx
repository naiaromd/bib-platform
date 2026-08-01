const blueprintParts = [
  ["01", "โครงโมดูล", "CRM เอกสาร งาน การฝึกอบรม บริการ และพอร์ทัล"],
  ["02", "ข้อมูลและฟอร์ม", "ช่องข้อมูล กฎตรวจสอบ และหน้าจอที่สร้างจากโครงข้อมูล"],
  ["03", "บทบาทและสิทธิ", "เจ้าของบริษัท ผู้ดูแล ผู้ปฏิบัติงาน และลูกค้า"],
  ["04", "ขั้นตอนและงานอัตโนมัติ", "เหตุการณ์ งาน กำหนดเวลา การแจ้งเตือน และการอนุมัติ"],
  ["05", "ตราสินค้าและพอร์ทัล", "โลโก้ สี ภาษา เมนู และประสบการณ์ของลูกค้า"],
  ["06", "รายงานและการตรวจสอบ", "Dashboard การใช้งาน ประวัติเปลี่ยนแปลง และ Audit Log"],
];

const readiness = [
  ["มีแล้ว", "ทะเบียนบริษัท โมดูล ช่องข้อมูล เอกสาร งาน และขั้นตอน"],
  ["ต้องทำ P0", "เพิ่ม tenant_id ให้ข้อมูลธุรกิจทุกส่วนและบังคับตรวจสิทธิ์ฝั่งเซิร์ฟเวอร์"],
  ["ต้องทำ P0", "สมาชิกบริษัท บทบาท สิทธิ และการสร้างบริษัทจาก Blueprint"],
  ["ต้องทำ P1", "นำ Field และ Workflow ที่ตั้งค่าไปสร้างหน้าจอและงานอัตโนมัติจริง"],
  ["ต้องทำ P1", "ระบบลงนามอิเล็กทรอนิกส์ การแจ้งเตือน และพื้นที่จัดเก็บไฟล์รายบริษัท"],
  ["อนาคต", "แพ็กเกจ การคิดค่าบริการ Usage Metering และ Custom Domain"],
];

export default function SaasAdminPage() {
  return <main className="saas-control">
    <header className="saas-topbar">
      <a href="/platform" className="saas-lockup"><img src="/logos/bib-logo.png" alt="BIB" /><span>Practice Intelligence</span></a>
      <div><b>ศูนย์ควบคุมแพลตฟอร์ม</b><small>สำหรับเจ้าของ SaaS เท่านั้น</small></div>
      <a href="/platform">กลับพื้นที่ BIB</a>
    </header>

    <section className="saas-hero">
      <div><span>SAAS SYSTEM BLUEPRINT</span><h1>สร้างพื้นที่ทำงานให้แต่ละบริษัท<br />จากระบบต้นแบบเดียวกัน</h1><p>แต่ละบริษัทเลือกโมดูล ขั้นตอน สิทธิ ตราสินค้า และพอร์ทัลได้ โดยข้อมูลแยกจากกันอย่างชัดเจน</p></div>
      <aside><small>สถานะปัจจุบัน</small><strong>Foundation</strong><b>ยังไม่พร้อมเปิดบริษัทที่สอง</b><p>ต้องทำการแยกข้อมูลและสิทธิ P0 ก่อน</p></aside>
    </section>

    <section className="saas-principle">
      <span>โครงสร้างหลัก</span>
      <div><b>Platform</b><i>→</i><b>Blueprint รุ่น</b><i>→</i><b>บริษัท</b><i>→</i><b>โมดูลและสิทธิ</b><i>→</i><b>ข้อมูลและ Audit Log</b></div>
    </section>

    <section className="saas-section">
      <header><span>องค์ประกอบของแม่แบบระบบ</span><h2>หนึ่ง Blueprint ครอบคลุมทั้งระบบ</h2></header>
      <div className="saas-blueprint-grid">{blueprintParts.map(([no, title, text]) => <article key={no}><i>{no}</i><h3>{title}</h3><p>{text}</p></article>)}</div>
    </section>

    <section className="saas-two-col">
      <article className="saas-panel">
        <header><span>บริษัทในระบบ</span><strong>1</strong></header>
        <div className="saas-company"><i>B</i><span><b>บริษัท ไอ พลัส คิว จำกัด</b><small>BIB · พื้นที่ต้นแบบ</small></span><em>ใช้งาน</em></div>
        <footer>บริษัทถัดไปจะสร้างได้หลังผ่านเกณฑ์ P0 เท่านั้น</footer>
      </article>
      <article className="saas-panel">
        <header><span>ความพร้อม</span><strong>{readiness.length}</strong></header>
        <div className="saas-readiness">{readiness.map(([status, text]) => <div key={text} className={status === "มีแล้ว" ? "done" : status === "อนาคต" ? "future" : "todo"}><em>{status}</em><p>{text}</p></div>)}</div>
      </article>
    </section>

    <section className="saas-phases">
      <header><span>ลำดับการพัฒนา</span><h2>ทำแกนความปลอดภัยก่อนเครื่องมือปรับแต่ง</h2></header>
      <div><article><i>P0</i><b>Multi-tenant Core</b><p>บริษัท สมาชิก สิทธิ การแยกข้อมูล Blueprint Version และ Audit</p></article><article><i>P1</i><b>No-code Configuration</b><p>Form, Workflow, Automation, Document และ Dashboard Builder</p></article><article><i>P2</i><b>Commercial SaaS</b><p>แพ็กเกจ Subscription Billing Usage และ Custom Domain</p></article></div>
    </section>
  </main>;
}
