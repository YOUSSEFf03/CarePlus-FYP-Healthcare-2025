import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Alert, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomText from '@/components/CustomText';
import Button from '@/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize, radius, shadow, spacing } from '@/styles/tokens';
import type { RootStackParamList } from '../../App';
import { useUser } from '@/store/UserContext';
import authService from '@/services/authService';

type RootNav = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
    const navigation = useNavigation<RootNav>();
    const { user, setUser } = useUser();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [pushNotifications, setPushNotifications] = useState(false);

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        setIsLoggingOut(true);
                        try {
                            // Clear stored auth data
                            await authService.clearAuthData();
                            
                            // Clear user context
                            setUser(null);
                            
                            // Navigate to login screen
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'AuthStack', params: { screen: 'Login' } }],
                            });
                        } catch (error) {
                            console.error('Logout error:', error);
                            Alert.alert('Error', 'Failed to logout. Please try again.');
                        } finally {
                            setIsLoggingOut(false);
                        }
                    },
                },
            ]
        );
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not provided';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return 'Not provided';
        }
    };

    const getAge = (dateOfBirth?: string) => {
        if (!dateOfBirth) return 'Not provided';
        try {
            const today = new Date();
            const birthDate = new Date(dateOfBirth);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age.toString();
        } catch {
            return 'Not provided';
        }
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <StatusBar style="dark" />
            
            {/* Header */}
            <View style={styles.header}>
                <CustomText variant="text-heading-H1" style={styles.headerTitle}>
                    Profile
                </CustomText>
                {/* <Pressable style={styles.heartIcon}>
                    <Ionicons name="heart" size={24} color={colors.primary} />
                </Pressable> */}
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Profile Information Section */}
                <View style={styles.section}>
                    <View style={styles.profileInfo}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                <CustomText variant="text-heading-H2" style={styles.avatarText}>
                                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                                </CustomText>
                            </View>
                        </View>
                        <View style={styles.userInfo}>
                            <CustomText variant="text-heading-H2" style={styles.userName}>
                                {user?.name || 'User Name'}
                            </CustomText>
                            <View style={styles.contactInfo}>
                                <View style={styles.contactItem}>
                                    <Ionicons name="call" size={16} color={colors.neutral600} />
                                    <CustomText variant="text-body-sm-r" style={styles.contactText}>
                                        {user?.phone || '+965 0257819'}
                                    </CustomText>
                                </View>
                                <View style={styles.contactItem}>
                                    <Ionicons name="mail" size={16} color={colors.neutral600} />
                                    <CustomText variant="text-body-sm-r" style={styles.contactText}>
                                        {user?.email || 'user@gmail.com'}
                                    </CustomText>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={styles.actionButtons}>
                        <Button
                            text="Edit profile"
                            variant="secondary"
                            onPress={() => {}}
                            style={styles.actionButton}
                        />
                        <Button
                            text="Share profile"
                            variant="secondary"
                            onPress={() => {}}
                            style={styles.actionButton}
                        />
                    </View>
                </View>

                {/* Settings Section */}
                <View style={styles.section}>
                    <CustomText variant="text-heading-H3" style={styles.sectionTitle}>
                        Settings
                    </CustomText>
                    <View style={styles.menuList}>
                        <MenuItem
                            icon="settings-outline"
                            title="Accessibilities"
                            onPress={() => {}}
                        />
                        <MenuItem
                            icon="shield-checkmark-outline"
                            title="Payment and payout"
                            onPress={() => {}}
                        />
                        <MenuItem
                            icon="language-outline"
                            title="Translation"
                            onPress={() => {}}
                        />
                        <MenuItem
                            icon="cash-outline"
                            title="Currency"
                            onPress={() => {}}
                        />
                        <MenuItem
                            icon="key-outline"
                            title="Reset password"
                            onPress={() => {}}
                        />
                    </View>
                </View>

                {/* Support Section */}
                <View style={styles.section}>
                    <CustomText variant="text-heading-H3" style={styles.sectionTitle}>
                        Support
                    </CustomText>
                    <View style={styles.menuList}>
                        <MenuItem
                            icon="home-outline"
                            title="About us"
                            onPress={() => {}}
                        />
                        <MenuItem
                            icon="document-text-outline"
                            title="Safety center"
                            onPress={() => {}}
                        />
                        <MenuItem
                            icon="headset-outline"
                            title="Contact us"
                            onPress={() => {}}
                        />
                        <MenuItem
                            icon="help-circle-outline"
                            title="Get help"
                            onPress={() => {}}
                        />
                        <MenuItem
                            icon="create-outline"
                            title="Give us feedback"
                            onPress={() => {}}
                        />
                    </View>
                </View>

                {/* Notifications Section */}
                <View style={styles.section}>
                    <CustomText variant="text-heading-H3" style={styles.sectionTitle}>
                        Notifications
                    </CustomText>
                    <View style={styles.menuList}>
                        <View style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <View style={styles.menuIconContainer}>
                                    <Ionicons name="notifications-outline" size={20} color={colors.neutral600} />
                                </View>
                                <CustomText variant="text-body-md-m" style={styles.menuItemTitle}>
                                    Push notifications
                                </CustomText>
                            </View>
                            <Switch
                                value={pushNotifications}
                                onValueChange={setPushNotifications}
                                trackColor={{ false: colors.neutral300, true: colors.primary }}
                                thumbColor={pushNotifications ? colors.white : colors.neutral500}
                            />
                        </View>
                    </View>
                </View>

                {/* Legal Section */}
                <View style={styles.section}>
                    <CustomText variant="text-heading-H3" style={styles.sectionTitle}>
                        Legal
                    </CustomText>
                    <View style={styles.menuList}>
                        <MenuItem
                            icon="document-outline"
                            title="Terms of service"
                            onPress={() => {}}
                        />
                        <MenuItem
                            icon="shield-outline"
                            title="Privacy policy"
                            onPress={() => {}}
                        />
                    </View>
                </View>

                {/* Logout Button */}
                <View style={styles.logoutSection}>
                    <Button
                        text={isLoggingOut ? "Logging out..." : "Logout"}
                        variant="tertiary"
                        onPress={handleLogout}
                        disabled={isLoggingOut}
                        style={styles.logoutButton}
                        textStyle={styles.logoutButtonText}
                        iconLeft={
                            <Ionicons 
                                name="log-out-outline" 
                                size={24} 
                                color={colors.error} 
                            />
                        }
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function MenuItem({ icon, title, onPress }: { icon: string; title: string; onPress: () => void }) {
    return (
        <Pressable style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                    <Ionicons name={icon as any} size={20} color={colors.neutral600} />
                </View>
                <CustomText variant="text-body-md-m" style={styles.menuItemTitle}>
                    {title}
                </CustomText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.neutral400} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    safe: { 
        flex: 1, 
        backgroundColor: colors.white,
        marginBottom: -46
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing[24],
        paddingTop: spacing[16],
        paddingBottom: spacing[8],
    },
    headerTitle: {
        color: colors.primary,
        fontSize: fontSize.s24,
        fontFamily: fontFamily.poppinsBold,
    },
    heartIcon: {
        padding: spacing[4],
    },
    container: {
        flex: 1,
        paddingHorizontal: spacing[24],
    },
    section: {
        marginBottom: spacing[32],
    },
    sectionTitle: {
        color: colors.primary,
        fontSize: fontSize[18],
        fontFamily: fontFamily.poppinsBold,
        marginBottom: spacing[16],
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing[20],
    },
    avatarContainer: {
        marginRight: spacing[16],
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.neutral200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: colors.primary,
        fontSize: fontSize[20],
        fontFamily: fontFamily.poppinsBold,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        color: colors.primary,
        fontSize: fontSize[20],
        fontFamily: fontFamily.poppinsBold,
        marginBottom: spacing[8],
    },
    contactInfo: {
        gap: spacing[4],
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[8],
    },
    contactText: {
        color: colors.neutral600,
        fontSize: fontSize[14],
    },
    actionButtons: {
        flexDirection: 'row',
        gap: spacing[12],
    },
    actionButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.primary,
        backgroundColor: 'transparent',
    },
    menuList: {
        backgroundColor: colors.white,
        borderRadius: radius.r12,
        overflow: 'hidden',
        // ...shadow(1),
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing[16],
        // paddingHorizontal: spacing[16],
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral200,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    menuIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.neutral100,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing[12],
    },
    menuItemTitle: {
        color: colors.primary,
        fontSize: fontSize[16],
        fontFamily: fontFamily.poppinsRegular,
    },
    logoutSection: {
        alignItems: 'flex-start',
        marginTop: spacing[8],
        marginBottom: spacing[32],
    },
    logoutButton: {
        borderColor: colors.error,
        backgroundColor: 'transparent',
    },
    logoutButtonText: {
        color: colors.error,
    },
});
