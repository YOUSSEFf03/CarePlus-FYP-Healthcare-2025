import json, pathlib, hashlib

BASE = pathlib.Path(__file__).resolve().parents[1]
INS = [
  BASE/"data/external_disease_ml.jsonl",
  BASE/"data/external_symdesc.jsonl",
  BASE/"data/external_patient.jsonl",
]
OUT = BASE/"data/combined.jsonl"
OUT.parent.mkdir(parents=True, exist_ok=True)

def sig(row):
  band = f"{(row.get('age',30)//10)*10}"
  key = json.dumps([band, row.get("sex","unknown"),
                    sorted(row["symptoms"]), row["label_specialty"]])
  return hashlib.md5(key.encode()).hexdigest()

seen=set(); kept=0
with open(OUT,"w",encoding="utf-8") as out:
  for p in INS:
    if not p.exists(): continue
    for line in open(p,"r",encoding="utf-8"):
      if not line.strip(): continue
      row = json.loads(line)
      k = sig(row)
      if k in seen: continue
      seen.add(k); kept+=1
      out.write(json.dumps(row)+"\n")
print(f"Merged -> {OUT}  ({kept} unique rows)")
