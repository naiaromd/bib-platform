# BIB Practice Intelligence Platform

## Blueprint สำหรับระบบ SaaS และ MVP สำหรับการทดสอบ

วันที่จัดทำ: 30 กรกฎาคม 2569  
สถานะ: ฉบับสำหรับตรวจทานก่อนพัฒนา

---

## 1. วิสัยทัศน์ของระบบ

BIB Practice Intelligence Platform เป็นระบบบริหารวงจรลูกค้าของ BIB ตั้งแต่รับรายชื่อผู้สนใจ การนัดสาธิต การประเมินรูปแบบการค้า การออกข้อเสนอ การเจรจา การทำสัญญา การส่งมอบ การฝึกอบรม การรับประกัน การบริการหลังการขาย การสั่งซื้อซ้ำ และการติดตามผลประกอบการ

ระบบไม่ควรเป็น CRM ขนาดใหญ่ที่มีเมนูซับซ้อนเหมือน Salesforce แต่ควรใช้หลักเดียวกันในขนาดที่เหมาะกับ BIB:

- ข้อมูลลูกค้าอยู่ที่เดียว
- แต่ละคนเห็นเฉพาะงานและข้อมูลที่เกี่ยวข้อง
- ทุกงานมีผู้รับผิดชอบ สถานะ และขั้นตอนถัดไป
- เอกสารทุกฉบับตรวจสอบย้อนกลับได้
- รูปแบบการค้า A–D2 ถูกควบคุมจากทะเบียนกลาง
- ข้อมูลจากการขาย สัญญา การใช้งาน และบริการหลังการขายเชื่อมกัน
- ระบบเตือนและสร้างงานอัตโนมัติเมื่อเกิดเหตุการณ์สำคัญ

---

## 2. การแบ่งผู้ใช้งาน

### 2.1 ผู้ใช้งานภายใน BIB

| บทบาท | งานหลัก | สิ่งที่ต้องเห็น | สิ่งที่ทำได้ |
|---|---|---|---|
| ผู้บริหาร | อนุมัติข้อยกเว้น ติดตามยอดขายและความเสี่ยง | ภาพรวมทุกบัญชี Forecast งบกำไรขาดทุน ข้อยกเว้น | อนุมัติ ปฏิเสธ ขอข้อมูลเพิ่ม |
| ฝ่ายขาย | ดูแล Lead, Demo, Proposal และ Negotiation | เฉพาะลูกค้าที่รับผิดชอบ งานที่ต้องทำต่อ | สร้าง Lead นัด Demo ขออนุมัติข้อเสนอ |
| ผู้จัดการฝ่ายขาย | กำกับ Pipeline และคุณภาพข้อมูล | Pipeline ของทีม Lead Temperature และ Forecast | มอบหมายงาน เปิด Model และอนุมัติระดับต้น |
| ฝ่ายการเงิน | ตรวจเครดิต ภาษี การชำระ และ Revenue Share | ราคา เงินประกัน MG ภาษี ค่าตอบแทน รายงานยอดขาย | อนุมัติเงื่อนไขการเงิน กระทบยอด |
| ฝ่ายกฎหมาย | ตรวจ Term Sheet และสัญญา | เอกสาร ฉบับแก้ไข ความเห็น และข้อยกเว้น | ขอแก้ไข อนุมัติฉบับส่งลงนาม |
| Brand/Regulatory | ตรวจ Claim และสื่อ | เนื้อหา สื่อ Campaign และแหล่งอ้างอิง | อนุมัติ ขอแก้ไข ระงับการใช้ |
| Trainer | วางแผนฝึกอบรมและรับรองผู้ปฏิบัติงาน | เครื่อง Site ผู้เรียน หลักสูตร และสถานะ | ลงผลฝึกอบรม นัดทบทวน |
| Service | ติดตั้ง รับประกัน บำรุงรักษา และ Ticket | Serial, Warranty, ชั่วโมงใช้งาน และประวัติซ่อม | เปิด/ปิด Ticket บันทึกอะไหล่ |
| ผู้ดูแลระบบ | ผู้ใช้ สิทธิ์ ทะเบียนกลาง และ Audit | การตั้งค่าระบบทั้งหมด | จัดการผู้ใช้และแม่แบบ |

