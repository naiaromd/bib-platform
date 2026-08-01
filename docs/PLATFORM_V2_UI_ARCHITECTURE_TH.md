# BIB Practice Intelligence — สถาปัตยกรรมหน้าจอ V2

สถานะ: แผนย้ายจาก `/platform` เดิม โดยไม่เปลี่ยนฐานข้อมูลในรอบนี้  
หลักอ้างอิง: รูปแบบ BIB Academy, แบบอักษร Kanit–Muli และกระบวนการที่บันทึกไว้ใน Data Blueprint

## 1. ข้อสรุปที่ต้องตัดสินใจทันที

1. หยุดเพิ่มโมดูลลงใน `app/platform/page.tsx` และ `app/globals.css` เดิม
2. เก็บข้อมูล ระบบเข้าสู่ระบบ และ API เดิมไว้ แต่สร้างโครงหน้าจอใหม่แบบแยกเส้นทาง
3. แยกพื้นที่ใช้งานเป็น 4 ผลิตภัณฑ์ย่อย: ทีม BIB, เจ้าของกิจการ, Therapist และผู้สนใจ
4. เมนูหลักของแต่ละบทบาทต้องไม่เกิน 6 รายการ และแสดงเฉพาะสิทธิ์ที่ได้รับ
5. LINNA ต้องเป็น Account Variant ของ Client Portal ไม่ใช่หน้าเฉพาะที่แยกจากระบบกลาง
6. ใช้ภาษาไทยเป็นหลัก คำอังกฤษคงไว้เฉพาะชื่อแบรนด์ ชื่อรุ่น และคำที่ไม่มีคำไทยชัดเจน

## 2. เหตุที่หน้าปัจจุบันรก

| สิ่งที่พบ | ผลต่อผู้ใช้ | แนวทางแก้ |
|---|---|---|
| `/platform` รวม 9 มุมมองไว้ในไฟล์เดียวประมาณ 500 บรรทัด | หาตำแหน่งงานยากและเปิด URL ตรงไปยังงานไม่ได้ | หนึ่งโมดูลต่อหนึ่งเส้นทาง |
| เมนูหลัก 8 รายการ และมี Account เป็นสถานะแฝง | ผู้ใช้ต้องจำว่าเนื้อหาอยู่ตรงไหน | เหลือ 6 กลุ่มงานและใช้หน้ารายละเอียดตามรหัส |
| `globals.css` มีมากกว่า 1,500 บรรทัดและมีรูปแบบ V2/Academy ซ้อนกันหลายรอบ | ขนาดตัวอักษร ระยะห่าง และ responsive เปลี่ยนโดยคาดเดายาก | แยก token, shell, component และ page stylesheet |
| Customers, Campaigns, Operations, Approval และ Performance แสดงเป็นพื้นที่ระดับเดียวกัน | โครงองค์กรไม่ตรงกับงานจริง | รวมตามวงจร CRM → Commercial → Operations → Evidence → Reports |
| ตัวเลขจริง ตัวอย่าง และค่ารอข้อมูลอยู่ในหน้าตาเดียวกัน | ผู้ใช้แยกความน่าเชื่อถือไม่ได้ | ทุกข้อมูลต้องมีสถานะ `จริง`, `รอตรวจ`, `ตัวอย่าง` หรือ `ไม่มีข้อมูล` |
| Shell, header และ navigation ถูกเขียนซ้ำในแต่ละหน้า | แก้ CI ครั้งเดียวไม่ได้ | ใช้ `AppShell` กลางและกำหนดรายการเมนูจากสิทธิ์ |
| หน้าภายในมี Hero ขนาดใหญ่ซ้ำทุกโมดูล | ใช้พื้นที่มากกว่างานที่ต้องทำ | ใช้ Hero เฉพาะหน้าเริ่มต้น/ผู้สนใจ; งานประจำใช้ Page Header สั้น |
| การซ่อนเมนูบางส่วนทำในหน้าจอ | เสี่ยงให้ UI กับสิทธิ์ฝั่งระบบไม่ตรงกัน | ตรวจสิทธิ์ที่ layout/route และให้ API ตรวจซ้ำ |

