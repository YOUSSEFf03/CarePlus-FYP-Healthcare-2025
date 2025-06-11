import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import '../../styles/workplaceDetails.css';
import CustomText from "../../components/Text/CustomText";
import { Workplace } from "../../components/Workplace/WorkplaceCard";
import Button from "../../components/Button/Button";
import CustomInput from "../../components/Inputs/CustomInput";
import DeleteConfirmationModal from "../../components/Workplace/DeleteConfirmationModal";

export default function WorkplaceDetails() {
    const { name } = useParams();
    const location = useLocation();
    const workplaceData = location.state?.workplace as Workplace;

    const [workplace, setWorkplace] = useState(workplaceData);
    const [isEditing, setIsEditing] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDelete = () => {
        console.log("Deleted:", workplace.id);
        setShowDeleteModal(false);
    };

    if (!workplace) {
        return <div>No workplace data available</div>;
    }

    const handleChange = (field: keyof Workplace, value: string | number) => {
        setWorkplace(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        console.log("Saved:", workplace);
        setIsEditing(false);
    };

    return (
        <div>
            <div className="workplace-details-header">
                <CustomText variant="text-heading-H2" as={'h2'}>{workplace.name}</CustomText>
                <div className="workplace-details-actions">
                    {isEditing ? (
                        <Button
                            variant="primary"
                            text="Save Changes"
                            className="save-button"
                            iconLeft={
                                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z" />
                                </svg>
                            }
                            onClick={handleSave}
                        />
                    ) : (
                        <Button
                            variant="primary"
                            text="Edit"
                            className="edit-button"
                            iconLeft={
                                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z" />
                                </svg>
                            }
                            onClick={() => setIsEditing(true)}
                        />
                    )}
                    <Button variant="tertiary" text="Delete" className="delete-button"
                        iconLeft={
                            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z" />
                            </svg>
                        }
                        onClick={() => setShowDeleteModal(true)}
                    />
                </div>
            </div>

            {showDeleteModal && (
                <DeleteConfirmationModal
                    name={workplace.name}
                    onCancel={() => setShowDeleteModal(false)}
                    onConfirm={handleDelete}
                />
            )}

            <CustomInput
                label="Name"
                value={workplace.name}
                placeholder="Workplace name"
                onChange={(e) => handleChange("name", e.target.value)}
                variant={isEditing ? "normal" : "disabled"}
            />

            <CustomInput
                label="Location"
                value={workplace.location}
                placeholder="Location"
                onChange={(e) => handleChange("location", e.target.value)}
                variant={isEditing ? "normal" : "disabled"}
            />

            <CustomInput
                label="Type"
                value={workplace.type}
                placeholder="Workplace type"
                onChange={(e) => handleChange("type", e.target.value)}
                variant={isEditing ? "normal" : "disabled"}
            />

            <CustomInput
                label="Working Hours"
                value={workplace.time}
                placeholder="Working hours"
                onChange={(e) => handleChange("time", e.target.value)}
                variant={isEditing ? "normal" : "disabled"}
            />

            <CustomInput
                label="Appointment Price"
                value={String(workplace.appointment_price)}
                placeholder="Appointment price"
                onChange={(e) => handleChange("appointment_price", Number(e.target.value))}
                variant={isEditing ? "normal" : "disabled"}
            />

            <CustomInput
                label="Image URL"
                value={workplace.image}
                placeholder="Image URL"
                onChange={(e) => handleChange("image", e.target.value)}
                variant={isEditing ? "normal" : "disabled"}
            />

            {workplace.image && (
                <img src={workplace.image} alt={workplace.name} width="300" style={{ marginTop: "16px", borderRadius: "8px" }} />
            )}
        </div>
    );
}