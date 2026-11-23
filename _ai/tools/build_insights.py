#!/usr/bin/python3
"""สร้าง _ai/content/insights.csv · 1 ชิ้นต่อ ปัญหา × คอร์ส (5/10) ตามใบงาน v004 ข้อ 0.4
ส่วน 1 (คนไข้กลุ่มไหน) เขียนมือราย PS จาก trigger/job/avoid · ส่วน 2 (โอกาสของคลินิก) ประกอบจากข้อมูลจริง (เมนู · คอร์ส · นาที · ปัญหารองของ PS เดียวกัน)
ส่วน 3 (หลักฐาน) = หลักฐานอันดับแรกของปัญหานั้น ใช้ข้อความย่อจาก evidence_doctor.csv / cases_doctor.csv · ไม่มีราคา ไม่มีตัวเลขที่ไม่ได้มาจากตาราง
รัน: /usr/bin/python3 _ai/tools/build_insights.py (หลัง build_bodymap_data.py)"""
import csv, json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
d = json.load(open(os.path.join(ROOT, "lib/bodymap/data.generated.json")))
def rd(f, k):
    p = os.path.join(ROOT, "_ai/content", f)
    return {r[k]: r for r in csv.DictReader(open(p, encoding="utf-8-sig"))} if os.path.exists(p) else {}
EVS, CAS = rd("evidence_doctor.csv", "evidence_id"), rd("cases_doctor.csv", "case_id")
WHO = {
 "PS01": "คนไข้ที่ดูแลหน้ากับคุณสม่ำเสมออยู่แล้ว แล้ววันหนึ่งเห็นคอกับมือของตัวเองในรูป เขาอยากดูแลต่อเนื่องจากหน้าลงมา โดยไม่เพิ่มหลายขั้นตอน เปิดเรื่องด้วยการต่อยอดจากสิ่งที่เขาทำอยู่แล้ว",
 "PS02": "คนทำงานหน้าจอทั้งวัน เคยใช้บริการอื่นมาแล้วและกำลังมองหาการดูแลที่ตรงกับชีวิตทำงานมากกว่า เขาตัดสินใจง่ายเมื่อรู้ชัดว่าแต่ละครั้งจะได้รับอะไร บอกขั้นตอนและจำนวนครั้งให้เห็นตั้งแต่ต้น",
 "PS03": "คนที่ยืนหรือเดินทั้งวัน เลิกงานแล้วรองเท้าแน่น ขาหนัก เขาอยากได้ความสบายของขาที่ใช้ทำงานทุกวัน คุยเรื่องความสบายตัวเป็นหลัก เพราะนั่นคือเหตุผลที่เขามา",
 "PS05": "คนที่ออกกำลังกายและพอใจรูปร่างตัวเองแล้ว แต่ยังสนใจผิวที่เป็นบุ๋ม เขาอยากดูแลคุณภาพผิว โดยไม่ตั้งเป้าลดน้ำหนักเพิ่ม เริ่มคุยที่ผิว เรื่องน้ำหนักเขาทำมาดีแล้ว",
 "PS06": "คนที่ลดน้ำหนักจนคงที่แล้วและกำลังมองขั้นต่อไป เขาอยากดูแลผิวบนรูปร่างปัจจุบันของตัวเอง วางแผนจากรูปร่างวันนี้ของเขา",
 "PS07": "คุณแม่หลังคลอดที่เริ่มมีเวลาให้ตัวเอง หรือกำลังจะกลับไปทำงาน เขาอยากเลือกดูแลเรื่องที่ตัวเองต้องการตามความพร้อม ให้เขาเป็นคนกำหนดจังหวะและลำดับ",
 "PS08": "คนที่เห็นผิวเปลี่ยนในหลายบริเวณ และอยากวางแผนดูแลเป็นลำดับมากกว่าทำเฉพาะจุดครั้งเดียว เขาอยากได้แผนที่เลือกเองได้ว่าจะเริ่มจากตรงไหน เสนอเป็นแผนให้เลือกแล้วจัดลำดับร่วมกัน",
 "PS10": "คนไข้ที่กำลังเตรียมหัตถการ หรืออยู่ช่วงติดตามหลังทำ เขาอยากรู้ว่าขั้นต่อไปคืออะไรและใครเป็นคนดูแล เริ่มจากซักประวัติหัตถการ แล้วบอกแผนทีละขั้น",
 "PS11": "คนที่มีแผลเดิม และรู้สึกรั้งเมื่อกลับมาขยับหรือสัมผัสบริเวณนั้น เขาอยากดูแลทั้งรอยและความรู้สึกที่ยังรบกวนอยู่ ถามเรื่องการขยับและความรู้สึกก่อนเรื่องสีของรอย",
 "PS12": "คนที่มีอาการบวมหรือปวดต่อเนื่อง หรือได้รับการวินิจฉัยแล้วและกำลังหาทีมดูแล เขาอยากรู้ว่าจะไปต่อกับใครและต้องเตรียมข้อมูลอะไร เริ่มจากสาเหตุและประวัติ แล้ววางแผนร่วมกับทีมที่ดูแลเขาอยู่",
}
Z = {z["id"]: z["th"] for z in d["zones"]}; T = {t["id"]: t for t in d["templates"]}; B = {b["id"]: b for b in d["bibProtocols"]}
P = {p["id"]: p for p in d["programs"]}; E = {e["id"]: e for e in d["evidence"]}; K = {c["id"]: c for c in d["cases"]}
def nm(x): return "%s (%s)" % (x["nameTh"], x["name"]) if x.get("nameTh") else x["name"]
def freq(s):
    m = re.match(r"(\d)x/week", s or ""); return "สัปดาห์ละ %s ครั้ง" % m.group(1) if m else (s or "")
