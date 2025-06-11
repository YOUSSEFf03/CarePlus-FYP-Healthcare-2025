import React, { useState } from 'react';
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

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface Appointment extends Omit<Event, 'start' | 'end'> {
    id: number;
    title: string;
    start: Date;
    end: Date;
    patientName: string;
    consultationType: string;
    avatarUrl?: string;
    video?: boolean;
    contact?: {
        phone: string;
        email: string;
        notes?: string;
        lastVisit?: string;
    };
}

const initialAppointments: Appointment[] = [
    {
        id: 1,
        title: 'General Checkup',
        patientName: 'Dianne Russell',
        consultationType: 'Initial Consultation',
        start: new Date(2025, 5, 10, 8, 0),
        end: new Date(2025, 5, 10, 9, 0),
        avatarUrl: '/avatars/dianne.png',
        video: true,
        contact: {
            phone: '(505) 555-0125',
            email: 'dianne.russell@example.com',
            notes: 'Checkup for flu symptoms.',
            lastVisit: 'March 10, 2025',
        },
    },
    {
        id: 2,
        title: 'Follow-Up',
        patientName: 'Ralph Edwards',
        consultationType: 'Antibiotics Treatment',
        start: new Date(2025, 5, 10, 9, 30),
        end: new Date(2025, 5, 10, 10, 0),
        avatarUrl: '/avatars/ralph.png',
        contact: {
            phone: '(505) 555-0125',
            email: 'bill.sanders@example.com',
            notes: 'Follow-up for infection. Adjust prescription.',
            lastVisit: 'October 12, 2024',
        },
    },
    {
        id: 3,
        title: 'Follow-Up',
        patientName: 'Ralph Edwards',
        consultationType: 'Antibiotics Treatment',
        start: new Date(2025, 5, 9, 9, 30),
        end: new Date(2025, 5, 9, 10, 0),
        avatarUrl: '/avatars/ralph.png',
        contact: {
            phone: '(505) 555-0125',
            email: 'bill.sanders@example.com',
            notes: 'Follow-up for infection. Adjust prescription.',
            lastVisit: 'October 12, 2024',
        },
    }
];

