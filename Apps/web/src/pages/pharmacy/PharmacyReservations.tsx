import React, { useMemo, useState, useEffect } from "react";
import "../../styles/pharmacyReservations.css";
import CustomText from "../../components/Text/CustomText";
import Button from "../../components/Button/Button";
import { ReactComponent as ExportIcon } from "../../assets/svgs/Export.svg";
import { ReactComponent as RefreshIcon } from "../../assets/svgs/ArrowClockwise.svg";
import pharmacyApiService, { Reservation as ApiReservation } from "../../services/pharmacyApiService";

type ReservationStatus = "reserved" | "confirmed" | "ready" | "collected" | "cancelled";

type Reservation = {
    id: string;
    customer: string;
    phone: string;
    item: string;
    qty: number;
    pickupAt: string; // ISO or friendly
    status: ReservationStatus;
    note?: string;
    reservation_id: number;
};

const TABS: ReservationStatus[] | ["All"] = ["All", "reserved", "confirmed", "ready", "collected", "cancelled"] as any;

export default function PharmacyReservations() {
    const [active, setActive] = useState<(typeof TABS)[number]>("All");
    const [query, setQuery] = useState("");
    const [from, setFrom] = useState<string>("");
    const [to, setTo] = useState<string>("");
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load reservations data
    useEffect(() => {
        const loadReservations = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const reservationsData = await pharmacyApiService.getReservations();
                
                // Transform API reservations to display format
                const displayReservations: Reservation[] = reservationsData.data.map(reservation => ({
                    id: `RSV-${reservation.reservation_id}`,
                    customer: `Patient ${reservation.patient_id}`, // In real app, get from user service
                    phone: "N/A", // Not available in current API
                    item: reservation.medicine?.item?.name || 'Unknown Medicine',
                    qty: reservation.quantity_reserved,
                    pickupAt: reservation.pickup_deadline || reservation.reserved_date,
                    status: reservation.status as ReservationStatus,
                    note: reservation.notes,
                    reservation_id: reservation.reservation_id,
                }));
                
                setReservations(displayReservations);
            } catch (err) {
                console.error('Error loading reservations:', err);
                setError(err instanceof Error ? err.message : 'Failed to load reservations');
            } finally {
                setLoading(false);
            }
        };

        loadReservations();
    }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return reservations.filter(r => {
            const matchesTab = active === "All" ? true : r.status === active;
            const matchesSearch =
                !q ||
                r.id.toLowerCase().includes(q) ||
                r.customer.toLowerCase().includes(q) ||
                r.item.toLowerCase().includes(q) ||
                r.phone.toLowerCase().includes(q);
            const time = new Date(r.pickupAt).getTime();
            const after = from ? time >= new Date(from).getTime() : true;
            const before = to ? time <= new Date(to).getTime() : true;
            return matchesTab && matchesSearch && after && before;
        });
    }, [reservations, active, query, from, to]);

    // Handle reservation status update
    const handleStatusUpdate = async (reservationId: number, newStatus: string) => {
        try {
            if (newStatus === 'cancelled') {
                await pharmacyApiService.cancelReservation(reservationId);
            }
            // Reload reservations
            const reservationsData = await pharmacyApiService.getReservations();
            const displayReservations: Reservation[] = reservationsData.data.map(reservation => ({
                id: `RSV-${reservation.reservation_id}`,
                customer: `Patient ${reservation.patient_id}`,
                phone: "N/A",
                item: reservation.medicine?.item?.name || 'Unknown Medicine',
                qty: reservation.quantity_reserved,
                pickupAt: reservation.pickup_deadline || reservation.reserved_date,
                status: reservation.status as ReservationStatus,
                note: reservation.notes,
                reservation_id: reservation.reservation_id,
            }));
            setReservations(displayReservations);
        } catch (err) {
            console.error('Error updating reservation status:', err);
            alert('Failed to update reservation status');
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="reservations">
                <div className="reservations__header">
                    <CustomText variant="text-heading-H2">Reservations</CustomText>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                    <CustomText variant="text-body-lg-r">Loading reservations...</CustomText>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="reservations">
                <div className="reservations__header">
                    <CustomText variant="text-heading-H2">Reservations</CustomText>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', flexDirection: 'column' }}>
                    <div style={{ color: '#ef4444', marginBottom: '16px' }}>
                        <CustomText variant="text-body-lg-r">
                            Error: {error}
                        </CustomText>
                    </div>
                    <Button 
                        text="Retry" 
                        onClick={() => window.location.reload()} 
                        variant="primary"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="reservations">
            {/* Header */}
            <div className="reservations__header">
                <CustomText variant="text-heading-H2">Reservations</CustomText>
                <div className="reservations__header-actions">
                    <Button
                        variant="secondary"
                        className="btn-compact"
                        iconLeft={<RefreshIcon width={24} />}
                        text="Refresh"
                    />
                    <Button
                        variant="tertiary"
                        className="btn-compact"
                        iconLeft={<ExportIcon width={24} />}
                        text="Export CSV"
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="reservations__filters">
                <div className="filters-left">
                    <div className="input-with-icon">
                        <span className="search-icon">
                            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M28.7078 27.293L22.449 21.0355C24.2631 18.8577 25.1676 16.0643 24.9746 13.2364C24.7815 10.4086 23.5057 7.7641 21.4125 5.85299C19.3193 3.94189 16.5698 2.91135 13.7362 2.97575C10.9025 3.04015 8.20274 4.19453 6.19851 6.19876C4.19429 8.20298 3.0399 10.9027 2.9755 13.7364C2.9111 16.5701 3.94164 19.3195 5.85275 21.4127C7.76385 23.5059 10.4084 24.7818 13.2362 24.9748C16.064 25.1679 18.8574 24.2633 21.0353 22.4493L27.2928 28.708C27.3857 28.8009 27.496 28.8746 27.6174 28.9249C27.7388 28.9752 27.8689 29.0011 28.0003 29.0011C28.1317 29.0011 28.2618 28.9752 28.3832 28.9249C28.5046 28.8746 28.6149 28.8009 28.7078 28.708C28.8007 28.6151 28.8744 28.5048 28.9247 28.3834C28.975 28.262 29.0008 28.1319 29.0008 28.0005C29.0008 27.8691 28.975 27.739 28.9247 27.6176C28.8744 27.4962 28.8007 27.3859 28.7078 27.293ZM5.00029 14.0005C5.00029 12.2205 5.52813 10.4804 6.51706 9.0004C7.50599 7.52035 8.9116 6.3668 10.5561 5.68561C12.2007 5.00443 14.0103 4.8262 15.7561 5.17346C17.5019 5.52073 19.1056 6.3779 20.3642 7.63657C21.6229 8.89524 22.4801 10.4989 22.8274 12.2447C23.1746 13.9905 22.9964 15.8001 22.3152 17.4447C21.634 19.0892 20.4805 20.4948 19.0004 21.4838C17.5204 22.4727 15.7803 23.0005 14.0003 23.0005C11.6141 22.9979 9.3265 22.0488 7.63925 20.3616C5.95199 18.6743 5.00293 16.3867 5.00029 14.0005Z" fill="currentColor" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search ID, customer, item, phone"
                            value={query}
                            className="ph-input"
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <div className="tabs">
                        {TABS.map((t) => (
                            <button
                                key={t}
                                className={`tab ${active === t ? "active" : ""}`}
                                onClick={() => setActive(t)}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="filters-right">
                    <div className="date-range">
                        <label>
                            <span>From</span>
                            <input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} />
                        </label>
                        <label>
                            <span>To</span>
                            <input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} />
                        </label>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="panel">
                <div className="table reservations-table">
                    <div className="table__head">
                        <span>ID</span>
                        <span>Customer</span>
                        <span>Product</span>
                        <span>Qty</span>
                        <span>Pickup</span>
                        <span>Status</span>
                        <span></span>
                    </div>
                    <div className="table__body">
                        {filtered.map((r) => (
                            <div className="table__row" key={r.id}>
                                <span className="mono">{r.id}</span>
                                <div className="customer-cell">
                                    <span>{r.customer}</span>
                                    <span className="muted">{r.phone}</span>
                                </div>
                                <span>{r.item}</span>
                                <span>{r.qty}</span>
                                <span>{new Date(r.pickupAt).toLocaleString()}</span>
                                <span className={`status status--${r.status.toLowerCase()}`}>{r.status}</span>
                                <div className="actions">
                                    {r.status === "reserved" && (
                                        <Button 
                                            variant="ghost" 
                                            text="Confirm" 
                                            className="btn-mini" 
                                            onClick={() => handleStatusUpdate(r.reservation_id, "confirmed")}
                                        />
                                    )}
                                    {r.status === "confirmed" && (
                                        <Button 
                                            variant="ghost" 
                                            text="Mark Ready" 
                                            className="btn-mini" 
                                            onClick={() => handleStatusUpdate(r.reservation_id, "ready")}
                                        />
                                    )}
                                    {r.status === "ready" && (
                                        <Button 
                                            variant="ghost" 
                                            text="Collected" 
                                            className="btn-mini" 
                                            onClick={() => handleStatusUpdate(r.reservation_id, "collected")}
                                        />
                                    )}
                                    <Button variant="ghost" text="Details" className="btn-mini" />
                                </div>
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <div className="empty-state">
                                <CustomText variant="text-heading-H5">No reservations match your filters</CustomText>
                                <CustomText variant="text-body-sm-r" className="muted">
                                    Try adjusting the date range or search query.
                                </CustomText>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
