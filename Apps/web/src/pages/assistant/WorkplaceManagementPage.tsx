// WorkplaceManagementPage.tsx
import React, { useState } from "react";
import CustomText from "../../components/Text/CustomText";
import Button from "../../components/Button/Button";
import WorkplaceOverview from "../../components/Assistant/WorkplaceOverview";
import ScheduleManagement from "../../components/Assistant/ScheduleManagement";
import AppointmentsCalendar from "../../components/Assistant/AppointmentsCalendar";
import AllAppointmentsList from "../../components/Assistant/AllAppointmentsList";
import "../../styles/assistantWorkplaces.css";

const tabs = [
    { key: "Overview", label: "Overview" },
    { key: "Schedule", label: "Schedule" },
    { key: "Calendar", label: "Calendar" },
    { key: "AllAppointments", label: "All Appointments" },
];

export default function WorkplaceManagementPage() {
    const [activeTab, setActiveTab] = useState("Overview");

    const renderTabContent = () => {
        switch (activeTab) {
            case "Overview":
                return <WorkplaceOverview />;
            case "Schedule":
                return <ScheduleManagement />;
            case "Calendar":
                return <AppointmentsCalendar />;
            case "AllAppointments":
                return <AllAppointmentsList />;
            default:
                return null;
        }
    };

    return (
        <div className="appointments-container">
            <CustomText variant="text-heading-H2" as="h2" className="appointments-header">
                Workplace Management
            </CustomText>

            <div className="appointments-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        className={`appointments-tab ${activeTab === tab.key ? "active" : ""}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="appointments-tab-content fade-in">
                {renderTabContent()}
            </div>
        </div>
    );
}
