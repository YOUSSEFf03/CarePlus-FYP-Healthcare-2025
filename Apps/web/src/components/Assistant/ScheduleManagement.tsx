import React from "react";
import CustomText from "../../components/Text/CustomText";
import "./scheduleManagement.css";

const scheduleMock = {
    Monday: [
        { time: "09:00", taken: false },
        { time: "10:00", taken: true },
        { time: "11:00", taken: false },
        { time: "12:00", taken: true },
    ],
    Tuesday: [
        { time: "10:00", taken: false },
        { time: "11:00", taken: false },
        { time: "12:00", taken: true },
    ],
    Wednesday: [],
    Thursday: [
        { time: "09:00", taken: false },
        { time: "10:00", taken: true },
        { time: "11:00", taken: false },
    ],
    Friday: [
        { time: "10:00", taken: true },
        { time: "11:00", taken: false },
        { time: "12:00", taken: false },
        { time: "13:00", taken: true },
    ],
};

export default function ScheduleManagement() {
    return (
        <div className="schedule-tab">
            <CustomText as="h3" variant="text-heading-H4">Workplace Weekly Schedule</CustomText>
            <div className="schedule-grid">
                {Object.entries(scheduleMock).map(([day, slots]) => (
                    <div key={day} className="day-card">
                        <div className="day-header">{day}</div>
                        {slots.length > 0 ? (
                            <div className="slots-container">
                                {slots.map((slot, idx) => (
                                    <div
                                        key={idx}
                                        className={`slot-box ${slot.taken ? "taken" : "available"}`}
                                    >
                                        {slot.time}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-slots">No slots available</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
