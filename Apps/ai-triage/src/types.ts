export type Sex = "male" | "female" | "unknown";

export interface PatientContext { age: number; sex: Sex }
export interface SymptomInput {
    id: string; label: string;
    durationDays?: number;
    severity?: "mild" | "moderate" | "severe";
    onset?: "sudden" | "gradual" | "unknown";
}
export interface OntologySpecialty {
    id: string;
    label: string;
    symptomWeights: Record<string, number>;
    rules?: string[]; // optional
}

export interface TriageRequest { context: PatientContext; symptoms: SymptomInput[] }
export interface SpecialtyScore { specialtyId: string; label: string; score: number }
export interface TriageAdvice { level: "self-care" | "see-gp" | "specialist" | "urgent-care" | "er"; rationale: string[] }
export interface TriageResponse { specialties: SpecialtyScore[]; advice: TriageAdvice }
