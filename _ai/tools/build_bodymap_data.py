#!/usr/bin/python3
"""สร้าง lib/bodymap/data.generated.json จาก CANON r03 + snapshot Airtable (23 พ.ย. 2026)
รัน: /usr/bin/python3 _ai/tools/build_bodymap_data.py   (จากโฟลเดอร์ bib-platform)
ไม่ใช้ token · ไม่เขียน Airtable · เมื่อมี token ให้เปลี่ยน lib/bodymap/data.ts ไปอ่าน Airtable ตรง (ดู PENDING)
"""
import csv, json, os, re, collections
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CAN = os.path.join(ROOT, "_ai/canon_r03"); SNAP = os.path.join(ROOT, "_ai/airtable_snapshot_20261123")
OUT = os.path.join(ROOT, "lib/bodymap/data.generated.json")
R = lambda f: list(csv.DictReader(open(os.path.join(CAN, f), encoding="utf-8-sig")))
A = lambda f: [r for r in json.load(open(os.path.join(SNAP, f)))["records"]]
def sel(v): return v.get("name") if isinstance(v, dict) else None
def msel(v): return [x["name"] for x in (v or [])]
def links(v): return [x["name"] for x in (v or [])]
def clean(t):
    """แก้สระเพี้ยนจากการแปลง PDF ตอนแสดง (ไม่แก้ต้นทาง) เช่น ลำาคอ -> ลำคอ"""
    if not t: return ""
    t = t.replace("ำา", "ำ").replace("ําา", "ำ")
    return re.sub(r"\s+", " ", t).strip()

# ---------- zones
zones = [{"id": z["zone_id"], "th": z["zone_th"], "view": z["view"]} for z in R("body_zones.csv")]
fig = json.load(open(os.path.join(CAN, "figure_points.json")))

# ---------- programs (Airtable snapshot = ต้นทางรายละเอียด · CANON = ชื่อไทย/ตำแหน่ง)
canp = {p["program_id"]: p for p in R("programs.csv")}
def content(f, k):
    """เนื้อหาที่เขียนแล้ว (สำเนาของที่ลง Airtable สถานะร่าง) · ไม่มีไฟล์ = ช่องว่าง"""
    p = os.path.join(ROOT, "_ai/content", f)
    return {r[k]: r for r in csv.DictReader(open(p, encoding="utf-8-sig"))} if os.path.exists(p) else {}
PLAN_TH = content("plan_names_th.csv", "plan_id"); SHORT = content("programs_doctor.csv", "program_id"); EVC = content("evidence_doctor.csv", "evidence_id"); CAC = content("cases_doctor.csv", "case_id")
programs = []
for r in A("programs.json"):
    v = r["cellValuesByFieldId"]; pid = v["fldVsuhHbYugeVaOJ"]; c = canp.get(pid, {})
    exam = clean(v.get("fldOx3G3N088WvJNl")); pos = ""
    m = re.search(r"ตำแหน่งของผู้ป่วย\s*:\s*(.+)$", exam)
    if m: pos = m.group(1).strip(); exam = exam[:m.start()].strip()
    notes = re.sub(r"\s*\d{3}$", "", clean(v.get("fldeybnjThrKCTmwX"))).lstrip(": ").strip()
    s = SHORT.get(pid, {})
    programs.append({"id": pid, "name": v["fldke8dNLmkJg5LPG"], "group": sel(v.get("fldK8Q8ScUiejGjKv")) or "",
        "effectTags": v.get("fldutB9Fbjn6Y1qWF") or "", "aim": clean(v.get("fldNqjZU66Jvg7Fkt")), "exam": exam, "position": pos, "notes": notes,
        "defaultMinutes": v.get("fldVu3FROhL7OtWEy"), "headCompat": v.get("fldYf6InGtWCeO9bl") or "",
        "short": s.get("short_doctor", ""), "detail": s.get("detail_doctor", ""), "shortStatus": s.get("status", ""),
        "ceMedical": (c.get("ce_medical_0476") or "").strip(), "locked": bool(v.get("fldO624FM2RiMjL9i")),
        "sourcePage": v.get("fldxlgA3BPQvwLb6h") or ""})
programs.sort(key=lambda p: p["id"])
pname2id = {p["name"]: p["id"] for p in programs}

