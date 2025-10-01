import React, { useState, useEffect, useCallback } from 'react';
import {
    Calendar,
    dateFnsLocalizer,
    Event,
    View,
    ToolbarProps,
} from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isBefore } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../styles/doctorCalendar.css';
import CustomText from '../../components/Text/CustomText';
import AppointmentCard from '../../components/Appointment/AppointmentCard';
import Button from '../../components/Button/Button';
import CustomInput from '../../components/Inputs/CustomInput';
import axios from 'axios';

const API_BASE = "http://localhost:3000";

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface Appointment extends Omit<Event, 'start' | 'end'> {
    id: string;
    title: string;
    start: Date;
    end: Date;
    patientName: string;
    consultationType: string;
    status: 'scheduled' | 'pending' | 'completed' | 'cancelled' | 'rejected';
    avatarUrl?: string;
    video?: boolean;
    contact?: {
        phone: string;
        email: string;
        notes?: string;
        lastVisit?: string;
    };
    symptoms?: string;
    diagnosis?: string;
    prescription?: string;
    notes?: string;
    consultation_fee?: number;
    workplace?: string;
    appointment_date: string;
    appointment_time: string;
    createdAt: string;
    updatedAt: string;
}


// API functions
async function fetchAppointments(): Promise<Appointment[]> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    try {
        const response = await axios.get(`${API_BASE}/doctors/appointments`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Calendar appointments API response:', response.data);
        const appointments = response.data.data?.appointments || response.data.appointments || [];
        
        // Transform appointments to calendar format
        return appointments.map((appt: any) => ({
            id: appt.id,
            title: appt.symptoms || 'Appointment',
            start: new Date(`${appt.appointment_date}T${appt.appointment_time}`),
            end: new Date(new Date(`${appt.appointment_date}T${appt.appointment_time}`).getTime() + 30 * 60 * 1000), // 30 min duration
            patientName: appt.patientName || 'Unknown Patient',
            consultationType: appt.workplace || 'Consultation',
            status: appt.status,
            symptoms: appt.symptoms,
            diagnosis: appt.diagnosis,
            prescription: appt.prescription,
            notes: appt.notes,
            consultation_fee: appt.consultation_fee,
            workplace: appt.workplace,
            appointment_date: appt.appointment_date,
            appointment_time: appt.appointment_time,
            createdAt: appt.createdAt,
            updatedAt: appt.updatedAt,
            avatarUrl: '/avatars/default.png', // Default avatar
            video: false,
        }));
    } catch (error: any) {
        console.error('Failed to fetch appointments for calendar:', error);
        // Try the /me endpoint as fallback
        try {
            const meResponse = await axios.get(`${API_BASE}/doctors/appointments/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Calendar appointments /me API response:', meResponse.data);
            const appointments = meResponse.data.data?.appointments || meResponse.data.appointments || [];
            
            return appointments.map((appt: any) => ({
                id: appt.id,
                title: appt.symptoms || 'Appointment',
                start: new Date(`${appt.appointment_date}T${appt.appointment_time}`),
                end: new Date(new Date(`${appt.appointment_date}T${appt.appointment_time}`).getTime() + 30 * 60 * 1000),
                patientName: appt.patientName || 'Unknown Patient',
                consultationType: appt.workplace || 'Consultation',
                status: appt.status,
                symptoms: appt.symptoms,
                diagnosis: appt.diagnosis,
                prescription: appt.prescription,
                notes: appt.notes,
                consultation_fee: appt.consultation_fee,
                workplace: appt.workplace,
                appointment_date: appt.appointment_date,
                appointment_time: appt.appointment_time,
                createdAt: appt.createdAt,
                updatedAt: appt.updatedAt,
                avatarUrl: '/avatars/default.png',
                video: false,
            }));
        } catch (meError: any) {
            console.error('Failed to fetch appointments from /me endpoint:', meError);
            throw meError;
        }
    }
}

async function updateAppointmentStatus(appointmentId: string, status: string, reason?: string): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    await axios.put(`${API_BASE}/doctors/appointments/${appointmentId}/status`, {
        status,
        reason
    }, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
}

// Modal component for appointment details
const AppointmentModal: React.FC<{
    appointment: Appointment | null;
    onClose: () => void;
    onAction: (appointmentId: string, action: string, reason?: string) => void;
    actionLoading: string | null;
}> = ({ appointment, onClose, onAction, actionLoading }) => {
    const [cancelReason, setCancelReason] = useState('');
    const [showCancelInput, setShowCancelInput] = useState(false);

    if (!appointment) return null;

    const isCurrentAppointment = () => {
        const apptDate = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
        const now = new Date();
        const timeDiff = Math.abs(apptDate.getTime() - now.getTime());
        return timeDiff <= 30 * 60 * 1000; // Within 30 minutes
    };

    const handleAction = (action: string) => {
        if (action === 'cancel' && !showCancelInput) {
            setShowCancelInput(true);
            return;
        }
        
        if (action === 'cancel' && showCancelInput) {
            if (!cancelReason.trim()) return;
            onAction(appointment.id, action, cancelReason);
        } else {
            onAction(appointment.id, action);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Appointment Details</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                
                <div className="modal-body">
                    <div className="appointment-info">
                        <div className="info-row">
                            <span className="label">Patient:</span>
                            <span className="value">{appointment.patientName}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Date:</span>
                            <span className="value">{format(appointment.start, 'MMMM dd, yyyy')}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Time:</span>
                            <span className="value">{format(appointment.start, 'hh:mm a')} - {format(appointment.end, 'hh:mm a')}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Status:</span>
                            <span className={`status-badge ${appointment.status}`}>
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                        </div>
                        {appointment.workplace && (
                            <div className="info-row">
                                <span className="label">Location:</span>
                                <span className="value">{appointment.workplace}</span>
                            </div>
                        )}
                        {appointment.symptoms && (
                            <div className="info-row">
                                <span className="label">Symptoms:</span>
                                <span className="value">{appointment.symptoms}</span>
                            </div>
                        )}
                        {appointment.diagnosis && (
                            <div className="info-row">
                                <span className="label">Diagnosis:</span>
                                <span className="value">{appointment.diagnosis}</span>
                            </div>
                        )}
                        {appointment.prescription && (
                            <div className="info-row">
                                <span className="label">Prescription:</span>
                                <span className="value">{appointment.prescription}</span>
                            </div>
                        )}
                        {appointment.notes && (
                            <div className="info-row">
                                <span className="label">Notes:</span>
                                <span className="value">{appointment.notes}</span>
                            </div>
                        )}
                        {appointment.consultation_fee && (
                            <div className="info-row">
                                <span className="label">Fee:</span>
                                <span className="value">${appointment.consultation_fee}</span>
                            </div>
                        )}
                        {isCurrentAppointment() && (
                            <div className="current-badge">NOW</div>
                        )}
                    </div>

                    {showCancelInput && (
                        <div className="cancel-input">
                            <CustomInput
                                as="textarea"
                                placeholder="Enter cancellation reason..."
                                value={cancelReason}
                                onChange={(e) => setCancelReason((e.target as HTMLTextAreaElement).value)}
                                rows={3}
                            />
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    {appointment.status === 'pending' && (
                        <>
                            <Button
                                variant="primary"
                                text="Accept"
                                onClick={() => handleAction('accept')}
                                disabled={actionLoading === appointment.id}
                            />
                            <Button
                                variant="tertiary"
                                text="Reject"
                                onClick={() => handleAction('reject')}
                                disabled={actionLoading === appointment.id}
                            />
                        </>
                    )}
                    {appointment.status === 'scheduled' && (
                        <Button
                            variant="tertiary"
                            text="Cancel"
                            onClick={() => handleAction('cancel')}
                            disabled={actionLoading === appointment.id}
                        />
                    )}
                    {appointment.status === 'completed' && isCurrentAppointment() && (
                        <Button
                            variant="primary"
                            text="Take Action"
                            onClick={() => handleAction('take_action')}
                            disabled={actionLoading === appointment.id}
                        />
                    )}
                    <Button
                        variant="secondary"
                        text="Close"
                        onClick={onClose}
                    />
                </div>
            </div>
        </div>
    );
};

const CustomToolbar = ({ label, onView, view, onNavigate }: ToolbarProps<Appointment, object>) => {
    const handleNext = () => onNavigate('NEXT');
    const handleToday = () => onNavigate('TODAY');
    const handleView = (newView: View) => onView(newView);

    return (
        <div className="calendar-toolbar">
            <div className="toolbar-left">
                <button onClick={handleToday}>Today</button>
                <span>{label}</span>
                <button onClick={handleNext}>›</button>
            </div>
            <div className="toolbar-right">
                {['day', 'week', 'month'].map((v) => (
                    <button
                        key={v}
                        onClick={() => handleView(v as View)}
                        className={v === view ? 'active' : ''}
                    >
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                ))}
            </div>
        </div>
    );
};



export default function DoctorCalendar() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchAppointmentsData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchAppointments();
            setAppointments(data);
        } catch (err: any) {
            console.error('Failed to fetch appointments for calendar:', err);
            setError(err.response?.data?.message || 'Failed to fetch appointments');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAppointmentsData();
    }, [fetchAppointmentsData]);

    const handleNavigate = (newDate: Date) => {
        const todayStart = startOfWeek(new Date(), { weekStartsOn: 1 });
        const newWeekStart = startOfWeek(newDate, { weekStartsOn: 1 });
        if (!isBefore(newWeekStart, todayStart)) {
            setCurrentDate(newDate);
        }
    };

    const handleEventClick = (event: Appointment) => {
        setSelectedAppointment(event);
    };

    const handleAppointmentAction = async (appointmentId: string, action: string, reason?: string) => {
        try {
            setActionLoading(appointmentId);
            
            let newStatus = action;
            if (action === 'accept') newStatus = 'scheduled';
            if (action === 'reject') newStatus = 'rejected';
            if (action === 'cancel') newStatus = 'cancelled';
            
            await updateAppointmentStatus(appointmentId, newStatus, reason);
            await fetchAppointmentsData(); // Refresh data
            setSelectedAppointment(null);
        } catch (err: any) {
            console.error('Failed to update appointment:', err);
            setError(err.response?.data?.message || 'Failed to update appointment');
        } finally {
            setActionLoading(null);
        }
    };

    const getEventStyle = () => {
        return {
            style: {
                backgroundColor: 'transparent',
                border: 'none',
                padding: 0,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }
        };
    };

    const WrappedEventComponent = ({ event }: { event: Appointment }) => {
        const isCurrent = () => {
            const apptDate = new Date(`${event.appointment_date}T${event.appointment_time}`);
            const now = new Date();
            const timeDiff = Math.abs(apptDate.getTime() - now.getTime());
            return timeDiff <= 30 * 60 * 1000;
        };

        // Get status-based styling
        const getStatusStyle = () => {
            let backgroundColor = '#e3f2fd';
            let borderColor = '#3b82f6';
            
            switch (event.status) {
                case 'pending':
                    backgroundColor = '#fef3c7';
                    borderColor = '#f59e0b';
                    break;
                case 'scheduled':
                    backgroundColor = '#d1fae5';
                    borderColor = '#10b981';
                    break;
                case 'completed':
                    backgroundColor = '#e0e7ff';
                    borderColor = '#8b5cf6';
                    break;
                case 'cancelled':
                    backgroundColor = '#fee2e2';
                    borderColor = '#ef4444';
                    break;
                case 'rejected':
                    backgroundColor = '#f3f4f6';
                    borderColor = '#6b7280';
                    break;
            }

            return {
                backgroundColor,
                borderColor,
            };
        };

        const statusStyle = getStatusStyle();

        return (
            <div 
                className="calendar-event-wrapper"
                onClick={() => handleEventClick(event)}
                style={{
                    backgroundColor: statusStyle.backgroundColor,
                    border: `1px solid ${statusStyle.borderColor}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                }}
            >
            <AppointmentCard
                title={event.title}
                time={`${format(event.start, "hh:mm a")} - ${format(event.end, "hh:mm a")}`}
                location={event.consultationType}
                    status={event.status as "scheduled" | "pending" | "done"}
                patientName={event.patientName}
                avatarUrl={event.avatarUrl}
            />
                {isCurrent() && <div className="current-indicator">NOW</div>}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="calendar-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading calendar...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="calendar-container">
            {error && (
                <div className="error-banner">
                    <p>{error}</p>
                    <Button variant="tertiary" text="Retry" onClick={fetchAppointmentsData} />
                </div>
            )}

            <div className="doctor-calendar-wrapper">
                <Calendar
                    step={30}
                    timeslots={2}
                    scrollToTime={new Date(1970, 0, 1, 8, 0)}
                    min={new Date(1970, 0, 1, 0, 0)}
                    max={new Date(1970, 0, 1, 23, 59)}
                    localizer={localizer}
                    events={appointments}
                    startAccessor="start"
                    endAccessor="end"
                    views={["week"]}
                    defaultView="week"
                    date={currentDate}
                    onNavigate={handleNavigate}
                    onSelectEvent={handleEventClick}
                    components={{
                        toolbar: CustomToolbar,
                        event: WrappedEventComponent,
                    }}
                    eventPropGetter={getEventStyle}
                    style={{ height: 'calc(100vh - 120px)', width: '100%' }}
                />
            </div>

            <AppointmentModal
                appointment={selectedAppointment}
                onClose={() => setSelectedAppointment(null)}
                onAction={handleAppointmentAction}
                actionLoading={actionLoading}
            />
        </div>
    );
}