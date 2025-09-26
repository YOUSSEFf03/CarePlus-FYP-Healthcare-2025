import React from 'react';
import { View, Text, StyleSheet, Image, ImageBackground } from 'react-native';
import Button from '../../src/components/Button';
import CustomText from '../../src/components/CustomText';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fontFamily, fontSize, spacing, radius, shadow } from '../../src/styles/tokens';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../App';

interface WelcomeProps {
    onLoginPress?: () => void;
    onCreateAccountPress?: () => void;
}

type RootNav = NativeStackNavigationProp<RootStackParamList>;

export default function Welcome({ onLoginPress, onCreateAccountPress }: WelcomeProps) {
    const navigation = useNavigation<RootNav>();

    const goLogin = () => {
        if (onLoginPress) return onLoginPress();
        navigation.navigate('AuthStack', { screen: 'Login' });
    };

    const goCreate = () => {
        if (onCreateAccountPress) return onCreateAccountPress();
        navigation.navigate('AuthStack', { screen: 'Signup' });
    };

    return (
        <SafeAreaView style={styles.safe} edges={['bottom']}>
            <ImageBackground
                source={require('../../assets/images/welcome-bg.png')}
                style={styles.bg}
                imageStyle={styles.bgImage}
            >
                <StatusBar style="light" translucent backgroundColor="transparent" />
                <View style={styles.container}>
                    <View style={styles.topBlock}>
                        {/* Brand mark / illustration (swap with your asset when ready) */}
                        <Image source={require('../../assets/logo_primary.png')} style={styles.logo} resizeMode="contain" />

                        {/* Hero card */}
                        <View style={styles.heroCard}>
                            {/* <View style={styles.heroBadge}>
                            <CustomText variant="text-body-sm-r" style={styles.heroBadgeText}>FYP • Healthcare</CustomText>
                        </View> */}

                            <View>
                                <CustomText variant="text-heading-H1" style={styles.title}>Welcome</CustomText>
                                <CustomText variant="text-body-lg-r" style={styles.subtitle}>
                                    Book appointments, manage treatments, and fill prescriptions — all in one place.
                                </CustomText>
                                <Image source={require('../../assets/images/welcome_image.png')} style={styles.illustration} />
                            </View>

                            {/* CTA block — buttons stay where they are */}
                            <View style={styles.ctaBlock}>
                                <Button
                                    text="Login to your account"
                                    variant="primary"
                                    fullWidth
                                    onPress={goLogin}
                                // accessibilityLabel="Login to your account"
                                />

                                <View style={{ height: spacing[12] }} />

                                <Button
                                    text="Create an account"
                                    variant="tertiary"
                                    fullWidth
                                    onPress={goCreate}
                                // accessibilityLabel="Create a new account"
                                />

                                <CustomText variant="text-body-md-r" style={styles.helperText}>
                                    New here? Creating an account takes less than a minute.
                                </CustomText>
                            </View>
                        </View>
                    </View>
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        // backgroundColor: colors.white,
        backgroundColor: 'transparent',
    },
    container: {
        flex: 1,
        paddingTop: spacing[24], // 24px as requested
        // justifyContent: 'space-between',
    },
    /* ---------- Background blobs ---------- */
    bg: {
        flex: 1,
    },
    bgImage: {
        // keep aspect, cover entire screen
        resizeMode: 'cover',
    },

    /* ---------- Content ---------- */
    topBlock: {
        flex: 1,
        alignItems: 'center',
        marginTop: spacing[24],
        alignSelf: 'stretch',
        gap: spacing[90],
    },
    logo: {
        marginTop: spacing[56],
        width: 180,
        // height: 96,
        // marginBottom: spacing[24],
    },
    heroCard: {
        backgroundColor: colors.white,
        borderTopLeftRadius: radius.r50,
        borderTopRightRadius: radius.r50,
        paddingVertical: spacing[24],
        paddingHorizontal: spacing[24],
        alignSelf: 'stretch',
        flex: 1,                        // <— fill to bottom
        justifyContent: 'space-between',
    },
    heroBadge: {
        alignSelf: 'flex-start',
        backgroundColor: colors.secondary10,
        paddingHorizontal: spacing[10],
        paddingVertical: spacing[6],
        borderRadius: radius.r100,
        marginBottom: spacing[12],
    },
    heroBadgeText: {
        fontFamily: fontFamily.redHatRegular,
        fontSize: fontSize.s12,
        color: colors.secondary90,
    },
    title: {
        fontFamily: fontFamily.redHatBold,
        fontSize: fontSize.s32,
        color: colors.primary,
        textAlign: 'left',
    },
    subtitle: {
        marginTop: spacing[12],
        fontFamily: fontFamily.redHatRegular,
        fontSize: fontSize.s16,
        // textAlign: 'justify',
        width: '100%',
        color: colors.neutral800,
        lineHeight: 24,
    },
    illustration: {
        width: '100%',
        height: 200,
        marginTop: spacing[24],
        borderRadius: radius.r16,
        backgroundColor: colors.secondary05,
    },

    ctaBlock: {
        alignSelf: 'stretch',
        marginBottom: spacing[32],
        marginTop: spacing[32],
    },
    helperText: {
        marginTop: spacing[12],
        textAlign: 'center',
        fontFamily: fontFamily.redHatRegular,
        fontSize: fontSize.s14,
        color: colors.neutral700,
    },
});