# ---------- manufacturer protocol templates
steps_by = collections.defaultdict(list)
for s in R("protocol_steps.csv"):
    steps_by[s["protocol_id"]].append({"range": s["session_range"], "phase": int(s["phase_order"]), "order": int(s["step_order"]),
        "programId": s["program_id"], "minutes": int(s["minutes"]) if s["minutes"] else None, "handpiece": s["handpiece"] or None, "raw": s["raw_component"]})
templates = []
for c in R("protocol_cards.csv"):
    st = sorted(steps_by[c["protocol_id"]], key=lambda x: (x["phase"], x["order"]))
    templates.append({"id": c["protocol_id"], "nameTh": PLAN_TH.get(c["protocol_id"], {}).get("name_th", ""), "name": c["original_title"] or c["name"], "family": c["family"], "subline": c["subline"], "target": c["target"],
        "area": c["area"], "sessions": c["sessions"], "frequency": c["frequency"], "statedMinutes": c["stated_minutes"],
        "minutes1to5": c["minutes_sessions_1_5"] or None, "minutes6to10": c["minutes_sessions_6_10"] or None, "minutesCheck": c["minutes_check"],
        "assessment": c.get("exam_criteria") or c.get("presentation") or "", "aim": c.get("aim") or "", "footnotes": c["footnotes"], "steps": st,
        "status": c["status"], "locked": False})

# ---------- BIB protocols (ชื่อหน้าลูกค้า = เมนู)
menus = {m["menu_key"]: m for m in R("menus.csv")}
bsteps = collections.defaultdict(list)
for s in R("menu_protocol_steps.csv"):
    bsteps[s["Protocol reference"]].append({"order": int(s["Step order from source listing"]), "programId": s["Program ID"] or None,
        "options": [x for x in (s["Program options"] or "").split(";") if x] if not s["Program ID"] else [], "stepType": s["Step type"], "raw": s["Source raw"], "minutes": None})
bib = []
for m in menus.values():
    if m["menu_set"] != "BIB Menu 21": continue
    bib.append({"id": "BIB:" + m["name"], "nameTh": PLAN_TH.get("BIB:" + m["name"], {}).get("name_th", ""), "name": m["name"], "consumerLabel": m["name"], "legacyAlias": m["legacy_alias"], "category": m["category"],
        "totalMinutes": int(m["minutes"]) if m["minutes"].isdigit() else None, "composition": m["composition_programs"],
        "steps": sorted(bsteps[m["protocol_reference"]], key=lambda x: x["order"]), "status": "draft", "locked": False})
menu2bib = {k: "BIB:" + m["name"] for k, m in menus.items() if m["menu_set"] == "BIB Menu 21"}

# ---------- patient situations
ps = [{"id": p["ps_id"], "canon": p["canon_name"], "label": p["label_doctor"] or p["canon_name"], "trigger": p["trigger"], "job": p["job"], "avoid": p["avoid"],
       "status": p["group_status"], "locked": False} for p in R("patient_situations_12.csv")]
ps_pri = collections.defaultdict(list); ps_sec = collections.defaultdict(list)
for x in R("patient_situation_pain_links.csv"): (ps_pri if x["match"] == "Primary" else ps_sec)[x["pain_id"]].append(x["ps_id"])

