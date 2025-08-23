import React, { useId } from 'react';
import "./radioGroup.css";

interface Option {
    label: string;
    value: string | number;
    disabled?: boolean;
    hint?: string;
}

interface Props {
    label?: string;
    name?: string;                 // optional: we’ll generate one if missing
    value: string | number;
    options: Option[];
    onChange: (val: string | number) => void;
    disabled?: boolean;
    inline?: boolean;
}

export default function RadioGroup({
    label,
    name,
    value,
    options,
    onChange,
    disabled,
    inline,
}: Props) {
    const autoId = useId();
    const groupName = name ?? `rg-${autoId}`;

    return (
        <fieldset className={`rg-field ${disabled ? 'is-disabled' : ''}`}>
            {label && <legend className="rg-label">{label}</legend>}
            <div className={`rg-group ${inline ? 'is-inline' : ''}`}>
                {options.map((opt) => {
                    const id = `${groupName}-${String(opt.value)}`;
                    return (
                        <label key={id} htmlFor={id} className={`rg-option ${opt.disabled ? 'is-disabled' : ''}`}>
                            <input
                                type="radio"
                                id={id}
                                name={groupName}
                                value={String(opt.value)}
                                disabled={disabled || opt.disabled}
                                checked={String(value) === String(opt.value)}
                                onChange={() => onChange(opt.value)}
                            />
                            <span className="rg-text">{opt.label}</span>
                            {opt.hint && <span className="rg-hint">{opt.hint}</span>}
                        </label>
                    );
                })}
            </div>
        </fieldset>
    );
}