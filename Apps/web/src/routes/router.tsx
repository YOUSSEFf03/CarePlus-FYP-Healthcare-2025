import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from '../pages/Landing';
import NotFound from '../pages/NotFound';
import DoctorLayout from '../layouts/DoctorLayout';
import PharmacyLayout from '../layouts/PharmacyLayout';
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import DoctorPatients from '../pages/doctor/DoctorPatients';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/Login';
import Unauthorized from '../pages/Unauthorized';
import AssistantLayout from '../layouts/AssistantLayout';
import AssistantDashboard from '../pages/assistant/AssistantDashboard';
import DoctorAddPatient from '../pages/doctor/DoctorAddPatient';
import DoctorAppointments from '../pages/doctor/DoctorAppointments';
import DoctorCalendar from '../pages/doctor/DoctorCalendar';
import DoctorWorkplaces from '../pages/doctor/DoctorWorkplaces';
import WorkplaceDetails from '../pages/doctor/WorkplaceDetails';
import DoctorSignup from '../pages/DoctorSignup';
import GuestOnly from './GuestOnly';
import PharmacyDashboard from '../pages/pharmacy/PharmacyDashboard';

export default function AppRoutes() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Auth (guest-only) */}
            <Route element={<GuestOnly />}>
                <Route path="/login" element={<Login />} />

                {/* Signups by role */}
                <Route path="/register/doctor" element={<DoctorSignup />} />
                {/* <Route path="/register/pharmacy" element={<PharmacySignup />} />
                <Route path="/register/assistant" element={<AssistantSignup />} /> */}

                {/* Common auth flows */}
                {/* <Route path="/verify-otp" element={<VerifyOtp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/register/success" element={<RegisterSuccess />} /> */}
            </Route>

            {/* Doctor Dashboard */}
            <Route
                path="/doctor"
                element={<ProtectedRoute allowedRoles={['doctor']} />}
            >
                <Route element={<DoctorLayout />}>
                    <Route index element={<Navigate to="dashboard" />} />
                    <Route path='dashboard' element={<DoctorDashboard />} />
                    <Route path="patients" element={<DoctorPatients />} />
                    <Route path="calendar" element={<DoctorCalendar />} />
                    <Route path="appointments" element={<DoctorAppointments />} />
                    <Route path="workplaces" element={<DoctorWorkplaces />} />
                    <Route path="workplaces/:name" element={<WorkplaceDetails />} />
                </Route>
            </Route>

            {/* Assistant Dashboard */}
            <Route
                path="/assistant"
                element={<ProtectedRoute allowedRoles={['assistant']} />}
            >
                <Route element={<AssistantLayout />}>
                    <Route index element={<AssistantDashboard />} />
                    {/* <Route path="patients" element={<DoctorPatients />} /> */}
                </Route>
            </Route>

            {/* Pharmacy Dashboard */}
            <Route
                path="/pharmacy"
                element={
                    <ProtectedRoute allowedRoles={['pharmacy']}></ProtectedRoute>
                }
            >
                <Route element={<PharmacyLayout />}>
                    <Route index element={<PharmacyDashboard />} />
                    {/* <Route path="inventory" element={<PharmacyInventory />} /> */}
                </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}