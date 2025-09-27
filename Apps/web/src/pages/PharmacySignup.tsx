import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Button from "../components/Button/Button";
import CustomInput from "../components/Inputs/CustomInput";
import PhoneInput from "../components/Inputs/PhoneInput";
import FileUploader from "../components/Inputs/FileUploader";
import { createClient } from "@supabase/supabase-js";
import "../styles/doctorSignup.css";

// ---- Supabase setup ----
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY as string;
const SUPABASE_BUCKET = "pharmacy-docs";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase env vars (REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY)");
}
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const API_BASE = "http://localhost:3000";

// ---- Types ----
interface PharmacySignupPayload {
    name: string;                // contact person name
    email: string;
    password: string;
    phone: string;
    role: "pharmacy";
    pharmacy_name: string;
    address: string;
    license_number: string;
    commercial_register_url?: string;
    logo_url?: string;
    verification_status: "pending" | "verified" | "rejected";
}

const initialState: PharmacySignupPayload = {
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "pharmacy",
    pharmacy_name: "",
    address: "",
    license_number: "",
    commercial_register_url: "",
    logo_url: "",
    verification_status: "pending",
};

// ---- Helper UI (copied style from DoctorSignup) ----
function StepHeader({ step, total }: { step: number; total: number }) {
    const pct = Math.round(((step + 1) / total) * 100);
    return (
        <div className="ds-step-header">
            <div className="ds-step-meta">
                <h1 className="ds-title">
                    <Link to={"/"}>
                        <img src="/logo32_primary.svg" alt="" />
                    </Link>
                    Register Pharmacy
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

// ---- Main Component ----
export default function PharmacySignup() {
    const navigate = useNavigate();
    const [form, setForm] = useState<PharmacySignupPayload>(initialState);

    // Steps: Intro, Account, Pharmacy, Documents, Review
    const totalSteps = 5;
    const [step, setStep] = useState(0);
    const [dir, setDir] = useState<"left" | "right">("right");

    // state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // files
    const [licenseFile, setLicenseFile] = useState<File | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);

    // validation (same style as doctor)
    const validators = {
        name: (v: string) => (v.trim() ? "" : "Contact name is required."),
        email: (v: string) => (/^[^@]+@[^@]+\.[^@]+$/.test(v) ? "" : "Enter a valid email address."),
        phone: (v: string) => (v.startsWith("+") && /\+\d{6,}$/.test(v) ? "" : "Enter a valid phone number."),
        password: (v: string) => {
            if (v.length < 8) return "Password must be at least 8 characters.";
            if (!/[A-Za-z]/.test(v) || !/[0-9]/.test(v)) return "Use letters and numbers.";
            return "";
        },
        pharmacy_name: (v: string) => (v.trim() ? "" : "Pharmacy name is required."),
        address: (v: string) => (v.trim() ? "" : "Address is required."),
        license_number: (v: string) => (v.trim() ? "" : "License number is required."),
    } as const;

    const runValidation = (key: keyof PharmacySignupPayload, value: string) => {
        const fn = (validators as any)[key];
        if (!fn) return;
        const msg = fn(value);
        setErrors((e) => ({ ...e, [key]: msg }));
    };

    const onChange =
        (key: keyof PharmacySignupPayload) =>
            (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                const value = (e.target as HTMLInputElement).value;
                setForm((f) => ({ ...f, [key]: value }));
                runValidation(key, value);
            };

    const accountValid = useMemo(
        () =>
            !validators.name(form.name) &&
            !validators.email(form.email) &&
            !validators.phone(form.phone) &&
            !validators.password(form.password),
        [form.name, form.email, form.phone, form.password]
    );

    const pharmacyValid = useMemo(
        () =>
            !validators.pharmacy_name(form.pharmacy_name) &&
            !validators.address(form.address) &&
            !validators.license_number(form.license_number),
        [form.pharmacy_name, form.address, form.license_number]
    );

    const docsValid = useMemo(() => !!licenseFile || !!form.commercial_register_url, [licenseFile, form.commercial_register_url]);

    const canNext = useMemo(() => {
        if (step === 1) return accountValid;
        if (step === 2) return pharmacyValid;
        if (step === 3) return docsValid;
        return true;
    }, [step, accountValid, pharmacyValid, docsValid]);

    // upload helper
    async function uploadToSupabase(file: File, kind: "license" | "logo"): Promise<string> {
        const safe = file.name.replace(/[^A-Za-z0-9_.-]+/g, "_");
        const path = `pharmacies/${Date.now()}_${kind}_${safe}`;

        const { error } = await supabase.storage
            .from(SUPABASE_BUCKET)
            .upload(path, file, { contentType: file.type, upsert: true });

        if (error) throw new Error(error.message);

        const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
        return data.publicUrl;
    }

    // submit
    async function submit() {
        setError(null);
        setLoading(true);
        setUploading(true);

        try {
            const payload: PharmacySignupPayload = {
                ...form,
                role: "pharmacy",
                verification_status: "pending",
            };

            // ensure required docs presence (backend tends to require them)
            if (licenseFile) {
                payload.commercial_register_url = await uploadToSupabase(licenseFile, "license");
            }
            if (logoFile) {
                payload.logo_url = await uploadToSupabase(logoFile, "logo");
            }

            // client-side guard
            if (!payload.commercial_register_url) {
                throw new Error("Please upload your commercial register/license document.");
            }

            // send to the same /auth/register used elsewhere
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok || data?.success === false || data?.status === "error") {
                throw new Error(data?.message || "Registration failed");
            }

            // if your flow uses OTP verify, route there; else use success page
            // navigate("/register/verify-otp", { replace: true });
            navigate("/register/success", { replace: true });
        } catch (e: any) {
            setError(e.message ?? "Something went wrong");
        } finally {
            setUploading(false);
            setLoading(false);
        }
    }

    function nextStep() {
        setDir("right");
        setStep((s) => Math.min(totalSteps - 1, s + 1));
    }
    function prevStep() {
        setDir("left");
        setStep((s) => Math.max(0, s - 1));
    }

    return (
        <div className="ds-container">
            <div className="ds-card">
                <StepHeader step={step} total={totalSteps} />

                {error && <div className="ds-alert ds-alert-error">{error}</div>}

                <div key={step} className={`ds-step-anim ${dir}`}>
                    {/* Step 0: Intro (same design as DoctorSignup) */}
                    {step === 0 && (
                        <div className="ds-step">
                            <div className="ds-hero">
                                <div className="ds-hero-badge">Welcome</div>
                                <h2 className="ds-hero-title">Join our pharmacy network</h2>
                                <p className="ds-hero-sub">Please prepare these details and documents before you begin.</p>
                                <div className="ds-checklist">
                                    <div className="ds-checklist-col">
                                        <h3 className="ds-check-title">Account</h3>
                                        <ul>
                                            <li>Contact person name</li>
                                            <li>Work email</li>
                                            <li>Phone number</li>
                                            <li>Password (min 8 chars)</li>
                                        </ul>
                                    </div>
                                    <div className="ds-checklist-col">
                                        <h3 className="ds-check-title">Pharmacy</h3>
                                        <ul>
                                            <li>Pharmacy name</li>
                                            <li>Address</li>
                                            <li>Pharmacy license number</li>
                                        </ul>
                                    </div>
                                    <div className="ds-checklist-col">
                                        <h3 className="ds-check-title">Documents</h3>
                                        <ul>
                                            <li>Commercial register / pharmacy license</li>
                                            <li>Logo (optional)</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Account */}
                    {step === 1 && (
                        <div className="ds-step">
                            <h2 className="ds-section-title">Account</h2>
                            <FieldRow>
                                <CustomInput
                                    label="Contact Name"
                                    placeholder="John Doe"
                                    value={form.name}
                                    onChange={onChange("name")}
                                    variant={errors.name ? "error" : "normal"}
                                    message={errors.name}
                                />
                                <CustomInput
                                    label="Email"
                                    type="email"
                                    placeholder="contact@pharmacy.com"
                                    value={form.email}
                                    onChange={onChange("email")}
                                    variant={errors.email ? "error" : "normal"}
                                    message={errors.email}
                                />
                            </FieldRow>
                            <FieldRow>
                                <PhoneInput
                                    label="Phone"
                                    value={form.phone}
                                    onChange={(e164) => {
                                        setForm((f) => ({ ...f, phone: e164 }));
                                        runValidation("phone", e164);
                                    }}
                                    variant={errors.phone ? "error" : "normal"}
                                    message={errors.phone}
                                />
                                <CustomInput
                                    label="Password"
                                    type="password"
                                    placeholder="At least 8 characters"
                                    value={form.password}
                                    onChange={onChange("password")}
                                    variant={errors.password ? "error" : "normal"}
                                    message={errors.password}
                                />
                            </FieldRow>
                        </div>
                    )}

                    {/* Step 2: Pharmacy details */}
                    {step === 2 && (
                        <div className="ds-step">
                            <h2 className="ds-section-title">Pharmacy Details</h2>
                            <FieldRow>
                                <CustomInput
                                    label="Pharmacy Name"
                                    placeholder="HealthPlus Pharmacy"
                                    value={form.pharmacy_name}
                                    onChange={onChange("pharmacy_name")}
                                    variant={errors.pharmacy_name ? "error" : "normal"}
                                    message={errors.pharmacy_name}
                                />
                                <CustomInput
                                    label="License Number"
                                    placeholder="PHR-123456"
                                    value={form.license_number}
                                    onChange={onChange("license_number")}
                                    variant={errors.license_number ? "error" : "normal"}
                                    message={errors.license_number}
                                />
                            </FieldRow>
                            <FieldRow>
                                <CustomInput
                                    label="Address"
                                    placeholder="Street, City, Country"
                                    value={form.address}
                                    onChange={onChange("address")}
                                    variant={errors.address ? "error" : "normal"}
                                    message={errors.address}
                                />
                            </FieldRow>
                        </div>
                    )}

                    {/* Step 3: Documents */}
                    {step === 3 && (
                        <div className="ds-step">
                            <h2 className="ds-section-title">Documents</h2>
                            <p className="ds-help">
                                Upload your commercial register / pharmacy license (PDF or image). Logo is optional.
                            </p>
                            <FieldRow>
                                <FileUploader
                                    label="Commercial Register / License"
                                    description="PDF or Image"
                                    value={licenseFile}
                                    onChange={setLicenseFile}
                                />
                                <FileUploader
                                    label="Logo"
                                    description="PNG/JPG/SVG"
                                    value={logoFile}
                                    onChange={setLogoFile}
                                    optional
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
                                    <h3 className="ds-review-title">Pharmacy</h3>
                                    <div><span className="ds-muted">Pharmacy:</span> {form.pharmacy_name}</div>
                                    <div><span className="ds-muted">License No.:</span> {form.license_number}</div>
                                    <div><span className="ds-muted">Address:</span> {form.address}</div>
                                </div>
                                <div className="ds-review-card ds-col-span-2">
                                    <h3 className="ds-review-title">Documents</h3>
                                    <div className="ds-ellipsis">
                                        <span className="ds-muted">Commercial Register / License:</span>{" "}
                                        {licenseFile ? (
                                            <>
                                                {licenseFile.name} <span className="ds-hint">• {formatBytes(licenseFile.size)}</span>
                                            </>
                                        ) : (fileNameFromUrl(form.commercial_register_url) || "—")}
                                    </div>
                                    <div className="ds-ellipsis">
                                        <span className="ds-muted">Logo:</span>{" "}
                                        {logoFile ? (
                                            <>
                                                {logoFile.name} <span className="ds-hint">• {formatBytes(logoFile.size)}</span>
                                            </>
                                        ) : (fileNameFromUrl(form.logo_url) || "—")}
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
                                text={step === 0 ? "Start Registration" : "Next"}
                                disabled={step !== 0 && !canNext}
                                onClick={() => {
                                    setDir("right");
                                    setStep((s) => Math.min(totalSteps - 1, s + 1));
                                }}
                            />
                        )}
                        {step === totalSteps - 1 && (
                            <Button
                                text={loading ? "Submitting…" : "Create account"}
                                disabled={loading || uploading}
                                onClick={submit}
                            />
                        )}
                    </div>
                </div>
            </div>

            <p className="ds-legal">By creating an account you agree to our Terms and Privacy Policy.</p>
        </div>
    );
}