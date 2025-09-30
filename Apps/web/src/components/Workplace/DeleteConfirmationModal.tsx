import React, { useEffect, useState } from "react";
import "./deleteModal.css";
import CustomInput from "../Inputs/CustomInput";
import Button from "../Button/Button";
import CustomText from "../Text/CustomText";
import ReactDOM from "react-dom";

interface DeleteModalProps {
    name: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function DeleteConfirmationModal({ name, onConfirm, onCancel }: DeleteModalProps) {
    const [input, setInput] = useState("");

    const isMatch = input.trim() === (name || "").trim();

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    return ReactDOM.createPortal(
        <div className="delete-modal-backdrop">
            <div className="delete-modal">
                <CustomText variant="text-heading-H4" as="h4">
                    Confirm Deletion
                </CustomText>
                <CustomText variant="text-body" as="p" className="modal-message">
                    To confirm, type <strong>{name}</strong> below and click Delete.
                </CustomText>

                <CustomInput
                    placeholder="Enter workplace name"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    variant="normal"
                />

                <div className="modal-actions">
                    <Button variant="tertiary" text="Cancel" onClick={onCancel} />
                    <Button
                        variant="primary"
                        text="Delete"
                        onClick={onConfirm}
                        disabled={!isMatch}
                        className="delete-confirm-button"
                    />
                </div>
            </div>
        </div>,
        document.body
    );
}