### 2.2 ผู้ใช้งานภายนอก

| บทบาท | พฤติกรรมหลัก | ประสบการณ์ที่ควรได้รับ |
|---|---|---|
| เจ้าของกิจการ/ผู้ตัดสินใจ | ดูผลตอบแทน เงื่อนไข และสถานะความร่วมมือ | ภาพรวมสั้น งานที่ต้องทำ เอกสาร และผลประกอบการ |
| แพทย์/ผู้นำด้านคลินิก | ตรวจหลักฐาน ขอบเขตการใช้ ความปลอดภัย | Evidence Pack, Protocol, Training และ Claim Boundary |
| การเงิน/จัดซื้อของลูกค้า | ขอใบเสนอราคา เอกสารบริษัท และตรวจการชำระ | Quotation, Contract, Invoice, Schedule และ Warranty |
| ผู้ประสานงานสัญญา | กรอกข้อมูล แสดงความคิดเห็น และลงนาม | Contract Intake, Review, Comment, Approve และ E-Sign |
| ผู้จัดการสาขา | ส่งยอดขาย ชั่วโมงเครื่อง และติดตามงาน | Monthly Report, Usage, Reorder และ Service |
| ผู้ปฏิบัติงาน | ดู Protocol เรียน และแจ้งปัญหา | Training, Knowledge, Support และ Checklist |

---

## 3. การแบ่ง Client กับ User

- **Account** คือองค์กรลูกค้า เช่น บริษัท ซีเคแอล เฮลท์ แอนด์ บิวตี้ อินเตอร์เนชั่นแนล จำกัด
- **Site** คือสถานที่ติดตั้งหรือสาขา เช่น LINNA Clinic
- **Contact** คือบุคคลที่เกี่ยวข้องกับ Account
- Contact อาจยังไม่มี Account ได้ เช่น ผู้สนใจจากงาน ผู้แนะนำ Supplier หรือบุคคลในเครือข่ายธุรกิจ
- **User** คือ Contact หรือพนักงาน BIB ที่ได้รับบัญชีเข้าสู่ระบบ
- **Opportunity** คือโอกาสขายหรือโครงการหนึ่งรายการ
- **Contract** คือข้อตกลงหนึ่งฉบับของ Opportunity
- **Device Deployment** คือเครื่องจริงที่ติดตั้ง ณ Site

Contact ไม่จำเป็นต้องเป็น User ทุกคน และ User หนึ่งคนอาจเข้าถึงได้มากกว่าหนึ่ง Site หากได้รับสิทธิ์

การจำแนกบุคคลให้แยกจากการจำแนกองค์กรตามหลัก WOW OS:

- บุคคล: สถานะวงจรลูกค้า บทบาทในการตัดสินใจ กลุ่มบทบาท และความสัมพันธ์กับ BIB
- องค์กร: ประเภทธุรกิจ ประเภทย่อย สถานที่ และความพร้อม
- ความสัมพันธ์: ลูกค้า ผู้สนใจ ผู้แนะนำ Supplier พันธมิตร หรือผู้เกี่ยวข้องใน Ecosystem

Contact Lifecycle ขั้นต้น:

`Subscriber/Interested → Lead → Marketing Qualified Lead → Sales Qualified Lead → Opportunity Contact → Customer → Advocate`

Supplier และ Ecosystem Contact ใช้ทะเบียน Contact เดียวกัน แต่ไม่ถูกนำเข้า Sales Pipeline เว้นแต่มี Opportunity ที่เกี่ยวข้อง

---

## 4. โครงสร้างระบบ

### 4.1 หน้าเริ่มต้นตามบทบาท

ระบบใช้หน้าเริ่มต้นต่างกันตามบทบาท แต่ใช้โครงสร้างร่วม:

1. งานที่ต้องทำวันนี้
2. สิ่งที่รอผู้อื่น
3. รายการเสี่ยงหรือเกินกำหนด
4. ตัวเลขสำคัญ
5. การดำเนินการที่ใช้บ่อย

### 4.2 โมดูลหลัก

#### M1 — Lead & Event Intake

- นำเข้ารายชื่อจาก Event หรือ Spreadsheet
- ตรวจรายการซ้ำด้วยโทรศัพท์ อีเมล และนิติบุคคล
- มอบหมาย Sales Owner
- เก็บแหล่งที่มา ความสนใจ และ Consent
- สร้าง Lead Temperature จากพฤติกรรมจริง

