#!/usr/bin/python3
"""ส่ง Insight ที่ยังไม่อยู่ใน Airtable ขึ้นตาราง Body Map Content (สถานะร่าง) · ใช้ AIRTABLE_TOKEN จาก .env.local เท่านั้น
รัน (จากโฟลเดอร์ bib-platform):  /usr/bin/python3 _ai/tools/push_insights.py          ← ดูก่อนว่าจะเขียนกี่แถว (ไม่เขียน)
                                  /usr/bin/python3 _ai/tools/push_insights.py --write  ← เขียนจริง ชุดละ 10 + Change Log ชุดละ 1 แถว
ข้ามแถวที่มี Content ID อยู่แล้ว (รันซ้ำได้ ไม่ซ้ำแถว) · ไม่แก้/ลบแถวเดิม · ไม่แตะ 🔒
payload มาจาก _ai/work_bm_r05/insight_payload.json (สร้างจาก _ai/content/insights.csv ครบ 84 แถว พร้อม link)"""
import json, os, sys, time, urllib.request, urllib.parse
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BASE, TABLE, LOG, KEY = "app2HcsMi1mmqTLJi", "tblMeVbqZO3aiWRxF", "tblKSV5ENmERlbMLA", "fldX1RLSkjqhNVd8M"
tok = os.environ.get("AIRTABLE_TOKEN", "")
env = os.path.join(ROOT, ".env.local")
if not tok and os.path.exists(env):
    for line in open(env, encoding="utf8"):
        if line.strip().startswith("AIRTABLE_TOKEN="): tok = line.split("=", 1)[1].strip().strip('"')
if not tok: sys.exit("ยังไม่มี AIRTABLE_TOKEN ใน .env.local")
def call(method, path, body=None):
    req = urllib.request.Request("https://api.airtable.com/v0/%s/%s" % (BASE, path), method=method,
        data=json.dumps(body).encode() if body else None, headers={"Authorization": "Bearer " + tok, "Content-Type": "application/json"})
    return json.load(urllib.request.urlopen(req))
have, off = set(), None
while True:
    q = {"fields[]": KEY, "returnFieldsByFieldId": "true", "pageSize": "100"}
    if off: q["offset"] = off
    r = call("GET", TABLE + "?" + urllib.parse.urlencode(q))
    have |= {x["fields"].get(KEY) for x in r["records"]}; off = r.get("offset")
    if not off: break
d = json.load(open(os.path.join(ROOT, "_ai/work_bm_r05/insight_payload.json")))
rows = d["records"] if isinstance(d, dict) else d
todo = [x for x in rows if x["fields"][KEY] not in have]
print("ใน Airtable แล้ว %d · ใน payload %d · ต้องเขียนเพิ่ม %d" % (len(have), len(rows), len(todo)))
if "--write" not in sys.argv: sys.exit("ยังไม่ได้เขียน · เติม --write เพื่อเขียนจริง")
for i in range(0, len(todo), 10):
    part = todo[i:i + 10]
    call("POST", TABLE, {"typecast": True, "records": part})
    ids = "%s … %s" % (part[0]["fields"][KEY], part[-1]["fields"][KEY])
    call("POST", LOG, {"typecast": True, "records": [{"fields": {
        "fldDMGqA6PBaSyhgJ": "BM-R05 v004 H4: Body Map Content +%d แถว (%s) สถานะร่าง" % (len(part), ids), "fldnf2oYj3hIDzqaX": "Body Map Content",
        "fldFr1GjI0wdjKUzH": "_ai/content/insights.csv · push_insights.py", "fldYqbMefZPjFZsp8": time.strftime("%Y-%m-%d"),
        "fldlAR6xD5df73J4k": "Claude Code (BM-R05 v004)", "fldydnoKa8mY7pPtd": "เขียนแล้ว"}}]})
    print("เขียนแล้ว", ids); time.sleep(0.3)
print("เสร็จ")
