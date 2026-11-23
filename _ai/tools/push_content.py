#!/usr/bin/python3
"""ส่งเนื้อหาร่างทั้งหมดจาก _ai/content/ ขึ้น Airtable ให้ตรงกับที่หน้าเว็บแสดง · ใช้ AIRTABLE_TOKEN จาก .env.local เท่านั้น
รัน (จากโฟลเดอร์ bib-platform):  /usr/bin/python3 _ai/tools/push_content.py          ← นับก่อนว่าจะเขียนอะไรบ้าง (ไม่เขียน)
                                  /usr/bin/python3 _ai/tools/push_content.py --write  ← เขียนจริง ชุดละ 10 + Change Log ชุดละ 1 แถว
เขียนเฉพาะช่องเนื้อหาร่างที่งาน BM-R05 สร้าง: Programs (ย่อ-หมอ · ละเอียด-หมอ) · Research Evidence (ย่อ-หมอ · ละเอียด-หมอ) · Cases (ย่อ-หมอ)
· Body Map Content (Insight ย่อ/ละเอียด: แก้แถวที่มี Content ID อยู่แล้ว + เพิ่มแถวที่ยังไม่มี) · เขียนเฉพาะแถวที่ข้อความต่างจากใน Airtable · ไม่แตะ 🔒 และช่องอื่น"""
import csv, json, os, sys, time, urllib.request, urllib.parse
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BASE, LOG = "app2HcsMi1mmqTLJi", "tblKSV5ENmERlbMLA"
tok = os.environ.get("AIRTABLE_TOKEN", "")
env = os.path.join(ROOT, ".env.local")
if not tok and os.path.exists(env):
    for line in open(env, encoding="utf8"):
        if line.strip().startswith("AIRTABLE_TOKEN="): tok = line.split("=", 1)[1].strip().strip('"')
if not tok: sys.exit("ยังไม่มี AIRTABLE_TOKEN ใน .env.local")
WRITE = "--write" in sys.argv
def call(method, path, body=None):
    req = urllib.request.Request("https://api.airtable.com/v0/%s/%s" % (BASE, path), method=method,
        data=json.dumps(body).encode() if body else None, headers={"Authorization": "Bearer " + tok, "Content-Type": "application/json"})
    return json.load(urllib.request.urlopen(req))
def fetch(table, fields):
    out, off = [], None
    while True:
        q = [("returnFieldsByFieldId", "true"), ("pageSize", "100")] + [("fields[]", f) for f in fields]
        if off: q.append(("offset", off))
        r = call("GET", table + "?" + urllib.parse.urlencode(q)); out += r["records"]; off = r.get("offset")
        if not off: return out
def log(what, table):
    call("POST", LOG, {"typecast": True, "records": [{"fields": {"fldDMGqA6PBaSyhgJ": what, "fldnf2oYj3hIDzqaX": table, "fldFr1GjI0wdjKUzH": "_ai/content/ · push_content.py",
        "fldYqbMefZPjFZsp8": time.strftime("%Y-%m-%d"), "fldlAR6xD5df73J4k": "Claude Code (BM-R05)", "fldydnoKa8mY7pPtd": "เขียนแล้ว"}}]})
def send(table, name, method, rows):
    print("%s: %s %d แถว" % (name, "แก้" if method == "PATCH" else "เพิ่ม", len(rows)))
    if not WRITE: return
    for i in range(0, len(rows), 10):
        part = rows[i:i + 10]; call(method, table, {"typecast": True, "records": part})
        log("BM-R05 เนื้อหาร่าง: %s %s %d แถว (ชุด %d)" % (name, "แก้" if method == "PATCH" else "เพิ่ม", len(part), i // 10 + 1), name); time.sleep(0.25)
def rd(f): return list(csv.DictReader(open(os.path.join(ROOT, "_ai/content", f), encoding="utf-8-sig")))
def sync(table, name, keyfld, src, key, mp):
    cur = {r["fields"].get(keyfld): r for r in fetch(table, [keyfld] + list(mp.values()))}; todo = []
    for r in src:
        a = cur.get(r[key])
        if not a: print("  ไม่พบแถว", r[key]); continue
        f = {fld: r[col] for col, fld in mp.items() if (a["fields"].get(fld) or "") != r[col]}
        if f: todo.append({"id": a["id"], "fields": f})
    send(table, name, "PATCH", todo)
sync("tblCls7Ra523NAFZi", "Programs", "fldVsuhHbYugeVaOJ", rd("programs_doctor.csv"), "program_id", {"short_doctor": "fldzmCXXnklKfCMEH", "detail_doctor": "fld82PShD7ka8qBMy"})
sync("tblqUf6RMxUvjxhrb", "Research Evidence", "fld24fsyv4kRLUTqB", rd("evidence_doctor.csv"), "evidence_id", {"short_doctor": "fldewPNxxDVKO8af6", "detail_doctor": "fld595QKO8mTAhTGc"})
sync("tblkFaN6uZfUsSkP6", "Cases", "fldM1ioKMrTD5gBYp", rd("cases_doctor.csv"), "case_id", {"short_doctor": "fldhWcExcnz1qOjZo"})
# Insight: payload มี link ครบ (สร้างจาก insights.csv) · แก้แถวเดิมเฉพาะข้อความ · เพิ่มแถวที่ยังไม่มี
T, KEY, SHORT, LONG = "tblMeVbqZO3aiWRxF", "fldX1RLSkjqhNVd8M", "fldiZPtTCQ00gNxt8", "fldmsxxdqDhgzTyQ8"
cur = {r["fields"].get(KEY): r for r in fetch(T, [KEY, SHORT, LONG])}
pay = json.load(open(os.path.join(ROOT, "_ai/payload/insight_payload.json")))
upd = [{"id": cur[x["fields"][KEY]]["id"], "fields": {k: x["fields"][k] for k in (SHORT, LONG) if (cur[x["fields"][KEY]]["fields"].get(k) or "") != x["fields"][k]}} for x in pay if x["fields"][KEY] in cur]
send(T, "Body Map Content", "PATCH", [u for u in upd if u["fields"]])
send(T, "Body Map Content", "POST", [x for x in pay if x["fields"][KEY] not in cur])
print("เสร็จ" if WRITE else "ยังไม่ได้เขียน · เติม --write เพื่อเขียนจริง")
