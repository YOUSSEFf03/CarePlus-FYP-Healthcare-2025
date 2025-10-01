import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Pressable, ImageBackground, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomText from '@/components/CustomText';
import Button from '@/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize, radius, shadow, spacing } from '@/styles/tokens';
import type { RootStackParamList } from '../../App';
import { useUser } from '@/store/UserContext';
import authService from '@/services/authService';

type RootNav = NativeStackNavigationProp<RootStackParamList>;
type VerifyPhoneOtpRoute = RouteProp<RootStackParamList, 'VerifyPhoneOtp'>;

export default function VerifyPhoneOtpScreen() {
    const navigation = useNavigation<RootNav>();
    const route = useRoute<VerifyPhoneOtpRoute>();
    const { phone, loginType } = route.params;
    const { setUser } = useUser();
    
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [canResend, setCanResend] = useState(false);
    
    const inputRefs = useRef<TextInput[]>([]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [timeLeft]);

    const goBack = () => {
        if (navigation.canGoBack()) navigation.goBack();
        else navigation.navigate('AuthStack', { screen: 'Login' } as any);
    };

    const handleOtpChange = (value: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOtp = async () => {
        const otpString = otp.join('');
        
        if (otpString.length !== 6) {
            Alert.alert('Error', 'Please enter the complete 6-digit code');
            return;
        }

        setIsVerifying(true);
        try {
            const response = await authService.verifyPhoneOtp(phone, otpString);
            
            if (response.success) {
                // Store auth data
                await authService.storeAuthData(response.data);
                
                // Update user context
                setUser({
                    id: response.data.user.id,
                    name: response.data.user.name,
                    age: response.data.user.date_of_birth 
                        ? new Date().getFullYear() - new Date(response.data.user.date_of_birth).getFullYear()
                        : 0,
                    sex: (response.data.user.gender as 'male' | 'female') || 'unknown',
                    phone: response.data.user.phone,
                    email: response.data.user.email,
                    dateOfBirth: response.data.user.date_of_birth,
                    medicalHistory: response.data.user.medical_history,
                    role: response.data.user.role,
                });

                // Navigate to main app
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Tabs', params: { screen: 'Home' } }],
                });
            } else {
                Alert.alert('Error', response.message || 'Invalid verification code');
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Verification failed. Please try again.'
            );
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendOtp = async () => {
        setIsResending(true);
        try {
            const response = await authService.sendPhoneOtp(phone);
            
            if (response.success) {
                setTimeLeft(60);
                setCanResend(false);
                Alert.alert('Success', 'New verification code sent to your WhatsApp');
            } else {
                Alert.alert('Error', response.message || 'Failed to resend OTP');
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
            Alert.alert('Error', 'Failed to resend OTP. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    const isOtpComplete = otp.every(digit => digit !== '');

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
                    <CustomText variant="text-heading-H1" style={styles.title}>
                        Verify Phone Number
                    </CustomText>
                    
                    <CustomText variant="text-body-md-r" style={styles.subtitle}>
                        We've sent a 6-digit code to{'\n'}
                        <CustomText variant="text-body-md-m" style={styles.phoneNumber}>
                            {phone}
                        </CustomText>
                    </CustomText>

                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => {
                                    if (ref) inputRefs.current[index] = ref;
                                }}
                                style={[
                                    styles.otpInput,
                                    digit ? styles.otpInputFilled : null
                                ]}
                                value={digit}
                                onChangeText={(value) => handleOtpChange(value, index)}
                                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                                keyboardType="numeric"
                                maxLength={1}
                                selectTextOnFocus
                            />
                        ))}
                    </View>

                    <View style={styles.buttonContainer}>
                        <Button
                            text={isVerifying ? "Verifying..." : "Verify Code"}
                            variant="primary"
                            fullWidth
                            onPress={handleVerifyOtp}
                            disabled={!isOtpComplete || isVerifying}
                        />
                    </View>

                    <View style={styles.resendContainer}>
                        {canResend ? (
                            <Pressable onPress={handleResendOtp} disabled={isResending}>
                                <CustomText variant="text-body-md-m" style={styles.resendText}>
                                    {isResending ? "Resending..." : "Resend Code"}
                                </CustomText>
                            </Pressable>
                        ) : (
                            <CustomText variant="text-body-sm-r" style={styles.timerText}>
                                Resend code in {timeLeft}s
                            </CustomText>
                        )}
                    </View>

                    <View style={styles.footer}>
                        <CustomText variant="text-body-sm-r" style={styles.footerText}>
                            Didn't receive the code? Check your WhatsApp messages
                        </CustomText>
                    </View>
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.white },
    bg: { flex: 1 },
    bgImage: { resizeMode: 'cover' },
    headerRow: { 
        paddingHorizontal: spacing[24], 
        paddingTop: spacing[12] 
    },
    backBtn: {
        width: 48,
        height: 48,
        display: 'flex',
        borderRadius: radius.r100,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.neutral201,
    },
    container: { 
        flex: 1, 
        paddingHorizontal: spacing[24], 
        paddingTop: spacing[32] 
    },
    title: { 
        color: colors.primary, 
        marginBottom: spacing[8],
        textAlign: 'center'
    },
    subtitle: {
        color: colors.neutral600,
        textAlign: 'center',
        marginBottom: spacing[32],
        lineHeight: 20,
    },
    phoneNumber: {
        color: colors.primary,
        fontFamily: fontFamily.medium,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing[32],
        paddingHorizontal: spacing[8],
    },
    otpInput: {
        width: 45,
        height: 55,
        borderWidth: 2,
        borderColor: colors.neutral300,
        borderRadius: radius.r8,
        textAlign: 'center',
        fontSize: fontSize[20],
        fontFamily: fontFamily.bold,
        color: colors.primary,
        backgroundColor: colors.white,
    },
    otpInputFilled: {
        borderColor: colors.primary,
        backgroundColor: colors.primary05,
    },
    buttonContainer: {
        marginBottom: spacing[24],
    },
    resendContainer: {
        alignItems: 'center',
        marginBottom: spacing[24],
    },
    resendText: {
        color: colors.primary,
        textDecorationLine: 'underline',
    },
    timerText: {
        color: colors.neutral500,
    },
    footer: {
        alignItems: 'center',
    },
    footerText: {
        color: colors.neutral500,
        textAlign: 'center',
        lineHeight: 18,
    },
});
