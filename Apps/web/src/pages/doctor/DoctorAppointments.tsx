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

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/doctorAppointments.css';
import CustomText from '../../components/Text/CustomText';
import Button from '../../components/Button/Button';
import CustomInput from '../../components/Inputs/CustomInput';

const API_BASE = "http://localhost:3000";

type Appointment = {
    id: string;
    patientId: string;
    patientName: string;
    appointment_date: string;
    appointment_time: string;
    status: 'scheduled' | 'pending' | 'completed' | 'cancelled' | 'rejected';
    symptoms?: string;
    diagnosis?: string;
    prescription?: string;
    notes?: string;
    consultation_fee?: number;
    workplace?: string;
    createdAt: string;
    updatedAt: string;
};

type Counts = {
    scheduled: number;
    requested: number; // pending
    completed: number;
};

type TabKey = keyof Counts;

// Helper function to decode JWT token
function decodeJWT(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
}

// API functions
async function fetchAppointments(status?: string): Promise<Appointment[]> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    // Debug JWT token
    const userData = decodeJWT(token);
    console.log('JWT user data:', userData);
    console.log('User ID from JWT:', userData?.sub || userData?.id);
    console.log('User ID type:', typeof (userData?.sub || userData?.id));
    console.log('User ID length:', (userData?.sub || userData?.id)?.length);
    
    const params: any = {};
    if (status) params.status = status;
    
    // Try to get doctor profile first to see if we can get the doctor ID
    try {
        console.log('Trying to get doctor profile first...');
        const doctorProfileResponse = await axios.get(`${API_BASE}/doctors/profile/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Doctor profile response:', doctorProfileResponse.data);
    } catch (profileError: any) {
        console.error('Failed to get doctor profile:', profileError);
        console.error('Profile error response:', profileError.response?.data);
    }
    
    try {
        // Try the regular appointments endpoint first
        const response = await axios.get(`${API_BASE}/doctors/appointments`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            params
        });
        
        console.log('Appointments API response:', response.data);
        return response.data.data?.appointments || response.data.appointments || [];
    } catch (error: any) {
        console.error('Failed to fetch appointments:', error);
        console.error('Error response:', error.response?.data);
        
        // If the regular endpoint fails, try the /me endpoint
        try {
            console.log('Trying /doctors/appointments/me endpoint...');
            const meResponse = await axios.get(`${API_BASE}/doctors/appointments/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params
            });
            
            console.log('Appointments /me API response:', meResponse.data);
            return meResponse.data.data?.appointments || meResponse.data.appointments || [];
        } catch (meError: any) {
            console.error('Failed to fetch appointments from /me endpoint:', meError);
            console.error('Me error response:', meError.response?.data);
            throw meError;
        }
    }
}

