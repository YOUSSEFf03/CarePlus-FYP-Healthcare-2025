import React from "react";
import CustomText from "../../components/Text/CustomText";

export default function WorkplaceOverview() {
    return (
        <div className="overview-tab">
            <CustomText as="h3" variant="text-heading-H4">Workplace Overview</CustomText>
            <div className="overview-content">
                <img
                    src="https://img.freepik.com/premium-photo/white-doctors-gown-stethoscope-hanging-rack-clinic_1339860-4144.jpg"
                    alt="Workplace"
                    className="overview-image"
                />
                <div className="overview-details">
                    <p><strong>Name:</strong> Green Clinic</p>
                    <p><strong>Type:</strong> Clinic</p>
                    <p><strong>Address:</strong> 123 Health Ave, City</p>
                    <p><strong>Working Hours:</strong> 9:00 AM – 5:00 PM</p>
                    <p><strong>Price:</strong> $50</p>
                </div>
            </div>
        </div>
    );
}
