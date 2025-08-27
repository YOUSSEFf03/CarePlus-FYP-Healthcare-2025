import { NavigationItem } from "../../components/Sidebar/Sidebar";

export type SidebarItem = {
    title: string;
    icon: string;
    url: string;
};

// export const sidebarConfig: Record<string, SidebarItem[]> = {
//     doctor: [
//         { title: "Overview", icon: "Grid3X3", url: "/doctor" },
//         { title: "Patients", icon: "Users", url: "/doctor/patients" },
//         // ...more doctor items
//     ],
//     assistant: [
//         { title: "Overview", icon: "Grid3X3", url: "/assistant" },
//         { title: "Support", icon: "MessageSquare", url: "/assistant/support" },
//         // ...more assistant items
//     ],
//     pharmacy: [
//         { title: "Dashboard", icon: "Grid3X3", url: "/pharmacy" },
//         { title: "Inventory", icon: "FileText", url: "/pharmacy/inventory" },
//         // ...more pharmacy items
//     ],
// };

export const sidebarConfig: {
    doctor: NavigationItem[];
    assistant: NavigationItem[];
    // pharmacy: NavigationItem[];
    general: NavigationItem[];
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
        { title: "Overview", icon: "Grid3X3", url: "/doctor" },
        { title: "Appointments", icon: "Calendar", url: "/doctor/appointments" },
        { title: "Doctors", icon: "Users", url: "/doctor/patients" },
        { title: "Workplaces", icon: "Users", url: "/doctor/patients" },
    ],
<<<<<<< HEAD
    pharmacy: [
        { title: "Overview", icon: "Grid3X3", url: "/pharmacy" },
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
=======
    general: [
        { title: "Help", icon: "HelpCircle", url: "/logout" },
        { title: "Settings", icon: "Settings", url: "/logout" },
        { title: "Tutorial", icon: "BookOpen", url: "/logout" },
    ],
};
>>>>>>> parent of 94b044c (Merge branch 'master' of https://dev.azure.com/FYP-Healthcare-2025/FYP%20Healthcare%202025/_git/FYP%20Healthcare%202025)
