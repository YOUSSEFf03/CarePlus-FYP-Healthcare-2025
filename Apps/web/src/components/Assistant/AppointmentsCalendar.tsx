import React from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import CustomText from "../../components/Text/CustomText";

export default function AppointmentsCalendar() {
    return (
        <div className="calendar-tab">
            <CustomText as="h3" variant="text-heading-H4">Appointments Calendar</CustomText>
            <div className="calendar-wrapper">
                <Calendar />
            </div>
        </div>
    );
}
