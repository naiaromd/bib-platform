# ใบงาน · Body Map สำหรับหมอ r05 · v004
Assignment ID: **BM-R05-20261123-v004**
**ยกเลิก v001–v003** (BM-R05-20261123 · -v002 · -v003) · ใช้ไฟล์นี้แทนทั้งหมด · r02–r04 ใน Claude artifact ใช้เป็นต้นแบบหน้าตาเท่านั้น
ผู้เขียน: Claude (cloud · ตรวจค่าใน Airtable และ CANON แล้ว 23 พ.ย. 2026 11:50) · ผู้ทำ: Claude Code บนเครื่องไนน์ · เจ้าของงาน: ไนน์

---

## 0 · v004 · อ่านส่วนนี้ก่อน (23 พ.ย. 13:55 · ไนน์ตรวจหน้า preview แล้ว)
**สถานะ:** หน้า https://bib-bodymap-preview.pages.dev/bodymap ทำไปแล้วบางส่วน · ทำต่อจากของเดิม ไม่เริ่มใหม่ · งานที่เสร็จแล้วใน Todo ให้คงไว้

### 0.1 ไนน์ไม่ว่างอนุมัติ → ทำต่อเองจนจบ ตามกรอบนี้
- **ทำได้เลยไม่ต้องรอ:** สร้างตาราง/ช่องใหม่ · เพิ่มแถวใหม่ · เขียนเนื้อหาสถานะ "ร่าง" · แก้โค้ดบนสาขา · deploy ไปที่ preview เดิม (bib-bodymap-preview) · ทุกการเขียน Airtable ลง Change Log ประเภท "เขียนแล้ว" และเขียนแผนไว้ใน `_ai/AIRTABLE_PLAN_BM-R05.md` ก่อนเขียนทุกครั้ง (แทนการรอ "OK แผน" / "OK เนื้อหา")
- **หยุดเฉพาะเรื่องเหล่านี้ (เขียนลง TASK แล้วข้ามไปทำงานอื่น):** แก้หรือลบแถวที่มีอยู่เดิม · ติ๊ก 🔒 · เปิดใช้ automation จริง · ส่งข้อความถึงคนจริง · deploy production/โดเมนจริง · บริการที่เสียเงิน · LINE (ยังไม่มี token)

### 0.2 แก้หน้าที่ทำผิด (ทำก่อนงานอื่น)
1. ทั้งหน้าไม่มีแถบเลื่อนแนวนอน · ชิปตัดบรรทัดในคอลัมน์ · ทดสอบที่กว้าง 1280 และ 390 (มือถือ)
2. **Fit ต้องเปลี่ยนผลจริง:** คอร์ส 5/10 เลือก Protocol ใบเดียว (ค่าเริ่มต้น 5) · เพศกรองรูป+ปัญหา+Protocol · เป้าหมายกรองปัญหา/Protocol · Solution แสดง **คำตอบเดียว** ตามลำดับ Menu → Protocol → Program ที่เข้ากับ Fit · ตัวเลือกอื่นซ่อนไว้ใต้ "ดูทางเลือกอื่น"
3. ไม่แสดงรหัส (P17 · RC-009 · EV-016) ในโหมดนำเสนอ · โหมดภายในแสดงเป็นตัวเล็กได้
4. ปัญหาที่เกิดได้ทุกจุด (แผลเป็น/บวม: `body_zone_type` ไม่ใช่ "ประจำจุด") แยกไว้ใต้ชิปที่จุดนั้นเป็นกลุ่ม "เกิดได้ทุกบริเวณ" แบบพับไว้ · ชิปหลักโชว์แค่ปัญหาประจำจุด
5. หัวข้อเป็นภาษาไทย (Fit → ปรับตามคนไข้ · 01 Area → บริเวณ · ฯลฯ) · ฟอนต์เดียวทั้งหน้าตามของเดิมใน bib-platform
6. ป้ายสถานะ ("รอเนื้อหาย่อ" · "ร่าง (สกัดอัตโนมัติ)" · "ต้องหาไฟล์เต็ม") แสดงเฉพาะโหมดภายใน
7. ปลายคอลัมน์ขวามี **ฟอร์มติดต่อ + ปุ่ม LINE** เสมอ (LINE ยังไม่มี token → ปุ่มพาไปหน้าขอบคุณพร้อมรหัสอ้างอิง แล้วเขียนว่า "ทีมจะติดต่อกลับ" แทน)

### 0.3 เอาของที่มีแล้วใน Explorer มาใช้
- ใช้ component เดิมจาก `app/explorer/_components/` (เช่น `Stage3Handpiece.tsx` การเลือกหัว + LED/Laser + แรงดูดจำลอง · `MechanismDiagram.tsx`) **โดย import หรือคัดลอกเป็น component ใหม่ใน `app/bodymap/`** · ไม่แก้ไฟล์ใน explorer
- **การเลือกหัว** อยู่ในขั้น How ไม่ใช่ใน Fit · คู่มือผู้ผลิตกำหนดให้หมอเลือกหัวตามบริเวณเอง (Template Steps ทุกขั้นติ๊ก "Doctor Must Select Area And Head") · ใช้ข้อมูล `lib/handpieces.ts` · LED/Laser เปิดได้เฉพาะ RoboSolo · ค่าที่เลือกเก็บเป็น event และใส่ใน JSON ของลีด
- ใช้ไอคอนโปรแกรม ภาพหัวเครื่อง และสีจาก `lib/assets.ts` · `lib/programs.ts` ที่ Explorer ใช้อยู่

