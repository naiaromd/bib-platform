#!/usr/bin/python3
"""ปรับเนื้อหา (โปรแกรม · หลักฐาน · เคส) ให้ตรงกติกาคำ v005 ข้อ 00.2 · แก้ไฟล์ใน _ai/content/ ตรงๆ (สำเนาก่อนแก้: _ai/work_bm_r05/content_before_v005_wording/)
- ชื่อโปรแกรมไม่อยู่ในประโยคไทย · คำอังกฤษทั่วไปแปลเป็นไทย · คงไว้: ชื่อเฉพาะ (คน · วารสาร · องค์กร · แบรนด์ · มาตรวัด) · สัญลักษณ์สถิติ · ศัพท์เครื่อง
- บรรทัด "ชื่องาน" "ใคร ปีไหน" "ลิงก์" ของการ์ดงานวิจัยเป็นการอ้างอิง ไม่แปล
รันซ้ำได้ (แทนที่แล้วไม่เหลือคำเดิม) · จบแล้วพิมพ์คำอังกฤษที่ยังเหลือให้ตรวจ"""
import csv, json, os, re, collections
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
C = lambda f: os.path.join(ROOT, "_ai/content", f)
PROG = sorted((p["name"] for p in json.load(open(os.path.join(ROOT, "lib/bodymap/data.generated.json")))["programs"]), key=len, reverse=True)
G = [  # (คำเดิม, คำไทย) · วลียาวก่อนคำสั้น
 ("Systematic review / Meta-analysis", "งานทบทวนอย่างเป็นระบบ / วิเคราะห์อภิมาน"), ("Cochrane systematic review", "งานทบทวนอย่างเป็นระบบของ Cochrane"),
 ("Systematic review", "งานทบทวนอย่างเป็นระบบ"), ("systematic review", "งานทบทวนอย่างเป็นระบบ"), ("Narrative review", "งานทบทวนเชิงบรรยาย"),
 ("full review", "งานทบทวนฉบับเต็ม"), ("review summary", "บทสรุปงานทบทวน"), ("full text", "ฉบับเต็ม"), ("abstract", "บทคัดย่อ"), ("review", "งานทบทวน"),
 ("COI", "ผลประโยชน์ทับซ้อน"), ("clinical controlled trial", "การทดลองทางคลินิกแบบมีกลุ่มควบคุม"), ("clinical efficacy trial", "การทดลองวัดผลการรักษา"),
 ("head-to-head trial", "การทดลองเทียบกันโดยตรง"), ("Prospective clinical study", "การศึกษาทางคลินิกแบบไปข้างหน้า"), ("Descriptive observational", "การศึกษาเชิงพรรณนาแบบสังเกต"),
 ("Descriptive study", "การศึกษาเชิงพรรณนา"), ("Cross-sectional", "การศึกษาภาคตัดขวาง"), ("Trial II", "การทดลองที่ 2"), ("Trial I", "การทดลองที่ 1"),
 ("trials", "การทดลอง"), ("studies", "งาน"), ("Protocol RCT", "แบบแผนการทดลอง RCT"), ("Protocol", "แผนดูแล"), ("protocol", "วิธีทำ"), ("pilot", "งานนำร่อง"),
 ("Phase II", "ระยะที่ 2"), ("open-label", "ไม่ปกปิดกลุ่ม"), ("non-inferiority", "ความไม่ด้อยกว่า"), ("equivalence", "ความเท่าเทียม"), ("Assessor-blinded", "ปกปิดผู้ประเมิน"),
 ("retrospective", "ย้อนหลัง"), ("Hospital sample", "กลุ่มตัวอย่างจากโรงพยาบาล"), ("Self-report", "รายงานด้วยตนเอง"), ("recall bias", "อคติจากการระลึก"), ("dropout", "ออกกลางคัน"),
 ("baseline", "ค่าตั้งต้น"), ("sham", "กลุ่มหลอก"), ("control", "กลุ่มควบคุม"), ("Thai validation", "การตรวจสอบฉบับภาษาไทย"), ("Validation", "การตรวจสอบความเที่ยงตรงของ"),
 ("validation", "การตรวจสอบความเที่ยงตรง"), ("mean difference", "ผลต่างเฉลี่ย"), ("standard error", "ความคลาดเคลื่อนมาตรฐาน"), ("gold standard", "มาตรฐานอ้างอิง"),
 ("adverse effects", "ผลข้างเคียง"), ("adverse events", "ผลข้างเคียง"), ("dose", "ขนาดการใช้"), ("endorse", "การรับรอง"), ("in vitro", "ในห้องทดลอง"),
 ("patient scale", "แบบประเมินฝั่งคนไข้"), ("alpha patient", "แอลฟาฝั่งคนไข้"), ("observer", "ฝั่งผู้ประเมิน"), ("Cronbach alpha", "ค่าแอลฟาของครอนบาค"), ("alpha", "แอลฟา"),
 ("pliability", "ความยืดหยุ่นของแผล"), ("group×time", "กลุ่ม×เวลา"), ("functional well-being", "สุขภาวะด้านการใช้งาน"), ("grip", "แรงบีบมือ"), ("ROM", "พิสัยการขยับ"),
 ("mechanical massage", "การนวดด้วยเครื่อง"), ("Mechanical stimulation", "การกระตุ้นเชิงกล"), ("mechanical stimulation", "การกระตุ้นเชิงกล"), ("connective tissue manipulation", "การนวดเนื้อเยื่อเกี่ยวพัน"),
 ("vacuum massage", "การนวดด้วยแรงดูด"), ("massage", "การนวด"), ("MLD", "การนวดระบายน้ำเหลืองด้วยมือ"), ("bandage", "ผ้าพัน"), ("compression", "การพันกด"),
 ("pneumatic pump", "เครื่องบีบลม"), ("intensive decongestive treatment", "การรักษาลดบวมแบบเข้มข้น"), ("CDT", "การรักษาลดบวมแบบผสมผสาน"), ("exercise", "การออกกำลังกาย"),
 ("ultrasound", "อัลตราซาวด์"), ("skinfold", "ความหนาชั้นไขมันใต้ผิว"), ("excess volume", "ปริมาตรส่วนเกิน"), ("quadriceps", "กล้ามเนื้อต้นขาด้านหน้า"), ("biopsy", "ตัดชิ้นเนื้อ"),
 ("inflammatory signaling", "สัญญาณการอักเสบ"), ("glycogen/lactate", "ไกลโคเจน/แลกเตต"), ("gingival fibroblasts", "เซลล์ไฟโบรบลาสต์จากเหงือก"), ("collagen membrane", "แผ่นคอลลาเจน"),
 ("dental fibroblast", "เซลล์ไฟโบรบลาสต์จากฟัน"), ("microvacuole", "ไมโครแวคิวโอล"), ("disruption", "การแยกตัวของ"), ("aspirin/warfarin", "แอสไพริน/วาร์ฟาริน"),
 ("RF cavitation", "คลื่นวิทยุและคาวิเทชัน"), ("lymphatic drainage", "การระบายน้ำเหลือง"), ("reflux", "การไหลย้อน"), ("water volumetry/tape/perometry", "การแทนที่น้ำ/สายวัด/เครื่องเพอโรมิเตอร์"),
 ("truncated-cone", "สูตรกรวยตัดยอด"), ("DVT", "หลอดเลือดดำอุดตัน"), ("CVI", "หลอดเลือดดำบกพร่องเรื้อรัง"), ("IFU", "คู่มือการใช้"), ("Cochrane page", "หน้าเว็บ Cochrane"),
 ("(ที่มาการ์ด PRO-CARD)", "(ที่มาของแผนของผู้ผลิต)"), ("cm²", "ตร.ซม."), ("vs", "เทียบกับ"),
 ("cold fovea", "รอยกดบุ๋มที่ผิวเย็น"), ("Fibrosclerotic Panniculopathy", "เนื้อเยื่อไขมันใต้ผิวที่เป็นพังผืดแข็ง"),
]
ONE = {  # แก้รายแถว (ข้อความย่อ) ที่ต้องเรียบเรียงใหม่
 ("evidence", "EV-011", "short_doctor"): "แผนดูแลหลังผ่าตัดเต้านม: แผลเป็นใช้ไม่เกินราว 5 นาที",
 ("evidence", "EV-018", "short_doctor"): "รอยแตกลายหลังคลอด: ผิวเรียบเนียนขึ้นหลังใช้ 2 โปรแกรมต่อเนื่อง",
 ("evidence", "EV-019", "short_doctor"): "ต้นแขน: icoone คู่ Renuvion พักฟื้นน้อย ตีพิมพ์ในวารสาร Clin Case Rep",
 ("evidence", "PX-005", "short_doctor"): "ทบทวน 19 งานเรื่องการนวดด้วยแรงดูดกับชั้นผิว",
 ("evidence", "PX-006", "short_doctor"): "แผลเป็นไฟไหม้: นวดด้วยแรงดูดครั้งเดียว หนังแท้หนาขึ้นที่ 5 นาที",
 ("evidence", "EV-027", "short_doctor"): "คู่มือผู้ผลิต: 40 โปรแกรม หัวเครื่อง และตัวอย่างกลุ่ม Healthcare",
 ("evidence", "PX-024", "short_doctor"): "คนไข้หลอดเลือดดำไทย 260 คน: อ้วนมาก อายุ และประวัติหลอดเลือดดำอุดตัน สัมพันธ์กับโรครุนแรง",
 ("evidence", "PX-025", "short_doctor"): "หลอดเลือดดำบกพร่องเรื้อรังในคนไทย 78 คน: เห็นเส้นเลือดขอดเพียงครึ่งเดียว",
 ("programs", "PRG-031", "short_doctor"): "ปิดท้ายแผนดูแลน้ำเหลือง กล้ามเนื้อ และแผลเป็น",
}
SKIP = ("ชื่องาน", "ใคร ปีไหน", "ลิงก์")
def tr(t):
    for a, b in G:
        t = re.sub(r"(?<![A-Za-z])" + re.escape(a) + r"(?![A-Za-z])", b, t) if re.match(r"[A-Za-z(]", a) and a[-1].isalpha() else t.replace(a, b)
    return re.sub(r"  +", " ", t)
