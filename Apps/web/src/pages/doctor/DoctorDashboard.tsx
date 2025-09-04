import React, { useMemo, useState } from "react";
import CustomText from "../../components/Text/CustomText";
import '../../styles/doctordashboard.css';
import { ReactComponent as PatientIcon } from "../../assets/svgs/Users.svg";
import { ReactComponent as AppointmentIcon } from "../../assets/svgs/CalendarBlank.svg";
import { ReactComponent as RevenueIcon } from "../../assets/svgs/CurrencyCircleDollar.svg";
import { ReactComponent as RatingIcon } from "../../assets/svgs/Star.svg";
import Button from "../../components/Button/Button";
import StatsCard from "../../components/StatsCard/StatsCard";
import { ResponsivePie } from '@nivo/pie';
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

type ValuePiece = Date | null;
type CalendarRange = [ValuePiece, ValuePiece];
type CalendarValue = ValuePiece | CalendarRange;

const appointmentData = [
    { id: 'Monday', label: 'Mon', value: 0.5, color: '#7bbbff' },
    { id: 'Tuesday', label: 'Tue', value: 0.45, color: '#b8a9ff' },
    { id: 'Wednesday', label: 'Wed', value: 0.25, color: '#FF9640' },
    { id: 'Thursday', label: 'Thu', value: 0.6, color: '#10b981' },
    { id: 'Friday', label: 'Fri', value: 0.9, color: '#F58078' },
    { id: 'Saturday', label: 'Sat', value: 1.0, color: '#FDDC96' },
    { id: 'Sunday', label: 'Sun', value: 0.0, color: '#a7d1ff' },
];

const top3Days = [...appointmentData]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map(d => d.label);

const AppointmentDistributionChart = ({ appointmentData }: { appointmentData: { id: string, label: string, value: number, color: string }[] }) => (
    <div style={{ height: 350 }}>
        <ResponsivePie
            data={appointmentData}
            colors={{ datum: 'data.color' }}
            margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            borderWidth={1}
            borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#333333"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: 'color' }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
            valueFormat={(v) => `${(v * 100).toFixed(0)}%`}
            legends={[
                {
                    anchor: 'left',
                    direction: 'column',
                    justify: false,
                    translateX: -60,
                    translateY: 0,
                    itemsSpacing: 8,
                    itemWidth: 100,
                    itemHeight: 20,
                    itemTextColor: '#999',
                    itemDirection: 'left-to-right',
                    itemOpacity: 1,
                    symbolSize: 18,
                    symbolShape: 'circle',
                    effects: [{ on: 'hover', style: { itemTextColor: '#000' } }],
                },
            ]}
        />
    </div>
);

// ---- Mock data for schedule (replace with real data later)
type Appt = {
    id: string;
    time: string;        // "09:30"
    patient: string;
    type: "Consultation" | "Follow-up" | "Procedure";
    status: "Confirmed" | "Pending" | "Checked-in";
    date: string;        // "YYYY-MM-DD"
};
const mockAppointments: Appt[] = [
    { id: "1", time: "09:00", patient: "Sara Ibrahim", type: "Consultation", status: "Confirmed", date: "2025-09-04" },
    { id: "2", time: "10:15", patient: "Omar Khaled", type: "Follow-up", status: "Pending", date: "2025-09-04" },
    { id: "3", time: "11:00", patient: "Layla N.", type: "Procedure", status: "Confirmed", date: "2025-09-04" },
    { id: "4", time: "14:30", patient: "Maya Fares", type: "Consultation", status: "Checked-in", date: "2025-09-05" },
];