### 0.4 Insight = สรุป "โอกาสของ Treatment นี้" สำหรับหมอ · เตรียมไว้ก่อน ไม่สร้างสดบนหน้า
- เตรียมล่วงหน้า 1 ชิ้นต่อ **ปัญหา × คอร์ส (5/10)** เก็บใน Body Map Content สถานะ "ร่าง" · หน้าแสดงชิ้นที่ตรงกับที่หมอเลือก
- เนื้อหาแต่ละชิ้น (สั้น อ่าน 20 วินาที น้ำเสียง agency):
  1. **คนไข้กลุ่มไหนมาด้วยเรื่องนี้** — จาก PS ที่เป็น Primary ของปัญหานั้น (trigger · job · avoid) เขียนด้วยภาษาหมอ
  2. **โอกาสของคลินิก** — เมนูที่ขายได้ · คอร์สกี่ครั้ง กี่นาทีต่อครั้ง · ต่อยอดไปโปรแกรม/บริเวณไหนได้ (จากปัญหารองของ PS เดียวกัน)
  3. **หลักฐานที่ใช้คุยกับคนไข้** — Paper/Case ที่หนักที่สุด 1 ชิ้น
- ตัวเลขทุกตัวต้องมาจากข้อมูลจริงในตาราง · ไม่มีราคา/รายได้คาดการณ์ (ยังไม่มีราคายืนยัน) · อยู่ในขอบเขตคำกล่าวอ้างข้อ 1
- ปุ่ม "ดู Insight คนไข้กลุ่มนี้" เปลี่ยนเป็น "โอกาสของ Treatment นี้"

### 0.5 ลำดับทำใน v004
0.2 แก้หน้า → 0.3 ใส่ของจาก Explorer → งาน 5 (เนื้อหาย่อ/ละเอียด + Insight 0.4) → งาน 8–9 (event + ลีด) → งาน 11 (automation สร้างไว้แต่ไม่เปิด) → งาน 12 ตรวจปุ่ม → deploy preview เดิม → อัปเดต Todo + เขียนสรุปใน TASK ให้ไนน์อ่านตอนกลับมา (อะไรเปลี่ยน · ลิงก์ preview · สิ่งที่รอไนน์)

---

## 1 · ตัวตนและบริบท
- คุณคือ Claude Code ทำงานใน repo `bib-platform` สาขา `see-the-unseen-r03` (Next.js 15 · Cloudflare Pages · edge runtime)
- session นี้เริ่มใหม่ ไม่มีความทรงจำจากแชทก่อน ทุกอย่างที่ต้องรู้อยู่ในไฟล์นี้และไฟล์ที่ไฟล์นี้ชี้
- **ผู้อ่านหน้า = หมอที่กำลังตัดสินใจซื้อเครื่อง** · คำถามในใจหมอ: "เครื่องนี้ทำอะไรได้บ้าง ปรับอะไรได้ ใช้กับคนไข้ของผมยังไง มีอะไรพิสูจน์" · เป้าหมายของหน้า: หมอเห็นความสามารถของเครื่องผ่านปัญหาคนไข้ → ปรับเองแล้วเห็น Protocol เปลี่ยน → เชื่อเพราะ Paper/Case → ทิ้งข้อมูล → คุยต่อทาง LINE OA
- แบรนด์: "แม่นแบบการแพทย์ เบาแบบการดูแล" · พิสูจน์: แม่น · ซ้ำได้ · วัดได้ · Minimal · Editorial · text น้อย · icon นำ
- **น้ำเสียงเนื้อหา = Marketing Agency**: มั่นใจ สร้างสรรค์ เปิดด้วยสิ่งที่หมอได้ ไม่ตั้งรับ ไม่ออกตัว ไม่เขียนกรอบ "ห้าม" · ทุกประโยคยังอยู่ในขอบเขตคำกล่าวอ้าง: "FDA 510(k) cleared" (K211272) · ข้อบ่งใช้ 4 ข้อ: บรรเทาปวดกล้ามเนื้อเล็กน้อย · บรรเทากล้ามเนื้อเกร็ง · ช่วยการไหลเวียนเลือดเฉพาะที่ชั่วคราว · ลดลักษณะเซลลูไลต์ชั่วคราว · และช่อง "พูดได้แค่ไหน" ของหลักฐานแต่ละชิ้น

## 2 · ระบบและรหัส · ใช้ ID เท่านั้น ห้ามใช้ชื่อแทน ID
**Airtable base** `app2HcsMi1mmqTLJi` · อ่านตาราง `00 README` (`tblueDmxZUHREkOEq`) ให้จบก่อนเขียนอะไรทั้งสิ้น · ทุกการเขียนลง `Change Log` (`tblKSV5ENmERlbMLA`) 1 แถวต่อ 1 ครั้ง

