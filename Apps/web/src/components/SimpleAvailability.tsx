import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

type Weekday = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
const DAYS: Weekday[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

type DayWindow = {
  start: string;
  end: string;
  slotMinutes: number;
  slots: string[];
};

type AvailabilityMap = Partial<Record<Weekday, DayWindow>>;

function makeSlots(start: string, end: string, minutes: number): string[] {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  const slots: string[] = [];
  
  for (let time = startMin; time < endMin; time += minutes) {
    const h = Math.floor(time / 60);
    const m = time % 60;
    slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
  }
  
  return slots;
}

function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const newH = Math.floor(totalMinutes / 60);
  const newM = totalMinutes % 60;
  return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
}

interface SimpleAvailabilityProps {
  workplaceId: string;
  editable: boolean;
}

export default function SimpleAvailability({ workplaceId, editable }: SimpleAvailabilityProps) {
  const [slotMinutes, setSlotMinutes] = useState<number>(30);
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");
  const [availability, setAvailability] = useState<AvailabilityMap>({});
  const [selectedDay, setSelectedDay] = useState<Weekday>("MON");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load availability
  useEffect(() => {
    const loadAvailability = async () => {
      if (!workplaceId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem("access_token") || 
                     localStorage.getItem("token") || 
                     sessionStorage.getItem("access_token") || 
                     sessionStorage.getItem("token");
        
        if (!token) {
          console.log('No token found, starting with empty availability');
          setAvailability({});
          setLoading(false);
          return;
        }
        
        const response = await axios.get(
          `${API_BASE}/doctors/workplaces`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (response.data.success && response.data.data) {
          const workplaces = response.data.data;
          console.log('Loaded workplaces from database:', workplaces);
          
          // Find the specific workplace by ID
          const workplace = workplaces.find((wp: any) => wp.id === workplaceId);
          
          if (workplace && workplace.working_hours && typeof workplace.working_hours === 'object') {
            console.log('Found workplace and loaded working_hours:', workplace.working_hours);
            setAvailability(workplace.working_hours);
            
            // Find first day with data after setting availability
            const firstWithData = DAYS.find((d) => workplace.working_hours[d]?.slots?.length);
            setSelectedDay(firstWithData || 'MON');
          } else {
            console.log('No working_hours found for this workplace');
            setAvailability({});
            setSelectedDay('MON');
          }
        } else {
          console.log('No workplace data found');
          setAvailability({});
          setSelectedDay('MON');
        }
        
      } catch (err: any) {
        console.error('Error loading availability:', err);
        // Don't show error, just start with empty availability
        console.log('Starting with empty availability due to API error');
        setAvailability({});
        setError(null); // Don't show error to user
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, [workplaceId]);

  const handleGenerate = () => {
    if (!editable) return;
    const all = makeSlots(startTime, endTime, slotMinutes);
    setAvailability((prev) => ({
      ...prev,
      [selectedDay]: {
        start: startTime,
        end: endTime,
        slotMinutes,
        slots: all,
      },
    }));
  };

  const handleToggleSlot = (slot: string) => {
    if (!editable) return;
    setAvailability((prev) => {
      const day = prev[selectedDay] ?? {
        start: startTime,
        end: endTime,
        slotMinutes,
        slots: [] as string[],
      };
      
      const isSelected = day.slots.includes(slot);
      return {
        ...prev,
        [selectedDay]: {
          ...day,
          slots: isSelected
            ? day.slots.filter(s => s !== slot)
            : [...day.slots, slot].sort()
        }
      };
    });
  };

  const handleSaveAvailability = useCallback(async () => {
    if (!editable || !workplaceId) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const token = localStorage.getItem("access_token") || 
                   localStorage.getItem("token") || 
                   sessionStorage.getItem("access_token") || 
                   sessionStorage.getItem("token");
      
      if (!token) {
        setError("Please log in to save availability");
        return;
      }
      
      const availableDays = (Object.keys(availability) as Weekday[]).filter(day => {
        const dayData = availability[day];
        return dayData && dayData.slots && dayData.slots.length > 0;
      }).map(day => {
        const dayMap: { [key in Weekday]: string } = {
          'MON': 'Monday', 'TUE': 'Tuesday', 'WED': 'Wednesday', 'THU': 'Thursday',
          'FRI': 'Friday', 'SAT': 'Saturday', 'SUN': 'Sunday'
        };
        return dayMap[day];
      });
      
      console.log('Saving availability data:', {
        availableDays,
        working_hours: availability,
        workplaceId
      });
      
      const response = await axios.put(
        `${API_BASE}/doctors/workplaces/${workplaceId}`,
        {
          available_days: availableDays,
          working_hours: availability
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      console.log('Save response:', response.data);
      
      setSuccess('Availability saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err: any) {
      console.error('Error saving availability:', err);
      if (err.response?.status === 404) {
        setError("Backend server is not running. Please start the backend and try again.");
      } else if (err.response?.status === 401) {
        setError("Please log in again to save availability");
      } else {
        setError(err.message || 'Failed to save availability');
      }
    } finally {
      setSaving(false);
    }
  }, [editable, workplaceId, availability]);

  const day = availability[selectedDay];
  const allSlots = day ? makeSlots(day.start, day.end, day.slotMinutes) : [];

  return (
    <div className="wpd-card">
      <div className="wpd-section-header">
        <h2>Availability</h2>
        <p>Select days and time slots when you're available for appointments.</p>
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
        <div className="wpd-alert wpd-alert-info">
          Loading availability data...
        </div>
      )}

      {!loading && Object.keys(availability).length === 0 && (
        <div className="wpd-alert wpd-alert-info">
          <strong>Note:</strong> No availability data loaded. You can still set up your availability below and save it when the backend is running.
        </div>
      )}

      {saving && (
        <div className="wpd-alert wpd-alert-info">
          Saving availability... Please wait.
        </div>
      )}

      {/* Controls */}
      <div className="wpd-av-controls">
        <div className="wpd-field">
          <label className="wpd-label">Slot Duration</label>
          <select 
            className="wpd-select"
            value={slotMinutes} 
            onChange={(e) => setSlotMinutes(Number(e.target.value))}
            disabled={!editable}
          >
            <option value={10}>10 minutes</option>
            <option value={15}>15 minutes</option>
            <option value={20}>20 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
          </select>
        </div>

        <div className="wpd-field">
          <label className="wpd-label">Start Time</label>
          <input 
            type="time" 
            className="wpd-input"
            value={startTime} 
            onChange={(e) => setStartTime(e.target.value)}
            disabled={!editable}
          />
        </div>

        <div className="wpd-field">
          <label className="wpd-label">End Time</label>
          <input 
            type="time" 
            className="wpd-input"
            value={endTime} 
            onChange={(e) => setEndTime(e.target.value)}
            disabled={!editable}
          />
        </div>

        <button 
          className="btn btn--secondary"
          onClick={handleGenerate}
          disabled={!editable}
        >
          Generate Slots
        </button>
      </div>

      {/* Days */}
      <div className="wpd-av-days">
        <h3 className="wpd-av-subtitle">Select Days</h3>
        <div className="wpd-days">
          {DAYS.map((day) => {
            const hasData = Boolean(availability[day]?.slots?.length);
            const isActive = selectedDay === day;
            return (
              <button
                key={day}
                className={`wpd-day ${isActive ? 'is-selected' : ''} ${hasData ? 'has-data' : ''}`}
                onClick={() => setSelectedDay(day)}
                disabled={!editable}
              >
                {day}
                {hasData && <span className="wpd-existing-indicator" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDay && availability[selectedDay] && (
        <div className="wpd-av-slots">
          <h3 className="wpd-av-subtitle">Time Slots for {selectedDay}</h3>
          <div className="wpd-slots">
            {allSlots.map((timeSlot) => {
              const isSelected = day?.slots.includes(timeSlot) || false;
              return (
                <button
                  key={timeSlot}
                  className={`wpd-chip ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleToggleSlot(timeSlot)}
                  disabled={!editable}
                >
                  {timeSlot}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="wpd-av-footer">
        <div className="wpd-av-actions">
          <button
            className="btn btn--primary"
            onClick={handleSaveAvailability}
            disabled={!editable || saving || loading}
          >
            {saving ? 'Saving...' : 'Save Availability'}
          </button>
        </div>
      </div>
    </div>
  );
}
