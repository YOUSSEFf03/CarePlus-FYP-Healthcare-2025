import csv, json, pathlib, re, random
from collections import Counter

BASE = pathlib.Path(__file__).resolve().parents[1]
RAW = BASE / "data" / "raw" / "symptom-desc"
OUT = BASE / "data" / "external_symdesc.jsonl"
OUT.parent.mkdir(parents=True, exist_ok=True)
random.seed(42)

def norm(s:str)->str: return re.sub(r"[^a-z0-9_]+","_", (s or "").strip().lower())

# reuse same map/fallback as previous file (shortened here)
MAP = {"fungal_infection":"dermatology","acne":"dermatology","psoriasis":"dermatology","impetigo":"dermatology",
       "drug_reaction":"dermatology","allergy":"allergy_immunology","migraine":"neurology",
       "vertigo_paroxysmal_positional":"neurology","paralysis__brain_hemorrhage_":"neurology","cervical_spondylosis":"orthopedics",
       "heart_attack":"cardiology","hypertension":"cardiology","bronchial_asthma":"pulmonology","pneumonia":"pulmonology","common_cold":"gp",
       "gerd":"gastroenterology","peptic_ulcer_disease":"gastroenterology","gastroenteritis":"gastroenterology",
       "jaundice":"gastroenterology","chronic_cholestasis":"gastroenterology","hepatitis_a":"gastroenterology",
       "hepatitis_b":"gastroenterology","hepatitis_c":"gastroenterology","hepatitis_d":"gastroenterology","hepatitis_e":"gastroenterology",
       "alcoholic_hepatitis":"gastroenterology","aids":"infectious_disease","malaria":"infectious_disease","dengue":"infectious_disease",
       "typhoid":"infectious_disease","tuberculosis":"infectious_disease","chicken_pox":"infectious_disease",
       "diabetes_mellitus":"endocrinology","hypoglycemia":"endocrinology","hypothyroidism":"endocrinology","hyperthyroidism":"endocrinology",
       "osteoarthritis":"orthopedics","arthritis":"rheumatology","varicose_veins":"vascular_surgery","dimorphic_hemorrhoids_piles_":"general_surgery",
       "urinary_tract_infection":"urology"}
FALLBACK=[("dermat","dermatology"),("skin","dermatology"),("acne","dermatology"),("psoriasis","dermatology"),("allerg","allergy_immunology"),
          ("heart","cardiology"),("hyperten","cardiology"),("migraine","neurology"),("vertigo","neurology"),("paralysis","neurology"),
          ("spondylosis","orthopedics"),("asthma","pulmonology"),("pneumonia","pulmonology"),("cold","gp"),("gerd","gastroenterology"),
          ("ulcer","gastroenterology"),("gastro","gastroenterology"),("hepat","gastroenterology"),("jaundice","gastroenterology"),
          ("malaria","infectious_disease"),("dengue","infectious_disease"),("typhoid","infectious_disease"),("tuberc","infectious_disease"),
          ("chicken_pox","infectious_disease"),("diabet","endocrinology"),("thyroid","endocrinology"),("hypoglyc","endocrinology"),
          ("arthritis","rheumatology"),("osteo","orthopedics"),("varicose","vascular_surgery"),("hemorrhoids","general_surgery"),
          ("urinary","urology"),("uti","urology")]
def map_spec(d):
    if d in MAP: return MAP[d]
    for kw,sp in FALLBACK:
        if kw in d: return sp
    return "gp"

def sev_label(w:int)->str:
    return "mild" if w<=3 else ("moderate" if w<=5 else "severe")

# load weights
sev = {}
with open(RAW/"Symptom-severity.csv", newline="", encoding="utf-8") as f:
    for r in csv.DictReader(f):
        s = norm(r.get("Symptom") or r.get("symptom") or "")
        if s: sev[s] = int(float(r.get("weight") or r.get("Weight") or 3))

def sample_age_sex(d):
    import random
    age = random.randint(20,50); sex = "female" if random.random()<0.5 else "male"
    if "urinary" in d: sex = "female" if random.random()<0.75 else "male"
    if "heart" in d or "hyperten" in d: age = random.randint(40,85)
    if "acne" in d: age = random.randint(12,30)
    return age, sex

rows=[]
with open(RAW/"dataset.csv", newline="", encoding="utf-8") as f:
    dr = csv.DictReader(f)
    dcol = next((c for c in dr.fieldnames if c.lower().startswith("disease")), None)
    scols = [c for c in dr.fieldnames if c.lower().startswith("symptom")]
    for r in dr:
        d = norm(r[dcol]) if dcol else ""
        syms = [norm(r[c]) for c in scols if r.get(c)]
        syms = [s for s in syms if s and s!="nan"]
        if not syms: continue
        age, sex = sample_age_sex(d)
        rows.append({
            "age": age, "sex": sex,
            "symptoms": sorted(set(syms)),
            "severity": {s: sev_label(sev.get(s,3)) for s in syms},
            "label_specialty": map_spec(d),
            "source":"symptom_desc"
        })

with open(OUT,"w",encoding="utf-8") as out:
    for x in rows: out.write(json.dumps(x)+"\n")
print(f"Wrote {len(rows)} -> {OUT}")
print("Top specialties:", Counter(r["label_specialty"] for r in rows).most_common(6))
