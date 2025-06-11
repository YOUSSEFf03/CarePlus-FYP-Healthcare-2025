import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/doctorWorkplaces.css";
import CustomText from "../../components/Text/CustomText";
import WorkplaceCard from "../../components/Workplace/WorkplaceCard";
import Button from "../../components/Button/Button";

const workplaces = [
    {
        id: "1",
        name: "Downtown Clinic",
        location: "123 Main St, Springfield",
        time: "8:00 AM - 6:00 PM",
        image: "https://img.freepik.com/premium-photo/white-doctors-gown-stethoscope-hanging-rack-clinic_1339860-4144.jpg",
        type: "Clinic",
        is_primary: true,
        appointment_price: 50,
    },
    {
        id: "2",
        name: "Westside Medical Center",
        location: "456 Elm St, Riverside",
        time: "9:00 AM - 5:00 PM",
        image: "https://img.freepik.com/premium-photo/clinic-cc-0000000000000450png_190619-6450.jpg?uid=R137855058&ga=GA1.1.132194846.1728578884&semt=ais_hybrid&w=740",
        type: "Hospital",
        is_primary: false,
        appointment_price: 70,
    },
    {
        id: "3",
        name: "Eastside Family Care",
        location: "789 Oak Ave, Hillside",
        time: "7:30 AM - 4:00 PM",
        image: "https://img.freepik.com/free-photo/empty-modern-medical-office-having-disease-documents-table-equipped-with-contemporary-furniture-hospital-workplace-with-nobody-it-ready-sickness-consultation-medicine-support_482257-35871.jpg?uid=R137855058&ga=GA1.1.132194846.1728578884&semt=ais_hybrid&w=740",
        type: "Clinic",
        is_primary: false,
        appointment_price: 40,
    },
    {
        id: "4",
        name: "Zoom Meetings",
        location: "",
        time: "10:00 AM - 6:30 PM",
        image: "https://cdn.brandfetch.io/id3aO4Szj3/w/400/h/400/theme/dark/icon.jpeg?c=1dxbfHSJFAPEGdCLU4o5B",
        type: "Online",
        is_primary: false,
        appointment_price: 20,
    },
];

export default function DoctorWorkplaces() {
    const navigate = useNavigate();

    const slugify = (name: string) =>
        name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

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
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7.757v8.486M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    }
                ></Button>
            </div>
            <div className="workplaces-list">
                {workplaces.map((workplace) => (
                    <WorkplaceCard
                        key={workplace.id}
                        workplace={workplace}
                        onClick={() => navigate(`/doctor/workplaces/${slugify(workplace.name)}`, {
                            state: { workplace }
                        })}
                    />
                ))}
            </div>
        </div>
    );
}