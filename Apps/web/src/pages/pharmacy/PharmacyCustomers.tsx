import React, { useMemo, useState, useEffect } from "react";
import CustomText from "../../components/Text/CustomText";
import Button from "../../components/Button/Button";
import "../../styles/doctorAppointments.css";
import "../../styles/pharmacyCustomers.css";
import { ReactComponent as ExportIcon } from "../../assets/svgs/Export.svg";
import pharmacyApiService, { Order } from "../../services/pharmacyApiService";

type CustomerTag = "New" | "Returning" | "VIP";
type Channel = "Walk-in" | "Delivery" | "Pickup";

type CustomerRow = {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    lastOrderAt?: string; // ISO date
    lifetimeSpend: number;
    ordersCount: number;
    tag: CustomerTag;
    preferredChannel: Channel;
    address?: string;
    patient_id: number;
};

const MOCK_CUSTOMERS: CustomerRow[] = [
    {
        id: "CUST-10293",
        name: "Samir Khaled",
        phone: "+20 10 1234 5678",
        email: "samir.k@example.com",
        lastOrderAt: "2025-08-27",
        lifetimeSpend: 682.4,
        ordersCount: 12,
        tag: "Returning",
        preferredChannel: "Delivery",
        address: "12 Nile Ave, Cairo",
        patient_id: 10293,
    },
    {
        id: "CUST-10294",
        name: "Lina R.",
        phone: "+20 11 9876 1212",
        email: "lina.r@example.com",
        lastOrderAt: "2025-08-28",
        lifetimeSpend: 124.9,
        ordersCount: 2,
        tag: "New",
        preferredChannel: "Pickup",
        address: "45 Garden City, Cairo",
        patient_id: 10294,
    },
    {
        id: "CUST-10110",
        name: "Ahmed N.",
        phone: "+20 12 5555 8899",
        email: "ahmed.n@example.com",
        lastOrderAt: "2025-08-25",
        lifetimeSpend: 3210.75,
        ordersCount: 44,
        tag: "VIP",
        preferredChannel: "Delivery",
        address: "El Zamalek, Cairo",
        patient_id: 10110,
    },
];

type SortKey = "name" | "lastOrderAt" | "ordersCount" | "lifetimeSpend";

