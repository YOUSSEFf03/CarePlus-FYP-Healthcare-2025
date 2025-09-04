import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import CustomInput from "../../components/Inputs/CustomInput";
import PhoneInput from "../../components/Inputs/PhoneInput";
import SearchSelect from "../../components/Inputs/SearchSelect";
import Toggle from "../../components/Inputs/ToggleSwitch"; // your small toggle component
import DeleteConfirmationModal from "../../components/Workplace/DeleteConfirmationModal";
import "../../styles/workplaceDetails.css";
import { ReactComponent as SaveIcon } from '../../assets/svgs/FloppyDisk.svg';
import { ReactComponent as EditIcon } from '../../assets/svgs/Pencil.svg';
import { ReactComponent as CancelIcon } from '../../assets/svgs/X.svg';
import { ReactComponent as TrashIcon } from '../../assets/svgs/Trash.svg';

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

/** ---------------- Availability Manager (frontend-only) ---------------- */
type Weekday = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
const DAYS: Weekday[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

type DayWindow = {
    start: string;        // 'HH:mm'
    end: string;          // 'HH:mm'
    slotMinutes: number;  // e.g. 30
    slots: string[];      // selected/available slot starts: 'HH:mm'
};

type AvailabilityMap = Partial<Record<Weekday, DayWindow>>;

function makeSlots(start: string, end: string, minutes: number): string[] {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    const out: string[] = [];
    for (let m = startMin; m + minutes <= endMin; m += minutes) {
        const hh = String(Math.floor(m / 60)).padStart(2, '0');
        const mm = String(m % 60).padStart(2, '0');
        out.push(`${hh}:${mm}`);
    }
    return out;
}

function AvailabilityManager({
    storageKey,
    editable,
}: {
    storageKey: string;
    editable: boolean;
}) {
    const [slotMinutes, setSlotMinutes] = useState<number>(30);
    const [startTime, setStartTime] = useState<string>('09:00');
    const [endTime, setEndTime] = useState<string>('17:00');

    const [availability, setAvailability] = useState<AvailabilityMap>({});
    const [selectedDay, setSelectedDay] = useState<Weekday>('MON');

    const readOnly = !editable;

    // Load from localStorage
    useEffect(() => {
        try {
            const raw = localStorage.getItem(storageKey);
            if (raw) {
                const parsed: AvailabilityMap = JSON.parse(raw);
                setAvailability(parsed);
                const firstWithData = DAYS.find(d => parsed[d]?.slots?.length);
                if (firstWithData) setSelectedDay(firstWithData);
            } else {
                setAvailability({});
                setSelectedDay('MON');
            }
        } catch {
            setAvailability({});
        }
    }, [storageKey]);

    // When switching day, reflect existing config into the controls
    useEffect(() => {
        const d = availability[selectedDay];
        if (!d) return;
        setStartTime(d.start);
        setEndTime(d.end);
        setSlotMinutes(d.slotMinutes);
    }, [selectedDay, availability]);

    function handleGenerate() {
        if (readOnly) return;
        const all = makeSlots(startTime, endTime, slotMinutes);
        // Preselect all generated slots (or set [] if you prefer none preselected)
        setAvailability(prev => ({
            ...prev,
            [selectedDay]: {
                start: startTime,
                end: endTime,
                slotMinutes,
                slots: all,           // selected slots
            },
        }));
    }

    function handleToggleSlot(slot: string) {
        if (readOnly) return;
        setAvailability(prev => {
            const day = prev[selectedDay] ?? {
                start: startTime,
                end: endTime,
                slotMinutes,
                slots: [] as string[], // IMPORTANT: type the empty array
            };
            const exists = day.slots.includes(slot);
            const nextSlots = exists ? day.slots.filter(s => s !== slot) : [...day.slots, slot];
            return { ...prev, [selectedDay]: { ...day, slots: nextSlots } };
        });
    }

    function handleClearDay() {
        if (readOnly) return;
        setAvailability(prev => {
            const next = { ...prev };
            delete next[selectedDay];
            return next;
        });
    }

    function handleSaveAvailability() {
        if (readOnly) return;
        localStorage.setItem(storageKey, JSON.stringify(availability));
    }

    const day = availability[selectedDay];
    const allSlots = day ? makeSlots(day.start, day.end, day.slotMinutes) : [];
    const isSelected = (t: string) => !!day?.slots.includes(t);

    return (
        <div className="wpd-card">
            <div className="wpd-section-header">
                <h2>Availability</h2>
                <p>Choose slot duration and working hours, then pick available times.</p>
            </div>

            <div className="wpd-av-controls">
                <SearchSelect
                    label="Slot duration"
                    placeholder="Select duration"
                    searchPlaceholder="Search duration"
                    value={String(slotMinutes)}
                    onChange={(v) => setSlotMinutes(Number(v || 30))}
                    options={[
                        { value: '10', label: '10 minutes' },
                        { value: '15', label: '15 minutes' },
                        { value: '20', label: '20 minutes' },
                        { value: '30', label: '30 minutes' },
                        { value: '45', label: '45 minutes' },
                        { value: '60', label: '60 minutes' },
                    ]}
                    creatable={false}
                    showOtherRow={false}
                    variant={!editable ? 'disabled' : 'normal'}
                />

                <CustomInput
                    label="Start time"
                    type="time"
                    step={60}
                    value={startTime}
                    onChange={(e) => setStartTime((e.target as HTMLInputElement).value)}
                    variant={!editable ? 'disabled' : 'normal'}
                />
                <CustomInput
                    label="End time"
                    type="time"
                    step={60}
                    value={endTime}
                    onChange={(e) => setEndTime((e.target as HTMLInputElement).value)}
                    variant={!editable ? 'disabled' : 'normal'}
                />

                <div className="wpd-av-actions">
                    <Button text="Generate slots" onClick={handleGenerate} disabled={!editable} />
                    <Button variant="secondary" text="Clear day" onClick={handleClearDay} disabled={!editable} />
                </div>
            </div>

            <div className="wpd-days">
                {DAYS.map((d) => {
                    const hasData = Boolean(availability[d]?.slots?.length);
                    const isActive = selectedDay === d;
                    return (
                        <button
                            key={d}
                            type="button"
                            className={['wpd-day', isActive ? 'is-selected' : '', hasData ? 'has-data' : ''].join(' ')}
                            onClick={() => setSelectedDay(d)}
                        >
                            {d}
                        </button>
                    );
                })}
            </div>

            <div className="wpd-slots">
                {allSlots.length === 0 ? (
                    <div className="wpd-empty">No slots generated yet.</div>
                ) : (
                    allSlots.map((t) => (
                        <button
                            key={t}
                            type="button"
                            className={[`wpd-chip ${isSelected(t) ? 'selected' : ''}`, readOnly ? "is-readonly" : ""].join(' ')}
                            onClick={() => handleToggleSlot(t)}
                            disabled={!editable}
                        >
                            {t}
                        </button>
                    ))
                )}
            </div>

            <div className="wpd-av-footer">
                <Button text="Save availability" onClick={handleSaveAvailability} disabled={!editable} />
            </div>
        </div>
    );
}
/** ---------------- end Availability Manager ---------------- */

export default function WorkplaceDetails() {
    const { name } = useParams<{ name: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const stateWp = (location.state as { workplace?: CardWorkplace })?.workplace;

    const [activeTab, setActiveTab] = useState<'details' | 'availability'>('details');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [edit, setEdit] = useState(false);

    const [workplace, setWorkplace] = useState<Workplace | null>(null);
    const [draft, setDraft] = useState<Workplace | null>(null);

    const [showDeleteAssistant, setShowDeleteAssistant] = useState<null | { assistant: Assistant }>(null);
    const [showDeleteWorkplace, setShowDeleteWorkplace] = useState(false);
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

    async function deleteWorkplace() {
        if (!draft) return;
        setSaving(true);
        setError(null);
        try {
            // If backend exists, this will delete. If you’re running frontend-only, it may fail—handled in finally.
            await fetch(`${API_BASE}/doctors/workplaces/${draft.id}`, { method: "DELETE" });
        } catch {
            // ignore network errors in frontend-only mode
        } finally {
            setSaving(false);
            setShowDeleteWorkplace(false);
            // Frontend-only UX: go back to the workplaces list
            navigate("/doctor/workplaces", { replace: true });
        }
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
            setShowDeleteAssistant(null);
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
                        <Button iconLeft={<EditIcon width={24} />} text="Edit" onClick={() => setEdit(true)} />
                    ) : (
                        <>
                            <Button iconLeft={<CancelIcon width={16} />} variant="secondary" text="Cancel" onClick={cancel} disabled={saving} />
                            <Button iconLeft={<SaveIcon width={24} />} text={saving ? "Saving…" : "Save changes"} onClick={save} disabled={saving} />
                        </>
                    )}
                    <Button iconLeft={<TrashIcon width={20} />} variant="tertiary" className="btn--danger-delete" text="Delete" onClick={() => setShowDeleteWorkplace(true)}></Button>
                </div>
            </header>

            {error && <div className="wpd-alert wpd-alert-error">{error}</div>}

            {/* TABS (same class names used in DoctorAppointments) */}
            <div className="appointments-tabs">
                <button
                    className={`appointments-tab ${activeTab === 'details' ? 'active' : ''}`}
                    onClick={() => setActiveTab('details')}
                >
                    Details
                </button>
                <button
                    className={`appointments-tab ${activeTab === 'availability' ? 'active' : ''}`}
                    onClick={() => setActiveTab('availability')}
                >
                    Availability
                </button>
            </div>

            <div className="appointments-tab-content fade-in">
                {activeTab === 'details' ? (
                    <>
                        {/* keep your existing DETAILS grid as-is */}
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
                                                    <Button variant="tertiary" text="Remove" onClick={() => setShowDeleteAssistant({ assistant: a })} />
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            </aside>
                        </div>
                        {showDeleteAssistant && (
                            <DeleteConfirmationModal
                                name={showDeleteAssistant.assistant.name}
                                onCancel={() => setShowDeleteAssistant(null)}
                                onConfirm={() => removeAssistant(showDeleteAssistant.assistant)}
                            />
                        )}
                    </>
                ) : (
                    <AvailabilityManager
                        storageKey={`availability:${draft.id || draft.workplace_name}`}
                        editable={edit}
                    />
                )}
            </div>
            {showDeleteWorkplace && (
                <DeleteConfirmationModal
                    name={draft.workplace_name}
                    onCancel={() => setShowDeleteWorkplace(false)}
                    onConfirm={deleteWorkplace}
                />
            )}
        </div>
    );
}