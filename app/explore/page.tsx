"use client";

import { useState } from "react";

export default function ExplorePage() {
  const [goal, setGoal] = useState("สร้างบริการใหม่");
  const [demo, setDemo] = useState("BIB Experience Center");
  const [submitted, setSubmitted] = useState(false);
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
        <p>เลือกดูเฉพาะข้อมูลที่ช่วยให้ตัดสินใจ</p>
        <nav>
          {[["01", "สำรวจความต้องการ", "เลือกเป้าหมายของสถานประกอบการ", "#understand"], ["02", "ทบทวนหลักฐาน", "เข้าใจเทคโนโลยีและข้อจำกัด", "#evidence"], ["03", "ขอนัดสาธิต", "เลือกสถานที่และรูปแบบที่เหมาะสม", "#demo"]].map((item, index) =>
            <a className={index === 0 ? "active" : ""} href={item[3]} key={item[0]}><i>{item[0]}</i><span><b>{item[1]}</b><small>{item[2]}</small></span><em>↗</em></a>
          )}
        </nav>
        <div className="v2-control-note"><b>หลักการให้ข้อมูล</b><p>แสดงทั้งประโยชน์ หลักฐาน และข้อจำกัด เพื่อช่วยให้ตัดสินใจอย่างเหมาะสม</p></div>
      </aside>
      <div className="v2-work">
        <section className="v2-explore-hero v2-module-hero">
          <div><span>สำหรับแพทย์ เจ้าของกิจการ และผู้พัฒนาบริการ</span><h1>เริ่มจากคำถามของคุณ<br />ไม่ใช่เริ่มจากการขายเครื่อง</h1><p>สำรวจแนวทางใช้งาน หลักฐาน ข้อจำกัด และความเหมาะสมกับสถานประกอบการ ก่อนเลือกขั้นตอนต่อไป</p><a href="#understand">เริ่มประเมินความสนใจ</a></div>
          <aside><i>40</i><b>โปรแกรมที่ออกแบบไว้</b><p>ระบบจะแสดงเฉพาะข้อมูลที่เกี่ยวข้องกับเป้าหมายและบทบาทของคุณ</p></aside>
        </section>
    <section className="v2-public-flow" id="journey">
      <article id="understand"><i>01</i><span>UNDERSTAND</span><h2>คุณต้องการพัฒนาเรื่องใด</h2><div className="v2-choice-grid">{["สร้างบริการใหม่", "ปรับรูปทรงและความงาม", "ดูแลเนื้อเยื่อหลังหัตถการ", "ฟื้นฟูและ Wellness"].map((item) => <button className={goal === item ? "active" : ""} onClick={() => setGoal(item)} key={item}>{item}</button>)}</div></article>
      <article id="evidence"><i>02</i><span>BUILD CONFIDENCE</span><h2>ข้อมูลที่ช่วยให้ตัดสินใจ</h2><div className="v2-evidence-cards"><section><b>หลักการทำงาน</b><p>Mechanical Stimulation และขอบเขตของเทคโนโลยี</p><em>อ่าน 4 นาที →</em></section><section><b>หลักฐานทางคลินิก</b><p>สรุปผลการศึกษา พร้อมข้อจำกัดและสถานะสิ่งพิมพ์</p><em>เปิด Evidence Brief →</em></section><section><b>กรณีใช้งานจริง</b><p>เส้นทางบริการและสิ่งที่ควรวัดหลังเริ่มใช้งาน</p><em>ดู Use Case →</em></section></div></article>
      <article id="demo"><i>03</i><span>NEXT STEP</span><h2>เลือกวิธีทำความรู้จักที่เหมาะสม</h2><div className="v2-demo-select"><label><input type="radio" checked={demo === "BIB Experience Center"} onChange={() => setDemo("BIB Experience Center")} /><span><b>ทดลองที่ BIB Experience Center</b><small>เหมาะสำหรับการทดลองครั้งแรก และไม่ต้องประเมินค่าเดินทาง</small></span></label><label><input type="radio" checked={demo === "On-site"} onChange={() => setDemo("On-site")} /><span><b>ขอประเมินการสาธิตที่สถานประกอบการ</b><small>ทีมงานจะตรวจความพร้อม ผู้ตัดสินใจ และเป้าหมายก่อนยืนยัน</small></span></label></div><button className="v2-primary" onClick={() => setSubmitted(true)}>ส่งความสนใจและขอนัดหมาย</button>{submitted && <p className="v2-success">✓ รับข้อมูลแล้ว ทีม BIB จะส่งชุดข้อมูลสำหรับ “{goal}” และยืนยันรูปแบบ {demo}</p>}</article>
    </section>
      </div>
    </section>
    <footer className="v2-simple-footer"><span>BIB × icoone Thailand</span><p>ข้อมูลในหน้านี้ใช้เพื่อประกอบการพิจารณา ไม่ใช่คำวินิจฉัยหรือการรับประกันผลลัพธ์</p></footer>
  </main>;
}