# ---------- evidence (กรอง: เอกสารลับ · ไม่มี "หมอ")
QMAP = {"01": "works", "03": "works", "02": "how", "04": "how", "05": "protocol", "08": "protocol", "06": "safety", "12": "safety", "10": "patient", "09": "patient", "11": "peers", "07": "peers"}
REL_RANK = {"ใช้ icoone ตรง": 0, "เครื่องประเภทเดียวกัน": 1, "กลไกพื้นฐาน": 2, "เอกสารผู้ผลิต": 3, "ไม่เกี่ยวกับเครื่อง": 4, "สื่อ": 5}
LVL_RANK = {"Systematic review / Meta-analysis": 0, "RCT": 0, "มีกลุ่มเทียบ": 1}
evidence = []; ev_skip = collections.Counter(); ev_by_p = collections.defaultdict(list); ev_by_prg = collections.defaultdict(list)
for r in A("research_evidence.json"):
    v = r["cellValuesByFieldId"]; eid = v["fld24fsyv4kRLUTqB"]
    if v.get("flduceWP2PdAjpl0x"): ev_skip["secret"] += 1; continue
    if "หมอ" not in msel(v.get("fldOor0aoqxeHP5xE")): ev_skip["not_for_doctor"] += 1; continue
    cats = msel(v.get("fldFhZdJOyHdBGw6d")); qs = []
    for c in cats:
        q = QMAP.get(c[:2])
        if q and q not in qs: qs.append(q)
    rel = sel(v.get("fldYEfOaPiqNdeqRj")) or ""; lvl = sel(v.get("fldn48nSkwL8sTmn6")) or ""
    P = [x for x in (v.get("fldOiFpGA2JMQjqhA") or "").split(";") if x]; G = [x for x in (v.get("fldVBB2ShIpxsu10H") or "").split(";") if x]
    evidence.append({"id": eid, "title": v.get("fldm64aKaz4UDMXE6") or "", "year": v.get("flda6Ix9P7LPg4055"), "authors": v.get("fld6c5URo8KQg18QK") or "",
        "categories": cats, "questions": qs, "relation": rel, "level": lvl, "n": v.get("fldzUMpfCEF9jhdqF"), "summary": v.get("fldliHY0YWysAaBwB") or "",
        "direction": sel(v.get("fld7qanyMUHlZSLKw")) or "", "canSay": v.get("fldg0fUkC8HeuDBKv") or "", "limits": v.get("fldz2cFwMssUgWCXs") or "",
        "url": v.get("fldFibKJzjBNnExP8") or "", "reviewStatus": sel(v.get("fldrl4NM35ixParxG")) or "", "pains": P, "programs": G,
        "short": EVC.get(eid, {}).get("short_doctor", ""), "detail": EVC.get(eid, {}).get("detail_doctor", ""), "headline": EVC.get(eid, {}).get("headline_number", ""), "rank": [REL_RANK.get(rel, 9), LVL_RANK.get(lvl, 2)], "locked": bool(v.get("fldXCdw6WnLhzkT52"))})
    for p in P: ev_by_p[p].append(eid)
    for g in G: ev_by_prg[g].append(eid)
# หลักฐานจากเอกสารขาย/สื่อใน Google Drive (ไนน์สั่ง 24 พ.ย.: บอกที่มาให้หมอพิจารณาเอง ไม่ตัดออกเพราะระดับหลักฐาน)
for r in csv.DictReader(open(os.path.join(ROOT, "_ai/content/evidence_sales_docs.csv"), encoding="utf-8-sig")) if os.path.exists(os.path.join(ROOT, "_ai/content/evidence_sales_docs.csv")) else []:
    P = [x for x in r["pains"].split(";") if x]
    evidence.append({"id": r["evidence_id"], "title": r["title"], "year": None, "authors": r["authors"], "categories": [], "questions": [q for q in r["questions"].split(";") if q],
        "relation": r["relation"], "level": r["level"], "n": None, "summary": "", "direction": "", "canSay": "", "limits": "", "url": "",
        "reviewStatus": "ร่าง · จากเอกสารใน Google Drive", "pains": P, "programs": [], "short": r["short_doctor"], "detail": r["detail_doctor"], "headline": "",
        "rank": [REL_RANK.get(r["relation"], 5), 3], "locked": False})
    for p in P: ev_by_p[p].append(r["evidence_id"])
evidence.sort(key=lambda e: (e["rank"], e["id"]))

# ---------- cases (กรอง: demo · อายุต่ำกว่า 18 · ไม่มี "หมอ" · ห้ามใช้ภายนอก) · ตัดชื่อคลินิกออก
cases = []; case_skip = collections.Counter(); case_by_p = collections.defaultdict(list)
for r in A("cases.json"):
    v = r["cellValuesByFieldId"]; cid = v.get("fldM1ioKMrTD5gBYp")
    if not cid: case_skip["demo"] += 1; continue
    use = msel(v.get("fldwzT8VwWcS1stmY"))
    if v.get("fldlKbSut3mdbxOt1"): case_skip["under18"] += 1; continue
    if "หมอ" not in use or "ห้ามใช้ภายนอก" in use: case_skip["not_for_doctor"] += 1; continue
    lab = (v.get("fldsaF3GCJDnVaxQk") or "").split(" · ")
    P = [x for x in (v.get("fldSsHEC4qYRDoZ51") or "").split(";") if x]
    cases.append({"id": cid, "topic": lab[1] if len(lab) > 1 else "", "quality": sel(v.get("fldtHE2AdVgvwjEQo")) or "", "pains": P, "country": v.get("fldMFFPSlhVkLeJSK") or "",
        "programs": [pname2id.get(n, n) for n in links(v.get("fldSzXR18iuo1ZmFv"))], "sequence": v.get("fld9t7RNvyTFpO3TC") or "",
        "sessions": v.get("fldM1EBwkSk0q3dRU"), "minutesPerSession": v.get("fld7zCxWRH2XKpyfD"), "frequency": v.get("fld2jURIAownntilu") or "",
        "goal": v.get("fld3i05RDLklOiJT9") or "", "result": v.get("flduNhV2uJIqE264g") or "", "measure": v.get("fldZiJqvDrz9LKD1a") or "",
        "limits": v.get("flddWlzeH4uT1tjCg") or "", "nearestTemplate": links(v.get("fld33aKEc3X0wR3R4")), "reviewStatus": sel(v.get("fldXiHWjyIW07o1hk")) or "",
        "short": CAC.get(cid, {}).get("short_doctor", ""), "locked": bool(v.get("fldysmpoQCX4B6f4d"))})
    for p in P: case_by_p[p].append(cid)
