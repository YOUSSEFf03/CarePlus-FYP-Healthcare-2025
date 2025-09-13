import type { TriageRequest, TriageResponse, SpecialtyScore } from "./types";
import { SPECIALTIES, RULES } from "./ontology";

export function scoreSpecialties(req: TriageRequest): SpecialtyScore[] {
    const picked = req.symptoms.map(s => s.id);
    const severity = Object.fromEntries(req.symptoms.map(s => [s.id, s.severity]));

    const scores: SpecialtyScore[] = SPECIALTIES.map(spec => {
        let score = 0;
        for (const [symId, weight] of Object.entries(spec.symptomWeights)) {
            if (picked.includes(symId)) {
                const sev = severity[symId];
                const sevBoost = sev === "severe" ? 0.15 : sev === "moderate" ? 0.05 : 0;
                score += weight + sevBoost;
            }
        }
        score = Math.min(1, Math.max(0, score / 2));
        return { specialtyId: spec.id, label: spec.label, score };
    });

    return scores.sort((a, b) => b.score - a.score);
}

export function triage(req: TriageRequest): TriageResponse {
    const picked = req.symptoms.map(s => s.id);
    const severityBySymptom = Object.fromEntries(req.symptoms.map(s => [s.id, s.severity]));
    const rationale: string[] = [];

    for (const spec of SPECIALTIES) {
        if (!spec.rules) continue;
        for (const r of spec.rules ?? []) {
            const msg = (RULES as any)[r]?.(picked, { severityBySymptom, age: req.context.age });
            if (msg) rationale.push(msg);
        }
    }

    const specialties = scoreSpecialties(req);
    const top = specialties[0] ?? { specialtyId: "gp", label: "General Practice", score: 0 };

    let level: TriageResponse["advice"]["level"] = "see-gp";
    if (rationale.some(r => /immediate|ER/i.test(r))) level = "er";
    else if (top.score >= 0.6 && top.specialtyId !== "gp") level = "specialist";
    else if (top.score < 0.3) level = "self-care";

    return { specialties, advice: { level, rationale: rationale.length ? rationale : [`Top match: ${top.label}`] } };
}