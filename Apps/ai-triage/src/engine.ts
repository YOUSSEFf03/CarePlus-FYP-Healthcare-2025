// import type { TriageRequest, TriageResponse, SpecialtyScore } from "./types";
// import { SPECIALTIES, RULES } from "./ontology";

// export function scoreSpecialties(req: TriageRequest): SpecialtyScore[] {
//     const picked = req.symptoms.map(s => s.id);
//     const severity = Object.fromEntries(req.symptoms.map(s => [s.id, s.severity]));

//     const scores: SpecialtyScore[] = SPECIALTIES.map(spec => {
//         let score = 0;
//         for (const [symId, weight] of Object.entries(spec.symptomWeights)) {
//             if (picked.includes(symId)) {
//                 const sev = severity[symId];
//                 const sevBoost = sev === "severe" ? 0.15 : sev === "moderate" ? 0.05 : 0;
//                 score += weight + sevBoost;
//             }
//         }
//         score = Math.min(1, Math.max(0, score / 2));
//         return { specialtyId: spec.id, label: spec.label, score };
//     });

//     return scores.sort((a, b) => b.score - a.score);
// }

// export function triage(req: TriageRequest): TriageResponse {
//     const picked = req.symptoms.map(s => s.id);
//     const severityBySymptom = Object.fromEntries(req.symptoms.map(s => [s.id, s.severity]));
//     const rationale: string[] = [];

//     for (const spec of SPECIALTIES) {
//         if (!spec.rules) continue;
//         for (const r of spec.rules ?? []) {
//             const msg = (RULES as any)[r]?.(picked, { severityBySymptom, age: req.context.age });
//             if (msg) rationale.push(msg);
//         }
//     }

//     const specialties = scoreSpecialties(req);
//     const top = specialties[0] ?? { specialtyId: "gp", label: "General Practice", score: 0 };

//     let level: TriageResponse["advice"]["level"] = "see-gp";
//     if (rationale.some(r => /immediate|ER/i.test(r))) level = "er";
//     else if (top.score >= 0.6 && top.specialtyId !== "gp") level = "specialist";
//     else if (top.score < 0.3) level = "self-care";

//     return { specialties, advice: { level, rationale: rationale.length ? rationale : [`Top match: ${top.label}`] } };
// }

// Apps/ai-triage/src/engine.ts
import type { TriageRequest, TriageResponse, SpecialtyScore } from "./types";
import { RULES } from "./ontology";
import { predictTopK, getSymptomVocab as mlGetVocab } from "./ml";

/* ---------- pretty class names ---------- */
const PRETTY_SPEC: Record<string, string> = {
    cardiology: "Cardiology",
    dermatology: "Dermatology",
    neurology: "Neurology",
    urology: "Urology",
    pulmonology: "Pulmonology",
    gastroenterology: "Gastroenterology",
    endocrinology: "Endocrinology",
    infectious_disease: "Infectious Disease",
    orthopedics: "Orthopedics",
    rheumatology: "Rheumatology",
    vascular_surgery: "Vascular Surgery",
    allergy_immunology: "Allergy & Immunology",
};

/* ---------- alias UI ids -> model vocab ids ---------- */
const SYM_ALIAS: Record<string, string> = {
    s_short_breath: "shortness_of_breath",
    s_breathlessness: "shortness_of_breath",
    s_burning_urine: "burning_micturition",
    s_uti: "urinary_tract_infection",
    s_stomach_pain: "abdominal_pain",
    s_belly_pain: "abdominal_pain",
    s_spinning_movements: "vertigo",
    s_chestpain: "chest_pain",
};

const FAMILY_RULES: Array<{
    test: (id: string) => boolean;
    boosts: Record<string, number>;
    note: string;
}> = [
        { // skin → Dermatology
            test: id => /(rash|itch|skin|acne|blister|psoriasis|blackheads|pustules)/i.test(id),
            boosts: { dermatology: 0.12 },
            note: "Skin symptoms present → prioritizing Dermatology.",
        },
        { // urinary → Urology/ID
            test: id => /(urine|urinary|micturition|bladder)/i.test(id),
            boosts: { urology: 0.12, infectious_disease: 0.06 },
            note: "Urinary symptoms present → prioritizing Urology and Infectious Disease.",
        },
        { // chest/heart → Cardiology
            test: id => /(chest_pain|palpitations|fast_heart_rate|heart_attack)/i.test(id),
            boosts: { cardiology: 0.10 },
            note: "Cardiac/chest symptoms present → prioritizing Cardiology.",
        },
        { // breath/cough/wheezing → Pulmonology
            test: id => /(shortness_of_breath|breathlessness|cough|wheezing|asthma)/i.test(id),
            boosts: { pulmonology: 0.10 },
            note: "Respiratory symptoms present → prioritizing Pulmonology.",
        },
        { // GI → Gastro
            test: id => /(abdominal|stomach|vomit|nausea|diarrh|constipation|acid|ulcer)/i.test(id),
            boosts: { gastroenterology: 0.10 },
            note: "Gastrointestinal symptoms present → prioritizing Gastroenterology.",
        },
        { // joints → Rheum/Ortho
            test: id => /(joint|knee|elbow|swelling_joints|stiff|arthralgia|back_pain)/i.test(id),
            boosts: { rheumatology: 0.10, orthopedics: 0.05 },
            note: "Joint/musculoskeletal symptoms present → prioritizing Rheumatology/Orthopedics.",
        },
        { // neuro → Neurology
            test: id => /(dizziness|vertigo|seizure|weakness|tingling|headache|loss_of_balance|blurred_vision)/i.test(id),
            boosts: { neurology: 0.10 },
            note: "Neurologic symptoms present → prioritizing Neurology.",
        },
    ];

