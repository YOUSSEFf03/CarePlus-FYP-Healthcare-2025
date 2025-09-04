import React, { useEffect, useMemo, useState } from "react";
import CustomInput from "../../components/Inputs/CustomInput";
import PhoneInput from "../../components/Inputs/PhoneInput";
import SearchSelect, { Option } from "../../components/Inputs/SearchSelect";
import ToggleSwitch from "../../components/Inputs/ToggleSwitch";
import FileUploader from "../../components/Inputs/FileUploader";
import Button from "../../components/Button/Button";

import "../../styles/doctorProfile.css";

type ProfileStore = {
    name: string;
    phone: string;               // E.164 "+..."
    specialization: string;
    email: string;
    bio: string;
    licenseNumber: string;
    // persisted previews (data URLs)
    licenseUrl: string | null;
    licenseName: string | null;
    idUrl: string | null;
    idName: string | null;
    // example boolean using ToggleSwitch
    publicContact: boolean;
};

const STORAGE_KEY = "doctor_profile_v1";

const SPECIALTIES: Option[] = [
    { value: "Cardiology", label: "Cardiology" },
    { value: "Dermatology", label: "Dermatology" },
    { value: "Endocrinology", label: "Endocrinology" },
    { value: "Family Medicine", label: "Family Medicine" },
    { value: "Gastroenterology", label: "Gastroenterology" },
    { value: "General Surgery", label: "General Surgery" },
    { value: "Neurology", label: "Neurology" },
    { value: "Obstetrics & Gynecology", label: "Obstetrics & Gynecology" },
    { value: "Oncology", label: "Oncology" },
    { value: "Ophthalmology", label: "Ophthalmology" },
    { value: "Orthopedics", label: "Orthopedics" },
    { value: "Pediatrics", label: "Pediatrics" },
    { value: "Psychiatry", label: "Psychiatry" },
    { value: "Urology", label: "Urology" },
];

function loadStore(): ProfileStore {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { }
    return {
        name: "",
        phone: "",
        specialization: "",
        email: "",
        bio: "",
        licenseNumber: "",
        licenseUrl: null,
        licenseName: null,
        idUrl: null,
        idName: null,
        publicContact: false,
    };
}

function saveStore(v: ProfileStore) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
}

function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = reject;
        r.readAsDataURL(file);
    });
}

