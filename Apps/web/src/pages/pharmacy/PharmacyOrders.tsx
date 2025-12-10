import React, { useMemo, useState, useEffect } from "react";
import "../../styles/pharmacyOrders.css";
import CustomText from "../../components/Text/CustomText";
import Button from "../../components/Button/Button";
import { ReactComponent as ExportIcon } from "../../assets/svgs/Export.svg";
import { ReactComponent as FunnelIcon } from "../../assets/svgs/Funnel.svg";
import { ReactComponent as RefreshIcon } from "../../assets/svgs/ArrowClockwise.svg";
import pharmacyApiService, { Order } from "../../services/pharmacyApiService";

type OrderStatus = "pending" | "confirmed" | "processing" | "ready" | "completed" | "cancelled";
type OrderType = "delivery" | "pickup";

type DisplayOrder = {
    id: string;
    customer: string;
    type: OrderType;
    total: string;
    status: OrderStatus;
    createdAt: string; // ISO
    when: string;      // humanized (e.g., '5m ago')
    order_id: number;
};

const TABS: OrderStatus[] | ["All"] = ["All", "pending", "confirmed", "processing", "ready", "completed", "cancelled"] as any;

export default function Orders() {
    const [activeTab, setActiveTab] = useState<(OrderStatus | "All")>("All");
    const [query, setQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<OrderType | "All">("All");
    const [statusFilter, setStatusFilter] = useState<OrderStatus | "All">("All");
    const [orders, setOrders] = useState<DisplayOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load orders data
    useEffect(() => {
        const loadOrders = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const ordersData = await pharmacyApiService.getOrders();
                
                // Transform API orders to display format
                const displayOrders: DisplayOrder[] = ordersData.data.map(order => ({
                    id: `ORD-${order.order_id}`,
                    customer: `Patient ${order.patient_id}`, // In real app, get from user service
                    type: order.deliveries && order.deliveries.length > 0 ? "delivery" : "pickup",
                    total: `$${order.total_amount.toFixed(2)}`,
                    status: order.status as OrderStatus,
                    createdAt: order.order_date,
                    when: formatTimeAgo(order.order_date),
                    order_id: order.order_id,
                }));
                
                setOrders(displayOrders);
            } catch (err) {
                console.error('Error loading orders:', err);
                setError(err instanceof Error ? err.message : 'Failed to load orders');
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, []);

    // Format time ago
    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 60) {
            return `${diffInMinutes}m ago`;
        } else if (diffInMinutes < 1440) {
            const hours = Math.floor(diffInMinutes / 60);
            return `${hours}h ago`;
        } else {
            const days = Math.floor(diffInMinutes / 1440);
            return `${days}d ago`;
        }
    };

    const filtered = useMemo(() => {
        return orders.filter(o => {
            const byTab = activeTab === "All" ? true : o.status === activeTab;
            const byQuery =
                !query ||
                o.id.toLowerCase().includes(query.toLowerCase()) ||
                o.customer.toLowerCase().includes(query.toLowerCase());
            const byType = typeFilter === "All" ? true : o.type === typeFilter;
            const byStatus = statusFilter === "All" ? true : o.status === statusFilter;
            return byTab && byQuery && byType && byStatus;
        });
    }, [orders, activeTab, query, typeFilter, statusFilter]);

    // Handle order status update
    const handleStatusUpdate = async (orderId: number, newStatus: string) => {
        try {
            await pharmacyApiService.updateOrderStatus(orderId, newStatus);
            // Reload orders
            const ordersData = await pharmacyApiService.getOrders();
            const displayOrders: DisplayOrder[] = ordersData.data.map(order => ({
                id: `ORD-${order.order_id}`,
                customer: `Patient ${order.patient_id}`,
                type: order.deliveries && order.deliveries.length > 0 ? "delivery" : "pickup",
                total: `$${order.total_amount.toFixed(2)}`,
                status: order.status as OrderStatus,
                createdAt: order.order_date,
                when: formatTimeAgo(order.order_date),
                order_id: order.order_id,
            }));
            setOrders(displayOrders);
        } catch (err) {
            console.error('Error updating order status:', err);
            alert('Failed to update order status');
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="orders">
                <div className="orders__header">
                    <CustomText variant="text-heading-H2">Orders</CustomText>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                    <CustomText variant="text-body-lg-r">Loading orders...</CustomText>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="orders">
                <div className="orders__header">
                    <CustomText variant="text-heading-H2">Orders</CustomText>
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
        <div className="orders">
            {/* Header */}
            <div className="orders__header">
                <CustomText variant="text-heading-H2">Orders</CustomText>
                <div className="orders__header-actions">
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
                    {/* <Button
                        className="btn-compact"
                        iconLeft={<PlusIcon />}
                        text="Create manual order"
                    /> */}
                </div>
            </div>

            {/* Tabs */}
            <div className="orders__tabs">
                {TABS.map(t => (
                    <button
                        key={String(t)}
                        className={`orders-tab ${activeTab === t ? "is-active" : ""}`}
                        onClick={() => setActiveTab(t as any)}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="orders__filters">
                <div className="input-with-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M10 18a7.95 7.95 0 0 0 4.9-1.7l4.4 4.4l1.4-1.4l-4.4-4.4A8 8 0 1 0 10 18m0-14a6 6 0 1 1 0 12a6 6 0 0 1 0-12" /></svg>
                    <input
                        className="ph-input"
                        placeholder="Search by order ID or customer…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                <div className="filters-row">
                    <div className="ph-select">
                        <FunnelIcon width={24} />
                        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)}>
                            <option value="All">All types</option>
                            <option value="delivery">Delivery</option>
                            <option value="pickup">Pickup</option>
                        </select>
                    </div>

                    <div className="ph-select">
                        <FunnelIcon width={24} />
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
                            <option value="All">All statuses</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="ready">Ready</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <section className="panel">
                <div className="panel__header">
                    <CustomText variant="text-heading-H4">Order list</CustomText>
                    <CustomText variant="text-body-sm-r" className="muted">
                        {filtered.length} result{filtered.length === 1 ? "" : "s"}
                    </CustomText>
                </div>

                <div className="ph-table" id="orders-table">
                    <div className="ph-head">
                        <span>Order ID</span>
                        <span>Customer</span>
                        <span>Type</span>
                        <span>Status</span>
                        <span>Total</span>
                        <span>Created</span>
                        <span>Actions</span>
                    </div>

                    {filtered.map(o => (
                        <div className="ph-row" key={o.id}>
                            <span className="mono">{o.id}</span>
                            <span>{o.customer}</span>
                            <span>{o.type}</span>
                            <span className={`status status--${o.status.replace(/\s/g, "").toLowerCase()}`}>{o.status}</span>
                            <span>{o.total}</span>
                            <span className="muted">{o.when}</span>
                            <span className="row-actions">
                                <Button variant="tertiary" className="btn-xs" iconLeft={
                                    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M30.9137 15.5955C30.87 15.4967 29.8112 13.148 27.4575 10.7942C24.3212 7.65799 20.36 6.00049 16 6.00049C11.64 6.00049 7.67874 7.65799 4.54249 10.7942C2.18874 13.148 1.12499 15.5005 1.08624 15.5955C1.02938 15.7234 1 15.8618 1 16.0017C1 16.1417 1.02938 16.2801 1.08624 16.408C1.12999 16.5067 2.18874 18.8542 4.54249 21.208C7.67874 24.343 11.64 26.0005 16 26.0005C20.36 26.0005 24.3212 24.343 27.4575 21.208C29.8112 18.8542 30.87 16.5067 30.9137 16.408C30.9706 16.2801 31 16.1417 31 16.0017C31 15.8618 30.9706 15.7234 30.9137 15.5955ZM16 24.0005C12.1525 24.0005 8.79124 22.6017 6.00874 19.8442C4.86704 18.7089 3.89572 17.4142 3.12499 16.0005C3.89551 14.5867 4.86686 13.292 6.00874 12.1567C8.79124 9.39924 12.1525 8.00049 16 8.00049C19.8475 8.00049 23.2087 9.39924 25.9912 12.1567C27.1352 13.2917 28.1086 14.5864 28.8812 16.0005C27.98 17.683 24.0537 24.0005 16 24.0005ZM16 10.0005C14.8133 10.0005 13.6533 10.3524 12.6666 11.0117C11.6799 11.671 10.9108 12.608 10.4567 13.7044C10.0026 14.8007 9.88377 16.0071 10.1153 17.171C10.3468 18.3349 10.9182 19.404 11.7573 20.2431C12.5965 21.0822 13.6656 21.6537 14.8294 21.8852C15.9933 22.1167 17.1997 21.9979 18.2961 21.5438C19.3924 21.0896 20.3295 20.3206 20.9888 19.3339C21.6481 18.3472 22 17.1872 22 16.0005C21.9983 14.4097 21.3657 12.8845 20.2408 11.7597C19.1159 10.6348 17.5908 10.0021 16 10.0005ZM16 20.0005C15.2089 20.0005 14.4355 19.7659 13.7777 19.3264C13.1199 18.8868 12.6072 18.2621 12.3045 17.5312C12.0017 16.8003 11.9225 15.9961 12.0768 15.2201C12.2312 14.4442 12.6122 13.7315 13.1716 13.1721C13.731 12.6127 14.4437 12.2317 15.2196 12.0773C15.9956 11.923 16.7998 12.0022 17.5307 12.305C18.2616 12.6077 18.8863 13.1204 19.3259 13.7782C19.7654 14.436 20 15.2094 20 16.0005C20 17.0614 19.5786 18.0788 18.8284 18.8289C18.0783 19.5791 17.0609 20.0005 16 20.0005Z" fill="currentColor" />
                                    </svg>
                                } />
                                {o.status === "pending" && (
                                    <Button 
                                        variant="secondary" 
                                        className="btn-xs" 
                                        text="Accept" 
                                        onClick={() => handleStatusUpdate(o.order_id, "confirmed")}
                                    />
                                )}
                                {o.status === "ready" && (
                                    <Button 
                                        variant="secondary" 
                                        className="btn-xs" 
                                        text="Mark picked up" 
                                        onClick={() => handleStatusUpdate(o.order_id, "completed")}
                                    />
                                )}
                            </span>
                        </div>
                    ))}

                    {filtered.length === 0 && (
                        <div className="ph-empty">
                            <CustomText variant="text-body-md-sb">No orders match your filters.</CustomText>
                            <CustomText variant="text-body-sm-r" className="muted">Try changing the status or search term.</CustomText>
                        </div>
                    )}
                </div>

                <div className="orders__pagination">
                    <Button variant="ghost" text="Previous" />
                    <div className="page-indicator">Page 1 of 8</div>
                    <Button variant="ghost" text="Next" />
                </div>
            </section>
        </div>
    );
}