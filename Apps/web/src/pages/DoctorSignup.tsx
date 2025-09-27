import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button/Button';
import CustomInput from '../components/Inputs/CustomInput';
import '../styles/doctorSignup.css';
import PhoneInput, { COUNTRIES } from '../components/Inputs/PhoneInput';
import SearchSelect from '../components/Inputs/SearchSelect';
import FileUploader from '../components/Inputs/FileUploader';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY as string;
const SUPABASE_BUCKET = 'doctor-docs';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase env vars (REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY)');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const API_BASE = 'http://localhost:3000';

const SPECIALIZATIONS: { value: string; label: string }[] = [
    "Anesthesiology", "Cardiology", "Cardiothoracic Surgery", "Dermatology",
    "Emergency Medicine", "Endocrinology", "ENT (Otolaryngology)", "Family Medicine",
    "Gastroenterology", "General Surgery", "Geriatrics", "Hematology",
    "Infectious Disease", "Internal Medicine", "Nephrology", "Neurology",
    "Neurosurgery", "Obstetrics & Gynecology", "Oncology (Medical)", "Ophthalmology",
    "Orthopedic Surgery", "Pediatrics", "Physical Medicine & Rehabilitation",
    "Plastic Surgery", "Psychiatry", "Pulmonology", "Radiology (Diagnostic)",
    "Rheumatology", "Urology"
].map(s => ({ value: s, label: s }));

// ---- Types ----
interface DoctorSignupPayload {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: 'doctor';
    specialization: string;
    license_number: string;
    biography?: string;
    medical_license_url?: string;
    dr_idCard_url?: string;
    verification_status: 'pending' | 'verified' | 'rejected';
}

const initialState: DoctorSignupPayload = {
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'doctor',
    specialization: '',
    license_number: '',
    biography: '',
    medical_license_url: '',
    dr_idCard_url: '',
    verification_status: 'pending',
};

