import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ImageBackground, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomText from '@/components/CustomText';
import Button from '@/components/Button';
import PhoneInput from '@/components/PhoneInput.native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize, radius, shadow, spacing } from '@/styles/tokens';
import type { RootStackParamList } from '../../App';
import { useUser } from '@/store/UserContext';
import authService from '@/services/authService';

type RootNav = NativeStackNavigationProp<RootStackParamList>;

export default function PhoneLoginScreen() {
    const navigation = useNavigation<RootNav>();
    const { setUser } = useUser();
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const goBack = () => {
        if (navigation.canGoBack()) navigation.goBack();
        else navigation.navigate('AuthStack', { screen: 'Login' } as any);
    };

    const handlePhoneLogin = async () => {
        if (!phone.trim()) {
            Alert.alert('Error', 'Please enter your phone number');
            return;
        }

        // Basic phone validation
        const phoneRegex = /^\+\d{6,15}$/;
        if (!phoneRegex.test(phone)) {
            Alert.alert('Error', 'Please enter a valid phone number');
            return;
        }

        setIsLoading(true);
        try {
            // Send OTP to phone number
            const response = await authService.sendPhoneOtp(phone);
            
            if (response.success) {
                // Navigate to OTP verification screen
                navigation.navigate('AuthStack', {
                    screen: 'VerifyPhoneOtp',
                    params: {
                        phone: phone,
                        loginType: 'phone'
                    }
                } as any);
            } else {
                Alert.alert('Error', response.message || 'Failed to send OTP');
            }
        } catch (error) {
            console.error('Phone login error:', error);
            Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to send OTP. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
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
                    <CustomText variant="text-heading-H1" style={styles.title}>
                        Login with Phone
                    </CustomText>
                    
                    <CustomText variant="text-body-md-r" style={styles.subtitle}>
                        Enter your phone number to receive a verification code via WhatsApp
                    </CustomText>

                    <View style={styles.inputContainer}>
                        <PhoneInput
                            label="Phone Number"
                            value={phone}
                            onChange={setPhone}
                            defaultCountry="Lebanon"
                            variant="normal"
                            message="We'll send you a verification code via WhatsApp"
                        />
                    </View>

                    <View style={styles.buttonContainer}>
                        <Button
                            text={isLoading ? "Sending OTP..." : "Send OTP"}
                            variant="primary"
                            fullWidth
                            onPress={handlePhoneLogin}
                            disabled={isLoading || !phone.trim()}
                        />
                    </View>

                    <View style={styles.footer}>
                        <CustomText variant="text-body-sm-r" style={styles.footerText}>
                            By continuing, you agree to our Terms of Service and Privacy Policy
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
    inputContainer: {
        marginBottom: spacing[24],
    },
    buttonContainer: {
        marginBottom: spacing[24],
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
