// Service worker ของจอบูธ (/bodymap/booth) · ให้จอทำงานต่อได้เมื่อเน็ตหลุด หลังเปิดครั้งแรกแล้ว
// หน้าและข้อมูล: ลองเน็ตก่อน ไม่ได้ค่อยใช้ของที่เก็บไว้ · ไฟล์ static/รูป: ใช้ของที่เก็บไว้ก่อน · ไม่แตะ POST (บันทึกการใช้งาน)
const CACHE = "bm-booth-v14";
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["/bodymap/booth", "/assets/brand/bib-logo-white.png", "/assets/brand/icoone-logo-gold.png", "/assets/brand/bib-logo.png", "/assets/booth/doctor-f.jpg", "/assets/booth/doctor-m.jpg", "/assets/brand/icoone-laser-med-gold.png", "/assets/brand/icoone-laser-med-grey.png", "/assets/booth/roller-hd.mp4", "/assets/booth/roller-lite.mp4"])).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("bm-booth-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET") return;
  if (r.headers.has("range")) return; // วิดีโอขอเป็นช่วง ให้เบราว์เซอร์จัดการเอง (ไม่มีเน็ต = วิดีโอไม่เล่น หน้าอื่นใช้ได้ปกติ)
  const u = new URL(r.url);
  const isStatic = u.pathname.startsWith("/_next/static/") || u.pathname.startsWith("/assets/") || u.hostname.includes("fonts.g");
  if (isStatic) {
    e.respondWith(caches.match(r).then((hit) => hit || fetch(r).then((res) => { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(r, cp)); return res; })));
    return;
  }
  if (u.origin !== self.location.origin) return;
  e.respondWith(fetch(r).then((res) => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(r, cp)); } return res; }).catch(() => caches.match(r).then((hit) => hit || caches.match("/bodymap/booth"))));
});
