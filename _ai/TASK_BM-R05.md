# TASK · BM-R05-20261123-v003

## 1/12 · Heartbeat
- เริ่ม: 2026-11-23 12:15:55 +07
- ผู้ทำ: Claude Code บนเครื่องไนน์ (session เดิมที่ทำ BIB CANON r01 — ไม่ใช่ session ใหม่ตามที่ใบงานสมมติ · ยึดใบงานและไฟล์ที่ใบงานชี้เป็นหลัก)
- สาขา: `see-the-unseen-r03`
- `git status`: ไม่มีไฟล์ที่ track แล้วถูกแก้ · untracked 2 รายการ: `.claude/` · `_ai/`
- `git log -1`: `d384513f4cd5bca7ffa9a879c9c427038fc2aae4` · Nine · Mon Nov 23 00:54:14 2026 +0700 · "Downgrade Tailwind to v3.4 and pin Next 15.1.6 (build fix)"
- ใบงาน: `_ai/PROMPT_BodyMap-r05.md` (34,883 bytes · แก้ล่าสุด 12:11)

## 2/12 · ตรวจของจริง (อ่านอย่างเดียว · 2026-11-23 12:16–12:30)
- `SHA256SUMS`: ผ่าน 15/15 ไฟล์
- `00 README`: อ่านครบ 11 แถว (หัวข้อ 01–11 · r01)
- Schema จริงเทียบใบงานข้อ 2: **ตรงทุก ID** (Programs · Handpieces · Protocol Templates · Template Steps · Clinic Menu · Protocols · Cases · Research Evidence · Web Leads · Change Log) · ช่อง 🔒 ครบ 5 ตาราง · automation `wflE4d6synThqEuil` มีอยู่ สถานะ undeployed (ไม่แตะ)
- ตารางใหม่ 6 ตาราง (Concerns · Patient Situations · Body Map Content/Events/Insights · LINE Contacts): ยังไม่มีใน base ตามคาด
- จำนวนแถวจริง: Programs 40 · Handpieces 11 · Protocol Templates 26 · Template Steps 113 · Research Evidence 70 · Cases 82 (RC 80 + demo 2) · Protocols 1 (demo) · Clinic Menu 1 (demo) · Change Log 5 · Todo 19

### DATA GAP / สิ่งที่ไม่ตรงกับที่ใบงานคาด
1. **ชั้น Protocol Template ไม่ถูกใช้เลยภายใต้ลำดับ Menu ก่อน** · ปัญหาที่มีการ์ด 5/10 ทั้ง 23 ข้อ มีเมนูอยู่แล้วทุกข้อ → ไล่ตาม 4.3 ได้: เมนู 36 · Protocol Template 0 · Program ตรง 6 (P10 P29 P34 P35 P36 P40) · ไม่มีอะไรเลย 8 (P05 P08 P09 P16 P37 P44 P45 P50) · กระทบ: ตัวปรับ Fit "คอร์ส 5/10" และ "เพศ" ไม่เปลี่ยนผลใดเลย (ข้อ 4.2 สั่งให้ตัด) และกรณีทดสอบ Protocol Template คอร์ส 5/10 ในงาน 12 ไม่มีข้อมูลจริงให้ทดสอบ → **รอไนน์ตัดสิน** (ไม่กระทบแผน Airtable)
2. ไม่มี `.env.local` ใน repo (มีแค่ `.env.example`) → อ่าน/เขียน Airtable ทำผ่าน Airtable MCP ได้ แต่ `npm run dev` + ทดสอบ API (งาน 6–9, 12) ต้องรอไนน์ใส่ token ในไฟล์เอง
3. Cases: ใช้กับหมอได้ 44 แถว · ในนั้น 10 แถวไม่มีรหัส P (RC-029 038 039 040 041 042 043 044 045 046) → ผูก Concern ไม่ได้ · คุณภาพ A = 0 แถว · คุณภาพ B ที่ใช้กับหมอได้ = 7 (RC-004 006 007 008 009 010 014) · เคส Event (B) 36 แถวเป็น "ภายใน" เท่านั้น · อายุต่ำกว่า 18 = 2 (RC-015 RC-033 · ห้ามใช้ภายนอกอยู่แล้ว)
4. Research Evidence: มีรหัส P 57/70 แถว · มีรหัส PRG 8 แถว · เอกสารลับ 2 (EV-023 EV-026) · ไม่มี "หมอ" ในช่องใช้ตอบใคร 4 (EV-034 035 036 038 — ใบงานไม่ได้สั่งกรอง)
5. ปัญหาที่ไม่มีทั้งหลักฐานและเคส 15 ข้อ: P03 P04 P05 P06 P07 P08 P09 P10 P15 P16 P21 P37 P44 P45 P50
6. เมนู BIB 21: Cloud Facial Signature มีแผนแต่ไม่มีขั้นโปรแกรม · 3 ขั้นเป็น "ให้เลือก" ไม่ระบุโปรแกรมเดียว (Anti-Cellulite · Body Contouring · Body Toning) · นาทีรายโปรแกรมว่างทั้งหมด (ตามที่ใบงานบอก)
7. Programs.Default Minutes ว่างทั้ง 40 (Todo ลำดับ 32 เป็นงานเทรนเนอร์) → ชั้น Program ตรงจะแสดงนาที "—"