export default function DoctorProfile() {
    const [data, setData] = useState<ProfileStore>(loadStore());
    const [editing, setEditing] = useState(false);

    // transient files only while editing
    const [licenseFile, setLicenseFile] = useState<File | null>(null);
    const [idFile, setIdFile] = useState<File | null>(null);

    // local, editable copies while in edit mode
    const [draft, setDraft] = useState<ProfileStore>(data);

    useEffect(() => {
        if (editing) setDraft(data);
    }, [editing]); // eslint-disable-line

    // simple validation
    const errors = useMemo(() => {
        const e: Partial<Record<keyof ProfileStore, string>> = {};
        if (!draft.name.trim()) e.name = "Required";
        if (!draft.specialization.trim()) e.specialization = "Required";
        if (!draft.email.trim() || !/^\S+@\S+\.\S+$/.test(draft.email)) e.email = "Enter a valid email";
        if (!draft.phone || !draft.phone.startsWith("+") || draft.phone.replace(/\D/g, "").length < 7) {
            e.phone = "Enter a valid international phone";
        }
        if (!draft.licenseNumber.trim()) e.licenseNumber = "Required";
        return e;
    }, [draft]);

    const hasErrors = Object.keys(errors).length > 0;

    async function onSave() {
        let next = { ...draft };

        // convert uploaded files to data URLs for persistence/preview
        if (licenseFile) {
            const url = await fileToDataUrl(licenseFile);
            next.licenseUrl = url;
            next.licenseName = licenseFile.name;
        }
        if (idFile) {
            const url = await fileToDataUrl(idFile);
            next.idUrl = url;
            next.idName = idFile.name;
        }

        saveStore(next);
        setData(next);
        setEditing(false);

        // clear transient files
        setLicenseFile(null);
        setIdFile(null);
    }

    function onCancel() {
        setEditing(false);
        setLicenseFile(null);
        setIdFile(null);
    }

    // Helpers for read-only file display
    function renderFilePreview(url: string | null, name: string | null) {
        if (!url || !name) return <span className="muted">—</span>;
        const isImage = url.startsWith("data:image/");
        return (
            <div className="file-preview">
                {isImage ? (
                    <img src={url} alt={name} />
                ) : (
                    <div className="pdf-chip">PDF</div>
                )}
                <a href={url} target="_blank" rel="noreferrer" className="file-link">{name}</a>
            </div>
        );
    }

    return (
        <div className="profile-wrap">
            <header className="profile-header">
                <h1>Profile</h1>

                {!editing ? (
                    <div className="header-actions">
                        <ToggleSwitch
                            label="Show contact info to patients"
                            checked={data.publicContact}
                            onChange={(v) => {
                                const next = { ...data, publicContact: v };
                                setData(next);
                                saveStore(next);
                            }}
                        />
                        <Button variant="primary" text="Edit" onClick={() => setEditing(true)} />
                    </div>
                ) : (
                    <div className="header-actions">
                        <Button variant="ghost" text="Cancel" onClick={onCancel} />
                        <Button
                            variant="primary"
                            text="Save changes"
                            onClick={onSave}
                            disabled={hasErrors}
                            title={hasErrors ? "Fix errors before saving" : undefined}
                        />
                    </div>
                )}
            </header>

            {!editing && (
                <section className="card">
                    <div className="grid">
                        <div className="item">
                            <label>Name</label>
                            <div className="value">{data.name || <span className="muted">—</span>}</div>
                        </div>
                        <div className="item">
                            <label>Phone</label>
                            <div className="value">{data.phone || <span className="muted">—</span>}</div>
                        </div>
                        <div className="item">
                            <label>Specialization</label>
                            <div className="value">{data.specialization || <span className="muted">—</span>}</div>
                        </div>
                        <div className="item">
                            <label>Email</label>
                            <div className="value">{data.email || <span className="muted">—</span>}</div>
                        </div>
                        <div className="item span-2">
                            <label>Bio</label>
                            <div className="value">{data.bio || <span className="muted">—</span>}</div>
                        </div>
                        <div className="item">
                            <label>Medical License #</label>
                            <div className="value">{data.licenseNumber || <span className="muted">—</span>}</div>
                        </div>
                        <div className="item">
                            <label>Medical License (PDF/Image)</label>
                            <div className="value">{renderFilePreview(data.licenseUrl, data.licenseName)}</div>
                        </div>
                        <div className="item">
                            <label>Doctor ID Card (PDF/Image)</label>
                            <div className="value">{renderFilePreview(data.idUrl, data.idName)}</div>
                        </div>
                    </div>
                </section>
            )}

            {editing && (
                <form className="card form">
                    <div className="grid">
                        <div className="item">
                            <CustomInput
                                label="Name"
                                placeholder="Dr. Jane Doe"
                                value={draft.name}
                                onChange={(e) => setDraft({ ...draft, name: (e.target as HTMLInputElement).value })}
                                message={errors.name}
                                variant={errors.name ? "error" : "normal"}
                            />
                        </div>

                        <div className="item">
                            <PhoneInput
                                label="Phone"
                                value={draft.phone}
                                onChange={(v) => setDraft({ ...draft, phone: v })}
                                message={errors.phone}
                                variant={errors.phone ? "error" : "normal"}
                            />
                        </div>

                        <div className="item">
                            <SearchSelect
                                label="Specialization"
                                placeholder="Select specialization"
                                options={SPECIALTIES}
                                value={draft.specialization}
                                onChange={(v) => setDraft({ ...draft, specialization: v })}
                                message={errors.specialization}
                                variant={errors.specialization ? "error" : "normal"}
                                creatable
                                showOtherRow
                            />
                        </div>

                        <div className="item">
                            <CustomInput
                                label="Email"
                                type="email"
                                placeholder="doctor@example.com"
                                value={draft.email}
                                onChange={(e) => setDraft({ ...draft, email: (e.target as HTMLInputElement).value })}
                                message={errors.email}
                                variant={errors.email ? "error" : "normal"}
                            />
                        </div>

                        <div className="item span-2">
                            <CustomInput
                                as="textarea"
                                label="Bio"
                                placeholder="Short professional bio…"
                                rows={5}
                                maxLength={1000}
                                value={draft.bio}
                                onChange={(e) => setDraft({ ...draft, bio: (e.target as HTMLTextAreaElement).value })}
                            />
                        </div>

                        <div className="item">
                            <CustomInput
                                label="Medical License #"
                                placeholder="e.g. LB-123456"
                                value={draft.licenseNumber}
                                onChange={(e) =>
                                    setDraft({ ...draft, licenseNumber: (e.target as HTMLInputElement).value })
                                }
                                message={errors.licenseNumber}
                                variant={errors.licenseNumber ? "error" : "normal"}
                            />
                        </div>

                        <div className="item">
                            <FileUploader
                                label="Medical License (PDF/Image)"
                                description="Upload an image or PDF — max 10MB"
                                value={licenseFile}
                                onChange={setLicenseFile}
                            />
                            {/* existing (persisted) file, if any */}
                            {data.licenseUrl && !licenseFile && (
                                <div className="persisted-file">
                                    <span className="muted">Current:</span>{" "}
                                    <a href={data.licenseUrl} target="_blank" rel="noreferrer">
                                        {data.licenseName}
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="item">
                            <FileUploader
                                label="Doctor ID Card (PDF/Image)"
                                description="Upload an image or PDF — max 10MB"
                                value={idFile}
                                onChange={setIdFile}
                            />
                            {data.idUrl && !idFile && (
                                <div className="persisted-file">
                                    <span className="muted">Current:</span>{" "}
                                    <a href={data.idUrl} target="_blank" rel="noreferrer">
                                        {data.idName}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}