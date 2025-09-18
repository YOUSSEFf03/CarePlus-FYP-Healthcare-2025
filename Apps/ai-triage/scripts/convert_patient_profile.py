import csv, json, pathlib, re
from collections import Counter

BASE = pathlib.Path(__file__).resolve().parents[1]
SRC = BASE / "data" / "raw" / "patient-profile" / "Disease_symptom_and_patient_profile_dataset.csv"
OUT = BASE / "data" / "external_patient.jsonl"
OUT.parent.mkdir(parents=True, exist_ok=True)

def norm(s:str)->str: return re.sub(r"[^a-z0-9_]+","_", (s or "").strip().lower())

MAP = {"fungal_infection":"dermatology","acne":"dermatology","psoriasis":"dermatology","impetigo":"dermatology",
       "drug_reaction":"dermatology","allergy":"allergy_immunology","migraine":"neurology",
       "vertigo_paroxysmal_positional":"neurology","paralysis__brain_hemorrhage_":"neurology","cervical_spondylosis":"orthopedics",
       "heart_attack":"cardiology","hypertension":"cardiology","bronchial_asthma":"pulmonology","pneumonia":"pulmonology","common_cold":"gp",
       "gerd":"gastroenterology","peptic_ulcer_disease":"gastroenterology","gastroenteritis":"gastroenterology",
       "jaundice":"gastroenterology","chronic_cholestasis":"gastroenterology",
       "aids":"infectious_disease","malaria":"infectious_disease","dengue":"infectious_disease","typhoid":"infectious_disease",
       "tuberculosis":"infectious_disease","chicken_pox":"infectious_disease",
       "diabetes_mellitus":"endocrinology","hypothyroidism":"endocrinology","hyperthyroidism":"endocrinology",
       "osteoarthritis":"orthopedics","arthritis":"rheumatology","urinary_tract_infection":"urology"}
def map_spec(d:str)->str:
    d=norm(d)
    if d in MAP: return MAP[d]
    if "urinary" in d or "uti" in d: return "urology"
    if "dermat" in d or "skin" in d or "acne" in d or "psoriasis" in d: return "dermatology"
    if "migraine" in d or "vertigo" in d or "paralysis" in d: return "neurology"
    if "asthma" in d or "pneumonia" in d: return "pulmonology"
    if "hepat" in d or "jaundice" in d or "gastro" in d or "ulcer" in d: return "gastroenterology"
    if "dengue" in d or "malaria" in d or "typhoid" in d or "tuberc" in d: return "infectious_disease"
    if "diabet" in d or "thyroid" in d: return "endocrinology"
    if "heart" in d or "hyperten" in d: return "cardiology"
    return "gp"

rows=[]
with open(SRC, newline="", encoding="utf-8") as f:
    dr = csv.DictReader(f)
    disease_col = next((c for c in dr.fieldnames if c.lower() in ("disease","diagnosis","prognosis")), None)
    age_col = next((c for c in dr.fieldnames if c.lower() in ("age","patient_age")), None)
    sex_col = next((c for c in dr.fieldnames if c.lower() in ("sex","gender")), None)

    for r in dr:
        disease = r.get(disease_col,"")
        age_raw = (r.get(age_col,"") or "").strip()
        sex_raw = (r.get(sex_col,"unknown") or "unknown").strip().lower()
        try:
            age = int(float(age_raw)) if age_raw else 30
        except:
            import re
            nums=[int(x) for x in re.findall(r"\d+", age_raw)]
            age = sum(nums)//len(nums) if nums else 30
        sex = "male" if sex_raw.startswith("m") else "female" if sex_raw.startswith("f") else "unknown"

        symptoms=[]
        meta=set([disease_col,age_col,sex_col])
        for c in dr.fieldnames:
            if c in meta: continue
            v = str(r.get(c,"")).strip().lower()
            if not v or v in ("0","no","false","n/a","na"): continue
            if v in ("yes","1","true","y"):
                symptoms.append(norm(c))
            else:
                symptoms.append(norm(v))
        symptoms=[s for s in symptoms if s and s!="nan"]
        if not symptoms: continue

        rows.append({
            "age": max(0,min(age,100)),
            "sex": sex,
            "symptoms": sorted(set(symptoms)),
            "label_specialty": map_spec(disease),
            "source":"patient_profile"
        })

with open(OUT,"w",encoding="utf-8") as out:
    for x in rows: out.write(json.dumps(x)+"\n")
print(f"Wrote {len(rows)} -> {OUT}")
print("Top specialties:", Counter(r["label_specialty"] for r in rows).most_common(6))
