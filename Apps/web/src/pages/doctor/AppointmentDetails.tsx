import React, { useMemo, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { appointments, Appointment } from "../../data/appointments";
import {
    Prescription,
    PrescriptionItem,
    getPrescription,
    setPrescription,
    deletePrescription,
} from "../../data/prescriptions";
import CustomInput from "../../components/Inputs/CustomInput";
import SearchSelect from "../../components/Inputs/SearchSelect";
import FileUploader from "../../components/Inputs/FileUploader";
import Button from "../../components/Button/Button";
import "../../styles/appointmentDetails.css";
import PrescriptionPDF from "../../components/Prescription/PrescriptionPDF";
import { downloadAsPdf } from "../../utils/downloadAsPdf";

type RouteParams = { id: string };
type Audience = "patient" | "doctor" | "pharmacy";

const STATUS_OPTIONS = [
    { value: "scheduled", label: "Scheduled" },
    { value: "pending", label: "Requested" },
    { value: "completed", label: "Completed" },
];

const MED_SUGGESTIONS = [
    { value: "Paracetamol 500mg", label: "Paracetamol 500mg" },
    { value: "Ibuprofen 400mg", label: "Ibuprofen 400mg" },
    { value: "Amoxicillin 500mg", label: "Amoxicillin 500mg" },
    { value: "Omeprazole 20mg", label: "Omeprazole 20mg" },
];

export default function AppointmentDetails() {
    const { id } = useParams<RouteParams>();
    const navigate = useNavigate();

    // audience affects the colors/ribbon in PrescriptionPDF
    const [audience, setAudience] = useState<Audience>("patient");

    // find appointment
    const appt = useMemo<Appointment | undefined>(
        () => appointments.find((a) => a.id === id),
        [id]
    );

    // local status view (frontend only)
    const [status, setStatus] = useState<string>(appt?.status || "scheduled");

    // Prescription state
    // const existing = useMemo(() => (id ? getPrescription(id) : null), [id]);
    const [existing, setExisting] = useState<Prescription | null>(
        () => (id ? getPrescription(id!) : null)
    );
    const [items, setItems] = useState<PrescriptionItem[]>(
        existing?.items || [
            { name: "", dosage: "", frequency: "", duration: "", notes: "" },
        ]
    );
    const [instructions, setInstructions] = useState<string>(
        existing?.instructions || ""
    );
    const [file, setFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    // Hidden PDF render target — declare BEFORE any early return
    const pdfRef = useRef<HTMLDivElement>(null);

    if (!appt) {
        return (
            <div className="appt-details-wrap">
                <div className="appt-header">
                    <Button variant="ghost" text="← Back" onClick={() => navigate(-1)} />
                </div>
                <div className="card">
                    <p>Appointment not found.</p>
                </div>
            </div>
        );
    }

    const timeRange = `${appt.start.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    })} – ${appt.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

    async function fileToDataUrl(f: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(String(r.result));
            r.onerror = reject;
            r.readAsDataURL(f);
        });
    }

    async function handleSavePrescription(downloadAfter?: Audience) {
        if (!appt) return;

        setSaving(true);
        let attachmentUrl: string | null = existing?.attachmentUrl || null;
        let attachmentName: string | null = existing?.attachmentName || null;

        if (file) {
            attachmentUrl = await fileToDataUrl(file);
            attachmentName = file.name;
        }

        const payload: Prescription = {
            appointmentId: appt.id,
            createdAt: new Date().toISOString(),
            items: items.filter(
                (i) => i.name || i.dosage || i.frequency || i.duration
            ),
            instructions,
            attachmentName,
            attachmentUrl,
        };
        setPrescription(payload);
        setExisting(payload);
        setSaving(false);

        if (downloadAfter) {
            setAudience(downloadAfter);
            await new Promise(r => setTimeout(r, 40)); // paint audience ribbon
            if (pdfRef.current) {
                await downloadAsPdf(
                    pdfRef.current,
                    `RX_${appt.id}_${downloadAfter}_${new Date().toISOString().slice(0, 10)}.pdf`
                );
            }
        }
    }

    function addItem() {
        setItems((prev) => [
            ...prev,
            { name: "", dosage: "", frequency: "", duration: "", notes: "" },
        ]);
    }

    function removeItem(idx: number) {
        setItems((prev) => prev.filter((_, i) => i !== idx));
    }

    const canSave =
        items.some((i) => i.name.trim()) || !!instructions.trim() || !!file;

    // What the PDF component will render (either existing or current draft)
    const rxForPdf: Prescription = {
        appointmentId: appt.id,
        createdAt: existing?.createdAt || new Date().toISOString(),
        items: (items?.length ? items : existing?.items || []).filter(
            (i) => i.name || i.dosage || i.frequency || i.duration
        ),
        instructions: instructions || existing?.instructions || "",
        attachmentName: existing?.attachmentName || null,
        attachmentUrl: existing?.attachmentUrl || null,
    };

    async function handleDownload(target: Audience) {
        if (!appt) return;

        setAudience(target);
        // wait a tick so the new ribbon/color paints
        await new Promise((r) => setTimeout(r, 40));
        if (pdfRef.current) {
            await downloadAsPdf(
                pdfRef.current,
                `RX_${appt.id}_${target}_${new Date().toISOString().slice(0, 10)}.pdf`
            );
        }
    }

    return (
        <div className="appt-details-wrap">
            {/* Hidden PDF render root */}
            <div
                ref={pdfRef}
                style={{
                    position: "absolute",
                    left: -99999,
                    top: -99999,
                    width: 800, // fixed width ensures consistent PDFs
                }}
                aria-hidden
            >
                <PrescriptionPDF
                    audience={audience}
                    appointment={appt}
                    prescription={rxForPdf}
                /* optionally pass doctor profile if your component supports it:
                   doctor={doctorFromLocalStorageOrContext} */
                />
            </div>

            <div className="appt-header">
                <Button variant="ghost" text="← Back" onClick={() => navigate(-1)} />
                <h1>Appointment {appt.id}</h1>
                <div className="header-actions">
                    <SearchSelect
                        label=""
                        placeholder="Status"
                        options={STATUS_OPTIONS}
                        value={status}
                        onChange={(v) => setStatus(v)}
                    />
                    {status !== "completed" && (
                        <Button
                            variant="primary"
                            text="Mark as Completed"
                            onClick={() => setStatus("completed")}
                        />
                    )}
                </div>
            </div>

            <section className="card info-card">
                <div className="info-grid">
                    <div className="info-item">
                        <label>Patient</label>
                        <div className="value">{appt.patientName}</div>
                    </div>
                    <div className="info-item">
                        <label>Workplace</label>
                        <div className="value">{appt.workplace}</div>
                    </div>
                    <div className="info-item">
                        <label>Date</label>
                        <div className="value">{appt.date}</div>
                    </div>
                    <div className="info-item">
                        <label>Time / Slot</label>
                        <div className="value">{timeRange}</div>
                    </div>
                    <div className="info-item">
                        <label>Status</label>
                        <div className={`badge ${status}`}>
                            {STATUS_OPTIONS.find((s) => s.value === status)?.label}
                        </div>
                    </div>
                </div>
            </section>

            <section className="card">
                <div className="section-header">
                    <h2>Prescription</h2>
                    {!!existing && (
                        <div className="existing-meta">
                            <span>
                                Issued: {new Date(existing.createdAt).toLocaleString()}
                            </span>
                            <Button
                                variant="ghost"
                                text="Delete"
                                onClick={() => {
                                    deletePrescription(appt.id);
                                    window.location.reload();
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Read view */}
                {existing &&
                    !file &&
                    items.every(
                        (i) =>
                            i.name === "" &&
                            i.dosage === "" &&
                            i.frequency === "" &&
                            i.duration === ""
                    ) &&
                    !instructions && (
                        <div className="rx-read">
                            {existing.items.length === 0 && !existing.instructions ? (
                                <div className="muted">No prescription details saved.</div>
                            ) : (
                                <>
                                    {existing.items.length > 0 && (
                                        <div className="rx-list">
                                            {existing.items.map((it, idx) => (
                                                <div className="rx-row" key={idx}>
                                                    <div className="rx-name">{it.name}</div>
                                                    <div className="rx-meta">
                                                        <span>{it.dosage}</span>
                                                        <span>{it.frequency}</span>
                                                        <span>{it.duration}</span>
                                                    </div>
                                                    {it.notes && <div className="rx-notes">{it.notes}</div>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {existing.instructions && (
                                        <div className="rx-notes-block">
                                            <label>Instructions</label>
                                            <p>{existing.instructions}</p>
                                        </div>
                                    )}
                                    {existing.attachmentUrl && (
                                        <div className="rx-attachment">
                                            <a
                                                href={existing.attachmentUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                {existing.attachmentName || "Attachment"}
                                            </a>
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="rx-actions">
                                <Button
                                    variant="primary"
                                    text="Edit / Re-issue"
                                    onClick={() => {
                                        setItems(
                                            existing.items.length
                                                ? existing.items
                                                : [
                                                    {
                                                        name: "",
                                                        dosage: "",
                                                        frequency: "",
                                                        duration: "",
                                                        notes: "",
                                                    },
                                                ]
                                        );
                                        setInstructions(existing.instructions || "");
                                    }}
                                />
                                <Button
                                    variant="ghost"
                                    text="Patient PDF"
                                    onClick={() => handleDownload("patient")}
                                />
                                <Button
                                    variant="ghost"
                                    text="Doctor PDF"
                                    onClick={() => handleDownload("doctor")}
                                />
                                <Button
                                    variant="ghost"
                                    text="Pharmacy PDF"
                                    onClick={() => handleDownload("pharmacy")}
                                />
                            </div>
                        </div>
                    )}

                {/* Builder / editor */}
                {(!existing ||
                    items.some((i) => i.name || i.dosage || i.frequency || i.duration) ||
                    instructions ||
                    file) && (
                        <div className="rx-form">
                            {items.map((it, idx) => (
                                <div className="rx-row-edit" key={idx}>
                                    <SearchSelect
                                        label="Medicine"
                                        placeholder="Select or type medicine"
                                        options={MED_SUGGESTIONS}
                                        value={it.name}
                                        onChange={(v) => {
                                            const next = [...items];
                                            next[idx].name = v;
                                            setItems(next);
                                        }}
                                        creatable
                                        showOtherRow
                                    />
                                    <CustomInput
                                        label="Dosage"
                                        placeholder="e.g., 500 mg"
                                        value={it.dosage}
                                        onChange={(e) => {
                                            const next = [...items];
                                            next[idx].dosage = (e.target as HTMLInputElement).value;
                                            setItems(next);
                                        }}
                                    />
                                    <CustomInput
                                        label="Frequency"
                                        placeholder="e.g., 3x/day"
                                        value={it.frequency}
                                        onChange={(e) => {
                                            const next = [...items];
                                            next[idx].frequency = (e.target as HTMLInputElement).value;
                                            setItems(next);
                                        }}
                                    />
                                    <CustomInput
                                        label="Duration"
                                        placeholder="e.g., 5 days"
                                        value={it.duration}
                                        onChange={(e) => {
                                            const next = [...items];
                                            next[idx].duration = (e.target as HTMLInputElement).value;
                                            setItems(next);
                                        }}
                                    />
                                    <CustomInput
                                        label="Notes (optional)"
                                        placeholder="Before food, if pain persists…"
                                        value={it.notes || ""}
                                        onChange={(e) => {
                                            const next = [...items];
                                            next[idx].notes = (e.target as HTMLInputElement).value;
                                            setItems(next);
                                        }}
                                    />
                                    <button className="link danger" onClick={() => removeItem(idx)}>
                                        Remove
                                    </button>
                                </div>
                            ))}

                            <button className="link" onClick={addItem}>
                                + Add medicine
                            </button>

                            <div className="rx-notes-editor">
                                <CustomInput
                                    as="textarea"
                                    rows={4}
                                    label="General instructions"
                                    placeholder="Any extra advice for the patient…"
                                    value={instructions}
                                    onChange={(e) =>
                                        setInstructions((e.target as HTMLTextAreaElement).value)
                                    }
                                />
                            </div>

                            <div className="rx-attach">
                                <FileUploader
                                    label="Attach prescription (image or PDF)"
                                    description="Optional — will be available for the patient to download"
                                    value={file}
                                    onChange={setFile}
                                />
                                {existing?.attachmentUrl && !file && (
                                    <div className="persisted-file">
                                        Current:{" "}
                                        <a
                                            href={existing.attachmentUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {existing.attachmentName || "Attachment"}
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="rx-actions">
                                <Button
                                    variant="ghost"
                                    text="Discard draft"
                                    onClick={() => {
                                        setItems([
                                            {
                                                name: "",
                                                dosage: "",
                                                frequency: "",
                                                duration: "",
                                                notes: "",
                                            },
                                        ]);
                                        setInstructions("");
                                        setFile(null);
                                    }}
                                />
                                <Button
                                    variant="primary"
                                    text={existing ? "Save changes" : "Issue prescription"}
                                    onClick={() => handleSavePrescription()}        // just save
                                    disabled={!canSave || saving}
                                />
                                <Button
                                    variant="ghost"
                                    text="Save & Patient PDF"
                                    onClick={() => handleSavePrescription("patient")} // save + download
                                    disabled={!canSave || saving}
                                />
                                <Button variant="ghost" text="Save & Doctor PDF" onClick={() => handleSavePrescription("doctor")} />
                                <Button variant="ghost" text="Save & Pharmacy PDF" onClick={() => handleSavePrescription("pharmacy")} />
                            </div>
                        </div>
                    )}
            </section>
        </div>
    );
}