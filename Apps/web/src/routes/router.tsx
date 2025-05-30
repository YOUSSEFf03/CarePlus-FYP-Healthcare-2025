import { Routes, Route } from 'react-router-dom';
import Landing from '../pages/Landing';
import NotFound from '../pages/NotFound';
import DoctorLayout from '../layouts/DoctorLayout';
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import DoctorPatients from '../pages/doctor/DoctorPatients';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/Login';

export default function AppRoutes() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            {/* <Route path="/unauthorized" element={<Unauthorized />} /> */}

            {/* Doctor Dashboard */}
            <Route
                path="/doctor"
                element={<ProtectedRoute allowedRoles={['doctor']} />}
            >
                <Route element={<DoctorLayout />}>
                    <Route index element={<DoctorDashboard />} />
                    <Route path="patients" element={<DoctorPatients />} />
                </Route>
            </Route>

            {/* Assistant Dashboard */}
            {/* <Route
                path="/assistant"
                element={
                    <ProtectedRoute allowedRoles={['assistant']}>
                        <AssistantLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<AssistantDashboard />} />
                <Route path="appointments" element={<AssistantAppointments />} />
            </Route> */}

            {/* Pharmacy Dashboard */}
            {/* <Route
                path="/pharmacy"
                element={
                    <ProtectedRoute allowedRoles={['pharmacy']}>
                        <PharmacyLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<PharmacyDashboard />} />
                <Route path="inventory" element={<PharmacyInventory />} />
            </Route> */}

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}