import React from "react";
import "../../styles/pharmacyDashboard.css";
import CustomText from "../../components/Text/CustomText";
import StatsCard from "../../components/StatsCard/StatsCard";
import Button from "../../components/Button/Button";
import { ReactComponent as BuildingOffice } from "../../assets/svgs/BuildingOffice.svg";
import { ReactComponent as RevenueIcon } from "../../assets/svgs/CurrencyCircleDollar.svg";
import { ReactComponent as PrescriptionIcon } from '../../assets/svgs/Files.svg';

type Order = {
    id: string;
    customer: string;
    type: "Delivery" | "Pickup";
    total: string;
    status: "Pending" | "In Fulfillment" | "Ready" | "Completed";
    time: string;
};

const mockStats = [
    {
        title: "Sales (Today)",
        value: "$1,240",
        icon: RevenueIcon,
        change: 5.2,
        timeframe: "7d" as const,
    },
    {
        title: "Orders (Today)",
        value: 32,
        icon: PrescriptionIcon,
        change: 3.8,
        timeframe: "7d" as const,
    },
    {
        title: "Prescription Queue",
        value: 6,
        icon: BuildingOffice,
        change: -1.0,
        timeframe: "7d" as const,
    },
    {
        title: "Low‑Stock SKUs",
        value: 12,
        icon: BuildingOffice,
        change: 2.0,
        timeframe: "7d" as const,
        // bottomContent: (
        //     <span className="stat-inline-link">View list</span>
        // ),
    },
];

const mockOrders: Order[] = [
    { id: "ORD-4319", customer: "Samir K.", type: "Delivery", total: "$42.60", status: "Pending", time: "5m ago" },
    { id: "ORD-4318", customer: "Lina R.", type: "Pickup", total: "$18.30", status: "In Fulfillment", time: "12m ago" },
    { id: "ORD-4317", customer: "Ahmed N.", type: "Delivery", total: "$73.10", status: "Ready", time: "28m ago" },
    { id: "ORD-4316", customer: "Dana B.", type: "Pickup", total: "$25.40", status: "Completed", time: "1h ago" },
];

export default function PharmacyDashboard() {
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
                    />
                    <Button
                        text="Review prescriptions"
                        variant="secondary"
                        iconLeft={<BuildingOffice />}
                        className="btn-compact"
                    />
                </div>
            </div>

            {/* KPI stats */}
            <div className="overview__stats-grid">
                {mockStats.map((s) => (
                    <StatsCard
                        key={s.title}
                        title={s.title}
                        value={s.value}
                        icon={s.icon}
                        change={s.change}
                        timeframe={s.timeframe}
                    // bottomContent={s.bottomContent}
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
                        <div className="ph-row">
                            <span>Paracetamol 500mg</span>
                            <span>320</span>
                            <span>$1,280</span>
                        </div>
                        <div className="ph-row">
                            <span>Amoxicillin 250mg</span>
                            <span>190</span>
                            <span>$950</span>
                        </div>
                        <div className="ph-row">
                            <span>Vitamin C 1000mg</span>
                            <span>150</span>
                            <span>$600</span>
                        </div>
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

                        {mockOrders.map((o) => (
                            <div className="ph-row" key={o.id}>
                                <span className="mono">{o.id}</span>
                                <span>{o.customer}</span>
                                <span>{o.type}</span>
                                <span className={`status status--${o.status.replace(/\s/g, "").toLowerCase()}`}>{o.status}</span>
                                <span>{o.total}</span>
                                <span className="muted">{o.time}</span>
                            </div>
                        ))}
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