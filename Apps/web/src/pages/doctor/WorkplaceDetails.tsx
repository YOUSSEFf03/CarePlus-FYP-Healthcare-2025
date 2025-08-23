// import React, { useEffect, useMemo, useState } from "react";
// import { useParams, useLocation } from "react-router-dom";
// import Button from "../../components/Button/Button";
// import CustomInput from "../../components/Inputs/CustomInput";
// import PhoneInput from "../../components/Inputs/PhoneInput";
// import RadioGroup from "../../components/Inputs/RadioGroup";
// import DeleteConfirmationModal from "../../components/Workplace/DeleteConfirmationModal";
// import ToggleSwitch from "../../components/Inputs/ToggleSwitch";
// import SearchSelect from "../../components/Inputs/SearchSelect";
// import "../../styles/workplaceDetails.css";
// import CustomText from "../../components/Text/CustomText";

// const API_BASE = "http://localhost:3000";

// /* ---------- Types ---------- */
// type WorkplaceType = "Clinic" | "Hospital" | "Telemedicine" | "Home Visits" | "Other";

// const WORKPLACE_TYPES = [
//     { label: "Clinic", value: "Clinic" },
//     { label: "Hospital", value: "Hospital" },
//     { label: "Telemedicine", value: "Telemedicine" },
//     { label: "Home Visits", value: "Home Visits" },
//     { label: "Other", value: "Other" },
// ];

// type CardWorkplace = {
//     id: string;
//     name: string;
//     type: WorkplaceType | string;
//     is_primary?: boolean;
//     appointment_price?: number;
//     location?: string;
//     phone?: string;
//     image?: string;
// };

// function mapFromCard(w: CardWorkplace): Workplace {
//     return {
//         id: w.id,
//         workplace_name: w.name,
//         workplace_type: (["Clinic", "Hospital", "Telemedicine", "Home Visits", "Other"]
//             .includes(String(w.type)) ? (w.type as WorkplaceType) : "Clinic"),
//         is_primary: !!w.is_primary,
//         phone_number: w.phone ?? "",
//         appointment_price: Number(w.appointment_price ?? 0),
//         address: { street: w.location ?? "" },
//         assistants: [],
//     };
// }

// interface Address {
//     address_id?: string;
//     user_id?: string;
//     pharmacy_branch_id?: string | null;
//     doctor_workplace_id?: string | null;
//     building_name?: string;
//     building_number?: string;
//     floor_number?: string;
//     street?: string;
//     city?: string;
//     state?: string;
//     country?: string;
//     zipcode?: string;
//     area_description?: string;
//     maps_link?: string;
// }

// interface Assistant {
//     id: string;
//     name: string;
//     email: string;
//     phone?: string;
// }

// interface Workplace {
//     id: string;
//     workplace_name: string;
//     workplace_type: WorkplaceType;
//     is_primary: boolean;
//     phone_number: string;
//     appointment_price: number;
//     address: Address;
//     assistants: Assistant[];
// }

// /* ---------- Helpers ---------- */

// function toMoney(n: string | number): string {
//     const v = typeof n === "string" ? Number(n) : n;
//     if (Number.isNaN(v)) return "";
//     return v.toFixed(2);
// }

// // Accepts a full Google Maps link; returns a safe embeddable URL
// function toGoogleEmbedUrl(link?: string): string | undefined {
//     if (!link) return undefined;
//     try {
//         const u = new URL(link);
//         // If it's already an embed link, keep it:
//         if (u.hostname.includes("google") && u.pathname.includes("/embed")) return u.href;

//         // Otherwise, try to convert to a generic embed form
//         // Examples supported: https://maps.google.com/?q=lat,lng or a place link
//         if (u.searchParams.get("q")) {
//             const q = u.searchParams.get("q");
//             return `https://www.google.com/maps?q=${encodeURIComponent(q!)}&output=embed`;
//         }
//         return `https://www.google.com/maps?output=embed&ll=${encodeURIComponent(u.searchParams.get("ll") ?? "")}`;
//     } catch {
//         return undefined;
//     }
// }

// /* ---------- Main ---------- */