| ตาราง | ID | ช่องที่ใช้ (ID) |
|---|---|---|
| Programs (40) | `tblCls7Ra523NAFZi` | Program ID `fldVsuhHbYugeVaOJ` · Program Name `fldke8dNLmkJg5LPG` · Group `fldK8Q8ScUiejGjKv` (base/focus/healthcare) · Aim `fldNqjZU66Jvg7Fkt` · Examination `fldOx3G3N088WvJNl` · Default Minutes `fldVu3FROhL7OtWEy` · Head Compatibility `fldYf6InGtWCeO9bl` · 🔒 `fldO624FM2RiMjL9i` |
| Handpieces | `tblTlTmHcgILJ4CnN` | Handpiece ID `fld11TgLahf76zLWK` · Kind `fldmjzLtSPqVlgWjD` · Reported Light Capabilities `flddGIu3hTmJvRNew` |
| Protocol Templates (26) | `tblz6u5DukC3p75e4` | Template ID `fldv6pDwpzNTPNYFI` · Family `fldeMrBMHrqOjorWi` (Toning/Reshaping/Anti-Ageing/Drainage) · Sessions `fldzrQggQMbc53Orj` · Target `fldVuKSGkZvyKClZt` · Area `fldnKtBMjRT3hA7Tt` · Assessment `fldDrSTzFvyVfDEsU` · Aim `fldaxzvREAeF4W4qm` · 🔒 `fldj6i44jJEpoJcTB` |
| Template Steps (113) | `tblOZl9U39uNWhSKq` | Template `fldLLUGPXbSksZB5R` · Phase `fldovoFStFKkmu101` · Session From/To `fld6ppr92SE7cHiSv`/`fldZiGLPnDNHP10yR` · Step Order `fld2kKM4Tl7SbchHz` · Program `fldROmN20k4NbspqR` · Minutes `fldW9lzcCeW9dIUc5` · Handpiece `fldC98fHex1bn7C32` |
| Clinic Menu | `tbld0RiSgMZy7BTkk` | Menu Item Name `fldKlFB9FVbDhssg5` · Protocol `fldcpj9UXmPIi7bce` · 🔒 `fldFVE4G4eCvV76x8` · **มีแถว demo ห้ามแก้/ลบ** |
| Protocols | `tblxN0XvHZXhy3FlC` | Protocol Name `fldg0ZSL1ORhVX56D` · Origin `fld7KT6YyDRDsVae0` · Source Template `fldXZwrSi3KY03uN7` · **มีแถว demo ห้ามแก้/ลบ** |
| Cases | `tblkFaN6uZfUsSkP6` | ปัญหา (P) `fldSsHEC4qYRDoZ51` · ใช้ได้กับ `fldwzT8VwWcS1stmY` (ใช้แถวที่มี "หมอ" · ข้ามแถวที่มี "ห้ามใช้ภายนอก") · คุณภาพเคส `fldtHE2AdVgvwjEQo` (A–D) · ผลที่รายงาน `flduNhV2uJIqE264g` · ค่าวัด `fldZiJqvDrz9LKD1a` · อายุต่ำกว่า 18 `fldlKbSut3mdbxOt1` · โปรแกรมที่ใช้ `fldSzXR18iuo1ZmFv` · 🔒 `fldysmpoQCX4B6f4d` |
| Research Evidence | `tblqUf6RMxUvjxhrb` | Evidence ID `fld24fsyv4kRLUTqB` · ชื่องาน `fldm64aKaz4UDMXE6` · ปี `flda6Ix9P7LPg4055` · หมวด `fldFhZdJOyHdBGw6d` (12 หมวด) · เกี่ยวกับ icoone `fldYEfOaPiqNdeqRj` · ระดับหลักฐาน `fldn48nSkwL8sTmn6` · จำนวนคน `fldzUMpfCEF9jhdqF` · ผลสรุป `fldliHY0YWysAaBwB` · ปัญหา (P) `fldOiFpGA2JMQjqhA` · โปรแกรม (PRG) `fldVBB2ShIpxsu10H` · ใช้ตอบใคร `fldOor0aoqxeHP5xE` · พูดได้แค่ไหน `fldg0fUkC8HeuDBKv` · เอกสารลับ `flduceWP2PdAjpl0x` · DOI/URL `fldFibKJzjBNnExP8` · 🔒 `fldXCdw6WnLhzkT52` |
| Web Leads | `tblKkEY1DzU7Pjd0H` | ใช้ชุดช่องเดียวกับ `app/api/submit/route.ts` · LINE ID `fldDFhd2MS78uRk4A` · สถานะ `fld6RVifdylH5brbk` · Lead Tier `fldllIE3EYLvaXdCz` · ข้อมูลการกด (Body Map) `fldKBanVLExL41vUH` · สรุปสำหรับเซลส์ (AI) `fldPUyikvc39HXJkN` · แหล่งที่มา `fldq5loEt8fmZTfsN` |
| Automation ที่มีอยู่ | `wflE4d6synThqEuil` | Lock Protocol Version (undeployed) · **ห้ามแตะ** |

**CANON** คัดลอกไว้ใน repo ที่ `_ai/canon_r03/` พร้อม `SHA256SUMS` · อ่าน `_ai/canon_r03/00_DATA_MAP.md` ก่อนไฟล์อื่น

**ห้ามแตะ** · `app/explorer/**` · `lib/areas.ts` (Explorer ใช้ 7 บริเวณ คนละชุดกับ Z1–Z9) · พฤติกรรมเดิมของ `app/api/submit/route.ts` (import helper ได้) · แถว demo · automation `wflE4d6synThqEuil` · ทุกช่อง 🔒 (ไนน์ติ๊กเองเท่านั้น)

