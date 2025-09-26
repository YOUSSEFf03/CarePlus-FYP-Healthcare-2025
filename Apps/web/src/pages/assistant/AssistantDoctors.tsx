import React from "react";
import CustomText from "../../components/Text/CustomText";
import Button from "../../components/Button/Button";
import "../../styles/assistantDoctors.css";

type Workplace = {
    id: number;
    name: string;
};

type Doctor = {
    id: number;
    name: string;
    avatar: string;
    workplaces: Workplace[];
};

function AssistantDoctors() {
    const doctors: Doctor[] = [
        {
            id: 1,
            name: "Dr. Ayesha Khan",
            avatar: "https://avatar.freepik.com/18526052-211117104115.jpg",
            workplaces: [
                { id: 101, name: "Green Clinic" },
                { id: 102, name: "Apollo Hospital" },
            ],
        },
        {
            id: 2,
            name: "Dr. Kamran Aziz",
            avatar: "data:image/jpeg;base64,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",
            workplaces: [{ id: 103, name: "DHA Medical Tower" },
            { id: 104, name: "Online Zoom" }
            ],
        },
    ];

    return (
        <div className="assistant-doctors-page">
            <CustomText as="h2" variant="text-heading-H2">
                Your Assigned Doctors
            </CustomText>

            {doctors.length === 0 ? (
                <div className="empty-state">
                    <CustomText as="p" variant="text-body-Large">
                        You don’t have access to any doctors yet.
                    </CustomText>
                    <CustomText as="p" variant="text-body-Small">
                        Once you accept an invitation, doctors and their workplaces will show up here.
                    </CustomText>
                </div>
            ) : (
                <div className="doctor-list">
                    {doctors.map((doctor) => (
                        <DoctorCard key={doctor.id} doctor={doctor} />
                    ))}
                </div>
            )}
        </div>
    );
}

function DoctorCard({ doctor }: { doctor: Doctor }) {
    return (
        <div className="doctor-card">
            <div className="doctor-header">
                <img src={doctor.avatar} alt={doctor.name} className="doctor-avatar" />
                <div className="doctor-info">
                    <CustomText as="h3" variant="text-heading-H4">
                        {doctor.name}
                    </CustomText>
                    <CustomText as="p" variant="text-body-Small" className="workplace-hint">
                        Workplaces you manage under this doctor:
                    </CustomText>
                </div>
            </div>

            <ul className="workplaces-list">
                {doctor.workplaces.map((wp) => (
                    <li key={wp.id}>
                        <Button
                            variant="secondary"
                            onClick={() => handleManageWorkplace(doctor.id, wp.id)}
                            className="workplace-btn"
                            text={`${wp.name}`}
                            iconRight={
                                <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M24.9996 8.00049V21.0005C24.9996 21.2657 24.8942 21.5201 24.7067 21.7076C24.5192 21.8951 24.2648 22.0005 23.9996 22.0005C23.7344 22.0005 23.48 21.8951 23.2925 21.7076C23.1049 21.5201 22.9996 21.2657 22.9996 21.0005V10.4142L8.70708 24.708C8.51944 24.8956 8.26494 25.001 7.99958 25.001C7.73422 25.001 7.47972 24.8956 7.29208 24.708C7.10444 24.5203 6.99902 24.2659 6.99902 24.0005C6.99902 23.7351 7.10444 23.4806 7.29208 23.293L21.5858 9.00049H10.9996C10.7344 9.00049 10.48 8.89513 10.2925 8.70759C10.1049 8.52006 9.99958 8.2657 9.99958 8.00049C9.99958 7.73527 10.1049 7.48092 10.2925 7.29338C10.48 7.10585 10.7344 7.00049 10.9996 7.00049H23.9996C24.2648 7.00049 24.5192 7.10585 24.7067 7.29338C24.8942 7.48092 24.9996 7.73527 24.9996 8.00049Z" fill="currentColor" />
                                </svg>
                            }
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}

function handleManageWorkplace(doctorId: number, workplaceId: number) {
    console.log("Go to manage page for:", doctorId, workplaceId);
    // navigate(`/assistant/workplace/${workplaceId}`); // When routing is ready
}

export default AssistantDoctors;