def no_prog(t):
    """ตัดชื่อโปรแกรมออกจากประโยค: 'A + B + C' → 'N โปรแกรม' · ในวงเล็บ → ตัดวงเล็บ"""
    names = "(?:" + "|".join(re.escape(n) for n in PROG) + ")"
    t = re.sub(r"\s*\((?:%s[\s,]*)+\)" % names, "", t)
    def rep(m):
        n = len(re.findall(names, m.group(0))); extra = " ร่วมกับ Laser และ LED" if "Laser/LED" in m.group(0) else ""
        return "%d โปรแกรม%s" % (n, extra)
    return re.sub(r"%s(?:\s*\+\s*(?:%s|Laser/LED))*" % (names, names), rep, t)
def detail(t): return "\n".join(ln if ln.startswith(SKIP) else no_prog(tr(ln)) for ln in t.split("\n"))
def run(kind, f, key, cols, cite=False):
    rows = list(csv.DictReader(open(C(f), encoding="utf-8-sig"))); n = 0
    for r in rows:
        for col in cols:
            old = r[col]; new = ONE.get((kind, r[key], col)) or (detail(old) if col == "detail_doctor" else no_prog(tr(old)))
            if new != old: r[col] = new; n += 1
    w = csv.DictWriter(open(C(f), "w", encoding="utf-8-sig", newline=""), fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
    print(f, "แก้", n, "ช่อง"); return rows
P = run("programs", "programs_doctor.csv", "program_id", ["short_doctor", "detail_doctor"])
E = run("evidence", "evidence_doctor.csv", "evidence_id", ["short_doctor", "detail_doctor"])
K = run("cases", "cases_doctor.csv", "case_id", ["short_doctor"])
left = collections.Counter(); prog_left = 0
for rows, cols in ((P, ["short_doctor", "detail_doctor"]), (E, ["short_doctor", "headline_number", "detail_doctor"]), (K, ["short_doctor"])):
    for r in rows:
        for col in cols:
            for ln in r[col].split("\n"):
                if ln.startswith(SKIP): continue
                prog_left += sum(1 for n in PROG if re.search(r"(?<![A-Za-z])" + re.escape(n) + r"(?![A-Za-z])", ln))
                for x in PROG: ln = ln.replace(x, " ")
                for wd in re.findall(r"[A-Za-z][A-Za-z\-']{2,}", ln): left[wd] += 1
print("ชื่อโปรแกรมที่ยังอยู่ในประโยค:", prog_left)
print("คำอังกฤษที่ยังเหลือ (นอกบรรทัดอ้างอิง):", sorted(left.items(), key=lambda x: -x[1]))
