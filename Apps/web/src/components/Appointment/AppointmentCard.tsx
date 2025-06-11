import React from "react";
import CustomText from "../Text/CustomText";
import "./appointmentCard.css";

interface AppointmentCardProps {
    title: string;
    time: string;
    location: string;
    status: "scheduled" | "pending" | "done";
    patientName: string;
    avatarUrl?: string;
}

export default function AppointmentCard({
    title,
    time,
    location,
    status,
    patientName,
    avatarUrl,
}: AppointmentCardProps) {
    const statusStyles = {
        scheduled: {
            bg: "var(--tertiary-10)",
            border: "var(--tertiary-60)",
            textColor: "var(--tertiary-60)",
        },
        pending: {
            bg: "var(--warning-10)",
            border: "var(--warning-color)",
            textColor: "var(--warning-color)",
        },
        done: {
            bg: "var(--success-10)",
            border: "var(--success-color)",
            textColor: "var(--success-color)",
        },
    }[status];

    return (
        <div
            className="appointment-card"
            style={{ backgroundColor: statusStyles.bg }}
        >
            <div
                className="appointment-card-body"
                style={{ borderLeft: `2px solid ${statusStyles.border}` }}
            >
                <div className="appointment-card-header">
                    <CustomText variant="text-body-sm-sb" as="p" className="appointment-card-title">
                        {title}
                    </CustomText>
                    <CustomText variant="text-body-xs-r" as="p" className="appointment-card-time">
                        {time}
                    </CustomText>
                    <CustomText variant="text-body-xs-r" as="p" className="appointment-card-location">
                        {location}
                    </CustomText>
                </div>
                <div
                    className="appointment-card-status"
                    style={{ borderColor: statusStyles.border }}
                >
                    <svg width="5" height="5" viewBox="0 0 4 3" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M3.5 1.50049C3.5 1.79716 3.41203 2.08717 3.2472 2.33384C3.08238 2.58052 2.84811 2.77278 2.57402 2.88631C2.29994 2.99984 1.99834 3.02954 1.70736 2.97167C1.41639 2.91379 1.14912 2.77093 0.93934 2.56115C0.729562 2.35137 0.586701 2.08409 0.528823 1.79312C0.470945 1.50215 0.50065 1.20055 0.614181 0.926464C0.727713 0.652375 0.919972 0.418107 1.16665 0.253284C1.41332 0.0884623 1.70333 0.000488281 2 0.000488281C2.39783 0.000488281 2.77936 0.158524 3.06066 0.439829C3.34196 0.721133 3.5 1.10266 3.5 1.50049Z"
                            fill={statusStyles.textColor}
                        />
                    </svg>
                    <CustomText
                        variant="text-body-xs-r"
                        as="p"
                        className="appointment-card-status-text"
                        // style={{ color: statusStyles.textColor }}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </CustomText>
                </div>
            </div>
            <div className="appointment-card-footer">
                <div
                    className="appointment-card-avatar"
                    style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        backgroundImage: `url(${avatarUrl || "/default-avatar.png"})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                />
                <CustomText variant="text-body-sm-r" as="p" className="appointment-card-patient">
                    {patientName}
                </CustomText>
            </div>
        </div>
    );
}