# 00 DATA MAP · BIB CANON · อ่านไฟล์นี้ก่อนอ่านตารางใดๆ (คนและ AI)
ฉบับ r03 · 2026-11-23 · คู่กับ Airtable ตาราง `00 README`

## 1. ลำดับการอ่าน
1. ไฟล์นี้ (แผนที่ข้อมูล: มีอะไร ผูกกันยังไง เรียกชื่อยังไง)
2. `../README.md` (กติกาและสถานะ)
3. ตารางที่ต้องใช้ ตามสูตรในข้อ 5
4. ก่อนเขียน Airtable ทำตาม 00 README หัวข้อ 06 (ตาราง ก่อน/หลัง → รอไนน์ OK → เขียน → ลง Change Log)

## 2. รหัส (ID) · ไม่เปลี่ยน ใช้ผูกข้อมูล
| รหัส | คืออะไร | ตาราง | ช่องรหัส |
|---|---|---|---|
| PS01–PS12 | กลุ่มคนไข้ตามสถานการณ์ (Patient Situation · แบ่งแบบ JTBD) | `patient_situations_12.csv` | `ps_id` (รหัสเดิม G01–G12 อยู่ `legacy_id`) |
| P01–P50 | ปัญหา (Concern) | `concerns.csv` | `pain_id` |
| Z1–Z9 | จุดบนร่างกาย (Body Area) | `body_zones.csv` | `zone_id` |
| PRG-001–040 | โปรแกรมเครื่อง (Program) | `programs.csv` | `program_id` |
| PRO-CARD-001–026 | Protocol ต้นแบบผู้ผลิต (Protocol Template) | `protocol_cards.csv` | `protocol_id` |
| — | ขั้นใน Protocol (โปรแกรม · ลำดับ · นาที · ช่วงครั้ง) | `protocol_steps.csv` | `step_id` |
| — | เมนูที่ลูกค้าเห็น (Menu Item) | `menus.csv` · `menus_bib_mix_8.csv` | `menu_key` |
| RC- | เคสไม่ระบุตัวตน (Case Reference) | `cases.csv` · Airtable Cases | `case_ref` |
| EV- / PX- | หลักฐาน (Evidence) | Airtable Research Evidence | Evidence ID |

## 3. ชื่อ · ชื่อกลาง กับ ชื่อที่แสดง
- `canon_name` = ชื่อกลาง ใช้เรียกในทีม ไม่เปลี่ยน
- `label_<ผู้อ่าน>` = ชื่อบนหน้าจอ เลือกตามคนอ่านหน้านั้น: `label_doctor` หน้าหมอ · `label_consumer` หน้าคนทั่วไป
- AI ที่สร้างหน้า: ดูว่าหน้านั้นใครอ่าน แล้วดึงช่อง label ของคนนั้น · ถ้าช่องว่าง ใช้ `canon_name` แล้วแจ้งไนน์
- AI ที่ตอบในทีม: ใช้ `canon_name` + รหัส
- หน้าจอไม่แสดงรหัสให้คนนอกเห็น

