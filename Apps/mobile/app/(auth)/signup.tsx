import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, ImageBackground, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Button from '@/components/Button';
import CustomText from '@/components/CustomText';
import CustomInput from '@/components/CustomInput';
import PhoneInput from '@/components/PhoneInput.native'; // <- your RN phone input
import { colors, fontFamily, fontSize, radius, shadow, spacing } from '@/styles/tokens';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList } from '../../App';
import { useSignupDraft } from '@/context/SignupDraftContext';


type RootNav = NativeStackNavigationProp<RootStackParamList>;

export default function SignUpScreen() {
    const navigation = useNavigation<RootNav>();
    const { draft, update } = useSignupDraft();

    const [fullName, setFullName] = useState(draft.fullName);
    const [phone, setPhone] = useState(draft.phone);
    const [email, setEmail] = useState(draft.email);
    const [password, setPassword] = useState(draft.password ?? '');

    const onFullName = (t: string) => {
        if (!touched.fullName) markTouched('fullName');
        setFullName(t);
        update({ fullName: t });
    };
    const onPhone = (v: string) => {
        if (!touched.phone) markTouched('phone');
        setPhone(v);
        update({ phone: v });
    };
    const onEmail = (t: string) => {
        if (!touched.email) markTouched('email');
        setEmail(t);
        update({ email: t });
    };
    const onPassword = (t: string) => {
        if (!touched.password) markTouched('password');
        setPassword(t);
        update({ password: t });
    };

    const [touched, setTouched] = useState({
        fullName: false,
        phone: false,
        email: false,
        password: false,
    });

    const markTouched = (key: keyof typeof touched) =>
        setTouched(prev => (prev[key] ? prev : { ...prev, [key]: true }));

    // -------- validation ----------
    const nameTrim = useMemo(() => fullName.trim(), [fullName]);
    const isFullNameValid = nameTrim.length >= 2; // adjust if you require first+last
    const fullNameError =
        touched.fullName && !isFullNameValid ? 'Please enter your full name.' : undefined;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    const isEmailValid = emailRegex.test(email);
    const emailError = touched.email && !isEmailValid ? 'Enter a valid email address.' : undefined;

    // at least 8 characters; extend with numbers/symbols if you like
    const isPasswordValid = password.length >= 8;
    const passwordError = touched.password && !isPasswordValid ? 'At least 8 characters.' : undefined;

    // E.164: + then 6–15 digits (country code + national number)
    const phoneRegex = /^\+\d{6,15}$/;
    const isPhoneValid = phoneRegex.test(phone);
    const phoneError =
        touched.phone && !isPhoneValid ? 'Enter a valid phone number.' : undefined;

    const canContinue = isFullNameValid && isEmailValid && isPasswordValid && isPhoneValid;

    const goBack = () => {
        if (navigation.canGoBack()) navigation.goBack();
        else navigation.navigate('OnboardingStack'); // fallback
    };

    const goLogin = () => {
        navigation.navigate('AuthStack', { screen: 'Login' } as any);
    };

    const onContinue = () => {
        navigation.navigate('AuthStack', { screen: 'SignUpDetails' } as any);
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <ImageBackground
                source={require('../../assets/images/login-bg.png')}
                style={styles.bg}
                imageStyle={styles.bgImage}
            >
                <StatusBar style="light" />

                {/* Header */}
                <View style={styles.headerRow}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                        onPress={goBack}
                        style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.8 }]}
                    >
                        <Ionicons name="chevron-back-outline" size={24} style={{ color: '#050f2a' }} />
                    </Pressable>
                </View>

                <View style={styles.container}>
                    <CustomText variant="text-heading-H1" style={styles.title}>Create account</CustomText>

                    <View style={styles.inputsContainer}>
                        {/* Full name */}
                        <CustomInput
                            label="Full name"
                            placeholder="Enter your full name"
                            value={fullName}
                            onChangeText={onFullName}
                            variant={fullNameError ? 'error' : 'normal'}
                            message={fullNameError}
                            autoFocus
                            messageIcon={<Ionicons name="alert-circle-outline" size={16} color={colors.error} />}
                        />

                        {/* Phone */}
                        <PhoneInput
                            label="Phone"
                            value={phone}
                            onChange={onPhone}
                            defaultCountry="Lebanon"
                            variant={phoneError ? 'error' : 'normal'}
                            message={phoneError}
                        />

                        {/* Email */}
                        <CustomInput
                            label="Email"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={onEmail}
                            type="email"
                            variant={emailError ? 'error' : 'normal'}
                            message={emailError}
                            messageIcon={<Ionicons name="alert-circle-outline" size={16} color={colors.error} />}
                        // autoCapitalize="none"
                        />

                        {/* Password */}
                        <CustomInput
                            label="Password"
                            placeholder="Create a password"
                            value={password}
                            onChangeText={onPassword}
                            type="password"
                            variant={passwordError ? 'error' : 'normal'}
                            message={passwordError}
                            messageIcon={<Ionicons name="alert-circle-outline" size={16} color={colors.error} />}
                        />
                    </View>

                    {/* Continue CTA */}
                    <View style={{ height: spacing[24] }} />
                    <Button
                        text="Continue"
                        variant={'primary'}
                        fullWidth
                        onPress={onContinue}
                        disabled={!canContinue}
                    />

                    {/* Already have an account? */}
                    <View style={styles.signupRow}>
                        <CustomText variant="text-body-sm-r" style={styles.signupText}>
                            Have an account?
                        </CustomText>
                        <Pressable onPress={goLogin} accessibilityRole="button" accessibilityLabel="Go to login">
                            <CustomText variant="text-body-sm-m" style={styles.signupLink}>
                                Login
                            </CustomText>
                        </Pressable>
                    </View>
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
}

const pill = {
    borderRadius: radius.r100,
    backgroundColor: colors.white,
    ...shadow(0),
};

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.white,
    },
    headerRow: {
        paddingHorizontal: spacing[24],
        paddingTop: spacing[12],
    },
    bg: { flex: 1 },
    bgImage: { resizeMode: 'cover' },
    backBtn: {
        width: 48,
        height: 48,
        display: 'flex',
        borderRadius: radius.r100,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.neutral201,
        // borderWidth: 1,
        // borderColor: colors.neutral200,
    },
    container: {
        flex: 1,
        paddingHorizontal: spacing[24],
        paddingTop: spacing[16],
    },
    inputsContainer: {
        marginBottom: spacing[8],
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[16],
    },
    title: {
        color: colors.primary,
        marginBottom: spacing[24],
    },
    signupRow: {
        marginTop: spacing[16],
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing[6],
    },
    signupText: { color: colors.neutral800 },
    signupLink: { color: colors.secondary70, textDecorationLine: 'underline' },
});