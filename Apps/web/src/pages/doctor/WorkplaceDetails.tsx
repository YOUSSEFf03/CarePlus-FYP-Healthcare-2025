import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button/Button";
import CustomInput from "../../components/Inputs/CustomInput";
import PhoneInput from "../../components/Inputs/PhoneInput";
import SearchSelect from "../../components/Inputs/SearchSelect";
import Toggle from "../../components/Inputs/ToggleSwitch"; // your small toggle component
import DeleteConfirmationModal from "../../components/Workplace/DeleteConfirmationModal";
import "../../styles/workplaceDetails.css";
import { ReactComponent as SaveIcon } from "../../assets/svgs/FloppyDisk.svg";
import { ReactComponent as EditIcon } from "../../assets/svgs/Pencil.svg";
import { ReactComponent as CancelIcon } from "../../assets/svgs/X.svg";
import { ReactComponent as TrashIcon } from "../../assets/svgs/Trash.svg";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3000";

type WorkplaceType =
  | "clinic"
  | "hospital"
  | "private_practice"
  | "medical_center"
  | "home_visits";

type CardWorkplace = {
  id: string;
  name?: string;
  workplace_name?: string;
  type?: WorkplaceType | string;
  workplace_type?: WorkplaceType | string;
  is_primary?: boolean;
  appointment_price?: number;
  consultation_fee?: number;
  location?: string;
  phone?: string;
  phone_number?: string;
  image?: string;
  email?: string;
  description?: string;
  website?: string;
  services_offered?: string[];
  insurance_accepted?: string[];
  image_url?: string;
  working_hours?: any;
  // Direct address fields
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  // Address object
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    building_name?: string;
    building_number?: string;
    floor_number?: string;
    zipcode?: string;
    area_description?: string;
    maps_link?: string;
  };
  // Addresses array (for compatibility)
  addresses?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    building_name?: string;
    building_number?: string;
    floor_number?: string;
    zipcode?: string;
    area_description?: string;
    maps_link?: string;
  };
};

function mapFromCard(w: CardWorkplace): Workplace {
  console.log("Mapping CardWorkplace:", w);

  return {
    id: w.id,
    workplace_name: w.name || w.workplace_name || "Unknown Workplace",
    workplace_type: [
      "clinic",
      "hospital",
      "private_practice",
      "medical_center",
      "home_visits",
    ].includes(String(w.workplace_type || w.type || "").toLowerCase())
      ? ((w.workplace_type || w.type || "").toLowerCase() as WorkplaceType)
      : "clinic",
    is_primary: !!w.is_primary,
    phone_number: w.phone || w.phone_number || "",
    email: w.email || "",
    description: w.description || "",
    website: w.website || "",
    consultation_fee: Number(w.appointment_price || w.consultation_fee || 0),
    services_offered: w.services_offered || [],
    insurance_accepted: w.insurance_accepted || [],
    image_url: w.image || w.image_url || "",
    working_hours: w.working_hours || {},
    address: {
      street: w.location || w.address?.street || "",
      city: w.address?.city || "",
      state: w.address?.state || "",
      country: w.address?.country || "",
      building_name: w.address?.building_name || "",
      building_number: w.address?.building_number || "",
      floor_number: w.address?.floor_number || "",
      zipcode: w.address?.zipcode || "",
      area_description: w.address?.area_description || "",
      maps_link: w.address?.maps_link || "",
    },
    assistants: [],
  };
}

