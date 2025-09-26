// Apps/ai-triage/src/ml.ts
import modelJson from "../model/sk_model.json";

type Sex = "male" | "female" | "unknown";
export type TriageInput = { age: number; sex: Sex; symptoms: string[] };

const { classes, coef, intercept, sym_vocab, sex_index } = modelJson as {
    classes: string[];
    coef: number[][];
    intercept: number[];
    sym_vocab: string[];
    sex_index: Record<string, number>;
};

function features(x: TriageInput): number[] {
    const F = new Array(sym_vocab.length + 2).fill(0);
    const set = new Set(x.symptoms);
    for (let i = 0; i < sym_vocab.length; i++) if (set.has(sym_vocab[i])) F[i] = 1;
    F[sym_vocab.length + 0] = Math.max(0, Math.min(x.age, 100)) / 100;            // age (0..1)
    F[sym_vocab.length + 1] = (sex_index[x.sex] ?? 2) / 2;                         // sex (0, .5, 1)
    return F;
}
function softmax(z: number[]): number[] {
    const m = Math.max(...z);
    const ex = z.map(v => Math.exp(v - m));
    const s = ex.reduce((a, b) => a + b, 0);
    return ex.map(v => v / s);
}

export function predictTopK(x: TriageInput, k = 5) {
    const F = features(x);
    const logits = classes.map((_, c) =>
        intercept[c] + coef[c].reduce((sum, w, i) => sum + w * F[i], 0)
    );
    const probs = softmax(logits);
    return classes
        .map((label, i) => ({ label, prob: probs[i] }))
        .sort((a, b) => b.prob - a.prob)
        .slice(0, k);
}

export function getSymptomVocab(): string[] {
    return sym_vocab;
}

export function prettySymptom(id: string): string {
    const SPECIAL: Record<string, string> = {
        shortness_of_breath: "Shortness of breath",
        burning_micturition: "Burning urination",
        abdominal_pain: "Abdominal pain",
        spinning_movements: "Vertigo (spinning)",
        blackheads: "Blackheads",
        stomach_pain: "Stomach pain",
    };
    if (SPECIAL[id]) return SPECIAL[id];
    return id.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}