## 3 · ขอบเขตความสามารถ
- รัน build/lint/dev ในเครื่องได้ · อ่าน/เขียน Airtable ผ่าน token ใน `.env.local` หรือ Airtable MCP
- **สิทธิ์เตรียม ≠ สิทธิ์เขียนจริง** · เตรียมแผน สคริปต์ ร่างเนื้อหาได้เอง · เขียน Airtable / สร้าง automation / ต่อ LINE ต้องผ่านด่านไนน์ (ข้อ 5)
- deploy production และเปิดใช้ automation จริง (deploy) ไม่ใช่งานของคุณ · สร้างได้ในสถานะยังไม่เปิด

## 4 · สิ่งที่รู้แล้ว (ตรวจแล้ว 23 พ.ย. 2026 โดย Claude cloud)

### 4.1 โครงหน้า
ซ้าย = **Fit** · กลาง = ร่างกาย 9 จุด (Z1–Z9 · ตำแหน่งใน `_ai/canon_r03/figure_points.json`) · ขวา = 01 Area → 02 Problem → 03 Solution → 04 How → 05 Evidence · Insight เป็นชั้นลึก

### 4.2 Fit = สิ่งที่หมอปรับเองได้ ไม่ใช่ทุกช่องที่มี
หมอกำลังจะซื้อเครื่อง จึงอยากเห็นว่าปรับอะไรได้ แล้ว Protocol เปลี่ยนตาม · ใช้ 3 ตัวนี้ (มาจาก label ที่มีอยู่แล้วใน Explorer Drafts และ Protocol Templates):
| ตัวปรับ | ค่า | ผูกกับ |
|---|---|---|
| เพศคนไข้ | หญิง · ชาย | Protocol Templates · Target + รูปร่างกาย |
| เป้าหมาย | กระชับ (Toning) · ปรับรูปร่าง (Reshaping) · ต้านริ้วรอย (Anti-Ageing) · ระบาย (Drainage) · ฟื้นฟู (Programs group healthcare) | Family / Program Group |
| คอร์ส | 5 · 10 ครั้ง | Protocol Template คู่ 5/10 (`concern_card_match.card_5_sessions` / `card_10_sessions`) + Template Steps ช่วงครั้ง |
- ทุกตัวปรับต้อง **เปลี่ยนผลใน Solution/How จริง** (เลือก Protocol ใหม่ · ขั้นตอนใหม่ · นาทีใหม่) · ตัวไหนไม่เปลี่ยนอะไรเลยกับข้อมูลชุดนี้ ให้ตัดออก แล้วรายงาน
- ไม่เลือก = แสดงทั้งหมด · ปัญหาที่ Solution มาจากเมนูหรือโปรแกรมตรง (ไม่มี Protocol Template) แสดงเสมอ ไม่ถูกซ่อนเพราะข้อมูลว่าง
- แรงดูด · มุมหน้า/หลัง ไม่ใช่ตัวปรับ Fit (มุมเป็นปุ่มหมุนรูปที่คอลัมน์กลาง)
- **หัวเครื่องไม่ใช่ตัวปรับ Fit** · หัวเป็นผลที่ตามมาจาก Protocol → Program · แสดงใน 04 How ต่อขั้น
  - ตรวจแล้ว 23 พ.ย.: ข้อมูลหัวรายขั้น**ยังไม่มี** · Template Steps ช่อง Handpiece ว่างทั้ง 113 ขั้น · ทุกขั้นติ๊ก "Doctor Must Select Area And Head" (`fldKupOATpIcrCbdG`) · Programs Head Compatibility = `not_globally_verified` ทั้ง 40 · CANON `protocol_steps.handpiece` ว่างทั้งหมด
  - ระหว่างนี้ How แสดงหัวเป็น "เลือกตามบริเวณ" (ตามคู่มือผู้ผลิต) · เมื่อเทรนเนอร์กรอกช่อง Handpiece ใน Template Steps แล้ว หน้าดึงชื่อหัวมาแสดงเองโดยไม่ต้องแก้โค้ด · ห้ามเดาหัวจากชื่อโปรแกรม
  - LED 650 / Laser 915 แสดงเฉพาะขั้นที่หัวเป็น RoboSolo

### 4.3 Solution ไล่ลำดับนี้เท่านั้น: Problem → Menu → Protocol → Program
- มี Menu (`menu_concern_links` · 50 คู่ · 36 ปัญหา) → เมนู → Protocol ของเมนู (`menu_protocol_plans_21`) → Program (`menu_protocol_steps`) · นาที = นาทีรวมของเมนู (รายโปรแกรมไม่มีในต้นทาง = DATA GAP · ห้ามแบ่งเอง)
- ไม่มี Menu → Protocol Template ผู้ผลิต (`concern_card_match` → Template Steps · มีนาทีรายโปรแกรมรายช่วงครั้ง) · ตัวปรับ Fit ทำงานเต็มที่ในชั้นนี้
- ไม่มีทั้งคู่ → Program ตรง (`concern_program_links`) · นาทีจาก Default Minutes · ว่าง = "—"
- ป้ายเล็กบอกชั้น: เมนู BIB · Protocol ผู้ผลิต · โปรแกรม · การจับคู่ปัญหา–เมนูเป็นร่าง **เทรนเนอร์ตรวจ ไม่ใช่งานคุณ**

