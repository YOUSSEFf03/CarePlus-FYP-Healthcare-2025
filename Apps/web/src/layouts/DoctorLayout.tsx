import React, { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button/Button";
import Sidebar, { SidebarProvider, useSidebar } from "../components/Sidebar/Sidebar";
import { sidebarConfig, getGeneralItems } from '../components/Sidebar/navigationConfig';
import "./doctorLayout.css";

const LayoutContent: React.FC = () => {
    const { isCollapsed } = useSidebar();
    const [isMac, setIsMac] = useState(false);
    const location = useLocation();
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [notifications, setNotifications] = React.useState([
        { id: 1, text: "New appointment request from John Doe", read: false },
        { id: 2, text: "Lab results for Patient #345 are in", read: false },
        { id: 3, text: "Dr. Smith commented on your report", read: true },
        { id: 4, text: "You have a meeting at 2PM today", read: false }
    ]);
    const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);

    const unreadCount = notifications.filter(n => !n.read).length;

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const toggleNotification = () => {
        setIsNotificationOpen(!isNotificationOpen);
    };

    const markAsRead = (id: number) => {
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );
    };

    useEffect(() => {
        const platform = navigator.platform.toLowerCase();
        setIsMac(platform.includes("mac"));
    }, []);

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

                <div className="header-right">
                    <div className="search-box">
                        <span className="search-icon">
                            <svg width="18" height="18" style={{ marginTop: "5px" }} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M28.7078 27.293L22.449 21.0355C24.2631 18.8577 25.1676 16.0643 24.9746 13.2364C24.7815 10.4086 23.5057 7.7641 21.4125 5.85299C19.3193 3.94189 16.5698 2.91135 13.7362 2.97575C10.9025 3.04015 8.20274 4.19453 6.19851 6.19876C4.19429 8.20298 3.0399 10.9027 2.9755 13.7364C2.9111 16.5701 3.94164 19.3195 5.85275 21.4127C7.76385 23.5059 10.4084 24.7818 13.2362 24.9748C16.064 25.1679 18.8574 24.2633 21.0353 22.4493L27.2928 28.708C27.3857 28.8009 27.496 28.8746 27.6174 28.9249C27.7388 28.9752 27.8689 29.0011 28.0003 29.0011C28.1317 29.0011 28.2618 28.9752 28.3832 28.9249C28.5046 28.8746 28.6149 28.8009 28.7078 28.708C28.8007 28.6151 28.8744 28.5048 28.9247 28.3834C28.975 28.262 29.0008 28.1319 29.0008 28.0005C29.0008 27.8691 28.975 27.739 28.9247 27.6176C28.8744 27.4962 28.8007 27.3859 28.7078 27.293ZM5.00029 14.0005C5.00029 12.2205 5.52813 10.4804 6.51706 9.0004C7.50599 7.52035 8.9116 6.3668 10.5561 5.68561C12.2007 5.00443 14.0103 4.8262 15.7561 5.17346C17.5019 5.52073 19.1056 6.3779 20.3642 7.63657C21.6229 8.89524 22.4801 10.4989 22.8274 12.2447C23.1746 13.9905 22.9964 15.8001 22.3152 17.4447C21.634 19.0892 20.4805 20.4948 19.0004 21.4838C17.5204 22.4727 15.7803 23.0005 14.0003 23.0005C11.6141 22.9979 9.3265 22.0488 7.63925 20.3616C5.95199 18.6743 5.00293 16.3867 5.00029 14.0005Z" fill="currentColor" />
                            </svg>
                        </span>
                        <input ref={searchInputRef} type="text" placeholder="Search" />
                        <div className="shortcut">
                            <kbd>{isMac ? '⌘' : 'Ctrl'}</kbd><kbd>F</kbd>
                        </div>
                    </div>
                    <div className="separator-header-right"></div>
                    <div className="notification-button" onClick={toggleNotification}>
                        <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M27.7245 21.993C27.0308 20.798 25.9995 17.4167 25.9995 13.0005C25.9995 10.3483 24.946 7.80478 23.0706 5.92942C21.1952 4.05406 18.6517 3.00049 15.9995 3.00049C13.3474 3.00049 10.8038 4.05406 8.92846 5.92942C7.0531 7.80478 5.99953 10.3483 5.99953 13.0005C5.99953 17.418 4.96703 20.798 4.27328 21.993C4.09612 22.2968 4.0022 22.6419 4.00099 22.9936C3.99978 23.3453 4.09133 23.6911 4.2664 23.9961C4.44147 24.3011 4.69388 24.5546 4.99816 24.7309C5.30244 24.9072 5.64784 25.0002 5.99953 25.0005H11.1008C11.3315 26.1294 11.9451 27.144 12.8377 27.8727C13.7303 28.6014 14.8472 28.9994 15.9995 28.9994C17.1518 28.9994 18.2687 28.6014 19.1614 27.8727C20.054 27.144 20.6676 26.1294 20.8983 25.0005H25.9995C26.3511 25 26.6964 24.9069 27.0005 24.7304C27.3046 24.554 27.5568 24.3005 27.7317 23.9956C27.9066 23.6906 27.9981 23.3449 27.9968 22.9933C27.9956 22.6417 27.9016 22.2967 27.7245 21.993ZM15.9995 27.0005C15.3793 27.0003 14.7744 26.8079 14.268 26.4497C13.7617 26.0915 13.3788 25.5852 13.172 25.0005H18.827C18.6203 25.5852 18.2374 26.0915 17.731 26.4497C17.2247 26.8079 16.6198 27.0003 15.9995 27.0005ZM5.99953 23.0005C6.96203 21.3455 7.99953 17.5105 7.99953 13.0005C7.99953 10.8788 8.84238 8.84392 10.3427 7.34363C11.843 5.84334 13.8778 5.00049 15.9995 5.00049C18.1213 5.00049 20.1561 5.84334 21.6564 7.34363C23.1567 8.84392 23.9995 10.8788 23.9995 13.0005C23.9995 17.5067 25.0345 21.3417 25.9995 23.0005H5.99953Z" fill="currentColor" />
                        </svg>
                        {/* <span className="notification-dot"></span> */}
                        {notifications.some(n => !n.read) && <span className="notification-dot"></span>}
                    </div>
                </div>
                <div className={`notification-sidebar-wrapper ${isNotificationOpen ? "open" : ""}`}>
                    <div className="notification-sidebar">
                        <div className="notification-header">
                            <h3>Notifications</h3>
                            <button onClick={toggleNotification}>&times;</button>
                        </div>
                        <ul className="notification-list">
                            {notifications.map(n => (
                                <li
                                    key={n.id}
                                    className={`notification-item ${n.read ? 'read' : 'unread'}`}
                                    onClick={() => markAsRead(n.id)}
                                >
                                    {n.text}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </header>
            <main className="doctor-layout-main">
                <Outlet />
            </main>
        </div>
    );
};

export default function DoctorLayout() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const role = user?.role;

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (!role || !(role in sidebarConfig)) return null;

    return (
        <SidebarProvider>
            <div className="doctor-layout">
                <Sidebar onLogout={handleLogout} items={sidebarConfig[role]}
                    generalItems={getGeneralItems(role)} />
                <LayoutContent />
            </div>
        </SidebarProvider>
    );
}