## 3/12 · แผน Airtable
- เขียน `_ai/AIRTABLE_PLAN_BM-R05.md` แล้ว · **ยังไม่ได้เขียนอะไรลง Airtable** · รอไนน์ตอบ "OK แผน BM-R05"
- 12:40 ไนน์กำหนด: "Menu คือ Protocol ในฝั่ง label ลูกค้า" → แผนปรับเป็น p02: ปัญหาผูกกับ Protocols (ไม่ใช่ Clinic Menu) · Clinic Menu = ชื่อหน้าลูกค้าของ Protocol · หน้าหมอใช้คำว่า Protocol · ข้อนี้ต่างจากใบงาน 4.3 ที่เขียน Menu เป็นชั้นแยก → ยึดคำไนน์ล่าสุด · ยังรอ "OK แผน BM-R05"
- 12:42 ไนน์ตอบ "OK แผน BM-R05" (แผน p02 · ตัวเลือกที่แนะนำ F1 ข้อ 1 · F2 ข้อ 1)

## 4/12 · เขียน Airtable ตามแผน p02 (2026-11-23 12:44–12:50) · ตรวจแล้ว
| รายการ | แผน | เขียนจริง | ตรวจ |
|---|---:|---:|---|
| ตารางใหม่ | 6 | 6 | รหัสอยู่ใน `_ai/AIRTABLE_IDS_BM-R05.md` |
| ช่องใหม่ในตารางเดิม | 14 | 14 | Programs 3 · Research Evidence 5 · Cases 2 · Web Leads 3 · Protocols 1 |
| Protocols (BIB) | 21 | 21 | แถว demo ไม่ถูกแตะ |
| Clinic Menu (ชื่อหน้าลูกค้า) | 21 | 21 | ผูก Protocol · ไม่ใส่ราคา · 🔒 ว่าง |
| Protocol Versions v1 | 21 | 21 | Draft |
| Protocol Version Steps | 42 | 42 | 39 ผูก Program · 3 เป็น "ให้เลือก" |
| Concerns | 50 | 50 | อ่านกลับเทียบ CANON ทุกช่อง = 0 จุดต่าง |
| Patient Situations | 12 | 12 | |
| link Concerns↔Programs | 124 | 124 | อ่านกลับแล้วตรง |
| link Concerns↔Template คอร์ส 5 / 10 | 23 / 23 | 23 / 23 | ตรง |
| link Concerns↔Protocols (BIB) | 50 | 50 | ตรง |
| link Concerns↔Cases | 91 | 91 | ตรง |
| link Concerns↔Research Evidence | 218 | 218 | ตรง |
| link PS↔Concerns หลัก / รอง | 50 / 78 | 50 / 78 | ตรง (อ่านจากฝั่ง Concerns) |
| link Research Evidence↔Programs | 24 | 24 | เขียนสำเร็จ 8 แถว · ยังไม่ได้อ่านกลับแยก |
| รวม link | 681 | 681 | |

- **คู่ที่หาไม่เจอ / ไม่ผูก (ไม่เดา):** เคส 10 แถวไม่มีรหัส P (RC-029 038 039 040 041 042 043 044 045 046) · หลักฐาน 13 แถวไม่มีรหัส P · Cloud Facial Signature ไม่มีขั้นโปรแกรมในต้นทาง
- **ทุกรหัส P/PRG ในช่องข้อความกลายเป็น link ครบ** (P ใน Cases 91/91 · P ใน Evidence 218/218 · PRG ใน Evidence 24/24)
- **Change Log:** 19 แถว (5 เดิม → 24) · หมายเหตุ: เขียน Airtable จริง 42 ครั้ง (สร้างตาราง 6 · สร้างช่อง 14 · ข้อมูล 22 ชุด) แต่ลง Change Log แบบรวมบางชุดของตารางเดียวกันเป็นแถวเดียว (ระบุจำนวนชุดไว้ในชื่อรายการ) — ไม่ตรงตัวอักษร "1 แถวต่อ 1 ครั้ง" ถ้าไนน์ต้องการแยกครบ 42 แถว บอกได้
- ไม่ได้แตะ: ช่อง 🔒 ทุกตาราง · แถว demo · automation `wflE4d6synThqEuil` · ตาราง Todo (ยังไม่ได้อัปเดตสถานะงาน 1–4 เพราะไม่อยู่ในแผนที่อนุมัติ)
- วิธีทำ: เขียนผ่าน Airtable MCP ชุดละไม่เกิน 10 แถว · ไฟล์ทำงานอยู่ `_ai/work_bm_r05/` (payload + รหัสแถว)

## 5/12 · ร่างเนื้อหา
- ส่งตัวอย่างในแชท (Program 3 · หลักฐาน 3 · Insight 3) · รอไนน์ตอบ "OK เนื้อหา"
- 13:05 ไนน์ติโทนตัวอย่างรอบ 1 ("งานบวม" ไม่มี) → ร่างรอบ 2 ตาม skill bib-voice · บทเรียนลง `_ai/บันทึกบทเรียน.md` · ยังรอ "OK เนื้อหา"
- 13:20 ไนน์ตัดสิน: ใช้คำ "น้ำเหลือง" ตามคู่มือผู้ผลิตในหน้าหมอ · ต่างจากใบงานข้อ 1 ที่จำกัดคำกล่าวอ้างไว้ที่ข้อบ่งใช้ FDA 4 ข้อ → ยึดคำไนน์ล่าสุด · ไนน์ขอทำ MVP ให้ทีมตรวจก่อนเพราะห่วง credit → เสนอขอบเขต MVP รอไนน์เลือก
