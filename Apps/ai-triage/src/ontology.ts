import type { OntologySpecialty } from "./types";

export const SYMPTOMS = [
    { id: "s_chest_pain", label: "Chest pain", tags: ["red-flag"] },
    { id: "s_short_breath", label: "Shortness of breath", tags: ["red-flag"] },
    { id: "s_headache", label: "Headache" },
    { id: "s_skin_rash", label: "Skin rash" },
    { id: "s_burning_urine", label: "Burning urination" },
    { id: "s_dizziness", label: "Dizziness" }
] as const;

export const SPECIALTIES: OntologySpecialty[] = [
    {
        id: "cardiology", label: "Cardiology",
        symptomWeights: { s_chest_pain: 0.9, s_short_breath: 0.8, s_dizziness: 0.3 },
        rules: ["r_er_if_chest_pain_severe"]
    },
    {
        id: "dermatology", label: "Dermatology",
        symptomWeights: { s_skin_rash: 0.95 }
    },
    {
        id: "neurology", label: "Neurology",
        symptomWeights: { s_headache: 0.7, s_dizziness: 0.6 }
    },
    {
        id: "urology", label: "Urology",
        symptomWeights: { s_burning_urine: 0.9 }
    },
    {
        id: "gp", label: "General Practice",
        symptomWeights: { s_headache: 0.4, s_dizziness: 0.4, s_skin_rash: 0.3, s_burning_urine: 0.3 }
    }
];

type RuleFn = (
    selected: string[],
    meta: { severityBySymptom: Record<string, string | undefined>; age: number }
) => string | null;

export const RULES: Record<string, RuleFn> = {
    r_er_if_chest_pain_severe(selected, meta) {
        const severe =
            selected.includes("s_chest_pain") &&
            (meta.severityBySymptom["s_chest_pain"] === "severe" || meta.age > 50);
        return severe ? "Severe chest pain warrants immediate evaluation." : null;
    }
};
