import React, { useMemo, useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, ViewStyle, TextStyle, StyleProp } from 'react-native';
import CustomText from '@/components/CustomText';
import { colors, fontFamily, fontSize, radius, spacing } from '@/styles/tokens';
import { Ionicons } from '@expo/vector-icons';

export type Variant = 'normal' | 'error' | 'disabled';
export type As = 'input' | 'textarea';

export interface CustomInputProps {
    label?: string;
    as?: As; // default: 'input'
    type?: 'text' | 'password' | 'email' | 'number' | 'time';
    placeholder?: string;
    value: string;
    onChangeText?: (text: string) => void;
    optional?: boolean;
    message?: string;
    messageIcon?: React.ReactNode;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    variant?: Variant;
    disabled?: boolean;
    rows?: number;
    maxLength?: number;
    containerStyle?: StyleProp<ViewStyle>;
    inputStyle?: StyleProp<TextStyle>;
    autoFocus?: boolean;
}

export default function CustomInput({
    label,
    as = 'input',
    type = 'text',
    placeholder,
    value,
    onChangeText,
    optional = false,
    message,
    messageIcon,
    leftIcon,
    rightIcon,
    variant = 'normal',
    disabled,
    rows = 4,
    maxLength,
    containerStyle,
    inputStyle,
    autoFocus,
}: CustomInputProps) {
    const isDisabled = variant === 'disabled' || !!disabled;
    const isTextarea = as === 'textarea';
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = !isTextarea && type === 'password';

    const wrapperStyle = useMemo<StyleProp<ViewStyle>>(
        () => [
            styles.inputWrap,
            isTextarea ? { alignItems: 'flex-start', minHeight: 100, paddingVertical: spacing[12] } : undefined,
            variant === 'error' ? { borderColor: colors.error } : undefined,
            isDisabled ? { backgroundColor: colors.neutral200 } : undefined,
            (focused && variant === 'normal') ? { borderColor: colors.primary } : undefined,
            containerStyle,
        ],
        [isTextarea, variant, isDisabled, focused, containerStyle]
    );

    return (
        <View style={{ gap: spacing[4] }}>
            {label ? (
                <CustomText variant="text-body-md-sb" style={styles.label}>
                    {label}
                    {optional ? (
                        <CustomText variant="text-body-sm-r" style={styles.optional}>
                            {' '}
                            (optional)
                        </CustomText>
                    ) : null}
                </CustomText>
            ) : null}

            <View style={wrapperStyle}>
                {leftIcon && !isTextarea ? <View style={styles.iconLeft}>{leftIcon}</View> : null}

                <TextInput
                    style={[styles.input, isTextarea ? styles.textarea : undefined, inputStyle]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.neutral500}
                    editable={!isDisabled}
                    autoFocus={autoFocus}
                    keyboardType={type === 'email' ? 'email-address' : type === 'number' ? 'numeric' : 'default'}
                    autoCapitalize={type === 'email' ? 'none' : 'sentences'}
                    secureTextEntry={isPasswordType && !showPassword}
                    multiline={isTextarea}
                    numberOfLines={isTextarea ? rows : 1}
                    maxLength={maxLength}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                />

                {!isTextarea && isPasswordType ? (
                    <Pressable accessibilityRole="button" onPress={() => setShowPassword(s => !s)} style={styles.iconRight}>
                        <CustomText variant="text-body-md-m" style={{ color: colors.neutral700 }}>
                            {showPassword ? <Ionicons name="eye-off-outline" size={24} /> : <Ionicons name="eye-outline" size={24} />}
                        </CustomText>
                    </Pressable>
                ) : !isTextarea && rightIcon ? (
                    <View style={styles.iconRight}>{rightIcon}</View>
                ) : null}
            </View>

            {message ? (
                <View style={styles.messageRow}>
                    <View style={styles.messageIcon}>{messageIcon}</View>
                    <CustomText
                        variant="text-body-sm-r"
                        style={[styles.messageText, variant === 'error' && { color: colors.error }]}
                    >
                        {message}
                    </CustomText>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    label: { color: colors.primary },
    optional: { color: colors.neutral600 },
    inputWrap: {
        borderWidth: 1,
        borderColor: colors.neutral400,
        borderRadius: radius.r8,
        paddingHorizontal: spacing[12],
        paddingVertical: spacing[6],
        backgroundColor: colors.white,
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        fontFamily: fontFamily.poppinsRegular,
        fontSize: fontSize.s14,
        color: colors.primary,
    },
    textarea: {
        textAlignVertical: 'top',
        lineHeight: 20,
    },
    iconLeft: { marginRight: spacing[8] },
    iconRight: { marginLeft: spacing[8] },
    messageRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[4] },
    messageIcon: { width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
    messageText: { color: colors.neutral500 },
});