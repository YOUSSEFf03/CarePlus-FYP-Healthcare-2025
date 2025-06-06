import React, { ElementType, ReactNode } from 'react';
import './customText.css';

type CustomTextProps = {
    variant?: string;
    className?: string;
    children: ReactNode;
    as?: ElementType;
};

const CustomText = ({
    variant = 'text-body-md-r',
    className = '',
    children,
    as: Component = 'span',
}: CustomTextProps) => {
    return (
        <Component className={`${variant} ${className}`}>
            {children}
        </Component>
    );
};

export default CustomText;