export default function PharmacyCustomers() {
    const [query, setQuery] = useState("");
    const [tagFilter, setTagFilter] = useState<"all" | CustomerTag>("all");
    const [channelFilter, setChannelFilter] = useState<"all" | Channel>("all");
    const [sortBy, setSortBy] = useState<SortKey>("lastOrderAt");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [selected, setSelected] = useState<CustomerRow | null>(null);
    const [customers, setCustomers] = useState<CustomerRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load customers data from orders
    useEffect(() => {
        const loadCustomers = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const ordersData = await pharmacyApiService.getOrders();
                
                // Group orders by patient to create customer records
                const customerMap = new Map<number, CustomerRow>();
                
                ordersData.data.forEach(order => {
                    const patientId = order.patient_id;
                    if (!customerMap.has(patientId)) {
                        customerMap.set(patientId, {
                            id: `CUST-${patientId}`,
                            name: `Patient ${patientId}`, // In real app, get from user service
                            phone: undefined,
                            email: undefined,
                            lastOrderAt: order.order_date,
                            lifetimeSpend: 0,
                            ordersCount: 0,
                            tag: "New" as CustomerTag,
                            preferredChannel: "Pickup" as Channel,
                            address: undefined,
                            patient_id: patientId,
                        });
                    }
                    
                    const customer = customerMap.get(patientId)!;
                    customer.lifetimeSpend += order.total_amount;
                    customer.ordersCount += 1;
                    
                    // Update last order date if this is more recent
                    if (new Date(order.order_date) > new Date(customer.lastOrderAt || '')) {
                        customer.lastOrderAt = order.order_date;
                    }
                    
                    // Determine preferred channel
                    if (order.deliveries && order.deliveries.length > 0) {
                        customer.preferredChannel = "Delivery";
                    } else {
                        customer.preferredChannel = "Pickup";
                    }
                    
                    // Determine tag based on order count
                    if (customer.ordersCount >= 10) {
                        customer.tag = "VIP";
                    } else if (customer.ordersCount >= 3) {
                        customer.tag = "Returning";
                    } else {
                        customer.tag = "New";
                    }
                });
                
                setCustomers(Array.from(customerMap.values()));
            } catch (err) {
                console.error('Error loading customers:', err);
                setError(err instanceof Error ? err.message : 'Failed to load customers');
            } finally {
                setLoading(false);
            }
        };

        loadCustomers();
    }, []);

    const filtered = useMemo(() => {
        let rows = [...customers];

        // text search
        if (query.trim()) {
            const q = query.toLowerCase();
            rows = rows.filter(
                (c) =>
                    c.name.toLowerCase().includes(q) ||
                    c.id.toLowerCase().includes(q) ||
                    (c.email?.toLowerCase().includes(q) ?? false) ||
                    (c.phone?.toLowerCase().includes(q) ?? false)
            );
        }

        // filters
        if (tagFilter !== "all") rows = rows.filter((c) => c.tag === tagFilter);
        if (channelFilter !== "all")
            rows = rows.filter((c) => c.preferredChannel === channelFilter);

        // sorting
        rows.sort((a, b) => {
            const factor = sortDir === "asc" ? 1 : -1;
            switch (sortBy) {
                case "name":
                    return factor * a.name.localeCompare(b.name);
                case "ordersCount":
                    return factor * (a.ordersCount - b.ordersCount);
                case "lifetimeSpend":
                    return factor * (a.lifetimeSpend - b.lifetimeSpend);
                case "lastOrderAt":
                default:
                    return factor * ((a.lastOrderAt ?? "").localeCompare(b.lastOrderAt ?? ""));
            }
        });

        return rows;
    }, [query, tagFilter, channelFilter, sortBy, sortDir]);

    const toggleSort = (key: SortKey) => {
        if (sortBy === key) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(key);
            setSortDir("desc");
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="overview">
                <div className="overview__header">
                    <CustomText variant="text-heading-H2">Customers</CustomText>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                    <CustomText variant="text-body-lg-r">Loading customers...</CustomText>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="overview">
                <div className="overview__header">
                    <CustomText variant="text-heading-H2">Customers</CustomText>
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
        <div className="overview">
            {/* Header */}
            <div className="overview__header">
                <CustomText variant="text-heading-H2">Customers</CustomText>
                <div className="overview__actions">
                    {/* <Button
                        text="New customer"
                        className="btn-compact"
                        iconLeft={
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                        }
                        onClick={() => alert("Open create-customer flow")}
                    /> */}
                    <Button
                        variant="tertiary"
                        text="Export CSV"
                        className="btn-compact"
                        iconLeft={
                            <ExportIcon width={24} />
                        }
                        onClick={() => alert("Exported")}
                    />
                </div>
            </div>

            {/* Filters */}
            <section className="panel">
                <div className="panel__header customers__filters">
                    <div className="search-box slim">
                        <span className="search-icon">
                            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M28.7078 27.293L22.449 21.0355C24.2631 18.8577 25.1676 16.0643 24.9746 13.2364C24.7815 10.4086 23.5057 7.7641 21.4125 5.85299C19.3193 3.94189 16.5698 2.91135 13.7362 2.97575C10.9025 3.04015 8.20274 4.19453 6.19851 6.19876C4.19429 8.20298 3.0399 10.9027 2.9755 13.7364C2.9111 16.5701 3.94164 19.3195 5.85275 21.4127C7.76385 23.5059 10.4084 24.7818 13.2362 24.9748C16.064 25.1679 18.8574 24.2633 21.0353 22.4493L27.2928 28.708C27.3857 28.8009 27.496 28.8746 27.6174 28.9249C27.7388 28.9752 27.8689 29.0011 28.0003 29.0011C28.1317 29.0011 28.2618 28.9752 28.3832 28.9249C28.5046 28.8746 28.6149 28.8009 28.7078 28.708C28.8007 28.6151 28.8744 28.5048 28.9247 28.3834C28.975 28.262 29.0008 28.1319 29.0008 28.0005C29.0008 27.8691 28.975 27.739 28.9247 27.6176C28.8744 27.4962 28.8007 27.3859 28.7078 27.293ZM5.00029 14.0005C5.00029 12.2205 5.52813 10.4804 6.51706 9.0004C7.50599 7.52035 8.9116 6.3668 10.5561 5.68561C12.2007 5.00443 14.0103 4.8262 15.7561 5.17346C17.5019 5.52073 19.1056 6.3779 20.3642 7.63657C21.6229 8.89524 22.4801 10.4989 22.8274 12.2447C23.1746 13.9905 22.9964 15.8001 22.3152 17.4447C21.634 19.0892 20.4805 20.4948 19.0004 21.4838C17.5204 22.4727 15.7803 23.0005 14.0003 23.0005C11.6141 22.9979 9.3265 22.0488 7.63925 20.3616C5.95199 18.6743 5.00293 16.3867 5.00029 14.0005Z" fill="currentColor" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search by name, phone, email, ID…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>

                    <div className="segmented">
                        {(["all", "New", "Returning", "VIP"] as const).map((t) => (
                            <button
                                key={t}
                                className={`segmented-btn ${tagFilter === t ? "is-active" : ""}`}
                                onClick={() => setTagFilter(t as any)}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <div className="segmented">
                        {(["all", "Walk-in", "Delivery", "Pickup"] as const).map((ch) => (
                            <button
                                key={ch}
                                className={`segmented-btn ${channelFilter === ch ? "is-active" : ""}`}
                                onClick={() => setChannelFilter(ch as any)}
                            >
                                {ch}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="table">
                    <div className="table__head customers__head">
                        <button onClick={() => toggleSort("name")} className="th-btn">Customer</button>
                        <span>Contact</span>
                        <button onClick={() => toggleSort("lastOrderAt")} className="th-btn">
                            Last order
                            {sortBy === "lastOrderAt" && <SortIcon dir={sortDir} />}
                        </button>
                        <button onClick={() => toggleSort("ordersCount")} className="th-btn">
                            Orders
                            {sortBy === "ordersCount" && <SortIcon dir={sortDir} />}
                        </button>
                        <button onClick={() => toggleSort("lifetimeSpend")} className="th-btn">
                            Lifetime spend
                            {sortBy === "lifetimeSpend" && <SortIcon dir={sortDir} />}
                        </button>
                        <span>Actions</span>
                    </div>

                    <div className="table__body">
                        {filtered.map((c) => (
                            <div className="table__row" key={c.id}>
                                <span>
                                    <div className="cust-name">{c.name}</div>
                                    <div className={`chip chip--${c.tag.toLowerCase()}`}>{c.tag}</div>
                                </span>

                                <span className="cust-contact">
                                    {c.phone && <div>{c.phone}</div>}
                                    {c.email && <div className="muted">{c.email}</div>}
                                </span>

                                <span>{c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString() : "—"}</span>
                                <span>{c.ordersCount}</span>
                                <span className="mono">${c.lifetimeSpend.toFixed(2)}</span>

                                <span className="row-actions">
                                    <Button
                                        variant="tertiary"
                                        className="btn-compact"
                                        iconLeft={
                                            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M30.9137 15.5955C30.87 15.4967 29.8112 13.148 27.4575 10.7942C24.3212 7.65799 20.36 6.00049 16 6.00049C11.64 6.00049 7.67874 7.65799 4.54249 10.7942C2.18874 13.148 1.12499 15.5005 1.08624 15.5955C1.02938 15.7234 1 15.8618 1 16.0017C1 16.1417 1.02938 16.2801 1.08624 16.408C1.12999 16.5067 2.18874 18.8542 4.54249 21.208C7.67874 24.343 11.64 26.0005 16 26.0005C20.36 26.0005 24.3212 24.343 27.4575 21.208C29.8112 18.8542 30.87 16.5067 30.9137 16.408C30.9706 16.2801 31 16.1417 31 16.0017C31 15.8618 30.9706 15.7234 30.9137 15.5955ZM16 24.0005C12.1525 24.0005 8.79124 22.6017 6.00874 19.8442C4.86704 18.7089 3.89572 17.4142 3.12499 16.0005C3.89551 14.5867 4.86686 13.292 6.00874 12.1567C8.79124 9.39924 12.1525 8.00049 16 8.00049C19.8475 8.00049 23.2087 9.39924 25.9912 12.1567C27.1352 13.2917 28.1086 14.5864 28.8812 16.0005C27.98 17.683 24.0537 24.0005 16 24.0005ZM16 10.0005C14.8133 10.0005 13.6533 10.3524 12.6666 11.0117C11.6799 11.671 10.9108 12.608 10.4567 13.7044C10.0026 14.8007 9.88377 16.0071 10.1153 17.171C10.3468 18.3349 10.9182 19.404 11.7573 20.2431C12.5965 21.0822 13.6656 21.6537 14.8294 21.8852C15.9933 22.1167 17.1997 21.9979 18.2961 21.5438C19.3924 21.0896 20.3295 20.3206 20.9888 19.3339C21.6481 18.3472 22 17.1872 22 16.0005C21.9983 14.4097 21.3657 12.8845 20.2408 11.7597C19.1159 10.6348 17.5908 10.0021 16 10.0005ZM16 20.0005C15.2089 20.0005 14.4355 19.7659 13.7777 19.3264C13.1199 18.8868 12.6072 18.2621 12.3045 17.5312C12.0017 16.8003 11.9225 15.9961 12.0768 15.2201C12.2312 14.4442 12.6122 13.7315 13.1716 13.1721C13.731 12.6127 14.4437 12.2317 15.2196 12.0773C15.9956 11.923 16.7998 12.0022 17.5307 12.305C18.2616 12.6077 18.8863 13.1204 19.3259 13.7782C19.7654 14.436 20 15.2094 20 16.0005C20 17.0614 19.5786 18.0788 18.8284 18.8289C18.0783 19.5791 17.0609 20.0005 16 20.0005Z" fill="currentColor" />
                                            </svg>
                                        }
                                        onClick={() => setSelected(c)}
                                    />
                                    {/* <Button
                                        variant="secondary"
                                        className="btn-compact"
                                        text="New order"
                                        onClick={() => alert(`Start order for ${c.name}`)}
                                    /> */}
                                </span>
                            </div>
                        ))}

                        {filtered.length === 0 && (
                            <div className="table__row">
                                <span className="muted" style={{ gridColumn: "1 / -1" }}>
                                    No customers match your filters.
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Details drawer */}
            {selected && (
                <div className="rx-viewer-overlay" role="dialog" aria-modal="true" onClick={() => setSelected(null)}>
                    <div className="customer-drawer" onClick={(e) => e.stopPropagation()}>
                        <div className="drawer-header">
                            <CustomText variant="text-heading-H4">{selected.name}</CustomText>
                            <Button variant="ghost" className="btn-compact" text="Close" onClick={() => setSelected(null)} />
                        </div>

                        <div className="drawer-meta">
                            <div><strong>ID:</strong> {selected.id}</div>
                            <div><strong>Phone:</strong> {selected.phone || "—"}</div>
                            <div><strong>Email:</strong> {selected.email || "—"}</div>
                            <div><strong>Address:</strong> {selected.address || "—"}</div>
                            <div><strong>Preferred channel:</strong> {selected.preferredChannel}</div>
                            <div><strong>Orders:</strong> {selected.ordersCount}</div>
                            <div><strong>Lifetime spend:</strong> ${selected.lifetimeSpend.toFixed(2)}</div>
                            <div><strong>Last order:</strong> {selected.lastOrderAt ? new Date(selected.lastOrderAt).toLocaleDateString() : "—"}</div>
                            <div><strong>Tag:</strong> {selected.tag}</div>
                        </div>

                        <div className="drawer-actions">
                            {/* <Button text="Create order" onClick={() => alert("Create order")} /> */}
                            {/* <Button variant="secondary" text="Message" onClick={() => alert("Send message")} /> */}
                            {/* <Button variant="ghost" text="Delete" onClick={() => alert("Delete (confirm)")} /> */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SortIcon({ dir }: { dir: "asc" | "desc" }) {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" style={{ marginLeft: 6 }}>
            {dir === "asc" ? (
                <path d="M7 14l5-5 5 5" stroke="currentColor" strokeWidth="1.5" fill="none" />
            ) : (
                <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" />
            )}
        </svg>
    );
}