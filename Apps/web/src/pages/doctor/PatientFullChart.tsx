// src/pages/doctor/PatientFullChart.tsx
import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button/Button";
import CustomText from "../../components/Text/CustomText";
import "../../styles/patientChart.css";
import AttachmentsPanel, { AttachmentItem } from "../../components/Patient/AttachmentsPanel";

type Patient = {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    dob?: string;
    gender?: string;
};

const mockPatients: Patient[] = [
    { id: "P001", name: "Dianne Russell", phone: "(505) 555-0125", email: "dianne.russell@example.com", dob: "1985-03-25", gender: "Female" },
    { id: "P002", name: "Ralph Edwards", email: "ralph.edwards@example.com", dob: "1978-11-03", gender: "Male" },
    { id: "P003", name: "Jane Cooper", phone: "(402) 555-0175", dob: "1990-07-15", gender: "Female" },
];

const TABS = ["Summary", "Notes", "Attachments", "Prescriptions", "Timeline", "Medications"] as const;
type Tab = (typeof TABS)[number];

type Note = { id: string; body: string; author: "Doctor" | "Patient"; createdAt: string };

const mockPrescriptions = [
    { id: "RX-10421", drug: "Lisinopril", dose: "10 mg", route: "PO", sig: "Once daily", issuedOn: "2025-08-01", status: "Active", refills: 2, prescriber: "Dr. John Doe" },
    { id: "RX-10422", drug: "Atorvastatin", dose: "20 mg", route: "PO", sig: "Nightly", issuedOn: "2025-08-01", status: "Active", refills: 1, prescriber: "Dr. John Doe" },
];

