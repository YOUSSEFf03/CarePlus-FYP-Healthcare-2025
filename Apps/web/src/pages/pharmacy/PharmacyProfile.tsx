import React, { useEffect, useRef, useState } from "react";
import CustomText from "../../components/Text/CustomText";
import Button from "../../components/Button/Button";
import "../../styles/pharmacyProfile.css";
import pharmacyProfileService, { UpdateProfileData } from "../../services/pharmacyProfileService";

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
    // Additional fields for API integration
    pharmacy_name?: string;
    pharmacy_owner?: string;
    pharmacy_license?: string;
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    // Load profile data from API
    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const profileData = await pharmacyProfileService.getProfile();
                
                // Map API data to local profile format
                setProfile({
                    name: profileData.user.name || '',
                    email: profileData.user.email || '',
                    phone: profileData.user.phone || '',
                    address: profileData.branches[0]?.address || '',
                    city: '', // Not available in current API
                    country: '', // Not available in current API
                    licenseNo: profileData.pharmacy_license || '',
                    supportsDelivery: true, // Default value
                    deliveryRadiusKm: 5, // Default value
                    notes: '', // Not available in current API
                    hours: defaultHours, // Default hours
                    logoDataUrl: profileData.user.profile_picture_url || undefined,
                    // Additional fields
                    pharmacy_name: profileData.pharmacy_name || '',
                    pharmacy_owner: profileData.pharmacy_owner || '',
                    pharmacy_license: profileData.pharmacy_license || '',
                });
            } catch (err) {
                console.error('Error loading profile:', err);
                setError(err instanceof Error ? err.message : 'Failed to load profile');
                
                // Fallback to localStorage if API fails
                try {
                    const raw = localStorage.getItem(LS_KEY);
                    if (raw) setProfile({ ...emptyProfile, ...JSON.parse(raw) });
                } catch {
                    // ignore
                }
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
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
        setError(null);
        try {
            // Prepare update data for API
            const updateData: UpdateProfileData = {
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                pharmacy_name: profile.pharmacy_name,
                pharmacy_owner: profile.pharmacy_owner,
                pharmacy_license: profile.pharmacy_license,
                profile_picture_url: profile.logoDataUrl,
            };

            // Update via API
            const updatedProfile = await pharmacyProfileService.updateProfile(updateData);
            
            // Update local state with API response
            setProfile(prev => ({
                ...prev,
                name: updatedProfile.user.name,
                email: updatedProfile.user.email,
                phone: updatedProfile.user.phone,
                pharmacy_name: updatedProfile.pharmacy_name,
                pharmacy_owner: updatedProfile.pharmacy_owner,
                pharmacy_license: updatedProfile.pharmacy_license,
                logoDataUrl: updatedProfile.user.profile_picture_url,
            }));

            // Also save to localStorage as backup
            localStorage.setItem(LS_KEY, JSON.stringify(profile));
            
        } catch (err) {
            console.error('Error saving profile:', err);
            setError(err instanceof Error ? err.message : 'Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const onReset = () => {
        setProfile(emptyProfile);
        localStorage.removeItem(LS_KEY);
    };

    // Loading state
    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-header">
                    <CustomText variant="text-heading-H2">Pharmacy profile</CustomText>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                    <CustomText variant="text-body-lg-r">Loading profile...</CustomText>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <CustomText variant="text-heading-H2">Pharmacy profile</CustomText>
                <div className="profile-header-actions">
                    <Button variant="secondary" text="Reset" onClick={onReset} />
                    <Button text={saving ? "Saving…" : "Save changes"} onClick={onSave} />
                </div>
            </div>

            {error && (
                <div style={{ 
                    backgroundColor: '#fef2f2', 
                    border: '1px solid #fecaca', 
                    borderRadius: '8px', 
                    padding: '12px', 
                    marginBottom: '20px',
                    color: '#dc2626'
                }}>
                    <CustomText variant="text-body-sm-r">Error: {error}</CustomText>
                </div>
            )}

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
                                    value={profile.pharmacy_name || ''}
                                    onChange={e => update("pharmacy_name", e.target.value)}
                                    placeholder="City Care Pharmacy"
                                />
                            </div>
                            <div className="field">
                                <label>Contact person name</label>
                                <input
                                    value={profile.name}
                                    onChange={e => update("name", e.target.value)}
                                    placeholder="John Smith"
                                />
                            </div>
                            <div className="field">
                                <label>Pharmacy owner</label>
                                <input
                                    value={profile.pharmacy_owner || ''}
                                    onChange={e => update("pharmacy_owner", e.target.value)}
                                    placeholder="Jane Doe"
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
                            value={profile.pharmacy_license || ''}
                            onChange={e => update("pharmacy_license", e.target.value)}
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