## 3. Information Architecture

### 3.1 ทีม BIB ภายใน

| เมนูหลัก | เนื้อหาภายใน |
|---|---|
| งานของฉัน | งานวันนี้ ปฏิทิน นัดสาธิต งานค้าง และการอนุมัติของฉัน |
| ลูกค้าสัมพันธ์ | Lead, Contact, Account, Opportunity, Demo และแหล่งที่มา |
| ข้อเสนอและสัญญา | Assessment, Model A–D2, Offer, Term Sheet, Contract และ Approval |
| ส่งมอบและดูแล | ลูกค้าที่ใช้งาน เครื่อง Warranty, Training, Service, Stock และ Reorder |
| ผลลัพธ์และความรู้ | Therapist Submission, Evidence Review, Result Book, Protocol และ Knowledge |
| รายงาน | Pipeline, Conversion, Forecast, P&L, Revenue Share, Commission และคุณภาพข้อมูล |

สิ่งที่ย้ายออกจากเมนูหลัก: การตั้งค่า สิทธิ์ และข้อมูลผู้ใช้ ให้เข้าผ่านเมนูบัญชีมุมขวาบน

### 3.2 เจ้าของ/ผู้จัดการคลินิก

| เมนูหลัก | เนื้อหาภายใน |
|---|---|
| ภาพรวม | งานที่ต้องทำ นัดหมาย ข่าวสาร และสถานะบัญชี |
| ธุรกิจของฉัน | Treatment Menu, รายได้, การใช้งาน และคำแนะนำตาม Commercial Plan |
| ทีมและการฝึกอบรม | รายชื่อผู้ปฏิบัติงาน คะแนน Competency และกำหนดทบทวน |
| ผลลัพธ์ | การบ้านประจำเดือน เคสที่ส่ง สถานะตรวจ และ Result Book ที่ได้รับอนุมัติ |
| เครื่องและบริการ | เครื่อง ชั่วโมงใช้งาน Warranty, Ticket, Maintenance และ Reorder |
| เอกสารและความรู้ | สัญญา คู่มือ Protocol, Marketing Toolkit และข่าวสาร |

### 3.3 Therapist บนโทรศัพท์

| เมนูหลัก | เนื้อหาภายใน |
|---|---|
| วันนี้ | การบ้านที่ต้องส่ง นัดฝึกอบรม และเคสที่ต้องติดตาม |
| เคสของฉัน | เคสกำลังทำ ประวัติ Session และ Follow-up |
| ส่งผลลัพธ์ | ถ่ายภาพ อัดเสียง ตรวจข้อมูล และส่งให้ผู้จัดการ |
| เรียนและทบทวน | บทเรียน แบบทดสอบ Practical Sign-off และ Protocol ที่อนุญาต |
| ขอความช่วยเหลือ | ค้นคำตอบ แจ้งปัญหา และส่งต่อ Trainer |

โปรไฟล์ คะแนน และการตั้งค่าอยู่ในเมนูบัญชี ไม่เป็นเมนูหลัก

### 3.4 ผู้สนใจซื้อ

| เมนูหลัก | เนื้อหาภายใน |
|---|---|
| รู้จัก icoone | หลักการทำงานและความแตกต่าง |
| การนำไปใช้ | Use Case ตามประเภทธุรกิจและเป้าหมาย |
| หลักฐาน | งานวิจัย ข้อจำกัด และคำถามที่แพทย์มักถาม |
| วางแผนธุรกิจ | ความพร้อม บริการที่สร้างได้ และตัวอย่างสมมติฐาน |
| นัดสาธิต | คัดกรองความพร้อม เลือกสถานที่และวันนัด |
| คำขอของฉัน | สถานะนัด เอกสารที่ได้รับ และช่องทางติดต่อ |

## 4. Route Map