#### M2 — Demo Qualification

- ลูกค้าเปิดลิงก์ Profile ที่ BIB เตรียมไว้
- ยืนยันข้อมูลและเลือก Demo ที่สำนักงานหรือ Demo นอกสถานที่
- ระบบประเมินศักยภาพก่อนอนุมัติ Demo นอกสถานที่
- สร้างตารางนัด ผู้รับผิดชอบ ค่าใช้จ่าย และผล Demo

#### M3 — Account & Persona 360

- ข้อมูลนิติบุคคล Site Contact และ Buying Committee
- Business Segment และ Buying Persona
- Current Service, Traffic, Price Range และ Readiness
- ประวัติ Activity, Documents, Offers, Contract และ Device

#### M4 — Commercial Assessment A–D2

- แบบประเมิน Financial, Traffic, Credit, Site, Clinical และ Operator Readiness
- ระบบแนะนำ Model ที่เหมาะสม
- Sales เห็นเฉพาะ Model ที่ผู้มีอำนาจเปิดให้เสนอ
- การแก้ Deposit, MG, Split, Term หรือ Price ต้องสร้าง Exception

#### M5 — Proposal, Term Sheet & Negotiation

- สร้าง Quotation และ Term Sheet จากข้อมูลกลาง
- Negotiation Terms เป็นตัวเลือกที่ควบคุมได้
- เก็บ Customer Comment รายข้อ
- Revised Terms ต้องสร้างฉบับใหม่
- เปรียบเทียบความแตกต่างระหว่างฉบับ

#### M6 — Review, Approval & Contract

- มุมมอง 3 ส่วน: รายการเอกสาร / รายละเอียด / ความเห็นและการตัดสินใจ
- Review, Comment, Request Changes, Approve
- Role-based Access
- Contract Intake และ KYC
- E-Signature status และ Audit Trail

#### M7 — Delivery, Warranty & Training

- Serial Number, Accessories และ Site
- Delivery Checklist และ Acceptance
- Warranty Sign-off
- Training Plan, Attendance, Test และ Competency
- Reminder สำหรับ Refresher และ Warranty Expiry

#### M8 — Client Portal

- Greeting และ Profile ของลูกค้า
- Commercial Plan และหน้าที่ตามสัญญา
- Treatment Menu และส่วนที่แก้ไขได้
- Protocol ที่ควบคุมฉบับ
- Monthly Report, Hour Counter และ Revenue Share
- Orders, Training, Service, Warranty, Knowledge และ Toolkit
- โปรแกรมมาตรฐาน 40 โปรแกรมและตัวช่วยเลือกแนวทางบริการตาม Persona
- Evidence Room ที่แสดงที่มา ขอบเขตการใช้ และระดับความเชื่อมั่น
- ระบบเก็บผลลัพธ์ Use Case จริง โดยต้องมี Consent และการอนุมัติก่อนนำไปใช้
- Evidence Contribution และ Reward เป็นส่วนขยายในอนาคต ไม่ใช้แต้มตอบแทนก่อนมีนโยบายกำกับ

#### M9 — Service & Reorder

- Ticket, Severity, SLA และ Known Issue
- Preventive Maintenance
- Warranty Eligibility
- Consumable Catalog และ Reorder Recommendation
- เชื่อม Ticket กับ Training หากเกิดจากวิธีใช้งาน

#### M10 — Finance, Commission & Forecast

- Payment Schedule, Revenue Share, MG และ Deposit
- Commission ตาม Model และ Event Trigger
- Reconciliation รายเดือน
- Forecast Revenue, Cost, Commission, Service Cost และ P&L
- Actual เทียบ Forecast

#### M11 — Knowledge, Claim & Document Control

- Product/Model/Market Registry
- Source, Evidence, Claim และ Protocol
- Template Version
- Document Registry และ Expiry
- Change Impact เมื่อ Source หรือ Contract Template เปลี่ยน

#### M12 — Administration & Quality

- User, Role, Permission และ Tenant Access
- Commercial Model Registry
- Automation Rules
- Audit Log
- Data Quality Dashboard
- Developer Health และ Brand Compliance

