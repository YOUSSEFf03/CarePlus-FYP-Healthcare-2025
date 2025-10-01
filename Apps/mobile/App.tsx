import React, { useCallback, useEffect, useState } from 'react';
import { NavigationContainer, NavigatorScreenParams, } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { SignupDraftProvider } from './src/context/SignupDraftContext';
import { UserProvider, useUser } from "./src/store/UserContext";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import authService from './src/services/authService';

SplashScreen.preventAutoHideAsync();

import Login from './app/(auth)/login';
import Signup from './app/(auth)/signup';
import SignUpDetailsScreen from 'app/(auth)/signUpDetailsScreen';
import SignUpReviewScreen from 'app/(auth)/signUpReview';
import VerifyOtpScreen from 'app/(auth)/verifyOtp';
import PhoneLoginScreen from './app/(auth)/phoneLogin';
import VerifyPhoneOtpScreen from './app/(auth)/verifyPhoneOtp';

import Welcome from './app/(onboarding)/welcome';
import Onboarding from './app/(onboarding)/onboarding';

import Home from './app/(tabs)/home';
import TriageScreen1 from 'app/(tabs)/triageScreen';
import Profile from './app/(tabs)/profile';
import Notifications from './app/(tabs)/notifications';
// If you have more tab screens later, import them too, e.g.
// import Appointments from '../app/(tabs)/appointments';
// import Settings from '../app/(tabs)/settings';

// ====== navigator type definitions ======
export type RootStackParamList = {
    OnboardingStack: undefined;
    AuthStack: NavigatorScreenParams<AuthStackParamList>;
    Tabs: NavigatorScreenParams<TabsParamList>;
    Notifications: undefined;
    // ModalExample?: { id: string }; // add if you have modals
};

export type SignupDraft = {
    fullName: string;
    phone: string;
    email: string;
    dob?: string;
    gender: 'male' | 'female';
    history?: string;
};

export type AuthStackParamList = {
    Login: undefined;
    Signup: undefined;
    SignUpDetails:
    | {
        fullName?: string;
        phone?: string;
        email?: string;
    }
    | undefined;
    SignUpReview: { draft: SignupDraft };   // <— new
    VerifyOtp: { email: string; phone: string };
    PhoneLogin: undefined;
    VerifyPhoneOtp: { phone: string; loginType: string };
};

export type OnboardingStackParamList = {
    Welcome: undefined;
    Onboarding: undefined;
};

export type TabsParamList = {
    Home: undefined;
    VitaAI: undefined;
    Profile: undefined;
    Notifications: undefined;
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
            <AuthStack.Screen name="Signup" component={Signup} />
            <AuthStack.Screen name="SignUpDetails" component={SignUpDetailsScreen} />
            <AuthStack.Screen name="SignUpReview" component={SignUpReviewScreen} />
            <AuthStack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
            <AuthStack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
            <AuthStack.Screen name="VerifyPhoneOtp" component={VerifyPhoneOtpScreen} />
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

function TabsNavigator() {
    return (
        <Tab.Navigator id={undefined}
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    switch (route.name) {
                        case 'Home':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'VitaAI':
                            iconName = focused ? 'sparkles' : 'sparkles-outline';
                            break;
                        case 'Profile':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                        default:
                            iconName = 'ellipse';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#050f2a',
                tabBarInactiveTintColor: '#94a3b8',
                tabBarStyle: { height: 100, paddingTop: 6, paddingBottom: 24 },
                tabBarLabelStyle: { fontFamily: 'Poppins-Medium', fontSize: 12 },
            })}
        >
            <Tab.Screen
                name="Home"
                component={Home}
                options={{ title: 'Home' }}
            />
            <Tab.Screen
                name="VitaAI"
                component={TriageScreen1}
                options={{ title: 'Vita AI' }}
            />
            <Tab.Screen
                name="Profile"
                component={Profile}
                options={{ title: 'Profile' }}
            />
        </Tab.Navigator>
    );
}

function AppContent() {
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

    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const { user, setUser } = useUser();

    // Check for stored authentication on app start
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const authData = await authService.getStoredAuthData();
                if (authData) {
                    setUser({
                        id: authData.user.id,
                        name: authData.user.name,
                        age: authData.user.date_of_birth 
                            ? new Date().getFullYear() - new Date(authData.user.date_of_birth).getFullYear()
                            : 0,
                        sex: (authData.user.gender as 'male' | 'female') || 'unknown',
                        phone: authData.user.phone,
                        email: authData.user.email,
                        dateOfBirth: authData.user.date_of_birth,
                        medicalHistory: authData.user.medical_history,
                        role: authData.user.role,
                    });
                }
            } catch (error) {
                console.error('Auth check error:', error);
            } finally {
                setIsAuthChecked(true);
            }
        };

        checkAuth();
    }, [setUser]);

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded && isAuthChecked) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded, isAuthChecked]);

    if (!fontsLoaded || !isAuthChecked) return null;

    return (
        <NavigationContainer>
            <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
                <RootStack.Navigator
                    id={undefined}
                    initialRouteName={user ? "Tabs" : "AuthStack"}
                    screenOptions={{ headerShown: false }}
                >
                    <RootStack.Screen name="OnboardingStack" component={OnboardingNavigator} />
                    <RootStack.Screen name="AuthStack" component={AuthNavigator} />
                    <RootStack.Screen name="Tabs" component={TabsNavigator} />
                    <RootStack.Screen name="Notifications" component={Notifications} />
                </RootStack.Navigator>
            </View>
        </NavigationContainer>
    );
}

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
                <SafeAreaProvider>
                    <UserProvider>
                        <SignupDraftProvider>
                            <AppContent />
                        </SignupDraftProvider>
                    </UserProvider>
                </SafeAreaProvider>
            </BottomSheetModalProvider>
        </GestureHandlerRootView>
    );
}