// export default function WorkplaceDetails() {
//     const { name } = useParams<{ name: string }>();
//     const location = useLocation();
//     const stateWp = (location.state as { workplace?: CardWorkplace })?.workplace;

//     const [loading, setLoading] = useState(true);
//     const [saving, setSaving] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const [edit, setEdit] = useState(false);

//     const [workplace, setWorkplace] = useState<Workplace | null>(null);
//     const [draft, setDraft] = useState<Workplace | null>(null);

//     const [showDelete, setShowDelete] = useState<null | { assistant: Assistant }>(null);
//     const [addEmail, setAddEmail] = useState("");

//     // Fetch initial data
//     useEffect(() => {
//         let mounted = true;

//         if (stateWp) {
//             const mapped = mapFromCard(stateWp);
//             if (!mounted) return;
//             setWorkplace(mapped);
//             setDraft(mapped);
//             setLoading(false);
//             return;
//         }

//         // (async () => {
//         //     try {
//         //         setLoading(true);
//         //         // Replace with your real API
//         //         const res = await fetch(`${API_BASE}/doctors/workplaces/${encodedName}`);
//         //         if (!res.ok) throw new Error(`Failed to load workplace`);
//         //         const data: Workplace = await res.json();
//         //         if (!mounted) return;

//         //         setWorkplace(data);
//         //         setDraft(data); // edit-state mirror
//         //     } catch (e: any) {
//         //         if (!mounted) return;
//         //         setError(e.message ?? "Failed to load");
//         //     } finally {
//         //         if (mounted) setLoading(false);
//         //     }
//         // })();
//         return () => {
//             mounted = false;
//         };
//     }, [stateWp, name]);

//     const assistants = useMemo(() => draft?.assistants ?? [], [draft]);

//     function onChange<K extends keyof Workplace>(key: K, val: Workplace[K]) {
//         setDraft((d) => (d ? { ...d, [key]: val } : d));
//     }
//     function onAddressChange<K extends keyof Address>(key: K, val: Address[K]) {
//         setDraft((d) => (d ? { ...d, address: { ...(d.address ?? {}), [key]: val } } : d));
//     }

//     async function save() {
//         if (!draft) return;
//         setSaving(true);
//         setError(null);
//         try {
//             // Replace with your real API
//             const res = await fetch(`${API_BASE}/doctors/workplaces/${draft.id}`, {
//                 method: "PUT",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(draft),
//             });
//             if (!res.ok) throw new Error("Failed to save changes");
//             const updated: Workplace = await res.json();
//             setWorkplace(updated);
//             setDraft(updated);
//             setEdit(false);
//         } catch (e: any) {
//             setError(e.message ?? "Failed to save");
//         } finally {
//             setSaving(false);
//         }
//     }

//     function cancel() {
//         setDraft(workplace);
//         setEdit(false);
//     }

//     async function addAssistant() {
//         if (!draft || !addEmail.trim()) return;
//         setError(null);
//         try {
//             // Replace with your real API
//             const res = await fetch(`${API_BASE}/workplaces/${draft.id}/assistants`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ email: addEmail.trim() }),
//             });
//             if (!res.ok) throw new Error("Unable to add assistant");
//             const a: Assistant = await res.json();
//             setDraft((d) => (d ? { ...d, assistants: [...(d.assistants ?? []), a] } : d));
//             setAddEmail("");
//         } catch (e: any) {
//             setError(e.message ?? "Failed to add assistant");
//         }
//     }

//     async function removeAssistant(a: Assistant) {
//         if (!draft) return;
//         setError(null);
//         try {
//             // Replace with your real API
//             const res = await fetch(`${API_BASE}/workplaces/${draft.id}/assistants/${a.id}`, {
//                 method: "DELETE",
//             });
//             if (!res.ok) throw new Error("Unable to remove assistant");
//             setDraft((d) =>
//                 d ? { ...d, assistants: (d.assistants ?? []).filter((x) => x.id !== a.id) } : d
//             );
//         } catch (e: any) {
//             setError(e.message ?? "Failed to remove assistant");
//         } finally {
//             setShowDelete(null);
//         }
//     }

