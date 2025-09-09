import React, { useCallback } from 'react';
import { NavigationContainer, NavigatorScreenParams, } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { View } from 'react-native';

SplashScreen.preventAutoHideAsync();

// ====== import your existing screens from the expo-router folders ======
import Login from './app/(auth)/login';
// import Signup from './app/(auth)/signup';

import Welcome from './app/(onboarding)/welcome';
import Onboarding from './app/(onboarding)/onboarding';

// import Home from '../app/(tabs)/index';
// If you have more tab screens later, import them too, e.g.
// import Appointments from '../app/(tabs)/appointments';
// import Settings from '../app/(tabs)/settings';

// ====== navigator type definitions ======
export type RootStackParamList = {
    OnboardingStack: undefined;
    AuthStack: NavigatorScreenParams<AuthStackParamList>;
    Tabs: undefined;
    // ModalExample?: { id: string }; // add if you have modals
};

export type AuthStackParamList = {
    Login: undefined;
    // Signup: undefined;
};

export type OnboardingStackParamList = {
    Welcome: undefined;
    Onboarding: undefined;
};

export type TabsParamList = {
    // Home: undefined;
    // Appointments: undefined;
    // Settings: undefined;
};

// export type RootStackParamList = {
//     OnboardingStack: NavigatorScreenParams<OnboardingStackParamList>;
//     AuthStack: NavigatorScreenParams<AuthStackParamList>;
//     Tabs: NavigatorScreenParams<TabsParamList>;
// };

// ====== create navigators ======
const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const Tab = createBottomTabNavigator<TabsParamList>();

function AuthNavigator() {
    return (
        <AuthStack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="Login" component={Login} />
        </AuthStack.Navigator>
    );
}

function OnboardingNavigator() {
    return (
        <OnboardingStack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
            <OnboardingStack.Screen name="Onboarding" component={Onboarding} />
            <OnboardingStack.Screen name="Welcome" component={Welcome} />
        </OnboardingStack.Navigator>
    );
}

// function TabsNavigator() {
//     return (
//         <Tab.Navigator id={undefined} screenOptions={{ headerShown: false }}>
//             {/* tabs */}
//         </Tab.Navigator>
//     );
// }

export default function App() {
    const [fontsLoaded] = useFonts({
        'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
        'Poppins-Medium': require('./assets/fonts/Poppins-Medium.ttf'),
        'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
        'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
        'RedHatDisplay-Regular': require('./assets/fonts/RedHatDisplayRegular.ttf'),
        'RedHatDisplay-Medium': require('./assets/fonts/RedHatDisplayMedium.ttf'),
        'RedHatDisplay-SemiBold': require('./assets/fonts/RedHatDisplaySemiBold.ttf'),
        'RedHatDisplay-Bold': require('./assets/fonts/RedHatDisplayBold.ttf'),
    });

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) return null;

    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
                    <RootStack.Navigator
                        id={undefined}
                        initialRouteName="AuthStack"
                        screenOptions={{ headerShown: false }}
                    >
                        <RootStack.Screen name="OnboardingStack" component={OnboardingNavigator} />
                        <RootStack.Screen name="AuthStack" component={AuthNavigator} />
                        {/* <RootStack.Screen name="Tabs" component={TabsNavigator} /> */}
                    </RootStack.Navigator>
                </View>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}