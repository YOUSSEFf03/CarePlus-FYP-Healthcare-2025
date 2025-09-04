import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import '../../styles/doctorPatients.css';
import CustomText from "../../components/Text/CustomText";
import PatientDrawer, { Patient } from "../../components/Patient/PatientDrawer";

const patients: Patient[] = [
    { id: "P001", name: "Dianne Russell", phone: "(505) 555-0125", email: "dianne.russell@example.com", dob: "1985-03-25", gender: "Female" },
    { id: "P002", name: "Ralph Edwards", email: "ralph.edwards@example.com", dob: "1978-11-03", gender: "Male" },
    { id: "P003", name: "Jane Cooper", phone: "(402) 555-0175", dob: "1990-07-15", gender: "Female" },
    { id: "P004", name: "Esther Howard", phone: "(303) 555-0190", email: "", dob: "1988-05-20", gender: "Female" },
    { id: "P005", name: "Cody Fisher", phone: "(214) 555-0140", email: "", dob: "1992-09-10", gender: "Male" },
    { id: "P006", name: "Cody Fisher", phone: "(214) 555-0140", email: "", dob: "1992-09-10", gender: "Male" },
    { id: "P007", name: "Cody Fisher", phone: "(214) 555-0140", email: "", dob: "1992-09-10", gender: "Male" },
    { id: "P008", name: "Cody Fisher", phone: "(214) 555-0140", email: "", dob: "1992-09-10", gender: "Male" },
    { id: "P009", name: "Cody Fisher", phone: "(214) 555-0140", email: "", dob: "1992-09-10", gender: "Male" },
    { id: "P010", name: "Cody Fisher", phone: "(214) 555-0140", email: "", dob: "1992-09-10", gender: "Male" },
    { id: "P011", name: "Cody Fisher", phone: "(214) 555-0140", email: "", dob: "1992-09-10", gender: "Male" },
    { id: "P012", name: "Cody Fisher", phone: "(214) 555-0140", email: "", dob: "1992-09-10", gender: "Male" },
];

export default function DoctorPatients() {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const selectedId = searchParams.get("selected");
    const selectedPatient = useMemo(
        () => patients.find(p => p.id === selectedId) ?? null,
        [selectedId]
    );

    const openDrawer = (id: string) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set("selected", id);
            return next;
        }, { replace: false });
    };

    const closeDrawer = () => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.delete("selected");
            return next;
        }, { replace: true });
    };

    const toggleMenu = (id: string) => {
        setOpenMenuId(prev => (prev === id ? null : id));
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpenMenuId(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="patients-container">
            <div className="patients-header">
                <CustomText variant="text-heading-H2" as="h2" className="patients-title">
                    Your Patients
                    <CustomText variant="text-body-md-r" as="p" className="patients-count">
                        {patients.length}
                    </CustomText>
                </CustomText>
            </div>

            <div className="patients-table-wrapper">
                <div className="patients-table">
                    <div className="patients-header-row">
                        <span>ID</span>
                        <span>Name</span>
                        <span>Contact</span>
                        <span>DOB</span>
                        <span>Gender</span>
                        <span>Actions</span>
                    </div>

                    {patients.map((patient) => (
                        <div key={patient.id}
                            className="patients-row patients-row--clickable"
                            onClick={(e) => {
                                // Allow inner controls (kebab) to work without opening the drawer
                                const target = e.target as HTMLElement;
                                const insideActions = target.closest(".patients-actions");
                                if (!insideActions) openDrawer(patient.id);
                            }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openDrawer(patient.id)}
                            aria-label={`View details for ${patient.name}`}
                        >
                            <span>{patient.id}</span>
                            <span>
                                <Link to={`/doctor/patients/${patient.id}`} onClick={(e) => e.stopPropagation()}>
                                    {patient.name}
                                </Link>
                            </span>
                            <span>{patient.phone || "-"}</span>
                            <span>{patient.dob}</span>
                            <span>{patient.gender}</span>
                            <span className="patients-actions">
                                <span className="action-icon tooltip-wrapper" title="View">
                                    <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" strokeWidth="1.5" d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z" />
                                        <path stroke="currentColor" strokeWidth="1.5" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    </svg>
                                    <span className="tooltip-text">View Details</span>
                                </span>
                                <div className="dropdown-wrapper" ref={dropdownRef}>
                                    <span className="action-icon tooltip-wrapper" style={{ marginTop: "8px" }} onClick={() => toggleMenu(patient.id)} title="Options">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M12 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm0 2.25a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm0 5.25a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                        {openMenuId === patient.id && (
                                            <div className="dropdown-menu">
                                                <div className="dropdown-item">
                                                    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M28.4149 3.58558C28.1634 3.33424 27.8494 3.15449 27.5054 3.06485C27.1613 2.97521 26.7996 2.97891 26.4574 3.07558H26.4386L2.44615 10.3556C2.05664 10.4678 1.71044 10.6958 1.45342 11.0093C1.1964 11.3227 1.0407 11.7069 1.00695 12.1108C0.973194 12.5148 1.06298 12.9194 1.26442 13.2712C1.46585 13.623 1.76942 13.9052 2.1349 14.0806L12.7499 19.2506L17.9124 29.8593C18.073 30.202 18.3283 30.4915 18.6481 30.6938C18.9679 30.896 19.339 31.0025 19.7174 31.0006C19.7749 31.0006 19.8324 30.9981 19.8899 30.9931C20.2935 30.9604 20.6775 30.805 20.9903 30.5479C21.3031 30.2907 21.5298 29.944 21.6399 29.5543L28.9149 5.56183C28.9149 5.55558 28.9149 5.54933 28.9149 5.54308C29.0128 5.20178 29.0181 4.84057 28.9302 4.49655C28.8424 4.15253 28.6645 3.83811 28.4149 3.58558ZM19.7286 28.9818L19.7224 28.9993V28.9906L14.7149 18.7031L20.7149 12.7031C20.8945 12.514 20.9932 12.2623 20.9898 12.0015C20.9865 11.7407 20.8814 11.4916 20.697 11.3072C20.5126 11.1228 20.2635 11.0177 20.0027 11.0144C19.742 11.011 19.4902 11.1097 19.3011 11.2893L13.3011 17.2893L3.0099 12.2818H3.00115H3.01865L26.9999 5.00058L19.7286 28.9818Z" fill="var(--neutral-500)" />
                                                    </svg>
                                                    Send Reminder
                                                </div>
                                                <div className="dropdown-item">
                                                    <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                        <path stroke="var(--neutral-500)" stroke-linecap="square" stroke-linejoin="round" stroke-width="1.5" d="M7 19H5a1 1 0 0 1-1-1v-1a3 3 0 0 1 3-3h1m4-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm7.441 1.559a1.907 1.907 0 0 1 0 2.698l-6.069 6.069L10 19l.674-3.372 6.07-6.07a1.907 1.907 0 0 1 2.697 0Z" />
                                                    </svg>
                                                    Edit Patient Info
                                                </div>
                                            </div>
                                        )}
                                        <span className="tooltip-text">Options</span>
                                    </span>
                                </div>
                            </span>
                        </div>
                    ))}

                    {patients.length === 0 && (
                        <div className="appointments-empty">No patients found.</div>
                    )}
                </div>
            </div>
            {selectedPatient && (
                <PatientDrawer
                    patient={selectedPatient}
                    onClose={closeDrawer}
                />
            )}
        </div>
    );
}