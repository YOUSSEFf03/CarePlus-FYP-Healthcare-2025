import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import "../../styles/doctorWorkplaces.css";
import CustomText from "../../components/Text/CustomText";
import WorkplaceCard from "../../components/Workplace/WorkplaceCard";
import Button from "../../components/Button/Button";

const API_BASE = "http://localhost:3000";

interface Workplace {
    id: string;
    workplace_name: string;
    workplace_type: 'clinic' | 'hospital' | 'private_practice' | 'online' | 'home_visits';
    phone_number?: string;
    email?: string;
    description?: string;
    website?: string;
    working_hours?: any;
    consultation_fee?: number;
    services_offered?: string[];
    insurance_accepted?: string[];
    is_primary: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    addresses?: Array<{
        id: string;
        building_name?: string;
        building_number?: string;
        floor_number?: string;
        street: string;
        city: string;
        state: string;
        country: string;
        zipcode?: string;
        area_description?: string;
        maps_link?: string;
    }>;
}

// Helper function to decode JWT token
const decodeJWT = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
};

// API function to fetch workplaces
const fetchWorkplaces = async (): Promise<Workplace[]> => {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);
    console.log('Token length:', token?.length);
    console.log('Token type:', typeof token);
    
    if (!token) throw new Error('No authentication token found');
    
    // Decode token to check its content
    try {
        const decoded = decodeJWT(token);
        console.log('Decoded token for workplaces:', decoded);
        
        // Check if token is expired
        if (decoded.exp && decoded.exp < Date.now() / 1000) {
            console.error('Token is expired');
            throw new Error('Token has expired. Please log in again.');
        }
        
        // Check if user role is correct
        if (decoded.role !== 'doctor') {
            console.error('User role is not doctor:', decoded.role);
            throw new Error('Access denied. Doctor role required.');
        }
        
    } catch (err) {
        console.error('Error decoding token:', err);
        throw new Error('Invalid token. Please log in again.');
    }
    
    try {
        console.log('Making request to:', `${API_BASE}/doctors/workplaces`);
        console.log('Authorization header:', `Bearer ${token}`);
        
        // First, test if the backend is accessible
        try {
            const healthCheck = await axios.get(`${API_BASE}/health`, { timeout: 5000 });
            console.log('Backend health check:', healthCheck.data);
        } catch (healthError: any) {
            console.warn('Backend health check failed:', healthError.message);
        }
        
        // Test simple endpoint (no auth required)
        try {
            const simpleTest = await axios.get(`${API_BASE}/doctors/test-simple`, {
                timeout: 5000
            });
            console.log('Simple test response:', simpleTest.data);
        } catch (simpleError: any) {
            console.warn('Simple test failed:', simpleError.message);
        }

        
        // Try the workplaces endpoint
        const response = await axios.get(`${API_BASE}/doctors/workplaces`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 second timeout
        });
        
        console.log('Workplaces API response:', response.data);
        return response.data.data || response.data || [];
    } catch (error: any) {
        console.error('Failed to fetch workplaces:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        console.error('Error headers:', error.response?.headers);
        
        // If it's a 401, provide more specific error message
        if (error.response?.status === 401) {
            const errorMessage = error.response?.data?.message || 'Authentication failed';
            if (errorMessage.includes('not verified')) {
                throw new Error('Your account is not verified. Please check your email and verify your account.');
            } else if (errorMessage.includes('Invalid token')) {
                throw new Error('Invalid or expired token. Please log in again.');
            } else {
                throw new Error('Authentication failed. Please log in again.');
            }
        }
        
        throw error;
    }
};