export default function PatientFullChart() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tab, setTab] = useState<Tab>("Summary");
    const [notes, setNotes] = useState<Note[]>([
        { id: "n1", body: "Follow-up on BP; home readings stable.", author: "Doctor", createdAt: new Date().toISOString() },
        { id: "n0", body: "Started lifestyle counseling.", author: "Doctor", createdAt: new Date(Date.now() - 12096e5).toISOString() }, // ~2w
    ]);
    const [newNote, setNewNote] = useState("");
    const [attachments, setAttachments] = useState<AttachmentItem[]>([]);

    const patient = useMemo(
        () => mockPatients.find((p) => p.id === id) ?? null,
        [id]
    );

    if (!patient) {
        return (
            <div className="chart-container">
                <div className="chart-header">
                    <div className="chart-rail">
                        <div className="chart-header-inner">
                            <Button text="← Back" variant="tertiary" onClick={() => navigate(-1)} />
                            <CustomText as="h2" variant="text-heading-H3" className="chart-title">Patient not found</CustomText>
                        </div>
                    </div>
                </div>
                <div className="chart-rail chart-body">
                    <div className="card">We couldn’t find a patient with ID <strong>{id}</strong>.</div>
                </div>
            </div>
        );
    }

    const addNote = () => {
        const body = newNote.trim();
        if (!body) return;
        setNotes(prev => [
            { id: `${Date.now()}`, body, author: "Doctor", createdAt: new Date().toISOString() },
            ...prev,
        ]);
        setNewNote("");
    };

    return (
        <div className="chart-container">
            {/* Sticky header */}
            <div className="chart-header">
                <div className="chart-rail">
                    <div className="patient-hero">
                        <div className="hero-left">
                            <Link to="/doctor/patients" className="link-back">
                                <Button variant="tertiary" text="Back to Patients" iconLeft={<svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M27.9998 16.0006C27.9998 16.2658 27.8945 16.5201 27.7069 16.7077C27.5194 16.8952 27.265 17.0006 26.9998 17.0006H7.41356L14.7073 24.2931C14.8002 24.386 14.8739 24.4963 14.9242 24.6177C14.9745 24.7391 15.0004 24.8692 15.0004 25.0006C15.0004 25.132 14.9745 25.2621 14.9242 25.3835C14.8739 25.5048 14.8002 25.6151 14.7073 25.7081C14.6144 25.801 14.5041 25.8747 14.3827 25.9249C14.2613 25.9752 14.1312 26.0011 13.9998 26.0011C13.8684 26.0011 13.7383 25.9752 13.6169 25.9249C13.4955 25.8747 13.3852 25.801 13.2923 25.7081L4.29231 16.7081C4.19933 16.6152 4.12557 16.5049 4.07525 16.3835C4.02493 16.2621 3.99902 16.132 3.99902 16.0006C3.99902 15.8691 4.02493 15.739 4.07525 15.6176C4.12557 15.4962 4.19933 15.3859 4.29231 15.2931L13.2923 6.29306C13.4799 6.10542 13.7344 6 13.9998 6C14.2652 6 14.5197 6.10542 14.7073 6.29306C14.895 6.4807 15.0004 6.73519 15.0004 7.00056C15.0004 7.26592 14.895 7.52042 14.7073 7.70806L7.41356 15.0006H26.9998C27.265 15.0006 27.5194 15.1059 27.7069 15.2934C27.8945 15.481 27.9998 15.7353 27.9998 16.0006Z" fill="currentColor" />
                                </svg>}></Button>
                            </Link>
                            {/* <div className="hero-id">
                                <div className="chip-avatar" aria-hidden="true">{getInitials(patient.name)}</div>
                                <div>
                                    <div className="hero-name">{patient.name}</div>
                                    <div className="hero-meta">ID {patient.id} • {patient.gender ?? "—"} • DOB {patient.dob ?? "—"}</div>
                                </div>
                            </div> */}
                        </div>

                        <div className="hero-actions">
                            <Button variant="primary" text="Add note" onClick={() => { setTab("Notes"); setTimeout(() => document.getElementById("note-textarea")?.focus(), 0); }} />
                            <Button variant="secondary" text="Add attachment" onClick={() => setTab("Attachments")} />
                        </div>
                    </div>

                    <div className="tabbar" role="tablist" aria-label="Patient sections">
                        {TABS.map((t) => (
                            <button
                                key={t}
                                role="tab"
                                aria-selected={tab === t}
                                className={`tab ${tab === t ? "tab--active" : ""}`}
                                onClick={() => setTab(t)}
                            >
                                <CustomText variant="text-body-md-r">{t}</CustomText>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="chart-rail chart-body">
                {tab === "Summary" && (
                    <div className="grid-2">
                        <div className="card">
                            <div className="card-title">
                                <CustomText variant="text-heading-H4" as={'h4'}>Identifiers</CustomText>
                            </div>
                            <div className="kv"><span>Phone</span><span>{patient.phone || "—"}</span></div>
                            <div className="kv"><span>Email</span><span>{patient.email || "—"}</span></div>
                            <div className="kv"><span>Gender</span><span>{patient.gender || "—"}</span></div>
                            <div className="kv"><span>Date of Birth</span><span>{patient.dob || "—"}</span></div>
                        </div>

                        <div className="card">
                            <div className="card-title">
                                <CustomText variant="text-heading-H4" as={'h4'}>Allergies & Alerts</CustomText>
                            </div>
                            <ul className="list">
                                <li>No known drug allergies</li>
                                <li>—</li>
                            </ul>
                        </div>

                        <div className="card">
                            <div className="card-title">
                                <CustomText variant="text-heading-H4" as={'h4'}>Recent Notes</CustomText>
                                <Button variant="tertiary" text="View all notes" iconRight={
                                    <svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M27.7075 16.7081L18.7075 25.7081C18.5199 25.8957 18.2654 26.0011 18 26.0011C17.7346 26.0011 17.4801 25.8957 17.2925 25.7081C17.1049 25.5204 16.9994 25.2659 16.9994 25.0006C16.9994 24.7352 17.1049 24.4807 17.2925 24.2931L24.5863 17.0006H5C4.73478 17.0006 4.48043 16.8952 4.29289 16.7077C4.10536 16.5201 4 16.2658 4 16.0006C4 15.7353 4.10536 15.481 4.29289 15.2934C4.48043 15.1059 4.73478 15.0006 5 15.0006H24.5863L17.2925 7.70806C17.1049 7.52042 16.9994 7.26592 16.9994 7.00056C16.9994 6.73519 17.1049 6.4807 17.2925 6.29306C17.4801 6.10542 17.7346 6 18 6C18.2654 6 18.5199 6.10542 18.7075 6.29306L27.7075 15.2931C27.8005 15.3859 27.8742 15.4962 27.9246 15.6176C27.9749 15.739 28.0008 15.8691 28.0008 16.0006C28.0008 16.132 27.9749 16.2621 27.9246 16.3835C27.8742 16.5049 27.8005 16.6152 27.7075 16.7081Z" fill="currentColor" />
                                    </svg>
                                } onClick={() => setTab("Notes")} />
                            </div>
                            <ul className="timeline">
                                {notes.slice(0, 2).map(n => (
                                    <li key={n.id}>
                                        <CustomText variant="text-body-sm-sb">{formatRelative(n.createdAt)}</CustomText><CustomText> — “{n.body}”</CustomText>
                                        <span className={`badge badge--${n.author === "Doctor" ? "doctor" : "patient"}`}>{n.author}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="card-actions">
                                <Button variant="primary" text="Add note" onClick={() => { setTab("Notes"); setTimeout(() => document.getElementById("note-textarea")?.focus(), 0); }} />
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-title">
                                <CustomText variant="text-heading-H4" as={'h4'}>Attachments</CustomText>
                                <Button variant="tertiary" text="Manage attachments" iconRight={
                                    <svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M27.7075 16.7081L18.7075 25.7081C18.5199 25.8957 18.2654 26.0011 18 26.0011C17.7346 26.0011 17.4801 25.8957 17.2925 25.7081C17.1049 25.5204 16.9994 25.2659 16.9994 25.0006C16.9994 24.7352 17.1049 24.4807 17.2925 24.2931L24.5863 17.0006H5C4.73478 17.0006 4.48043 16.8952 4.29289 16.7077C4.10536 16.5201 4 16.2658 4 16.0006C4 15.7353 4.10536 15.481 4.29289 15.2934C4.48043 15.1059 4.73478 15.0006 5 15.0006H24.5863L17.2925 7.70806C17.1049 7.52042 16.9994 7.26592 16.9994 7.00056C16.9994 6.73519 17.1049 6.4807 17.2925 6.29306C17.4801 6.10542 17.7346 6 18 6C18.2654 6 18.5199 6.10542 18.7075 6.29306L27.7075 15.2931C27.8005 15.3859 27.8742 15.4962 27.9246 15.6176C27.9749 15.739 28.0008 15.8691 28.0008 16.0006C28.0008 16.132 27.9749 16.2621 27.9246 16.3835C27.8742 16.5049 27.8005 16.6152 27.7075 16.7081Z" fill="currentColor" />
                                    </svg>
                                } onClick={() => setTab("Attachments")} />
                            </div>
                            {attachments.length === 0 ? (
                                <p className="muted"><CustomText variant="text-body-sm-r">No attachments yet.</CustomText></p>
                            ) : (
                                <div className="attach-grid attach-grid--summary">
                                    {attachments.slice(0, 4).map(a => (
                                        <div key={a.id} className="attach-thumb">
                                            {a.type === "image" ? <img src={a.url} alt={a.name} /> : <div className="thumb-pdf">PDF</div>}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="card-actions">
                            </div>
                        </div>
                    </div>
                )}

                {tab === "Notes" && (
                    <div className="grid-2">
                        <div className="card">
                            <div className="card-title">
                                <CustomText variant="text-heading-H4" as={'h4'}>Add a note</CustomText>
                            </div>
                            <textarea
                                id="note-textarea"
                                className="note-input"
                                placeholder="Type your clinical note…"
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                rows={4}
                            />
                            <div className="card-actions">
                                <Button variant="primary" text="Add note" onClick={addNote} />
                            </div>
                            {/* <p className="muted" style={{ marginTop: 8 }}>Notes are visible to authorized clinical staff.</p> */}
                        </div>

                        <div className="card">
                            <div className="card-title">
                                <CustomText variant="text-heading-H4" as={'h4'}>All notes</CustomText>
                            </div>
                            <ul className="timeline" style={{ marginTop: 8 }}>
                                {notes.map(n => (
                                    <li key={n.id}>
                                        <CustomText variant="text-body-sm-sb">{formatRelative(n.createdAt)}</CustomText><CustomText> — “{n.body}”</CustomText>
                                        <span className={`badge badge--${n.author === "Doctor" ? "doctor" : "patient"}`}>{n.author}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {tab === "Attachments" && (
                    <div className="card">
                        <div className="card-title">Attachments</div>
                        <p className="muted">Upload PDFs or images. These may be added by the patient or a clinician.</p>
                        <AttachmentsPanel value={attachments} onChange={setAttachments} defaultAddedBy="Doctor" />
                    </div>
                )}

                {tab === "Prescriptions" && (
                    <div className="card">
                        <div className="card-title">Issued Prescriptions</div>
                        <p className="muted">Prescriptions issued by authorized clinicians at this clinic.</p>
                        <div className="table">
                            <div className="table-row table-row--head">
                                <span>Drug</span><span>Dosage</span><span>Sig</span><span>Issued</span><span>Status</span><span>Prescriber</span><span>Refills</span>
                            </div>
                            {mockPrescriptions.map(rx => (
                                <div key={rx.id} className="table-row table-row--rx">
                                    <span>{rx.drug}</span>
                                    <span>{rx.dose} {rx.route}</span>
                                    <span>{rx.sig}</span>
                                    <span>{rx.issuedOn}</span>
                                    <span><span className="badge badge--active">{rx.status}</span></span>
                                    <span>{rx.prescriber}</span>
                                    <span>{rx.refills}</span>
                                </div>
                            ))}
                        </div>
                        <div className="card-actions">
                            <Button variant="tertiary" text="View prescription history" />
                        </div>
                    </div>
                )}

                {tab === "Timeline" && (
                    <div className="card">
                        <div className="card-title">Visit Timeline</div>
                        <ul className="timeline">
                            <li><strong>2025-08-01</strong> — Annual physical; labs ordered.</li>
                            <li><strong>2024-12-15</strong> — Telehealth check-in.</li>
                            <li><strong>2024-06-12</strong> — ER follow-up; no complications.</li>
                        </ul>
                    </div>
                )}

                {tab === "Medications" && (
                    <div className="card">
                        <div className="card-title">Active Medications</div>
                        <div className="table">
                            <div className="table-row table-row--head">
                                <span>Name</span><span>Dosage</span><span>Route</span><span>Instructions</span>
                            </div>
                            <div className="table-row"><span>Lisinopril</span><span>10 mg</span><span>PO</span><span>Once daily</span></div>
                            <div className="table-row"><span>Atorvastatin</span><span>20 mg</span><span>PO</span><span>Nightly</span></div>
                        </div>
                    </div>
                )}

                {/* Footer shortcuts */}
                <div className="chart-footer">
                    <Link to="/doctor/patients">Back to list</Link>
                    <div className="spacer" />
                    <Button variant="secondary" iconLeft={<svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M26.8337 9.00049H25V5.00049C25 4.73527 24.8946 4.48092 24.7071 4.29338C24.5196 4.10585 24.2652 4.00049 24 4.00049H8C7.73478 4.00049 7.48043 4.10585 7.29289 4.29338C7.10536 4.48092 7 4.73527 7 5.00049V9.00049H5.16625C3.42 9.00049 2 10.3467 2 12.0005V22.0005C2 22.2657 2.10536 22.5201 2.29289 22.7076C2.48043 22.8951 2.73478 23.0005 3 23.0005H7V27.0005C7 27.2657 7.10536 27.5201 7.29289 27.7076C7.48043 27.8951 7.73478 28.0005 8 28.0005H24C24.2652 28.0005 24.5196 27.8951 24.7071 27.7076C24.8946 27.5201 25 27.2657 25 27.0005V23.0005H29C29.2652 23.0005 29.5196 22.8951 29.7071 22.7076C29.8946 22.5201 30 22.2657 30 22.0005V12.0005C30 10.3467 28.58 9.00049 26.8337 9.00049ZM9 6.00049H23V9.00049H9V6.00049ZM23 26.0005H9V20.0005H23V26.0005ZM28 21.0005H25V19.0005C25 18.7353 24.8946 18.4809 24.7071 18.2934C24.5196 18.1058 24.2652 18.0005 24 18.0005H8C7.73478 18.0005 7.48043 18.1058 7.29289 18.2934C7.10536 18.4809 7 18.7353 7 19.0005V21.0005H4V12.0005C4 11.4492 4.52375 11.0005 5.16625 11.0005H26.8337C27.4762 11.0005 28 11.4492 28 12.0005V21.0005ZM25 14.5005C25 14.7972 24.912 15.0872 24.7472 15.3338C24.5824 15.5805 24.3481 15.7728 24.074 15.8863C23.7999 15.9998 23.4983 16.0295 23.2074 15.9717C22.9164 15.9138 22.6491 15.7709 22.4393 15.5611C22.2296 15.3514 22.0867 15.0841 22.0288 14.7931C21.9709 14.5022 22.0007 14.2006 22.1142 13.9265C22.2277 13.6524 22.42 13.4181 22.6666 13.2533C22.9133 13.0885 23.2033 13.0005 23.5 13.0005C23.8978 13.0005 24.2794 13.1585 24.5607 13.4398C24.842 13.7211 25 14.1027 25 14.5005Z" fill="currentColor" />
                    </svg>} text="Print chart" />
                </div>
            </div>
        </div>
    );
}

function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}
function formatRelative(iso: string) {
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    if (diff < 1209600) return `${Math.floor(diff / 86400)} days ago`;
    return d.toLocaleDateString();
}