// ---- Helper UI ----
function StepHeader({ step, total }: { step: number; total: number }) {
    const pct = Math.round(((step + 1) / total) * 100);
    return (
        <div className="ds-step-header">
            <div className="ds-step-meta">
                <h1 className="ds-title">
                    <Link to={"/"}>
                        <img src="/logo32_primary.svg" alt="" />
                    </Link>
                    Register as Doctor
                </h1>
                <span className="ds-step-count">Step {step + 1} of {total}</span>
            </div>
            <div className="ds-progress">
                <div className="ds-progress-fill" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

function FieldRow({ children }: { children: React.ReactNode }) {
    return <div className="ds-row">{children}</div>;
}

// ---- Main Component ----
export default function DoctorSignup() {
    const navigate = useNavigate();
    const [form, setForm] = useState<DoctorSignupPayload>(initialState);
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const totalSteps = 5; // Intro, Account, Professional, Documents, Review

    // real-time field errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [licenseFile, setLicenseFile] = useState<File | null>(null);
    const [idCardFile, setIdCardFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const [dir, setDir] = useState<'left' | 'right'>('right');

    function fileNameFromUrl(url?: string) {
        if (!url) return "";
        try {
            const u = new URL(url);
            const last = u.pathname.split("/").pop() || "";
            return decodeURIComponent(last) || url;
        } catch {
            const clean = url.split("?")[0].split("#")[0];
            const last = clean.substring(clean.lastIndexOf("/") + 1);
            return decodeURIComponent(last || url);
        }
    }

    function formatBytes(bytes: number) {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    // validation helpers
    const validators = {
        name: (v: string) => {
            const parts = v.trim().split(/\s+/).filter(Boolean);
            if (parts.length < 2) return 'Enter your first and last name.';
            const ok = (s: string) => /^[A-Za-zÀ-ÖØ-öø-ÿ'’-]{2,}$/.test(s);
            if (!ok(parts[0]) || !ok(parts[1])) return 'Use at least 2 letters for first & last name.';
            return '';
        },
        email: (v: string) => (/^[^@]+@[^@]+\.[^@]+$/.test(v) ? '' : 'Enter a valid email address.'),
        phone: (v: string) => (v.startsWith('+') && /\+\d{6,}$/.test(v) ? '' : 'Enter a valid phone number.'),
        password: (v: string) => {
            if (v.length < 8) return 'Password must be at least 8 characters.';
            if (!/[A-Za-z]/.test(v) || !/[0-9]/.test(v)) return 'Use letters and numbers.';
            return '';
        },
        specialization: (v: string) => (v.trim() ? '' : 'Specialization is required.'),
        license_number: (v: string) => (v.trim() ? '' : 'License number is required.'),
    } as const;

    const runValidation = (key: keyof DoctorSignupPayload, value: string) => {
        const fn = (validators as any)[key];
        if (!fn) return;
        const msg = fn(value);
        setErrors((e) => ({ ...e, [key]: msg }));
    };

    const onChange = (key: keyof DoctorSignupPayload) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = (e.target as HTMLInputElement).value;
        setForm((f) => ({ ...f, [key]: value }));
        runValidation(key, value);
    };

    const accountValid = useMemo(() => (
        !validators.name(form.name) &&
        !validators.email(form.email) &&
        !validators.phone(form.phone) &&
        !validators.password(form.password)
    ), [form.name, form.email, form.phone, form.password]);

    const professionalValid = useMemo(() => (
        !validators.specialization(form.specialization) &&
        !validators.license_number(form.license_number)
    ), [form.specialization, form.license_number]);

    const docsValid = useMemo(() => {
        const hasLicense = !!licenseFile || !!form.medical_license_url;
        const hasIdCard = !!idCardFile || !!form.dr_idCard_url;
        return hasLicense && hasIdCard;
    }, [licenseFile, idCardFile, form.medical_license_url, form.dr_idCard_url]);

    const canNext = useMemo(() => {
        if (step === 1) return accountValid;
        if (step === 2) return professionalValid;
        if (step === 3) return docsValid;
        return true;
    }, [step, accountValid, professionalValid, docsValid, form.biography]);

    function nextStep() {
        setDir('right');
        setStep((s) => Math.min(totalSteps - 1, s + 1));
    }
    function prevStep() {
        setDir('left');
        setStep((s) => Math.max(0, s - 1));
    }

    async function uploadToSupabase(file: File, kind: 'license' | 'id'): Promise<string> {
        // make a safe filename
        const safe = file.name.replace(/[^A-Za-z0-9_.-]+/g, '_');
        const path = `doctors/${Date.now()}_${kind}_${safe}`;

        const { error } = await supabase
            .storage
            .from(SUPABASE_BUCKET)
            .upload(path, file, { contentType: file.type, upsert: true });

        if (error) throw new Error(error.message);

        const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
        return data.publicUrl;
    }

    async function submit() {
        setError(null);
        setLoading(true);
        setUploading(true);

        try {
            let payload: DoctorSignupPayload = {
                ...form,
                role: "doctor",
                verification_status: "pending",
                biography: form.biography || "—", // ✅ always send a string
            };

            if (licenseFile) {
                const licenseUrl = await uploadToSupabase(licenseFile, "license");
                payload.medical_license_url = licenseUrl;
            }

            if (idCardFile) {
                const idUrl = await uploadToSupabase(idCardFile, "id");
                payload.dr_idCard_url = idUrl;
            }

            console.log("Submitting payload:", JSON.stringify(payload, null, 2));
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok || data?.success === false || data?.status === "error") {
                throw new Error(data?.message || "Registration failed");
            }

            navigate("/register/verify-otp", { replace: true });
        } catch (e: any) {
            console.error("Register error:", e);
            setError(e.message ?? "Something went wrong");
        } finally {
            setUploading(false);
            setLoading(false);
        }
    }

    return (
        <div className="ds-container">
            <div className="ds-card">
                <StepHeader step={step} total={totalSteps} />

                {error && (
                    <div className="ds-alert ds-alert-error">{error}</div>
                )}

                <div key={step} className={`ds-step-anim ${dir}`}>
                    {/* Step 0: Intro */}
                    {step === 0 && (
                        <div className="ds-step">
                            <div className="ds-hero">
                                <div className="ds-hero-badge">Welcome</div>
                                <h2 className="ds-hero-title">Become a verified doctor on our platform</h2>
                                <p className="ds-hero-sub">Before you begin, please gather the following details and documents.</p>
                                <div className="ds-checklist">
                                    <div className="ds-checklist-col">
                                        <h3 className="ds-check-title">Account</h3>
                                        <ul>
                                            <li>Full name</li>
                                            <li>Work email</li>
                                            <li>Phone number</li>
                                            <li>Password (min 8 chars)</li>
                                        </ul>
                                    </div>
                                    <div className="ds-checklist-col">
                                        <h3 className="ds-check-title">Professional</h3>
                                        <ul>
                                            <li>Specialization</li>
                                            <li>Medical license number</li>
                                            <li>Short biography (optional)</li>
                                        </ul>
                                    </div>
                                    <div className="ds-checklist-col">
                                        <h3 className="ds-check-title">Documents</h3>
                                        <ul>
                                            <li>Medical license</li>
                                            <li>Doctor ID card</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            {/* <div className="ds-intro-cta">
                            <Button text="Start Registration" onClick={() => setStep(1)} />
                            <p className="ds-help">Already have an account? <Link className="ds-link" to="/login">Log in</Link></p>
                        </div> */}
                        </div>
                    )}

                    {/* Step 1: Account */}
                    {step === 1 && (
                        <div className="ds-step">
                            <h2 className="ds-section-title">Account</h2>
                            <FieldRow>
                                <CustomInput
                                    label="Full name"
                                    placeholder="Dr. Jane Smith"
                                    value={form.name}
                                    onChange={onChange('name')}
                                    variant={errors.name ? 'error' : 'normal'}
                                    message={errors.name}
                                />
                                <CustomInput
                                    label="Email"
                                    type="email"
                                    placeholder="dr.jane@example.com"
                                    value={form.email}
                                    onChange={onChange('email')}
                                    variant={errors.email ? 'error' : 'normal'}
                                    message={errors.email}
                                />
                            </FieldRow>
                            <FieldRow>
                                <PhoneInput
                                    label="Phone"
                                    value={form.phone}
                                    onChange={(e164) => {
                                        setForm(f => ({ ...f, phone: e164 }));
                                        // keep your existing validation plumbing:
                                        runValidation('phone', e164);
                                    }}
                                    variant={errors.phone ? 'error' : 'normal'}
                                    message={errors.phone}
                                />
                                <CustomInput
                                    label="Password"
                                    type="password"
                                    placeholder="At least 8 characters"
                                    value={form.password}
                                    onChange={onChange('password')}
                                    variant={errors.password ? 'error' : 'normal'}
                                    message={errors.password}
                                />
                            </FieldRow>
                        </div>
                    )}

                    {/* Step 2: Professional */}
                    {step === 2 && (
                        <div className="ds-step">
                            <h2 className="ds-section-title">Professional Details</h2>
                            <FieldRow>
                                <SearchSelect
                                    label="Specialization"
                                    placeholder="Select specialization"
                                    searchPlaceholder="Search specialization"
                                    options={SPECIALIZATIONS}
                                    value={form.specialization}
                                    onChange={(val: string | { value: string; label: string }) => {
                                        const specializationValue =
                                            typeof val === "string" ? val : val?.value || "";

                                        setForm(f => ({ ...f, specialization: specializationValue }));
                                        setErrors(e => ({
                                            ...e,
                                            specialization: specializationValue ? "" : "Specialization is required.",
                                        }));
                                    }}
                                    variant={errors.specialization ? 'error' : 'normal'}
                                    message={errors.specialization}
                                    creatable
                                    showOtherRow
                                />
                                <CustomInput
                                    label="License Number"
                                    placeholder="DOC123456"
                                    value={form.license_number}
                                    onChange={onChange('license_number')}
                                    variant={errors.license_number ? 'error' : 'normal'}
                                    message={errors.license_number}
                                />
                            </FieldRow>
                            <div className="ds-textarea">
                                <CustomInput
                                    as="textarea"
                                    label="Biography"
                                    placeholder="Short bio"
                                    value={form.biography ?? ""}
                                    onChange={onChange("biography")}
                                    optional
                                    rows={4}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Documents */}
                    {step === 3 && (
                        <div className="ds-step">
                            <h2 className="ds-section-title">Documents</h2>
                            <p className="ds-help">
                                Upload your medical license and ID card. Accepted: images (JPG/PNG/WebP) or PDF.
                            </p>

                            <FieldRow>
                                <FileUploader
                                    label="Medical License"
                                    description="Image or PDF"
                                    value={licenseFile}
                                    onChange={setLicenseFile}
                                // optional
                                />
                                <FileUploader
                                    label="ID Card"
                                    description="Image or PDF"
                                    value={idCardFile}
                                    onChange={setIdCardFile}
                                // optional
                                />
                            </FieldRow>
                        </div>
                    )}

                    {/* Step 4: Review */}
                    {step === 4 && (
                        <div className="ds-step">
                            <h2 className="ds-section-title">Review</h2>
                            <div className="ds-review-grid">
                                <div className="ds-review-card">
                                    <h3 className="ds-review-title">Account</h3>
                                    <div><span className="ds-muted">Name:</span> {form.name}</div>
                                    <div><span className="ds-muted">Email:</span> {form.email}</div>
                                    <div><span className="ds-muted">Phone:</span> {form.phone}</div>
                                </div>
                                <div className="ds-review-card">
                                    <h3 className="ds-review-title">Professional</h3>
                                    <div><span className="ds-muted">Specialization:</span> {form.specialization}</div>
                                    <div><span className="ds-muted">License No.:</span> {form.license_number}</div>
                                    {form.biography && <div className="ds-spaced"><span className="ds-muted">Bio:</span> {form.biography}</div>}
                                </div>
                                <div className="ds-review-card ds-col-span-2">
                                    <h3 className="ds-review-title">Documents</h3>

                                    <div className="ds-ellipsis">
                                        <span className="ds-muted">License:</span>{" "}
                                        {licenseFile
                                            ? <>
                                                {licenseFile.name} <span className="ds-hint">• {formatBytes(licenseFile.size)}</span>
                                            </>
                                            : (fileNameFromUrl(form.medical_license_url) || "—")}
                                    </div>

                                    <div className="ds-ellipsis">
                                        <span className="ds-muted">ID Card:</span>{" "}
                                        {idCardFile
                                            ? <>
                                                {idCardFile.name} <span className="ds-hint">• {formatBytes(idCardFile.size)}</span>
                                            </>
                                            : (fileNameFromUrl(form.dr_idCard_url) || "—")}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="ds-footer">
                    <div className="ds-auth-hint">
                        Already have an account? <Link className="ds-link" to="/login">Log in</Link>
                    </div>
                    <div className="ds-actions">
                        {step > 0 && (
                            <Button variant="secondary" text="Back" onClick={prevStep} />
                        )}
                        {step < totalSteps - 1 && (
                            <Button
                                text={step === 0 ? 'Start Registration' : 'Next'}
                                disabled={step !== 0 && !canNext}
                                onClick={nextStep}
                            />
                        )}
                        {step === totalSteps - 1 && (
                            <Button text={loading ? 'Submitting…' : 'Create account'} disabled={loading || uploading} onClick={submit} />
                        )}
                    </div>
                </div>
            </div>

            <p className="ds-legal">By creating an account you agree to our Terms and Privacy Policy.</p>
        </div>
    );
}