import csv, json, pathlib, re, random
BASE = pathlib.Path(__file__).resolve().parents[1]
RAW_DIR = BASE / "data" / "raw" / "disease-ml"
OUT = BASE / "data" / "external_disease_ml.jsonl"
OUT.parent.mkdir(parents=True, exist_ok=True)
random.seed(42)

def norm(s): return re.sub(r"[^a-z0-9_]+", "_", s.strip().lower())

MAP = {
    "fungal_infection":"dermatology","acne":"dermatology","psoriasis":"dermatology","impetigo":"dermatology",
    "drug_reaction":"dermatology","allergy":"allergy_immunology",
    "migraine":"neurology","vertigo_paroxysmal_positional":"neurology","paralysis__brain_hemorrhage_":"neurology",
    "cervical_spondylosis":"orthopedics","heart_attack":"cardiology","hypertension":"cardiology",
    "bronchial_asthma":"pulmonology","pneumonia":"pulmonology","common_cold":"gp",
    "gerd":"gastroenterology","peptic_ulcer_disease":"gastroenterology","gastroenteritis":"gastroenterology",
    "jaundice":"gastroenterology","chronic_cholestasis":"gastroenterology","hepatitis_a":"gastroenterology",
    "hepatitis_b":"gastroenterology","hepatitis_c":"gastroenterology","hepatitis_d":"gastroenterology",
    "hepatitis_e":"gastroenterology","alcoholic_hepatitis":"gastroenterology",
    "aids":"infectious_disease","malaria":"infectious_disease","dengue":"infectious_disease","typhoid":"infectious_disease",
    "tuberculosis":"infectious_disease","chicken_pox":"infectious_disease",
    "diabetes_mellitus":"endocrinology","hypoglycemia":"endocrinology","hypothyroidism":"endocrinology","hyperthyroidism":"endocrinology",
    "osteoarthritis":"orthopedics","arthritis":"rheumatology","varicose_veins":"vascular_surgery","dimorphic_hemorrhoids_piles_":"general_surgery",
    "urinary_tract_infection":"urology",
}
FALLBACK = [("dermat","dermatology"),("skin","dermatology"),("acne","dermatology"),("psoriasis","dermatology"),
    ("allerg","allergy_immunology"),("heart","cardiology"),("hyperten","cardiology"),("migraine","neurology"),
    ("vertigo","neurology"),("paralysis","neurology"),("spondylosis","orthopedics"),("asthma","pulmonology"),
    ("pneumonia","pulmonology"),("cold","gp"),("gerd","gastroenterology"),("ulcer","gastroenterology"),
    ("gastro","gastroenterology"),("hepat","gastroenterology"),("jaundice","gastroenterology"),
    ("malaria","infectious_disease"),("dengue","infectious_disease"),("typhoid","infectious_disease"),
    ("tuberc","infectious_disease"),("chicken_pox","infectious_disease"),("diabet","endocrinology"),
    ("thyroid","endocrinology"),("hypoglyc","endocrinology"),("arthritis","rheumatology"),("osteo","orthopedics"),
    ("varicose","vascular_surgery"),("hemorrhoids","general_surgery"),("urinary","urology"),("uti","urology")]
def map_spec(d):
    if d in MAP: return MAP[d]
    for kw, sp in FALLBACK:
        if kw in d: return sp
    return "gp"

def _bucket(b):
    import random
    r=random.random(); acc=0.0
    for lo,hi,p in b:
        acc+=p
        if r<=acc: return random.randint(lo,hi)
    return random.randint(20,50)

def sample_age_sex(d):
    import random
    age=_bucket([(0,12,0.10),(13,25,0.20),(26,45,0.35),(46,65,0.25),(66,85,0.10)])
    sex="female" if random.random()<0.5 else "male"
    def set_age(lo,hi): nonlocal age; age=random.randint(lo,hi)
    def bias_sex(pf): nonlocal sex; sex="female" if random.random()<pf else "male"
    if "urinary_tract_infection" in d or "urinary" in d or "uti" in d: set_age(18,65); bias_sex(0.75)
    elif "acne" in d: set_age(12,30)
    elif "migraine" in d: set_age(15,55); bias_sex(0.65)
    elif "heart_attack" in d or "hypertension" in d: set_age(40,85); bias_sex(0.6)
    elif "pneumonia" in d: age = random.choice([random.randint(0,12), random.randint(60,85)])
    elif "asthma" in d: set_age(5,40)
    elif "arthritis" in d or "osteo" in d or "spondylosis" in d: set_age(45,85); bias_sex(0.6)
    elif "diabetes" in d or "thyroid" in d or "hypoglyc" in d: set_age(25,80)
    elif "dengue" in d or "typhoid" in d or "malaria" in d or "tuberc" in d or "chicken_pox" in d: set_age(5,60)
    return age, sex

rows=[]
for fname in ("Training.csv","Testing.csv"):
    p = RAW_DIR / fname
    if not p.exists(): continue
    with open(p, newline="", encoding="utf-8") as f:
        dr = csv.DictReader(f)
        for r in dr:
            disease = norm(r["prognosis"])
            syms = [norm(k) for k,v in r.items()
                    if k!="prognosis" and v and str(v).strip().lower() not in ("0","false","no")]
            if not syms: continue
            age, sex = sample_age_sex(disease)
            rows.append({"age":age,"sex":sex,"symptoms":syms,"label_specialty":map_spec(disease),"source":"disease_ml"})

with open(OUT,"w",encoding="utf-8") as out:
    for x in rows: out.write(json.dumps(x)+"\n")
print(f"Wrote {len(rows)} -> {OUT}")
