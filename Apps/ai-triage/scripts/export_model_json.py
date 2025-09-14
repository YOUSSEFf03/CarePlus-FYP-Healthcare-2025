# Apps/ai-triage/scripts/export_model_json.py
from joblib import load
import json, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
model_path = ROOT / "model" / "sk_model.joblib"
out_path   = ROOT / "model" / "sk_model.json"

if not model_path.exists():
    sys.exit(f"Model not found: {model_path}. Train first with train_baseline.py")

obj = load(model_path)            # {"model": clf, "sym_vocab": [...], "sex_index": {...}}
M = obj["model"]

payload = {
    "classes":   M.classes_.tolist(),
    "coef":      M.coef_.tolist(),        # shape [C, F]
    "intercept": M.intercept_.tolist(),   # shape [C]
    "sym_vocab": obj["sym_vocab"],
    "sex_index": obj["sex_index"],
}

out_path.write_text(json.dumps(payload), encoding="utf-8")
print("Saved ->", out_path)
