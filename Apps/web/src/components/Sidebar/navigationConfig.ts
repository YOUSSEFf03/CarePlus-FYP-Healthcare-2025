import { NavigationItem } from "../../components/Sidebar/Sidebar";

export type SidebarItem = {
    title: string;
    icon: string;
    url: string;
};

export const sidebarConfig: {
    doctor: NavigationItem[];
    assistant: NavigationItem[];
    pharmacy: NavigationItem[];
} = {
    doctor: [
        { title: "Overview", icon: "Grid3X3", url: "/doctor/dashboard" },
        { title: "Appointments", icon: "FileText", url: "/doctor/appointments" },
        { title: "Calendar", icon: "Calendar", url: "/doctor/calendar" },
        { title: "Patients", icon: "Users", url: "/doctor/patients" },
        { title: "Workplaces", icon: "Workplaces", url: "/doctor/workplaces" },
        { title: "Assistants", icon: "AssistantsIcon", url: "/doctor/assistants" },
    ],
    assistant: [
        { title: "Overview", icon: "Grid3X3", url: "/assistant/dashboard" },
        { title: "Doctors", icon: "Doctor", url: "/assistant/doctors" },
        { title: "Workplaces", icon: "Workplaces", url: "/assistant/workplaces" },
        { title: "Invites", icon: "Inivitations", url: "/assistant/workplaces/appointments" },
    ],
    pharmacy: [
        { title: "Overview", icon: "Grid3X3", url: "/pharmacy/dashboard" },
        { title: "Orders", icon: "Cart", url: "/pharmacy/orders" },
        { title: "Reservations", icon: "Reservations", url: "/pharmacy/reservations" },
        { title: "Inventory", icon: "Inventory", url: "/pharmacy/inventory" },
        { title: "Prescriptions", icon: "FileText", url: "/pharmacy/prescriptions" },
        { title: "Customers", icon: "Users", url: "/pharmacy/customers" },
    ]
};

export const getGeneralItems = (role: 'doctor' | 'assistant' | 'pharmacy'): NavigationItem[] => [
    { title: "Help", icon: "HelpCircle", url: `/${role}/help` },
    { title: "Settings", icon: "Settings", url: `/${role}/settings` },
    { title: "Tutorial", icon: "BookOpen", url: `/${role}/tutorial` },
];