# BIB icoone — Data Blueprint

สถานะ: ฉบับวางโครงจากการตรวจคลังข้อมูล BIB/1_icoone และข้อมูล LINNA  
วันที่: 1 สิงหาคม 2569  
หลักการ: กรอกข้อมูลครั้งเดียว ใช้ต่อได้หลายงาน และทุกตัวเลขตรวจย้อนกลับถึงรายการต้นทางได้

## 1. ข้อสรุปจากการตรวจข้อมูล

คลังข้อมูลครอบคลุมงานสำคัญเกือบครบ ได้แก่ CRM, การขาย, รูปแบบธุรกิจ A–D, บัญชี, การตลาด, การฝึกอบรม, โปรแกรมรักษา, Knowledge Center และ LINNA แต่ข้อมูลกระจายเป็น Excel, CSV, Word, PDF, HTML และหลาย revision จึงยังไม่ใช่ฐานข้อมูลเดียว

ปัญหาหลัก:

1. ชื่อไฟล์ CRM ระบุ 249 Leads แต่ไฟล์นำเข้ามีข้อมูลจริง 247 แถว
2. Lead ไม่มีผู้ติดต่อ 121 ราย และไม่มีเมือง/จังหวัด 132 ราย
3. Owner ทั้ง 247 Lead เป็น “ทีมขาย” จึงยังวัดผลรายบุคคลไม่ได้
4. Contact Log 72 รายการเป็น Open ทั้งหมด และไม่มีวันที่ 14 รายการ
5. Account, Contact, Lead และ Opportunity ยังถูกรวมในแถวเดียวกัน
6. Commercial Terms มีหลาย revision แต่ยังไม่มีสถานะ Current/Superseded ที่ควบคุมจาก Registry
7. ตัวเลข Funnel และ Forecast มีหลายชุดสมมติฐาน ต้องแยก Actual ออกจาก Assumption
8. LINNA มีข้อมูล Session และ Revenue Share ที่พร้อมใช้ แต่ยังอยู่ในไฟล์รายเดือน
9. Training, Program, Protocol และ Treatment Menu มีข้อมูลละเอียด แต่ยังไม่มี ID กลางเชื่อมกัน
10. เอกสาร Marketing และ Evidence ยังต้องเชื่อม Claim ID ก่อนนำกลับมาใช้

## 2. Source of Truth ที่แนะนำ

| ขอบเขต | แหล่งข้อมูลหลักปัจจุบัน | สถานะหลังนำเข้าระบบ |
|---|---|---|
| Lead และ Funnel | CRM Sprint 1 + CRM import 247 leads | CRM Database |
| ประวัติการติดต่อ | ContactLog 72 | Activity Database |
| เป้าหมายและ Funnel Model | Sales Funnel Targets H2 2569 | Target + Assumption Registry |
| Commercial Model | Commercial Policy + Guardrails | Commercial Model Registry |
| Term Sheet | Client Term Sheet revision ที่อนุมัติล่าสุด | Template Registry |
| Contract | Signed PDF + Audit Trail | Contract Registry |
| รายได้/ต้นทุน | Accounting + Invoice/Receipt | Finance Ledger/Monthly Snapshot |
| Stock และ Reorder | FIFO รายเดือน + Sales Forecast | Inventory Movement |
| 40 Programs | 40 Programs Reference | Program Registry |
| Protocol | Master Protocol Matrix | Protocol Registry |
| Treatment Menu | Treatment Menu Master | Menu Registry |
| Training | Training records/attendance | Training & Competency |
| Service/Warranty | Warranty terms + service log | Deployment/Service/Warranty |
| Evidence/Claims | Source Register + Evidence Matrix + Claim Library | Knowledge Registry |
| LINNA revenue share | Revenue Share Tracker + Paid/Complimentary/Training Session | Partner Operation Ledger |

PDF, Word และ HTML เป็นเอกสารแสดงผล ไม่ควรเป็นแหล่งตัวเลขหลักเมื่อมีข้อมูลเชิงโครงสร้างในฐานข้อมูล

## 3. Data Schema กลาง

### 3.1 บุคคลและองค์กร

