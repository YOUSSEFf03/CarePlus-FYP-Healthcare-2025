import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
    allowedRoles: string[];
}

export default function ProtectedRoute({ allowedRoles }: Props) {
    const { isAuthenticated, user } = useAuth();
    console.log('isAuthenticated:', isAuthenticated, 'user:', user);
    if (!isAuthenticated || !user) return <Navigate to="/login" />;

    return allowedRoles.includes(user.role)
        ? <Outlet />
        : <Navigate to="/unauthorized" />;
}