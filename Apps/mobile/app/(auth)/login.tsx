import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ImageBackground, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Button from '@/components/Button';
import CustomText from '@/components/CustomText';
import CustomInput from '@/components/CustomInput';
import { colors, fontFamily, fontSize, radius, shadow, spacing } from '@/styles/tokens';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList, AuthStackParamList } from '../../App';
import { useUser } from '@/store/UserContext';

type RootNav = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
    const navigation = useNavigation<RootNav>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const { setUser } = useUser();

    const goBack = () => {
        if (navigation.canGoBack()) navigation.goBack();
        else navigation.navigate('OnboardingStack'); // fallback
    };

    const goForgot = () => {
        // Needs AuthStackParamList to contain `ForgotPassword`
        navigation.navigate('AuthStack', { screen: 'ForgotPassword' } as any);
    };

    const goPhoneLogin = () => {
        // Needs AuthStackParamList to contain `LoginPhone`
        navigation.navigate('AuthStack', { screen: 'LoginPhone' } as any);
    };

    const onLogin = () => {
        if (email === "patient@demo.com" && password === "patient123") {
            // set demo patient profile
            setUser({
                id: "demo-patient-001",
                name: "Demo Patient",
                age: 29,
                sex: "female",
                phone: "+96170000000"
            });

            navigation.reset({
                index: 0,
                routes: [{ name: 'Tabs', params: { screen: 'Home' } }],
            });
        } else {
            Alert.alert("Login failed", "Invalid email or password");
        }
    };

    const goSignUp = () => {
        navigation.navigate('AuthStack', { screen: 'Signup' } as any);
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
                        {/* <CustomText variant="text-heading-H4" style={{ textAlign: 'center' }}>{'\u2039'}</CustomText> */}
                        <Ionicons name="chevron-back-outline" size={24} style={{ color: '#050f2a' }} />
                    </Pressable>
                </View>

                <View style={styles.container}>
                    <CustomText variant="text-heading-H1" style={styles.title}>Login</CustomText>

                    <View style={styles.inputsContainer}>
                        {/* Email */}
                        <CustomInput
                            label="Email"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            type="email"
                        />

                        {/* Password */}
                        <CustomInput
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            type="password"
                        />

                        {/* Row: remember me + forgot */}
                        <View style={styles.optionsRow}>
                            <Pressable style={styles.rememberRow} onPress={() => setRemember(r => !r)}>
                                <View style={styles.checkbox}>
                                    <View style={[styles.checkboxInside, remember && styles.checkboxChecked]}></View>
                                </View>
                                <CustomText variant="text-body-sm-r" style={styles.rememberText}>Remember me</CustomText>
                            </Pressable>

                            <Pressable onPress={goForgot}>
                                <CustomText variant="text-body-sm-m" style={styles.link}>Forgot Password?</CustomText>
                            </Pressable>
                        </View>
                    </View>

                    {/* Login CTA */}
                    <View style={{ height: spacing[8] }} />
                    <Button text="Login" variant="primary" fullWidth onPress={onLogin} />

                    {/* Divider */}
                    <View style={styles.dividerRow}>
                        <View style={styles.divider} />
                        <CustomText variant="text-body-sm-r" style={styles.dividerText}>Or</CustomText>
                        <View style={styles.divider} />
                    </View>

                    {/* Phone login */}
                    <Button
                        text="Login using your phone number"
                        variant="secondary"
                        fullWidth
                        iconLeft={
                            <Ionicons name="call-outline" size={24} color={colors.primary} />
                        }
                        onPress={goPhoneLogin}
                    />

                    {/* NEW: Sign up prompt */}
                    <View style={styles.signupRow}>
                        <CustomText variant="text-body-sm-r" style={styles.signupText}>
                            Don’t have an account?
                        </CustomText>
                        <Pressable onPress={goSignUp} accessibilityRole="button" accessibilityLabel="Create an account">
                            <CustomText variant="text-body-sm-m" style={styles.signupLink}>
                                Create one
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
    bg: {
        flex: 1,
    },
    bgImage: {
        // keep aspect, cover entire screen
        resizeMode: 'cover',
    },
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
    label: {
        color: colors.black,
        marginBottom: spacing[8],
    },
    inputWrap: {
        ...pill,
        borderWidth: 1,
        borderColor: colors.neutral300,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[16],
        height: 52,
        marginBottom: spacing[16],
    },
    input: {
        flex: 1,
        fontFamily: fontFamily.poppinsRegular,
        fontSize: fontSize.s15,
        color: colors.black,
    },
    eyeBtn: {
        paddingVertical: spacing[6],
        paddingLeft: spacing[12],
    },
    optionsRow: {
        marginTop: spacing[4],
        marginBottom: spacing[12],
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rememberRow: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.primary,
        marginRight: spacing[8],
        backgroundColor: 'transparent',
    },
    checkboxInside: {
        flex: 1,
        margin: 2,
        borderRadius: 10,
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
        borderRadius: 10,
    },
    rememberText: {
        color: colors.primary,
        marginBottom: -5
    },
    link: {
        color: colors.neutral800,
        marginTop: 4
    },
    dividerRow: {
        marginVertical: spacing[24],
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[12],
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: colors.neutral300,
    },
    dividerText: {
        color: colors.neutral700,
    },
    signupRow: {
        marginTop: spacing[16],
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing[6],
    },
    signupText: {
        color: colors.neutral800,
    },
    signupLink: {
        color: colors.secondary70,
        textDecorationLine: 'underline',
    },
});