---

## 5. กระบวนการหลักตั้งแต่ Event ถึง After-sales

`Event Lead → Sales Review → Demo Qualification → Demo → Commercial Assessment → Approved Offer → Negotiation → Contract Intake → Legal/Finance Approval → E-Sign → Delivery → Warranty Sign-off → Training → Active Account → Monthly Reporting → Service/Reorder → Renewal/Conversion/Exit`

### สถานะมาตรฐาน

#### Lead

`New → Reviewing → Contacted → Demo Requested → Qualified → Nurture → Disqualified`

#### Opportunity

`Qualified → Demo Scheduled → Demo Completed → Assessing → Offer Approval → Offered → Negotiating → Agreed → Contracting → Won/Lost`

#### Contract

`Draft → Internal Review → Customer Review → Changes Requested → Approved → Sent for Signature → Partially Signed → Executed → Active → Renewed/Terminated/Expired`

#### Deployment

`Awaiting Payment/Deposit → Preparing → Scheduled → Delivered → Accepted → Training → Active → Service Hold → Retrieval/Ownership Transfer`

---

## 6. Lead Temperature

### คะแนนเชิงพฤติกรรม

| Trigger | คะแนน |
|---|---:|
| ยืนยันนิติบุคคลและข้อมูลติดต่อ | +10 |
| ผู้ติดต่อเป็นผู้ตัดสินใจ | +5 |
| มี Initial Meeting | +10 |
| เข้าร่วม Demo | +5 |
| ผู้ตัดสินใจเข้าร่วม Demo | +10 |
| ขอ Quotation | +10 |
| ส่งหนังสือรับรอง | +10 |
| เปิด Evidence/Term Sheet ซ้ำ ซึ่งเป็นสัญญาณการเจรจา | +10 |
| เปิด Invoice | +10 |
| ชำระเงินก้อนแรก หรือเซ็นหนังสือจะซื้อจะขาย | +20 |
| ไม่มีการตอบกลับ 14 วัน | -10 |
| เลื่อน Demo มากกว่า 2 ครั้ง | -15 |
| ไม่มี Site/License Readiness | -20 |

- Hot: 60 คะแนนขึ้นไป
- Warm: 30–59 คะแนน
- Cold: ต่ำกว่า 30 คะแนน
- Risk Hold: มีเหตุด้าน KYC, Credit, License หรือ Compliance

Demo นอกสถานที่ต้องผ่านคะแนนขั้นต่ำ พร้อมข้อมูลผู้ตัดสินใจ Site และวัตถุประสงค์ Demo

คะแนนเป็นเครื่องมือจัดลำดับงาน ไม่ใช่คำตัดสินแทนฝ่ายขาย กรณีที่ไม่มี Site/License Readiness ต้องพักการ Demo นอกสถานที่ แม้คะแนนรวมอยู่ในระดับสูง

---

## 7. ระบบอัตโนมัติสำหรับ MVP

| เหตุการณ์ | การทำงานอัตโนมัติ |
|---|---|
| นำเข้า Lead จาก Event | ตรวจซ้ำ สร้าง Lead มอบหมายผู้รับผิดชอบ |
| Lead ขอ Demo | คำนวณคะแนนและแนะนำ Office/On-site |
| ขอ Quotation | ขอหนังสือรับรองและข้อมูลออกเอกสาร |
| เลือก Model | ตรวจ Eligibility และสร้าง Approval Task |
| แก้ Split/Deposit/MG/Term | สร้าง Exception Approval |
| ลูกค้า Comment | แจ้ง Document Owner และเปลี่ยนสถานะ |
| ทุกฝ่ายอนุมัติ | ล็อก Final PDF และเปิด E-Sign Step |
| Contract Executed | สร้าง Delivery, Warranty และ Training Tasks |
| ส่งมอบแล้ว | เริ่ม Warranty และสร้าง Training Schedule |
| ใกล้รอบรายงาน | แจ้งลูกค้าและ Account Owner |
| ส่งยอดรายเดือน | คำนวณ Revenue Share และส่ง Finance Review |
| Consumable ต่ำกว่าเกณฑ์ | สร้าง Reorder Suggestion |
| ไม่มี Paid Session 3 เดือนใน D2 | แจ้งเตือน Retrieval Review |
| Warranty เหลือ 60/30 วัน | แจ้ง Account, Service และลูกค้า |