const VOCAB = new Set<string>(mlGetVocab());
const toId = (s: string) =>
    s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

function normalizeSymptoms(inputIds: string[]) {
    const recognized: string[] = [];
    const unknown: string[] = [];
    for (const raw of inputIds) {
        const base = toId(raw);
        const aliased = SYM_ALIAS[base] ?? base;
        if (VOCAB.has(aliased)) {
            if (!recognized.includes(aliased)) recognized.push(aliased);
        } else {
            unknown.push(raw);
        }
    }
    return { recognized, unknown };
}

/* ---------- expose vocab to UI as chips ---------- */
function prettySymptom(id: string) {
    const specials: Record<string, string> = {
        shortness_of_breath: "Shortness of breath",
        burning_micturition: "Burning urination",
        abdominal_pain: "Abdominal pain",
    };
    return specials[id] ?? id.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
export function getSymptomChips() {
    return mlGetVocab()
        .map((id) => ({ id, label: prettySymptom(id) }))
        .sort((a, b) => a.label.localeCompare(b.label));
}

/* ---------- small domain heuristic ---------- */
const CONF_THRESHOLD = Number(process.env.ML_CONF_THRESHOLD ?? 0.60);

// Build urinary symptom list from the vocab automatically
const URINARY_SYM = new Set(
    mlGetVocab().filter((s) => /(urine|urinary|micturition|bladder)/i.test(s))
);

type Ranked = { label: string; prob: number };

function applyHeuristics(recognized: string[], rankedAll: Ranked[], rationale: string[]) {
    const boosted = rankedAll.map(r => ({ ...r }));

    for (const rule of FAMILY_RULES) {
        if (recognized.some(rule.test)) {
            for (const r of boosted) {
                if (rule.boosts[r.label]) r.prob = Math.min(1, r.prob + rule.boosts[r.label]);
            }
            rationale.push(rule.note);
        }
    }

    boosted.sort((a, b) => b.prob - a.prob);
    return boosted;
}

/* ---------- main triage ---------- */
export function triage(req: TriageRequest): TriageResponse {
    const pickedRaw = req.symptoms.map((s) => s.id);
    const { recognized, unknown } = normalizeSymptoms(pickedRaw);

    const severityBySymptom = Object.fromEntries(
        req.symptoms.map((s) => [toId(s.id), s.severity])
    );
    const rationale: string[] = [];

    // Safety rules (ER) first
    for (const key of ["r_er_if_chest_pain_severe"]) {
        const msg = (RULES as any)[key]?.(recognized, {
            severityBySymptom,
            age: req.context.age,
        });
        if (msg) rationale.push(msg);
    }

    if (recognized.length === 0) {
        rationale.push("I couldn’t match those symptoms to my knowledge. Try using the suggestions.");
        return {
            specialties: [],
            advice: {
                level: rationale.some((r) => /immediate|ER/i.test(r)) ? "er" : "see-gp",
                rationale,
            },
        };
    }

    // Ask for many classes (so a boosted class isn't cut off)
    const rankedAll = predictTopK(
        { age: req.context.age, sex: (req.context as any).sex ?? "unknown", symptoms: recognized },
        20
    );

    // Apply small domain boosts
    const boosted = applyHeuristics(recognized, rankedAll, rationale);
    const top5 = boosted.slice(0, 5);

    const specialties: SpecialtyScore[] = top5.map((r) => ({
        specialtyId: r.label,
        label: PRETTY_SPEC[r.label] ?? r.label.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        score: Math.max(0, Math.min(1, r.prob)),
    }));

    // Decide care level
    let level: TriageResponse["advice"]["level"] = "see-gp";
    if (rationale.some((x) => /immediate|ER/i.test(x))) {
        level = "er";
    } else if ((boosted[0]?.prob ?? 0) >= CONF_THRESHOLD) {
        level = "specialist";
    } else {
        level = "see-gp";
    }

    const top = specialties[0];
    if (top) {
        rationale.push(`Top match: ${top.label} (${Math.round(top.score * 100)}% confidence).`);
        if (level === "see-gp") rationale.push("Symptoms are nonspecific; start with a General Practitioner.");
    }
    if (unknown.length) {
        rationale.push("Some symptoms weren’t recognized. Use the chips/suggestions for best results.");
    }

    return { specialties, advice: { level, rationale } };
}