### 4.4 Program = icon 40 ตัว (component ราย icon ไม่ใช่ component ทั้งหน้า)
- `ProgramIcon` 1 ตัวต่อ 1 โปรแกรม (40) · กุญแจ = Program ID · ชื่อตามหน้าจอเครื่องเป๊ะ · ไอคอนจาก `lib/assets.ts` `PROGRAM_ICON` · สีกลุ่มจาก `lib/programs.ts` · ขึ้นนาทีเมื่ออยู่ใน Protocol
- แตะ icon → **ย่อ** (1 บรรทัด: โปรแกรมนี้ทำอะไรให้คนไข้) · กด "ดูละเอียด" → **ละเอียด** (เป้าหมายของโปรแกรม · เหมาะกับสภาพผิวแบบไหน · ท่าคนไข้ · หัวที่ใช้ได้ · นาทีตั้งต้น · อยู่ใน Protocol/เมนูไหนบ้าง · หลักฐานที่ผูก)
- ต้นทางรายละเอียด = Programs `Aim` + `Examination` (คัดจากคู่มือผู้ผลิต · ข้อความมีสระเพี้ยนจากการแปลง PDF เช่น "ลำาคอ" → แก้เป็น "ลำคอ" ตอนแสดง ไม่แก้ต้นทาง) · ข้อความย่อ = เขียนใหม่ด้วยน้ำเสียงข้อ 1

### 4.5 Evidence = Paper + Case · แยกตาม "ใช้พิสูจน์อะไร" · มีย่อและละเอียด
จัดหมวด Research Evidence (12 หมวด) เป็น 6 คำถามที่หมอถาม:
| หมอถาม | หมวดใน Airtable | + |
|---|---|---|
| ได้ผลจริงไหม | 01 พิสูจน์ icoone · 03 ปัญหา | Case คุณภาพ A/B |
| ทำงานยังไง | 02 กลไก · 04 เทคโนโลยีเทียบเคียง | |
| ทำยังไง วัดยังไง | 05 Protocol / ขนาดการใช้ · 08 วิธีวัดผล | |
| ปลอดภัย ผ่านการรับรองไหม | 06 ความปลอดภัย / ข้อห้าม · 12 รับรอง / ทะเบียน | ป้าย FDA เฉพาะ P20 P23 P31 P32 P41 P42 P43 |
| คนไข้ชอบไหม คุ้มไหม | 10 ประสบการณ์ผู้รับบริการ · 09 ความคุ้มค่า | |
| หมอคนอื่นใช้ไหม | 11 การยอมรับจากแพทย์ · 07 ผลจากคลินิกจริง | Case |
- **ย่อ** = ตัวเลขเด่น 1 ตัว + หัวเรื่อง 1 บรรทัดแบบ agency (เช่น "บวม 83 → 78 ซม. ใน 10 ครั้ง") · ติดป้ายระดับหลักฐาน + "ใช้ icoone ตรง/เครื่องประเภทเดียวกัน/กลไกพื้นฐาน" ให้หมอเห็นเอง
- **ละเอียด** = การ์ดงานวิจัย: ใคร ปีไหน กี่คน ออกแบบแบบไหน ผลอะไร ข้อจำกัด ลิงก์ DOI · Case: ก่อน–หลัง วิธีวัด จำนวนครั้ง โปรแกรมที่ใช้
- เรียงหลักฐานที่ impact สูงสุดก่อน: ใช้ icoone ตรง > เครื่องประเภทเดียวกัน > กลไก · RCT/Meta > มีกลุ่มเทียบ > ชุดเคส
- ข้าม: เอกสารลับ · เคสอายุต่ำกว่า 18 · เคสที่ "ใช้ได้กับ" ไม่มี "หมอ" หรือมี "ห้ามใช้ภายนอก"

### 4.6 Patient Situation (PS01–PS12) = วัตถุดิบ Insight ไม่ใช่ตัวกรอง
จับคู่ ปัญหา + ข้อมูลคนไข้ (`patient_situation_pain_links` Primary/Secondary) → สร้าง Insight แนบ Solution ตรงนั้น จาก trigger · job · avoid · หน้าหมอใช้ `label_doctor`

### 4.7 โหมด
- **นำเสนอ** (ค่าเริ่มต้น · เว็บจริง) = เนื้อหาที่สร้างจาก Insight + label + ย่อ/ละเอียด · เฉพาะแถว 🔒 · จุดที่ข้อมูล 🔒 ไม่ครบทุกขั้นไม่แสดง · วันนี้ยังไม่มีแถว 🔒 → หน้าว่างเป็นเรื่องปกติ
- **ภายใน** = ทุกแถว + สถานะ + จุดจางเมื่อขาด · เปิดได้เมื่อ env `BODYMAP_INTERNAL=1` เท่านั้น