//     if (loading) {
//         return (
//             <div className="wpd-container">
//                 <div className="wpd-card">Loading workplace…</div>
//             </div>
//         );
//     }
//     if (!draft) {
//         return (
//             <div className="wpd-container">
//                 <div className="wpd-card wpd-error">Workplace not found.</div>
//             </div>
//         );
//     }

//     const embedUrl = toGoogleEmbedUrl(draft.address?.maps_link);

//     return (
//         <div className="wpd-container">
//             <header className="wpd-header">
//                 <div className="wpd-header-main">
//                     {/* <h1 className="wpd-title">{draft.workplace_name || "Workplace"}</h1> */}
//                     <CustomText variant="text-heading-H2">{draft.workplace_name || "Workplace"}</CustomText>
//                     <div className="wpd-subtitle">
//                         {/* {draft.workplace_type} • {draft.is_primary ? "Primary" : "Secondary"} */}
//                         <CustomText variant="text-body-md-r">{draft.workplace_type} • {draft.is_primary ? "Primary" : "Secondary"}</CustomText>
//                     </div>
//                 </div>

//                 <div className="wpd-header-actions">
//                     {!edit ? (
//                         <Button text="Edit" onClick={() => setEdit(true)} />
//                     ) : (
//                         <>
//                             <Button
//                                 variant="secondary"
//                                 text="Cancel"
//                                 onClick={cancel}
//                                 disabled={saving}
//                             />
//                             <Button
//                                 text={saving ? "Saving…" : "Save changes"}
//                                 onClick={save}
//                                 disabled={saving}
//                             />
//                         </>
//                     )}
//                 </div>
//             </header>

//             {error && <div className="wpd-alert wpd-alert-error">{error}</div>}

//             <div className="wpd-grid">
//                 {/* LEFT: Details */}
//                 <div className="wpd-col-main">
//                     {/* Workplace Info */}
//                     <section className="wpd-card">
//                         <div className="wpd-section-header">
//                             <h2>Workplace</h2>
//                             <p>General information about this clinic/office.</p>
//                         </div>

//                         <div className="wpd-row">
//                             <CustomInput
//                                 label="Workplace name"
//                                 placeholder="e.g., Cedar Clinic"
//                                 value={draft.workplace_name}
//                                 onChange={(e) => onChange("workplace_name", (e.target as HTMLInputElement).value)}
//                                 variant={edit ? "normal" : "disabled"}
//                             />

//                             <SearchSelect
//                                 label="Workplace type"
//                                 placeholder="Select workplace type"
//                                 searchPlaceholder="Search workplace type"
//                                 options={WORKPLACE_TYPES}
//                                 value={draft.workplace_type}
//                                 onChange={(v) => onChange("workplace_type", v as WorkplaceType)}
//                                 variant={!edit ? "disabled" : "normal"}
//                                 creatable
//                                 showOtherRow
//                             />
//                         </div>

//                         <div className="wpd-row">
//                             <ToggleSwitch
//                                 label="Primary workplace?"
//                                 checked={!!draft.is_primary}
//                                 onChange={(v) => onChange("is_primary", v)}
//                                 disabled={!edit}
//                             />

//                             <PhoneInput
//                                 label="Phone number"
//                                 value={draft.phone_number}
//                                 onChange={(e164) => onChange("phone_number", e164)}
//                                 variant={edit ? "normal" : "disabled"}
//                             />
//                         </div>

//                         <div className="wpd-row">
//                             <CustomInput
//                                 label="Appointment price"
//                                 type="number"
//                                 inputMode="decimal"
//                                 min={0}
//                                 step="0.01"
//                                 placeholder="e.g., 30"
//                                 value={String(draft.appointment_price ?? "")}
//                                 onChange={(e) =>
//                                     onChange("appointment_price", Number((e.target as HTMLInputElement).value))
//                                 }
//                                 onBlur={(e) =>
//                                     onChange(
//                                         "appointment_price",
//                                         Number(toMoney((e.target as HTMLInputElement).value || 0))
//                                     )
//                                 }
//                                 variant={edit ? "normal" : "disabled"}
//                                 rightIcon={<span className="wpd-amount-suffix">USD</span>}
//                             />
//                             <div />
//                         </div>
//                     </section>

