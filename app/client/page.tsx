"use client";

import { useState } from "react";

type ClientView = "home" | "business" | "academy" | "support";

export default function ClientPage() {
  const [view, setView] = useState<ClientView>("home");
  const [notice, setNotice] = useState("");
  const toast = (text: string) => { setNotice(text); window.setTimeout(() => setNotice(""), 2200); };
  const nav: Array<[ClientView, string, string]> = [["home", "01", "ภาพรวม"], ["business", "02", "พัฒนาธุรกิจ"], ["academy", "03", "การฝึกอบรม"], ["support", "04", "บริการและอุปกรณ์"]];
  return <main className="v2-shell v2-client">
    <header className="v2-brand-header">
      <a href="/client" className="v2-brand-lockup"><img src="/logos/bib-logo.png" alt="BIB" /><span /><img src="/logos/icoone-laser-med.png" alt="icoone laser med" /></a>
      <div className="v2-brand-copy"><b>CLIENT INTELLIGENCE</b><span>ข้อมูลเพื่อพัฒนาบริการและผลประกอบการ</span></div>
      <nav><a href="/platform">สำหรับทีม BIB</a><a href="/explore">สำหรับผู้สนใจ</a><a className="active" href="/client">สำหรับลูกค้า</a></nav>
      <em>LINNA · D2</em>
    </header>
    <section className="v2-layout">
      <aside className="v2-job-nav">
        <span>LINNA CLIENT PORTAL</span>
        <h2>พื้นที่ของคุณ</h2>
        <p>ข้อมูลและบริการตามแผนความร่วมมือ D2</p>
        <nav>{nav.map(([id, no, label]) => <button className={view === id ? "active" : ""} onClick={() => setView(id)} key={id}><i>{no}</i><span><b>{label}</b><small>{id === "home" ? "ภาพรวมและสิ่งที่ต้องทำ" : id === "business" ? "บริการ รายได้ และโอกาส" : id === "academy" ? "ความรู้และความพร้อมของทีม" : "Warranty อุปกรณ์ และงานบริการ"}</small></span><em>↗</em></button>)}</nav>
        <div className="v2-control-note"><b>บริษัท ซีเคแอล เฮลท์ แอนด์ บิวตี้ อินเตอร์เนชั่นแนล จำกัด</b><p>บัญชีนี้แสดงเฉพาะข้อมูลของ LINNA Clinic</p></div>
      </aside>
      <div className="v2-work">
        <section className="v2-client-welcome v2-module-hero"><div><span>สวัสดี ทีม LINNA Clinic</span><h1>ศูนย์ข้อมูลสำหรับ<br />การบริหาร icoone</h1><p>บริษัท ซีเคแอล เฮลท์ แอนด์ บิวตี้ อินเตอร์เนชั่นแนล จำกัด</p></div><aside><span>สถานะความร่วมมือ</span><b>ดำเนินการปกติ</b><small>ทบทวนครั้งถัดไป 30 ก.ย. 2569</small><button onClick={() => toast("เปิดข้อมูลบัญชีแล้ว")}>แก้ไขข้อมูลบัญชี</button></aside></section>
    <section className="v2-client-body">
      {view === "home" && <><section className="v2-kicker-row"><div><span>YOUR PRACTICE AT A GLANCE</span><h2>สิ่งสำคัญของเดือนนี้</h2><p>ยอดขาย การใช้งาน การฝึกอบรม และงานบริการในมุมมองเดียว</p></div><em>กรกฎาคม 2569</em></section>
        <div className="v2-metrics client-metrics-v2">{[["฿227,500", "รายได้ที่รายงาน", "รอตรวจ 1 รายการ"], ["76.5 ชม.", "ชั่วโมงการใช้งาน", "เพิ่มขึ้น 12%"], ["4 คน", "ผู้ผ่านการฝึกอบรม", "ต้องทบทวน 1 คน"], ["1 รายการ", "งานบริการที่เปิดอยู่", "อยู่ใน Warranty"]].map((item, index) => <article key={item[1]}><i>0{index + 1}</i><strong>{item[0]}</strong><span>{item[1]}</span><small>{item[2]}</small></article>)}</div>
        <div className="v2-split"><section className="v2-panel v2-client-next"><header><div><span>NEXT ACTION</span><h3>สิ่งที่ควรทำต่อ</h3></div></header>{[["ส่งยอดเดือนกรกฎาคม", "ภายใน 5 ส.ค.", "ส่งข้อมูล"], ["ลงนามรับทราบ Warranty", "รอผู้มีอำนาจ", "เปิดเอกสาร"], ["ทบทวน Operator 1 คน", "ครบกำหนด 18 ส.ค.", "นัดฝึกอบรม"]].map((item) => <article key={item[0]}><i>○</i><span><b>{item[0]}</b><small>{item[1]}</small></span><button onClick={() => toast(item[2])}>{item[2]}</button></article>)}</section><section className="v2-panel v2-program-preview"><header><div><span>PERSONALISED SERVICE</span><h3>โอกาสพัฒนาบริการ</h3></div><button onClick={() => setView("business")}>ดูทั้งหมด</button></header><strong>40</strong><span>โปรแกรมในคลัง</span><p>ระบบแนะนำ 3 แนวทางที่สัมพันธ์กับบริการปัจจุบันของ LINNA และความพร้อมของทีม</p><button onClick={() => setView("business")}>เปิดคำแนะนำเฉพาะ LINNA</button></section></div>
      </>}
      {view === "business" && <><section className="v2-kicker-row"><div><span>CLIENT INTELLIGENCE</span><h2>พัฒนาบริการจากข้อมูลจริง</h2><p>เชื่อม Treatment Menu, Protocol, Conversion และ Use Case Evidence</p></div><a href="/linna">เปิดข้อมูล LINNA ฉบับเต็ม</a></section><div className="v2-client-opportunities">{[["01", "Body Shape Journey", "ความพร้อมสูง", "แนะนำแพ็กเกจ 6–10 ครั้ง พร้อมข้อความสื่อสารที่อนุมัติแล้ว"], ["02", "Post-procedure Care", "ควรทำ Pilot", "เริ่มจากกรณีที่แพทย์คัดเลือกและเก็บ Outcome อย่างเป็นระบบ"], ["03", "Facial Contouring", "มีหลักฐานไทย", "ใช้ Evidence Brief และ Demo Protocol สำหรับทีมแพทย์"]].map((item) => <article key={item[0]}><i>{item[0]}</i><span>{item[2]}</span><h3>{item[1]}</h3><p>{item[3]}</p><button onClick={() => toast(`ส่ง ${item[1]} ให้ผู้เชี่ยวชาญตรวจแล้ว`)}>ขอคำแนะนำจาก BIB</button></article>)}</div><section className="v2-evidence-loop"><span>USE-CASE EVIDENCE</span><h3>ใช้บริการจริง → เก็บผลลัพธ์ → ตรวจคุณภาพ → นำไปพัฒนาบริการ</h3><p>ข้อมูลต้องมีความยินยอม ใช้ Protocol ที่ควบคุม และผ่านการตรวจทานก่อนเผยแพร่</p></section></>}
      {view === "academy" && <><section className="v2-kicker-row"><div><span>BIB ACADEMY</span><h2>Training ไม่จบเมื่อได้รับ Certificate</h2><p>ติดตามความรู้ การปฏิบัติจริง และกำหนดทบทวนของทีม LINNA</p></div><em>4 Operators</em></section><div className="v2-academy-progress">{[["Safety & contraindications", "Complete", 100], ["Setup, cleaning & care", "Complete", 100], ["Approved treatment workflow", "In progress", 72], ["Practical observation", "Locked", 25]].map((item, index) => <article key={item[0]}><i>0{index + 1}</i><span><b>{item[0]}</b><small>{item[1]}</small></span><em><b style={{ width: `${item[2]}%` }} /></em></article>)}</div></>}
      {view === "support" && <><section className="v2-kicker-row"><div><span>AFTER-SALES SUPPORT</span><h2>เครื่อง อุปกรณ์ Warranty และบริการ</h2><p>ติดตามประวัติและขอความช่วยเหลือโดยไม่ต้องค้นเอกสารหลายแหล่ง</p></div><button onClick={() => toast("เปิดแบบฟอร์มแจ้งปัญหาแล้ว")}>＋ แจ้งปัญหา</button></section><div className="v2-support-grid">{[["เครื่องและ Warranty", "icoone Laser Med", "Warranty 12 เดือนหลังตรวจรับ", "ดูรายละเอียด"], ["ประวัติบริการ", "1 รายการเปิดอยู่", "นัดตรวจ 8 ส.ค. 2569", "ติดตามสถานะ"], ["วัสดุสิ้นเปลือง", "3 รายการควรตรวจ", "Bodywear · Filter · Flaps", "เปิดรายการสั่งซื้อ"], ["คลังความรู้", "12 เอกสารสำหรับ LINNA", "คู่มือ · Protocol · Toolkit", "เปิดคลังความรู้"]].map((item, index) => <article key={item[0]}><i>0{index + 1}</i><span>{item[0]}</span><h3>{item[1]}</h3><p>{item[2]}</p><button onClick={() => toast(item[3])}>{item[3]}</button></article>)}</div></>}
    </section></div></section>
    {notice && <div className="v2-toast">✓ {notice}</div>}
  </main>;
}