### 4.8 ข้อมูลการกด + AI + LINE OA
- เก็บทุก interaction เป็น event (ไม่ระบุตัวตนจนกว่าจะส่งฟอร์ม) · แจ้งการเก็บข้อมูลการใช้งานตาม PDPA ที่แถบล่างครั้งแรก · ส่งฟอร์มแล้วผูก event ของ session นั้นเข้ากับลีด
- AI สรุปลีด = ช่อง aiText ที่มีอยู่ (`fldPUyikvc39HXJkN` อ่าน ชื่อแพทย์ · คลินิก · บันทึก · ข้อมูลการกด) · AI หา insight รวม = Airtable automation รายสัปดาห์
- LINE OA = LINE Messaging API · ส่งหาหมอได้หลังหมอเพิ่มเพื่อนเท่านั้น → หน้าขอบคุณมีปุ่ม "คุยต่อทาง LINE" พร้อมรหัสอ้างอิงลีด · webhook รับรหัสแล้วผูก LINE userId กับลีด · แจ้งเซลส์ผ่านกลุ่ม LINE ของทีม
- ข้อความที่ส่งถึงหมอใช้ **แม่แบบที่ไนน์อนุมัติ** เท่านั้น · AI ร่างข้อความต่อหมอเป็น "ข้อเสนอให้เซลส์" ไม่ส่งเอง
- ยังไม่มี: บัญชี LINE OA ที่จะใช้ · Channel secret/token · แพ็กเกจข้อความ (เสียเงิน) → **รอไนน์** (ข้อ 5 งาน 10)

### 4.9 อื่นๆ
- ไม่มี `AGENTS.md` ใน repo · กติกางานนี้อยู่ในใบงานนี้ · ข้อเสนอให้สร้างเขียนในรายงานตอนจบได้ ไม่ต้องสร้างเอง
- ต้นแบบหน้าตา r04: https://claude.ai/artifact/AQgL2NNwDG817jz9AMcMGs

## 5 · งาน (ทำตามลำดับ · จบแต่ละข้อรายงานบรรทัดเดียว `n/12`)
**ช่วง A · ข้อมูลและการผูก**
1. **Heartbeat** · สร้าง `_ai/TASK_BM-R05.md` เขียนเวลาเริ่ม + `git status` + `git log -1` · ไม่มีอะไรเปลี่ยนให้เขียน "ไม่มีความเปลี่ยนแปลง"
2. **ตรวจของจริง** · ตรวจ `SHA256SUMS` · อ่าน `00 README` ทุกแถว · list ตาราง/ช่องจริงเทียบข้อ 2 · ไม่ตรงเขียน `DATA GAP` แล้วหยุดเฉพาะส่วนที่กระทบ
3. **แผน Airtable (ยังไม่เขียน)** · `_ai/AIRTABLE_PLAN_BM-R05.md` ตารางก่อน/หลัง ตาม 00 README หัวข้อ 06 · ทุกแถวระบุไฟล์ CANON ต้นทาง:
   - ตารางใหม่ **Concerns** (50) · **Patient Situations** (12) · **Body Map Content** (ปัญหา × หมอ) · **Body Map Events** (session · เวลา · ชนิด event · P · Z · Program · Evidence · Fit ที่เลือก · link Web Lead) · **Body Map Insights** (สัปดาห์ · สรุป AI · ตัวเลข · ไนน์ตรวจแล้ว) · **LINE Contacts** (LINE userId · link Web Lead · สถานะติดตาม · ข้อความล่าสุด)
   - **การผูกจริง (link field)** — ช่องข้อความเดิมเก็บไว้ เพิ่ม link คู่: Concerns↔Programs · Concerns↔Protocol Templates (5/10) · Concerns↔Clinic Menu · Concerns↔Cases (จาก "ปัญหา (P)") · Concerns↔Research Evidence (จาก "ปัญหา (P)") · Research Evidence↔Programs (จาก "โปรแกรม (PRG)") · Patient Situations↔Concerns (หลัก/รอง) · Body Map Content↔Concerns/Patient Situations/Research Evidence/Cases · Body Map Events↔Web Leads · LINE Contacts↔Web Leads
   - ช่องใหม่สำหรับเนื้อหาย่อ/ละเอียด: Programs (ย่อ-หมอ · ละเอียด-หมอ · สถานะเนื้อหา) · Research Evidence (คำถามที่ตอบ · ย่อ-หมอ · ละเอียด-หมอ · สถานะเนื้อหา) · Cases (ย่อ-หมอ · สถานะเนื้อหา) · Web Leads (LINE userId · รหัสอ้างอิง LINE)
   - นำเข้าเมนู BIB 21 → Protocols + Clinic Menu (ไม่ผูก Clinic · ไม่แตะแถว demo)
   - **หยุดรอไนน์ตอบ "OK แผน BM-R05"**
4. **เขียน Airtable ตามแผน** · ชุดละไม่เกิน 10 แถว · นับเทียบแผน · Change Log ทุกครั้ง · **ตรวจการผูก**: ทุกรหัส P/PRG ในช่องข้อความต้องกลายเป็น link ครบ · รายการที่หาคู่ไม่เจอเขียนลง TASK ห้ามเดาคู่

**ช่วง B · เนื้อหา**
5. **ร่างเนื้อหาย่อ/ละเอียด** ตามข้อ 4.4–4.6 สำหรับ Programs 40 · Research Evidence ที่ผูก P · Cases ที่ใช้กับหมอ · Body Map Content (Insight) · **ส่งตัวอย่างในแชท**: Program 3 ตัว (base/focus/healthcare) · หลักฐาน 3 ชิ้น (คนละคำถาม) · Insight 3 ปัญหา → รอไนน์ตอบ "OK เนื้อหา" → เขียนลง Airtable ทั้งหมดสถานะ "ร่าง" (🔒 ว่าง) + Change Log