cases.sort(key=lambda c: ({"A": 0, "B": 1, "C": 2, "D": 3}.get(c["quality"], 9), c["id"]))

# ---------- concerns + links
cm = {x["pain_id"]: x for x in R("concern_card_match.csv")}
pl = collections.defaultdict(list)
for x in R("concern_program_links.csv"): pl[x["pain_id"]].append({"programId": x["program_id"], "type": x["link_type"]})
mb = collections.defaultdict(list)
for x in R("menu_concern_links.csv"):
    b = menu2bib[x["menu_key"]]
    if b not in mb[x["pain_id"]]: mb[x["pain_id"]].append(b)
FDA = {"P20", "P23", "P31", "P32", "P41", "P42", "P43"}
concerns = []
for c in R("concerns.csv"):
    p = c["pain_id"]; m = cm[p]
    concerns.append({"id": p, "label": c["label_doctor"] or c["original_concern"], "canon": c["original_concern"], "consumerLabel": c["label_consumer"],
        "group": c["group_names"], "category": c["category_names"], "zones": [z for z in c["body_zones"].split(";") if z], "zoneType": c["body_zone_type"],
        "terms": [t.strip() for t in c["customer_search_terms"].split("|") if t.strip()][:6], "question": c["clarifying_question"],
        "status": c["status"], "altMeaning": c["handoff_alt_meaning"], "fdaBadge": p in FDA,
        "bibProtocols": mb[p], "template5": m["card_5_sessions"] or None, "template10": m["card_10_sessions"] or None, "templateMatch": m["match_status"],
        "programs": pl[p], "evidence": [e for e in ev_by_p[p]], "cases": case_by_p[p], "psPrimary": ps_pri[p], "psSecondary": ps_sec[p], "locked": False})

insights = []
ip = os.path.join(ROOT, "_ai/content/insights.csv")
if os.path.exists(ip):
    for r in csv.DictReader(open(ip, encoding="utf-8-sig")):
        insights.append({"id": r["content_id"], "painId": r["pain_id"], "course": int(r["course"]), "who": r["who"], "opportunity": r["opportunity"],
                         "proof": r["proof"], "proofRef": r["proof_ref"], "status": r["status"], "locked": False})
data = {"meta": {"builtFrom": "CANON r03 + Airtable snapshot 2026-11-23 (อ่านอย่างเดียว)", "note": "ข้อมูลร่าง · ยังไม่มีแถวใดติ๊ก 🔒",
                 "skipped": {"evidence": dict(ev_skip), "cases": dict(case_skip)}},
        "zones": zones, "figurePoints": fig, "concerns": concerns, "programs": programs, "templates": templates, "bibProtocols": bib,
        "patientSituations": ps, "evidence": evidence, "cases": cases, "evidenceByProgram": ev_by_prg, "insights": insights}
json.dump(data, open(OUT, "w", encoding="utf8"), ensure_ascii=False, separators=(",", ":"))
print("wrote", OUT, os.path.getsize(OUT), "bytes")
print({k: len(v) for k, v in data.items() if isinstance(v, list)}, "skipped", data["meta"]["skipped"])
lay = collections.Counter("bib+tpl" if c["bibProtocols"] and c["template5"] else "bib" if c["bibProtocols"] else "tpl" if c["template5"] else "prog" if c["programs"] else "none" for c in concerns)
print("layers", dict(lay))