rows = []; skipped = []
for c in d["concerns"]:
    ps = c["psPrimary"][0] if c["psPrimary"] else None
    for course in (5, 10):
        t = T.get(c["template5"] if course == 5 else c["template10"]) if (c["template5"] or c["template10"]) else None
        opp = []
        if c["bibProtocols"]:
            b = B[c["bibProtocols"][0]]
            opp.append("แผนดูแลที่เปิดขายได้: %s%s" % (nm(b), " · %d นาทีต่อครั้ง" % b["totalMinutes"] if b["totalMinutes"] else ""))
            if len(c["bibProtocols"]) > 1: opp.append("แผนดูแลอื่นที่ใช้ได้: " + " · ".join(nm(B[x]) for x in c["bibProtocols"][1:]))
        if t:
            mins = "ครั้งที่ 1–5 ใช้ %s นาที" % t["minutes1to5"] if t["minutes1to5"] else ""
            if course == 10 and t["minutes6to10"]: mins += " · ครั้งที่ 6–10 ใช้ %s นาที" % t["minutes6to10"]
            opp.append("คอร์ส %d ครั้ง ตามแผนของผู้ผลิต %s%s%s" % (course, nm(t), " · " + freq(t["frequency"]) if t["frequency"] else "", " · " + mins if mins else ""))
        if not c["bibProtocols"] and not t and c["programs"]:
            opp.append("ใช้โปรแกรม %s ได้โดยตรง" % " · ".join(P[x["programId"]]["name"] for x in c["programs"] if x["programId"] in P))
        if not opp: skipped.append((c["id"], course)); continue
        if ps:
            sec = [x for x in d["concerns"] if ps in x["psSecondary"] and x["id"] != c["id"]][:4]
            if sec:
                zs = []
                for x in sec:
                    for z in (x["zones"] if len(x["zones"]) <= 2 else []):
                        if Z[z] not in zs: zs.append(Z[z])
                opp.append("คนไข้กลุ่มเดียวกันมักมีเรื่อง %s ร่วมด้วย%s" % (" · ".join(x["label"] for x in sec), " ชวนดูแลต่อได้ที่ " + " · ".join(zs[:3]) if zs else ""))
        proof = ref = ""
        evs = sorted((E[i] for i in c["evidence"] if i in E), key=lambda e: (e["rank"], e["id"]))
        cs = [K[i] for i in c["cases"] if i in K]
        if evs:
            e = evs[0]; ref = e["id"]; s = (EVS.get(ref, {}).get("short_doctor") or e["title"]).strip()
            h = (EVS.get(ref, {}).get("headline_number") or "").strip()
            proof = "%s%s (%s)" % (h + " · " if h and h not in s else "", s, " · ".join(x for x in (e["level"], e["relation"]) if x))
        elif cs:
            k = sorted(cs, key=lambda x: (x["quality"] or "Z", x["id"]))[0]; ref = k["id"]
            proof = "%s (เคสจริง · คุณภาพ %s)" % ((CAS.get(ref, {}).get("short_doctor") or k["result"]).strip(), k["quality"] or "—")
        rows.append({"content_id": "BMC-%s-C%02d" % (c["id"], course), "pain_id": c["id"], "course": course, "ps_id": ps or "",
                     "who": WHO.get(ps, ""), "opportunity": "\n".join(opp), "proof": proof, "proof_ref": ref, "status": "ร่าง"})
out = os.path.join(ROOT, "_ai/content/insights.csv")
w = csv.DictWriter(open(out, "w", encoding="utf-8-sig", newline=""), fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
print("wrote", len(rows), "rows · skipped (ไม่มี Protocol/โปรแกรม):", sorted(set(p for p, _ in skipped)))
print("no who:", sum(1 for r in rows if not r["who"]), "· no proof:", sum(1 for r in rows if not r["proof"]))