| พื้นที่ | เส้นทางหลัก | ตัวอย่างเส้นทางย่อย |
|---|---|---|
| BIB Internal | `/app` | `/app/today`, `/app/crm/leads`, `/app/crm/accounts/[accountId]`, `/app/crm/opportunities/[opportunityId]` |
| Commercial | `/app/commercial` | `/offers`, `/offers/[offerId]`, `/documents/[documentId]/review`, `/contracts/[contractId]` |
| Operations | `/app/operations` | `/customers/[accountId]`, `/devices/[deviceId]`, `/training`, `/service`, `/reorders` |
| Evidence | `/app/evidence` | `/submissions`, `/submissions/[submissionId]/review`, `/cases/[caseId]`, `/result-book` |
| Reports | `/app/reports` | `/sales`, `/partner-performance`, `/finance`, `/data-quality` |
| Client Owner | `/portal/[accountId]` | `/home`, `/business`, `/team`, `/results`, `/support`, `/documents` |
| Therapist | `/therapist` | `/today`, `/cases/[caseId]`, `/submit/new`, `/learn`, `/help` |
| Prospect | `/discover` | `/uses`, `/evidence`, `/business-plan`, `/demo`, `/my-request` |
| Administration | `/admin` | `/users`, `/roles`, `/templates`, `/commercial-models`, `/audit` |

กติกา: Route แสดงขอบเขตงาน ส่วน API ต้องตรวจ `tenantId`, `role` และ `accountScope` ซ้ำทุกครั้ง

### เส้นทางเดิมหลังย้าย

| เดิม | ปลายทางใหม่ |
|---|---|
| `/platform` | `/app/today` |
| `/client` | `/portal/{accountScope}/home` |
| `/linna` | `/portal/linna/home` |
| `/explore` | `/discover` |
| `/term-templates` | `/admin/templates` หรือ `/app/commercial/offers/new` ตามสิทธิ์ |

## 5. โครงหน้าจอมาตรฐาน

### Desktop

1. `BrandHeader` สูง 88–104px: โลโก้ BIB/icoone, ชื่อพื้นที่, ค้นหา, แจ้งเตือน, บัญชีผู้ใช้
2. `RoleNavigation` กว้าง 280–300px: เมนูไม่เกิน 6 รายการ พร้อมชื่อไทยและคำอธิบายสั้น
3. `PageHeader` สูงไม่เกิน 120px: ชื่อหน้า สถานะ แหล่งข้อมูล และปุ่มหลักหนึ่งปุ่ม
4. `Workspace`: เนื้อหาหลักหนึ่งเรื่องต่อหน้า; รายละเอียดรองเปิด Drawer หรือ Tab ภายใน Entity
5. `ActionBar`: งานที่ต้องตัดสินใจอยู่ตำแหน่งคงที่ ไม่กระจายหลายการ์ด

หน้าตรวจเอกสารใช้ `DocumentReviewShell` สามส่วน: รายการเอกสารด้านซ้าย, สรุป/ฉบับเต็มตรงกลาง, ความเห็นและคำตัดสินด้านขวา โดยเปิดฉบับเต็มแบบเต็มจอได้

### Tablet

- Navigation ย่อเป็น Drawer แต่เมื่อเปิดต้องมีไอคอนและชื่อไทย ห้ามใช้ไอคอนอย่างเดียว
- ตารางเปลี่ยนเป็นรายการที่เลือกเปิดรายละเอียดด้านข้าง
- Page Header เหลือชื่อ สถานะ และปุ่มหลัก

### Mobile

- Therapist ใช้ Bottom Navigation 4 รายการและปุ่ม `เพิ่มเติม`
- งานถ่ายภาพ/อัดเสียงเป็น Full-screen Stepper ใช้ได้ด้วยมือเดียว
- ตารางทั้งหมดเปลี่ยนเป็น Card List; Filter เปิดเป็น Bottom Sheet
- ปุ่มหลักสูงอย่างน้อย 48px, ช่องกรอกอย่างน้อย 44px และตัวอักษรในช่องกรอกอย่างน้อย 16px
- หากอัปโหลดขาดช่วง ให้เก็บฉบับร่างในเครื่องและส่งต่อเมื่อเชื่อมต่อได้

