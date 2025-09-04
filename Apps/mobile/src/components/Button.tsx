import React from 'react';
import {
    Pressable,
    Text,
    View,
    ActivityIndicator,
    StyleSheet,
    ViewStyle,
    TextStyle,
    StyleProp,
} from 'react-native';
import { colors, fontFamily, fontSize, radius, spacing, shadow } from '@/styles/tokens';

type Variant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';

export interface ButtonProps {
    text?: string;
    iconLeft?: React.ReactNode;
    iconRight?: React.ReactNode;
    variant?: Variant;
    disabled?: boolean;
    loading?: boolean;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    // optional extras
    size?: 'sm' | 'md';
    fullWidth?: boolean;
    hitSlop?: number | { top: number; left: number; right: number; bottom: number };
}

export default function Button({
    text,
    iconLeft,
    iconRight,
    variant = 'primary',
    disabled = false,
    loading = false,
    onPress,
    style,
    textStyle,
    size = 'md',
    fullWidth = false,
    hitSlop = 8,
}: ButtonProps) {
    const isDisabled = disabled || loading;

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: isDisabled, busy: loading }}
            onPress={isDisabled ? undefined : onPress}
            hitSlop={hitSlop}
            style={({ pressed }) => [
                styles.base,
                size === 'sm' ? styles.sm : styles.md,
                fullWidth && styles.fullWidth,
                getContainerVariantStyle(variant, pressed, isDisabled),
                // subtle elevation only for filled buttons
                variant === 'primary' || variant === 'danger' ? shadow(0) : null,
                style,
            ]}
        >
            {({ pressed }) => (
                <View style={styles.content}>
                    {/* Left icon */}
                    {iconLeft ? <View style={styles.iconLeft}>{iconLeft}</View> : null}

                    {/* Label or spinner */}
                    {loading ? (
                        <ActivityIndicator size="small" color={getSpinnerColor(variant)} />
                    ) : text ? (
                        <Text
                            style={[
                                styles.textBase,
                                size === 'sm' ? styles.textSm : styles.textMd,
                                getTextVariantStyle(variant, pressed, isDisabled),
                                textStyle,
                            ]}
                            numberOfLines={1}
                        >
                            {text}
                        </Text>
                    ) : null}

                    {/* Right icon */}
                    {iconRight ? <View style={styles.iconRight}>{iconRight}</View> : null}
                </View>
            )}
        </Pressable>
    );
}

/* ---------- styles & helpers ---------- */

const styles = StyleSheet.create({
    base: {
        borderRadius: radius.r8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    md: {
        paddingVertical: spacing[8],
        paddingHorizontal: spacing[16],
    },
    sm: {
        paddingVertical: spacing[6],
        paddingHorizontal: spacing[12],
        borderRadius: radius.r8,
    },
    fullWidth: { alignSelf: 'stretch' },

    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconLeft: { marginRight: spacing[8] },
    iconRight: { marginLeft: spacing[8] },

    textBase: {
        fontFamily: fontFamily.poppinsRegular,
    },
    textMd: { fontSize: fontSize.s15 },
    textSm: { fontSize: fontSize.s14 },
});

function getContainerVariantStyle(
    variant: Variant,
    pressed: boolean,
    disabled: boolean
): ViewStyle {
    switch (variant) {
        case 'primary':
            if (disabled)
                return { backgroundColor: colors.neutral200 };
            return { backgroundColor: pressed ? colors.primary60 : colors.primary };
        case 'secondary':
            if (disabled)
                return { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.neutral200 };
            return {
                backgroundColor: pressed ? colors.primary05 : 'transparent',
                borderWidth: 2,
                borderColor: colors.primary,
            };
        case 'tertiary':
            // link-like button
            return { backgroundColor: 'transparent' };
        case 'danger':
            if (disabled)
                return { backgroundColor: colors.neutral200 };
            return { backgroundColor: pressed ? colors.error60 : colors.error };
        case 'ghost':
            if (disabled)
                return { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.neutral200, borderRadius: radius.r100, paddingVertical: spacing[8], paddingHorizontal: spacing[8] };
            return {
                backgroundColor: pressed ? colors.neutral200 : 'transparent',
                borderWidth: 1,
                borderColor: colors.neutral300,
                borderRadius: radius.r100,
                paddingVertical: spacing[8],
                paddingHorizontal: spacing[8],
            };
        default:
            return {};
    }
}

function getTextVariantStyle(
    variant: Variant,
    pressed: boolean,
    disabled: boolean
): TextStyle {
    switch (variant) {
        case 'primary':
            return { color: disabled ? colors.neutral600 : colors.white };
        case 'secondary':
            return { color: disabled ? colors.neutral600 : colors.primary };
        case 'tertiary':
            return {
                color: disabled ? colors.neutral600 : pressed ? colors.primary60 : colors.primary,
                textDecorationLine: pressed && !disabled ? 'underline' : 'none',
            };
        case 'danger':
            return { color: disabled ? colors.neutral600 : colors.white };
        case 'ghost':
            return { color: disabled ? colors.neutral600 : '#1e293b' }; // matches your web ghost color
        default:
            return { color: colors.white };
    }
}

function getSpinnerColor(variant: Variant) {
    return variant === 'primary' || variant === 'danger' ? colors.white : colors.primary;
}