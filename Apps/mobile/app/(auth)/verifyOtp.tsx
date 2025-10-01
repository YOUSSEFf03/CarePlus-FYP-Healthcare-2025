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
import authService from '@/services/authService';

type RootNav = NativeStackNavigationProp<RootStackParamList>;
type VerifyOtpRoute = RouteProp<{ VerifyOtp: { email: string; phone: string } }, 'VerifyOtp'>;

export default function VerifyOtpScreen() {
    const navigation = useNavigation<RootNav>();
    const route = useRoute<VerifyOtpRoute>();
    const { email, phone } = route.params;

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const inputRefs = useRef<TextInput[]>([]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

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

    const onVerify = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            Alert.alert('Error', 'Please enter the complete 6-digit code');
            return;
        }

        setIsVerifying(true);
        try {
            // Call verify OTP API
            const response = await authService.verifyOtp(email, otpCode);
            
            if (response.success) {
                Alert.alert('Success', 'Account verified successfully!', [
                    {
                        text: 'OK',
                        onPress: () => {
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Tabs', params: { screen: 'Home' } }],
                            });
                        },
                    },
                ]);
            } else {
                Alert.alert('Error', response.message || 'Verification failed');
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            Alert.alert('Error', 'Verification failed. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    const onResendOtp = async () => {
        setIsResending(true);
        try {
            const response = await authService.resendOtp(email);
            if (response.success) {
                Alert.alert('Success', 'OTP sent successfully!');
                setTimeLeft(60);
                setCanResend(false);
                setOtp(['', '', '', '', '', '']);
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

    const goBack = () => {
        navigation.goBack();
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
                    <CustomText variant="text-heading-H1" style={styles.title}>Verify your account</CustomText>
                    
                    <CustomText variant="text-body-md-r" style={styles.subtitle}>
                        We've sent a 6-digit code to:
                    </CustomText>
                    
                    <CustomText variant="text-body-md-m" style={styles.email}>
                        {email}
                    </CustomText>
                    
                    {phone && (
                        <CustomText variant="text-body-md-m" style={styles.phone}>
                            {phone}
                        </CustomText>
                    )}

                    {/* OTP Input */}
                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => {
                                    if (ref) inputRefs.current[index] = ref;
                                }}
                                style={[
                                    styles.otpInput,
                                    digit ? styles.otpInputFilled : null,
                                ]}
                                value={digit}
                                onChangeText={(value) => handleOtpChange(value, index)}
                                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                                keyboardType="numeric"
                                maxLength={1}
                                textAlign="center"
                                selectTextOnFocus
                            />
                        ))}
                    </View>

                    {/* Resend OTP */}
                    <View style={styles.resendContainer}>
                        {canResend ? (
                            <Pressable onPress={onResendOtp} disabled={isResending}>
                                <CustomText variant="text-body-sm-m" style={styles.resendText}>
                                    {isResending ? 'Sending...' : 'Resend OTP'}
                                </CustomText>
                            </Pressable>
                        ) : (
                            <CustomText variant="text-body-sm-r" style={styles.timerText}>
                                Resend OTP in {timeLeft}s
                            </CustomText>
                        )}
                    </View>

                    {/* Verify Button */}
                    <View style={{ height: spacing[24] }} />
                    <Button
                        text={isVerifying ? "Verifying..." : "Verify"}
                        variant="primary"
                        fullWidth
                        onPress={onVerify}
                        disabled={!isOtpComplete || isVerifying}
                    />

                    {/* Help Text */}
                    <View style={styles.helpContainer}>
                        <CustomText variant="text-body-sm-r" style={styles.helpText}>
                            Didn't receive the code? Check your spam folder or try resending.
                        </CustomText>
                    </View>
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.white },
    headerRow: { paddingHorizontal: spacing[24], paddingTop: spacing[12] },
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
    },
    container: { flex: 1, paddingHorizontal: spacing[24], paddingTop: spacing[16] },
    title: { color: colors.primary, marginBottom: spacing[16] },
    subtitle: { 
        color: colors.neutral700, 
        marginBottom: spacing[8],
        textAlign: 'center',
    },
    email: { 
        color: colors.primary, 
        marginBottom: spacing[4],
        textAlign: 'center',
        fontWeight: '600',
    },
    phone: { 
        color: colors.primary, 
        marginBottom: spacing[24],
        textAlign: 'center',
        fontWeight: '600',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing[24],
        paddingHorizontal: spacing[8],
    },
    otpInput: {
        width: 45,
        height: 55,
        borderWidth: 2,
        borderColor: colors.neutral300,
        borderRadius: radius.r8,
        backgroundColor: colors.white,
        fontSize: fontSize[20],
        fontWeight: '600',
        color: colors.primary,
    },
    otpInputFilled: {
        borderColor: colors.secondary70,
        backgroundColor: colors.secondary05,
    },
    resendContainer: {
        alignItems: 'center',
        marginBottom: spacing[16],
    },
    resendText: {
        color: colors.secondary70,
        textDecorationLine: 'underline',
    },
    timerText: {
        color: colors.neutral500,
    },
    helpContainer: {
        marginTop: spacing[16],
        alignItems: 'center',
    },
    helpText: {
        color: colors.neutral600,
        textAlign: 'center',
        lineHeight: 20,
    },
});
