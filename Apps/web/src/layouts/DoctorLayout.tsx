import React from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button/Button";
import Sidebar, { SidebarProvider, useSidebar } from "../components/Sidebar/Sidebar";
import { sidebarConfig } from '../components/Sidebar/navigationConfig';
import "./doctorLayout.css";

const LayoutContent: React.FC = () => {
    const { isCollapsed } = useSidebar();
    const location = useLocation();

    const labelMap: Record<string, string> = {
        doctor: 'Overview',
        patients: 'Patients',
        assistant: 'Assistant Dashboard',
        dashboard: 'Overview',
        security: 'Security & Privacy',
        help: 'Help Center',
        settings: 'Settings',
        add: "Add Patient",
        // Add more routes as needed
    };

    const pathSegments = location.pathname
        .split('/')
        .filter(Boolean);

    const trimmedSegments =
        pathSegments.length > 1 && pathSegments[0] === "doctor"
            ? pathSegments.slice(1)
            : pathSegments;

    const breadcrumbItems = trimmedSegments.map((segment, index) => {
        const path = "/" + ["doctor", ...trimmedSegments.slice(0, index + 1)].join("/");
        const label =
            labelMap[segment] ||
            segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
        return { label, path };
    });

    return (
        <div className={`doctor-layout-content ${isCollapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}>
            <header className="doctor-layout-header">
                <nav className="breadcrumb">
                    {breadcrumbItems.map((crumb, i) => (
                        <React.Fragment key={crumb.path}>
                            {i > 0 && <span className="breadcrumb-separator">/</span>}
                            {i === breadcrumbItems.length - 1 ? (
                                <span className="breadcrumb-current">{crumb.label}</span>
                            ) : (
                                <Link className="breadcrumb-item" to={crumb.path}>
                                    {crumb.label}
                                </Link>
                            )}
                        </React.Fragment>
                    ))}
                </nav>
            </header>
            <main className="doctor-layout-main">
                <Outlet />
            </main>
        </div>
    );
};

export default function DoctorLayout() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <SidebarProvider>
            <div className="doctor-layout">
                <Sidebar onLogout={handleLogout} items={sidebarConfig.doctor}
                    generalItems={sidebarConfig.general} />
                <LayoutContent />
            </div>
        </SidebarProvider>
    );
}