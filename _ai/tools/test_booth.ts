// ตรวจจอบูธก่อนขึ้นลิงก์ (กฎตรวจแบบ CPQ) · ไม่ผ่าน = exit 1 → ห้าม deploy
// รัน: npx tsx _ai/tools/test_booth.ts
import { loadBodyMap } from "../../lib/bodymap/data";
import { boothEligible, programLibrary, boothProgram, MANUAL_LINK, MEDICAL_WORDS } from "../../lib/bodymap/programLibrary";

let fail = 0;
const bad = (m: string) => { fail++; console.log("  ✕ " + m); };
for (const mode of ["showcase", "internal"] as const) {
  const d = loadBodyMap(mode);
  const ok = d.concerns.filter((c) => boothEligible(c, d));
  console.log(`[${mode}] ปัญหาขึ้นจอบูธ ${ok.length}/${d.concerns.length}`);
  for (const c of ok) {
    if (MEDICAL_WORDS.some((w) => c.label.toLowerCase().includes(w))) bad(`${c.id} มีคำเชิงการแพทย์`);
    const lib = programLibrary([c], d, 99, 99);
    if (!lib.manual.length && !lib.mechanism.length) bad(`${c.id} ${c.label} ไม่มีโปรแกรม`);
    for (const it of [...lib.manual, ...lib.mechanism]) if (!boothProgram(it.p)) bad(`${c.id} มีโปรแกรมที่ไม่ควรขึ้นจอ ${it.p.name}`);
    for (const it of lib.manual) {
      if (!c.programs.some((x) => x.programId === it.p.id && x.type === MANUAL_LINK)) bad(`${c.id} ป้ายคู่มือ ${it.p.name} ไม่ได้มาจากเส้น "ตรงตามคู่มือ"`);
      if (!it.p.sourcePage) bad(`${it.p.name} ไม่มีเลขหน้าคู่มือ`);
    }
  }
  for (const z of d.zones) if (!ok.some((c) => c.zones.includes(z.id))) bad(`บริเวณ ${z.th} ไม่มีปัญหาบนจอบูธ`);
  const withManual = ok.filter((c) => programLibrary([c], d).manual.length).length;
  console.log(`  ปัญหาที่มีโปรแกรม "ตามคู่มือ" ${withManual}/${ok.length}`);
}
console.log(fail ? `BOOTH CHECK FAIL (${fail})` : "BOOTH CHECK PASS");
process.exit(fail ? 1 : 0);
