import React from "react";
import './customInput.css';

interface CustomInputProps {
    label?: string;
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    optional?: boolean;
    message?: string;
    messageIcon?: React.ReactNode;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    variant?: "normal" | "error" | "disabled";
}

export default function CustomInput({
    label,
    placeholder,
    value,
    onChange,
    optional = false,
    message,
    messageIcon,
    leftIcon,
    rightIcon,
    variant = "normal",
}: CustomInputProps) {
    const isError = variant === "error";
    const isDisabled = variant === "disabled";

    return (
        <div className={`custom-input-container ${variant}`}>
            {label && (
                <label className="custom-input-label">
                    {label}
                    {optional && <span className="optional-text"> (optional)</span>}
                </label>
            )}

            <div className="custom-input-wrapper">
                {leftIcon && <span className="input-icon left">{leftIcon}</span>}
                <input
                    type="text"
                    className="custom-input-field"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={isDisabled}
                />
                {rightIcon && <span className="input-icon right">{rightIcon}</span>}
            </div>

            {message && (
                <div className={`custom-input-message ${isError ? "error" : ""}`}>
                    <span className="message-icon">
                        {isError ? (
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 32 32"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M16 3.00049C13.4288 3.00049 10.9154 3.76293 8.77759 5.19138C6.63975 6.61984 4.97351 8.65016 3.98957 11.0256C3.00563 13.401 2.74819 16.0149 3.2498 18.5367C3.75141 21.0584 4.98953 23.3748 6.80762 25.1929C8.6257 27.011 10.9421 28.2491 13.4638 28.7507C15.9856 29.2523 18.5995 28.9949 20.9749 28.0109C23.3503 27.027 25.3807 25.3607 26.8091 23.2229C28.2376 21.0851 29 18.5716 29 16.0005C28.9964 12.5538 27.6256 9.2493 25.1884 6.81212C22.7512 4.37494 19.4467 3.00413 16 3.00049ZM16 27.0005C13.8244 27.0005 11.6977 26.3554 9.88873 25.1467C8.07979 23.938 6.66989 22.22 5.83733 20.21C5.00477 18.2 4.78693 15.9883 5.21137 13.8545C5.63581 11.7207 6.68345 9.76069 8.22183 8.22231C9.76021 6.68394 11.7202 5.63629 13.854 5.21185C15.9878 4.78741 18.1995 5.00525 20.2095 5.83781C22.2195 6.67038 23.9375 8.08027 25.1462 9.88922C26.3549 11.6982 27 13.8249 27 16.0005C26.9967 18.9169 25.8367 21.7128 23.7745 23.775C21.7123 25.8372 18.9164 26.9972 16 27.0005ZM15 17.0005V10.0005C15 9.73527 15.1054 9.48092 15.2929 9.29338C15.4804 9.10585 15.7348 9.00049 16 9.00049C16.2652 9.00049 16.5196 9.10585 16.7071 9.29338C16.8946 9.48092 17 9.73527 17 10.0005V17.0005C17 17.2657 16.8946 17.5201 16.7071 17.7076C16.5196 17.8951 16.2652 18.0005 16 18.0005C15.7348 18.0005 15.4804 17.8951 15.2929 17.7076C15.1054 17.5201 15 17.2657 15 17.0005ZM17.5 21.5005C17.5 21.7972 17.412 22.0872 17.2472 22.3338C17.0824 22.5805 16.8481 22.7728 16.574 22.8863C16.2999 22.9998 15.9983 23.0295 15.7074 22.9717C15.4164 22.9138 15.1491 22.7709 14.9393 22.5611C14.7296 22.3514 14.5867 22.0841 14.5288 21.7931C14.471 21.5022 14.5007 21.2006 14.6142 20.9265C14.7277 20.6524 14.92 20.4181 15.1667 20.2533C15.4133 20.0885 15.7033 20.0005 16 20.0005C16.3978 20.0005 16.7794 20.1585 17.0607 20.4398C17.342 20.7211 17.5 21.1027 17.5 21.5005Z"
                                    fill="currentColor"
                                />
                            </svg>
                        ) : (
                            messageIcon
                        )}
                    </span>
                    <span>{message}</span>
                </div>
            )}
        </div>
    );
}