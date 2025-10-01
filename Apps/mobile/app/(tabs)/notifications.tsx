import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomText from '@/components/CustomText';
import Button from '@/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize, radius, shadow, spacing } from '@/styles/tokens';
import type { RootStackParamList } from '../../App';
import notificationService, { Notification } from '@/services/notificationService';

type RootNav = NativeStackNavigationProp<RootStackParamList>;

export default function NotificationsScreen() {
    const navigation = useNavigation<RootNav>();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            await notificationService.loadNotifications();
            const allNotifications = notificationService.getNotifications();
            const unread = notificationService.getUnreadCount();
            
            setNotifications(allNotifications);
            setUnreadCount(unread);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await notificationService.markAsRead(notificationId);
            await loadNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            await loadNotifications();
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const handleDeleteNotification = async (notificationId: string) => {
        Alert.alert(
            'Delete Notification',
            'Are you sure you want to delete this notification?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await notificationService.deleteNotification(notificationId);
                            await loadNotifications();
                        } catch (error) {
                            console.error('Error deleting notification:', error);
                        }
                    },
                },
            ]
        );
    };

    const handleClearAll = async () => {
        Alert.alert(
            'Clear All Notifications',
            'Are you sure you want to clear all notifications?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await notificationService.clearAllNotifications();
                            await loadNotifications();
                        } catch (error) {
                            console.error('Error clearing notifications:', error);
                        }
                    },
                },
            ]
        );
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success':
                return 'checkmark-circle';
            case 'warning':
                return 'warning';
            case 'error':
                return 'close-circle';
            default:
                return 'information-circle';
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'success':
                return colors.success;
            case 'warning':
                return colors.warning;
            case 'error':
                return colors.error;
            default:
                return colors.primary;
        }
    };

    const formatTimestamp = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor(diffInHours * 60);
            return `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const renderNotification = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[
                styles.notificationItem,
                !item.read && styles.unreadNotification
            ]}
            onPress={() => handleMarkAsRead(item.id)}
        >
            <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                    <View style={styles.notificationIconContainer}>
                        <Ionicons
                            name={getNotificationIcon(item.type) as any}
                            size={20}
                            color={getNotificationColor(item.type)}
                        />
                    </View>
                    <View style={styles.notificationTextContainer}>
                        <CustomText variant="text-body-md-m" style={styles.notificationTitle}>
                            {item.title}
                        </CustomText>
                        <CustomText variant="text-body-sm-r" style={styles.notificationMessage}>
                            {item.message}
                        </CustomText>
                    </View>
                    <View style={styles.notificationActions}>
                        <CustomText variant="text-body-xs-r" style={styles.timestamp}>
                            {formatTimestamp(item.timestamp)}
                        </CustomText>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteNotification(item.id)}
                        >
                            <Ionicons name="close" size={16} color={colors.neutral500} />
                        </TouchableOpacity>
                    </View>
                </View>
                {!item.read && <View style={styles.unreadDot} />}
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={64} color={colors.neutral400} />
            <CustomText variant="text-heading-H3" style={styles.emptyTitle}>
                No Notifications
            </CustomText>
            <CustomText variant="text-body-md-r" style={styles.emptyMessage}>
                You're all caught up! New notifications will appear here.
            </CustomText>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.safe}>
                <StatusBar style="dark" />
                <View style={styles.loadingContainer}>
                    <CustomText variant="text-body-md-r">Loading notifications...</CustomText>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar style="dark" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <CustomText variant="text-heading-H2" style={styles.headerTitle}>
                    Notifications
                </CustomText>
                {unreadCount > 0 && (
                    <Button
                        text="Mark All Read"
                        variant="tertiary"
                        onPress={handleMarkAllAsRead}
                        style={styles.markAllButton}
                    />
                )}
            </View>

            {/* Notifications List */}
            {notifications.length > 0 ? (
                <FlatList
                    data={notifications}
                    renderItem={renderNotification}
                    keyExtractor={(item) => item.id}
                    style={styles.notificationsList}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                renderEmptyState()
            )}

            {/* Clear All Button */}
            {notifications.length > 0 && (
                <View style={styles.clearAllContainer}>
                    <Button
                        text="Clear All Notifications"
                        variant="tertiary"
                        onPress={handleClearAll}
                        style={styles.clearAllButton}
                    />
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.white,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[24],
        paddingVertical: spacing[16],
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral200,
    },
    backButton: {
        marginRight: spacing[16],
    },
    headerTitle: {
        flex: 1,
        color: colors.primary,
        fontSize: fontSize[20],
        fontFamily: fontFamily.poppinsBold,
    },
    markAllButton: {
        paddingHorizontal: spacing[12],
        paddingVertical: spacing[8],
    },
    notificationsList: {
        flex: 1,
    },
    notificationItem: {
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral100,
    },
    unreadNotification: {
        backgroundColor: colors.primary05,
    },
    notificationContent: {
        padding: spacing[16],
        position: 'relative',
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    notificationIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.neutral100,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing[12],
    },
    notificationTextContainer: {
        flex: 1,
    },
    notificationTitle: {
        color: colors.primary,
        fontSize: fontSize[16],
        fontFamily: fontFamily.poppinsBold,
        marginBottom: spacing[4],
    },
    notificationMessage: {
        color: colors.neutral600,
        fontSize: fontSize[14],
        lineHeight: 20,
    },
    notificationActions: {
        alignItems: 'flex-end',
    },
    timestamp: {
        color: colors.neutral500,
        fontSize: fontSize[12],
        marginBottom: spacing[4],
    },
    deleteButton: {
        padding: spacing[4],
    },
    unreadDot: {
        position: 'absolute',
        top: spacing[16],
        right: spacing[16],
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing[32],
    },
    emptyTitle: {
        color: colors.primary,
        fontSize: fontSize[20],
        fontFamily: fontFamily.poppinsBold,
        marginTop: spacing[16],
        marginBottom: spacing[8],
    },
    emptyMessage: {
        color: colors.neutral600,
        fontSize: fontSize[16],
        textAlign: 'center',
        lineHeight: 24,
    },
    clearAllContainer: {
        padding: spacing[16],
        borderTopWidth: 1,
        borderTopColor: colors.neutral200,
    },
    clearAllButton: {
        borderColor: colors.error,
    },
});