| Table | หน้าที่ | Field สำคัญ |
|---|---|---|
| `accounts` | องค์กร/คลินิก/โรงพยาบาล | account_id, legal_name, display_name, tax_id, segment, province, license_status, account_status |
| `sites` | สถานที่ติดตั้งหรือสาขา | site_id, account_id, address, province, readiness_status, license_no |
| `contacts` | บุคคลที่เกี่ยวข้อง | contact_id, account_id, name, phone, email, line_id, buying_role, decision_power, consent_status |
| `users` | ผู้ใช้งานภายในและลูกค้า | user_id, contact_id, role_id, account_id, active |
| `roles_permissions` | สิทธิ์ตามบทบาท | role_id, module, view_scope, create, edit, approve, export |

### 3.2 CRM และกิจกรรมสร้าง Lead

| Table | หน้าที่ | Field สำคัญ |
|---|---|---|
| `lead_sources` | Event/Campaign/Referral/Outbound | source_id, type, name, start_date, end_date, budget, owner_id |
| `leads` | บุคคลหรือองค์กรที่ยังไม่ผ่านเกณฑ์ | lead_id, account_id, contact_id, source_id, owner_id, stage, score, temperature, created_at |
| `lead_signals` | หลักฐานที่ใช้ให้คะแนน | signal_id, lead_id, signal_type, points, occurred_at, source_record_id |
| `activities` | โทร LINE อีเมล นัดหมาย | activity_id, lead_id, account_id, channel, trigger, result, activity_at, owner_id |
| `tasks` | งานและขั้นตอนถัดไป | task_id, related_type, related_id, owner_id, due_at, status, priority |
| `demo_requests` | คำขอสาธิต | demo_id, lead_id, location_type, site_id, decision_maker_attending, qualification_score, approval_status |
| `demo_sessions` | ผลการสาธิตจริง | demo_id, trainer_id, held_at, participants, programs, objections, result, next_action |
| `opportunities` | ดีลที่ผ่านเกณฑ์ | opportunity_id, account_id, primary_contact_id, owner_id, stage, expected_value, probability, expected_close_date |

กติกา: Account หนึ่งแห่งมีหลาย Contact, หลาย Lead/Opportunity และหลายสาขาได้ ห้ามสร้าง Account ซ้ำเพราะมีผู้ติดต่อหลายคน

### 3.3 Commercial, Document และ Contract

| Table | หน้าที่ | Field สำคัญ |
|---|---|---|
| `commercial_models` | ค่าเริ่มต้น A/B/C/D/D2 | model_code, version, eligibility, price, deposit, term_months, MG, revenue_share, approval_level |
| `commercial_assessments` | ผลประเมินโมเดลที่เหมาะสม | assessment_id, opportunity_id, traffic_score, credit_score, site_score, recommended_model |
| `offers` | ข้อเสนอแต่ละครั้ง | offer_id, opportunity_id, model_code, template_version, amount, VAT_treatment, status |
| `offer_exceptions` | เงื่อนไขที่ต่างจากมาตรฐาน | exception_id, offer_id, field_name, standard_value, proposed_value, reason, approval_status |
| `approvals` | การอนุมัติ | approval_id, object_type, object_id, approver_role, decision, comment, decided_at |
| `documents` | ทะเบียนเอกสาร | document_id, object_type, object_id, document_type, version, status, file_pointer, hash |
| `document_comments` | ความคิดเห็นต่อเอกสาร | comment_id, document_id, page_or_section, author_id, visibility, comment, resolved_at |
| `contracts` | สัญญาที่ลงนาม | contract_id, account_id, offer_id, effective_date, expiry_date, renewal_date, status |
| `signature_envelopes` | หลักฐาน E-Signature | envelope_id, contract_id, provider, sent_at, signed_at, audit_file, signed_hash |

### 3.4 การส่งมอบ ฝึกอบรม บริการ Warranty และ Reorder

