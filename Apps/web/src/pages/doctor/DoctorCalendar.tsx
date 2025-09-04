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
        start: new Date(2025, 8, 5, 9, 30),
        end: new Date(2025, 8, 5, 10, 0),
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
        start: new Date(2025, 8, 3, 9, 30),
        end: new Date(2025, 8, 3, 10, 0),
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
        start: new Date(2025, 8, 4, 9, 30),
        end: new Date(2025, 8, 4, 10, 0),
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

    const handleNavigate = (newDate: Date) => {
        const todayStart = startOfWeek(new Date(), { weekStartsOn: 1 });
        const newWeekStart = startOfWeek(newDate, { weekStartsOn: 1 });
        if (!isBefore(newWeekStart, todayStart)) {
            setCurrentDate(newDate);
        }
    };

    const WrappedEventComponent = ({ event }: { event: Appointment }) => {
        const isPast = event.end ? new Date(event.end) < new Date() : false;
        const status: "scheduled" | "pending" | "done" = isPast ? "done" : "scheduled";

        return (
            <AppointmentCard
                title={event.title}
                time={`${format(event.start, "hh:mm a")} - ${format(event.end, "hh:mm a")}`}
                location={event.consultationType}
                status={status}
                patientName={event.patientName}
                avatarUrl={event.avatarUrl}
            />
        );
    };

    return (
        <div className="calendar-container">
            <CustomText variant="text-heading-H2" as="h2" className="calendar-header">
                Doctor Calendar
            </CustomText>

            <Calendar
                step={30}
                timeslots={2}             // 2 slots per hour (pairs with step)
                scrollToTime={new Date(1970, 0, 1, 8, 0)} // auto-scroll to 8 AM
                min={new Date(1970, 0, 1, 8, 0)}          // earliest visible time
                max={new Date(1970, 0, 1, 18, 0)}
                localizer={localizer}
                events={appointments}
                startAccessor="start"
                endAccessor="end"
                views={["week"]}
                defaultView="week"
                date={currentDate}
                onNavigate={handleNavigate}
                components={{
                    toolbar: CustomToolbar,
                    event: WrappedEventComponent,
                }}
                eventPropGetter={() => ({
                    style: { backgroundColor: "transparent", border: "none", padding: 0 },
                })}
            />
        </div>
    );
}