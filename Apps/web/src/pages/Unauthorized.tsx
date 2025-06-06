import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Unauthorized() {
    const { isAuthenticated, user } = useAuth();

    const redirectPath = isAuthenticated && user ? `/${user.role}` : '/login';

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="bg-white shadow-md rounded-lg p-8 text-center max-w-md">
                <div className="text-red-500 text-6xl mb-4">🚫</div>
                <h1 className="text-3xl font-bold mb-2">403 - Unauthorized</h1>
                <p className="text-gray-600 mb-6">
                    Sorry, you don’t have permission to access this page.
                </p>
                <Link
                    to={redirectPath}
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded transition"
                >
                    {isAuthenticated ? 'Go to Dashboard' : 'Return to Login'}
                </Link>
            </div>
        </div>
    );
}