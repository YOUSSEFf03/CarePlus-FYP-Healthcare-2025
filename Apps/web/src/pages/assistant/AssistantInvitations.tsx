import React, { useState } from "react";
import CustomText from "../../components/Text/CustomText";
import Button from "../../components/Button/Button";
import "../../styles/assistantInivitations.css";

type InviteStatus = "pending" | "accepted" | "rejected" | "expired";

type Invite = {
    id: string;
    doctorName: string;
    workplaceName: string;
    message?: string;
    status: InviteStatus;
    sentAt: string;
    expiresAt: string;
};

const mockInvites: Invite[] = [
    {
        id: "1",
        doctorName: "Dr. Ayesha Khan",
        workplaceName: "Green Clinic",
        status: "pending",
        message: "We’d love to have you onboard our clinic team!",
        sentAt: "2025-09-20",
        expiresAt: "2025-09-27",
    },
    {
        id: "2",
        doctorName: "Dr. Kamran Aziz",
        workplaceName: "Apollo Hospital",
        status: "accepted",
        sentAt: "2025-09-10",
        expiresAt: "2025-09-17",
    },
    {
        id: "3",
        doctorName: "Dr. Leena Siddiqui",
        workplaceName: "Elite Care Center",
        status: "rejected",
        sentAt: "2025-09-12",
        expiresAt: "2025-09-19",
    },
];

export default function AssistantInvitations() {
    const [selectedId, setSelectedId] = useState<string | null>(mockInvites[0]?.id ?? null);
    const selectedInvite = mockInvites.find((invite) => invite.id === selectedId);

    const handleResponse = (response: "accept" | "reject") => {
        console.log(`Invitation ${response}ed for ID: ${selectedId}`);
    };

    return (
        <div className="assistant-invitations-page">
            <div className="invitations-list">
                {mockInvites.map((invite) => (
                    <div
                        key={invite.id}
                        className={`invitation-email-item ${selectedId === invite.id ? "selected" : ""}`}
                        onClick={() => setSelectedId(invite.id)}
                    >
                        <div className="email-content">
                            <div className="sender">{invite.doctorName}</div>
                            <div className="subject">{invite.workplaceName}</div>
                        </div>
                        <div className="email-meta">
                            <span className="email-date">{invite.sentAt}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="invitation-email-detail">
                {selectedInvite ? (
                    <>
                        <h2>{selectedInvite.workplaceName}</h2>
                        <div className="email-meta-detail">
                            <p><strong>Doctor:</strong> {selectedInvite.doctorName}</p>
                            <p><strong>Status:</strong> <span className={`status-badge ${selectedInvite.status}`}>{selectedInvite.status}</span></p>
                            <p><strong>Sent:</strong> {selectedInvite.sentAt}</p>
                            <p><strong>Expires:</strong> {selectedInvite.expiresAt}</p>
                        </div>

                        {selectedInvite.message && (
                            <div className="invite-message">
                                <p>{selectedInvite.message}</p>
                            </div>
                        )}

                        {selectedInvite.status === "pending" && (
                            <div className="invite-actions">
                                <Button onClick={() => handleResponse("accept")}>Accept</Button>
                                <Button variant="secondary" onClick={() => handleResponse("reject")}>Reject</Button>
                            </div>
                        )}
                    </>
                ) : (
                    <p>Select an invitation to view details.</p>
                )}
            </div>
        </div>
    );
}