// Fetch workplace from API
const fetchWorkplace = async (workplaceId: string): Promise<Workplace> => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("access_token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await axios.get(
    `${API_BASE}/doctors/workplaces/${workplaceId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.data.success) {
    return response.data.data;
  } else {
    throw new Error(response.data.message || "Failed to fetch workplace");
  }
};

// Fetch assistants for a workplace
const fetchAssistants = async (workplaceId: string): Promise<Assistant[]> => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("access_token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await axios.get(
      `${API_BASE}/doctors/workplaces/${workplaceId}/assistants`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      return response.data.data || [];
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching assistants:", error);
    return [];
  }
};

// Fetch appointment slots for a workplace
const fetchAppointmentSlots = async (workplaceId: string, date?: string): Promise<any[]> => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("access_token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const params = date ? { date } : {};
    const response = await axios.get(
      `${API_BASE}/doctors/workplaces/${workplaceId}/appointment-slots`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      }
    );

    if (response.data.success) {
      return response.data.data || [];
    } else {
      throw new Error(response.data.message || "Failed to fetch appointment slots");
    }
  } catch (error: any) {
    console.error("Error fetching appointment slots:", error.response?.status, error.response?.data);
    throw error;
  }
};

// Create appointment slots for a workplace
const createAppointmentSlots = async (workplaceId: string, slotsData: {
  date: string;
  start_time: string;
  end_time: string;
  slot_duration: number;
}): Promise<any> => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("access_token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await axios.post(
      `${API_BASE}/doctors/workplaces/${workplaceId}/appointment-slots`,
      slotsData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to create appointment slots");
    }
  } catch (error: any) {
    console.error("Error creating appointment slots:", error.response?.status, error.response?.data);
    throw error;
  }
};


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
  email?: string;
  description?: string;
  website?: string;
  consultation_fee: number;
  services_offered?: string[];
  insurance_accepted?: string[];
  image_url?: string;
  working_hours?: any;
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
    if (u.hostname.includes("google") && u.pathname.includes("/embed"))
      return u.href;
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
type Weekday = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
const DAYS: Weekday[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

type DayWindow = {
  start: string; // 'HH:mm'
  end: string; // 'HH:mm'
  slotMinutes: number; // e.g. 30
  slots: string[]; // selected/available slot starts: 'HH:mm'
};

type AvailabilityMap = Partial<Record<Weekday, DayWindow>>;

function makeSlots(start: string, end: string, minutes: number): string[] {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    const out: string[] = [];
    for (let m = startMin; m + minutes <= endMin; m += minutes) {
    const hh = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
        out.push(`${hh}:${mm}`);
    }
    return out;
}

function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const newH = Math.floor(totalMinutes / 60);
  const newM = totalMinutes % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}


// Convert working hours to availability format
function convertWorkingHoursToAvailability(workingHours: any): AvailabilityMap {
  const availability: AvailabilityMap = {};
  
  if (!workingHours || typeof workingHours !== 'object') {
    return availability;
  }

  const dayMapping: { [key: string]: Weekday } = {
    'monday': 'MON',
    'tuesday': 'TUE', 
    'wednesday': 'WED',
    'thursday': 'THU',
    'friday': 'FRI',
    'saturday': 'SAT',
    'sunday': 'SUN'
  };

  Object.entries(workingHours).forEach(([day, hours]: [string, any]) => {
    const weekday = dayMapping[day.toLowerCase()];
    if (weekday && hours && typeof hours === 'object') {
      // Check if the day is open (either is_open: true or start/end format)
      const isOpen = hours.is_open === true || (hours.start && hours.end);
      
      if (isOpen) {
        const startTime = hours.start_time || hours.start || '09:00';
        const endTime = hours.end_time || hours.end || '17:00';
        const slotDuration = 30; // Default 30 minutes
        
        // Generate all possible slots for this day
        const allSlots = makeSlots(startTime, endTime, slotDuration);
        
        availability[weekday] = {
          start: startTime,
          end: endTime,
          slotMinutes: slotDuration,
          slots: allSlots // Pre-select all slots for open days
        };
      }
    }
  });

  return availability;
}

function AvailabilityManager({
    storageKey,
    editable,
  workplaceId,
    workingHours,
}: {
    storageKey: string;
    editable: boolean;
  workplaceId?: string;
    workingHours?: any;
}) {
  const { isAuthenticated, user } = useAuth();
    const [slotMinutes, setSlotMinutes] = useState<number>(30);
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");

    const [availability, setAvailability] = useState<AvailabilityMap>({});
  const [selectedDay, setSelectedDay] = useState<Weekday>("MON");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

    const readOnly = !editable;

  // Load availability from appointment slots API
    useEffect(() => {
    const loadAvailability = async () => {
      if (!workplaceId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        let finalAvailability: AvailabilityMap = {};

        // 1. First priority: Load from appointment slots API
        try {
          const slots = await fetchAppointmentSlots(workplaceId);
          console.log('Loaded appointment slots from API:', slots);
          
          // Convert appointment slots to availability format
          const apiAvailability: AvailabilityMap = {};
          
          // Group slots by day and time
          slots.forEach((slot: any) => {
            const day = slot.day_of_week?.toUpperCase() as Weekday;
            if (day && DAYS.includes(day)) {
              if (!apiAvailability[day]) {
                apiAvailability[day] = {
                  start: slot.start_time || '09:00',
                  end: slot.end_time || '17:00',
                  slotMinutes: slot.slot_duration || 30,
                  slots: []
                };
              }
              if (slot.time_slot && apiAvailability[day]) {
                apiAvailability[day]!.slots.push(slot.time_slot);
              }
            }
          });

          finalAvailability = apiAvailability;
        } catch (apiErr: any) {
          console.warn('API loading failed, trying working hours:', apiErr);
          
          // 2. Second priority: Convert from working hours if available
          if (workingHours) {
            console.log('Converting working hours to availability:', workingHours);
            const workingHoursAvailability = convertWorkingHoursToAvailability(workingHours);
            finalAvailability = { ...workingHoursAvailability };
            console.log('Converted availability from working hours:', finalAvailability);
          }
        }

        // 3. Third priority: Fallback to localStorage if no other data
        if (Object.keys(finalAvailability).length === 0) {
          try {
            const raw = localStorage.getItem(storageKey);
            if (raw) {
              const parsed: AvailabilityMap = JSON.parse(raw);
              finalAvailability = parsed;
            }
          } catch (localErr) {
            console.warn('localStorage loading failed:', localErr);
          }
        }
        
        setAvailability(finalAvailability);
        const firstWithData = DAYS.find((d) => finalAvailability[d]?.slots?.length);
        if (firstWithData) setSelectedDay(firstWithData);
        
      } catch (err: any) {
        console.error('Error loading availability:', err);
        setError('Failed to load availability data');
        setAvailability({});
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, [storageKey, workplaceId, workingHours, isAuthenticated, user]);

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
    setAvailability((prev) => ({
      ...prev,
      [selectedDay]: {
        start: startTime,
        end: endTime,
        slotMinutes,
        slots: all, // selected slots
      },
    }));
  }

  function handleToggleSlot(slot: string) {
    if (readOnly) return;
    setAvailability((prev) => {
      const day = prev[selectedDay] ?? {
        start: startTime,
        end: endTime,
        slotMinutes,
        slots: [] as string[], // IMPORTANT: type the empty array
      };
      const exists = day.slots.includes(slot);
      const nextSlots = exists
        ? day.slots.filter((s) => s !== slot)
        : [...day.slots, slot];
      return { ...prev, [selectedDay]: { ...day, slots: nextSlots } };
    });
  }

  function handleClearDay() {
    if (readOnly) return;
    setAvailability((prev) => {
      const next = { ...prev };
      delete next[selectedDay];
      return next;
    });
  }

  const handleSaveAvailability = useCallback(async () => {
    if (readOnly || !workplaceId) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log('Saving availability to appointment slots API:', availability);
      
      // Save each day's availability as appointment slots
      const savePromises = Object.entries(availability).map(async ([day, dayData]) => {
        if (!dayData || !dayData.slots || dayData.slots.length === 0) {
          console.log(`Skipping ${day} - no slots to save`);
          return;
        }
        
        console.log(`Saving ${day} availability as appointment slots:`, dayData);
        
        // Create individual slot entries for each time slot
        const slotPromises = dayData.slots.map(async (timeSlot) => {
          const slotsData = {
            date: new Date().toISOString().split('T')[0], // Today's date as placeholder
            start_time: timeSlot,
            end_time: addMinutesToTime(timeSlot, dayData.slotMinutes),
            slot_duration: dayData.slotMinutes,
          };
          
          try {
            return await createAppointmentSlots(workplaceId, slotsData);
          } catch (error: any) {
            // If slot already exists, that's okay - just log and continue
            if (error.message?.includes('already exists') || error.response?.status === 409) {
              console.log(`Slot ${timeSlot} already exists, skipping...`);
              return null;
            }
            throw error;
          }
        });
        
        return Promise.all(slotPromises);
      });
      
      const results = await Promise.all(savePromises.filter(Boolean));
      console.log('Appointment slots save results:', results);
      
      // Also save to localStorage as backup
      localStorage.setItem(storageKey, JSON.stringify(availability));
      
      setSuccess('Availability saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err: any) {
      console.error('Error saving availability:', err);
      setError(err.message || 'Failed to save availability');
      
      // Fallback to localStorage only
      localStorage.setItem(storageKey, JSON.stringify(availability));
    } finally {
      setSaving(false);
    }
  }, [readOnly, workplaceId, availability, storageKey]);

  // No auto-save - user must manually save changes

  const day = availability[selectedDay];
  const allSlots = day ? makeSlots(day.start, day.end, day.slotMinutes) : [];
  const isSelected = (t: string) => !!day?.slots.includes(t);

  return (
    <div className="wpd-card">
      <div className="wpd-section-header">
        <h2>Availability</h2>
        <p>
          Choose slot duration and working hours, then pick available times.
        </p>
      </div>

      {error && (
        <div className="wpd-alert wpd-alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="wpd-alert wpd-alert-success">
          {success}
        </div>
      )}

      {loading && (
        <div className="wpd-loading">
          <div className="wpd-loading-spinner"></div>
          <span>Loading availability data...</span>
        </div>
      )}

      {!isAuthenticated && (
        <div className="wpd-alert wpd-alert-error">
          <strong>Authentication Required</strong><br />
          You need to be logged in to manage availability. Please log in and try again.
        </div>
      )}

      <div className="wpd-av-controls">
        <SearchSelect
          label="Slot duration"
          placeholder="Select duration"
          searchPlaceholder="Search duration"
          value={String(slotMinutes)}
          onChange={(v) => setSlotMinutes(Number(v || 30))}
          options={[
            { value: "10", label: "10 minutes" },
            { value: "15", label: "15 minutes" },
            { value: "20", label: "20 minutes" },
            { value: "30", label: "30 minutes" },
            { value: "45", label: "45 minutes" },
            { value: "60", label: "60 minutes" },
          ]}
          creatable={false}
          showOtherRow={false}
          variant={!editable ? "disabled" : "normal"}
        />

        <CustomInput
          label="Start time"
          type="time"
          step={60}
          value={startTime}
          onChange={(e) => setStartTime((e.target as HTMLInputElement).value)}
          variant={!editable ? "disabled" : "normal"}
        />
        <CustomInput
          label="End time"
          type="time"
          step={60}
          value={endTime}
          onChange={(e) => setEndTime((e.target as HTMLInputElement).value)}
          variant={!editable ? "disabled" : "normal"}
        />

        <div className="wpd-av-actions">
          <Button
            text="Generate slots"
            onClick={handleGenerate}
            disabled={!editable}
          />
          <Button
            variant="secondary"
            text="Clear day"
            onClick={handleClearDay}
            disabled={!editable}
          />
        </div>
      </div>

      <div className="wpd-days">
        {DAYS.map((d) => {
          const hasData = Boolean(availability[d]?.slots?.length);
          const isActive = selectedDay === d;
          const isFromWorkingHours = workingHours && workingHours[d.toLowerCase()]?.is_open;
          return (
            <button
              key={d}
              type="button"
              className={[
                "wpd-day",
                isActive ? "is-selected" : "",
                hasData ? "has-data" : "",
                isFromWorkingHours ? "from-working-hours" : "",
              ].join(" ")}
              onClick={() => setSelectedDay(d)}
              title={isFromWorkingHours ? "Pre-configured from workplace working hours" : hasData ? "Has availability slots" : "No availability set"}
            >
              <span className="wpd-day-name">{d}</span>
              {isFromWorkingHours && (
                <span className="wpd-day-badge" title="From working hours">⚡</span>
              )}
              {hasData && !isFromWorkingHours && (
                <span className="wpd-day-badge" title="Custom availability">✓</span>
              )}
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
              className={[
                "wpd-chip",
                isSelected(t) ? "wpd-chip-selected" : "wpd-chip-unselected",
                readOnly ? "is-readonly" : "",
              ].join(" ")}
                            onClick={() => handleToggleSlot(t)}
                            disabled={!editable}
                        >
                            {t}
                        </button>
                    ))
                )}
            </div>

      <div className="wpd-av-footer">
        <div className="wpd-av-actions">
          <Button
            text={saving ? "Saving..." : "Save availability"}
            onClick={handleSaveAvailability}
            disabled={!editable || saving || loading}
          />
          {editable && (
            <Button
              text="Add New Day"
              variant="secondary"
              onClick={() => {
                // Find first day without data
                const firstEmptyDay = DAYS.find(d => !availability[d]?.slots?.length);
                if (firstEmptyDay) {
                  setSelectedDay(firstEmptyDay);
                  // Auto-generate slots for the new day
                  const allSlots = makeSlots(startTime, endTime, slotMinutes);
                  setAvailability(prev => ({
                    ...prev,
                    [firstEmptyDay]: {
                      start: startTime,
                      end: endTime,
                      slotMinutes,
                      slots: allSlots
                    }
                  }));
                }
              }}
              disabled={saving || loading}
            />
          )}
        </div>
        {/* {workplaceId && (
          <div className="wpd-api-info">
            <small>💾 Changes are saved to the server and will persist across devices</small>
          </div>
        )} */}
      </div>
    </div>
  );
}
/** ---------------- end Availability Manager ---------------- */

export default function WorkplaceDetails() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const stateWp = (location.state as { workplace?: CardWorkplace })?.workplace;

  const [activeTab, setActiveTab] = useState<"details" | "availability">(
    "details"
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [edit, setEdit] = useState(false);

  const [workplace, setWorkplace] = useState<Workplace | null>(null);
  const [draft, setDraft] = useState<Workplace | null>(null);

  const [showDeleteAssistant, setShowDeleteAssistant] = useState<null | {
    assistant: Assistant;
  }>(null);
  const [showDeleteWorkplace, setShowDeleteWorkplace] = useState(false);
  const [addEmail, setAddEmail] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadWorkplace = async () => {
      try {
        setLoading(true);
        setError(null);

        if (stateWp) {
          console.log("Using stateWp data:", stateWp);
          console.log("stateWp keys:", Object.keys(stateWp));
          console.log("stateWp.workplace_name:", stateWp.workplace_name);
          console.log("stateWp.workplace_type:", stateWp.workplace_type);
          console.log("stateWp.phone_number:", stateWp.phone_number);
          console.log("stateWp.address:", stateWp.address);
          console.log("stateWp.location:", stateWp.location);
          console.log("stateWp.address type:", typeof stateWp.address);
          console.log(
            "stateWp.address keys:",
            stateWp.address ? Object.keys(stateWp.address) : "No address object"
          );
          console.log("stateWp keys:", Object.keys(stateWp));
          console.log("Looking for address fields:");
          console.log("- stateWp.addresses:", stateWp.addresses);
          console.log("- stateWp.address:", stateWp.address);
          console.log("- stateWp.location:", stateWp.location);
          console.log("- stateWp.street:", stateWp.street);
          console.log("- stateWp.city:", stateWp.city);
          console.log("- stateWp.state:", stateWp.state);
          console.log("- stateWp.country:", stateWp.country);
          console.log("Full stateWp object:", JSON.stringify(stateWp, null, 2));

          // Check if addresses is an array
          if (Array.isArray(stateWp.addresses)) {
            console.log(
              "Addresses is an array with length:",
              stateWp.addresses.length
            );
            if (stateWp.addresses.length > 0) {
              console.log("First address:", stateWp.addresses[0]);
            }
          }

          // Check all possible address-related fields
          console.log("All possible address fields:");
          Object.keys(stateWp).forEach((key) => {
            if (
              key.toLowerCase().includes("address") ||
              key.toLowerCase().includes("location") ||
              key.toLowerCase().includes("street") ||
              key.toLowerCase().includes("city") ||
              key.toLowerCase().includes("state") ||
              key.toLowerCase().includes("country")
            ) {
              console.log(`- ${key}:`, (stateWp as any)[key]);
            }
          });
          console.log("stateWp.consultation_fee:", stateWp.consultation_fee);
          console.log("stateWp.appointment_price:", stateWp.appointment_price);
          console.log("stateWp.is_primary:", stateWp.is_primary);
          console.log("stateWp.email:", stateWp.email);
          console.log("stateWp.description:", stateWp.description);
          console.log("stateWp.website:", stateWp.website);
          console.log("stateWp.services_offered:", stateWp.services_offered);
          console.log(
            "stateWp.insurance_accepted:",
            stateWp.insurance_accepted
          );
          console.log("stateWp.image_url:", stateWp.image_url);
          console.log("stateWp.working_hours:", stateWp.working_hours);

          const mapped = mapFromCard(stateWp);
          console.log("Mapped workplace data:", mapped);
          console.log("Mapped address data:", mapped.address);
          if (!mounted) return;
          setWorkplace(mapped);
          setDraft(mapped);
          setLoading(false);
          return;
        }

        if (!id) {
          throw new Error("Workplace ID is required");
        }

        // Fetch workplace from API
        const workplaceData = await fetchWorkplace(id);
        if (!mounted) return;

        // Transform the data to match our interface
        const transformedWorkplace: Workplace = {
          id: workplaceData.id,
          workplace_name: workplaceData.workplace_name,
          workplace_type: workplaceData.workplace_type,
          is_primary: workplaceData.is_primary,
          phone_number: workplaceData.phone_number || "",
          email: workplaceData.email,
          description: workplaceData.description,
          website: workplaceData.website,
          consultation_fee: workplaceData.consultation_fee || 0,
          services_offered: workplaceData.services_offered || [],
          insurance_accepted: workplaceData.insurance_accepted || [],
          image_url: workplaceData.image_url,
          working_hours: workplaceData.working_hours,
          address: workplaceData.address || {
            street: "",
            city: "",
            state: "",
            country: "",
          },
          assistants: [],
        };

        // Fetch assistants
        const assistants = await fetchAssistants(id);
        if (!mounted) return;

        const workplaceWithAssistants = {
          ...transformedWorkplace,
          assistants,
        };

        console.log("Workplace data loaded:", workplaceWithAssistants);
        setWorkplace(workplaceWithAssistants);
        setDraft(workplaceWithAssistants);
      } catch (e: any) {
        if (!mounted) return;
        console.error("Error loading workplace:", e);
        setError(e.message ?? "Failed to load workplace");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadWorkplace();

    return () => {
      mounted = false;
    };
  }, [id, stateWp]);

  const assistants = useMemo(() => draft?.assistants ?? [], [draft]);

  function onChange<K extends keyof Workplace>(key: K, val: Workplace[K]) {
    setDraft((d) => (d ? { ...d, [key]: val } : d));
  }

  async function deleteWorkplace() {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("access_token") ||
        sessionStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      await axios.delete(`${API_BASE}/doctors/workplaces/${draft.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setShowDeleteWorkplace(false);
      navigate("/doctor/workplaces", { replace: true });
    } catch (e: any) {
      console.error("Error deleting workplace:", e);
      setError(
        e.response?.data?.message || e.message || "Failed to delete workplace"
      );
    } finally {
      setSaving(false);
    }
  }

  async function save() {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("access_token") ||
        sessionStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      // Only allow editing is_primary, consultation_fee, and description
      const consultationFee = Number(draft.consultation_fee);
      if (isNaN(consultationFee)) {
        throw new Error(
          "Invalid consultation fee. Please enter a valid number."
        );
      }

      const updateData = {
        is_primary: Boolean(draft.is_primary),
        consultation_fee: consultationFee,
        description: draft.description || "",
      };

      console.log("Sending update data:", updateData);
      console.log("Workplace ID:", draft.id);
      console.log("Workplace ID type:", typeof draft.id);
      console.log("Workplace ID length:", draft.id?.length);
      console.log("API URL:", `${API_BASE}/doctors/workplaces/${draft.id}`);
      console.log("Token (first 20 chars):", token.substring(0, 20) + "...");
      console.log("Full token:", token);

      const response = await axios.put(
        `${API_BASE}/doctors/workplaces/${draft.id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const updated = { ...draft, ...response.data.data };
        setWorkplace(updated);
        setDraft(updated);
        setEdit(false);
      } else {
        throw new Error(response.data.message || "Failed to save changes");
      }
    } catch (e: any) {
      console.error("Error saving workplace:", e);
      console.error("Error response:", e.response?.data);
      console.error("Error status:", e.response?.status);
      console.error("Error headers:", e.response?.headers);

      if (e.response?.status === 500) {
        setError(
          "Internal server error. The backend service may be experiencing issues. Please try again later or contact support."
        );
      } else if (e.response?.status === 404) {
        setError(
          "Workplace not found. The workplace may have been deleted or you may not have permission to edit it."
        );
      } else if (e.response?.status === 403) {
        setError(
          "Access denied. You do not have permission to edit this workplace."
        );
      } else {
        setError(e.response?.data?.message || e.message || "Failed to save");
      }
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

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(addEmail.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    setError(null);
    setSaving(true);

    try {
      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("access_token") ||
        sessionStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log("Inviting assistant:", addEmail.trim());
      console.log("Workplace ID:", draft.id);

      const response = await axios.post(
        `${API_BASE}/doctors/workplaces/${draft.id}/assistants`,
        {
          email: addEmail.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const assistant: Assistant = response.data.data;
        setDraft((d) =>
          d ? { ...d, assistants: [...(d.assistants ?? []), assistant] } : d
        );
        setAddEmail("");

        // Show success message
        setError(null);
        console.log("Assistant invited successfully:", assistant);
      } else {
        throw new Error(response.data.message || "Unable to add assistant");
      }
    } catch (e: any) {
      console.error("Error adding assistant:", e);
      console.error("Error response:", e.response?.data);

      let errorMessage = "Failed to add assistant";
      if (e.response?.status === 400) {
        errorMessage =
          e.response?.data?.message ||
          "Invalid email address or assistant already exists";
      } else if (e.response?.status === 404) {
        errorMessage = "Workplace not found";
      } else if (e.response?.status === 403) {
        errorMessage =
          "You don't have permission to add assistants to this workplace";
      } else if (e.response?.status === 409) {
        errorMessage =
          "This assistant is already invited or already has access";
      } else if (e.message) {
        errorMessage = e.message;
      }

      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  }

  async function removeAssistant(a: Assistant) {
    if (!draft) return;
    setError(null);
    try {
      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("access_token") ||
        sessionStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.delete(
        `${API_BASE}/doctors/workplaces/${draft.id}/assistants/${a.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setDraft((d) =>
          d
            ? {
                ...d,
                assistants: (d.assistants ?? []).filter((x) => x.id !== a.id),
              }
            : d
        );
      } else {
        throw new Error(response.data.message || "Unable to remove assistant");
      }
    } catch (e: any) {
      console.error("Error removing assistant:", e);
      setError(
        e.response?.data?.message || e.message || "Failed to remove assistant"
      );
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
    { value: "clinic", label: "Clinic" },
    { value: "hospital", label: "Hospital" },
    { value: "private_practice", label: "Private Practice" },
    { value: "medical_center", label: "Medical Center" },
    { value: "home_visits", label: "Home Visits" },
  ];

  return (
    <div className="wpd-container">
      <header className="wpd-header">
        <div className="wpd-header-main">
          <h1 className="wpd-title">{draft.workplace_name || "Workplace"}</h1>
          <div className="wpd-subtitle">
            <span className="wpd-chip">
              {TYPE_OPTIONS.find(
                (option) => option.value === draft.workplace_type
              )?.label || draft.workplace_type}
            </span>
            <span className={`wpd-chip ${draft.is_primary ? "ok" : ""}`}>
              {draft.is_primary ? "Primary" : "Secondary"}
            </span>
          </div>
        </div>

        <div className="wpd-header-actions">
          {!edit ? (
            <Button
              iconLeft={<EditIcon width={24} />}
              text="Edit"
              onClick={() => setEdit(true)}
            />
          ) : (
            <>
              <Button
                iconLeft={<CancelIcon width={16} />}
                variant="secondary"
                text="Cancel"
                onClick={cancel}
                disabled={saving}
              />
              <Button
                iconLeft={<SaveIcon width={24} />}
                text={saving ? "Saving…" : "Save changes"}
                onClick={save}
                disabled={saving}
              />
            </>
          )}
          <Button
            iconLeft={<TrashIcon width={20} />}
            variant="tertiary"
            className="btn--danger-delete"
            text="Delete"
            onClick={() => {
              console.log(
                "Delete button clicked, setting showDeleteWorkplace to true"
              );
              setShowDeleteWorkplace(true);
            }}
          ></Button>
        </div>
      </header>

      {error && <div className="wpd-alert wpd-alert-error">{error}</div>}

      {/* TABS (same class names used in DoctorAppointments) */}
      <div className="appointments-tabs">
        <button
          className={`appointments-tab ${activeTab === "details" ? "active" : ""}`}
          onClick={() => setActiveTab("details")}
        >
          Details
        </button>
        <button
          className={`appointments-tab ${activeTab === "availability" ? "active" : ""}`}
          onClick={() => setActiveTab("availability")}
        >
          Availability
        </button>
      </div>

      <div className="appointments-tab-content fade-in">
        {activeTab === "details" ? (
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
                      onChange={(e) =>
                        onChange(
                          "workplace_name",
                          (e.target as HTMLInputElement).value
                        )
                      }
                      variant="disabled"
                    />

                    <SearchSelect
                      label="Workplace type"
                      placeholder="Select type"
                      searchPlaceholder="Search type"
                      options={TYPE_OPTIONS}
                      value={draft.workplace_type}
                      onChange={(val) =>
                        onChange("workplace_type", val as WorkplaceType)
                      }
                      variant="disabled"
                    />
                  </div>

                  {draft.image_url && (
                    <div className="wpd-row">
                      <div className="wpd-field">
                        <label className="wpd-label">Workplace Image</label>
                        <div className="wpd-image-preview">
                          <img
                            src={draft.image_url}
                            alt="Workplace"
                            className="wpd-workplace-image"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="wpd-row">
                    <div className="wpd-field">
                      <label className="wpd-label">Primary workplace?</label>
                      <div
                        className={`wpd-toggle-wrap ${!edit ? "is-disabled" : ""}`}
                      >
                        <Toggle
                          checked={draft.is_primary}
                          onChange={(v: boolean) => onChange("is_primary", v)}
                          disabled={!edit}
                        />
                      </div>
                    </div>

                    <PhoneInput
                      label="Phone number"
                      value={draft.phone_number}
                      onChange={(e164) => onChange("phone_number", e164)}
                      variant="disabled"
                    />
                  </div>

                  <div className="wpd-row">
                    <CustomInput
                      label="Consultation fee"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.01"
                      placeholder="e.g., 30"
                      value={String(draft.consultation_fee ?? "")}
                      onChange={(e) =>
                        onChange(
                          "consultation_fee",
                          Number((e.target as HTMLInputElement).value)
                        )
                      }
                      onBlur={(e) =>
                        onChange(
                          "consultation_fee",
                          Number(
                            toMoney((e.target as HTMLInputElement).value || 0)
                          )
                        )
                      }
                      variant={!edit ? "disabled" : "normal"}
                      rightIcon={<span className="wpd-amount-suffix">USD</span>}
                    />
                    <div />
                  </div>

                  <CustomInput
                    label="Description"
                    placeholder="Enter workplace description..."
                    value={draft.description || stateWp?.description || ""}
                    onChange={(e) =>
                      onChange(
                        "description",
                        (e.target as HTMLInputElement).value
                      )
                    }
                    variant={!edit ? "disabled" : "normal"}
                    as="textarea"
                  />
                </section>

                {/* Additional Workplace Information */}
                {(draft.email ||
                  stateWp?.email ||
                  draft.description ||
                  stateWp?.description ||
                  draft.website ||
                  stateWp?.website) && (
                  <section className="wpd-card">
                    <div className="wpd-section-header">
                      <h2>Additional Information</h2>
                      <p>Additional workplace details from the database.</p>
                    </div>

                    <div className="wpd-address-display">
                      {(draft.email || stateWp?.email) && (
                        <div className="wpd-address-field">
                          <label className="wpd-address-label">Email:</label>
                          <div className="wpd-address-value">
                            {draft.email || stateWp?.email}
                          </div>
                        </div>
                      )}

                      {(draft.description || stateWp?.description) && (
                        <div className="wpd-address-field">
                          <label className="wpd-address-label">
                            Description:
                          </label>
                          <div className="wpd-address-value">
                            {draft.description || stateWp?.description}
                          </div>
                        </div>
                      )}

                      {(draft.website || stateWp?.website) && (
                        <div className="wpd-address-field">
                          <label className="wpd-address-label">Website:</label>
                          <div className="wpd-address-value">
                            <a
                              href={draft.website || stateWp?.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="wpd-maps-link"
                            >
                              {draft.website || stateWp?.website}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* Services and Insurance Information */}
                {((draft.services_offered &&
                  draft.services_offered.length > 0) ||
                  (stateWp?.services_offered &&
                    stateWp.services_offered.length > 0) ||
                  (draft.insurance_accepted &&
                    draft.insurance_accepted.length > 0) ||
                  (stateWp?.insurance_accepted &&
                    stateWp.insurance_accepted.length > 0)) && (
                  <section className="wpd-card">
                    <div className="wpd-section-header">
                      <h2>Services & Insurance</h2>
                      <p>Services offered and insurance accepted.</p>
                    </div>

                    <div className="wpd-address-display">
                      {((draft.services_offered &&
                        draft.services_offered.length > 0) ||
                        (stateWp?.services_offered &&
                          stateWp.services_offered.length > 0)) && (
                        <div className="wpd-address-field">
                          <label className="wpd-address-label">
                            Services Offered:
                          </label>
                          <div className="wpd-address-value">
                            <div className="wpd-chips-container">
                              {(
                                draft.services_offered ||
                                stateWp?.services_offered ||
                                []
                              ).map((service, index) => (
                                <span key={index} className="wpd-chip-display">
                                  {service}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {((draft.insurance_accepted &&
                        draft.insurance_accepted.length > 0) ||
                        (stateWp?.insurance_accepted &&
                          stateWp.insurance_accepted.length > 0)) && (
                        <div className="wpd-address-field">
                          <label className="wpd-address-label">
                            Insurance Accepted:
                          </label>
                          <div className="wpd-address-value">
                            <div className="wpd-chips-container">
                              {(
                                draft.insurance_accepted ||
                                stateWp?.insurance_accepted ||
                                []
                              ).map((insurance, index) => (
                                <span key={index} className="wpd-chip-display">
                                  {insurance}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                <section className="wpd-card">
                  <div className="wpd-section-header">
                    <h2>Address Information</h2>
                    <p>Complete address details from the database.</p>
                  </div>

                  {/* Debug information - remove this later */}
                  {/* <div
                    className="wpd-address-field"
                    style={{
                      backgroundColor: "#f0f0f0",
                      padding: "10px",
                      marginBottom: "20px",
                      borderRadius: "5px",
                    }}
                  >
                    <label className="wpd-address-label">
                      Debug - Available Data:
                    </label>
                    <div
                      className="wpd-address-value"
                      style={{ fontSize: "12px", whiteSpace: "pre-wrap" }}
                    >
                      {JSON.stringify(
                        {
                          address: stateWp?.address,
                          addresses: stateWp?.addresses,
                          location: stateWp?.location,
                          street: stateWp?.street,
                          city: stateWp?.city,
                          state: stateWp?.state,
                          country: stateWp?.country,
                        },
                        null,
                        2
                      )}
                    </div>
                  </div> */}

                  {/* Display actual database address data */}
                  <div className="wpd-address-display">
                    <div className="wpd-address-field">
                      <label className="wpd-address-label">
                        Street Address:
                      </label>
                      <div className="wpd-address-value">
                        {stateWp?.address?.street ||
                          (Array.isArray(stateWp?.addresses) &&
                            stateWp?.addresses[0]?.street) ||
                          stateWp?.addresses?.street ||
                          stateWp?.street ||
                          stateWp?.location ||
                          draft.address?.street ||
                          "Not specified"}
                      </div>
                    </div>

                    <div className="wpd-address-field">
                      <label className="wpd-address-label">City:</label>
                      <div className="wpd-address-value">
                        {stateWp?.address?.city ||
                          (Array.isArray(stateWp?.addresses) &&
                            stateWp?.addresses[0]?.city) ||
                          stateWp?.addresses?.city ||
                          stateWp?.city ||
                          draft.address?.city ||
                          "Not specified"}
                      </div>
                    </div>

                    <div className="wpd-address-field">
                      <label className="wpd-address-label">
                        State/Governorate:
                      </label>
                      <div className="wpd-address-value">
                        {stateWp?.address?.state ||
                          (Array.isArray(stateWp?.addresses) &&
                            stateWp?.addresses[0]?.state) ||
                          stateWp?.addresses?.state ||
                          stateWp?.state ||
                          draft.address?.state ||
                          "Not specified"}
                      </div>
                    </div>

                    <div className="wpd-address-field">
                      <label className="wpd-address-label">Country:</label>
                      <div className="wpd-address-value">
                        {stateWp?.address?.country ||
                          (Array.isArray(stateWp?.addresses) &&
                            stateWp?.addresses[0]?.country) ||
                          stateWp?.addresses?.country ||
                          stateWp?.country ||
                          draft.address?.country ||
                          "Not specified"}
                      </div>
                    </div>

                    {(draft.address?.building_name ||
                      stateWp?.address?.building_name) && (
                      <div className="wpd-address-field">
                        <label className="wpd-address-label">
                          Building Name:
                        </label>
                        <div className="wpd-address-value">
                          {draft.address?.building_name ||
                            stateWp?.address?.building_name}
                        </div>
                      </div>
                    )}

                    {(draft.address?.building_number ||
                      stateWp?.address?.building_number) && (
                      <div className="wpd-address-field">
                        <label className="wpd-address-label">
                          Building Number:
                        </label>
                        <div className="wpd-address-value">
                          {draft.address?.building_number ||
                            stateWp?.address?.building_number}
                        </div>
                      </div>
                    )}

                    {(draft.address?.floor_number ||
                      stateWp?.address?.floor_number) && (
                      <div className="wpd-address-field">
                        <label className="wpd-address-label">
                          Floor Number:
                        </label>
                        <div className="wpd-address-value">
                          {draft.address?.floor_number ||
                            stateWp?.address?.floor_number}
                        </div>
                      </div>
                    )}

                    {(draft.address?.zipcode || stateWp?.address?.zipcode) && (
                      <div className="wpd-address-field">
                        <label className="wpd-address-label">
                          Postal Code:
                        </label>
                        <div className="wpd-address-value">
                          {draft.address?.zipcode || stateWp?.address?.zipcode}
                        </div>
                      </div>
                    )}

                    {(draft.address?.area_description ||
                      stateWp?.address?.area_description) && (
                      <div className="wpd-address-field">
                        <label className="wpd-address-label">
                          Area Description:
                        </label>
                        <div className="wpd-address-value">
                          {draft.address?.area_description ||
                            stateWp?.address?.area_description}
                        </div>
                      </div>
                    )}

                    {(draft.address?.maps_link ||
                      stateWp?.address?.maps_link) && (
                      <div className="wpd-address-field">
                        <label className="wpd-address-label">Maps Link:</label>
                        <div className="wpd-address-value">
                          <a
                            href={
                              draft.address?.maps_link ||
                              stateWp?.address?.maps_link
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="wpd-maps-link"
                          >
                            {draft.address?.maps_link ||
                              stateWp?.address?.maps_link}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {embedUrl && (
                    <div className="wpd-map-embed">
                      <iframe
                        title="Workplace location"
                        src={embedUrl}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
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
                    <div className="wpd-invite-section">
                      <h3>Invite New Assistant</h3>
                      <p>
                        Send an invitation to a new assistant to join this
                        workplace.
                      </p>

                      <div className="wpd-invite-form">
                        <CustomInput
                          label="Assistant Email Address"
                          placeholder="assistant@clinic.com"
                          value={addEmail}
                          onChange={(e) => {
                            const value = (e.target as HTMLInputElement).value;
                            setAddEmail(value);
                            // Clear any previous errors when user starts typing
                            if (error && error.includes("assistant")) {
                              setError(null);
                            }
                          }}
                          variant="normal"
                          type="email"
                        />

                        <div className="wpd-invite-actions">
                          <Button
                            text="Send Invitation"
                            onClick={addAssistant}
                            disabled={!addEmail.trim() || saving}
                            iconLeft={
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 32 32"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M28 6.00049H4C3.73478 6.00049 3.48043 6.10585 3.29289 6.29338C3.10536 6.48092 3 6.73527 3 7.00049V24.0005C3 24.5309 3.21071 25.0396 3.58579 25.4147C3.96086 25.7898 4.46957 26.0005 5 26.0005H27C27.5304 26.0005 28.0391 25.7898 28.4142 25.4147C28.7893 25.0396 29 24.5309 29 24.0005V7.00049C29 6.73527 28.8946 6.48092 28.7071 6.29338C28.5196 6.10585 28.2652 6.00049 28 6.00049ZM25.4287 8.00049L16 16.6442L6.57125 8.00049H25.4287ZM27 24.0005H5V9.27424L15.3237 18.738C15.5082 18.9073 15.7496 19.0013 16 19.0013C16.2504 19.0013 16.4918 18.9073 16.6763 18.738L27 9.27424V24.0005Z"
                                  fill="currentColor"
                                />
                              </svg>
                            }
                          />
                          {addEmail.trim() && (
                            <Button
                              text="Clear"
                              variant="secondary"
                              onClick={() => setAddEmail("")}
                            />
                          )}
                        </div>
                      </div>

                      <div className="wpd-invite-info">
                        <h4>What happens when you invite an assistant?</h4>
                        <ul>
                          <li>
                            An invitation email will be sent to the assistant
                          </li>
                          <li>
                            The assistant will need to create an account if they
                            don't have one
                          </li>
                          <li>
                            Once accepted, they'll have access to manage this
                            workplace
                          </li>
                          <li>You can remove assistants at any time</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="wpd-assistants-section">
                    <div className="wpd-assistants-header">
                      <h3>Current Assistants ({assistants.length})</h3>
                      {assistants.length > 0 && (
                        <p>
                          Manage assistants who have access to this workplace.
                        </p>
                      )}
                    </div>

                    {assistants.length === 0 ? (
                      <div className="wpd-empty-state">
                        <div className="wpd-empty-icon">
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 32 32"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M18.9998 10.0005C18.9998 9.7353 19.1051 9.48095 19.2927 9.29341C19.4802 9.10587 19.7346 9.00052 19.9998 9.00052H30.9998C31.265 9.00052 31.5194 9.10587 31.7069 9.29341C31.8944 9.48095 31.9998 9.7353 31.9998 10.0005C31.9998 10.2657 31.8944 10.5201 31.7069 10.7076C31.5194 10.8952 31.265 11.0005 30.9998 11.0005H19.9998C19.7346 11.0005 19.4802 10.8952 19.2927 10.7076C19.1051 10.5201 18.9998 10.2657 18.9998 10.0005ZM30.9998 15.0005H19.9998C19.7346 15.0005 19.4802 15.1059 19.2927 15.2934C19.1051 15.4809 18.9998 15.7353 18.9998 16.0005C18.9998 16.2657 19.1051 16.5201 19.2927 16.7076C19.4802 16.8952 19.7346 17.0005 19.9998 17.0005H30.9998C31.265 17.0005 31.5194 16.8952 31.7069 16.7076C31.8944 16.5201 31.9998 16.2657 31.9998 16.0005C31.9998 15.7353 31.8944 15.4809 31.7069 15.2934C31.5194 15.1059 31.265 15.0005 30.9998 15.0005ZM30.9998 21.0005H22.9998C22.7346 21.0005 22.4802 21.1059 22.2927 21.2934C22.1051 21.4809 21.9998 21.7353 21.9998 22.0005C21.9998 22.2657 22.1051 22.5201 22.2927 22.7076C22.4802 22.8952 22.7346 23.0005 22.9998 23.0005H30.9998C31.265 23.0005 31.5194 22.8952 31.7069 22.7076C31.8944 22.5201 31.9998 22.2657 31.9998 22.0005C31.9998 21.7353 31.8944 21.4809 31.7069 21.2934C31.5194 21.1059 31.265 21.0005 30.9998 21.0005ZM18.9685 23.7505C19.0012 23.8777 19.0085 24.0101 18.99 24.1402C18.9715 24.2702 18.9276 24.3954 18.8608 24.5084C18.7939 24.6215 18.7054 24.7203 18.6004 24.7991C18.4953 24.878 18.3758 24.9354 18.2485 24.968C18.167 24.99 18.083 25.0009 17.9985 25.0005C17.7768 25.0006 17.5612 24.927 17.3859 24.7912C17.2105 24.6555 17.0852 24.4653 17.0298 24.2505C16.2598 21.258 13.2373 19.0005 9.99854 19.0005C6.75979 19.0005 3.73729 21.2568 2.96729 24.2505C2.90098 24.5074 2.73533 24.7275 2.50677 24.8623C2.27821 24.9971 2.00547 25.0356 1.74854 24.9693C1.49161 24.903 1.27154 24.7373 1.13675 24.5087C1.00196 24.2802 0.963484 24.0074 1.02979 23.7505C1.72854 21.0368 3.75979 18.8393 6.33729 17.7505C5.34483 16.9861 4.61652 15.9302 4.25452 14.7309C3.89251 13.5316 3.91496 12.2491 4.31872 11.0633C4.72248 9.87737 5.48729 8.84762 6.5059 8.1184C7.5245 7.38918 8.74581 6.99707 9.99854 6.99707C11.2513 6.99707 12.4726 7.38918 13.4912 8.1184C14.5098 8.84762 15.2746 9.87737 15.6784 11.0633C16.0821 12.2491 16.1046 13.5316 15.7426 14.7309C15.3806 15.9302 14.6522 16.9861 13.6598 17.7505C16.2385 18.8393 18.2698 21.0368 18.9685 23.7505ZM9.99979 17.0005C10.7909 17.0005 11.5643 16.7659 12.2221 16.3264C12.8799 15.8869 13.3926 15.2622 13.6953 14.5313C13.9981 13.8003 14.0773 12.9961 13.9229 12.2202C13.7686 11.4442 13.3876 10.7315 12.8282 10.1721C12.2688 9.61268 11.5561 9.23172 10.7801 9.07737C10.0042 8.92303 9.19996 9.00225 8.46905 9.305C7.73815 9.60775 7.11343 10.1204 6.67391 10.7782C6.23438 11.436 5.99979 12.2094 5.99979 13.0005C5.99979 14.0614 6.42122 15.0788 7.17136 15.8289C7.92151 16.5791 8.93892 17.0005 9.99979 17.0005Z"
                              fill="var(--neutral-500)"
                            />
                          </svg>
                        </div>
                        <h4>No assistants yet</h4>
                        <p>
                          Invite assistants to help manage this workplace.
                          They'll receive an email invitation to join.
                        </p>
                      </div>
                    ) : (
                      <ul className="wpd-assistant-list">
                        {assistants.map((a) => (
                          <li key={a.id} className="wpd-assistant-item">
                            <div className="wpd-assistant-avatar">
                              <span>{a.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="wpd-assistant-meta">
                              <div className="wpd-assistant-name">{a.name}</div>
                              <div className="wpd-assistant-email">
                                {a.email}
                              </div>
                              {a.phone && (
                                <div className="wpd-assistant-phone">
                                  {a.phone}
                                </div>
                              )}
                              <div className="wpd-assistant-status">
                                <span className="wpd-status-badge wpd-status-active">
                                  Active
                                </span>
                              </div>
                            </div>
                            <div className="wpd-assistant-actions">
                              <Button
                                variant="tertiary"
                                text="Remove"
                                onClick={() =>
                                  setShowDeleteAssistant({ assistant: a })
                                }
                                className="btn--danger"
                              />
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
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
            workplaceId={draft.id}
            workingHours={draft.working_hours}
          />
        )}
      </div>
      {showDeleteWorkplace && draft && (
        <DeleteConfirmationModal
          name={draft.workplace_name || "this workplace"}
          onCancel={() => {
            console.log("Delete modal cancelled");
            setShowDeleteWorkplace(false);
          }}
          onConfirm={() => {
            console.log("Delete confirmed");
            deleteWorkplace();
          }}
        />
      )}
    </div>
  );
}
