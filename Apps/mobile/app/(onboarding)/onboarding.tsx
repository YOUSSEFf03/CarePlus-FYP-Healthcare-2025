// app/(onboarding)/onboarding.tsx
import { useRef, useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    useWindowDimensions,
    TouchableOpacity,
    StatusBar,
    Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';

type Slide = { key: string; image: any };
const SLIDES: Slide[] = [
    { key: '1', image: require('../../assets/images/OnBoarding-1.png') },
    { key: '2', image: require('../../assets/images/OnBoarding-2.png') },
    { key: '3', image: require('../../assets/images/OnBoarding-3.png') },
];

const SLIDE_DURATION = 4000;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');

export default function Onboarding() {
    const router = useRouter();
    const listRef = useRef<FlatList<Slide>>(null);
    const { width } = useWindowDimensions();     // still handy for progress bar width
    const insets = useSafeAreaInsets();

    const [index, setIndex] = useState(0);
    const progress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        (async () => {
            try {
                // edge-to-edge already on; these two are enough
                await NavigationBar.setButtonStyleAsync('light');
                await NavigationBar.setVisibilityAsync('visible');
            } catch { }
        })();
    }, []);

    const startProgress = useCallback(() => {
        progress.setValue(0);
        Animated.timing(progress, {
            toValue: 1,
            duration: SLIDE_DURATION,
            useNativeDriver: false,
        }).start(({ finished }) => {
            if (finished) goNext();
        });
    }, [progress]);

    const stopProgress = useCallback(() => {
        progress.stopAnimation();
    }, [progress]);

    const goNext = useCallback(() => {
        stopProgress();
        if (index < SLIDES.length - 1) {
            listRef.current?.scrollToIndex({ index: index + 1, animated: true });
        } else {
            router.replace('/(onboarding)/welcome');
        }
    }, [index, router, stopProgress]);

    const skip = useCallback(() => {
        stopProgress();
        router.replace('/(onboarding)/welcome');
    }, [router, stopProgress]);

    useEffect(() => {
        startProgress();
        return () => stopProgress();
    }, [index, startProgress, stopProgress]);

    return (
        <View style={{ flex: 1 }}>
            <StatusBar hidden />

            <FlatList
                ref={listRef}
                data={SLIDES}
                keyExtractor={(s) => s.key}
                horizontal
                pagingEnabled
                bounces={false}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                    <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
                        <Image
                            source={item.image}
                            style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
                            resizeMode="cover"
                        />
                    </View>
                )}
                // ✅ keep ONLY ONE of each:
                getItemLayout={(_, i) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * i, index: i })}
                onMomentumScrollEnd={(e) => {
                    const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                    if (i !== index) setIndex(i);
                }}
            />

            {/* Top: logo (left) + Skip (right) */}
            <View
                pointerEvents="box-none"
                style={{
                    position: 'absolute',
                    top: insets.top + 8,
                    left: 24,
                    right: 24,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Image source={require('../../assets/logo_primary.png')} style={{ width: 140, resizeMode: 'contain' }} />
                <View />
                <TouchableOpacity onPress={skip} hitSlop={12} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 16, color: '#050f2a' }}>Skip</Text>
                    <Ionicons name="play-forward-outline" size={18} style={{ color: '#050f2a', marginTop: 2 }} />
                </TouchableOpacity>
            </View>

            {/* Bottom-left: progress bars */}
            <View
                pointerEvents="box-none"
                style={{
                    position: 'absolute',
                    left: 24,
                    bottom: insets.bottom + 8 + 56 / 2,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                }}
            >
                {SLIDES.map((_, i) => {
                    const BAR_WIDTH = Math.min(width * 0.2, 84);
                    const BAR_HEIGHT = 6;

                    const filledWidth =
                        i < index
                            ? BAR_WIDTH
                            : i > index
                                ? 0
                                : progress.interpolate({ inputRange: [0, 1], outputRange: [0, BAR_WIDTH] });

                    return (
                        <View
                            key={i}
                            style={{
                                width: BAR_WIDTH,
                                height: BAR_HEIGHT,
                                borderRadius: BAR_HEIGHT / 2,
                                overflow: 'hidden',
                                backgroundColor: 'rgba(255,255,255,0.35)',
                            }}
                        >
                            <Animated.View
                                style={{ width: filledWidth, height: '100%', backgroundColor: '#373f55' }}
                            />
                        </View>
                    );
                })}
            </View>

            {/* Bottom-right: next button */}
            <View pointerEvents="box-none" style={{ position: 'absolute', right: 24, bottom: insets.bottom + 16 }}>
                <TouchableOpacity
                    onPress={goNext}
                    activeOpacity={0.8}
                    style={{
                        padding: 8,
                        borderRadius: 8,
                        backgroundColor: "#050f2a",
                        borderWidth: 2,
                        right: 4,
                        // borderColor: 'rgba(255,255,255,0.95)',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    hitSlop={10}
                >
                    <Ionicons name="chevron-forward" size={24} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}