**ช่วง C · หน้าเว็บ**
6. **ชั้นข้อมูล** · `lib/bodymap/data.ts` อ่าน Airtable ฝั่ง server (token ไม่ไป browser) · โหมดนำเสนอกรอง 🔒 ทุกตาราง · revalidate 10 นาที + endpoint `/api/bodymap-revalidate` (มี secret) ให้ automation เรียก · `lib/bodymap/solution.ts` ฟังก์ชันเดียวรับ (P, Fit) คืน `{layer, menu?, protocol?, steps[{programId, minutes|null, sessions?}], totalMinutes|null}`
7. **หน้า `/bodymap`** · `app/bodymap/` · component: `FitPanel` (3 ตัวปรับข้อ 4.2) · `BodyFigure` · `AnswerPanel` · `ProgramIcon` (40 · ราย icon) · `ProgramSheet` (ย่อ/ละเอียด) · `EvidenceBlock` (6 คำถาม · ย่อ/ละเอียด) · `InsightDrawer` · `LeadForm` · `ConsentBar`
8. **เก็บ event** · `app/api/bodymap-event/route.ts` (edge · รวมส่งเป็นชุด ทุก 10 วินาที หรือเมื่อออกหน้า) → Body Map Events · ชนิด event: เปิดหน้า · เลือก Fit · หมุนรูป · กดจุด · เปิดปัญหา · เปิด Program ย่อ/ละเอียด · เปิดหลักฐานย่อ/ละเอียด · เปิด Insight · เริ่มกรอกฟอร์ม · ส่งฟอร์ม · กด LINE
9. **เก็บลีด** · `app/api/bodymap-lead/route.ts` (edge) · Web Leads ชุดช่องเดียวกับ `/api/submit` · แหล่งที่มา `bodymap-r05` · ข้อมูลการกด = JSON สรุปจาก event ของ session · ผูก event ทั้ง session เข้าลีด · honeypot + ช่องบังคับ + ยินยอมให้ติดต่อ (PDPA) + ยินยอมให้ติดต่อทาง LINE ตรวจซ้ำฝั่ง server · สำเร็จ → หน้าขอบคุณ + ปุ่ม LINE พร้อมรหัสอ้างอิง · ไม่สำเร็จ → ข้อความ + ลองใหม่ ข้อมูลที่กรอกไม่หาย

**ช่วง D · Automation + LINE OA**
10. **ถามไนน์ 3 ข้อในแชท ก่อนสร้าง** (ตัวเลือกมีเลข + คำแนะนำ · ไม่ตอบ = ทำแค่ส่วนที่ไม่ต้องใช้ LINE):
    1) ใช้ LINE OA บัญชีไหน (BIB เดิม · สร้างใหม่) · 2) แพ็กเกจข้อความ (ฟรีก่อนแล้วดูยอด — แนะนำ · แพ็กเสียเงิน) · 3) ข้อความตอบหมออัตโนมัติ = แม่แบบที่ไนน์อนุมัติเท่านั้น (แนะนำ) หรือให้ AI ตอบเองได้
11. **สร้าง automation (สถานะยังไม่เปิด) + LINE** · ทุกตัวเขียนลง `_ai/AUTOMATIONS_BM-R05.md` (ทริกเกอร์ · เงื่อนไข · ทำอะไร · ไปที่ไหน · ทดสอบยังไง):
    - A1 ลีดใหม่จาก `bodymap-r05` → รอ AI สรุป → ส่งแจ้งกลุ่ม LINE ทีมเซลส์ (ชื่อ · คลินิก · ปัญหาที่ดู · หลักฐานที่เปิด · สรุป AI · ลิงก์แถว)
    - A2 ตั้ง Lead Tier จากข้อมูล (เคสต่อเดือน · จำนวนหลักฐานละเอียดที่เปิด · กด LINE) ตามเกณฑ์ที่เขียนไว้ในไฟล์ automation ให้ไนน์ปรับได้
    - A3 ลีดสถานะ "ใหม่" เกิน 24 ชม. → เตือนกลุ่ม LINE ทีม
    - A4 ไนน์ติ๊ก 🔒 ในตารางที่หน้าใช้ → เรียก `/api/bodymap-revalidate`
    - A5 ทุกวันจันทร์ → AI สรุป Body Map Events สัปดาห์ก่อน (ปัญหาที่ถูกดูมาก · หลักฐานที่ทำให้กรอกฟอร์ม · จุดที่คนออก) → เขียน Body Map Insights → ส่งสรุปให้ไนน์ทาง LINE
    - ส่วนที่ส่ง LINE (A1 · A3 · A5) ให้ automation เรียก `app/api/line-notify/route.ts` (มี secret) แทนการเรียก LINE ตรง · ยังไม่มี token = route ตอบ "รอ token" และเขียนลง TASK · สร้าง automation ผ่านเครื่องมือไม่ได้ = เขียนขั้นตอนกดเองทีละคลิกลงไฟล์ automation ให้ไนน์
    - LINE: `app/api/line-webhook/route.ts` (ตรวจลายเซ็น channel secret) · เพิ่มเพื่อน + รหัสอ้างอิง → ผูก LINE Contacts ↔ Web Lead → ตอบด้วยแม่แบบ · secret/token อยู่ใน env ของ Cloudflare เท่านั้น