//                     {/* Address */}
//                     <section className="wpd-card">
//                         <div className="wpd-section-header">
//                             <h2>Address</h2>
//                             <p>Full address as in your database schema (plus a Google Maps link).</p>
//                         </div>

//                         <div className="wpd-row">
//                             <CustomInput
//                                 label="Building name"
//                                 value={draft.address?.building_name ?? ""}
//                                 onChange={(e) => onAddressChange("building_name", (e.target as HTMLInputElement).value)}
//                                 disabled={!edit}
//                             />
//                             <CustomInput
//                                 label="Building number"
//                                 value={draft.address?.building_number ?? ""}
//                                 onChange={(e) => onAddressChange("building_number", (e.target as HTMLInputElement).value)}
//                                 disabled={!edit}
//                             />
//                         </div>

//                         <div className="wpd-row">
//                             <CustomInput
//                                 label="Floor number"
//                                 value={draft.address?.floor_number ?? ""}
//                                 onChange={(e) => onAddressChange("floor_number", (e.target as HTMLInputElement).value)}
//                                 disabled={!edit}
//                             />
//                             <CustomInput
//                                 label="Street"
//                                 value={draft.address?.street ?? ""}
//                                 onChange={(e) => onAddressChange("street", (e.target as HTMLInputElement).value)}
//                                 disabled={!edit}
//                             />
//                         </div>

//                         <div className="wpd-row">
//                             <CustomInput
//                                 label="City"
//                                 value={draft.address?.city ?? ""}
//                                 onChange={(e) => onAddressChange("city", (e.target as HTMLInputElement).value)}
//                                 disabled={!edit}
//                             />
//                             <CustomInput
//                                 label="State / Governorate"
//                                 value={draft.address?.state ?? ""}
//                                 onChange={(e) => onAddressChange("state", (e.target as HTMLInputElement).value)}
//                                 disabled={!edit}
//                             />
//                         </div>

//                         <div className="wpd-row">
//                             <CustomInput
//                                 label="Country"
//                                 value={draft.address?.country ?? ""}
//                                 onChange={(e) => onAddressChange("country", (e.target as HTMLInputElement).value)}
//                                 disabled={!edit}
//                             />
//                             <CustomInput
//                                 label="Zip / Postal code"
//                                 value={draft.address?.zipcode ?? ""}
//                                 onChange={(e) => onAddressChange("zipcode", (e.target as HTMLInputElement).value)}
//                                 disabled={!edit}
//                             />
//                         </div>

//                         <div className="wpd-row">
//                             <CustomInput
//                                 label="Area description"
//                                 placeholder="Landmarks, opening hours notes, etc."
//                                 value={draft.address?.area_description ?? ""}
//                                 onChange={(e) => onAddressChange("area_description", (e.target as HTMLInputElement).value)}
//                                 disabled={!edit}
//                             />
//                             <CustomInput
//                                 label="Google Maps link"
//                                 placeholder="https://maps.google.com/..."
//                                 value={draft.address?.maps_link ?? ""}
//                                 onChange={(e) => onAddressChange("maps_link", (e.target as HTMLInputElement).value)}
//                                 disabled={!edit}
//                             />
//                         </div>

//                         {embedUrl && (
//                             <div className="wpd-map-embed">
//                                 <iframe
//                                     title="Workplace location"
//                                     src={embedUrl}
//                                     loading="lazy"
//                                     referrerPolicy="no-referrer-when-downgrade"
//                                 />
//                             </div>
//                         )}

//                         {/* TODO (next): integrate Places Autocomplete to pick this address from Google Maps and fill fields. */}
//                     </section>
//                 </div>

//                 {/* RIGHT: Assistants */}
//                 <aside className="wpd-col-aside">
//                     <section className="wpd-card wpd-sticky">
//                         <div className="wpd-section-header">
//                             <h2>Assistants</h2>
//                             <p>Manage assistants assigned to this workplace.</p>
//                         </div>

