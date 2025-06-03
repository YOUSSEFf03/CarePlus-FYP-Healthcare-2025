import React from "react";
import { Link } from 'react-router-dom';

export default function AssistantDashboard() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-4">Assistant Dashboard</h1>
            <p className="text-lg mb-8">Manage your doctors and appointments.</p>
            <Link
                to="/doctor/patients"
                className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
                View Doctors
            </Link>
        </div>
    );
}