// PhoneInput.native.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    Image,
    Modal,
    FlatList,
    StyleSheet,
    Platform,
} from 'react-native';
import { colors, fontFamily, fontSize, radius, shadow, spacing } from '@/styles/tokens';
import { Ionicons } from '@expo/vector-icons';
import CustomText from './CustomText';
import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetBackdrop,
    BottomSheetFlatList,
} from '@gorhom/bottom-sheet';

type Variant = 'normal' | 'error' | 'disabled';

type CountryKey =
    | 'Australia'
    | 'France'
    | 'Germany'
    | 'Lebanon'
    | 'Netherlands'
    | 'Saudi Arabia'
    | 'Singapore'
    | 'Switzerland'
    | 'United Arab Emirates'
    | 'United States';

const MAX_LOCAL = 14;

type Country = {
    key: CountryKey;
    name: string;
    dial: string;
    iso2: string;
    nsnRegex: RegExp;
    mask: string;
    placeholder: string;
};

const RAW_COUNTRIES = [
    { key: 'Australia', name: 'Australia', dial: '+61', iso2: 'au', nsnRegex: /^\d{9}$/, mask: '### ### ###', placeholder: '### ### ###' },
    { key: 'Germany', name: 'Germany', dial: '+49', iso2: 'de', nsnRegex: /^\d{11}$/, mask: '### #### ####', placeholder: '### #### ####' },
    { key: 'France', name: 'France', dial: '+33', iso2: 'fr', nsnRegex: /^\d{9}$/, mask: '# ## ## ## ##', placeholder: '# ## ## ## ##' },
    { key: 'Lebanon', name: 'Lebanon', dial: '+961', iso2: 'lb', nsnRegex: /^\d{8}$/, mask: '## ### ###', placeholder: '## ### ###' }, // e.g., "03 123 456"
    { key: 'Netherlands', name: 'Netherlands', dial: '+31', iso2: 'nl', nsnRegex: /^\d{9}$/, mask: '#########', placeholder: '#########' },
    { key: 'Saudi Arabia', name: 'Saudi Arabia', dial: '+966', iso2: 'sa', nsnRegex: /^\d{9}$/, mask: '#########', placeholder: '#########' },
    { key: 'Singapore', name: 'Singapore', dial: '+65', iso2: 'sg', nsnRegex: /^\d{8}$/, mask: '########', placeholder: '########' },
    { key: 'Switzerland', name: 'Switzerland', dial: '+41', iso2: 'ch', nsnRegex: /^\d{9}$/, mask: '# ### ## ##', placeholder: '# ### ## ##' },
    { key: 'United Arab Emirates', name: 'United Arab Emirates', dial: '+971', iso2: 'ae', nsnRegex: /^\d{9}$/, mask: '## ### ####', placeholder: '## ### ####' },
    { key: 'United States', name: 'United States', dial: '+1', iso2: 'us', nsnRegex: /^\d{10}$/, mask: '(###) ###-####', placeholder: '(###) ###-####' },
] as const satisfies ReadonlyArray<Country>;

export const COUNTRIES: Country[] = [...RAW_COUNTRIES].sort((a, b) =>
    a.name.localeCompare(b.name)
);

const COUNTRY_MAX: Record<CountryKey, number> = {
    Australia: 9,
    France: 9,
    Germany: 11,
    Lebanon: 8,
    Netherlands: 9,
    'Saudi Arabia': 9,
    Singapore: 8,
    Switzerland: 9,
    'United Arab Emirates': 9,
    'United States': 10,
};

function normalizeDigits(value: string) {
    return value.replace(/\D+/g, '');
}

function groupTailBy3(d: string) {
    const parts: string[] = [];
    for (let i = 0; i < d.length; i += 3) parts.push(d.slice(i, i + 3));
    return parts.join(' ');
}

function applyMaskFlexible(digits: string, mask: string) {
    if (!digits.length) return '';
    let out = '';
    let i = 0;
    let seenSlot = false;

    for (const ch of mask) {
        if (ch === '#') {
            seenSlot = true;
            if (i < digits.length) out += digits[i++];
            else break;
        } else {
            if (!seenSlot || i > 0) out += ch;
        }
    }

    if (i < digits.length) {
        const tail = digits.slice(i);
        out += (out ? ' ' : '') + groupTailBy3(tail);
    }
    return out;
}

function buildE164(dial: string, localDigits: string) {
    return `${dial}${localDigits}`;
}

