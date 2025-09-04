import React from "react";
import PrescriptionPDF, { Audience, DoctorProfile } from "./PrescriptionPDF";

// NOTE: this matches what your page is passing today
export type SimpleRxItem = { name: string; dosage: string; qty: number; notes?: string };

export type RxPdfPreviewProps = {
    rxId: string;
    template: Audience;           // "doctor" | "pharmacy" | "patient"
    pharmacyName: string;
    patientName: string;
    doctorName: string;
    date: string;                 // ISO or yyyy-mm-dd
    items: SimpleRxItem[];
    showDownload?: boolean;       // (kept for API parity; not used by PrescriptionPDF)
};

export default function RxPdfPreview({
    rxId,
    template,
    pharmacyName,
    patientName,
    doctorName,
    date,
    items,
}: RxPdfPreviewProps) {
    // Build the shapes PrescriptionPDF expects

    const doctor: DoctorProfile = {
        name: doctorName,
        workplaceName: pharmacyName,
    };

    // Your PrescriptionPDF expects Appointment with dates as Date objects
    const start = new Date(`${date}T09:00:00`);
    const end = new Date(`${date}T09:15:00`);

    const appointment = {
        appointmentId: rxId,         // if your Appointment type has this; otherwise omit
        patientName,
        date,
        workplace: pharmacyName,
        start,
        end,
    } as any; // cast to any if your local Appointment type has extra fields

    // Map the simple items to the richer structure your Prescription type uses
    const prescription = {
        appointmentId: rxId,
        createdAt: date,
        items: items.map((it) => ({
            name: it.name,
            dosage: it.dosage,
            frequency: "",             // unknown in simple model
            duration: "",              // unknown in simple model
            notes: it.notes ?? (it.qty ? `Qty: ${it.qty}` : undefined),
        })),
        instructions: "",
        attachmentName: undefined,
    } as any; // cast if your Prescription type has more fields

    return (
        <PrescriptionPDF
            audience={template}
            appointment={appointment}
            prescription={prescription}
            doctor={doctor}
        />
    );
}
