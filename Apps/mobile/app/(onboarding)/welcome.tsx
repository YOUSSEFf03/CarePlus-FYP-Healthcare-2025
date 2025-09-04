import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, StatusBar } from 'react-native';
import Button from '../../src/components/Button';
import CustomText from '../../src/components/CustomText';
import { colors, fontFamily, fontSize, spacing, radius, shadow } from '../../src/styles/tokens';

interface WelcomeProps {
    onLoginPress?: () => void;
    onCreateAccountPress?: () => void;
    navigation?: { navigate: (route: string) => void };
}

export default function Welcome({ navigation, onLoginPress, onCreateAccountPress }: WelcomeProps) {
    const goLogin = () => {
        if (onLoginPress) return onLoginPress();
        navigation?.navigate?.('Login');
    };

    const goCreate = () => {
        if (onCreateAccountPress) return onCreateAccountPress();
        navigation?.navigate?.('SignUp');
    };

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" />

            {/* Background decorations */}
            <View style={styles.bgDecor} pointerEvents="none">
                <View style={[styles.blob, styles.blobTopLeft]} />
                <View style={[styles.blob, styles.blobTopRight]} />
                <View style={[styles.blob, styles.blobBottom]} />
            </View>

            <View style={styles.container}>
                <View style={styles.topBlock}>
                    {/* Brand mark / illustration (swap with your asset when ready) */}
                    <Image source={require('../../assets/logo_primary.png')} style={styles.logo} resizeMode="contain" />

                    {/* Hero card */}
                    <View style={styles.heroCard}>
                        <View style={styles.heroBadge}>
                            <CustomText variant="text-body-sm-r" style={styles.heroBadgeText}>FYP • Healthcare</CustomText>
                        </View>

                        <CustomText variant="text-heading-H1" style={styles.title}>Welcome</CustomText>
                        <CustomText variant="text-body-lg-r" style={styles.subtitle}>
                            Book appointments, manage treatments, and fill prescriptions — all in one place.
                        </CustomText>

                        {/* Cute placeholder illustration (optional) */}
                        <Image source={require('../../assets/images/welcome_image.png')} style={styles.illustration} />
                    </View>
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.white,
    },
    container: {
        flex: 1,
        padding: spacing[24], // 24px as requested
        justifyContent: 'space-between',
    },
    /* ---------- Background blobs ---------- */
    bgDecor: {
        ...StyleSheet.absoluteFillObject,
    },
    blob: {
        position: 'absolute',
        width: 240,
        height: 240,
        borderRadius: 240,
        opacity: 0.4,
        filter: undefined as any, // keep RN happy if used on web
    },
    blobTopLeft: {
        backgroundColor: colors.secondary20,
        top: -80,
        left: -80,
    },
    blobTopRight: {
        backgroundColor: colors.tertiary20,
        top: -60,
        right: -60,
    },
    blobBottom: {
        backgroundColor: colors.secondary05,
        bottom: -100,
        left: -40,
        width: 300,
        height: 300,
    },

    /* ---------- Content ---------- */
    topBlock: {
        alignItems: 'center',
        marginTop: spacing[24],
    },
    logo: {
        width: 140,
        // height: 96,
        marginBottom: spacing[24],
    },
    heroCard: {
        backgroundColor: colors.white,
        borderRadius: radius.r24,
        paddingVertical: spacing[24],
        paddingHorizontal: spacing[20],
        alignSelf: 'stretch',
        ...shadow(1),
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
        marginTop: spacing[16],
        borderRadius: radius.r16,
        backgroundColor: colors.secondary05,
    },

    ctaBlock: {
        alignSelf: 'stretch',
        marginBottom: spacing[32],
    },
    helperText: {
        marginTop: spacing[12],
        textAlign: 'center',
        fontFamily: fontFamily.redHatRegular,
        fontSize: fontSize.s14,
        color: colors.neutral700,
    },
});