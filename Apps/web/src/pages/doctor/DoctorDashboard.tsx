import React, { useState } from "react";
import CustomText from "../../components/Text/CustomText";
import '../../styles/doctordashboard.css';
import { ReactComponent as PatientIcon } from "../../assets/svgs/Users.svg";
import { ReactComponent as AppointmentIcon } from "../../assets/svgs/CalendarBlank.svg";
import { ReactComponent as RevenueIcon } from "../../assets/svgs/CurrencyCircleDollar.svg";
import { ReactComponent as RatingIcon } from "../../assets/svgs/Star.svg";
import Button from "../../components/Button/Button";
// import {
//     Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
// } from 'recharts';
import { ResponsivePie } from '@nivo/pie';

const appointmentData = [
    { id: 'Monday', label: 'Mon', value: 0.5, color: '#7bbbff' },
    { id: 'Tuesday', label: 'Tue', value: 0.45, color: '#b8a9ff' },
    { id: 'Wednesday', label: 'Wed', value: 0.25, color: '#FF9640' },
    { id: 'Thursday', label: 'Thu', value: 0.6, color: '#10b981' },
    { id: 'Friday', label: 'Fri', value: 0.9, color: '#F58078' },
    { id: 'Saturday', label: 'Sat', value: 1.0, color: '#FDDC96' },
    { id: 'Sunday', label: 'Sun', value: 0.0, color: '#a7d1ff' },
];

const top3Days = [...appointmentData]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map(d => d.label);

const AppointmentDistributionChart = ({ appointmentData }: { appointmentData: { id: string, label: string, value: number, color: string }[] }) => (
    <div style={{ height: 350 }}>
        <ResponsivePie
            data={appointmentData}
            colors={{ datum: 'data.color' }}
            margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            borderWidth={1}
            borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#333333"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: 'color' }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
            valueFormat={(v) => `${(v * 100).toFixed(0)}%`}
            legends={[
                {
                    anchor: 'left',
                    direction: 'column',
                    justify: false,
                    translateX: -60,
                    translateY: 0,
                    itemsSpacing: 8,
                    itemWidth: 100,
                    itemHeight: 20,
                    itemTextColor: '#999',
                    itemDirection: 'left-to-right',
                    itemOpacity: 1,
                    symbolSize: 18,
                    symbolShape: 'circle',
                    effects: [
                        {
                            on: 'hover',
                            style: {
                                itemTextColor: '#000',
                            },
                        },
                    ],
                },
            ]}
        />
    </div>
);