export default function DoctorWorkplaces() {
    const navigate = useNavigate();
    const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch workplaces data
    const fetchWorkplacesData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Check if user is authenticated first
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found. Please log in again.');
                return;
            }
            
            const data = await fetchWorkplaces();
            setWorkplaces(data);
        } catch (err: any) {
            console.error('Failed to fetch workplaces:', err);
            
        // Handle specific error cases
        if (err.response?.status === 401) {
            setError('Authentication failed. Please log in again.');
            // Optionally redirect to login
            // navigate('/login');
        } else if (err.response?.status === 403) {
            setError('Access denied. You do not have permission to view workplaces.');
        } else {
            setError(err.response?.data?.message || 'Failed to fetch workplaces');
        }
        
        // Temporary fallback - show mock data for testing
        console.log('Using mock data due to backend unavailability');
        setWorkplaces([
            {
                id: "mock-1",
                workplace_name: "Downtown Clinic",
                workplace_type: "clinic",
                phone_number: "+1-555-0123",
                email: "downtown@clinic.com",
                description: "A modern medical facility in the heart of downtown",
                website: "https://downtownclinic.com",
                consultation_fee: 150,
                is_primary: true,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                addresses: [{
                    id: "addr-1",
                    street: "123 Main Street",
                    city: "Springfield",
                    state: "IL",
                    country: "USA",
                    zipcode: "62701"
                }],
                working_hours: {
                    monday: { start: "09:00", end: "17:00" },
                    tuesday: { start: "09:00", end: "17:00" },
                    wednesday: { start: "09:00", end: "17:00" },
                    thursday: { start: "09:00", end: "17:00" },
                    friday: { start: "09:00", end: "17:00" },
                    saturday: { start: "09:00", end: "13:00" },
                    sunday: { start: "09:00", end: "13:00" }
                }
            },
            {
                id: "mock-2",
                workplace_name: "Westside Medical Center",
                workplace_type: "hospital",
                phone_number: "+1-555-0456",
                email: "westside@medical.com",
                description: "Full-service hospital with emergency care",
                website: "https://westsidemedical.com",
                consultation_fee: 200,
                is_primary: false,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                addresses: [{
                    id: "addr-2",
                    street: "456 Elm Street",
                    city: "Riverside",
                    state: "CA",
                    country: "USA",
                    zipcode: "92507"
                }],
                working_hours: {
                    monday: { start: "08:00", end: "18:00" },
                    tuesday: { start: "08:00", end: "18:00" },
                    wednesday: { start: "08:00", end: "18:00" },
                    thursday: { start: "08:00", end: "18:00" },
                    friday: { start: "08:00", end: "18:00" },
                    saturday: { start: "09:00", end: "15:00" },
                    sunday: { start: "09:00", end: "15:00" }
                }
            }
        ]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch data on mount
    useEffect(() => {
        fetchWorkplacesData();
    }, [fetchWorkplacesData]);

    const slugify = (name: string) =>
        name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    // Transform workplace data for WorkplaceCard component
    const transformWorkplaceForCard = (workplace: Workplace) => {
        // Handle both array and single object address structures
        const address = Array.isArray(workplace.addresses) ? workplace.addresses[0] : workplace.addresses;
        const location = address ? 
            `${address.street}, ${address.city}` : 
            (workplace.workplace_type === 'online' ? 'Online' : 'No address');
        
        const workingHours = workplace.working_hours ? 
            Object.values(workplace.working_hours).find((day: any) => day && day.start && day.end) as any : 
            null;
        
        const timeDisplay = workingHours ? 
            `${workingHours.start} - ${workingHours.end}` : 
            'Hours not set';

        return {
            id: workplace.id,
            name: workplace.workplace_name,
            location,
            time: timeDisplay,
            image: getWorkplaceImage(workplace.workplace_type),
            type: workplace.workplace_type.charAt(0).toUpperCase() + workplace.workplace_type.slice(1),
            is_primary: workplace.is_primary,
            appointment_price: workplace.consultation_fee || 0,
        };
    };

    // Get appropriate image based on workplace type
    const getWorkplaceImage = (type: string) => {
        const images = {
            clinic: "https://img.freepik.com/premium-photo/white-doctors-gown-stethoscope-hanging-rack-clinic_1339860-4144.jpg",
            hospital: "https://img.freepik.com/premium-photo/clinic-cc-0000000000000450png_190619-6450.jpg",
            private_practice: "https://img.freepik.com/free-photo/empty-modern-medical-office-having-disease-documents-table-equipped-with-contemporary-furniture-hospital-workplace-with-nobody-it-ready-sickness-consultation-medicine-support_482257-35871.jpg",
            medical_center: "https://img.freepik.com/free-photo/medical-center-building-modern-architecture_1150-10148.jpg",
            home_visits: "https://img.freepik.com/free-photo/doctor-visiting-patient-home_23-2149060001.jpg"
        };
        return images[type as keyof typeof images] || images.clinic;
    };

    if (loading) {
        return (
            <div className="workplaces-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading workplaces...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="workplaces-header">
                <CustomText variant="text-heading-H2" as={'h2'}>Your Workplaces</CustomText>
                <Button
                    variant="primary"
                    onClick={() => navigate('/doctor/workplaces/add')}
                    text="Add Workplace"
                    iconLeft={
                        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7.757v8.486M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    }
                ></Button>
            </div>

            {error && (
                <div className="error-banner">
                    <p>{error}</p>
                    <Button variant="tertiary" text="Retry" onClick={fetchWorkplacesData} />
                </div>
            )}

            <div className="workplaces-list">
                {workplaces.length === 0 ? (
                    <div className="workplaces-empty">
                        <p>No workplaces found. Add your first workplace to get started!</p>
                    </div>
                ) : (
                    workplaces.map((workplace) => (
                        <WorkplaceCard
                            key={workplace.id}
                            workplace={transformWorkplaceForCard(workplace)}
                            onClick={() => navigate(`/doctor/workplaces/${workplace.id}`, {
                                state: { workplace }
                            })}
                        />
                    ))
                )}
            </div>
        </div>
    );
}