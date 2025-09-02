import React from "react";
import "./toggleSwitch.css";

type ToggleProps = {
    label?: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
    name?: string;
};

export default function ToggleSwitch({ label, checked, onChange, disabled, name }: ToggleProps) {
    const id = React.useId();

    return (
        <div className="toggle-field">
            {label && (
                <label className="custom-input-label" htmlFor={id}>
                    {label}
                </label>
            )}

            <button
                id={id}
                name={name}
                type="button"
                role="switch"
                aria-checked={checked}
                aria-disabled={disabled}
                className={`toggle ${checked ? "is-on" : ""} ${disabled ? "is-disabled" : ""}`}
                onClick={() => !disabled && onChange(!checked)}
            >
                <span className="toggle-knob" />
            </button>
        </div>
    );
}