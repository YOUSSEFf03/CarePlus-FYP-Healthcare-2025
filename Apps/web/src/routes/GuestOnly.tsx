// src/router/GuestOnly.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function GuestOnly() {
    const { user } = useAuth(); // null when logged out
    if (user) {
        // send them to their home based on role
        if (user.role === 'doctor') return <Navigate to="/doctor" replace />;
        if (user.role === 'assistant') return <Navigate to="/assistant" replace />;
        if (user.role === 'pharmacy') return <Navigate to="/pharmacy" replace />;
        return <Navigate to="/" replace />;
    }
    return <Outlet />;
}