//                         <div className="wpd-add-assistant">
//                             <CustomInput
//                                 label="Invite by email"
//                                 placeholder="assistant@clinic.com"
//                                 value={addEmail}
//                                 onChange={(e) => setAddEmail((e.target as HTMLInputElement).value)}
//                             />
//                             <Button text="Add" onClick={addAssistant} />
//                         </div>

//                         <ul className="wpd-assistant-list">
//                             {assistants.length === 0 && <li className="wpd-empty">No assistants yet.</li>}
//                             {assistants.map((a) => (
//                                 <li key={a.id} className="wpd-assistant-item">
//                                     <div className="wpd-assistant-meta">
//                                         <div className="wpd-assistant-name">{a.name}</div>
//                                         <div className="wpd-assistant-sub">{a.email}{a.phone ? ` • ${a.phone}` : ""}</div>
//                                     </div>
//                                     <div className="wpd-assistant-actions">
//                                         <Button
//                                             variant="tertiary"
//                                             text="Remove"
//                                             onClick={() => setShowDelete({ assistant: a })}
//                                         />
//                                     </div>
//                                 </li>
//                             ))}
//                         </ul>
//                     </section>
//                 </aside>
//             </div>

//             {showDelete && (
//                 <DeleteConfirmationModal
//                     name={showDelete.assistant.name}
//                     onCancel={() => setShowDelete(null)}
//                     onConfirm={() => removeAssistant(showDelete.assistant)}
//                 />
//             )}
//         </div>
//     );
// }

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import Button from "../../components/Button/Button";
import CustomInput from "../../components/Inputs/CustomInput";
import PhoneInput from "../../components/Inputs/PhoneInput";
import SearchSelect from "../../components/Inputs/SearchSelect";
import Toggle from "../../components/Inputs/ToggleSwitch"; // your small toggle component
import DeleteConfirmationModal from "../../components/Workplace/DeleteConfirmationModal";
import "../../styles/workplaceDetails.css";

const API_BASE = "http://localhost:3000";

type WorkplaceType = "Clinic" | "Hospital" | "Telemedicine" | "Home Visits" | "Other";

type CardWorkplace = {
    id: string;
    name: string;
    type: WorkplaceType | string;
    is_primary?: boolean;
    appointment_price?: number;
    location?: string;
    phone?: string;
    image?: string;
};

function mapFromCard(w: CardWorkplace): Workplace {
    return {
        id: w.id,
        workplace_name: w.name,
        workplace_type: (["Clinic", "Hospital", "Telemedicine", "Home Visits", "Other"]
            .includes(String(w.type)) ? (w.type as WorkplaceType) : "Clinic"),
        is_primary: !!w.is_primary,
        phone_number: w.phone ?? "",
        appointment_price: Number(w.appointment_price ?? 0),
        address: { street: w.location ?? "" },
        assistants: [],
    };
}

interface Address {
    address_id?: string;
    user_id?: string;
    pharmacy_branch_id?: string | null;
    doctor_workplace_id?: string | null;
    building_name?: string;
    building_number?: string;
    floor_number?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipcode?: string;
    area_description?: string;
    maps_link?: string;
}

interface Assistant {
    id: string;
    name: string;
    email: string;
    phone?: string;
}

interface Workplace {
    id: string;
    workplace_name: string;
    workplace_type: WorkplaceType;
    is_primary: boolean;
    phone_number: string;
    appointment_price: number;
    address: Address;
    assistants: Assistant[];
}

function toMoney(n: string | number): string {
    const v = typeof n === "string" ? Number(n) : n;
    if (Number.isNaN(v)) return "";
    return v.toFixed(2);
}

function toGoogleEmbedUrl(link?: string): string | undefined {
    if (!link) return undefined;
    try {
        const u = new URL(link);
        if (u.hostname.includes("google") && u.pathname.includes("/embed")) return u.href;
        if (u.searchParams.get("q")) {
            const q = u.searchParams.get("q");
            return `https://www.google.com/maps?q=${encodeURIComponent(q!)}&output=embed`;
        }
        return `https://www.google.com/maps?output=embed&ll=${encodeURIComponent(
            u.searchParams.get("ll") ?? ""
        )}`;
    } catch {
        return undefined;
    }
}