export default function DoctorDashboard() {
    const [timeframe, setTimeframe] = useState("7d");
    const [selectedDate, setSelectedDate] = useState(new Date());

    const statsData = [
        {
            id: 1,
            title: "Total Patients",
            value: 124,
            change: 8,
            Icon: PatientIcon
        },
        {
            id: 2,
            title: "Appointments",
            value: 76,
            change: -3,
            Icon: AppointmentIcon
        },
        {
            id: 3,
            title: "Revenue",
            value: "$12.4K",
            change: -350,
            Icon: RevenueIcon
        },
        {
            id: 4,
            title: "Rating",
            // value: "4.6 / 5",
            value: "★ 4.6 / 5",
            change: 0.2,
            Icon: RatingIcon
        }
    ];

    const dayPopularity = [
        { day: 'Monday', score: 0.7 },
        { day: 'Tuesday', score: 0.5 },
        { day: 'Wednesday', score: 0.8 },
        { day: 'Thursday', score: 0.6 },
        { day: 'Friday', score: 0.9 },
        { day: 'Saturday', score: 0.3 },
        { day: 'Sunday', score: 0.2 },
    ];

    return (
        <div className="dashboard-container">
            <div className="dashboard-left">
                <div className="dashboard-header">
                    <CustomText variant="text-heading-H2" as="h2">Overview</CustomText>
                    <div className="dashboard-controls">
                        <select
                            value={timeframe}
                            onChange={(e) => setTimeframe(e.target.value)}
                            className="timeframe-select"
                        >
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                        </select>
                        <Button text="Overall Statistics" variant="primary" iconLeft={
                            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.5002 14.5541C12.6522 14.4663 12.7785 14.3401 12.8663 14.188C12.954 14.0359 13.0002 13.8634 13.0002 13.6879V4.68787C12.9993 4.52843 12.9603 4.37153 12.8864 4.23023C12.8126 4.08893 12.706 3.96735 12.5756 3.8756C12.4452 3.78386 12.2948 3.72463 12.1368 3.70284C11.9789 3.68106 11.818 3.69735 11.6677 3.75037C8.74891 4.78338 6.29433 6.82367 4.7452 9.50445C3.19608 12.1852 2.65401 15.3307 3.21643 18.3754C3.24559 18.5328 3.31212 18.681 3.41044 18.8073C3.50876 18.9337 3.63599 19.0346 3.78143 19.1016C3.9125 19.1629 4.05549 19.1945 4.20018 19.1941C4.3757 19.1942 4.54814 19.1481 4.70018 19.0604L12.5002 14.5541ZM11.0002 6.20287V13.1104L5.01518 16.5641C5.00018 16.3754 5.00018 16.1854 5.00018 16.0004C5.00196 13.9733 5.56305 11.9861 6.62168 10.2574C7.6803 8.52877 9.19541 7.12576 11.0002 6.20287ZM16.0002 3.00037C15.735 3.00037 15.4806 3.10572 15.2931 3.29326C15.1055 3.4808 15.0002 3.73515 15.0002 4.00037V15.4779L5.14893 21.2166C5.03462 21.2829 4.93457 21.3712 4.85457 21.4763C4.77456 21.5815 4.7162 21.7015 4.68284 21.8293C4.64948 21.9572 4.64179 22.0904 4.66022 22.2212C4.67864 22.3521 4.72281 22.4779 4.79018 22.5916C5.94482 24.5545 7.59482 26.1796 9.575 27.3043C11.5552 28.429 13.7961 29.0138 16.0733 29.0001C18.3506 28.9865 20.5843 28.3748 22.5508 27.2265C24.5174 26.0781 26.1478 24.4333 27.2788 22.4567C28.4098 20.4801 29.0017 18.2411 28.9953 15.9638C28.9889 13.6865 28.3844 11.4509 27.2423 9.48066C26.1002 7.51046 24.4606 5.87485 22.4876 4.73756C20.5146 3.60027 18.2775 3.00122 16.0002 3.00037ZM16.0002 27.0004C14.2545 26.9957 12.5347 26.5778 10.9815 25.7809C9.42832 24.984 8.08585 23.8307 7.06393 22.4154L16.5039 16.9154C16.6558 16.8277 16.7819 16.7016 16.8697 16.5498C16.9575 16.398 17.0038 16.2257 17.0039 16.0504V5.04537C19.8245 5.30127 22.4376 6.63517 24.2993 8.76937C26.161 10.9036 27.1279 13.6736 26.9985 16.5028C26.8692 19.3319 25.6536 22.0022 23.6049 23.9576C21.5562 25.913 18.8323 27.0029 16.0002 27.0004Z" fill="currentColor" />
                            </svg>
                        } />
                    </div>
                </div>

                <div className="stats-grid">
                    {statsData.map(({ id, title, value, change, Icon }) => (
                        <div key={id} className="stat-card">
                            <div className="stat-card-header">
                                <span className="stat-title">{title}</span>
                                <Icon className="stat-icon" />
                            </div>
                            <div className="stat-value">{value}</div>
                            <div className={`stat-change ${change >= 0 ? 'up' : 'down'}`}>
                                {change >= 0 ? '▲' : '▼'} {Math.abs(change)} from last {timeframe === "7d" ? "week" : "month"}
                            </div>
                        </div>
                    ))}
                </div>

                {/* <div className="day-popularity-chart">
                    <div className="chart-header">
                        <CustomText variant="text-heading-H3" as="h3">Most Active Appointment Days</CustomText>
                        <span className="chart-subtitle">Based on overall history</span>
                    </div>
                    <div className="day-bars">
                        {dayPopularity.map(({ day, score }) => (
                            <div key={day} className="day-bar-row">
                                <span className="day-label">{day}</span>
                                <div className="bar-track">
                                    <div
                                        className="bar-fill"
                                        style={{ width: `${score * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div> */}

                <div className="pie-chart-section">
                    <div className="chart-header">
                        <CustomText variant="text-heading-H4" as="h4">Most Popular Appointment Days</CustomText>
                        <CustomText className="chart-subtitle" variant="text-body-sm-r" as="p">Percentage of filled appointment slots per weekday across all time.</CustomText>
                    </div>
                    <AppointmentDistributionChart appointmentData={appointmentData} />
                    <div className="chart-conclusion">
                        <CustomText variant="text-body-md-r" as="p">
                            Based on the data, <strong>{top3Days.join(', ')}</strong> are the most popular days patients tend to book appointments.
                        </CustomText>
                    </div>
                </div>
            </div>

            <div className="dashboard-right">
                
            </div>
        </div>
    );
}