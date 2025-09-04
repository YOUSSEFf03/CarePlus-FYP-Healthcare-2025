// import React, { useState } from 'react';
// import '../../styles/doctorAppointments.css';
// import CustomText from '../../components/Text/CustomText';
// import { Tooltip } from 'recharts';

// const appointments = [
//     {
//         id: 'A001',
//         patientName: 'Dianne Russell',
//         workplace: 'Downtown Clinic',
//         start: new Date(2025, 5, 12, 8, 0),
//         end: new Date(2025, 5, 12, 9, 0),
//         date: 'June 12, 2025',
//         status: 'scheduled',
//     },
//     {
//         id: 'A002',
//         patientName: 'Dianne Russell',
//         workplace: 'Downtown Clinic',
//         start: new Date(2025, 5, 13, 8, 0),
//         end: new Date(2025, 5, 13, 9, 0),
//         date: 'June 13, 2025',
//         status: 'scheduled',
//     },
//     {
//         id: 'A003',
//         patientName: 'Ralph Edwards',
//         workplace: 'City Hospital',
//         start: new Date(2025, 5, 13, 10, 0),
//         end: new Date(2025, 5, 13, 10, 30),
//         date: 'June 13, 2025',
//         status: 'pending',
//     },
//     {
//         id: 'A004',
//         patientName: 'Jacob Jones',
//         workplace: 'Westside Health Center',
//         start: new Date(2025, 5, 10, 7, 30),
//         end: new Date(2025, 5, 10, 8, 0),
//         date: 'June 10, 2025',
//         status: 'completed',
//     },
//     {
//         id: 'A005',
//         patientName: 'Jacob Jones',
//         workplace: 'Westside Health Center',
//         start: new Date(2025, 5, 14, 7, 30),
//         end: new Date(2025, 5, 14, 8, 0),
//         date: 'June 14, 2025',
//         status: 'pending',
//     },
//     {
//         id: 'A006',
//         patientName: 'Jacob Jones',
//         workplace: 'Westside Health Center',
//         start: new Date(2025, 5, 11, 11, 30),
//         end: new Date(2025, 5, 11, 12, 0),
//         date: 'June 11, 2025',
//         status: 'pending',
//     },
//     {
//         id: 'A007',
//         patientName: 'Jacob Jones',
//         workplace: 'Westside Health Center',
//         start: new Date(2025, 5, 11, 10, 30),
//         end: new Date(2025, 5, 11, 11, 0),
//         date: 'June 11, 2025',
//         status: 'pending',
//     },
// ];

// type TabKey = keyof typeof counts;
// const tabs: { key: TabKey; label: string }[] = [
//     { key: 'scheduled', label: 'Scheduled Appointments' },
//     { key: 'requested', label: 'Requested Appointments' },
//     { key: 'completed', label: 'Completed Appointments' },
// ];

// const counts = {
//     scheduled: appointments.filter((a) => a.status === 'scheduled').length,
//     requested: appointments.filter((a) => a.status === 'pending').length,
//     completed: appointments.filter((a) => a.status === 'completed').length,
// };

// export default function DoctorAppointments() {
//     const [activeTab, setActiveTab] = useState('scheduled');

//     // const filteredAppointments = appointments.filter((appt) => {
//     //     if (activeTab === 'scheduled') return appt.status === 'scheduled';
//     //     if (activeTab === 'requested') return appt.status === 'pending';
//     //     if (activeTab === 'completed') return appt.status === 'completed';
//     //     return false;
//     // });

//     const now = new Date();

//     const filteredAppointments = appointments
//         .filter((appt) => {
//             if (activeTab === 'scheduled') return appt.status === 'scheduled';
//             if (activeTab === 'requested') return appt.status === 'pending';
//             if (activeTab === 'completed') return appt.status === 'completed';
//             return false;
//         })
//         .sort((a, b) => {
//             const diffA = Math.abs(a.start.getTime() - now.getTime());
//             const diffB = Math.abs(b.start.getTime() - now.getTime());
//             return diffA - diffB;
//         });

//     return (
//         <div className="appointments-container">
//             <CustomText variant="text-heading-H2" as="h2" className="appointments-header">
//                 Doctor Appointments
//             </CustomText>

