import React from "react";
import CustomText from "../../components/Text/CustomText";
import Button from "../../components/Button/Button";

const appointments = [
    { id: 1, status: "pending", patient: "Ali Khan", time: "10:00 AM" },
    { id: 2, status: "scheduled", patient: "Zara Ahmed", time: "11:00 AM" },
    { id: 3, status: "completed", patient: "Tariq Mehmood", time: "12:00 PM" },
];

export default function AllAppointmentsList() {
    return (
        <div className="appointments-tab">
            <CustomText as="h3" variant="text-heading-H4">All Appointments</CustomText>
            <div className="appointment-list">
                {appointments.map((appt) => (
                    <div key={appt.id} className="appointment-card">
                        <p><strong>Patient:</strong> {appt.patient}</p>
                        <p><strong>Time:</strong> {appt.time}</p>
                        <p><strong>Status:</strong> {appt.status}</p>
                        <div className="appointment-actions">
                            {appt.status === "pending" && (
                                <>
                                    <Button>Accept</Button>
                                    <Button variant="secondary">Reject</Button>
                                </>
                            )}
                            {appt.status === "scheduled" && (
                                <Button variant="danger">Cancel</Button>
                            )}
                            {appt.status === "completed" && (
                                <span className="no-action">No Action</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}