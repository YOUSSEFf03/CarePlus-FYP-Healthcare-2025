import React, { useEffect, useRef, useState } from "react";
import CustomText from "../../components/Text/CustomText";
import Button from "../../components/Button/Button";
import "../../styles/pharmacyProfile.css";

type Hours = {
    mon: string; tue: string; wed: string; thu: string; fri: string; sat: string; sun: string;
};

type PharmacyProfile = {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    licenseNo: string;
    supportsDelivery: boolean;
    deliveryRadiusKm: number;
    notes: string;
    hours: Hours;
    logoDataUrl?: string;
};

const defaultHours: Hours = {
    mon: "09:00–17:00", tue: "09:00–17:00", wed: "09:00–17:00",
    thu: "09:00–17:00", fri: "09:00–17:00", sat: "10:00–14:00", sun: "Closed",
};

const emptyProfile: PharmacyProfile = {
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    licenseNo: "",
    supportsDelivery: true,
    deliveryRadiusKm: 5,
    notes: "",
    hours: defaultHours,
    logoDataUrl: undefined,
};

const LS_KEY = "pharmacyProfile";

export default function PharmacyProfilePage() {
    const [profile, setProfile] = useState<PharmacyProfile>(emptyProfile);
    const [saving, setSaving] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (raw) setProfile({ ...emptyProfile, ...JSON.parse(raw) });
        } catch {
            // ignore
        }
    }, []);

    const update = <K extends keyof PharmacyProfile>(k: K, v: PharmacyProfile[K]) =>
        setProfile(p => ({ ...p, [k]: v }));

    const updateHours = (k: keyof Hours, v: string) =>
        setProfile(p => ({ ...p, hours: { ...p.hours, [k]: v } }));

    const onPickLogo = async (f?: File | null) => {
        if (!f) return;
        const dataUrl = await fToDataUrl(f);
        update("logoDataUrl", dataUrl);
    };

    const onSave = async () => {
        setSaving(true);
        try {
            localStorage.setItem(LS_KEY, JSON.stringify(profile));
            // tiny pause for UX
            await new Promise(r => setTimeout(r, 450));
        } finally {
            setSaving(false);
        }
    };

    const onReset = () => {
        setProfile(emptyProfile);
        localStorage.removeItem(LS_KEY);
    };

    return (
        <div className="profile-page">
            <div className="profile-header">
                <CustomText variant="text-heading-H2">Pharmacy profile</CustomText>
                <div className="profile-header-actions">
                    <Button variant="secondary" text="Reset" onClick={onReset} />
                    <Button text={saving ? "Saving…" : "Save changes"} onClick={onSave} />
                </div>
            </div>

            <div className="profile-grid">
                {/* Identity card */}
                <section className="card">
                    <div className="card-title">Identity</div>

                    <div className="logo-row">
                        <div className="logo-pharmacy">
                            {profile.logoDataUrl ? (
                                <img src={profile.logoDataUrl} alt="Pharmacy logo" />
                            ) : (
                                <div className="logo-placeholder">Logo</div>
                            )}
                        </div>
                        <div>
                            <div className="field">
                                <label>Pharmacy name</label>
                                <input
                                    value={profile.name}
                                    onChange={e => update("name", e.target.value)}
                                    placeholder="City Care Pharmacy"
                                />
                            </div>
                            <div className="btns-inline">
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={e => onPickLogo(e.target.files?.[0] || null)}
                                />
                                <Button
                                    variant="secondary"
                                    text="Upload logo"
                                    onClick={() => fileRef.current?.click()}
                                />
                                {profile.logoDataUrl && (
                                    <Button
                                        variant="ghost"
                                        text="Remove"
                                        onClick={() => update("logoDataUrl", undefined)}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid-2">
                        <div className="field">
                            <label>Email</label>
                            <input
                                type="email"
                                value={profile.email}
                                onChange={e => update("email", e.target.value)}
                                placeholder="pharmacy@example.com"
                            />
                        </div>
                        <div className="field">
                            <label>Phone</label>
                            <input
                                value={profile.phone}
                                onChange={e => update("phone", e.target.value)}
                                placeholder="+1 555 123 4567"
                            />
                        </div>
                    </div>

                    <div className="grid-2">
                        <div className="field">
                            <label>Address</label>
                            <input
                                value={profile.address}
                                onChange={e => update("address", e.target.value)}
                                placeholder="123 Main St."
                            />
                        </div>
                        <div className="grid-2">
                            <div className="field">
                                <label>City</label>
                                <input
                                    value={profile.city}
                                    onChange={e => update("city", e.target.value)}
                                    placeholder="Cairo"
                                />
                            </div>
                            <div className="field">
                                <label>Country</label>
                                <input
                                    value={profile.country}
                                    onChange={e => update("country", e.target.value)}
                                    placeholder="Egypt"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="field">
                        <label>License number</label>
                        <input
                            value={profile.licenseNo}
                            onChange={e => update("licenseNo", e.target.value)}
                            placeholder="PH-XXXX-YYYY"
                        />
                    </div>
                </section>

                {/* Hours & services */}
                <section className="card">
                    <div className="card-title">Opening hours</div>
                    <div className="hours-grid">
                        {(
                            [
                                ["mon", "Mon"], ["tue", "Tue"], ["wed", "Wed"],
                                ["thu", "Thu"], ["fri", "Fri"], ["sat", "Sat"], ["sun", "Sun"],
                            ] as Array<[keyof Hours, string]>
                        ).map(([k, label]) => (
                            <div className="field" key={k}>
                                <label>{label}</label>
                                <input value={profile.hours[k]} onChange={e => updateHours(k, e.target.value)} />
                            </div>
                        ))}
                    </div>
                </section>

                <section className="card">
                    <div className="card-title">Services</div>
                    <div className="grid-2">
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={profile.supportsDelivery}
                                onChange={e => update("supportsDelivery", e.target.checked)}
                            />
                            <span>Offer home delivery</span>
                        </label>

                        <div className="field">
                            <label>Delivery radius (km)</label>
                            <input
                                type="number"
                                min={0}
                                value={profile.deliveryRadiusKm}
                                onChange={e => update("deliveryRadiusKm", parseFloat(e.target.value || "0"))}
                            />
                        </div>
                    </div>

                    <div className="field">
                        <label>Notes for customers</label>
                        <textarea
                            rows={4}
                            value={profile.notes}
                            onChange={e => update("notes", e.target.value)}
                            placeholder="Parking info, special instructions…"
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}

/* helpers */
function fToDataUrl(file: File): Promise<string> {
    return new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.onerror = rej;
        r.readAsDataURL(file);
    });
}
