"use client";

import { useState } from "react";

export default function ExplorePage() {
  const [goal, setGoal] = useState("สร้างบริการใหม่");
  const [demo, setDemo] = useState("BIB Experience Center");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ contactName: "", organizationName: "", phone: "", email: "", segment: "คลินิกความงาม", buyingRole: "เจ้าของกิจการ", timeline: "ภายใน 3 เดือน", siteReady: false, consent: false });
  const update = (key: keyof typeof form, value: string | boolean) => setForm({ ...form, [key]: value });
  const submitDemo = async () => {
    setSaving(true); setError("");
    const response = await fetch("/api/public/demo-request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, goal, locationType: demo }) });
    const payload = await response.json();
    setSaving(false);
    if (!response.ok) { setError(payload.error || "บันทึกไม่สำเร็จ"); return; }
    setSubmitted(true);
  };
  return <main className="v2-shell v2-external">
    <header className="v2-brand-header">
      <a href="/explore" className="v2-brand-lockup"><img src="/logos/bib-logo.png" alt="BIB" /><span /><img src="/logos/icoone-laser-med.png" alt="icoone laser med" /></a>
      <div className="v2-brand-copy"><b>ICOONE DISCOVERY</b><span>เข้าใจหลักฐานก่อนตัดสินใจ</span></div>
      <nav><a href="/platform">สำหรับทีม BIB</a><a className="active" href="/explore">สำหรับผู้สนใจ</a><a href="/client">สำหรับลูกค้า</a></nav>
      <em>PERSONALISED</em>
    </header>
    <section className="v2-layout">
      <aside className="v2-job-nav">
        <span>CHOOSE YOUR NEXT STEP</span>
        <h2>เส้นทางของคุณ</h2>
        <p>ข้อมูลที่จำเป็นต่อการตัดสินใจ</p>
        <nav>
          {[["01", "สำรวจความต้องการ", "เลือกเป้าหมายของสถานประกอบการ", "#understand"], ["02", "ทบทวนหลักฐาน", "เข้าใจเทคโนโลยีและข้อจำกัด", "#evidence"], ["03", "ขอนัดสาธิต", "เลือกสถานที่และรูปแบบที่เหมาะสม", "#demo"]].map((item, index) =>
            <a className={index === 0 ? "active" : ""} href={item[3]} key={item[0]}><i>{item[0]}</i><span><b>{item[1]}</b><small>{item[2]}</small></span><em>↗</em></a>
          )}
        </nav>
        <div className="v2-control-note"><b>หลักการให้ข้อมูล</b><p>แสดงประโยชน์ หลักฐาน และข้อจำกัด</p></div>
      </aside>
      <div className="v2-work">
        <section className="v2-explore-hero v2-module-hero">
          <div><span>สำหรับแพทย์และเจ้าของกิจการ</span><h1>ค้นหาแนวทาง<br />ที่เหมาะกับคุณ</h1><p>ทบทวนการใช้งาน หลักฐาน และความเหมาะสมก่อนตัดสินใจ</p><a href="#understand">เริ่มประเมิน</a></div>
          <aside><i>40</i><b>โปรแกรมที่ออกแบบไว้</b><p>ระบบจะแสดงเฉพาะข้อมูลที่เกี่ยวข้องกับเป้าหมายและบทบาทของคุณ</p></aside>
        </section>
    <section className="v2-public-flow" id="journey">
      <article id="understand"><i>01</i><span>UNDERSTAND</span><h2>คุณต้องการพัฒนาเรื่องใด</h2><div className="v2-choice-grid">{["สร้างบริการใหม่", "ปรับรูปทรงและความงาม", "ดูแลเนื้อเยื่อหลังหัตถการ", "ฟื้นฟูและ Wellness"].map((item) => <button className={goal === item ? "active" : ""} onClick={() => setGoal(item)} key={item}>{item}</button>)}</div></article>
      <article id="evidence"><i>02</i><span>BUILD CONFIDENCE</span><h2>ข้อมูลประกอบการตัดสินใจ</h2><div className="v2-evidence-cards"><section><b>หลักการทำงาน</b><p>กลไกและขอบเขตเทคโนโลยี</p><em>อ่าน 4 นาที →</em></section><section><b>หลักฐานทางคลินิก</b><p>ผลการศึกษาและข้อจำกัด</p><em>เปิดสรุปหลักฐาน →</em></section><section><b>กรณีใช้งาน</b><p>แนวทางบริการและการวัดผล</p><em>ดูกรณีใช้งาน →</em></section></div></article>
      <article id="demo"><i>03</i><span>NEXT STEP</span><h2>นัดสาธิต</h2><div className="v2-demo-intake"><label>ชื่อผู้ติดต่อ<input value={form.contactName} onChange={(event) => update("contactName", event.target.value)} /></label><label>สถานประกอบการ<input value={form.organizationName} onChange={(event) => update("organizationName", event.target.value)} /></label><label>โทรศัพท์<input value={form.phone} onChange={(event) => update("phone", event.target.value)} /></label><label>อีเมล<input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} /></label><label>ประเภทธุรกิจ<select value={form.segment} onChange={(event) => update("segment", event.target.value)}><option>คลินิกความงาม</option><option>โรงพยาบาล</option><option>ศูนย์ Wellness</option><option>รีสอร์ตและสปา</option><option>คลินิกกายภาพบำบัด</option></select></label><label>บทบาท<select value={form.buyingRole} onChange={(event) => update("buyingRole", event.target.value)}><option>เจ้าของกิจการ</option><option>แพทย์ผู้ตัดสินใจ</option><option>ผู้บริหาร</option><option>ผู้จัดการ</option><option>ผู้ประสานงาน</option></select></label><label>ช่วงเวลาที่ต้องการเริ่ม<select value={form.timeline} onChange={(event) => update("timeline", event.target.value)}><option>ภายใน 3 เดือน</option><option>3–6 เดือน</option><option>ภายใน 12 เดือน</option><option>ยังไม่กำหนด</option></select></label></div><div className="v2-demo-select"><label><input type="radio" checked={demo === "BIB Experience Center"} onChange={() => setDemo("BIB Experience Center")} /><span><b>ทดลองที่ BIB</b><small>เหมาะสำหรับการทดลองครั้งแรก</small></span></label><label><input type="radio" checked={demo === "On-site"} onChange={() => setDemo("On-site")} /><span><b>สาธิตที่สถานประกอบการ</b><small>ประเมินความพร้อมก่อนยืนยัน</small></span></label></div>{demo === "On-site" && <label className="v2-consent"><input type="checkbox" checked={form.siteReady} onChange={(event) => update("siteReady", event.target.checked)} /> สถานที่พร้อมสำหรับการสาธิตและมีผู้ตัดสินใจหรือผู้เกี่ยวข้องเข้าร่วม</label>}<label className="v2-consent"><input type="checkbox" checked={form.consent} onChange={(event) => update("consent", event.target.checked)} /> ยินยอมให้ BIB ใช้ข้อมูลเพื่อติดต่อและประเมินการสาธิต</label><button className="v2-primary" disabled={saving || submitted} onClick={submitDemo}>{saving ? "กำลังบันทึก" : submitted ? "ส่งคำขอแล้ว" : "ขอนัดหมาย"}</button>{error && <p className="v2-error">{error}</p>}{submitted && <p className="v2-success">✓ บันทึกเป็น Lead และงานติดตามแล้ว ทีม BIB จะติดต่อเพื่อยืนยันนัด</p>}</article>
    </section>
      </div>
    </section>
    <footer className="v2-simple-footer"><span>BIB × icoone Thailand</span><p>ข้อมูลในหน้านี้ใช้เพื่อประกอบการพิจารณา ไม่ใช่คำวินิจฉัยหรือการรับประกันผลลัพธ์</p></footer>
  </main>;
}
