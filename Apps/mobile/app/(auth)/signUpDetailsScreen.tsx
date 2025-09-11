import React, { useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, ImageBackground, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Button from '@/components/Button';
import CustomText from '@/components/CustomText';
import CustomInput from '@/components/CustomInput';
import { colors, fontFamily, fontSize, radius, shadow, spacing } from '@/styles/tokens';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { RootStackParamList } from '../../App';
import type { SignupDraft } from '../../App';
import { useSignupDraft } from '@/context/SignupDraftContext';

type RootNav = NativeStackNavigationProp<RootStackParamList>;

type SignUpDetailsRoute = RouteProp<
    { params: { fullName?: string; phone?: string; email?: string } },
    'params'
>;

export default function SignUpDetailsScreen() {
    const navigation = useNavigation<RootNav>();
    const { draft, update } = useSignupDraft();
    const route = useRoute<SignUpDetailsRoute>();
    const { fullName, phone, email } = route.params ?? {};

    const [showPicker, setShowPicker] = useState(false);
    const [dob, setDob] = useState<Date | undefined>(
        draft.dob ? new Date(draft.dob) : undefined
    );
    const [gender, setGender] = useState<'male' | 'female' | undefined>(draft.gender);
    const [history, setHistory] = useState(draft.history ?? '');

    const onPickDate = (_e: any, date?: Date) => {
        if (Platform.OS !== 'ios') setShowPicker(false);
        if (!date) return; // ignore dismiss
        setDob(date);
        update({ dob: date.toISOString() });
    };

    const onSelectGender = (g: 'male' | 'female') => {
        setGender(g);
        update({ gender: g });
    };

    const onHistory = (t: string) => {
        setHistory(t);
        update({ history: t });
    };

    const dobDisplay = useMemo(() => {
        if (!dob) return '';
        const mm = `${dob.getMonth() + 1}`.padStart(2, '0');
        const dd = `${dob.getDate()}`.padStart(2, '0');
        const yyyy = dob.getFullYear();
        return `${yyyy}-${mm}-${dd}`;
    }, [dob]);

    const isDobValid = !!dob;
    const isGenderValid = gender !== undefined;
    const canContinue = isDobValid && isGenderValid;

    const goBack = () => {
        if (navigation.canGoBack()) navigation.goBack();
    };

    const onContinue = () => {
        navigation.navigate('AuthStack', { screen: 'SignUpReview' } as any);
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
                    <CustomText variant="text-heading-H1" style={styles.title}>A few more details</CustomText>

                    <View style={styles.inputsContainer}>
                        {/* Date of birth */}
                        <CustomInput
                            label="Date of birth"
                            placeholder="YYYY-MM-DD"
                            value={dobDisplay}
                            onChangeText={() => { }}
                            rightIcon={
                                <Pressable onPress={() => setShowPicker(true)} hitSlop={8}>
                                    <Ionicons name="calendar-outline" size={20} color={colors.neutral700} />
                                </Pressable>
                            }
                        />
                        {showPicker && (
                            <DateTimePicker
                                mode="date"
                                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                value={dob ?? new Date(1990, 0, 1)}
                                onChange={onPickDate}
                                maximumDate={new Date()} // no future DOBs
                            />
                        )}

                        {/* Gender */}
                        <View style={{ gap: spacing[4] }}>
                            <CustomText variant="text-body-md-sb" style={{ color: colors.primary }}>Gender</CustomText>
                            <View style={styles.genderRow}>
                                {(['male', 'female'] as const).map(g => {
                                    const active = gender === g;
                                    const icon = g === 'male' ? 'man-outline' : 'woman-outline';
                                    return (
                                        <Pressable
                                            key={g}
                                            onPress={() => onSelectGender(g)}
                                            style={[styles.genderPill, active && styles.genderPillActive]}
                                            accessibilityRole="button"
                                            accessibilityLabel={`Select ${g}`}
                                        >
                                            <Ionicons
                                                name={icon as any}
                                                size={18}
                                                color={active ? colors.secondary70 : colors.neutral700}
                                            />
                                            <CustomText
                                                variant="text-body-sm-m"
                                                style={[styles.genderText, active && styles.genderTextActive]}
                                            >
                                                {g[0].toUpperCase() + g.slice(1)}
                                            </CustomText>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Medical history */}
                        <CustomInput
                            label="Medical history"
                            as="textarea"
                            placeholder="List any conditions, allergies, surgeries, or medications..."
                            value={history}
                            onChangeText={onHistory}
                            rows={5}
                            maxLength={1000}
                            optional
                        />
                    </View>

                    {/* Finish CTA */}
                    <View style={{ height: spacing[24] }} />
                    <Button text="Continue" variant="primary" fullWidth onPress={onContinue} disabled={!canContinue} />
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
        // borderWidth: 1,
        // borderColor: colors.neutral200,
    },
    container: { flex: 1, paddingHorizontal: spacing[24], paddingTop: spacing[16] },
    inputsContainer: {
        marginBottom: spacing[8],
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[16],
    },
    title: { color: colors.primary, marginBottom: spacing[24] },
    genderRow: {
        flexDirection: 'row',
        gap: spacing[8],
    },
    genderPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[4],
        paddingHorizontal: spacing[16],
        paddingVertical: spacing[4],
        borderRadius: radius.r50,
        borderWidth: 1,
        borderColor: colors.neutral300,
        backgroundColor: colors.white,
    },
    genderPillActive: {
        borderColor: colors.secondary70,
        backgroundColor: colors.secondary05,
    },
    genderText: { color: colors.primary, marginTop: 2 },
    genderTextActive: { color: colors.secondary70 },
});