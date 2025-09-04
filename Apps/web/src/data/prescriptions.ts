export type PrescriptionItem = {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    notes?: string;
};

export type Prescription = {
    appointmentId: string;
    createdAt: string; // ISO
    items: PrescriptionItem[];
    instructions?: string; // free text / extra notes
    attachmentName?: string | null;
    attachmentUrl?: string | null; // data URL (image/PDF)
};

const STORAGE_KEY = "prescriptions_v1";

function loadAll(): Record<string, Prescription> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveAll(map: Record<string, Prescription>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function getPrescription(appointmentId: string): Prescription | null {
    const map = loadAll();
    return map[appointmentId] || null;
}

export function setPrescription(p: Prescription) {
    const map = loadAll();
    map[p.appointmentId] = p;
    saveAll(map);
}

export function deletePrescription(appointmentId: string) {
    const map = loadAll();
    delete map[appointmentId];
    saveAll(map);
}