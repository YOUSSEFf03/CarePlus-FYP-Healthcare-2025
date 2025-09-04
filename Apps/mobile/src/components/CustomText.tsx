import React from 'react';
import { Text, TextProps, StyleSheet, TextStyle } from 'react-native';
import { fontFamily, fontWeight, fontSize, colors } from '../../src/styles/tokens';

/**
 * CustomText (React Native)
 * Usage:
 *   <CustomText variant="text-heading-H1">Hello</CustomText>
 */

export type Variant =
    | 'text-heading-H1'
    | 'text-heading-H2'
    | 'text-heading-H3'
    | 'text-heading-H4'
    | 'text-heading-H5'
    | 'text-body-lg-r'
    | 'text-body-lg-m'
    | 'text-body-lg-sb'
    | 'text-body-md-r'
    | 'text-body-md-m'
    | 'text-body-md-sb'
    | 'text-body-sm-r'
    | 'text-body-sm-m'
    | 'text-body-sm-sb'
    | 'text-body-xs-r'
    | 'text-link-lg'
    | 'text-link-md'
    | 'text-link-sm';

export interface CustomTextProps extends Omit<TextProps, 'style'> {
    variant?: Variant;
    style?: TextProps['style'];
}

const headingSet: Variant[] = [
    'text-heading-H1',
    'text-heading-H2',
    'text-heading-H3',
    'text-heading-H4',
    'text-heading-H5',
];

export default function CustomText({
    variant = 'text-body-md-r',
    style,
    children,
    ...rest
}: CustomTextProps) {
    const isHeading = headingSet.includes(variant);
    return (
        <Text
            accessibilityRole={isHeading ? 'header' : undefined}
            style={[styles.base, getVariantStyle(variant), style]}
            {...rest}
        >
            {children}
        </Text>
    );
}

function getVariantStyle(variant: Variant): TextStyle {
    switch (variant) {
        /* Headings */
        case 'text-heading-H1':
            return { fontSize: fontSize.s32, fontFamily: fontFamily.poppinsBold };
        case 'text-heading-H2':
            return { fontSize: fontSize.s24, fontFamily: fontFamily.poppinsBold };
        case 'text-heading-H3':
            return { fontSize: fontSize.s20, fontFamily: fontFamily.poppinsBold };
        case 'text-heading-H4':
            return { fontSize: fontSize.s16, fontFamily: fontFamily.poppinsSemiBold };
        case 'text-heading-H5':
            return { fontSize: fontSize.s14, fontFamily: fontFamily.poppinsSemiBold };

        /* Body */
        case 'text-body-lg-r':
            return { fontSize: fontSize.s16, fontFamily: fontFamily.poppinsRegular, fontWeight: fontWeight.w400 };
        case 'text-body-lg-m':
            return { fontSize: fontSize.s16, fontFamily: fontFamily.poppinsRegular, fontWeight: fontWeight.w500 };
        case 'text-body-lg-sb':
            return { fontSize: fontSize.s16, fontFamily: fontFamily.poppinsRegular, fontWeight: fontWeight.w600 };

        case 'text-body-md-r':
            return { fontSize: fontSize.s14, fontFamily: fontFamily.poppinsRegular, fontWeight: fontWeight.w400 };
        case 'text-body-md-m':
            return { fontSize: fontSize.s14, fontFamily: fontFamily.poppinsRegular, fontWeight: fontWeight.w500 };
        case 'text-body-md-sb':
            return { fontSize: fontSize.s14, fontFamily: fontFamily.poppinsRegular, fontWeight: fontWeight.w600 };

        case 'text-body-sm-r':
            return { fontSize: fontSize.s12, fontFamily: fontFamily.poppinsRegular, fontWeight: fontWeight.w400 };
        case 'text-body-sm-m':
            return { fontSize: fontSize.s12, fontFamily: fontFamily.poppinsRegular, fontWeight: fontWeight.w500 };
        case 'text-body-sm-sb':
            return { fontSize: fontSize.s12, fontFamily: fontFamily.poppinsRegular, fontWeight: fontWeight.w600 };

        case 'text-body-xs-r':
            return { fontSize: fontSize.s10, fontFamily: fontFamily.poppinsRegular, fontWeight: fontWeight.w400 };

        /* Links */
        case 'text-link-lg':
            return linkStyle(fontSize.s16);
        case 'text-link-md':
            return linkStyle(fontSize.s14);
        case 'text-link-sm':
            return linkStyle(fontSize.s12);

        default:
            return { fontSize: fontSize.s14, fontFamily: fontFamily.poppinsRegular, fontWeight: fontWeight.w400 };
    }
}

function linkStyle(size: number): TextStyle {
    return {
        fontSize: size,
        textDecorationLine: 'underline',
        fontFamily: fontFamily.poppinsRegular,
        fontWeight: fontWeight.w500,
        color: colors.primary,
    };
}

const styles = StyleSheet.create({
    base: {
        // Reset default margins from web CSS; RN Text has none, but we keep this for clarity.
        // Provide a consistent text color unless caller overrides.
        color: colors.black,
    },
});