import React from 'react';
import { Activity } from 'lucide-react';

export default function Header() {
    return (
        <header className="bg-white backdrop-blur-md border-b border-gray-200 shadow-sm">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <img src="/logo512_primary.svg" alt="CarePlus Logo" className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">CarePlusAI</h1>
                            <p className="text-sm text-gray-600">Breast Cancer Detection</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                        <Activity className="w-4 h-4" />
                        <span className="text-sm">AI-Powered Analysis</span>
                    </div>
                </div>
            </div>
        </header>
    );
}