function fmtISO(d: Date | null) {
    const date = d ?? new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export default function DoctorDashboard() {
    const [timeframe, setTimeframe] = useState("7d");
    const [selectedDate, setSelectedDate] = useState<ValuePiece>(new Date());

    const statsData = [
        { id: 1, title: "Total Patients", value: 124, change: 8, Icon: PatientIcon },
        { id: 2, title: "Appointments", value: 76, change: -3, Icon: AppointmentIcon },
        { id: 3, title: "Revenue", value: "$12.4K", change: -350, Icon: RevenueIcon },
        { id: 4, title: "Rating", value: "★ 4.6 / 5", change: 0.2, Icon: RatingIcon },
    ];

    return (
        <div className="dashboard-container">
            <div className="dashboard-left">
                <div className="dashboard-header">
                    <CustomText variant="text-heading-H2" as="h2">Overview</CustomText>
                    <div className="dashboard-controls">
                        <select
                            value={timeframe}
                            onChange={(e) => setTimeframe(e.target.value)}
                            className="timeframe-select"
                        >
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                        </select>

                        <Button
                            text="Overall Statistics"
                            variant="primary"
                            iconLeft={
                                <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12.5002 14.5541C12.6522 14.4663 12.7785 14.3401 12.8663 14.188C12.954 14.0359 13.0002 13.8634 13.0002 13.6879V4.68787C12.9993 4.52843 12.9603 4.37153 12.8864 4.23023C12.8126 4.08893 12.706 3.96735 12.5756 3.8756C12.4452 3.78386 12.2948 3.72463 12.1368 3.70284C11.9789 3.68106 11.818 3.69735 11.6677 3.75037C8.74891 4.78338 6.29433 6.82367 4.7452 9.50445C3.19608 12.1852 2.65401 15.3307 3.21643 18.3754C3.24559 18.5328 3.31212 18.681 3.41044 18.8073C3.50876 18.9337 3.63599 19.0346 3.78143 19.1016C3.9125 19.1629 4.05549 19.1945 4.20018 19.1941C4.3757 19.1942 4.54814 19.1481 4.70018 19.0604L12.5002 14.5541ZM11.0002 6.20287V13.1104L5.01518 16.5641C5.00018 16.3754 5.00018 16.1854 5.00018 16.0004C5.00196 13.9733 5.56305 11.9861 6.62168 10.2574C7.6803 8.52877 9.19541 7.12576 11.0002 6.20287ZM16.0002 3.00037C15.735 3.00037 15.4806 3.10572 15.2931 3.29326C15.1055 3.4808 15.0002 3.73515 15.0002 4.00037V15.4779L5.14893 21.2166C5.03462 21.2829 4.93457 21.3712 4.85457 21.4763C4.77456 21.5815 4.7162 21.7015 4.68284 21.8293C4.64948 21.9572 4.64179 22.0904 4.66022 22.2212C4.67864 22.3521 4.72281 22.4779 4.79018 22.5916C5.94482 24.5545 7.59482 26.1796 9.575 27.3043C11.5552 28.429 13.7961 29.0138 16.0733 29.0001C18.3506 28.9865 20.5843 28.3748 22.5508 27.2265C24.5174 26.0781 26.1478 24.4333 27.2788 22.4567C28.4098 20.4801 29.0017 18.2411 28.9953 15.9638C28.9889 13.6865 28.3844 11.4509 27.2423 9.48066C26.1002 7.51046 24.4606 5.87485 22.4876 4.73756C20.5146 3.60027 18.2775 3.00122 16.0002 3.00037ZM16.0002 27.0004C14.2545 26.9957 12.5347 26.5778 10.9815 25.7809C9.42832 24.984 8.08585 23.8307 7.06393 22.4154L16.5039 16.9154C16.6558 16.8277 16.7819 16.7016 16.8697 16.5498C16.9575 16.398 17.0038 16.2257 17.0039 16.0504V5.04537C19.8245 5.30127 22.4376 6.63517 24.2993 8.76937C26.161 10.9036 27.1279 13.6736 26.9985 16.5028C26.8692 19.3319 25.6536 22.0022 23.6049 23.9576C21.5562 25.913 18.8323 27.0029 16.0002 27.0004Z" fill="currentColor" />
                                </svg>
                            }
                        />
                    </div>
                </div>

                <div className="stats-grid">
                    {statsData.map(({ id, title, value, change, Icon }) => (
                        <StatsCard
                            key={id}
                            title={title}
                            value={value}
                            icon={Icon}
                            change={change}
                            timeframe={timeframe}
                        />
                    ))}
                </div>

                <div className="pie-chart-section">
                    <div className="chart-header">
                        <CustomText variant="text-heading-H4" as="h4">Most Popular Appointment Days</CustomText>
                        <CustomText className="chart-subtitle" variant="text-body-sm-r" as="p">
                            Percentage of filled appointment slots per weekday across all time.
                        </CustomText>
                    </div>
                    <AppointmentDistributionChart appointmentData={appointmentData} />
                    <div className="chart-conclusion">
                        <CustomText variant="text-body-md-r" as="p">
                            Based on the data, <strong>{top3Days.join(', ')}</strong> are the most popular days patients tend to book appointments.
                        </CustomText>
                    </div>
                </div>
            </div>

            {/* ---------- RIGHT PANEL ---------- */}
            <div className="doctor-dashboard-right">
                {/* Calendar */}
                <div className="calendar-widget">
                    <div className="side-header">
                        <CustomText variant="text-heading-H5" as="h5">Calendar</CustomText>
                    </div>

                    <Calendar
                        selectRange={false}
                        onChange={(val: CalendarValue) => setSelectedDate(Array.isArray(val) ? val[0] : val)}
                        value={selectedDate}
                        locale="en"
                        next2Label={null}
                        prev2Label={null}
                        // add a tiny dot under days that have appointments
                        tileClassName={({ date, view }) => {
                            if (view !== 'month') return undefined;
                            const iso = fmtISO(date);
                            const has = mockAppointments.some(a => a.date === iso);
                            return has ? 'rc-day has-appts' : 'rc-day';
                        }}
                        tileContent={({ date, view }) => {
                            if (view !== 'month') return null;
                            const iso = fmtISO(date);
                            const count = mockAppointments.filter(a => a.date === iso).length;
                            return count > 0 ? <span className="rc-dot" /> : null;
                        }}
                    />
                </div>

                {/* Today's / Selected Day Schedule */}
                <div className="side-section">
                    <div className="section-header">
                        <CustomText variant="text-heading-H5" as="h5">
                            {(() => {
                                const d = selectedDate ?? new Date();
                                return fmtISO(d) === fmtISO(new Date()) ? "Today’s Schedule" : "Selected Day";
                            })()}
                        </CustomText>
                        <Button
                            text="View all"
                            variant="tertiary"
                            iconRight={
                                <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M24.9996 8.00049V21.0005C24.9996 21.2657 24.8942 21.5201 24.7067 21.7076C24.5192 21.8951 24.2648 22.0005 23.9996 22.0005C23.7344 22.0005 23.48 21.8951 23.2925 21.7076C23.1049 21.5201 22.9996 21.2657 22.9996 21.0005V10.4142L8.70708 24.708C8.51944 24.8956 8.26494 25.001 7.99958 25.001C7.73422 25.001 7.47972 24.8956 7.29208 24.708C7.10444 24.5203 6.99902 24.2659 6.99902 24.0005C6.99902 23.7351 7.10444 23.4806 7.29208 23.293L21.5858 9.00049H10.9996C10.7344 9.00049 10.48 8.89513 10.2925 8.70759C10.1049 8.52006 9.99958 8.2657 9.99958 8.00049C9.99958 7.73527 10.1049 7.48092 10.2925 7.29338C10.48 7.10585 10.7344 7.00049 10.9996 7.00049H23.9996C24.2648 7.00049 24.5192 7.10585 24.7067 7.29338C24.8942 7.48092 24.9996 7.73527 24.9996 8.00049Z" fill="currentColor" />
                                </svg>
                            }
                        />
                    </div>

                    {/* quick chips with counts for the selected date */}
                    {(() => {
                        const iso = fmtISO(selectedDate);
                        const dayAppts = mockAppointments.filter(a => a.date === iso);
                        const total = dayAppts.length;
                        const confirmed = dayAppts.filter(a => a.status === "Confirmed").length;
                        const pending = dayAppts.filter(a => a.status === "Pending").length;
                        const checkedin = dayAppts.filter(a => a.status === "Checked-in").length;
                        return (
                            <div className="appt-stats-row">
                                <span className="appt-chip chip-total">Total {total}</span>
                                <span className="appt-chip chip-confirmed">Confirmed {confirmed}</span>
                                <span className="appt-chip chip-pending">Pending {pending}</span>
                                <span className="appt-chip chip-checkedin">Checked-in {checkedin}</span>
                            </div>
                        );
                    })()}

                    <ul className="appointments-list">
                        {useMemo(() => {
                            const iso = fmtISO(selectedDate);
                            return mockAppointments
                                .filter(a => a.date === iso)
                                .sort((a, b) => a.time.localeCompare(b.time))
                                .slice(0, 6);
                        }, [selectedDate]).map(appt => (
                            <li key={appt.id} className={`appt-item accent-${appt.status.toLowerCase().replace('-', '')}`}>
                                <div className="appt-left">
                                    <div className="appt-time-badge">{appt.time}</div>
                                    <div className="appt-avatar">{appt.patient.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}</div>
                                </div>

                                <div className="appt-main">
                                    <div className="appt-title-row">
                                        {/* <div className="appt-patient">{appt.patient}</div> */}
                                        <div className="appt-type">{appt.type}</div>
                                    </div>
                                    <div className="appt-meta">
                                        <span className={`badge status-${appt.status.toLowerCase().replace('-', '')}`}>{appt.status}</span>
                                    </div>
                                </div>

                                <div className="appt-actions">
                                    <Button text="Open" variant="ghost" />
                                </div>
                            </li>
                        ))}

                        {/* Empty state */}
                        {useMemo(() => {
                            const iso = fmtISO(selectedDate);
                            const none = mockAppointments.every(a => a.date !== iso);
                            return none;
                        }, [selectedDate]) && (
                                <li className="appt-empty">
                                    <div className="empty-icon">
                                        <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M26 4.00049H23V3.00049C23 2.73527 22.8946 2.48092 22.7071 2.29338C22.5196 2.10585 22.2652 2.00049 22 2.00049C21.7348 2.00049 21.4804 2.10585 21.2929 2.29338C21.1054 2.48092 21 2.73527 21 3.00049V4.00049H11V3.00049C11 2.73527 10.8946 2.48092 10.7071 2.29338C10.5196 2.10585 10.2652 2.00049 10 2.00049C9.73478 2.00049 9.48043 2.10585 9.29289 2.29338C9.10536 2.48092 9 2.73527 9 3.00049V4.00049H6C5.46957 4.00049 4.96086 4.2112 4.58579 4.58627C4.21071 4.96135 4 5.47006 4 6.00049V26.0005C4 26.5309 4.21071 27.0396 4.58579 27.4147C4.96086 27.7898 5.46957 28.0005 6 28.0005H26C26.5304 28.0005 27.0391 27.7898 27.4142 27.4147C27.7893 27.0396 28 26.5309 28 26.0005V6.00049C28 5.47006 27.7893 4.96135 27.4142 4.58627C27.0391 4.2112 26.5304 4.00049 26 4.00049ZM9 6.00049V7.00049C9 7.2657 9.10536 7.52006 9.29289 7.70759C9.48043 7.89513 9.73478 8.00049 10 8.00049C10.2652 8.00049 10.5196 7.89513 10.7071 7.70759C10.8946 7.52006 11 7.2657 11 7.00049V6.00049H21V7.00049C21 7.2657 21.1054 7.52006 21.2929 7.70759C21.4804 7.89513 21.7348 8.00049 22 8.00049C22.2652 8.00049 22.5196 7.89513 22.7071 7.70759C22.8946 7.52006 23 7.2657 23 7.00049V6.00049H26V10.0005H6V6.00049H9ZM26 26.0005H6V12.0005H26V26.0005ZM17.5 16.5005C17.5 16.7972 17.412 17.0872 17.2472 17.3338C17.0824 17.5805 16.8481 17.7728 16.574 17.8863C16.2999 17.9998 15.9983 18.0295 15.7074 17.9717C15.4164 17.9138 15.1491 17.7709 14.9393 17.5611C14.7296 17.3514 14.5867 17.0841 14.5288 16.7931C14.4709 16.5022 14.5006 16.2006 14.6142 15.9265C14.7277 15.6524 14.92 15.4181 15.1666 15.2533C15.4133 15.0885 15.7033 15.0005 16 15.0005C16.3978 15.0005 16.7794 15.1585 17.0607 15.4398C17.342 15.7211 17.5 16.1027 17.5 16.5005ZM23 16.5005C23 16.7972 22.912 17.0872 22.7472 17.3338C22.5824 17.5805 22.3481 17.7728 22.074 17.8863C21.7999 17.9998 21.4983 18.0295 21.2074 17.9717C20.9164 17.9138 20.6491 17.7709 20.4393 17.5611C20.2296 17.3514 20.0867 17.0841 20.0288 16.7931C19.9709 16.5022 20.0007 16.2006 20.1142 15.9265C20.2277 15.6524 20.42 15.4181 20.6666 15.2533C20.9133 15.0885 21.2033 15.0005 21.5 15.0005C21.8978 15.0005 22.2794 15.1585 22.5607 15.4398C22.842 15.7211 23 16.1027 23 16.5005ZM12 21.5005C12 21.7972 11.912 22.0872 11.7472 22.3338C11.5824 22.5805 11.3481 22.7728 11.074 22.8863C10.7999 22.9998 10.4983 23.0295 10.2074 22.9717C9.91639 22.9138 9.64912 22.7709 9.43934 22.5611C9.22956 22.3514 9.0867 22.0841 9.02882 21.7931C8.97094 21.5022 9.00065 21.2006 9.11418 20.9265C9.22771 20.6524 9.41997 20.4181 9.66665 20.2533C9.91332 20.0885 10.2033 20.0005 10.5 20.0005C10.8978 20.0005 11.2794 20.1585 11.5607 20.4398C11.842 20.7211 12 21.1027 12 21.5005ZM17.5 21.5005C17.5 21.7972 17.412 22.0872 17.2472 22.3338C17.0824 22.5805 16.8481 22.7728 16.574 22.8863C16.2999 22.9998 15.9983 23.0295 15.7074 22.9717C15.4164 22.9138 15.1491 22.7709 14.9393 22.5611C14.7296 22.3514 14.5867 22.0841 14.5288 21.7931C14.4709 21.5022 14.5006 21.2006 14.6142 20.9265C14.7277 20.6524 14.92 20.4181 15.1666 20.2533C15.4133 20.0885 15.7033 20.0005 16 20.0005C16.3978 20.0005 16.7794 20.1585 17.0607 20.4398C17.342 20.7211 17.5 21.1027 17.5 21.5005ZM23 21.5005C23 21.7972 22.912 22.0872 22.7472 22.3338C22.5824 22.5805 22.3481 22.7728 22.074 22.8863C21.7999 22.9998 21.4983 23.0295 21.2074 22.9717C20.9164 22.9138 20.6491 22.7709 20.4393 22.5611C20.2296 22.3514 20.0867 22.0841 20.0288 21.7931C19.9709 21.5022 20.0007 21.2006 20.1142 20.9265C20.2277 20.6524 20.42 20.4181 20.6666 20.2533C20.9133 20.0885 21.2033 20.0005 21.5 20.0005C21.8978 20.0005 22.2794 20.1585 22.5607 20.4398C22.842 20.7211 23 21.1027 23 21.5005Z" fill="#434344" />
                                        </svg>
                                    </div>
                                    <div className="empty-text">
                                        <CustomText>No appointments for this day.</CustomText>
                                    </div>
                                    {/* <Button text="New Appointment" variant="primary" /> */}
                                </li>
                            )}
                    </ul>
                </div>
            </div>
        </div>
    );
}