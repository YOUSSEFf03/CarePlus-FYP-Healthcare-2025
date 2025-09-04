import { Stack } from 'expo-router';
import { useEffect, useCallback, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { View } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [appReady, setAppReady] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                // load any fonts/images you need before first paint
                await Font.loadAsync({
                    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
                    'RedHatDisplay-Regular': require('../assets/fonts/RedHatDisplayRegular.ttf'),
                    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
                    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
                    'RedHatDisplay-Medium': require('../assets/fonts/RedHatDisplayMedium.ttf'),
                    'RedHatDisplay-SemiBold': require('../assets/fonts/RedHatDisplaySemiBold.ttf'),
                    'RedHatDisplay-Bold': require('../assets/fonts/RedHatDisplayBold.ttf'),
                    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf')
                });
                // If you have images, you can prefetch them here too
            } finally {
                setAppReady(true);
            }
        })();
    }, []);

    const onLayoutRootView = useCallback(async () => {
        if (appReady) {
            await SplashScreen.hideAsync();
        }
    }, [appReady]);

    if (!appReady) return null;

    return (
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <Stack screenOptions={{ headerShown: false }} />
        </View>
    );
}