MVP ใช้ In-app Notification และ Task Queue ก่อน ส่วน Email, LINE และ E-Sign API เป็นงานเชื่อมต่อระยะถัดไป

---

## 8. โครงสร้างข้อมูลหลัก

### ข้อมูล CRM

`Account, Site, Contact, User, Role, Lead, Event, Activity, Opportunity, DemoRequest, CommercialAssessment`

### ข้อมูล Commercial

`CommercialModel, ModelVersion, Offer, OfferTerm, Exception, Approval, NegotiationComment`

### ข้อมูลเอกสาร

`Document, DocumentVersion, Template, Review, Comment, SignatureEnvelope, AuditEvent`

### ข้อมูลหลังการขาย

`Device, Deployment, Accessory, Warranty, TrainingSession, Competency, ServiceTicket, Maintenance, Consumable, Order`

### ข้อมูลการเงิน

`PaymentSchedule, InvoiceReference, RevenueReport, RevenueShareCalculation, Deposit, MinimumGuarantee, Commission, ForecastScenario`

### ข้อมูลความรู้

`ProductRegistry, Source, EvidenceRecord, Claim, Protocol, KnowledgeArticle`

ทุก Object ต้องมี `id, tenantId, status, ownerId, createdAt, updatedAt, createdBy, version`

---

## 9. สิทธิ์และความปลอดภัย

- แยกข้อมูลตาม Account/Site
- ลูกค้าไม่เห็น Risk Score ภายใน Commission หรือข้อมูลลูกค้ารายอื่น
- เอกสารภายในไม่แสดงใน Client Portal
- Customer-visible Comment ต้องติดป้ายอย่างชัดเจน
- การอนุมัติใช้ Role + Approval Level + Assigned Record
- ดาวน์โหลดเอกสารสำคัญต้องมี Audit Event
- ข้อมูลจริงของ LINNA ห้ามอยู่ในเว็บไซต์สาธารณะ
- Demo สาธารณะใช้ข้อมูลจำลองหรือข้อมูลที่ลดรายละเอียดระบุตัวตน

---

## 10. Dashboard สำหรับติดตามผล

### Executive Dashboard

- Pipeline และ Weighted Forecast
- Revenue by Commercial Model
- Expected Commission และ Gross Margin
- Exceptions Pending
- Contracts at Risk
- Active Devices และ Utilization

### Sales Dashboard

- Leads to Review
- Demo Follow-up
- Hot/Warm/Cold Leads
- Opportunities by Stage
- Next Action และ Overdue

### Operations Dashboard

- Delivery Readiness
- Training Due
- Warranty Expiry
- Open Tickets และ SLA
- Reorder Alerts

### Finance Dashboard

- Payment Due
- Revenue Reports Pending
- Revenue Share Reconciliation
- Deposit/MG Exceptions
- Forecast เทียบ Actual

### Quality Dashboard

- Missing Required Fields
- Documents Without Version
- Approval Mismatch
- Expired Template/Claim
- Orphan Records
- Automation Failures

---

## 11. ระบบตรวจสอบ 3 มุมมอง

### User View

- งานหลักเสร็จได้ไม่เกิน 3–5 ขั้นตอน
- ปุ่มหลักหนึ่งปุ่มต่อหน้าจอ
- แสดงเฉพาะสิ่งที่ผู้ใช้มีสิทธิ์
- ภาษาไทยเป็นหลักและใช้คำสม่ำเสมอ
- Empty State และ Error State บอกขั้นตอนต่อไป

### Developer View

- Schema Validation
- Required Field Check
- State Transition Check
- Permission Test
- Cross-record Integrity
- Audit Log
- Automation Retry และ Error Queue

### Brand Director View

- Logo, Kanit–Muli และสี CI
- Approved Claim เท่านั้น
- ภาพและข้อความมี Source/Owner
- Preview Desktop/Mobile/Print
- Content Version และ Approval Status

---

## 12. ขอบเขต MVP สำหรับพรุ่งนี้เช้า

### ต้องใช้งานได้

