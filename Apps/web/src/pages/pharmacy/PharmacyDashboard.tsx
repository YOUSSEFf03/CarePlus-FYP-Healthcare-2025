import React, { useState, useEffect } from "react";
import "../../styles/pharmacyDashboard.css";
import CustomText from "../../components/Text/CustomText";
import StatsCard from "../../components/StatsCard/StatsCard";
import Button from "../../components/Button/Button";
import { ReactComponent as BuildingOffice } from "../../assets/svgs/BuildingOffice.svg";
import { ReactComponent as RevenueIcon } from "../../assets/svgs/CurrencyCircleDollar.svg";
import { ReactComponent as PrescriptionIcon } from '../../assets/svgs/Files.svg';
import { useNavigate } from "react-router-dom";
import pharmacyDashboardService, { DashboardStats, TopSellingProduct, RecentActivity } from "../../services/pharmacyDashboardService";

// Removed unused Order type

export default function PharmacyDashboard() {
    const navigate = useNavigate();
    
    // State for dashboard data
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
    const [topProducts, setTopProducts] = useState<TopSellingProduct[]>([]);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load dashboard data
    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const [stats, products, activity] = await Promise.all([
                    pharmacyDashboardService.getDashboardStats(),
                    pharmacyDashboardService.getTopSellingProducts(5),
                    pharmacyDashboardService.getRecentActivity(10)
                ]);
                
                setDashboardStats(stats);
                setTopProducts(products);
                setRecentActivity(activity);
            } catch (err) {
                console.error('Error loading dashboard data:', err);
                setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

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

    // Get status color class
    const getStatusClass = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'pending': 'status--pending',
            'confirmed': 'status--infulfillment',
            'processing': 'status--infulfillment',
            'ready': 'status--ready',
            'completed': 'status--completed',
            'cancelled': 'status--cancelled',
            'reserved': 'status--pending',
            'picked_up': 'status--completed'
        };
        return statusMap[status.toLowerCase()] || 'status--pending';
    };

    // Convert recent activity to display format
    const formatRecentActivity = (activity: RecentActivity[]) => {
        return activity.map(item => ({
            id: item.id,
            customer: `Patient ${item.patient_id}`,
            type: item.delivery_method === 'delivery' ? 'Delivery' : 'Pickup',
            total: item.total ? formatCurrency(item.total) : 'N/A',
            status: item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' '),
            time: formatTimeAgo(item.date)
        }));
    };

    // Create stats array for StatsCard components
    const statsArray = dashboardStats ? [
        {
            title: "Sales (Today)",
            value: formatCurrency(dashboardStats.sales.today),
            icon: RevenueIcon,
            change: dashboardStats.sales.change,
            timeframe: dashboardStats.sales.timeframe,
        },
        {
            title: "Orders (Today)",
            value: dashboardStats.orders.today,
            icon: PrescriptionIcon,
            change: dashboardStats.orders.change,
            timeframe: dashboardStats.orders.timeframe,
        },
        {
            title: "Prescription Queue",
            value: dashboardStats.prescriptionQueue.current,
            icon: BuildingOffice,
            change: dashboardStats.prescriptionQueue.change,
            timeframe: dashboardStats.prescriptionQueue.timeframe,
        },
        {
            title: "Low‑Stock SKUs",
            value: dashboardStats.lowStockSKUs.current,
            icon: BuildingOffice,
            change: dashboardStats.lowStockSKUs.change,
            timeframe: dashboardStats.lowStockSKUs.timeframe,
        },
    ] : [];

    // Loading state
    if (loading) {
        return (
            <div className="overview">
                <div className="overview__header">
                    <CustomText variant="text-heading-H2">Overview</CustomText>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                    <CustomText variant="text-body-lg-r">Loading dashboard...</CustomText>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="overview">
                <div className="overview__header">
                    <CustomText variant="text-heading-H2">Overview</CustomText>
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
            {/* Top: Title + quick actions */}
            <div className="overview__header">
                <CustomText variant="text-heading-H2">Overview</CustomText>
                <div className="overview__actions">
                    <Button
                        text="Add Product"
                        iconLeft={
                            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M28 16.0005C28 16.2657 27.8946 16.5201 27.7071 16.7076C27.5196 16.8951 27.2652 17.0005 27 17.0005H17V27.0005C17 27.2657 16.8946 27.5201 16.7071 27.7076C16.5196 27.8951 16.2652 28.0005 16 28.0005C15.7348 28.0005 15.4804 27.8951 15.2929 27.7076C15.1054 27.5201 15 27.2657 15 27.0005V17.0005H5C4.73478 17.0005 4.48043 16.8951 4.29289 16.7076C4.10536 16.5201 4 16.2657 4 16.0005C4 15.7353 4.10536 15.4809 4.29289 15.2934C4.48043 15.1058 4.73478 15.0005 5 15.0005H15V5.00049C15 4.73527 15.1054 4.48092 15.2929 4.29338C15.4804 4.10585 15.7348 4.00049 16 4.00049C16.2652 4.00049 16.5196 4.10585 16.7071 4.29338C16.8946 4.48092 17 4.73527 17 5.00049V15.0005H27C27.2652 15.0005 27.5196 15.1058 27.7071 15.2934C27.8946 15.4809 28 15.7353 28 16.0005Z" fill="currentColor" />
                            </svg>
                        }
                        className="btn-compact"
                        onClick={() => navigate("/pharmacy/add-product")}
                    />
                    <Button
                        text="Review prescriptions"
                        variant="secondary"
                        iconLeft={
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14,2 14,8 20,8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <polyline points="10,9 9,9 8,9" />
                            </svg>
                        }
                        className="btn-compact"
                    />
                </div>
            </div>

            {/* KPI stats */}
            <div className="overview__stats-grid">
                {statsArray.map((s) => (
                    <StatsCard
                        key={s.title}
                        title={s.title}
                        value={s.value}
                        icon={s.icon}
                        change={s.change}
                        timeframe={s.timeframe}
                    />
                ))}
            </div>

            {/* Queues + Recent activity */}
            <div className="overview__panels">
                <section className="panel">
                    <div className="panel__header">
                        <CustomText variant="text-heading-H4">Top‑Selling Products</CustomText>
                        <Button variant="tertiary" className="linklike" text="View full report" iconRight={<svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M24.9996 8.00049V21.0005C24.9996 21.2657 24.8942 21.5201 24.7067 21.7076C24.5192 21.8951 24.2648 22.0005 23.9996 22.0005C23.7344 22.0005 23.48 21.8951 23.2925 21.7076C23.1049 21.5201 22.9996 21.2657 22.9996 21.0005V10.4142L8.70708 24.708C8.51944 24.8956 8.26494 25.001 7.99958 25.001C7.73422 25.001 7.47972 24.8956 7.29208 24.708C7.10444 24.5203 6.99902 24.2659 6.99902 24.0005C6.99902 23.7351 7.10444 23.4806 7.29208 23.293L21.5858 9.00049H10.9996C10.7344 9.00049 10.48 8.89513 10.2925 8.70759C10.1049 8.52006 9.99958 8.2657 9.99958 8.00049C9.99958 7.73527 10.1049 7.48092 10.2925 7.29338C10.48 7.10585 10.7344 7.00049 10.9996 7.00049H23.9996C24.2648 7.00049 24.5192 7.10585 24.7067 7.29338C24.8942 7.48092 24.9996 7.73527 24.9996 8.00049Z" fill="currentColor" />
                        </svg>} />
                    </div>

                    <div className="ph-table" id="ph-top-sellers">
                        <div className="ph-head">
                            <span>Product</span>
                            <span>Units Sold</span>
                            <span>Revenue</span>
                        </div>
                        {topProducts.length > 0 ? (
                            topProducts.map((product) => (
                                <div className="ph-row" key={product.product_id}>
                                    <span>{product.name}</span>
                                    <span>{product.units_sold}</span>
                                    <span>{formatCurrency(product.revenue)}</span>
                                </div>
                            ))
                        ) : (
                            <div className="ph-row" style={{ textAlign: 'center', padding: '20px' }}>
                                <span style={{ gridColumn: '1 / -1', color: '#6b7280' }}>
                                    No products sold yet
                                </span>
                            </div>
                        )}
                    </div>
                    {/* 
                    <div className="panel__footer">
                        <Button variant="tertiary" className="linklike" text="View full report" iconRight={<svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M24.9996 8.00049V21.0005C24.9996 21.2657 24.8942 21.5201 24.7067 21.7076C24.5192 21.8951 24.2648 22.0005 23.9996 22.0005C23.7344 22.0005 23.48 21.8951 23.2925 21.7076C23.1049 21.5201 22.9996 21.2657 22.9996 21.0005V10.4142L8.70708 24.708C8.51944 24.8956 8.26494 25.001 7.99958 25.001C7.73422 25.001 7.47972 24.8956 7.29208 24.708C7.10444 24.5203 6.99902 24.2659 6.99902 24.0005C6.99902 23.7351 7.10444 23.4806 7.29208 23.293L21.5858 9.00049H10.9996C10.7344 9.00049 10.48 8.89513 10.2925 8.70759C10.1049 8.52006 9.99958 8.2657 9.99958 8.00049C9.99958 7.73527 10.1049 7.48092 10.2925 7.29338C10.48 7.10585 10.7344 7.00049 10.9996 7.00049H23.9996C24.2648 7.00049 24.5192 7.10585 24.7067 7.29338C24.8942 7.48092 24.9996 7.73527 24.9996 8.00049Z" fill="currentColor" />
                        </svg>} />
                    </div> */}
                </section>

                <section className="panel">
                    <div className="panel__header">
                        <CustomText variant="text-heading-H4">Recent activity</CustomText>
                        <Button variant="tertiary" className="linklike" text="View all" iconRight={<svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M24.9996 8.00049V21.0005C24.9996 21.2657 24.8942 21.5201 24.7067 21.7076C24.5192 21.8951 24.2648 22.0005 23.9996 22.0005C23.7344 22.0005 23.48 21.8951 23.2925 21.7076C23.1049 21.5201 22.9996 21.2657 22.9996 21.0005V10.4142L8.70708 24.708C8.51944 24.8956 8.26494 25.001 7.99958 25.001C7.73422 25.001 7.47972 24.8956 7.29208 24.708C7.10444 24.5203 6.99902 24.2659 6.99902 24.0005C6.99902 23.7351 7.10444 23.4806 7.29208 23.293L21.5858 9.00049H10.9996C10.7344 9.00049 10.48 8.89513 10.2925 8.70759C10.1049 8.52006 9.99958 8.2657 9.99958 8.00049C9.99958 7.73527 10.1049 7.48092 10.2925 7.29338C10.48 7.10585 10.7344 7.00049 10.9996 7.00049H23.9996C24.2648 7.00049 24.5192 7.10585 24.7067 7.29338C24.8942 7.48092 24.9996 7.73527 24.9996 8.00049Z" fill="currentColor" />
                        </svg>} />
                    </div>

                    <div className="ph-table" id="ph-recent-activity">
                        <div className="ph-head">
                            <span>Order ID</span>
                            <span>Customer</span>
                            <span>Type</span>
                            <span>Status</span>
                            <span>Total</span>
                            <span>When</span>
                        </div>

                        {recentActivity.length > 0 ? (
                            formatRecentActivity(recentActivity).map((activity) => (
                                <div className="ph-row" key={activity.id}>
                                    <span className="mono">{activity.id}</span>
                                    <span>{activity.customer}</span>
                                    <span>{activity.type}</span>
                                    <span className={`status ${getStatusClass(activity.status)}`}>{activity.status}</span>
                                    <span>{activity.total}</span>
                                    <span className="muted">{activity.time}</span>
                                </div>
                            ))
                        ) : (
                            <div className="ph-row" style={{ textAlign: 'center', padding: '20px' }}>
                                <span style={{ gridColumn: '1 / -1', color: '#6b7280' }}>
                                    No recent activity
                                </span>
                            </div>
                        )}
                    </div>
                    {/* 
                    <div className="panel__footer">
                        <Button variant="tertiary" className="linklike" text="View all" iconRight={<svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M24.9996 8.00049V21.0005C24.9996 21.2657 24.8942 21.5201 24.7067 21.7076C24.5192 21.8951 24.2648 22.0005 23.9996 22.0005C23.7344 22.0005 23.48 21.8951 23.2925 21.7076C23.1049 21.5201 22.9996 21.2657 22.9996 21.0005V10.4142L8.70708 24.708C8.51944 24.8956 8.26494 25.001 7.99958 25.001C7.73422 25.001 7.47972 24.8956 7.29208 24.708C7.10444 24.5203 6.99902 24.2659 6.99902 24.0005C6.99902 23.7351 7.10444 23.4806 7.29208 23.293L21.5858 9.00049H10.9996C10.7344 9.00049 10.48 8.89513 10.2925 8.70759C10.1049 8.52006 9.99958 8.2657 9.99958 8.00049C9.99958 7.73527 10.1049 7.48092 10.2925 7.29338C10.48 7.10585 10.7344 7.00049 10.9996 7.00049H23.9996C24.2648 7.00049 24.5192 7.10585 24.7067 7.29338C24.8942 7.48092 24.9996 7.73527 24.9996 8.00049Z" fill="currentColor" />
                        </svg>} />
                    </div> */}
                </section>
            </div>
        </div>
    );
}