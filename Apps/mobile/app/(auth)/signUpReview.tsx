// app/(auth)/signUpReview.tsx
import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomText from '@/components/CustomText';
import Button from '@/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize, radius, shadow, spacing } from '@/styles/tokens';
import type { RootStackParamList, SignupDraft } from '../../App';
import { useSignupDraft } from '@/context/SignupDraftContext';

type RootNav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<{ SignUpReview: { draft: SignupDraft } }, 'SignUpReview'>;

export default function SignUpReviewScreen() {
    const navigation = useNavigation<RootNav>();
    const { draft, reset } = useSignupDraft();
    const route = useRoute<R>();
    // const draft = route.params?.draft;

    const dobDisplay = useMemo(() => {
        if (!draft?.dob) return '—';
        const d = new Date(draft.dob);
        const mm = `${d.getMonth() + 1}`.padStart(2, '0');
        const dd = `${d.getDate()}`.padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${yyyy}-${mm}-${dd}`;
    }, [draft?.dob]);

    const goBack = () => {
        if (navigation.canGoBack()) navigation.goBack();
    };

    const editDetails = () => {
        // Back to details screen (keeps state)
        navigation.goBack();
    };

    const editBasic = () => {
        // Pop back 2 screens to the Signup (basic info) form
        navigation.pop(2);
    };

    const onCreate = () => {
        // use `draft` to submit to API
        // if success:
        reset();
        // then go to Tabs (or wherever)
    };

    const requiredOk = !!draft?.gender && !!draft?.dob && !!draft?.fullName && !!draft?.phone && !!draft?.email;

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
                    <CustomText variant="text-heading-H1" style={styles.title}>Review your details</CustomText>

                    <View style={styles.card}>
                        <Row label="Full name" value={draft?.fullName || '—'} />
                        <Row label="Phone" value={draft?.phone || '—'} />
                        <Row label="Email" value={draft?.email || '—'} />
                        <Row label="Date of birth" value={dobDisplay} />
                        <Row label="Gender" value={draft?.gender ? (draft.gender[0].toUpperCase() + draft.gender.slice(1)) : '—'} />
                        <Row label="Medical history" value={draft?.history || '—'} multiline />
                    </View>

                    <View style={{ height: spacing[16] }} />
                    <View style={styles.editRow}>
                        <Button text="Edit basic info" variant="secondary" onPress={() => navigation.navigate('AuthStack', { screen: 'Signup' } as any)} />
                        <Button text="Edit details" variant="secondary" onPress={() => navigation.navigate('AuthStack', { screen: 'SignUpDetails' } as any)} />
                    </View>

                    <View style={{ height: spacing[16] }} />
                    <Button
                        text="Create account"
                        variant="primary"
                        fullWidth
                        onPress={onCreate}
                        disabled={!requiredOk}
                    />
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
}

function Row({
    label,
    value,
    multiline,
}: {
    label: string;
    value: string;
    multiline?: boolean;
}) {
    return (
        <View style={rowStyles.row}>
            <CustomText variant="text-body-sm-r" style={rowStyles.label}>{label}</CustomText>
            <CustomText
                variant="text-body-md-m"
                style={[rowStyles.value, multiline && { lineHeight: 20 }]}
                numberOfLines={multiline ? 0 : 1}
            >
                {value}
            </CustomText>
        </View>
    );
}

const rowStyles = StyleSheet.create({
    row: {
        paddingVertical: spacing[10],
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral200,
    },
    label: { color: colors.neutral700, marginBottom: 2 },
    value: { color: colors.primary },
});

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
    card: {
        borderRadius: radius.r16,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.neutral200,
        paddingHorizontal: spacing[16],
        paddingVertical: spacing[8],
        ...shadow(0),
    },
    editRow: {
        flexDirection: 'row',
        gap: spacing[12],
        justifyContent: 'space-between',
    },
});
