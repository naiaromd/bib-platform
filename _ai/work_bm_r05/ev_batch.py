import json,sys
p=json.load(open('_ai/work_bm_r05/evidence_cases_payload.json'))
a,b=int(sys.argv[1]),int(sys.argv[2])
print(json.dumps([{'id':r['rec'],'fields':{'fldym5y3N4qC9ifMQ':r['questions_th'].split(';'),'fldewPNxxDVKO8af6':(r['headline_number']+' · ' if r['headline_number'] else '')+r['short_doctor'],'fld595QKO8mTAhTGc':r['detail_doctor'],'fldkrjlZKxo4Ayl5S':'ร่าง'}} for r in p['evidence'][a:b]],ensure_ascii=False,separators=(',',':')))
