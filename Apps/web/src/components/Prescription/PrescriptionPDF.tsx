import React, { forwardRef } from "react";
import "./prescription.css";
import { Appointment } from "../../data/appointments";
import { Prescription } from "../../data/prescriptions";
import logo from "../../assets/logos/logo512_primary.svg";

export type Audience = "patient" | "doctor" | "pharmacy";

export interface DoctorProfile {
    name: string;
    phone?: string;
    email?: string;
    specialization?: string;
    bio?: string;
    licenseNumber?: string;
    workplaceName?: string;
    workplaceAddress?: string;
}

function getDoctorProfile(): DoctorProfile | null {
    try {
        const raw = localStorage.getItem("doctorProfile");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

type Props = {
    audience: Audience;
    appointment: Appointment;
    prescription: Prescription;
    doctor?: DoctorProfile | null;   // <-- unify the type
};

const PrescriptionPDF = forwardRef<HTMLDivElement, Props>(
    ({ audience, appointment, prescription, doctor: doctorProp }, ref) => {
        // prefer explicit prop; fall back to profile saved from Doctor Profile page
        const profile = doctorProp ?? getDoctorProfile();
        const appt = appointment;
        const rx = prescription;

        return (
            <div ref={ref as any} className={`rx-doc rx-${audience}`}>
                {/* Header band */}
                <header className="rx-header">
                    <div className="rx-brand">
                        <img src={logo} alt="CarePlus" className="rx-logo" />
                        <div>
                            <div className="rx-title">
                                {profile?.workplaceName || "Clinic / Practice"}
                            </div>
                            {profile?.workplaceAddress && (
                                <div className="rx-subtle">{profile.workplaceAddress}</div>
                            )}
                        </div>
                    </div>

                    <div className="rx-meta">
                        <div className="rx-meta-row">
                            <span className="rx-label">Prescription #</span>
                            <span className="rx-value">{rx.appointmentId}</span>
                        </div>
                        <div className="rx-meta-row">
                            <span className="rx-label">Date</span>
                            <span className="rx-value">
                                {new Date(rx.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="rx-meta-row">
                            <span className="rx-label">Audience</span>
                            <span className="rx-value">{audience}</span>
                        </div>
                    </div>
                </header>

                {/* Doctor + Patient */}
                <section className="rx-identity">
                    <div className="rx-id-block">
                        <div className="rx-id-title">Prescriber</div>
                        <div className="rx-id-name">{profile?.name || "Doctor name"}</div>
                        <div className="rx-id-sub">
                            {profile?.specialization || "Specialty"}
                            {profile?.licenseNumber ? ` · Lic. ${profile.licenseNumber}` : ""}
                        </div>
                        {(profile?.phone || profile?.email) && (
                            <div className="rx-id-sub">
                                {profile?.phone || ""}{" "}
                                {profile?.phone && profile?.email ? " · " : ""}
                                {profile?.email || ""}
                            </div>
                        )}
                    </div>

                    <div className="rx-id-block">
                        <div className="rx-id-title">Patient</div>
                        <div className="rx-id-name">{appt.patientName}</div>
                        <div className="rx-id-sub">{appt.date}</div>
                        <div className="rx-id-sub">
                            {appt.workplace} ·{" "}
                            {appt.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}–
                            {appt.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                    </div>
                </section>

                {/* Medicines */}
                <section className="rx-items">
                    <div className="rx-section-title">Medications</div>
                    {rx.items.length === 0 ? (
                        <div className="rx-empty">No items</div>
                    ) : (
                        <div className="rx-table">
                            <div className="rx-th">
                                <div>Medicine</div>
                                <div>Dosage</div>
                                <div>Frequency</div>
                                <div>Duration</div>
                                <div>Notes</div>
                            </div>
                            {rx.items.map((it, i) => (
                                <div className="rx-tr" key={i}>
                                    <div className="rx-td">{it.name}</div>
                                    <div className="rx-td">{it.dosage}</div>
                                    <div className="rx-td">{it.frequency}</div>
                                    <div className="rx-td">{it.duration}</div>
                                    <div className="rx-td">{it.notes || "-"}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Instructions */}
                {!!rx.instructions && (
                    <section className="rx-instructions">
                        <div className="rx-section-title">Instructions</div>
                        <p>{rx.instructions}</p>
                    </section>
                )}

                {/* Attachment mention */}
                {!!rx.attachmentName && (
                    <section className="rx-attachment">
                        Attachment: <span>{rx.attachmentName}</span>
                    </section>
                )}

                {/* Footer / Signature */}
                <footer className="rx-footer">
                    <div className="rx-sign">
                        <div className="rx-sign-line" />
                        <div className="rx-subtle">Signature</div>
                    </div>
                </footer>

                <div className="rx-strip" aria-hidden />
            </div>
        );
    }
);

export default PrescriptionPDF;