| Table | หน้าที่ | Field สำคัญ |
|---|---|---|
| `devices` | เครื่องแต่ละเครื่อง | device_id, model, serial_number, ownership, status |
| `deployments` | เครื่องที่ติดตั้งกับลูกค้า | deployment_id, device_id, account_id, site_id, installed_at, baseline_hours |
| `accessories_parts` | อะไหล่และวัสดุสิ้นเปลือง | item_id, SKU, name, reorder_point, stock_on_hand, unit_cost |
| `inventory_movements` | รับเข้า/ขาย/ใช้บริการ | movement_id, item_id, movement_type, quantity, related_id, occurred_at |
| `warranties` | ระยะและเงื่อนไขรับประกัน | warranty_id, deployment_id, start_date, end_date, coverage_version, signed_at |
| `service_tickets` | เหตุขัดข้อง | ticket_id, deployment_id, severity, symptom, status, assigned_to, opened_at, closed_at |
| `maintenance_events` | บำรุงรักษาเชิงป้องกัน | event_id, deployment_id, hour_reading, due_hours, scheduled_at, completed_at |
| `training_sessions` | รอบฝึกอบรม/สาธิต | training_id, account_id, site_id, trainer_id, course_version, held_at |
| `training_attendees` | ผลรายบุคคล | attendee_id, training_id, contact_id, knowledge_score, practical_status, trainer_comment |
| `competencies` | ขอบเขตที่อนุญาตให้ทำ | competency_id, contact_id, program_scope, valid_from, expires_at, status |

### 3.5 Program, Protocol, Client Journey และ Evidence

| Table | หน้าที่ | Field สำคัญ |
|---|---|---|
| `programs` | 40 Programs อย่างเป็นทางการ | program_id, category, program_name, effect_area, intended_action, source_page, version |
| `protocols` | ชุดการใช้งานที่อนุมัติ | protocol_id, program_ids, objective, screening_rule, session_plan, locked_parameters, approver, version |
| `treatment_menus` | บริการที่ลูกค้าขาย | menu_id, account_id, protocol_id, service_name, duration, price, status, version |
| `client_intakes` | ความต้องการและคัดกรอง | intake_id, account_id, end_client_ref, goal, preference, contraindication_result, consent_id |
| `treatment_courses` | คอร์สที่ขาย | course_id, menu_id, end_client_ref, sessions_purchased, price, start_date, status |
| `treatment_sessions` | การใช้งานแต่ละครั้ง | session_id, course_id, operator_id, program_id, protocol_version, duration, device_hours, outcome_note |
| `outcome_measurements` | Before/After และผลติดตาม | outcome_id, course_id, timepoint, measure_type, value, unit, media_document_id |
| `consents` | ความยินยอม | consent_id, purpose, version, granted_at, withdrawn_at |
| `knowledge_sources` | Source Register | source_id, type, title, model, jurisdiction, status, effective_date, owner |
| `evidence_records` | สรุปหลักฐานรายชิ้น | evidence_id, source_id, study_type, population, outcome, limitations, evidence_tier |
| `claims` | ข้อความที่อนุญาต | claim_id, wording_th, wording_en, audience, channel, qualifier, evidence_ids, approval_status |
| `content_assets` | สื่อที่ใช้จริง | asset_id, campaign_id, claim_ids, file_pointer, review_status, published_at |

### 3.6 รายได้, Revenue Share, Commission และ Forecast

| Table | หน้าที่ | Field สำคัญ |
|---|---|---|
| `orders` | คำสั่งซื้อเครื่อง/วัสดุ | order_id, account_id, offer_id, order_type, amount, status |
| `invoices_payments` | Invoice และเงินเข้า | transaction_id, order_id, invoice_no, due_date, paid_date, amount, VAT, payment_status |
| `partner_monthly_reports` | รายงานลูกค้า Revenue Share | report_id, account_id, month, gross_revenue, approved_refund, deductible_marketing, net_revenue, usage_hours |
| `partner_sessions` | Paid/Complimentary/Training | partner_session_id, report_id, session_type, service_date, program, duration, collected_amount |
| `reconciliations` | ตรวจยอดรายเดือน | reconciliation_id, report_id, reported_revenue, bank_or_receipt_total, calculated_share, variance, status |
| `commission_rules` | กฎ Sales/Referral/Trainer | rule_id, model_code, tier, role_type, percentage, effective_date, approval_status |
| `commission_earnings` | ค่าตอบแทนรายดีล | earning_id, order_id, beneficiary_id, role_type, rate, basis_amount, payable_amount, status |
| `sales_targets` | เป้าหมายตามเวลา/ทีม/Segment | target_id, period, owner_id, segment, model_code, metric, target, actual |
| `model_assumptions` | สมมติฐาน Forecast | assumption_id, scenario, parameter_code, value, unit, source, effective_date |
| `forecast_snapshots` | ภาพประมาณการแต่ละรอบ | snapshot_id, as_of_date, scenario, revenue, cost, commission, service_cost, gross_profit |

