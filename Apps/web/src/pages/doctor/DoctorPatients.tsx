import React from "react";
import { Link } from 'react-router-dom';

export default function DoctorPatients() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-4">Doctor Patients</h1>
            <p className="text-lg mb-8">Manage your patients and their records.</p>
            <Link
                to="/doctor/patients/add"
                className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
                Add New Patient
            </Link>
        </div>
    );
}