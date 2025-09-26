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
import DoctorProfilePage from "../pages/doctor/DoctorProfilePage";
import PatientFullChart from '../pages/doctor/PatientFullChart';
import DoctorAppointments from '../pages/doctor/DoctorAppointments';
import DoctorCalendar from '../pages/doctor/DoctorCalendar';
import DoctorWorkplaces from '../pages/doctor/DoctorWorkplaces';
import WorkplaceDetails from '../pages/doctor/WorkplaceDetails';
import DoctorSignup from '../pages/DoctorSignup';
import GuestOnly from './GuestOnly';
import PharmacyDashboard from '../pages/pharmacy/PharmacyDashboard';
import AppointmentDetails from '../pages/doctor/AppointmentDetails';
import PharmacyOrders from '../pages/pharmacy/PharmacyOrders';
import PharmacyReservations from '../pages/pharmacy/PharmacyReservations';
import PharmacyInventory from '../pages/pharmacy/PharmacyInventory';
import PharmacyPrescriptions from '../pages/pharmacy/PharmacyPrescriptions';
import PharmacyCustomers from "../pages/pharmacy/PharmacyCustomers";
import PharmacyProfilePage from '../pages/pharmacy/PharmacyProfile';
import PharmacyAddProduct from "../pages/pharmacy/PharmacyAddProduct";
import BreastCancerPage from './views/BreastCancerPage';

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
                    <Route path="/doctor/profile" element={<DoctorProfilePage />} />
                    <Route path='dashboard' element={<DoctorDashboard />} />
                    <Route path='breast-cancer' element={<BreastCancerPage />} />
                    <Route path="patients" element={<DoctorPatients />} />
                    <Route path="patients/:id" element={<PatientFullChart />} />
                    <Route path="calendar" element={<DoctorCalendar />} />
                    <Route path="appointments" element={<DoctorAppointments />} />
                    <Route path="/doctor/appointments/:id" element={<AppointmentDetails />} />
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
                    <Route index element={<Navigate to="dashboard" />} />
                    <Route path='dashboard' element={<PharmacyDashboard />} />
                    <Route path="/pharmacy/profile" element={<PharmacyProfilePage />} />
                    <Route path="orders" element={<PharmacyOrders />} />
                    <Route path="reservations" element={<PharmacyReservations />} />
                    <Route path="inventory" element={<PharmacyInventory />} />
                    <Route path="prescriptions" element={<PharmacyPrescriptions />} />
                    <Route path="customers" element={<PharmacyCustomers />} />
                    <Route path="add-product" element={<PharmacyAddProduct />} />
                </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}