12. **ตรวจปุ่ม + ส่งงาน** · `_ai/BUTTONS_BM-R05.md` ทุกปุ่ม/ลิงก์/ชิป/icon: ชื่อ · ทำอะไร · ข้อมูล/event ไปไหน · โหมดไหนเห็น · ทดสอบยังไง · ผล · รัน `npm run build` + `npm run lint` · ทดสอบ `solution.ts` ด้วยข้อมูลจริง 4 กรณี (มีเมนู · Protocol Template คอร์ส 5 · คอร์ส 10 · Program ตรง) · ส่งลีดทดสอบ 1 แถว `TEST-BM-R05` พร้อม event ที่ผูกแล้ว · ทดสอบ automation ด้วยปุ่มทดสอบของ Airtable (ไม่เปิดใช้จริง) · LINE ทดสอบเมื่อไนน์ให้ token แล้วเท่านั้น · รายงานรหัสแถวทดสอบให้ไนน์ลบเอง

## 6 · ข้อห้าม
- ไม่มีปุ่ม icon หรือตัวปรับไหนที่กดแล้วไม่มีปลายทางหรือไม่เปลี่ยนอะไร · ไม่มีปลายทาง = เอาออก
- ไม่เดาตัวเลข นาที ราคา ผลวิจัย คู่การผูก · ไม่มี = `DATA GAP` ในเอกสาร และ "—" บนหน้า
- ไม่ติ๊ก 🔒 · ไม่แก้/ลบแถวที่มีอยู่ · ไม่เขียน Airtable ก่อน "OK แผน" · ไม่เขียนเนื้อหาทั้งหมดก่อน "OK เนื้อหา" · ไม่เปิดใช้ automation จริง · ไม่ส่งข้อความ LINE ถึงคนจริงที่ไม่ใช่การทดสอบที่ไนน์สั่ง
- ไม่ใช้คำกล่าวอ้างนอกข้อ 1 · ไม่แสดงเอกสารลับ · ไม่แสดงเคสอายุต่ำกว่า 18
- ข้อความบนหน้าไม่ใช้กรอบ "ห้าม" และไม่มีบรรทัดออกตัว (ยกเว้นข้อความยินยอม PDPA)
- ไม่ commit `.env.local` · token · channel secret

## 7 · นิยามว่าเสร็จ (เปิดดูได้ทุกข้อ)
- `_ai/AIRTABLE_PLAN_BM-R05.md` (ไนน์ OK) + Change Log ครบ + จำนวนแถวตรงแผน + รายการคู่ผูกที่หาไม่เจอ (หรือ "ครบ")
- เนื้อหาย่อ/ละเอียดใน Airtable สถานะ "ร่าง" ครบทุกแถวที่หน้าใช้
- `/bodymap` build + lint ผ่าน · เปิดใน `npm run dev` ได้ 2 โหมด
- `_ai/BUTTONS_BM-R05.md` และ `_ai/AUTOMATIONS_BM-R05.md` ทุกแถวผลผ่าน
- ผลทดสอบ `solution.ts` 4 กรณี (ใน TASK) · หัวเครื่องแสดง "เลือกตามบริเวณ" ทุกขั้นจนกว่าเทรนเนอร์จะกรอก
- แถว `TEST-BM-R05` ใน Web Leads พร้อม event ที่ผูก และสรุป AI
- automation A1–A5 สร้างแล้ว สถานะยังไม่เปิด · LINE webhook พร้อม (ทดสอบแล้ว หรือระบุว่ารอ token)
- commit บนสาขา `see-the-unseen-r03` (ไม่ push ถ้าไนน์ไม่สั่ง)

## 8 · รูปแบบคำตอบ
- **อัปเดต Todo ใน Airtable ทุกข้อ**: ตาราง `Precision Beauty Experience · Todo` (`tbl9kaZ51liaNHwf1`) · แถวที่ช่อง อ้างอิงใบงาน (`fldd8sUFnrZssF7g5`) = "BM-R05 v003 · งาน n" · เริ่มงาน → Status (`fldIFyOiicH6R0aId`) = In progress · ผ่านนิยามเสร็จของข้อนั้นแล้ว → Done · ติดด่านรอไนน์ → คง In progress แล้วเขียนเหตุผลต่อท้าย Notes (`fldFkImoYkBH5UUYs`) · ไม่ต้องลง Change Log สำหรับการเปลี่ยนสถานะ Todo
- ตอนเริ่ม: Assignment ID · จำนวนงาน · ข้อห้ามข้อแรก · ยังไม่ลงมือจนกว่าจะตอบ 3 อย่างนี้
- ระหว่างทำ: บรรทัดเดียวต่อขั้น `n/12 · ทำอะไร · ผล`
- ตอนจบ: อะไรเปลี่ยน · ถัดไปคืออะไร · ไนน์ต้องทำอะไร (ส่งเทรนเนอร์กรอกหัวรายขั้น · ติ๊ก 🔒 · เปิด automation · ใส่ LINE token · ลบแถวทดสอบ · ส่งเทรนเนอร์ตรวจคู่เมนู) · ติดป้าย `ตรวจแล้ว` / `ยังไม่ได้ตรวจ` ทุกข้อ · บทเรียนใหม่ลง `_ai/บันทึกบทเรียน.md` ถ้ามี
