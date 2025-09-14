import json, random, pathlib
BASE = pathlib.Path(__file__).resolve().parents[1]
SRC  = BASE / "data" / "combined.jsonl"
TR   = BASE / "data" / "train.jsonl"
VA   = BASE / "data" / "val.jsonl"
TE   = BASE / "data" / "test.jsonl"
random.seed(42)
rows = [json.loads(l) for l in open(SRC,"r",encoding="utf-8") if l.strip()]
random.shuffle(rows)
n=len(rows); n_tr=int(0.8*n); n_va=int(0.1*n)
for path, part in ((TR, rows[:n_tr]), (VA, rows[n_tr:n_tr+n_va]), (TE, rows[n_tr+n_va:])):
    with open(path,"w",encoding="utf-8") as f:
        for r in part: f.write(json.dumps(r)+"\n")
    print(path, len(part))