## 6. Design Tokens

### Typography

| Token | ค่า |
|---|---|
| `font.th` | Kanit — เนื้อหา เมนู ปุ่ม และหัวข้อภาษาไทย |
| `font.latin` | Muli — ตัวเลข รหัส วันที่ และคำอังกฤษสั้น |
| `text.body` | 15px / 1.6; ห้ามต่ำกว่า 14px ในงานประจำ |
| `text.form` | 16px / 1.5 |
| `text.label` | 12px / 1.4; ใช้เฉพาะป้ายสั้น |
| `heading.page` | 32px desktop, 26px tablet, 24px mobile |
| `heading.section` | 22px desktop, 20px mobile |

### Color

| Token | ค่า | การใช้ |
|---|---|---|
| `color.ink` | `#292B2B` | ข้อความและ navigation |
| `color.canvas` | `#F5F1EA` | พื้นหลังหลัก |
| `color.paper` | `#FBFAF7` | Card/Panel |
| `color.line` | `#D8D0C5` | เส้นแบ่ง |
| `color.brand` | `#B4694D` | ปุ่มหลัก จุด active |
| `color.success` | `#47745F` | สำเร็จ/ผ่าน |
| `color.warning` | `#A87822` | รอตรวจ/ครบกำหนด |
| `color.danger` | `#A14F46` | ผิดพลาด/เสี่ยง |

### Spacing และรูปทรง

- ใช้ระยะ 4, 8, 12, 16, 24, 32, 48 และ 64px เท่านั้น
- Card ใช้เส้น 1px ไม่มีเงา; รัศมี 0–4px ตามรูปแบบ Academy
- Pill ใช้เฉพาะสถานะและตัวกรอง ห้ามใช้เป็นกล่องข้อมูลทั่วไป
- หนึ่งหน้ามีปุ่มหลักเด่นไม่เกินหนึ่งปุ่ม

## 7. Component Set ที่ต้องสร้างก่อนย้ายหน้า

`AppShell`, `BrandHeader`, `RoleNavigation`, `MobileNavigation`, `PageHeader`, `EntityHeader`, `StatusBadge`, `SourceBadge`, `MetricStrip`, `FilterBar`, `DataTable`, `CardList`, `DetailDrawer`, `EmptyState`, `ErrorState`, `LoadingSkeleton`, `ActionBar`, `Timeline`, `CommentThread`, `ApprovalPanel`, `DocumentReviewShell`, `StepForm`, `PhotoCapture`, `VoiceRecorder`, `ConsentGate` และ `UploadQueue`

ทุก component ต้องมี Default, Hover, Focus, Disabled, Loading, Empty และ Error state พร้อมใช้งานคีย์บอร์ดและมีข้อความอ่านด้วย screen reader

## 8. สิ่งที่ตัดและสิ่งที่รวม

| เดิม | การจัดใหม่ |
|---|---|
| ลูกค้าและโอกาสขาย + ลูกค้าที่ใช้งาน | รวมเป็น `ลูกค้าสัมพันธ์`; Account เปลี่ยนสถานะตามวงจรชีวิต |
| กิจกรรมและแคมเปญ | ย้ายเป็น `ลูกค้าสัมพันธ์ > แหล่งที่มา` |
| ฝึกอบรมและบริการ | รวมใน `ส่งมอบและดูแล` และแยก Tab ภายใน |
| ข้อเสนอและการอนุมัติ | รวมใน `ข้อเสนอและสัญญา` |
| ผลการดำเนินงาน | รวมใน `รายงาน` |
| ตั้งค่าพื้นที่ BIB | ย้ายไป `/admin` และเมนูบัญชี |
| LINNA Report | เป็น `Account > Performance` ที่เปิดตาม Model D2 |
| Hero ขนาดใหญ่ทุกหน้า | คงเฉพาะหน้าเริ่มต้น Client/Prospect; หน้าทำงานใช้ Page Header |
| การ์ดสรุปซ้ำหลายชุด | เหลือ Metric Strip หนึ่งชุดต่อหน้าและต้องเปิดดูรายการต้นทางได้ |
| คำอังกฤษในเมนู | เปลี่ยนเป็นไทย; แสดงอังกฤษเป็นคำรองเมื่อจำเป็น |

