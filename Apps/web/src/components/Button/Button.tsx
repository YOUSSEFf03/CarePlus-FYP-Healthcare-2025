import React from 'react';
import './button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    text?: string;
    iconLeft?: React.ReactNode;
    iconRight?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';
}

export default function Button({
    text,
    iconLeft,
    iconRight,
    variant = 'primary',
    disabled = false,
    className = '',
    ...props
}: ButtonProps) {
    return (
        <button className={`btn btn--${variant} ${disabled ? 'btn--disabled' : ''} ${className}`}
            disabled={disabled}
            {...props}
        >
            {iconLeft && <span className="btn__icon btn__icon--left">{iconLeft}</span>}
            {text && <span className="btn__text">{text}</span>}
            {iconRight && <span className="btn__icon btn__icon--right">{iconRight}</span>}
        </button>
    );
}