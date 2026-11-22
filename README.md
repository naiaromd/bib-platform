# BIB × icoone · SEE THE UNSEEN

เว็บ B2B สำหรับคลินิก · icoone® Laser Med · ตัวแทนจำหน่ายในประเทศไทยคือ BIB (Beauty Innovation & Beyond)

> สาขานี้ `see-the-unseen-r03` คือการเขียนใหม่จาก prototype r03 ที่อยู่ใน `../landing-r03/BIB-handoff_r03`. สาขา `main` และ `saved-v56` เก็บโค้ด BIB Platform เดิม (ย้ายจาก chatgpt.site เมื่อ 13 พ.ย. 2026) ไว้ครบ ไม่ถูกแตะ

## สถานะตอนนี้

- ✅ หน้าแรก (Landing) · พร้อม hero interactive · video · handpieces · 40 programs · evidence · footer
- 🟡 Explorer · เป็น placeholder ที่รับ state จาก hero ได้แล้ว · เวอร์ชันเต็ม (4 ขั้น + animation + form) ลงใน commit ถัดไป
- ✅ API `/api/submit` · เขียนลง Airtable Web Leads + Explorer Drafts (ต้องใส่ `AIRTABLE_TOKEN` ก่อนใช้งานจริง)
- ⏳ API สำหรับ booking (Demo Slots · Workshops) ยังไม่ทำ · รอ confirm flow กับทีม
- ⏳ Mechanism page · อาจทำหลัง Explorer

## สิ่งที่พี่ไนน์ต้องทำเอง (ผมทำแทนไม่ได้)

| # | ขั้น | ที่ไหน | หมายเหตุ |
|---|---|---|---|
| 1 | Cloudflare Pages · สร้าง project ใหม่ | dash.cloudflare.com → Workers & Pages → Create · เชื่อมกับ GitHub repo `naiaromd/bib-platform` · branch `see-the-unseen-r03` | ใช้ build command `npm run pages:build` · output `.vercel/output/static` |
| 2 | ตั้ง env var `AIRTABLE_TOKEN` | Cloudflare dashboard → Pages project → Settings → Environment variables | ห้ามใส่ใน code หรือ commit · value ของพี่ไนน์เอง |
| 3 | DNS record สำหรับ subdomain | Cloudflare dashboard → wiseofwellness.com → DNS → เพิ่ม CNAME `bib` → Cloudflare Pages project | หลังเพิ่ม DNS เสร็จ ผมจะเปิดใช้ Custom Domain ใน Pages project |
| 4 | เปิด content flag ทีละอัน (ตอน soft launch) | Cloudflare dashboard → Pages → Settings → Environment variables | ดูรายการใน `.env.example` · default = OFF ทุกตัว |

## รัน local

```bash
npm install
cp .env.example .env.local
# ใส่ค่า AIRTABLE_TOKEN ของพี่ลงใน .env.local
npm run dev
```

เปิด http://localhost:3000

## Deploy ไป Cloudflare Pages (คำสั่ง · ถ้าพี่อยาก deploy จาก terminal)

```bash
npx wrangler login
npm run pages:deploy
```

## โครงสร้างไฟล์

```
bib-platform/
├── app/                     Next.js App Router
│   ├── layout.tsx           root layout · โหลด font
│   ├── globals.css          design tokens + Tailwind
│   ├── page.tsx             Landing (ประกอบจาก _components/landing/)
│   ├── _components/landing/ Header · Hero · Technology · Handpieces · Programs · Evidence · Trust · Clinics · Contact
│   ├── explorer/            /explorer route (placeholder)
│   └── api/submit/          Airtable Web Leads + Explorer Drafts (server · edge runtime)
├── lib/                     data + helpers (shared ระหว่าง Landing และ Explorer)
│   ├── areas.ts             7 บริเวณ · 31 โจทย์ · hotspot coords
│   ├── programs.ts          40 programs จัดกลุ่ม Base/Focus/Healthcare
│   ├── handpieces.ts        4 หัว · ppm · light=RS only
│   ├── assets.ts            map ไอคอน/รูปไปที่ /public/assets
│   └── env.ts               flag + Airtable form fallback + SITE_URL
├── public/assets/           46 PNG + 6 JPG + 1 MP4 (video Roboderm)
├── wrangler.toml            Cloudflare Pages config
├── .env.example             ตัวอย่าง env (copy ไป .env.local)
├── next.config.mjs
├── tsconfig.json
├── postcss.config.mjs
└── package.json             Next 15 · React 19 · Tailwind 4 · @cloudflare/next-on-pages
```

## Content flags (default OFF)

ทั้งหมดอ่านจาก env var · เปลี่ยนใน Cloudflare dashboard ไม่ต้อง deploy ใหม่

- `NEXT_PUBLIC_SHOW_CLIENT_LOGOS` · SHA · Dior · Clinique La Prairie ฯลฯ (ต้องขอ permission)
- `NEXT_PUBLIC_SHOW_GLOBAL_STATS` · 4,500+ ศูนย์ · 6,000,000+ ทรีตเมนต์ (ต้องมีแหล่งอ้างอิง)
- `NEXT_PUBLIC_SHOW_AWARDS` · 3 รางวัล
- `NEXT_PUBLIC_SHOW_FDA_BADGE` · CE 0476 · CE-MDR · FDA K211272
- `NEXT_PUBLIC_SHOW_STUDY_TABLE_DETAILS` · ลิงก์ paper
- `NEXT_PUBLIC_SHOW_PILOT_OFFER` · 5-Case Pilot
- `NEXT_PUBLIC_SHOW_REAL_QR` · QR LINE OA (ยังไม่มี OA)
- `NEXT_PUBLIC_NOINDEX` · ป้องกัน Google index ขณะ test (เปลี่ยนเป็น `false` ตอน launch)

## คำถามที่ยังค้าง (ต้องตัดสินใจก่อน launch)

ดู audit §06 ใน artifact — 8 ข้อ

## ที่มาของข้อมูล

- Programs · Protocol Templates · Template Steps → Airtable base `BIB Precision Lab` (`app2HcsMi1mmqTLJi`) อ่าน 22 Nov 2026
- Prototype → `../landing-r03/BIB-handoff_r03/prototypes/`
- Spec → `../landing-r03/BIB-handoff_r03/docs/AIRTABLE_LEADS_BOOKING_SPEC.md`