const CustomToolbar: React.FC<ToolbarProps<Appointment, object>> = ({ label, onView, view, onNavigate }) => {
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

const EventComponent = ({
    event,
    onHover,
    onLeave,
}: {
    event: Appointment;
    onHover: (event: Appointment, e: React.MouseEvent) => void;
    onLeave: () => void;
}) => {
    return (
        <div
            className="calendar-event"
            onMouseEnter={(e) => onHover(event, e)}
            onMouseLeave={onLeave}
        >
            <div className="event-top">
                {event.avatarUrl && (
                    <img src={event.avatarUrl} alt="avatar" className="avatar" />
                )}
                <div className="event-name">{event.patientName}</div>
            </div>
            <div className="event-bottom">
                <div className="event-type">{event.consultationType}</div>
                <div className="event-time">
                    {format(event.start!, 'hh:mm a')} - {format(event.end!, 'hh:mm a')}
                </div>
            </div>
        </div>
    );
};

export default function DoctorCalendar() {
    const [appointments] = useState<Appointment[]>(initialAppointments);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [hoveredEvent, setHoveredEvent] = useState<Appointment | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

    const handleEventHover = (event: Appointment, e: React.MouseEvent) => {
        setHoveredEvent(event);
        setTooltipPosition({ x: e.clientX, y: e.clientY });
    };

    const handleEventLeave = () => {
        setHoveredEvent(null);
        setTooltipPosition(null);
    };

    const handleNavigate = (newDate: Date) => {
        const todayStart = startOfWeek(new Date(), { weekStartsOn: 1 });
        const newWeekStart = startOfWeek(newDate, { weekStartsOn: 1 });

        if (!isBefore(newWeekStart, todayStart)) {
            setCurrentDate(newDate);
        }
    };

    const WrappedEventComponent = ({ event }: { event: Appointment }) => {
        const isPast = event.end ? new Date(event.end) < new Date() : false;

        let status: 'scheduled' | 'pending' | 'done' = 'scheduled'; // default
        if (isPast) {
            status = 'done';
        } else {
            // You can enhance this to use a real "status" field if available in the event
            status = 'scheduled';
        }

        return (
            <AppointmentCard
                title={event.title}
                time={`${format(event.start, 'hh:mm a')} - ${format(event.end, 'hh:mm a')}`}
                location={event.consultationType}
                status={status}
                patientName={event.patientName}
                avatarUrl={event.avatarUrl}
            />
        );
    };

    const eventStyleGetter = () => {
        return {
            style: {
                backgroundColor: 'transparent',
                border: 'none',
                padding: 0,
            },
        };
    };

    return (
        <div className="calendar-container">
            <AppointmentCard
                title="Follow-up Appointment"
                time="08:00 AM - 09:00 AM"
                location="city center clinic"
                status="scheduled"
                patientName="lorem ipsum"
                avatarUrl="https://img.freepik.com/free-psd/3d-illustration-with-online-avatar_23-2151303097.jpg?uid=R137855058&ga=GA1.1.132194846.1728578884&semt=ais_hybrid&w=740"
            />
            <AppointmentCard
                title="Follow-up Appointment"
                time="08:00 AM - 09:00 AM"
                location="city center clinic"
                status="pending"
                patientName="lorem ipsum"
                avatarUrl="https://img.freepik.com/free-psd/3d-illustration-with-online-avatar_23-2151303097.jpg?uid=R137855058&ga=GA1.1.132194846.1728578884&semt=ais_hybrid&w=740"
            />
            <AppointmentCard
                title="Follow-up Appointment"
                time="08:00 AM - 09:00 AM"
                location="city center clinic"
                status="done"
                patientName="lorem ipsum"
                avatarUrl="https://img.freepik.com/free-psd/3d-illustration-with-online-avatar_23-2151303097.jpg?uid=R137855058&ga=GA1.1.132194846.1728578884&semt=ais_hybrid&w=740"
            />
            <CustomText variant="text-heading-H2" as="h2" className="calendar-header">
                Doctor Calendar
            </CustomText>
            <Calendar
                localizer={localizer}
                events={appointments}
                // onSelectEvent={handleEventClick}
                startAccessor="start"
                endAccessor="end"
                views={['month', 'week', 'day']}
                defaultView="week"
                date={currentDate}
                onNavigate={handleNavigate}
                components={{
                    toolbar: CustomToolbar,
                    event: WrappedEventComponent,
                }}
                eventPropGetter={eventStyleGetter}
                popup
            />
            {hoveredEvent && tooltipPosition && (
                <div
                    className="hover-tooltip"
                    style={{
                        position: 'fixed',
                        top: tooltipPosition.y + 10,
                        left: tooltipPosition.x + 10,
                        zIndex: 9999,
                        background: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '12px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        width: '260px',
                    }}
                >
                    <div className="tooltip-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src={hoveredEvent.avatarUrl} alt="avatar" className="avatar" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                        <div>
                            <strong>{hoveredEvent.patientName}</strong>
                            <div style={{ fontSize: 12 }}>{hoveredEvent.consultationType}</div>
                        </div>
                    </div>
                    <div className="tooltip-body" style={{ marginTop: 8, fontSize: 12 }}>
                        <div><b>📞</b> {hoveredEvent.contact?.phone}</div>
                        <div><b>📧</b> {hoveredEvent.contact?.email}</div>
                        <div>{hoveredEvent.contact?.notes}</div>
                        <div><i>Last Visit: {hoveredEvent.contact?.lastVisit}</i></div>
                        <button
                            style={{
                                marginTop: 8,
                                padding: '6px 12px',
                                border: '1px solid #ccc',
                                background: '#f9fafb',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                width: '100%',
                            }}
                        >
                            See Patient Details
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}