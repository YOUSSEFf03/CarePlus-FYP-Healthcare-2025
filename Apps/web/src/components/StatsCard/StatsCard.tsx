import React from "react";
import "./statscard.css"

interface StatsCardProps {
    title: string;
    value: number | string;
    icon: React.ElementType;
    change?: number;
    timeframe?: string;
    bottomContent?: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    icon: Icon,
    change,
    timeframe = "7d",
    bottomContent,
}) => {
    return (
        <div className="stat-card">
            <div className="stat-card-header">
                <div className="stat-title">{title}</div>
                <div className="stat-icon">
                    <Icon className="stat-icon-style" />
                </div>
            </div>
            <div className="stat-value">{value}</div>
            {change !== undefined && (
                <div className={`stat-change ${change >= 0 ? "up" : "down"}`}>
                    {change >= 0 ? "▲" : "▼"} {Math.abs(change)} from last{" "}
                    {timeframe === "7d" ? "week" : "month"}
                </div>
            )}
            {bottomContent && (
                <div className="stat-bottom">
                    {bottomContent}
                </div>
            )}
        </div>
    );
};

export default StatsCard;