export default function WorkplaceDetails() {
    const { name } = useParams<{ name: string }>();
    const location = useLocation();
    const stateWp = (location.state as { workplace?: CardWorkplace })?.workplace;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [edit, setEdit] = useState(false);

    const [workplace, setWorkplace] = useState<Workplace | null>(null);
    const [draft, setDraft] = useState<Workplace | null>(null);

    const [showDelete, setShowDelete] = useState<null | { assistant: Assistant }>(null);
    const [addEmail, setAddEmail] = useState("");

    useEffect(() => {
        let mounted = true;

        if (stateWp) {
            const mapped = mapFromCard(stateWp);
            if (!mounted) return;
            setWorkplace(mapped);
            setDraft(mapped);
            setLoading(false);
            return;
        }
        // (async () => {
        //     try {
        //         setLoading(true);
        //         const res = await fetch(`${API_BASE}/doctors/workplaces/${name}`);
        //         if (!res.ok) throw new Error(`Failed to load workplace`);
        //         const data: Workplace = await res.json();
        //         if (!mounted) return;
        //         setWorkplace(data);
        //         setDraft(data);
        //     } catch (e: any) {
        //         if (!mounted) return;
        //         setError(e.message ?? "Failed to load");
        //     } finally {
        //         if (mounted) setLoading(false);
        //     }
        // })();
        return () => {
            mounted = false;
        };
    }, [name]);

    const assistants = useMemo(() => draft?.assistants ?? [], [draft]);

    function onChange<K extends keyof Workplace>(key: K, val: Workplace[K]) {
        setDraft((d) => (d ? { ...d, [key]: val } : d));
    }
    function onAddressChange<K extends keyof Address>(key: K, val: Address[K]) {
        setDraft((d) => (d ? { ...d, address: { ...(d.address ?? {}), [key]: val } } : d));
    }

    async function save() {
        if (!draft) return;
        setSaving(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/doctors/workplaces/${draft.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(draft),
            });
            if (!res.ok) throw new Error("Failed to save changes");
            const updated: Workplace = await res.json();
            setWorkplace(updated);
            setDraft(updated);
            setEdit(false);
        } catch (e: any) {
            setError(e.message ?? "Failed to save");
        } finally {
            setSaving(false);
        }
    }

    function cancel() {
        setDraft(workplace);
        setEdit(false);
    }

    async function addAssistant() {
        if (!draft || !addEmail.trim()) return;
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/workplaces/${draft.id}/assistants`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: addEmail.trim() }),
            });
            if (!res.ok) throw new Error("Unable to add assistant");
            const a: Assistant = await res.json();
            setDraft((d) => (d ? { ...d, assistants: [...(d.assistants ?? []), a] } : d));
            setAddEmail("");
        } catch (e: any) {
            setError(e.message ?? "Failed to add assistant");
        }
    }

    async function removeAssistant(a: Assistant) {
        if (!draft) return;
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/workplaces/${draft.id}/assistants/${a.id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Unable to remove assistant");
            setDraft((d) =>
                d ? { ...d, assistants: (d.assistants ?? []).filter((x) => x.id !== a.id) } : d
            );
        } catch (e: any) {
            setError(e.message ?? "Failed to remove assistant");
        } finally {
            setShowDelete(null);
        }
    }

    if (loading) {
        return (
            <div className="wpd-container">
                <div className="wpd-card">Loading workplace…</div>
            </div>
        );
    }
    if (!draft) {
        return (
            <div className="wpd-container">
                <div className="wpd-card wpd-error">Workplace not found.</div>
            </div>
        );
    }

    const embedUrl = toGoogleEmbedUrl(draft.address?.maps_link);

    const TYPE_OPTIONS = [
        { value: "Clinic", label: "Clinic" },
        { value: "Hospital", label: "Hospital" },
        { value: "Telemedicine", label: "Telemedicine" },
        { value: "Home Visits", label: "Home Visits" },
        { value: "Other", label: "Other" },
    ];

    return (
        <div className="wpd-container">
            <header className="wpd-header">
                <div className="wpd-header-main">
                    <h1 className="wpd-title">{draft.workplace_name || "Workplace"}</h1>
                    <div className="wpd-subtitle">
                        <span className="wpd-chip">{draft.workplace_type}</span>
                        <span className={`wpd-chip ${draft.is_primary ? "ok" : ""}`}>
                            {draft.is_primary ? "Primary" : "Secondary"}
                        </span>
                    </div>
                </div>

                <div className="wpd-header-actions">
                    {!edit ? (
                        <Button text="Edit" onClick={() => setEdit(true)} />
                    ) : (
                        <>
                            <Button variant="secondary" text="Cancel" onClick={cancel} disabled={saving} />
                            <Button text={saving ? "Saving…" : "Save changes"} onClick={save} disabled={saving} />
                        </>
                    )}
                </div>
            </header>

            {error && <div className="wpd-alert wpd-alert-error">{error}</div>}

            <div className="wpd-grid">
                {/* LEFT */}
                <div className="wpd-col-main">
                    <section className="wpd-card">
                        <div className="wpd-section-header">
                            <h2>Workplace</h2>
                            <p>General information about this clinic/office.</p>
                        </div>

                        <div className="wpd-row">
                            <CustomInput
                                label="Workplace name"
                                placeholder="e.g., Cedar Clinic"
                                value={draft.workplace_name}
                                onChange={(e) => onChange("workplace_name", (e.target as HTMLInputElement).value)}
                                variant={!edit ? "disabled" : "normal"}
                            />

                            <SearchSelect
                                label="Workplace type"
                                placeholder="Select type"
                                searchPlaceholder="Search type"
                                options={TYPE_OPTIONS}
                                value={draft.workplace_type}
                                onChange={(val) => onChange("workplace_type", val as WorkplaceType)}
                                variant={!edit ? "disabled" : "normal"}
                            />
                        </div>

                        <div className="wpd-row">
                            <div className="wpd-field">
                                <label className="wpd-label">Primary workplace?</label>
                                <div className={`wpd-toggle-wrap ${!edit ? "is-disabled" : ""}`}>
                                    <Toggle checked={draft.is_primary} onChange={(v: boolean) => onChange("is_primary", v)} disabled={!edit} />
                                </div>
                            </div>

                            <PhoneInput
                                label="Phone number"
                                value={draft.phone_number}
                                onChange={(e164) => onChange("phone_number", e164)}
                                variant={!edit ? "disabled" : "normal"}
                            />
                        </div>

                        <div className="wpd-row">
                            <CustomInput
                                label="Appointment price"
                                type="number"
                                inputMode="decimal"
                                min={0}
                                step="0.01"
                                placeholder="e.g., 30"
                                value={String(draft.appointment_price ?? "")}
                                onChange={(e) => onChange("appointment_price", Number((e.target as HTMLInputElement).value))}
                                onBlur={(e) =>
                                    onChange("appointment_price", Number(toMoney((e.target as HTMLInputElement).value || 0)))
                                }
                                variant={!edit ? "disabled" : "normal"}
                                rightIcon={<span className="wpd-amount-suffix">USD</span>}
                            />
                            <div />
                        </div>
                    </section>

                    <section className="wpd-card">
                        <div className="wpd-section-header">
                            <h2>Address</h2>
                            <p>Full address in your schema (plus a Google Maps link).</p>
                        </div>

                        <div className="wpd-row">
                            <CustomInput
                                label="Building name"
                                value={draft.address?.building_name ?? ""}
                                onChange={(e) => onAddressChange("building_name", (e.target as HTMLInputElement).value)}
                                variant={!edit ? "disabled" : "normal"}
                            />
                            <CustomInput
                                label="Building number"
                                value={draft.address?.building_number ?? ""}
                                onChange={(e) => onAddressChange("building_number", (e.target as HTMLInputElement).value)}
                                variant={!edit ? "disabled" : "normal"}
                            />
                        </div>

                        <div className="wpd-row">
                            <CustomInput
                                label="Floor number"
                                value={draft.address?.floor_number ?? ""}
                                onChange={(e) => onAddressChange("floor_number", (e.target as HTMLInputElement).value)}
                                variant={!edit ? "disabled" : "normal"}
                            />
                            <CustomInput
                                label="Street"
                                value={draft.address?.street ?? ""}
                                onChange={(e) => onAddressChange("street", (e.target as HTMLInputElement).value)}
                                variant={!edit ? "disabled" : "normal"}
                            />
                        </div>

                        <div className="wpd-row wpd-row-3">
                            <CustomInput
                                label="City"
                                value={draft.address?.city ?? ""}
                                onChange={(e) => onAddressChange("city", (e.target as HTMLInputElement).value)}
                                variant={!edit ? "disabled" : "normal"}
                            />
                            <CustomInput
                                label="State / Governorate"
                                value={draft.address?.state ?? ""}
                                onChange={(e) => onAddressChange("state", (e.target as HTMLInputElement).value)}
                                variant={!edit ? "disabled" : "normal"}
                            />
                            <CustomInput
                                label="Zip / Postal code"
                                value={draft.address?.zipcode ?? ""}
                                onChange={(e) => onAddressChange("zipcode", (e.target as HTMLInputElement).value)}
                                variant={!edit ? "disabled" : "normal"}
                            />
                        </div>

                        <div className="wpd-row">
                            <CustomInput
                                label="Country"
                                value={draft.address?.country ?? ""}
                                onChange={(e) => onAddressChange("country", (e.target as HTMLInputElement).value)}
                                variant={!edit ? "disabled" : "normal"}
                            />
                            <CustomInput
                                label="Area description"
                                placeholder="Landmarks, entry notes, etc."
                                value={draft.address?.area_description ?? ""}
                                onChange={(e) => onAddressChange("area_description", (e.target as HTMLInputElement).value)}
                                variant={!edit ? "disabled" : "normal"}
                            />
                        </div>

                        <div className="wpd-row">
                            <CustomInput
                                label="Google Maps link"
                                placeholder="https://maps.google.com/..."
                                value={draft.address?.maps_link ?? ""}
                                onChange={(e) => onAddressChange("maps_link", (e.target as HTMLInputElement).value)}
                                variant={!edit ? "disabled" : "normal"}
                            />
                            <div />
                        </div>

                        {embedUrl && (
                            <div className="wpd-map-embed">
                                <iframe title="Workplace location" src={embedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                            </div>
                        )}
                    </section>
                </div>

                {/* RIGHT */}
                <aside className="wpd-col-aside">
                    <section className="wpd-card wpd-sticky">
                        <div className="wpd-section-header">
                            <h2>Assistants</h2>
                            <p>Manage assistants assigned to this workplace.</p>
                        </div>

                        <div className="wpd-add-assistant">
                            <CustomInput
                                label="Invite by email"
                                placeholder="assistant@clinic.com"
                                value={addEmail}
                                onChange={(e) => setAddEmail((e.target as HTMLInputElement).value)}
                            />
                            <Button text="Add" onClick={addAssistant} />
                        </div>

                        <ul className="wpd-assistant-list">
                            {assistants.length === 0 && <li className="wpd-empty">No assistants yet.</li>}
                            {assistants.map((a) => (
                                <li key={a.id} className="wpd-assistant-item">
                                    <div className="wpd-assistant-meta">
                                        <div className="wpd-assistant-name">{a.name}</div>
                                        <div className="wpd-assistant-sub">
                                            {a.email}
                                            {a.phone ? ` • ${a.phone}` : ""}
                                        </div>
                                    </div>
                                    <div className="wpd-assistant-actions">
                                        <Button variant="tertiary" text="Remove" onClick={() => setShowDelete({ assistant: a })} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                </aside>
            </div>

            {showDelete && (
                <DeleteConfirmationModal
                    name={showDelete.assistant.name}
                    onCancel={() => setShowDelete(null)}
                    onConfirm={() => removeAssistant(showDelete.assistant)}
                />
            )}
        </div>
    );
}