## 4. การผูก · ผูกตรงที่เดียว ที่เหลือไล่ต่อ
ลำดับ Solution ที่ถูก: **Problem → Menu → Protocol → Program** (ไนน์กำหนด 23 พ.ย.)
```
Z ◄── P ──► Menu ──► Protocol ──► Program (+นาที)
      │      ↑ ไม่มี Menu → ใช้ Protocol Template ผู้ผลิต (concern_card_match → protocol_steps)
      │                    ↑ ไม่มีทั้งคู่ → ใช้ Program ตรง (concern_program_links)
      ├─► Case      Airtable Cases ช่อง "ปัญหา (P)"
      ├─► Paper     Airtable Research Evidence ช่อง "ปัญหา (P)"
      └─◄ PS        ใช้จับคู่ ปัญหา + ข้อมูลคนไข้ → สร้าง Insight แนบกับ Solution (ไม่ใช่ตัวกรอง)
Fit (คอลัมน์ซ้าย) = สิ่งที่หมอปรับเองได้ 3 ตัว: เพศคนไข้ (Target) · เป้าหมาย (Family / Program Group) · คอร์ส 5/10 (card_5/card_10) → ทุกตัวเปลี่ยน Protocol/ขั้นตอน/นาทีจริง
หัวเครื่อง = ผลจาก Protocol → Program ต่อขั้น (Template Steps.Handpiece) · ตอนนี้ยังว่างทั้ง 113 ขั้น (DATA GAP · เทรนเนอร์กรอก)
Evidence = Paper (Research Evidence · จัด 12 หมวดเป็น 6 คำถามของหมอ) + Case · มีย่อ/ละเอียด
Program = icon ราย 40 ตัว · ย่อ/ละเอียด (ละเอียดจาก Programs.Aim + Examination)
Interaction = Body Map Events → Web Leads → LINE Contacts · Insight รายสัปดาห์ = Body Map Insights
```
| ผูกตรง | ตาราง | ช่อง |
|---|---|---|
| P ↔ Z | `concerns.csv` | `body_zones` (เช่น "6;7") · `body_zone_type` |
| P ↔ Menu | `menu_concern_links.csv` | `pain_id` · `menu_key` (50 คู่ · 36 ปัญหา · รอเทรนเนอร์) |
| Menu ↔ Protocol | `menus.csv` → `menu_protocol_plans_21.csv` | `protocol_reference` |
| Protocol(เมนู) ↔ Program | `menu_protocol_steps.csv` | `Protocol reference` · `Program ID` · นาทีรายโปรแกรมยังไม่มี (DATA GAP · ใช้นาทีรวมของเมนู) |
| P ↔ Protocol Template | `concern_card_match.csv` | `card_5_sessions` · `card_10_sessions` |
| Protocol Template ↔ Program | `protocol_steps.csv` | `protocol_id` · `program_id` · `minutes` |
| P ↔ Program | `concern_program_links.csv` | `pain_id` · `program_id` |
| PS ↔ P | `patient_situation_pain_links.csv` | `ps_id` · `pain_id` · `match` = Primary / Secondary |

ข้อห้ามผูกซ้ำ: PS ไม่ผูกตรงกับ Program / Protocol / Menu / Case · ได้มาจากการไล่ผ่าน P เสมอ

## 5. สูตรตอบคำถามที่พบบ่อย
| คำถาม | ไล่ยังไง |
|---|---|
| คนไข้กลุ่มนี้มีปัญหาอะไร | PS → `patient_situation_pain_links` (Primary ก่อน) |
| จุดนี้บนตัวมีปัญหาอะไร | Z → `concerns.body_zones` มี Z นั้น |
| ปัญหานี้ใช้โปรแกรมอะไร กี่นาที | P → `concern_program_links` → `programs` · นาทีจาก `protocol_steps` |
| ปัญหานี้ใช้เมนู/Protocol ไหน | P → `menu_concern_links` → `menus` → `menu_protocol_plans_21` · ไม่มีเมนู → `concern_card_match` → `protocol_cards` |
| มีเคส/หลักฐานไหม | ค้นรหัส P ในช่อง "ปัญหา (P)" ของ Cases / Research Evidence |
| คนไข้แบบนี้เริ่มสนใจเมื่อไหร่ อยากได้อะไร | `patient_situations_12`: `trigger` · `job` · `avoid` (ชั้น Insight) |

## 6. สถานะ · ดูก่อนเอาไปแสดง
- ช่อง `status` / `group_status` / `label_status` บอกว่าเป็นร่างหรือยืนยันแล้ว
- ใน Airtable หน้าที่คนนอกเห็นดึงเฉพาะแถวที่ติ๊ก `🔒 ใช้ภายนอกได้` (ไนน์ติ๊กเท่านั้น)
- ตอนนี้ PS ทั้ง 12 กลุ่ม และคู่ PS–P เป็น "Creative Draft / Pending BIB Validation" → ใช้ได้ในโหมดภายในเท่านั้น
- เรื่องคลินิก (ปัญหาตรงกับเมนู/Protocol ไหม) เทรนเนอร์เป็นคนตรวจ
