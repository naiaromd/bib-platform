# สิ่งที่เว้นไว้ในการย้ายโค้ด

วันที่ 13 พฤศจิกายน 2026 · เจ้าของอนุมัติให้ลบค่าลับ ข้อมูลส่วนบุคคล และสัญญาจากสำเนาประวัติ

## ไฟล์ที่ไม่นำออกมาในทุก commit

- `public/documents/commission-memo.pdf`
- `public/documents/drj-contract.pdf`
- `public/documents/linna-company-certificate.pdf`
- `public/documents/linna-contract.pdf`

## ไฟล์ที่ผ่านการลบข้อมูล

- `app/ReviewApp.tsx`
- `app/api/workspace/route.ts`
- `app/page.tsx`
- `app/platform/page.tsx`
- `app/term-templates/page.tsx`
- `drizzle/0008_demonic_clint_barton.sql`
- `drizzle/0009_damp_red_hulk.sql`
- `drizzle/0010_remove_linna_mock_records.sql`
- `drizzle/0011_remove_seeded_monthly_report.sql`
- `drizzle/0012_remove_demo_submissions.sql`
- `drizzle/0013_finance_actuals_and_marketing.sql`
- `drizzle/0013_remove_known_demo_report.sql`
- `lib/demo-session.ts`
- `lib/kpi-import-data.ts`
- `tests/rendered-html.test.mjs`

- ลบค่า PIN และ session token สำรองที่ฝังในโค้ด ไม่เก็บค่าเดิมไว้ในรายงานนี้
- แทนชื่อบุคคล อีเมลจริง เบอร์ติดต่อ เลขระบุตัวตน และที่อยู่ที่พบด้วยข้อความกลาง อีเมลตัวอย่างและรหัสทดสอบสมมติยังคงอยู่
- รายการข้อมูลจากไฟล์ KPI ที่ฝังในโค้ดถูกเอาแถวข้อมูลออกทั้งหมด เหลือชนิดข้อมูลและโครงสร้างที่โค้ดต้องใช้
- ไฟล์ SQL เก็บคำสั่งสร้างและแก้โครงสร้าง แต่ไม่นำคำสั่งเพิ่ม แก้ หรือลบแถวข้อมูลเดิมไปด้วย ยกเว้นพจนานุกรมคำนิยามตัวชี้วัดที่ไม่มีข้อมูลบุคคล
- ชื่อและอีเมลผู้เขียน commit เปลี่ยนเป็นชื่อกลาง วันที่และความสัมพันธ์ของ commit ยังคงไว้
- ยังมีตรรกะธุรกิจ ข้อมูลตัวอย่างที่ไม่ระบุตัวบุคคล และตัวเลขธุรกิจที่เป็นส่วนหนึ่งของโค้ด คลังนี้ต้องคงเป็น private

## สิ่งที่ยังอยู่ต้นทาง

ฐานข้อมูลจริง D1, ไฟล์ที่ผู้ใช้อัปโหลดใน R2, ค่าลับบนเซิร์ฟเวอร์, สิทธิ์เข้าเว็บ, การเข้าสู่ระบบผ่าน ChatGPT, โดเมนและ DNS ไม่ได้ย้าย ไม่มีการอ่านหรือส่งออกแถวข้อมูลลูกค้าจากฐานจริง

ไฟล์ local ที่ไม่อยู่ใน Git รวมถึง README 2.md ของ CRM ไม่ได้นำเข้า ประวัติต้นทางและเว็บจริงไม่ถูกเปลี่ยน

## ตรวจกลับไปยังต้นทาง

ดู `commit-map.csv` เพื่อเทียบ commit เก่ากับสำเนาที่ลบข้อมูลแล้ว หมายเลขใหม่จึงต่างจาก Sites
ไฟล์คู่มือและหลักฐานการย้ายเพิ่มเป็น commit ต่อท้าย จึงไม่อยู่ในแถวเทียบประวัติต้นทาง