## 4. Input–Process–Output

| Module | Input | Process | Output |
|---|---|---|---|
| Event/Lead Capture | QR form, business type, contact, consent, event | ตรวจซ้ำ, สร้าง Account/Contact/Lead, กำหนด Owner | Lead Card, งานติดตาม, Source Performance |
| Lead Qualification | DM, Need, timeline, site/license, credit, interaction | Lead Score, temperature, SLA, demo eligibility | Hot/Warm/Cold, Next Action, Demo approval |
| Demo | สถานที่, ผู้เข้าร่วม, need, โปรแกรมที่ทดลอง | ตรวจคุณภาพ Lead, บันทึกผล/ข้อกังวล | Demo Report, Opportunity, Follow-up Task |
| Offer/Negotiation | Assessment, commercial model, requested changes | ตรวจ guardrail, exception approval, versioning | Approved Term Sheet/Quotation |
| Contract/E-Sign | KYC, company affidavit, signatory, final terms | Legal/Finance approval, hash, signature trail | Executed Contract, Contract Status |
| Delivery | Contract, payment, site readiness, device allocation | Pre-delivery gate, serial allocation, handover | Deployment Record, Warranty Start |
| Training | attendees, course version, assessment | test + practical sign-off | Competency by person, refresh due |
| Treatment Support | client goal, screening, approved menu | protocol matching ภายในขอบเขตที่อนุมัติ | Session Plan, Follow-up, Outcome Record |
| After Sales | issue, serial, hours, warranty, photo/video | triage, trainer first response, technician escalation | Ticket, SLA, root cause, KB article |
| Reorder | stock movement, usage, forecast, lead time | projected depletion and reorder rule | Reorder alert, purchase requirement |
| Revenue Share | paid sessions, refunds, marketing evidence, hours | monthly close and reconciliation | Share invoice, variance alert, P&L |
| Marketing | campaign brief, audience, claim IDs, budget | content review and monthly approval | Calendar, approved asset, leads, CPA |
| Evidence/RWE | consent, protocol version, outcomes, media | completeness check, de-identification, review | Case Study, Result Book, Evidence Dashboard |
| Management | actual sales, pipeline, costs, service obligations | forecast snapshot and variance | Actionable Target, Forecast P&L, risk list |

## 5. Actionable Target Logic

แยก Funnel สองเส้น ไม่ใช้สูตรเดียวกับลูกค้าทุกกลุ่ม:

### Transactional Funnel

`New Lead → Qualified → Demo → Quotation → Negotiation → Won`

ค่าจากแผนปัจจุบันสำหรับเป้า 6 เครื่อง:

- New Lead 384
- Qualified 96
- Demo 48
- Quotation 29
- Negotiation 20
- Won 6

### Account-based Funnel

`Named Account → Decision Maker → Demo/Presentation → Negotiation → Won`

ค่าจากแผนปัจจุบันสำหรับเป้า 8 เครื่อง:

- Target Account 21
- Demo/Presentation 17
- Negotiation 12
- Won 8 เครื่อง โดยบางดีลมีหลายเครื่อง

Dashboard ต้องแสดง Actual, Target, Gap และ Next Action แยกกัน และทุก conversion assumption ต้องมี effective date และ owner

## 6. Process ควบคุมคุณภาพข้อมูล

1. รับข้อมูลเข้า `staging` ก่อนเสมอ
2. ตรวจ required fields, รูปแบบวันที่, เบอร์โทร, email และ Tax ID
3. ตรวจข้อมูลซ้ำด้วย legal name, phone, email และ normalized clinic name
4. ให้ผู้ดูแลยืนยันรายการที่ระบบจับคู่ไม่แน่ใจ
5. สร้าง ID ถาวรหลังผ่าน validation
6. เก็บ source file, source row และ import batch เพื่อย้อนตรวจได้
7. ห้ามแก้ Actual ย้อนหลังโดยไม่สร้าง Audit Event
8. เอกสารใหม่ต้องอ้าง object ID และ document version
9. Dashboard อ่านจากฐานข้อมูล ไม่อ่านค่าที่พิมพ์ซ้ำในหน้าเว็บ
10. ทุกเดือนรัน Data Quality Report และปิดรายการผิดปกติ

