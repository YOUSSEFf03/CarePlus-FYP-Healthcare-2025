import json, pathlib, numpy as np
from collections import Counter
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, top_k_accuracy_score, classification_report
from joblib import dump

BASE = pathlib.Path(__file__).resolve().parents[1] / "data"
def load(name): return [json.loads(l) for l in open(BASE/name,"r",encoding="utf-8") if l.strip()]

train = load("train.jsonl"); val = load("val.jsonl"); test = load("test.jsonl")

train = [r for r in train if r["label_specialty"] != "gp"]
val   = [r for r in val   if r["label_specialty"] != "gp"]
test  = [r for r in test  if r["label_specialty"] != "gp"]

# vocab
all_sym = sorted({s for r in train for s in r["symptoms"]})
sym_index = {s:i for i,s in enumerate(all_sym)}
sex_index = {"male":0,"female":1,"unknown":2}

def Xy(rows):
    X = np.zeros((len(rows), len(all_sym)+2), dtype=np.float32)
    for i,r in enumerate(rows):
        for s in r["symptoms"]:
            if s in sym_index: X[i, sym_index[s]] = 1.0
        X[i, len(all_sym)+0] = r.get("age",30)/100.0
        X[i, len(all_sym)+1] = sex_index.get(r.get("sex","unknown"),2)/2.0
    y = np.array([r["label_specialty"] for r in rows])
    return X, y

Xtr,ytr = Xy(train); Xva,yva = Xy(val); Xte,yte = Xy(test)

print("Train class dist:", Counter(ytr))

clf = LogisticRegression(max_iter=400, class_weight="balanced")
clf.fit(Xtr, ytr)

def eval_split(X,y,name):
    yhat = clf.predict(X)
    top1 = accuracy_score(y, yhat)
    top3 = top_k_accuracy_score(y, clf.predict_proba(X), k=3, labels=clf.classes_)
    print(f"{name}: top1={top1:.3f} top3={top3:.3f}")
eval_split(Xva,yva,"val"); eval_split(Xte,yte,"test")

print("\nPer-class report (test):")
print(classification_report(yte, clf.predict(Xte), zero_division=0))

OUT_DIR = BASE.parent / "model"
OUT_DIR.mkdir(parents=True, exist_ok=True)
dump({"model": clf, "sym_vocab": all_sym, "sex_index": sex_index}, OUT_DIR/"sk_model.joblib")
print(f"Saved -> {OUT_DIR/'sk_model.joblib'}")
