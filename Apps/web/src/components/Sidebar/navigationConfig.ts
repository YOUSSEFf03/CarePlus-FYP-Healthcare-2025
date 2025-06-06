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
    general: NavigationItem[];
} = {
    doctor: [
        { title: "Overview", icon: "Grid3X3", url: "/doctor" },
        { title: "Appointments", icon: "Calendar", url: "/doctor/appointments" },
        { title: "Patients", icon: "Users", url: "/doctor/patients" },
    ],
    general: [
        { title: "Logout", icon: "LogOut", url: "/logout" },
    ],
};