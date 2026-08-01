# BIB Practice Intelligence — Brief Coverage และ Implementation Baseline

วันที่ตรวจ: 1 สิงหาคม 2569

เอกสารนี้ยืนยันว่าโครงสร้างการพัฒนาอ้างอิง brief เดิม ไม่ใช่แนวคิดใหม่แยกออกมา โดยตรวจเทียบกับ:

- `BIB_ICOONE_DATA_BLUEPRINT_TH.md`
- `BIB_SaaS_MVP_Blueprint_TH.md`
- `SaaS-Platform-Blueprint-TH.md`
- Commercial Model A, B, C, D และ D2
- Client Persona, Buying Persona และ Client Journey ที่สรุปจากการสัมภาษณ์

## Coverage หลัก

| Brief เดิม | องค์ประกอบในระบบ | สถานะ |
|---|---|---|
| Event → Lead → Demo | Lead Source, Lead, Opportunity, Activity, Demo Appointment | เริ่มย้ายเข้าฐานกลาง |
| Lead Temperature | Score และ Signal จากพฤติกรรม | มี Score; Signal Registry เป็นรอบถัดไป |
| Account และ Contact | Account, Contact, Account Scope | มีโครงเดิม; กำลังรวมเป็น Source of Truth |
| Commercial Model A–D2 | Model, Assessment, Offer, Exception, Approval | Term Sheet มีแล้ว; Record กลางเป็นรอบถัดไป |
| Review/Comment/Approve | Document, Version, Comment, Decision, Audit | มีฐานจริง; กำลังแก้สิทธิ์ฝั่งระบบ |
| Contract และ E-Sign | Contract, Version, Signature Envelope | โครงเอกสารมี; E-Sign จริงยังเป็น Todo |
| Delivery/Warranty | Device, Deployment, Warranty | มีฐานเริ่มต้น |
| Training/Competency | Training Session, Attendee, Competency | ข้อมูลกิจกรรมมี; รายบุคคลเป็นรอบถัดไป |
| Service/Maintenance | Service Ticket, Hour Counter, Maintenance | มีบางส่วน; ต้องรวมตารางซ้ำ |
| Reorder/Inventory | Item, Movement, Reorder Alert | อยู่ใน Blueprint; ยังไม่พัฒนาเต็ม |
| LINNA D2 | Revenue Report, Share, Marketing Deduction, Review | มีรายงานจริงและเงื่อนไข 40/60 รวม VAT |
| 40 Programs/Protocol | Program, Protocol, Treatment Menu | มีฐานเริ่มต้น; ต้องเชื่อม Knowledge Center |
| Outcome/Result Book | Intake, Session, Outcome, Consent, Media, Reward | อยู่ใน Blueprint; เป็นระยะ Client Intelligence |
| Forecast P&L | Opportunity, Contract, Actual Revenue, Cost, Commission | ต้องย้ายค่าจำลองออกและคำนวณจากข้อมูลจริง |
| SaaS สำหรับบริษัทอื่น | Tenant, Membership, Module, Blueprint Version | เริ่ม P0; ยังห้ามเปิดบริษัทที่สองจนผ่าน Isolation Test |

## ขอบเขตรอบดำเนินการปัจจุบัน

1. บังคับตัวตนและสิทธิ์จากฝั่งระบบ
2. แยกข้อมูลด้วย Tenant
3. สร้าง CRM กลางสำหรับ Lead, Opportunity, Activity และ Demo
4. ย้ายข้อมูลที่เขียนค้างในหน้าเว็บเข้าฐานข้อมูล
5. แสดงที่มาและสถานะของตัวเลขแทนการแสดงค่าจำลองเป็นข้อเท็จจริง

ฟังก์ชันระยะถัดไปยังคงอยู่ใน Blueprint และไม่ได้ถูกตัดออก ได้แก่ E-Sign จริง, LINE/Email Automation, Inventory, Result Book, Reward, Protocol Recommendation และ Client Intelligence
