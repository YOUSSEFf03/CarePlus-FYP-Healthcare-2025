export type AppointmentStatus = "scheduled" | "pending" | "completed";

export type Appointment = {
    id: string;
    patientName: string;
    workplace: string;
    start: Date;
    end: Date;
    date: string; // for display
    status: AppointmentStatus;
};

export const appointments: Appointment[] = [
    {
        id: "A001",
        patientName: "Dianne Russell",
        workplace: "Downtown Clinic",
        start: new Date(2025, 5, 12, 8, 0),
        end: new Date(2025, 5, 12, 9, 0),
        date: "June 12, 2025",
        status: "scheduled",
    },
    {
        id: "A002",
        patientName: "Dianne Russell",
        workplace: "Downtown Clinic",
        start: new Date(2025, 5, 13, 8, 0),
        end: new Date(2025, 5, 13, 9, 0),
        date: "June 13, 2025",
        status: "scheduled",
    },
    {
        id: "A003",
        patientName: "Ralph Edwards",
        workplace: "City Hospital",
        start: new Date(2025, 5, 13, 10, 0),
        end: new Date(2025, 5, 13, 10, 30),
        date: "June 13, 2025",
        status: "pending",
    },
    {
        id: "A004",
        patientName: "Jacob Jones",
        workplace: "Westside Health Center",
        start: new Date(2025, 5, 10, 7, 30),
        end: new Date(2025, 5, 10, 8, 0),
        date: "June 10, 2025",
        status: "completed",
    },
    {
        id: "A005",
        patientName: "Jacob Jones",
        workplace: "Westside Health Center",
        start: new Date(2025, 5, 14, 7, 30),
        end: new Date(2025, 5, 14, 8, 0),
        date: "June 14, 2025",
        status: "pending",
    },
    {
        id: "A006",
        patientName: "Jacob Jones",
        workplace: "Westside Health Center",
        start: new Date(2025, 5, 11, 11, 30),
        end: new Date(2025, 5, 11, 12, 0),
        date: "June 11, 2025",
        status: "pending",
    },
    {
        id: "A007",
        patientName: "Jacob Jones",
        workplace: "Westside Health Center",
        start: new Date(2025, 5, 11, 10, 30),
        end: new Date(2025, 5, 11, 11, 0),
        date: "June 11, 2025",
        status: "pending",
    },
];