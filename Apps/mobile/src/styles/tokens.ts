import { Platform } from 'react-native';

export const colors = {
    // Primary (Deep Navy)
    primary: '#050f2a',
    primary90: '#020612',
    primary80: '#030817',
    primary70: '#040b1e',
    primary60: '#050e26',
    primary40: '#373f55',
    primary30: '#585e70',
    primary20: '#8c919d',
    primary10: '#b2b5bd',
    primary05: '#e6e7ea',

    // Secondary (Sky Blue)
    secondary: '#7bbbff',
    secondary90: '#344f6b',
    secondary80: '#44678c',
    secondary70: '#5785b5',
    secondary60: '#70aae8',
    secondary40: '#95c9ff',
    secondary30: '#a7d1ff',
    secondary20: '#c2e0ff',
    secondary10: '#d6eaff',
    secondary05: '#f2f8ff',

    // Tertiary (Lavender Purple)
    tertiary: '#b8a9ff',
    tertiary90: '#4d476b',
    tertiary80: '#655d8c',
    tertiary70: '#8378b5',
    tertiary60: '#a79ae8',
    tertiary40: '#c6baff',
    tertiary30: '#cfc5ff',
    tertiary20: '#ded7ff',
    tertiary10: '#e9e4ff',
    tertiary05: '#f8f6ff',

    // Neutral
    black: '#1A1A1C',
    neutral1000: '#434344',
    neutral900: '#585859',
    neutral800: '#6D6D6D',
    neutral700: '#828282',
    neutral600: '#969696',
    neutral500: '#AAAAAA',
    neutral400: '#BFBFBF',
    neutral300: '#D3D3D3',
    neutral200: '#E8E8E8',
    neutral201: '#F2F2F2',
    neutral202: '#F5F5F5',
    neutral100: '#FCFCFC',
    white: '#FFFFFF',

    // Status
    success: '#139E4B',
    success90: '#002B16',
    success80: '#025227',
    success70: '#087839',
    success50: '#22C55E',
    success40: '#45D174',
    success30: '#6DDE8F',
    success20: '#98EBAE',
    success10: '#C8F7D3',
    success05: '#F0FFF3',

    warning: '#D45608',
    warning90: '#611B00',
    warning80: '#872B00',
    warning70: '#AD3D00',
    warning50: '#F97316',
    warning40: '#FF9640',
    warning30: '#FFB169',
    warning20: '#FFCA91',
    warning10: '#FFE0BA',
    warning05: '#FFF4E6',

    error: '#DC2626',
    error90: '#420109',
    error80: '#69020C',
    error70: '#8F0A13',
    error60: '#B5161B',
    error40: '#E8524D',
    error30: '#F58078',
    error20: '#FFAFA6',
    error10: '#FFD5CF',
    error05: '#FFF2F0',

    info: '#027FC2',
    info90: '#002B4F',
    info80: '#004475',
    info70: '#00609C',
    info50: '#0EA5E9',
    info40: '#36BFF5',
    info30: '#61D7FF',
    info20: '#8AE6FF',
    info10: '#B3F1FF',
    info05: '#E6FBFF',
};

// Gradients
export const gradients = {
    gradient1: { colors: [colors.secondary10, colors.secondary40], start: { x: 0, y: 0 }, end: { x: 1, y: 0 } },
    gradient2: { colors: [colors.secondary20, colors.secondary], start: { x: 0, y: 0 }, end: { x: 1, y: 0 } },
    gradientWarningWhite: { colors: [colors.warning05, colors.warning10], start: { x: 0, y: 0 }, end: { x: 1, y: 0 } },
    gradientApricotWhite: { colors: [colors.secondary, colors.secondary10], start: { x: 0, y: 0 }, end: { x: 0, y: 1 } },
    gradientTealWhite: { colors: [colors.tertiary, colors.tertiary10], start: { x: 0, y: 0 }, end: { x: 0, y: 1 } },
};

// Typography
export const fontFamily = {
    poppinsRegular: 'Poppins-Regular',
    redHatRegular: 'RedHatDisplay-Regular',
    poppinsBold: 'Poppins-Bold',
    poppinsSemiBold: 'Poppins-SemiBold',
    redHatMedium: 'RedHatDisplay-Medium',
    redHatSemiBold: 'RedHatDisplay-SemiBold',
    redHatBold: 'RedHatDisplay-Bold',
};

export const fontWeight = {
    w100: '100' as const,
    w200: '200' as const,
    w300: '300' as const,
    w400: '400' as const,
    w500: '500' as const,
    w600: '600' as const,
    w700: '700' as const,
    w800: '800' as const,
    w900: '900' as const,
};

export const fontSize = {
    s96: 96,
    s84: 84,
    s72: 72,
    s64: 64,
    s56: 56,
    s48: 48,
    s36: 36,
    s32: 32,
    s24: 24,
    s20: 20,
    s18: 18,
    s16: 16,
    s15: 15,
    s14: 14,
    s12: 12,
    s10: 10,
};

export const radius = {
    r4: 4,
    r8: 8,
    r12: 12,
    r16: 16,
    r24: 24,
    r50: 50,
    r100: 100,
    full: 9999,
};

export const spacing = {
    // gaps / paddings unified
    4: 4,
    6: 6,
    8: 8,
    10: 10,
    12: 12,
    14: 14,
    16: 16,
    20: 20,
    24: 24,
    32: 32,
    36: 36,
    48: 48,
    56: 56,
    64: 64,
    72: 72,
    80: 80,
    90: 90,
    100: 100,
    120: 120,
    150: 150,
};

// Cross-platform shadows
export const shadow = (level: 0 | 1 | 2 = 0) => {
    if (level === 0) {
        return Platform.select({
            ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
            android: { elevation: 2 },
            default: {},
        });
    }
    if (level === 1) {
        return Platform.select({
            ios: { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 8 } },
            android: { elevation: 4 },
            default: {},
        });
    }
    // level 2
    return Platform.select({
        ios: { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 15, shadowOffset: { width: 0, height: 8 } },
        android: { elevation: 6 },
        default: {},
    });
};

export const theme = {
    colors,
    gradients,
    fontFamily,
    fontWeight,
    fontSize,
    radius,
    spacing,
    shadow,
};

export type Theme = typeof theme;