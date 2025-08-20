import React from "react";
import { Link } from "react-router-dom";
import CustomText from "../../components/Text/CustomText";
import Button from "../../components/Button/Button";
import "../../styles/assistantDashboard.css";

export default function AssistantDashboard() {
    const hasInvitesOrDoctors = true; // you will dynamically fetch this later

    const stats = {
        totalDoctors: 4,
        totalWorkplaces: 2,
        pendingAppointments: 6,
        mostActiveDoctor: {
            name: "Dr. Amina Farhat",
            id: "123",
        },
        mostActiveWorkplace: {
            name: "Al Hayat Clinic",
            id: "456",
        },
        upcomingAppointments: [
            {
                id: "a1",
                patient: "John Doe",
                time: "Today at 2:00 PM",
                doctor: "Dr. Amina Farhat",
            },
            {
                id: "a2",
                patient: "Sarah Ali",
                time: "Tomorrow at 11:00 AM",
                doctor: "Dr. Khaled Jamal",
            },
        ],
    };

    if (!hasInvitesOrDoctors) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4">
                {/* Optional illustration */}
                <img
                    src="https://img.freepik.com/free-vector/hidden-person-concept-illustration_114360-8814.jpg?uid=R137855058&ga=GA1.1.132194846.1728578884&semt=ais_hybrid&w=740" // you can replace this path or use an icon
                    alt="Empty state"
                    width={240}
                    className="w-48 mb-6"
                />

                <CustomText variant="text-heading-H3" as="h3">
                    Nothing to manage yet
                </CustomText>

                <p className="text-gray-600 mb-6">
                    You’re not currently managing any doctors or workplaces.
                    Start by connecting with a doctor to assist them.
                </p>

                <Link to="/assistant/invite">
                    <Button variant="primary" text="Invite a Doctor"></Button>
                </Link>

                {/* Optional secondary action */}
                <Link to="/tutorial" className="mt-4 text-blue-600 hover:underline">
                    Learn how to get started
                </Link>
            </div>
        );
    }

    // When assistant has data, render the normal dashboard view:
    return (
        <div className="dashboard-container">
            <div className="dashboard-left">
                <div className="dashboard-header">
                    <CustomText variant="text-heading-H2" as="h2">Overview</CustomText>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-title">Doctors Managed</div>
                        <div className="stat-value">{stats.totalDoctors}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-title">Workplaces</div>
                        <div className="stat-value">{stats.totalWorkplaces}</div>
                    </div>
                </div>

                <div className="pending-appointments-div">
                    <div className="pending-appointments-content">
                        <div className="pending-appointments-header">
                            <div className="pending-appointments-header-content">
                                <CustomText variant="text-heading-H4" as="h4">Pending Appointments</CustomText>
                                <CustomText variant="text-body-md-r" as="p">You have {stats.pendingAppointments} appointments pending confirmation.</CustomText>
                            </div>
                            <Button variant="primary"
                                iconRight={<svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M27.7075 16.7081L18.7075 25.7081C18.5199 25.8957 18.2654 26.0011 18 26.0011C17.7346 26.0011 17.4801 25.8957 17.2925 25.7081C17.1049 25.5204 16.9994 25.2659 16.9994 25.0006C16.9994 24.7352 17.1049 24.4807 17.2925 24.2931L24.5863 17.0006H5C4.73478 17.0006 4.48043 16.8952 4.29289 16.7077C4.10536 16.5201 4 16.2658 4 16.0006C4 15.7353 4.10536 15.481 4.29289 15.2934C4.48043 15.1059 4.73478 15.0006 5 15.0006H24.5863L17.2925 7.70806C17.1049 7.52042 16.9994 7.26592 16.9994 7.00056C16.9994 6.73519 17.1049 6.4807 17.2925 6.29306C17.4801 6.10542 17.7346 6 18 6C18.2654 6 18.5199 6.10542 18.7075 6.29306L27.7075 15.2931C27.8005 15.3859 27.8742 15.4962 27.9246 15.6176C27.9749 15.739 28.0008 15.8691 28.0008 16.0006C28.0008 16.132 27.9749 16.2621 27.9246 16.3835C27.8742 16.5049 27.8005 16.6152 27.7075 16.7081Z" fill="currentColor" />
                                </svg>
                                }
                                text="View All"
                            />
                        </div>
                        <div className="pending-appointments-list">
                            {Array.from({ length: 5 }, (_, index) => (
                                <div key={index} className="pending-appointment-item">
                                    <CustomText variant="text-body-md-r" as="p">Appointment {index + 1}</CustomText>
                                    <CustomText variant="text-body-sm-r" as="p">Details about the appointment...</CustomText>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="quick-links mt-8">
                    <CustomText variant="text-heading-H4" as="h4">Quick Links</CustomText>
                    <div className="quick-links-buttons mt-4 flex flex-wrap gap-4">
                        <Link to={`/doctor/${stats.mostActiveDoctor.id}`}>
                            <Button variant="secondary" text={`View ${stats.mostActiveDoctor.name}`} />
                        </Link>
                        <Link to={`/workplace/${stats.mostActiveWorkplace.id}`}>
                            <Button variant="secondary" text={`Visit ${stats.mostActiveWorkplace.name}`} />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="dashboard-right">
                <CustomText variant="text-heading-H4" as="h4">Upcoming Appointments</CustomText>
                <ul className="mt-4 space-y-3">
                    {stats.upcomingAppointments.map(app => (
                        <li key={app.id} className="p-3 bg-white border rounded-md shadow-sm">
                            <div className="font-semibold">{app.patient}</div>
                            <div className="text-sm text-gray-600">{app.time}</div>
                            <div className="text-sm text-gray-500">with {app.doctor}</div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