1. Login แบบ Demo และ Role Switch
2. Executive/Sales Dashboard
3. Account 360 สำหรับ LINNA
4. Lead/Event Intake ตัวอย่าง
5. Demo Request และ Qualification
6. Commercial Assessment และ Recommendation
7. Term Sheet A–D2
8. Review/Comment/Request Changes/Approve
9. Contract Status และ E-Sign Simulation
10. Delivery/Warranty/Training Checklist
11. LINNA Client Portal พร้อมข้อมูลจริงที่เหมาะสม
12. Monthly Revenue/Hour Report
13. Service Ticket และ Reorder
14. Forecast/P&L Summary
15. Quality Dashboard และ Test Checklist

### งานที่ทำเป็น Todo ใน MVP

- E-Sign API จริง
- Email/LINE Automation จริง
- Payment Gateway และระบบบัญชีจริง
- OCR หนังสือรับรองอัตโนมัติ
- Calendar Sync
- Device Hour Counter เชื่อมเครื่องโดยตรง
- Salesforce-grade Workflow Builder
- Advanced Forecast Model
- Multi-language Content Workflow
- wiseofwellness.com DNS/Custom Domain หากยังไม่มีสิทธิ์จัดการ DNS

Todo เหล่านี้ต้องมี Owner, Priority, Dependency และ Target Release ในระบบ

---

## 13. แผนพัฒนาแบบ Time-box

### ช่วงที่ 1 — Foundation

- Navigation และ Role
- Schema กลาง
- Status และ Permission
- Dashboard Layout

### ช่วงที่ 2 — Pre-sales

- Lead/Event
- Demo Qualification
- Account 360
- Commercial Assessment

### ช่วงที่ 3 — Commercial & Contract

- Term Sheet
- Negotiation
- Review/Approval
- Contract/E-Sign Simulation

### ช่วงที่ 4 — Delivery & Client Success

- Delivery
- Warranty
- Training
- LINNA Portal
- Monthly Report

### ช่วงที่ 5 — Service, Reorder & Finance

- Ticket
- Reorder
- Commission
- Forecast/P&L

### ช่วงที่ 6 — Quality & Presentation

- Permission Matrix Test
- Data Integrity Test
- Responsive/Print Review
- Demo Accounts
- Seed Data
- Presentation Walkthrough
- Production Link

---

## 14. เกณฑ์รับ MVP

- ผู้ใช้แต่ละบทบาทเห็นเฉพาะข้อมูลที่ได้รับสิทธิ์
- Sales นำ Lead จาก Event ไปถึง Demo และ Offer ได้
- Model C/D/D2 ผ่าน Approval Gate ก่อนสร้าง Contract
- การแก้ Commercial Terms สร้าง Exception
- ลูกค้าตรวจเอกสาร แสดงความคิดเห็น และอนุมัติได้
- Contract Executed สร้าง Warranty, Delivery และ Training Tasks
- LINNA ส่งยอดรายเดือนและ Hour Counter ได้
- ระบบคำนวณ Revenue Share ตาม D2 แบบ VAT-inclusive
- Service Ticket เชื่อม Device และ Warranty
- Reorder แสดงรายการและเหตุผลที่แนะนำ
- Forecast/P&L เปลี่ยนเมื่อ Opportunity, Contract หรือ Revenue Report เปลี่ยน
- Quality Dashboard ตรวจ Missing Data และ State Mismatch ได้
- Desktop, Tablet, Mobile และ A4 Print ใช้งานได้

---

## 15. ข้อเสนอด้านการเผยแพร่

สำหรับการประชุม ควรเผยแพร่เป็น URL ทดสอบที่มีการเข้าสู่ระบบหรือจำกัดรายชื่อผู้เข้าถึงก่อน ไม่ควรนำข้อมูลจริงของ LINNA ขึ้นเว็บไซต์สาธารณะ

โดเมน `wiseofwellness.com` สามารถเชื่อมภายหลังเมื่อ:

1. ยืนยัน Subdomain เช่น `partner.wiseofwellness.com`
2. มีสิทธิ์แก้ DNS
3. กำหนดเจ้าของโดเมนและใบรับรอง
4. ผ่านการทดสอบ Access Control

สำหรับ MVP ให้ใช้ URL ของระบบปัจจุบันและกำหนดผู้ทดสอบเป็นรายบุคคลก่อน
