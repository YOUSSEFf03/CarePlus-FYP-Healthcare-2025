// PatientDrawer.tsx
import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import Button from "../../components/Button/Button"; // adjust path if needed
import { Link } from "react-router-dom";
import CustomText from "../../components/Text/CustomText";

export type Patient = {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    dob?: string;
    gender?: string;
};

type Props = {
    patient: Patient;
    onClose: () => void;
};

function DrawerContent({ patient, onClose }: Props) {
    const overlayRef = useRef<HTMLDivElement | null>(null);
    const drawerRef = useRef<HTMLDivElement | null>(null);

    // Lock page scroll while drawer is open
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, []);

    // Close on Escape
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    // Click outside to close
    const handleOverlayMouseDown = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) onClose();
    };

    // Focus the first focusable
    useEffect(() => {
        const el = drawerRef.current?.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        el?.focus();
    }, []);

    return (
        <div
            className="drawer-overlay drawer-overlay--glass"
            ref={overlayRef}
            onMouseDown={handleOverlayMouseDown}
            aria-hidden={false}
            aria-label="Patient details overlay"
        >
            <aside
                className="drawer"
                ref={drawerRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="patient-drawer-title"
            >
                <header className="drawer-header">
                    <div className="drawer-title-wrap">
                        <h3 id="patient-drawer-title" className="drawer-title">{patient.name}</h3>
                        <span className="drawer-subtitle">ID: {patient.id} • {patient.gender ?? "—"}</span>
                    </div>

                    <div className="drawer-actions">
                        <Link to={`/doctor/patients/${patient.id}`} aria-label="Open full chart">
                            <Button variant="secondary" text="Open full chart" iconRight={<svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M27.7075 16.7081L18.7075 25.7081C18.5199 25.8957 18.2654 26.0011 18 26.0011C17.7346 26.0011 17.4801 25.8957 17.2925 25.7081C17.1049 25.5204 16.9994 25.2659 16.9994 25.0006C16.9994 24.7352 17.1049 24.4807 17.2925 24.2931L24.5863 17.0006H5C4.73478 17.0006 4.48043 16.8952 4.29289 16.7077C4.10536 16.5201 4 16.2658 4 16.0006C4 15.7353 4.10536 15.481 4.29289 15.2934C4.48043 15.1059 4.73478 15.0006 5 15.0006H24.5863L17.2925 7.70806C17.1049 7.52042 16.9994 7.26592 16.9994 7.00056C16.9994 6.73519 17.1049 6.4807 17.2925 6.29306C17.4801 6.10542 17.7346 6 18 6C18.2654 6 18.5199 6.10542 18.7075 6.29306L27.7075 15.2931C27.8005 15.3859 27.8742 15.4962 27.9246 15.6176C27.9749 15.739 28.0008 15.8691 28.0008 16.0006C28.0008 16.132 27.9749 16.2621 27.9246 16.3835C27.8742 16.5049 27.8005 16.6152 27.7075 16.7081Z" fill="currentColor" />
                            </svg>} />
                        </Link>
                        <Button className="btn-close-drawer" variant="ghost" iconLeft={<svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M25.7071 24.2931C25.8 24.386 25.8737 24.4963 25.924 24.6177C25.9743 24.7391 26.0001 24.8692 26.0001 25.0006C26.0001 25.132 25.9743 25.2621 25.924 25.3835C25.8737 25.5048 25.8 25.6151 25.7071 25.7081C25.6142 25.801 25.5039 25.8747 25.3825 25.9249C25.2611 25.9752 25.131 26.0011 24.9996 26.0011C24.8682 26.0011 24.7381 25.9752 24.6167 25.9249C24.4953 25.8747 24.385 25.801 24.2921 25.7081L15.9996 17.4143L7.70708 25.7081C7.51944 25.8957 7.26494 26.0011 6.99958 26.0011C6.73422 26.0011 6.47972 25.8957 6.29208 25.7081C6.10444 25.5204 5.99902 25.2659 5.99902 25.0006C5.99902 24.7352 6.10444 24.4807 6.29208 24.2931L14.5858 16.0006L6.29208 7.70806C6.10444 7.52042 5.99902 7.26592 5.99902 7.00056C5.99902 6.73519 6.10444 6.4807 6.29208 6.29306C6.47972 6.10542 6.73422 6 6.99958 6C7.26494 6 7.51944 6.10542 7.70708 6.29306L15.9996 14.5868L24.2921 6.29306C24.4797 6.10542 24.7342 6 24.9996 6C25.2649 6 25.5194 6.10542 25.7071 6.29306C25.8947 6.4807 26.0001 6.73519 26.0001 7.00056C26.0001 7.26592 25.8947 7.52042 25.7071 7.70806L17.4133 16.0006L25.7071 24.2931Z" fill="currentColor" />
                        </svg>} onClick={onClose} />
                    </div>
                </header>

                <div className="drawer-body">
                    <section className="drawer-section">
                        <CustomText variant="text-heading-H4" as={'h4'}>Contact</CustomText>
                        <div className="kv"><span>Phone</span><span>{patient.phone || "—"}</span></div>
                        <div className="kv"><span>Email</span><span>{patient.email || "—"}</span></div>
                    </section>

                    <section className="drawer-section">
                        <CustomText variant="text-heading-H4" as={'h4'}>Demographics</CustomText>
                        <div className="kv"><span>Date of Birth</span><span>{patient.dob || "—"}</span></div>
                        <div className="kv"><span>Gender</span><span>{patient.gender || "—"}</span></div>
                    </section>

                    <section className="drawer-section">
                        <CustomText variant="text-heading-H4" as={'h4'}>Quick actions</CustomText>
                        <div className="drawer-cta-row">
                            <Button variant="primary" text="Add note" />
                            <Button variant="tertiary" text="Schedule" />
                            <Button variant="tertiary" text="Message" />
                        </div>
                    </section>
                </div>
            </aside>
        </div>
    );
}

export default function PatientDrawer(props: Props) {
    return ReactDOM.createPortal(<DrawerContent {...props} />, document.body);
}