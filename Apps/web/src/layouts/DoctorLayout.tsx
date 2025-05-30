import React from "react";
import { Outlet } from "react-router-dom";

export default function DoctorLayout() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <header className="bg-white shadow p-4">
                <h1 className="text-xl font-bold">Doctor Dashboard</h1>
            </header>
            <main className="flex-1 p-4">
                <Outlet />
            </main>
        </div>
    );
}