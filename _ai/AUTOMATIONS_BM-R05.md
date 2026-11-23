# Automation ของ Body Map · BM-R05 v004 · 23 พ.ย. 2026
ทุกตัว **สร้างเป็นร่าง ปิดอยู่ (undeployed)** · ยังไม่มีตัวไหนถูกกดทดสอบ · ไม่ได้แตะ `wflE4d6synThqEuil`
เปิดดูได้ที่ Airtable → Automations · ชื่อขึ้นต้น "BM-R05"

| # | ชื่อ | ID | ทริกเกอร์ | เงื่อนไข | ทำอะไร | ไปที่ไหน | ทดสอบยังไง | ผล |
|---|---|---|---|---|---|---|---|---|
| A1 | ลีดใหม่จาก Body Map → แจ้งทีม | `wflQYHSmO4F6EMT6U` | Web Leads · แถวตรงเงื่อนไข | แหล่งที่มา = bodymap-r05 และ สรุปสำหรับเซลส์ (AI) ไม่ว่าง | สคริปต์อ่าน ชื่อแพทย์ · คลินิก · สรุป AI · ปัญหา/หลักฐานที่เปิด (จาก JSON ข้อมูลการกด) ประกอบข้อความ | POST `/api/line-notify` → กลุ่ม LINE ทีม | กด Test ใน Airtable กับแถว `TEST-BM-R05` (ต้องกดสร้างสรุป AI ในแถวก่อน) · คาดว่าได้ 401/503 จนกว่าจะตั้ง secret และ LINE token | สร้างแล้ว · ยังไม่ได้ทดสอบ |
| A2 | ตั้ง Lead Tier | `wflULswEiDGkywn0S` | Web Leads · แถวตรงเงื่อนไข | แหล่งที่มา = bodymap-r05 และ สถานะ = ใหม่ | สคริปต์คำนวณ Tier แล้วเขียนช่อง Lead Tier ของแถวนั้น | Web Leads (แถวเดียว) | กด Test กับแถว `TEST-BM-R05` → ควรได้ A (กด LINE) | สร้างแล้ว · ยังไม่ได้ทดสอบ |
| A3 | ลีดใหม่ค้างเกิน 24 ชม. | `wfleBEUB4JhlmryAp` | ทุกวัน 09:00 เวลาไทย | ลีด bodymap-r05 สถานะ "ใหม่" เกิน 24 ชม. | สคริปต์รวมรายชื่อ (ไม่เกิน 20) | POST `/api/line-notify` | กด Test หลังแถวทดสอบอายุเกิน 24 ชม. | สร้างแล้ว · ยังไม่ได้ทดสอบ |
| A4 | ติ๊ก 🔒 แล้วรีเฟรชหน้า | — | — | — | — | — | — | **ยังไม่สร้าง** · หน้าเว็บยังอ่านไฟล์สำเนา ยังไม่มี `/api/bodymap-revalidate` (รอ AIRTABLE_TOKEN ก่อนทำงาน 6) |
| A5 | สรุป Body Map รายสัปดาห์ | `wflI8IW1nMNSVbYeB` | ทุกวันจันทร์ 09:00 เวลาไทย | — | สคริปต์นับ event 7 วัน → AI เขียนสรุป → สร้างแถวใน Body Map Insights → ส่งสรุป | Body Map Insights + POST `/api/line-notify` | กด Test (มี event ทดสอบ 8 แถวของ session `BM-TESTR05-00001`) | สร้างแล้ว · ยังไม่ได้ทดสอบ |

## เกณฑ์ Lead Tier (A2) · ไนน์ปรับได้ที่บรรทัดบนสุดของสคริปต์
- **A** = เคสต่อเดือน 81–150 หรือ 150+ · หรือกด "คุยต่อทาง LINE"
- **B** = เคสต่อเดือน 31–80 · หรือเปิดหลักฐานแบบละเอียดตั้งแต่ 2 ชิ้น
- **C** = ที่เหลือ
- DATA GAP: ฟอร์ม Body Map ให้พิมพ์เคสต่อเดือนเป็นข้อความอิสระ สคริปต์เทียบกับช่วงของ Explorer (ยังไม่ได้ทดสอบกับค่าที่พิมพ์เอง เช่น "50")

## ก่อนเปิดใช้ ไนน์ต้องทำ
1. ตั้งค่าใน Cloudflare (โปรเจกต์ที่ใช้จริง): `AIRTABLE_TOKEN` · `AIRTABLE_BASE_ID` · `BODYMAP_SECRET` (ตั้งเองเป็นข้อความสุ่มยาว) · `LINE_CHANNEL_ACCESS_TOKEN` · `LINE_TEAM_GROUP_ID` · `LINE_CHANNEL_SECRET`
2. ในสคริปต์ของ A1 · A3 · A5: ใส่ค่า `BODYMAP_SECRET` เดียวกัน และเปลี่ยน URL จาก `bib-bodymap-preview.pages.dev` เป็นโดเมนจริง
3. กด Test ทีละตัว ดูผลในแถวทดสอบ แล้วจึงกดเปิด (Turn on) เอง
4. A4: สร้างหลังงาน 6 เสร็จ · เฝ้าช่อง 🔒 ของ Programs · Protocol Templates · Cases · Research Evidence · Clinic Menu · Concerns · Patient Situations · Body Map Content

## เส้นทางในเว็บที่ automation ใช้
- `POST /api/line-notify` · header `x-bodymap-secret` · body `{ "text": "..." }` · ไม่มี secret = 401 · ไม่มี LINE token = 503 "รอ token" (ตรวจแล้วว่าตอบ 401)
- `POST /api/line-webhook` · ตรวจลายเซ็น LINE · ผูก userId กับลีดจากรหัสอ้างอิง `BM-…` · ยังไม่ได้ทดสอบ (ไม่มี channel secret)