## 7. สิทธิ์การมองเห็น

| กลุ่ม | เห็น | ไม่เห็น/ทำไม่ได้ |
|---|---|---|
| Executive | ภาพรวมทุก Module, approval, P&L | — |
| Sales | Lead/Account ที่รับผิดชอบ, approved offer | internal risk ของคนอื่น, แก้ commercial default |
| Trainer | Demo, Training, Protocol, Outcome ที่ได้รับมอบหมาย | เครดิต/กำไร/สัญญาที่ไม่เกี่ยวข้อง |
| Marketing | Campaign, approved claim, asset, lead attribution | clinical raw data, contract confidential |
| Finance | Contract, invoice, payment, commission, reconciliation | clinical notes |
| After Sales | device, warranty, hours, ticket, parts | sales negotiation และข้อมูลผู้รับบริการเกินจำเป็น |
| Client Owner/Manager | ข้อมูล Account ตนเอง, revenue, staff readiness, service | ลูกค้ารายอื่นและคะแนนความเสี่ยงภายใน |
| Client Operator | Training, approved protocol, task, support | revenue share, contract, staff คนอื่นเกินสิทธิ์ |
| Prospect | evidence pack, demo booking, approved proposal | internal model options, customer data |

## 8. ลำดับนำเข้าข้อมูล

### ระยะ 1 — ใช้งานจริงขั้นต่ำ

1. Account, Contact และ Lead จาก CRM 247 ราย
2. Contact Log 72 รายการ
3. Lead Source และ Owner Mapping
4. Target/Assumption Registry
5. Task/Next Action
6. LINNA Account, Contract Model D2 และรายงานรายเดือน

### ระยะ 2 — Commercial Operations

1. Commercial Model Registry A/B/C/D/D2
2. Offer, Exception, Approval และ Document Version
3. Contract, Signature, Device, Warranty และ Training
4. Order, Payment, Commission และ Forecast

### ระยะ 3 — Partner Intelligence

1. 40 Programs, Protocol และ Treatment Menu
2. Session, Outcome, Consent และ Follow-up
3. Service, Hour Counter, Parts และ Reorder
4. Evidence, Claim และ Content Asset linkage

## 9. เกณฑ์รับระบบ

- ไม่มี Lead ที่ไม่มี `lead_id`, `owner_id` และ `next_action`
- Account ซ้ำใน Active Registry เป็นศูนย์
- Funnel ทุกขั้นตรวจย้อนกลับถึง signal/activity ได้
- Target และ Actual มาจากคนละ field และไม่ถูกเขียนทับกัน
- Offer ทุกฉบับอ้าง Commercial Model Version และ Approval ID
- Signed Contract ตรงกับ Final PDF hash และมี Audit Trail
- Device ทุกเครื่องมี Serial, Site, Ownership และ Warranty
- LINNA monthly report reconcile กับ session และ evidence ได้
- Program/Protocol/Menu ทุกชุดมี version และ approval status
- External content ทุกชิ้นอ้าง Claim ID ที่ยังไม่หมดอายุ
- Forecast P&L สร้างจาก Pipeline, Contract, Revenue Share, Commission และ Service obligation โดยไม่พิมพ์ยอดซ้ำ

## 10. งานที่ต้องทำก่อนเรียกว่า Production-ready

1. ยืนยันชื่อและ User ID ของ Sales/Trainer/After Sales/Finance
2. รวม Lead ซ้ำและแยก Account–Contact
3. ยืนยันเป้าปี: 14 เครื่องเป็น Target ที่อนุมัติหรือ Scenario
4. กำหนด Commercial Model revision ที่เป็น Current
5. ยืนยัน LINNA contract version และสูตร Revenue Share ที่ลงนามจริง
6. สร้าง Authentication และ Row-level Authorization
7. นำ Comment, Activity และ Lead Profile ออกจากข้อมูลในหน้าจอเข้าสู่ฐานข้อมูล
8. สร้าง Import Log, Audit Log, Backup และ Data Retention Policy
9. ตรวจ PDPA สำหรับข้อมูล End Client, Before/After และ Consent
10. ทดสอบ reconciliation, permission และ document version ก่อนเปิดให้ลูกค้า
