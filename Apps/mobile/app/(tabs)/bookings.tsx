import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import CustomText from '../../src/components/CustomText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize, spacing, radius, shadow } from '../../src/styles/tokens';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import appointmentService, { AppointmentWithDetails } from '../../src/services/appointmentService';
import { getSpecializationIcon } from '../../src/utils/specializationIcons';

type RootNav = NativeStackNavigationProp<RootStackParamList>;

export default function BookingsScreen() {
    const navigation = useNavigation<RootNav>();
    const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Load appointments when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadAppointments();
        }, [])
    );

    const loadAppointments = async () => {
        try {
            setIsLoading(true);
            const data = await appointmentService.getAllAppointments();
            setAppointments(data);
        } catch (error) {
            console.error('Error loading appointments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadAppointments();
        setRefreshing(false);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return colors.success;
            case 'PENDING':
                return colors.warning;
            case 'CANCELLED':
                return colors.error;
            case 'COMPLETED':
                return colors.neutral600;
            default:
                return colors.neutral500;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return 'checkmark-circle';
            case 'PENDING':
                return 'time';
            case 'CANCELLED':
                return 'close-circle';
            case 'COMPLETED':
                return 'checkmark-done';
            default:
                return 'help-circle';
        }
    };

    const renderAppointmentItem = ({ item }: { item: AppointmentWithDetails }) => (
        <TouchableOpacity 
            style={styles.appointmentCard}
            activeOpacity={0.8}
            onPress={() => {
                // Navigate to appointment details if needed
                console.log('Appointment pressed:', item.id);
            }}
        >
            <View style={styles.appointmentHeader}>
                <View style={styles.doctorInfo}>
                    <View style={styles.doctorAvatar}>
                        <MaterialCommunityIcons 
                            name={getSpecializationIcon(item.doctor?.specialization || '') as any} 
                            size={24} 
                            color={colors.primary} 
                        />
                    </View>
                    <View style={styles.doctorDetails}>
                        <CustomText variant="text-body-lg-sb" style={styles.doctorName}>
                            Dr. {item.doctor?.specialization || 'Unknown Doctor'}
                        </CustomText>
                        <CustomText variant="text-body-sm-r" style={styles.specialization}>
                            {item.doctor?.specialization || 'Unknown Specialization'}
                        </CustomText>
                        {item.workplace && (
                            <CustomText variant="text-body-xs-r" style={styles.workplace}>
                                {item.workplace.workplace_name}
                            </CustomText>
                        )}
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Ionicons 
                        name={getStatusIcon(item.status) as any} 
                        size={12} 
                        color={colors.white} 
                    />
                    <CustomText variant="text-body-xs-sb" style={styles.statusText}>
                        {item.status}
                    </CustomText>
                </View>
            </View>

            <View style={styles.appointmentDetails}>
                <View style={styles.dateTimeRow}>
                    <View style={styles.dateTimeItem}>
                        <Ionicons name="calendar-outline" size={16} color={colors.neutral600} />
                        <CustomText variant="text-body-sm-r" style={styles.dateTimeText}>
                            {formatDate(item.appointment_date)}
                        </CustomText>
                    </View>
                    <View style={styles.dateTimeItem}>
                        <Ionicons name="time-outline" size={16} color={colors.neutral600} />
                        <CustomText variant="text-body-sm-r" style={styles.dateTimeText}>
                            {formatTime(item.appointment_time)}
                        </CustomText>
                    </View>
                </View>

                {item.symptoms && (
                    <View style={styles.symptomsContainer}>
                        <CustomText variant="text-body-xs-r" style={styles.symptomsLabel}>
                            Symptoms:
                        </CustomText>
                        <CustomText variant="text-body-sm-r" style={styles.symptomsText} numberOfLines={2}>
                            {item.symptoms}
                        </CustomText>
                    </View>
                )}

                {item.consultation_fee && (
                    <View style={styles.feeContainer}>
                        <CustomText variant="text-body-sm-sb" style={styles.feeText}>
                            Consultation Fee: ${item.consultation_fee}
                        </CustomText>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <MaterialCommunityIcons 
                name="calendar-clock" 
                size={64} 
                color={colors.neutral300} 
            />
            <CustomText variant="text-body-lg-sb" style={styles.emptyTitle}>
                No Appointments Found
            </CustomText>
            <CustomText variant="text-body-sm-r" style={styles.emptySubtitle}>
                You don't have any appointments yet. Book an appointment with a doctor to get started.
            </CustomText>
            <TouchableOpacity 
                style={styles.bookAppointmentBtn}
                onPress={() => navigation.navigate('Home' as any)}
            >
                <CustomText variant="text-body-md-sb" style={styles.bookAppointmentText}>
                    Book Appointment
                </CustomText>
            </TouchableOpacity>
        </View>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safe}>
                <StatusBar style="dark" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <CustomText variant="text-body-md-r" style={styles.loadingText}>
                        Loading appointments...
                    </CustomText>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar style="dark" />
            
            {/* Header */}
            <View style={styles.header}>
                <CustomText variant="text-heading-H2" style={styles.headerTitle}>
                    My Bookings
                </CustomText>
            </View>

            {/* Appointments List */}
            <FlatList
                data={appointments}
                keyExtractor={(item) => item.id}
                renderItem={renderAppointmentItem}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptyState}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.neutral100,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing[16],
    },
    loadingText: {
        color: colors.neutral600,
    },
    header: {
        alignItems: 'center',
        paddingHorizontal: spacing[20],
        paddingVertical: spacing[16],
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral200,
    },
    headerTitle: {
        color: colors.black,
    },
    listContainer: {
        padding: spacing[20],
        paddingTop: spacing[8],
    },
    appointmentCard: {
        backgroundColor: colors.white,
        borderRadius: radius.r16,
        padding: spacing[16],
        ...shadow(1),
    },
    appointmentHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: spacing[12],
    },
    doctorInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
    },
    doctorAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.neutral100,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing[12],
    },
    doctorDetails: {
        flex: 1,
    },
    doctorName: {
        color: colors.black,
        marginBottom: spacing[2],
    },
    specialization: {
        color: colors.neutral600,
        marginBottom: spacing[2],
    },
    workplace: {
        color: colors.neutral500,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[8],
        paddingVertical: spacing[4],
        borderRadius: radius.r8,
        gap: spacing[4],
    },
    statusText: {
        color: colors.white,
        textTransform: 'uppercase',
    },
    appointmentDetails: {
        gap: spacing[8],
    },
    dateTimeRow: {
        flexDirection: 'row',
        gap: spacing[16],
    },
    dateTimeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[6],
    },
    dateTimeText: {
        color: colors.neutral700,
    },
    symptomsContainer: {
        marginTop: spacing[4],
    },
    symptomsLabel: {
        color: colors.neutral600,
        marginBottom: spacing[2],
    },
    symptomsText: {
        color: colors.neutral700,
    },
    feeContainer: {
        marginTop: spacing[4],
    },
    feeText: {
        color: colors.primary,
    },
    separator: {
        height: spacing[12],
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing[64],
    },
    emptyTitle: {
        color: colors.neutral700,
        marginTop: spacing[16],
        marginBottom: spacing[8],
    },
    emptySubtitle: {
        color: colors.neutral500,
        textAlign: 'center',
        paddingHorizontal: spacing[32],
        marginBottom: spacing[24],
    },
    bookAppointmentBtn: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing[24],
        paddingVertical: spacing[12],
        borderRadius: radius.r12,
    },
    bookAppointmentText: {
        color: colors.white,
    },
});