## 9. แผน Migration และ Cutover

### ระยะ 0 — Freeze (ทันที)

- ห้ามเพิ่ม view หรือ CSS selector ใน `/platform` เดิม ยกเว้นแก้ข้อผิดพลาดร้ายแรง
- บันทึก route, API และ component ที่มีอยู่ พร้อมจับภาพหน้าจออ้างอิง
- เปิดป้าย `Legacy` ภายในทีมพัฒนา ไม่แสดงแก่ลูกค้า

### ระยะ 1 — Foundation

- สร้าง token และ component set กลาง
- สร้าง layout แยก `/app`, `/portal`, `/therapist`, `/discover`, `/admin`
- ย้ายการตรวจสิทธิ์ไปที่ layout/route และทดสอบ account scope

### ระยะ 2 — Internal Core

- ย้ายตามลำดับ: งานของฉัน → CRM → ข้อเสนอและสัญญา
- ใช้ข้อมูล/API เดิมก่อน ไม่เปลี่ยน schema ระหว่างย้าย UI
- แต่ละหน้าต้องมี URL ตรง, Loading/Empty/Error และแหล่งข้อมูล

### ระยะ 3 — Operations และ Evidence

- ย้ายลูกค้าที่ใช้งาน, Training, Service, Warranty และ Reorder
- เปิด Therapist Mobile สำหรับส่งภาพ เสียง และข้อมูลเคส
- เปิด Evidence Review หลัง Consent และ Media Storage ผ่านการทดสอบ

### ระยะ 4 — Client และ Prospect

- เปลี่ยน `/client` เป็น Account-driven Portal
- เปิด LINNA ด้วย Model D2 configuration ไม่เขียนเงื่อนไขไว้ในหน้า
- ย้าย Demo Intake และหน้าหลักฐานไป `/discover`

### ระยะ 5 — UAT และ Cutover

- ทดสอบ 4 persona ด้วยกรณีจริง: BIB Sales, LINNA Owner, LINNA Therapist และ Prospect
- ตรวจ desktop/tablet/mobile, สิทธิ์, deep link, back button, export และ audit log
- เปิด V2 ผ่าน feature flag; เปลี่ยน redirect เมื่อผ่านเกณฑ์รับงาน
- คง Legacy แบบอ่านอย่างเดียว 14 วัน แล้วถอด route และ CSS ที่ไม่ถูกเรียกใช้

## 10. เกณฑ์รับงานก่อนเปลี่ยนระบบ

1. ผู้ใช้แต่ละบทบาทเห็นเมนูไม่เกิน 6 รายการและไม่เห็นข้อมูลนอกสิทธิ์
2. งานสำคัญทุกงานเปิดผ่าน URL ตรงและกลับมาทำต่อได้
3. ข้อมูลทุกตัวระบุสถานะและเปิดดูรายการต้นทางได้
4. ตัวอักษรเนื้อหาไม่น้อยกว่า 14px และ form บนมือถือไม่น้อยกว่า 16px
5. Therapist ส่งรูป อัดเสียง บันทึกร่าง และส่งการบ้านได้ภายในไม่เกิน 3 นาที
6. LINNA เห็นเฉพาะบัญชีของตน และข้อมูล D2 มาจาก configuration/ฐานข้อมูล
7. หน้าตรวจเอกสารใช้งานได้ครบ: Review, Comment, Request Changes, Approve และ Full-screen Document
8. ไม่มี navigation หรือ business data ที่ควบคุมด้วยค่าคงที่ใน page component
9. ผ่าน isolation test, keyboard test และ mobile viewport ก่อนเปิดใช้จริง