//             <div className="appointments-tabs">
//                 {tabs.map((tab) => (
//                     <button
//                         key={tab.key}
//                         className={`appointments-tab ${activeTab === tab.key ? 'active' : ''}`}
//                         onClick={() => setActiveTab(tab.key)}
//                     >
//                         {tab.label}
//                         {tab.key !== 'completed' && counts[tab.key as keyof typeof counts] > 0 && (
//                             <span className="tab-count">{counts[tab.key as keyof typeof counts]}</span>
//                         )}
//                     </button>
//                 ))}
//             </div>

//             <div className="appointments-tab-content fade-in">
//                 <div className="appointments-table">
//                     <div className="appointments-header-row">
//                         <span>ID</span>
//                         <span>Patient</span>
//                         <span>Workplace</span>
//                         <span>Date</span>
//                         <span>Time</span>
//                         <span>Actions</span>
//                     </div>
//                     {filteredAppointments.map((appt) => (
//                         <div key={appt.id} className="appointments-row">
//                             <span>{appt.id}</span>
//                             <span>{appt.patientName}</span>
//                             <span>{appt.workplace}</span>
//                             <span>{appt.date}</span>
//                             <span>
//                                 {appt.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
//                                 {appt.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                             </span>
//                             <span className="action-icon tooltip-wrapper">
//                                 <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
//                                     <path stroke="currentColor" strokeWidth="1.5" d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z" />
//                                     <path stroke="currentColor" strokeWidth="1.5" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
//                                 </svg>
//                                 <span className="tooltip-text">View Details</span>
//                             </span>
//                         </div>
//                     ))}
//                     {filteredAppointments.length === 0 && (
//                         <div className="appointments-empty">No appointments found.</div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/doctorAppointments.css';
import CustomText from '../../components/Text/CustomText';
// recharts Tooltip was imported but unused; keeping your import pattern if needed
import { appointments } from '../../data/appointments';

type Counts = {
    scheduled: number;
    requested: number; // pending
    completed: number;
};
const counts: Counts = {
    scheduled: appointments.filter((a) => a.status === 'scheduled').length,
    requested: appointments.filter((a) => a.status === 'pending').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
};
type TabKey = keyof typeof counts;

const tabs: { key: TabKey; label: string }[] = [
    { key: 'scheduled', label: 'Scheduled Appointments' },
    { key: 'requested', label: 'Requested Appointments' },
    { key: 'completed', label: 'Completed Appointments' },
];

export default function DoctorAppointments() {
    const [activeTab, setActiveTab] = useState<TabKey>('scheduled');
    const navigate = useNavigate();

    const now = new Date();
    const filteredAppointments = appointments
        .filter((appt) => {
            if (activeTab === 'scheduled') return appt.status === 'scheduled';
            if (activeTab === 'requested') return appt.status === 'pending';
            if (activeTab === 'completed') return appt.status === 'completed';
            return false;
        })
        .sort((a, b) => {
            const diffA = Math.abs(a.start.getTime() - now.getTime());
            const diffB = Math.abs(b.start.getTime() - now.getTime());
            return diffA - diffB;
        });

    return (
        <div className="appointments-container">
            <CustomText variant="text-heading-H2" as="h2" className="appointments-header">
                Doctor Appointments
            </CustomText>

            <div className="appointments-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        className={`appointments-tab ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                        {tab.key !== 'completed' && counts[tab.key] > 0 && (
                            <span className="tab-count">{counts[tab.key]}</span>
                        )}
                    </button>
                ))}
            </div>

            <div className="appointments-tab-content fade-in">
                <div className="appointments-table">
                    <div className="appointments-header-row">
                        <span>ID</span>
                        <span>Patient</span>
                        <span>Workplace</span>
                        <span>Date</span>
                        <span>Time</span>
                        <span>Actions</span>
                    </div>

                    {filteredAppointments.map((appt) => (
                        <div key={appt.id} className="appointments-row">
                            <span>{appt.id}</span>
                            <span>{appt.patientName}</span>
                            <span>{appt.workplace}</span>
                            <span>{appt.date}</span>
                            <span>
                                {appt.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                                {appt.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span
                                className="action-icon tooltip-wrapper"
                                onClick={() => navigate(`/doctor/appointments/${appt.id}`)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => (e.key === 'Enter' ? navigate(`/doctor/appointments/${appt.id}`) : null)}
                            >
                                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" strokeWidth="1.5" d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z" />
                                    <path stroke="currentColor" strokeWidth="1.5" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>
                                <span className="tooltip-text">View Details</span>
                            </span>
                        </div>
                    ))}

                    {filteredAppointments.length === 0 && (
                        <div className="appointments-empty">No appointments found.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
