// src/pages/AssistantSignup.tsx
import React, { useState, useMemo } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import Button from "../components/Button/Button";
import CustomInput from "../components/Inputs/CustomInput";
import PhoneInput from "../components/Inputs/PhoneInput";
import "../styles/doctorSignup.css";

const API_BASE = "http://localhost:3000";

// ---- Types ----
interface AssistantSignupPayload {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: "assistant";
    verification_status: "pending" | "verified" | "rejected";
    inviteId?: string; // from query string if exists
}

const initialState: AssistantSignupPayload = {
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "assistant",
    verification_status: "pending",
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
                    Register as Assistant
                </h1>
                <span className="ds-step-count">
                    Step {step + 1} of {total}
                </span>
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
export default function AssistantSignup() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const inviteId = searchParams.get("inviteId") || undefined;

    const [form, setForm] = useState<AssistantSignupPayload>({
        ...initialState,
        inviteId,
    });
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dir, setDir] = useState<"left" | "right">("right");

    const totalSteps = 3; // Intro, Account, Review

    // validation helpers
    const validators = {
        name: (v: string) =>
            v.trim().length >= 2 ? "" : "Enter your full name (min 2 chars).",
        email: (v: string) =>
            /^[^@]+@[^@]+\.[^@]+$/.test(v) ? "" : "Enter a valid email.",
        phone: (v: string) =>
            v.startsWith("+") && /\+\d{6,}$/.test(v)
                ? ""
                : "Enter a valid phone number.",
        password: (v: string) =>
            v.length >= 8 && /[A-Za-z]/.test(v) && /[0-9]/.test(v)
                ? ""
                : "Password must be 8+ chars with letters and numbers.",
    };

    const [errors, setErrors] = useState<Record<string, string>>({});

    const runValidation = (key: keyof AssistantSignupPayload, value: string) => {
        const fn = (validators as any)[key];
        if (!fn) return;
        const msg = fn(value);
        setErrors((e) => ({ ...e, [key]: msg }));
    };

    const onChange =
        (key: keyof AssistantSignupPayload) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                setForm((f) => ({ ...f, [key]: value }));
                runValidation(key, value);
            };

    const accountValid = useMemo(
        () =>
            !validators.name(form.name) &&
            !validators.email(form.email) &&
            !validators.phone(form.phone) &&
            !validators.password(form.password),
        [form]
    );

    const canNext = step === 1 ? accountValid : true;

    function nextStep() {
        setDir("right");
        setStep((s) => Math.min(totalSteps - 1, s + 1));
    }
    function prevStep() {
        setDir("left");
        setStep((s) => Math.max(0, s - 1));
    }

    async function submit() {
        setError(null);
        setLoading(true);
        try {
            const payload: AssistantSignupPayload = { ...form };

            const res = await fetch(`${API_BASE}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok || data?.success === false || data?.status === "error") {
                throw new Error(data?.message || "Registration failed");
            }

            navigate("/register/success", { replace: true });
        } catch (e: any) {
            setError(e.message ?? "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="ds-container">
            <div className="ds-card">
                <StepHeader step={step} total={totalSteps} />

                {error && <div className="ds-alert ds-alert-error">{error}</div>}

                <div key={step} className={`ds-step-anim ${dir}`}>
                    {/* Step 0: Intro */}
                    {step === 0 && (
                        <div className="ds-step">
                            <div className="ds-hero">
                                <div className="ds-hero-badge">Welcome</div>
                                <h2 className="ds-hero-title">
                                    Join as an Assistant on our platform
                                </h2>
                                <p className="ds-hero-sub">
                                    Assistants help doctors manage appointments and workplaces.
                                </p>
                                {inviteId && (
                                    <p className="ds-hint">
                                        You are signing up with invite ID:{" "}
                                        <span className="font-mono">{inviteId}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 1: Account */}
                    {step === 1 && (
                        <div className="ds-step">
                            <h2 className="ds-section-title">Account</h2>
                            <FieldRow>
                                <CustomInput
                                    label="Full name"
                                    placeholder="Jane Smith"
                                    value={form.name}
                                    onChange={onChange("name")}
                                    variant={errors.name ? "error" : "normal"}
                                    message={errors.name}
                                />
                                <CustomInput
                                    label="Email"
                                    type="email"
                                    placeholder="assistant@example.com"
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

                    {/* Step 2: Review */}
                    {step === 2 && (
                        <div className="ds-step">
                            <h2 className="ds-section-title">Review</h2>
                            <div className="ds-review-grid">
                                <div className="ds-review-card">
                                    <h3 className="ds-review-title">Account</h3>
                                    <div>
                                        <span className="ds-muted">Name:</span> {form.name}
                                    </div>
                                    <div>
                                        <span className="ds-muted">Email:</span> {form.email}
                                    </div>
                                    <div>
                                        <span className="ds-muted">Phone:</span> {form.phone}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="ds-footer">
                    <div className="ds-auth-hint">
                        Already have an account?{" "}
                        <Link className="ds-link" to="/login">
                            Log in
                        </Link>
                    </div>
                    <div className="ds-actions">
                        {step > 0 && (
                            <Button variant="secondary" text="Back" onClick={prevStep} />
                        )}
                        {step < totalSteps - 1 && (
                            <Button
                                text={step === 0 ? "Start Registration" : "Next"}
                                disabled={step !== 0 && !canNext}
                                onClick={nextStep}
                            />
                        )}
                        {step === totalSteps - 1 && (
                            <Button
                                text={loading ? "Submitting…" : "Create account"}
                                disabled={loading}
                                onClick={submit}
                            />
                        )}
                    </div>
                </div>
            </div>

            <p className="ds-legal">
                By creating an account you agree to our Terms and Privacy Policy.
            </p>
        </div>
    );
}