// --- asset resolver for flags (PNG) ---
// Place 10 PNGs in assets/flags: au.png, de.png, fr.png, lb.png, nl.png, sa.png,
// sg.png, ch.png, ae.png, us.png
const flagMap: Record<string, any> = {
    au: require('../../assets/flags/au.png'),
    de: require('../../assets/flags/de.png'),
    fr: require('../../assets/flags/fr.png'),
    lb: require('../../assets/flags/lb.png'),
    nl: require('../../assets/flags/nl.png'),
    sa: require('../../assets/flags/sa.png'),
    sg: require('../../assets/flags/sg.png'),
    ch: require('../../assets/flags/ch.png'),
    ae: require('../../assets/flags/ae.png'),
    us: require('../../assets/flags/us.png'),
};
function getFlagSource(iso2: string) {
    return flagMap[iso2 as keyof typeof flagMap];
}

export interface PhoneInputProps {
    label?: string;
    value: string; // E.164 like "+96103123456" or ""
    onChange: (value: string) => void;
    optional?: boolean;
    variant?: Variant;
    message?: string;
    defaultCountry?: CountryKey;
    disabled?: boolean;
}

export default function PhoneInput({
    label,
    value,
    onChange,
    optional,
    variant = 'normal',
    message,
    defaultCountry = 'Lebanon',
    disabled,
}: PhoneInputProps) {
    const fallbackCountry =
        useMemo(() => RAW_COUNTRIES.find(c => c.key === defaultCountry) || RAW_COUNTRIES[0], [defaultCountry]);

    const parsed = useMemo(() => {
        if (!value?.startsWith('+')) return { country: fallbackCountry, local: '' };
        const match = RAW_COUNTRIES
            .map(c => [c, value.startsWith(c.dial)] as const)
            .find(([, ok]) => ok);
        if (!match) return { country: fallbackCountry, local: '' };
        const [country] = match;
        const local = normalizeDigits(value.slice(country.dial.length));
        return { country, local };
    }, [value, fallbackCountry]);

    // const [open, setOpen] = useState(false);s
    const [country, setCountry] = useState<Country>(parsed.country);
    const [local, setLocal] = useState<string>(parsed.local);
    const [focused, setFocused] = useState(false);

    const sheetRef = useRef<BottomSheetModal>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const snapPoints = useMemo(() => ['45%', '80%'], []);

    // sync when parent value changes
    useEffect(() => {
        setCountry(parsed.country);
        setLocal(parsed.local);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parsed.country.key, parsed.local]);

    const isError = variant === 'error';
    const isDisabled = variant === 'disabled' || !!disabled;

    // live formatting for display
    const formattedLocal = useMemo(() => applyMaskFlexible(local, country.mask), [local, country.mask]);

    function presentSheet() {
        setSheetOpen(true);
        sheetRef.current?.present();
    }
    function dismissSheet() {
        sheetRef.current?.dismiss();
        setSheetOpen(false);
    }

    function selectCountry(c: Country) {
        setCountry(c);
        dismissSheet();
        onChange(buildE164(c.dial, normalizeDigits(local)));
    }

    function onLocalChange(text: string) {
        const raw = normalizeDigits(text);
        const maxLen = COUNTRY_MAX[country.key] ?? MAX_LOCAL;
        const digits = raw.slice(0, maxLen);
        setLocal(digits);
        onChange(`${country.dial}${digits}`);
    }

    const STRICT_COUNTRIES: Partial<Record<CountryKey, number>> = {
        'United States': 10,
    };

    const strictLen = STRICT_COUNTRIES[country.key];
    const maxLen = COUNTRY_MAX[country.key] ?? MAX_LOCAL;

    const invalidLocal =
        local.length > 0 &&
        ((strictLen != null && local.length !== strictLen) || local.length > maxLen);

    const finalMessage =
        message ??
        (invalidLocal
            ? strictLen
                ? `${country.name} numbers must be ${strictLen} digits.`
                : `Maximum ${maxLen} digits for ${country.name}.`
            : undefined);

    const renderBackdrop = (props: any) => (
        <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            pressBehavior="close"
        />
    );

    return (

        <View style={styles.container} pointerEvents={isDisabled ? 'none' : 'auto'}>
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

            <View style={[
                styles.inputWrap,
                isDisabled && styles.inputWrapDisabled,
                (focused || sheetOpen) && styles.inputWrapFocused,
                (isError || invalidLocal) && styles.inputWrapError,
            ]}>
                {/* Country selector */}
                <Pressable
                    style={styles.countryBtn}
                    onPress={presentSheet}
                    accessibilityRole="button"
                    accessibilityLabel="Select country"
                >
                    <Image source={getFlagSource(country.iso2)} style={styles.flag} resizeMode="cover" />
                    <Text style={styles.dial}>{country.dial}</Text>
                    <Ionicons name="chevron-down" size={16} color={colors.neutral700} />
                </Pressable>

                <View style={styles.divider} />

                {/* Local number input */}
                <TextInput
                    style={styles.input}
                    placeholder={country.placeholder}
                    placeholderTextColor={colors.neutral600}
                    keyboardType="phone-pad"
                    value={formattedLocal}
                    onChangeText={onLocalChange}
                    editable={!isDisabled}
                    autoComplete="tel"
                    accessibilityLabel="Phone number"
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                />
            </View>

            {/* Helper / error message */}
            {finalMessage ? (
                <View style={styles.messageRow}>
                    <Ionicons
                        name={(isError || invalidLocal) ? 'alert-circle-outline' : 'information-circle'}
                        size={18}
                        color={(isError || invalidLocal) ? colors.error : colors.neutral700}
                        style={{ marginRight: 6 }}
                    />
                    <Text style={[
                        styles.messageText,
                        (isError || invalidLocal) && { color: colors.error }
                    ]}>
                        {finalMessage}
                    </Text>
                </View>
            ) : null}

            {/* Country picker */}
            <BottomSheetModal
                ref={sheetRef}
                index={0}
                snapPoints={snapPoints}
                onDismiss={() => setSheetOpen(false)}
                backdropComponent={renderBackdrop}
                handleIndicatorStyle={{ backgroundColor: colors.neutral300 }}
                backgroundStyle={{ backgroundColor: colors.white }}
            >
                <View style={styles.sheetHeader}>
                    <Text style={styles.modalTitle}>Select country</Text>
                    <Pressable onPress={dismissSheet} hitSlop={10}>
                        <Ionicons name="close" size={20} color={colors.neutral700} />
                    </Pressable>
                </View>

                <BottomSheetFlatList
                    data={RAW_COUNTRIES}
                    keyExtractor={(item) => item.key}
                    renderItem={({ item }) => {
                        const active = item.key === country.key;
                        return (
                            <Pressable
                                onPress={() => selectCountry(item)}
                                style={[styles.optionRow, active && styles.optionActive]}
                            >
                                <Image source={getFlagSource(item.iso2)} style={styles.flag} />
                                <Text style={styles.optionName}>{item.name}</Text>
                                <Text style={styles.optionDial}>{item.dial}</Text>
                            </Pressable>
                        );
                    }}
                    ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
                    contentContainerStyle={{ paddingHorizontal: spacing[12], paddingBottom: spacing[12] }}
                />
            </BottomSheetModal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { width: '100%' },
    label: {
        color: colors.primary,
        marginBottom: spacing[4],
    },
    optional: {
        fontFamily: fontFamily.poppinsRegular,
        color: colors.neutral700,
    },
    inputWrap: {
        borderWidth: 1,
        borderColor: colors.neutral400,
        backgroundColor: colors.white,
        borderRadius: radius.r8,
        paddingHorizontal: spacing[16],
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        // ...shadow(0),
    },
    inputWrapDisabled: {
        backgroundColor: colors.neutral201,
        borderColor: colors.neutral200,
    },
    inputWrapFocused: {
        borderColor: colors.primary,
    },
    inputWrapError: {
        borderColor: colors.error,
    },
    countryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingRight: spacing[8],
    },
    flag: {
        width: 18,
        height: 12,
        borderRadius: 2,
    },
    dial: {
        fontFamily: fontFamily.poppinsRegular,
        fontSize: fontSize.s14,
        color: colors.primary,
        marginHorizontal: 6,
    },
    divider: {
        width: 1,
        height: 22,
        backgroundColor: colors.neutral300,
        marginHorizontal: 10,
    },
    input: {
        flex: 1,
        fontFamily: fontFamily.poppinsRegular,
        fontSize: fontSize.s14,
        color: colors.black,
        letterSpacing: 0.3,
        // paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing[6],
    },
    messageText: {
        fontFamily: fontFamily.poppinsRegular,
        fontSize: fontSize.s12,
        color: colors.neutral700,
    },
    // Modal
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.25)',
    },
    modalCard: {
        position: 'absolute',
        left: spacing[16],
        right: spacing[16],
        top: '20%',
        maxHeight: '60%',
        backgroundColor: colors.white,
        borderRadius: radius.r16,
        padding: spacing[12],
        ...shadow(2),
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing[8],
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing[16],
        paddingVertical: spacing[10],
    },
    modalTitle: {
        fontFamily: fontFamily.poppinsSemiBold,
        fontSize: fontSize.s16,
        color: colors.primary70,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: spacing[10],
        paddingVertical: spacing[8],
        borderRadius: radius.r8,
    },
    optionActive: {
        backgroundColor: colors.secondary05,
    },
    optionName: {
        flex: 1,
        fontFamily: fontFamily.poppinsRegular,
        fontSize: fontSize.s14,
        color: colors.primary70,
    },
    optionDial: {
        fontFamily: fontFamily.poppinsRegular,
        fontSize: fontSize.s14,
        color: colors.neutral700,
    },
});