async function fetchAppointmentsWithPagination(status: string, page: number, limit: number): Promise<{ appointments: Appointment[]; total: number }> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    // Debug JWT token
    const userData = decodeJWT(token);
    console.log('JWT user data:', userData);
    console.log('User ID from JWT:', userData?.sub || userData?.id);
    console.log('User ID type:', typeof (userData?.sub || userData?.id));
    console.log('User ID length:', (userData?.sub || userData?.id)?.length);
    
    const params: any = {
        page,
        limit,
        status
    };
    
    // Get doctor profile first to get the doctor ID
    let doctorId: string;
    try {
        console.log('Getting doctor profile to fetch doctor ID...');
        const doctorProfileResponse = await axios.get(`${API_BASE}/doctors/profile/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Doctor profile response:', doctorProfileResponse.data);
        
        const doctorData = doctorProfileResponse.data.data || doctorProfileResponse.data;
        doctorId = doctorData.id;
        console.log('Doctor ID from profile:', doctorId);
        
        if (!doctorId) {
            throw new Error('Doctor ID not found in profile response');
        }
    } catch (profileError: any) {
        console.error('Failed to get doctor profile:', profileError);
        console.error('Profile error response:', profileError.response?.data);
        throw new Error('Failed to get doctor profile: ' + (profileError.response?.data?.message || profileError.message));
    }
    
    try {
        // Try the regular appointments endpoint first
        const response = await axios.get(`${API_BASE}/doctors/appointments`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            params
        });
        
        console.log('Appointments API response:', response.data);
        const data = response.data.data || response.data;
        return {
            appointments: data.appointments || [],
            total: data.total || 0
        };
    } catch (error: any) {
        console.error('Failed to fetch appointments:', error);
        console.error('Error response:', error.response?.data);
        
        // If the regular endpoint fails, try the /me endpoint
        try {
            console.log('Trying /doctors/appointments/me endpoint...');
            const meResponse = await axios.get(`${API_BASE}/doctors/appointments/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params
            });
            
            console.log('Appointments /me API response:', meResponse.data);
            const data = meResponse.data.data || meResponse.data;
            return {
                appointments: data.appointments || [],
                total: data.total || 0
            };
        } catch (meError: any) {
            console.error('Failed to fetch appointments from /me endpoint:', meError);
            console.error('Me error response:', meError.response?.data);
            
            // If both endpoints fail, return empty data as fallback
            console.warn('All appointment endpoints failed, returning empty data');
            return {
                appointments: [],
                total: 0
            };
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

const tabs: { key: TabKey; label: string }[] = [
    { key: 'scheduled', label: 'Scheduled Appointments' },
    { key: 'requested', label: 'Requested Appointments' },
    { key: 'completed', label: 'Completed Appointments' },
];

export default function DoctorAppointments() {
    const [activeTab, setActiveTab] = useState<TabKey>('scheduled');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [counts, setCounts] = useState<Counts>({ scheduled: 0, requested: 0, completed: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalAppointments, setTotalAppointments] = useState(0);
    const itemsPerPage = 10;
    
    const navigate = useNavigate();

    const fetchAppointmentsData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('Fetching appointments for tab:', activeTab, 'page:', currentPage);
            
            // Fetch appointments with pagination
            const response = await fetchAppointmentsWithPagination(activeTab, currentPage, itemsPerPage);
            console.log('Appointments response:', response);
            
            setAppointments(response.appointments);
            setTotalAppointments(response.total);
            setTotalPages(Math.ceil(response.total / itemsPerPage));
            
            // Calculate counts for all appointments (not just current page)
            try {
                const allAppointments = await fetchAppointments();
                const newCounts: Counts = {
                    scheduled: allAppointments.filter(a => a.status === 'scheduled').length,
                    requested: allAppointments.filter(a => a.status === 'pending').length,
                    completed: allAppointments.filter(a => a.status === 'completed').length,
                };
                setCounts(newCounts);
            } catch (countError) {
                console.warn('Failed to fetch counts, using current page data:', countError);
                // Fallback to current page data for counts
                const newCounts: Counts = {
                    scheduled: response.appointments.filter(a => a.status === 'scheduled').length,
                    requested: response.appointments.filter(a => a.status === 'pending').length,
                    completed: response.appointments.filter(a => a.status === 'completed').length,
                };
                setCounts(newCounts);
            }
        } catch (err: any) {
            console.error('Failed to fetch appointments:', err);
            console.error('Error details:', {
                message: err.message,
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data,
                config: err.config
            });
            
            const errorMessage = err.response?.data?.message || 
                               err.response?.data?.error || 
                               err.message || 
                               'Failed to fetch appointments';
            
            // If it's a 400 error with UUID validation, show a specific message
            if (err.response?.status === 400 && errorMessage.includes('Invalid doctor ID format')) {
                setError('Backend validation error. The appointments API is currently experiencing issues. Please try again later or contact support.');
                
                // Temporary fallback: show empty state with counts
                console.log('Using fallback empty state due to UUID validation error');
                setAppointments([]);
                setTotalAppointments(0);
                setTotalPages(1);
                setCounts({ scheduled: 0, requested: 0, completed: 0 });
            } else if (err.response?.status === 500) {
                setError('Internal server error. Please check the console for details and try again.');
                
                // Temporary fallback: show empty state with counts
                console.log('Using fallback empty state due to server error');
                setAppointments([]);
                setTotalAppointments(0);
                setTotalPages(1);
                setCounts({ scheduled: 0, requested: 0, completed: 0 });
            } else {
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    }, [activeTab, currentPage, itemsPerPage]);

    // Fetch appointments on component mount and when tab changes
    useEffect(() => {
        fetchAppointmentsData();
    }, [fetchAppointmentsData]);

    // Since we're getting filtered data from API, we just need to sort it
    const filteredAppointments = appointments.sort((a, b) => {
        // For completed appointments, show current ones first
        if (activeTab === 'completed') {
            const aIsCurrent = isCurrentAppointment(a);
            const bIsCurrent = isCurrentAppointment(b);
            if (aIsCurrent && !bIsCurrent) return -1;
            if (!aIsCurrent && bIsCurrent) return 1;
        }
        
        // Sort by date/time
        const aDate = new Date(`${a.appointment_date}T${a.appointment_time}`);
        const bDate = new Date(`${b.appointment_date}T${b.appointment_time}`);
        return aDate.getTime() - bDate.getTime();
    });

    const isCurrentAppointment = (appt: Appointment) => {
        const apptDate = new Date(`${appt.appointment_date}T${appt.appointment_time}`);
        const now = new Date();
        const timeDiff = Math.abs(apptDate.getTime() - now.getTime());
        return timeDiff <= 30 * 60 * 1000; // Within 30 minutes
    };

    const handleTabChange = (tab: TabKey) => {
        setActiveTab(tab);
        setCurrentPage(1); // Reset to first page when changing tabs
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleAcceptAppointment = async (appointmentId: string) => {
        try {
            setActionLoading(appointmentId);
            await updateAppointmentStatus(appointmentId, 'scheduled');
            await fetchAppointmentsData(); // Refresh data
        } catch (err: any) {
            console.error('Failed to accept appointment:', err);
            setError(err.response?.data?.message || 'Failed to accept appointment');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectAppointment = async (appointmentId: string) => {
        try {
            setActionLoading(appointmentId);
            await updateAppointmentStatus(appointmentId, 'rejected');
            await fetchAppointmentsData(); // Refresh data
        } catch (err: any) {
            console.error('Failed to reject appointment:', err);
            setError(err.response?.data?.message || 'Failed to reject appointment');
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancelAppointment = (appointmentId: string) => {
        setAppointmentToCancel(appointmentId);
        setShowCancelModal(true);
    };

    const confirmCancelAppointment = async () => {
        if (!appointmentToCancel || !cancelReason.trim()) return;
        
        try {
            setActionLoading(appointmentToCancel);
            await updateAppointmentStatus(appointmentToCancel, 'cancelled', cancelReason);
            await fetchAppointmentsData(); // Refresh data
            setShowCancelModal(false);
            setCancelReason('');
            setAppointmentToCancel(null);
        } catch (err: any) {
            console.error('Failed to cancel appointment:', err);
            setError(err.response?.data?.message || 'Failed to cancel appointment');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="appointments-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading appointments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="appointments-container">
            <CustomText variant="text-heading-H2" as="h2" className="appointments-header">
                Doctor Appointments
            </CustomText>

            {error && (
                <div className="error-banner">
                    <p>{error}</p>
                    <Button variant="tertiary" text="Retry" onClick={fetchAppointmentsData} />
                </div>
            )}

            <div className="appointments-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        className={`appointments-tab ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => handleTabChange(tab.key)}
                    >
                        {tab.label}
                        {counts[tab.key] > 0 && (
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
                        <span>Date</span>
                        <span>Time</span>
                        <span>Status</span>
                        <span>Actions</span>
                    </div>

                    {filteredAppointments.map((appt) => {
                        const isCurrent = isCurrentAppointment(appt);
                        const apptDate = new Date(`${appt.appointment_date}T${appt.appointment_time}`);
                        const formattedDate = apptDate.toLocaleDateString();
                        const formattedTime = apptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        
                        return (
                            <div key={appt.id} className={`appointments-row ${isCurrent ? 'current-appointment' : ''}`}>
                            <span>{appt.id}</span>
                            <span>{appt.patientName}</span>
                                <span>{formattedDate}</span>
                            <span>
                                    {formattedTime}
                                    {isCurrent && <span className="current-badge">NOW</span>}
                                </span>
                                <span className={`status-badge ${appt.status}`}>
                                    {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                            </span>
                                <span className="actions">
                                    {activeTab === 'requested' && (
                                        <>
                                            <Button
                                                variant="primary"
                                                text="Accept"
                                                onClick={() => handleAcceptAppointment(appt.id)}
                                                disabled={actionLoading === appt.id}
                                            />
                                            <Button
                                                variant="tertiary"
                                                text="Reject"
                                                onClick={() => handleRejectAppointment(appt.id)}
                                                disabled={actionLoading === appt.id}
                                            />
                                        </>
                                    )}
                                    {activeTab === 'scheduled' && (
                                        <Button
                                            variant="tertiary"
                                            text="Cancel"
                                            onClick={() => handleCancelAppointment(appt.id)}
                                            disabled={actionLoading === appt.id}
                                        />
                                    )}
                                    {activeTab === 'completed' && isCurrent && (
                                        <Button
                                            variant="primary"
                                            text="Take Action"
                                onClick={() => navigate(`/doctor/appointments/${appt.id}`)}
                                        />
                                    )}
                            </span>
                        </div>
                        );
                    })}

                    {filteredAppointments.length === 0 && (
                        <div className="appointments-empty">No appointments found.</div>
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="pagination-container">
                        <div className="pagination-info">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalAppointments)} of {totalAppointments} appointments
                        </div>
                        <div className="pagination-controls">
                            <Button
                                variant="tertiary"
                                text="Previous"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            />
                            
                            <div className="pagination-pages">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum: number;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    
                                    return (
                                        <button
                                            key={pageNum}
                                            className={`pagination-page ${currentPage === pageNum ? 'active' : ''}`}
                                            onClick={() => handlePageChange(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            
                            <Button
                                variant="tertiary"
                                text="Next"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Cancel Appointment</h3>
                        <p>Please provide a reason for cancelling this appointment:</p>
                        <CustomInput
                            as="textarea"
                            placeholder="Enter cancellation reason..."
                            value={cancelReason}
                            onChange={(e) => setCancelReason((e.target as HTMLTextAreaElement).value)}
                            rows={3}
                        />
                        <div className="modal-actions">
                            <Button
                                variant="tertiary"
                                text="Cancel"
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setCancelReason('');
                                    setAppointmentToCancel(null);
                                }}
                            />
                            <Button
                                variant="primary"
                                text="Confirm Cancellation"
                                onClick={confirmCancelAppointment}
                                disabled={!cancelReason.trim() || actionLoading === appointmentToCancel}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
