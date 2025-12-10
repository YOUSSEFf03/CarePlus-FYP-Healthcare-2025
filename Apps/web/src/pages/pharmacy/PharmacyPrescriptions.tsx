import React, { useMemo, useState, useEffect } from "react";
import "../../styles/doctorAppointments.css";
import { createPortal } from "react-dom";
import CustomText from "../../components/Text/CustomText";
import Button from "../../components/Button/Button";
import RxPdfPreview from "../../components/Prescription/RxPdfPreview";
import "../../styles/pharmacyPrescriptions.css";
import pharmacyApiService, { Prescription } from "../../services/pharmacyApiService";

type RxStatus = "pending" | "verified" | "fulfilled" | "rejected";
type Template = "doctor" | "pharmacy" | "patient";

type PrescriptionRow = {
    id: string;
    patient: string;
    doctor: string;
    date: string;
    status: RxStatus;
    template: Template; // which branding color to use for the PDF
    items: Array<{ name: string; dosage: string; qty: number; notes?: string }>;
    prescription_id: number;
};

export default function PharmacyPrescriptions() {
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | RxStatus>("all");
    const [activeRx, setActiveRx] = useState<PrescriptionRow | null>(null);
    const [viewerTemplate, setViewerTemplate] = useState<Template>("pharmacy");
    const [prescriptions, setPrescriptions] = useState<PrescriptionRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load prescriptions data
    useEffect(() => {
        const loadPrescriptions = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const prescriptionsData = await pharmacyApiService.getPrescriptions();
                
                // Transform API prescriptions to display format
                const displayPrescriptions: PrescriptionRow[] = prescriptionsData.data.map(prescription => ({
                    id: `RX-${prescription.prescription_id}`,
                    patient: prescription.patient?.name || `Patient ${prescription.patient_id}`,
                    doctor: prescription.doctor?.name || `Doctor ${prescription.doctor_id}`,
                    date: new Date(prescription.date_issued).toLocaleDateString(),
                    status: prescription.status as RxStatus,
                    template: "pharmacy" as Template,
                    items: prescription.medicines.map(med => ({
                        name: med.medicine?.item?.name || 'Unknown Medicine',
                        dosage: med.dosage,
                        qty: med.quantity,
                        notes: med.notes,
                    })),
                    prescription_id: prescription.prescription_id,
                }));
                
                setPrescriptions(displayPrescriptions);
            } catch (err) {
                console.error('Error loading prescriptions:', err);
                setError(err instanceof Error ? err.message : 'Failed to load prescriptions');
            } finally {
                setLoading(false);
            }
        };

        loadPrescriptions();
    }, []);

    const filtered = useMemo(() => {
        const base = statusFilter === "all"
            ? prescriptions
            : prescriptions.filter(p => p.status === statusFilter);

        if (!query.trim()) return base;

        const q = query.toLowerCase();
        return base.filter(p =>
            p.id.toLowerCase().includes(q) ||
            p.patient.toLowerCase().includes(q) ||
            p.doctor.toLowerCase().includes(q)
        );
    }, [prescriptions, query, statusFilter]);

    useEffect(() => {
        if (activeRx) {
            document.body.classList.add("no-scroll");
        } else {
            document.body.classList.remove("no-scroll");
        }
        return () => document.body.classList.remove("no-scroll");
    }, [activeRx]);

    // Loading state
    if (loading) {
        return (
            <div className="overview">
                <div className="overview__header">
                    <CustomText variant="text-heading-H2">Prescriptions</CustomText>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                    <CustomText variant="text-body-lg-r">Loading prescriptions...</CustomText>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="overview">
                <div className="overview__header">
                    <CustomText variant="text-heading-H2">Prescriptions</CustomText>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', flexDirection: 'column' }}>
                    <div style={{ color: '#ef4444', marginBottom: '16px' }}>
                        <CustomText variant="text-body-lg-r">
                            Error: {error}
                        </CustomText>
                    </div>
                    <Button 
                        text="Retry" 
                        onClick={() => window.location.reload()} 
                        variant="primary"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="overview">
            {/* Header */}
            <div className="overview__header">
                <CustomText variant="text-heading-H2">Prescriptions</CustomText>
                {/* <div className="overview__actions">
                    <Button
                        text="Scan paper prescription"
                        variant="secondary"
                        className="btn-compact"
                        iconLeft={
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path d="M4 4h4M16 4h4M4 20h4M16 20h4" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                        }
                    />
                    <Button
                        text="New reservation"
                        className="btn-compact"
                        iconLeft={
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                        }
                    />
                </div> */}
            </div>

            {/* Controls */}
            <section className="panel">
                <div className="panel__header" style={{ borderBottom: "none", paddingBottom: 0 }}>
                    <div className="filters-row">
                        <div className="search-box slim">
                            <span className="search-icon">
                                <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M28.7078 27.293L22.449 21.0355C24.2631 18.8577 25.1676 16.0643 24.9746 13.2364C24.7815 10.4086 23.5057 7.7641 21.4125 5.85299C19.3193 3.94189 16.5698 2.91135 13.7362 2.97575C10.9025 3.04015 8.20274 4.19453 6.19851 6.19876C4.19429 8.20298 3.0399 10.9027 2.9755 13.7364C2.9111 16.5701 3.94164 19.3195 5.85275 21.4127C7.76385 23.5059 10.4084 24.7818 13.2362 24.9748C16.064 25.1679 18.8574 24.2633 21.0353 22.4493L27.2928 28.708C27.3857 28.8009 27.496 28.8746 27.6174 28.9249C27.7388 28.9752 27.8689 29.0011 28.0003 29.0011C28.1317 29.0011 28.2618 28.9752 28.3832 28.9249C28.5046 28.8746 28.6149 28.8009 28.7078 28.708C28.8007 28.6151 28.8744 28.5048 28.9247 28.3834C28.975 28.262 29.0008 28.1319 29.0008 28.0005C29.0008 27.8691 28.975 27.739 28.9247 27.6176C28.8744 27.4962 28.8007 27.3859 28.7078 27.293ZM5.00029 14.0005C5.00029 12.2205 5.52813 10.4804 6.51706 9.0004C7.50599 7.52035 8.9116 6.3668 10.5561 5.68561C12.2007 5.00443 14.0103 4.8262 15.7561 5.17346C17.5019 5.52073 19.1056 6.3779 20.3642 7.63657C21.6229 8.89524 22.4801 10.4989 22.8274 12.2447C23.1746 13.9905 22.9964 15.8001 22.3152 17.4447C21.634 19.0892 20.4805 20.4948 19.0004 21.4838C17.5204 22.4727 15.7803 23.0005 14.0003 23.0005C11.6141 22.9979 9.3265 22.0488 7.63925 20.3616C5.95199 18.6743 5.00293 16.3867 5.00029 14.0005Z" fill="currentColor" />
                                </svg>
                            </span>
                            <input
                                className="ph-input"
                                type="text"
                                placeholder="Search by Rx ID, patient, doctor…"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                            />
                        </div>

                        <div className="segmented">
                            {(["all", "pending", "verified", "fulfilled", "rejected"] as const).map(s => (
                                <button
                                    key={s}
                                    className={`segmented-btn ${statusFilter === s ? "is-active" : ""}`}
                                    onClick={() => setStatusFilter(s as any)}
                                >
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="table">
                    <div className="table__head">
                        <span>Rx ID</span>
                        <span>Patient</span>
                        <span>Doctor</span>
                        <span>Date</span>
                        <span>Status</span>
                        <span>Actions</span>
                    </div>
                    <div className="table__body">
                        {filtered.map((p) => (
                            <div className="table__row" key={p.id}>
                                <span className="mono">{p.id}</span>
                                <span>{p.patient}</span>
                                <span>{p.doctor}</span>
                                <span>{p.date}</span>
                                <span className={`status status--${p.status.replace(/\s/g, "").toLowerCase()}`}>{p.status}</span>
                                <span style={{ display: "flex", gap: 8 }}>
                                    <Button
                                        variant="tertiary"
                                        className="btn-compact"
                                        iconLeft={
                                            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M30.9137 15.5955C30.87 15.4967 29.8112 13.148 27.4575 10.7942C24.3212 7.65799 20.36 6.00049 16 6.00049C11.64 6.00049 7.67874 7.65799 4.54249 10.7942C2.18874 13.148 1.12499 15.5005 1.08624 15.5955C1.02938 15.7234 1 15.8618 1 16.0017C1 16.1417 1.02938 16.2801 1.08624 16.408C1.12999 16.5067 2.18874 18.8542 4.54249 21.208C7.67874 24.343 11.64 26.0005 16 26.0005C20.36 26.0005 24.3212 24.343 27.4575 21.208C29.8112 18.8542 30.87 16.5067 30.9137 16.408C30.9706 16.2801 31 16.1417 31 16.0017C31 15.8618 30.9706 15.7234 30.9137 15.5955ZM16 24.0005C12.1525 24.0005 8.79124 22.6017 6.00874 19.8442C4.86704 18.7089 3.89572 17.4142 3.12499 16.0005C3.89551 14.5867 4.86686 13.292 6.00874 12.1567C8.79124 9.39924 12.1525 8.00049 16 8.00049C19.8475 8.00049 23.2087 9.39924 25.9912 12.1567C27.1352 13.2917 28.1086 14.5864 28.8812 16.0005C27.98 17.683 24.0537 24.0005 16 24.0005ZM16 10.0005C14.8133 10.0005 13.6533 10.3524 12.6666 11.0117C11.6799 11.671 10.9108 12.608 10.4567 13.7044C10.0026 14.8007 9.88377 16.0071 10.1153 17.171C10.3468 18.3349 10.9182 19.404 11.7573 20.2431C12.5965 21.0822 13.6656 21.6537 14.8294 21.8852C15.9933 22.1167 17.1997 21.9979 18.2961 21.5438C19.3924 21.0896 20.3295 20.3206 20.9888 19.3339C21.6481 18.3472 22 17.1872 22 16.0005C21.9983 14.4097 21.3657 12.8845 20.2408 11.7597C19.1159 10.6348 17.5908 10.0021 16 10.0005ZM16 20.0005C15.2089 20.0005 14.4355 19.7659 13.7777 19.3264C13.1199 18.8868 12.6072 18.2621 12.3045 17.5312C12.0017 16.8003 11.9225 15.9961 12.0768 15.2201C12.2312 14.4442 12.6122 13.7315 13.1716 13.1721C13.731 12.6127 14.4437 12.2317 15.2196 12.0773C15.9956 11.923 16.7998 12.0022 17.5307 12.305C18.2616 12.6077 18.8863 13.1204 19.3259 13.7782C19.7654 14.436 20 15.2094 20 16.0005C20 17.0614 19.5786 18.0788 18.8284 18.8289C18.0783 19.5791 17.0609 20.0005 16 20.0005Z" fill="currentColor" />
                                            </svg>
                                        }
                                        onClick={() => {
                                            setViewerTemplate(p.template);
                                            setActiveRx(p);
                                        }}
                                    />
                                    {/* <Button
                                        variant="secondary"
                                        className="btn-compact"
                                        text={p.status === "Verified" ? "Fulfill" : "Verify"}
                                        onClick={() => {
                                            // wire up to your verify/fulfill flows
                                            alert(`${p.status === "Verified" ? "Fulfill" : "Verify"} ${p.id}`);
                                        }}
                                    /> */}
                                </span>
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <div className="table__row">
                                <span className="muted" style={{ gridColumn: "1 / -1" }}>
                                    No prescriptions match your filters.
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Side viewer / modal */}
            {activeRx &&
                createPortal(
                    <RxViewer
                        rx={activeRx}
                        template={viewerTemplate}
                        onClose={() => setActiveRx(null)}
                        onTemplateChange={setViewerTemplate}
                    />,
                    document.body
                )
            }
        </div>
    );
}

/* ===== Inline viewer component (drawer-style modal) ===== */

function RxViewer({
    rx,
    template,
    onClose,
    onTemplateChange,
}: {
    rx: PrescriptionRow;
    template: Template;
    onClose: () => void;
    onTemplateChange: (t: Template) => void;
}) {
    // We’ll use @react-pdf/renderer’s <PDFViewer>/<PDFDownloadLink> from inside PrescriptionPDF.tsx.
    // If PrescriptionPDF already exports a ready-made <PDFViewer> wrapper, great.
    // Otherwise, we embed <PrescriptionPDF .../> inside a <PDFViewer> there.

    return (
        <div className="rx-viewer-overlay" role="dialog" aria-modal="true">
            <div className="rx-viewer-panel">
                <div className="rx-viewer-header">
                    <CustomText variant="text-heading-H4">{rx.id}</CustomText>
                    <div style={{ display: "flex", gap: 8 }}>
                        <div className="segmented small">
                            {(["doctor", "pharmacy", "patient"] as const).map((t) => (
                                <button
                                    key={t}
                                    className={`segmented-btn ${t === template ? "is-active" : ""}`}
                                    onClick={() => onTemplateChange(t)}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                        <Button variant="ghost" className="btn-compact" text="Close" onClick={onClose} />
                    </div>
                </div>

                <div className="rx-viewer-meta">
                    <span><strong>Patient:</strong> {rx.patient}</span>
                    <span><strong>Doctor:</strong> {rx.doctor}</span>
                    <span><strong>Date:</strong> {rx.date}</span>
                    <span><strong>Status:</strong> {rx.status}</span>
                </div>

                <div className="rx-viewer-body">
                    {/* Render the PDF preview component */}
                    <RxPdfPreview
                        rxId={rx.id}
                        template={template}
                        pharmacyName="Your Pharmacy Name"
                        patientName={rx.patient}
                        doctorName={rx.doctor}
                        date={rx.date}
                        items={rx.items}
                    />
                </div>
            </div>
        </div>
    );
}