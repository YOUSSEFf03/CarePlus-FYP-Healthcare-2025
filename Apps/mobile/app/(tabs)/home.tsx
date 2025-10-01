import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, FlatList, Dimensions, NativeScrollEvent, NativeSyntheticEvent, Image, ScrollView, Alert } from 'react-native';
import CustomText from '../../src/components/CustomText';
import CustomInput from '@/components/CustomInput';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize, spacing, radius, shadow } from '../../src/styles/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { TabsParamList, RootStackParamList } from '../../App';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '@/store/UserContext';
import locationService from '@/services/locationService';
import notificationService from '@/services/notificationService';
import doctorService, { Specialization } from '@/services/doctorService';
import { getSpecializationIcon } from '@/utils/specializationIcons';
import appointmentService, { AppointmentWithDetails } from '@/services/appointmentService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FRAME_HORIZONTAL = spacing[16];
const FRAME_WIDTH = SCREEN_WIDTH - FRAME_HORIZONTAL * 2;
const FRAME_HEIGHT = 172;

// Helper function to check if profile picture should be shown
const shouldShowProfilePicture = (profilePictureUrl: string | null | undefined): boolean => {
    if (!profilePictureUrl) return false;
    if (profilePictureUrl.trim() === '') return false;
    if (profilePictureUrl.includes('example.com')) return false;
    if (profilePictureUrl === 'null' || profilePictureUrl === 'undefined') return false;
    return true;
};

const BANNERS = [
    { id: 'b1', image: require('../../assets/images/AD21-10.png') },
    { id: 'b2', image: require('../../assets/images/AD21-10.png') },
    { id: 'b3', image: require('../../assets/images/AD21-10.png') },
];


const APPOINTMENTS = [
    {
        id: 'a1',
        doctorName: 'Dr. Dwan Zeron',
        speciality: 'Orthopedist',
        rating: 4.2,
        time: '10:30 PM',
        date: '20 Jun 23',
        mode: 'online',
        avatar: { uri: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=256' },
        status: 'Upcoming',
    },
];


type RootNav = BottomTabNavigationProp<TabsParamList>;
type RootStackNav = NativeStackNavigationProp<RootStackParamList>;

export default function Home() {
    const navigation = useNavigation<RootNav>();
    const rootNavigation = useNavigation<RootStackNav>();
    const { user } = useUser();
    const [query, setQuery] = useState('');
    const insets = useSafeAreaInsets();
    const [page, setPage] = useState(0);
    const listRef = useRef<FlatList>(null);
    
    // Location and notification states
    const [currentAddress, setCurrentAddress] = useState<string>('Getting location...');
    const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [isLoadingLocation, setIsLoadingLocation] = useState(true);
    
    // Specializations state
    const [specializations, setSpecializations] = useState<Specialization[]>([]);
    const [isLoadingSpecializations, setIsLoadingSpecializations] = useState(true);
    
    // Appointments state
    const [upcomingAppointment, setUpcomingAppointment] = useState<AppointmentWithDetails | null>(null);
    const [isLoadingAppointment, setIsLoadingAppointment] = useState(true);
    
    // Doctors state
    const [topRatedDoctors, setTopRatedDoctors] = useState<any[]>([]);
    const [isLoadingTopRated, setIsLoadingTopRated] = useState(true);
    const [mostPopularDoctors, setMostPopularDoctors] = useState<any[]>([]);
    const [isLoadingMostPopular, setIsLoadingMostPopular] = useState(true);

    const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const x = e.nativeEvent.contentOffset.x;
        const p = Math.round(x / (SCREEN_WIDTH - spacing[32])); // account for side padding
        if (p !== page) setPage(p);
    }, [page]);

    // Initialize location, notifications, specializations, and appointments
    useEffect(() => {
        initializeLocation();
        loadNotifications();
        loadSpecializations();
        loadUpcomingAppointment();
        loadTopRatedDoctors();
        loadMostPopularDoctors();
    }, []);

    const initializeLocation = async () => {
        try {
            setIsLoadingLocation(true);
            
            // Check if we have stored location first
            const storedLocation = await locationService.getStoredLocation();
            if (storedLocation && storedLocation.address) {
                setCurrentAddress(storedLocation.address);
                setLocationPermissionGranted(true);
                setIsLoadingLocation(false);
                return;
            }

            // Request location permission
            const permissionGranted = await locationService.requestLocationPermission();
            setLocationPermissionGranted(permissionGranted);

            if (permissionGranted) {
                const location = await locationService.getCurrentLocation();
                if (location && location.address) {
                    setCurrentAddress(location.address);
                } else {
                    setCurrentAddress('Location not available');
                }
            } else {
                setCurrentAddress('Location permission required');
            }
        } catch (error) {
            console.error('Error initializing location:', error);
            setCurrentAddress('Error getting location');
        } finally {
            setIsLoadingLocation(false);
        }
    };

    const loadNotifications = async () => {
        try {
            await notificationService.loadNotifications();
            
            // Add sample notifications if none exist (for testing)
            const notifications = notificationService.getNotifications();
            if (notifications.length === 0) {
                await notificationService.addSampleNotifications();
            }
            
            const unreadCount = notificationService.getUnreadCount();
            setUnreadNotifications(unreadCount);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    const loadSpecializations = async () => {
        try {
            setIsLoadingSpecializations(true);
            const data = await doctorService.getTopSpecializations(6);
            setSpecializations(data);
        } catch (error) {
            console.error('Error loading specializations:', error);
            // Fallback to empty array if API fails
            setSpecializations([]);
        } finally {
            setIsLoadingSpecializations(false);
        }
    };

    const loadUpcomingAppointment = async () => {
        try {
            setIsLoadingAppointment(true);
            const appointment = await appointmentService.getNextUpcomingAppointment();
            setUpcomingAppointment(appointment);
        } catch (error) {
            console.error('Error loading upcoming appointment:', error);
            setUpcomingAppointment(null);
        } finally {
            setIsLoadingAppointment(false);
        }
    };

    const loadTopRatedDoctors = async () => {
        try {
            setIsLoadingTopRated(true);
            const doctors = await doctorService.getTopRatedDoctors(6);
            setTopRatedDoctors(doctors);
        } catch (error) {
            console.error('Error loading top rated doctors:', error);
            setTopRatedDoctors([]);
        } finally {
            setIsLoadingTopRated(false);
        }
    };

    const loadMostPopularDoctors = async () => {
        try {
            setIsLoadingMostPopular(true);
            const doctors = await doctorService.getMostPopularDoctors(6);
            setMostPopularDoctors(doctors);
        } catch (error) {
            console.error('Error loading most popular doctors:', error);
            setMostPopularDoctors([]);
        } finally {
            setIsLoadingMostPopular(false);
        }
    };

    const handleLocationPermissionRequest = () => {
        Alert.alert(
            'Location Permission Required',
            'This app needs location access to show your current address and provide location-based services. Please grant location permission to continue.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Grant Permission',
                    onPress: initializeLocation,
                },
            ]
        );
    };

    const handleNotificationPress = () => {
        rootNavigation.navigate('Notifications' as any);
    };

    const handleSpecializationPress = (specialization: Specialization) => {
        rootNavigation.navigate('DoctorsList' as any, { 
            specialization: specialization.specialization,
            doctorCount: specialization.count
        });
    };

    const handleSeeAllSpecializations = () => {
        rootNavigation.navigate('Specializations' as any);
    };

    const handleSeeAllAppointments = () => {
        // Navigate to Bookings tab
        navigation.navigate('Bookings' as any);
    };

    const handleDoctorPress = (doctor: any) => {
        rootNavigation.navigate('DoctorProfile', { doctorId: doctor.id });
    };

    const handleSeeAllTopRated = () => {
        // Navigate to Doctors screen with top rated filter
        rootNavigation.navigate('DoctorsList' as any, { 
            filter: 'top-rated'
        });
    };

    const handleSeeAllMostPopular = () => {
        // Navigate to Doctors screen with most popular filter
        rootNavigation.navigate('DoctorsList' as any, { 
            filter: 'most-popular'
        });
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

    const refreshLocation = async () => {
        if (!locationPermissionGranted) {
            handleLocationPermissionRequest();
            return;
        }

        try {
            setIsLoadingLocation(true);
            await locationService.refreshLocation();
            // Get the updated location after refresh
            const location = await locationService.getStoredLocation();
            if (location && location.address) {
                setCurrentAddress(location.address);
            }
        } catch (error) {
            console.error('Error refreshing location:', error);
        } finally {
            setIsLoadingLocation(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.pageContent}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled  // important for Android when you have inner horizontal lists
            >
                <LinearGradient
                    colors={[colors.secondary10, colors.neutral100]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.gradient}
                >
                    {/* Top row: address + notification bell */}
                    <View style={styles.topRow}>
                        <TouchableOpacity 
                            style={styles.leftBlock}
                            onPress={refreshLocation}
                            activeOpacity={0.7}
                        >
                            <View style={styles.locationContainer}>
                                <Ionicons 
                                    name="location-outline" 
                                    size={20} 
                                    color={locationPermissionGranted ? colors.primary : colors.neutral500} 
                                />
                                <View style={styles.addressContainer}>
                                    <CustomText variant="text-body-xs-r" style={styles.locationLabel}>
                                        Current Location
                                    </CustomText>
                                    <CustomText 
                                        variant="text-body-sm-m" 
                                        style={[
                                            styles.addressText,
                                            !locationPermissionGranted && styles.permissionRequiredText
                                        ]}
                                        numberOfLines={2}
                                    >
                                        {isLoadingLocation ? 'Getting location...' : currentAddress}
                                    </CustomText>
                                </View>
                                {isLoadingLocation && (
                                    <Ionicons name="refresh" size={16} color={colors.neutral500} />
                                )}
                            </View>
                        </TouchableOpacity>

                        {/* Notification Bell with unread indicator */}
                        <TouchableOpacity 
                            activeOpacity={0.8} 
                            style={styles.ghostIconBtn}
                            onPress={handleNotificationPress}
                        >
                            <Ionicons name="notifications-outline" size={24} color={colors.black} />
                            {unreadNotifications > 0 && (
                                <View style={styles.notificationBadge}>
                                    <CustomText variant="text-body-sm-m" style={styles.badgeText}>
                                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                    </CustomText>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Search field */}
                    <View style={styles.searchRow}>
                        <MaterialCommunityIcons
                            name="stethoscope"
                            size={24}
                            color={colors.neutral600}
                            style={{ marginRight: spacing[8] }}
                        />

                        <TouchableOpacity 
                            style={{ flex: 1 }} 
                            onPress={() => rootNavigation.navigate('DoctorSearch' as any)}
                            activeOpacity={0.7}
                        >
                            <TextInput
                                value={query}
                                onChangeText={setQuery}
                                placeholder="Find the right doctor for you"
                                placeholderTextColor={colors.neutral500}
                                style={styles.searchInput}
                                returnKeyType="search"
                                editable={false}
                                pointerEvents="none"
                                accessibilityLabel="Search doctors"
                            />
                        </TouchableOpacity>

                        {/* circular search button on the right */}
                        <TouchableOpacity activeOpacity={0.85} style={styles.searchIconBtn}>
                            <Ionicons name="search" size={24} color={colors.black} />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* Banners: single frame, inner horizontal pager of images */}
                <View style={styles.bannersSection}>
                    <View style={styles.bannerFrame}>
                        <FlatList
                            ref={listRef}
                            data={BANNERS}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            pagingEnabled
                            decelerationRate="fast"
                            removeClippedSubviews={false}
                            disableIntervalMomentum
                            snapToInterval={FRAME_WIDTH}
                            snapToAlignment="start"
                            onScroll={(e) => {
                                const x = e.nativeEvent.contentOffset.x;
                                const p = Math.round(x / FRAME_WIDTH);
                                if (p !== page) setPage(p);
                            }}
                            scrollEventThrottle={16}
                            style={{ width: FRAME_WIDTH, height: FRAME_HEIGHT }}
                            renderItem={({ item }) => (
                                <View style={styles.bannerSlide}>
                                    <Image source={item.image} style={styles.bannerImage} resizeMode="cover" />
                                </View>
                            )}
                            getItemLayout={(_, index) => ({
                                length: FRAME_WIDTH,
                                offset: FRAME_WIDTH * index,
                                index,
                            })}
                        />

                        {/* dots inside the frame */}
                        <View style={styles.dotsOverlay}>
                            {BANNERS.map((_, i) => (
                                <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
                            ))}
                        </View>
                    </View>
                </View>

                <View style={styles.specialsSection}>
                    <View style={styles.specialsHeader}>
                        <CustomText variant="text-heading-H3" style={styles.sectionTitle}>Specialities</CustomText>
                        <TouchableOpacity style={styles.seeAllBtn} hitSlop={8} onPress={handleSeeAllSpecializations}>
                            <CustomText variant="text-body-md-sb" style={styles.seeAll}>See All</CustomText>
                            <Ionicons name="chevron-forward" size={16} />
                        </TouchableOpacity>
                    </View>

                    {isLoadingSpecializations ? (
                        <View style={styles.loadingContainer}>
                            <CustomText variant="text-body-sm-r" style={styles.loadingText}>
                                Loading specializations...
                            </CustomText>
                        </View>
                    ) : (
                        <FlatList
                            data={specializations}
                            keyExtractor={(item) => item.specialization}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: spacing[16] }}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    activeOpacity={0.8} 
                                    style={styles.specCard} 
                                    onPress={() => handleSpecializationPress(item)}
                                >
                                    <View style={styles.specIconWrap}>
                                        <MaterialCommunityIcons 
                                            name={getSpecializationIcon(item.specialization) as any} 
                                            size={22} 
                                            color={colors.primary ?? '#0f172a'} 
                                        />
                                    </View>
                                    <CustomText numberOfLines={2} variant="text-body-md-sb" style={styles.specTitle}>
                                        {item.specialization}
                                    </CustomText>
                                    <CustomText variant="text-body-sm-r" style={styles.specCount}>
                                        {`${item.count} Doctor${item.count !== 1 ? 's' : ''}`}
                                    </CustomText>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>

                {/* ---------- UPCOMING APPOINTMENT ---------- */}
                {upcomingAppointment && (
                    <View style={styles.upcomingSection}>
                        <View style={styles.sectionHeaderRow}>
                            <CustomText variant="text-heading-H3" style={styles.sectionTitle}>Upcoming Appointment</CustomText>
                            <TouchableOpacity style={styles.seeAllBtn} hitSlop={8} onPress={handleSeeAllAppointments}>
                                <CustomText variant="text-body-md-sb" style={styles.seeAll}>See All</CustomText>
                                <Ionicons name="chevron-forward" size={16} />
                            </TouchableOpacity>
                        </View>

                        <View style={{ paddingHorizontal: spacing[16] }}>
                            <LinearGradient
                                colors={[colors.primary ?? '#1780df', colors.secondary30 ?? '#48c2c3']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.upCard}
                            >
                                {/* left: avatar */}
                                <View style={styles.upAvatar}>
                                    <MaterialCommunityIcons 
                                        name={getSpecializationIcon(upcomingAppointment.doctor?.specialization || '') as any} 
                                        size={24} 
                                        color="white" 
                                    />
                                </View>

                                {/* middle: text */}
                                <View style={styles.upContent}>
                                    <CustomText variant="text-heading-H4" style={styles.upName}>
                                        Dr. {upcomingAppointment.doctor?.specialization || 'Unknown Doctor'}
                                    </CustomText>
                                    <CustomText variant="text-body-sm-r" style={styles.upSpec}>
                                        {upcomingAppointment.doctor?.specialization || 'Unknown Specialization'}
                                    </CustomText>
                                    
                                    {upcomingAppointment.workplace && (
                                        <CustomText variant="text-body-xs-r" style={styles.upWorkplace}>
                                            {upcomingAppointment.workplace.workplace_name}
                                        </CustomText>
                                    )}

                                    {upcomingAppointment.doctor?.rating && (
                                        <View style={styles.upRatingRow}>
                                            <Ionicons name="star" size={12} color="#FACC15" />
                                            <CustomText variant="text-body-xs-r" style={styles.upRatingText}>
                                                {upcomingAppointment.doctor.rating.toFixed(1)}
                                            </CustomText>
                                        </View>
                                    )}

                                    {/* divider */}
                                    <View style={styles.upDivider} />

                                    {/* time + date */}
                                    <View style={styles.upTimeRow}>
                                        <Ionicons name="time-outline" size={14} color="white" style={{ marginRight: 6 }} />
                                        <CustomText variant="text-body-sm-r" style={styles.upTimeText}>
                                            {formatTime(upcomingAppointment.appointment_time)}  |  {formatDate(upcomingAppointment.appointment_date)}
                                        </CustomText>
                                    </View>
                                </View>

                                {/* right: action + status pill */}
                                <View style={styles.upRightCol}>
                                    <TouchableOpacity style={styles.upGhostBtn} activeOpacity={0.85}>
                                        <Ionicons name="videocam-outline" size={18} color={colors.black} />
                                    </TouchableOpacity>

                                    <View style={styles.upStatusPill}>
                                        <CustomText variant="text-body-xs-r" style={styles.upStatusText}>
                                            {upcomingAppointment.status}
                                        </CustomText>
                                    </View>
                                </View>
                            </LinearGradient>
                        </View>
                    </View>
                )}

                {isLoadingAppointment && (
                    <View style={styles.upcomingSection}>
                        <View style={styles.sectionHeaderRow}>
                            <CustomText variant="text-heading-H3" style={styles.sectionTitle}>Upcoming Appointment</CustomText>
                        </View>
                        <View style={styles.loadingContainer}>
                            <CustomText variant="text-body-sm-r" style={styles.loadingText}>
                                Loading appointment...
                            </CustomText>
                        </View>
                    </View>
                )}

                {/* ---------- TOP RATED DOCTORS ---------- */}
                <View style={styles.sectionBlock}>
                    <View style={styles.sectionHeaderRow}>
                        <CustomText variant="text-heading-H3" style={styles.sectionTitle}>Top Rated Doctors</CustomText>
                        <TouchableOpacity style={styles.seeAllBtn} hitSlop={8} onPress={handleSeeAllTopRated}>
                            <CustomText variant="text-body-md-sb" style={styles.seeAll}>See All</CustomText>
                            <Ionicons name="chevron-forward" size={16} />
                        </TouchableOpacity>
                    </View>

                    {isLoadingTopRated ? (
                        <View style={styles.loadingContainer}>
                            <CustomText variant="text-body-sm-r" style={styles.loadingText}>
                                Loading top rated doctors...
                            </CustomText>
                        </View>
                    ) : (
                        <FlatList
                            data={topRatedDoctors}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: spacing[16] }}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    activeOpacity={0.9} 
                                    style={styles.docCard}
                                    onPress={() => handleDoctorPress(item)}
                                >
                                    <View style={styles.docAvatar}>
                                        {shouldShowProfilePicture(item.user?.profile_picture_url) ? (
                                            <Image 
                                                source={{ uri: item.user.profile_picture_url }} 
                                                style={styles.docAvatarImage}
                                            />
                                        ) : (
                                            <View style={styles.defaultAvatarContainer}>
                                                <MaterialCommunityIcons 
                                                    name="account-circle" 
                                                    size={40} 
                                                    color={colors.neutral500} 
                                                />
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.docInfo}>
                                        <CustomText numberOfLines={1} variant="text-body-md-sb" style={styles.docName}>
                                            {item.user?.name ? `Dr. ${item.user.name}` : `Dr. ${item.specialization || 'Unknown Doctor'}`}
                                        </CustomText>
                                        <CustomText numberOfLines={1} variant="text-body-sm-r" style={styles.docSpec}>
                                            {item.specialization || 'Unknown Specialization'}
                                        </CustomText>
                                        {item.rating && (
                                            <View style={styles.docRatingRow}>
                                                <Ionicons name="star" size={14} color="#FACC15" />
                                                <CustomText variant="text-body-sm-r" style={styles.docRatingText}>
                                                    {item.rating.toFixed(1)}
                                                </CustomText>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>

                {/* ---------- MOST POPULAR DOCTORS ---------- */}
                <View style={styles.sectionBlock}>
                    <View style={styles.sectionHeaderRow}>
                        <CustomText variant="text-heading-H3" style={styles.sectionTitle}>Most Popular Doctors</CustomText>
                        <TouchableOpacity style={styles.seeAllBtn} hitSlop={8} onPress={handleSeeAllMostPopular}>
                            <CustomText variant="text-body-md-sb" style={styles.seeAll}>See All</CustomText>
                            <Ionicons name="chevron-forward" size={16} />
                        </TouchableOpacity>
                    </View>

                    {isLoadingMostPopular ? (
                        <View style={styles.loadingContainer}>
                            <CustomText variant="text-body-sm-r" style={styles.loadingText}>
                                Loading most popular doctors...
                            </CustomText>
                        </View>
                    ) : (
                        <FlatList
                            data={mostPopularDoctors}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: spacing[16] }}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    activeOpacity={0.9} 
                                    style={styles.docCard}
                                    onPress={() => handleDoctorPress(item)}
                                >
                                    <View style={styles.docAvatar}>
                                        {shouldShowProfilePicture(item.user?.profile_picture_url) ? (
                                            <Image 
                                                source={{ uri: item.user.profile_picture_url }} 
                                                style={styles.docAvatarImage}
                                            />
                                        ) : (
                                            <View style={styles.defaultAvatarContainer}>
                                                <MaterialCommunityIcons 
                                                    name="account-circle" 
                                                    size={40} 
                                                    color={colors.neutral500} 
                                                />
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.docInfo}>
                                        <CustomText numberOfLines={1} variant="text-body-md-sb" style={styles.docName}>
                                            {item.user?.name ? `Dr. ${item.user.name}` : `Dr. ${item.specialization || 'Unknown Doctor'}`}
                                        </CustomText>
                                        <CustomText numberOfLines={1} variant="text-body-sm-r" style={styles.docSpec}>
                                            {item.specialization || 'Unknown Specialization'}
                                        </CustomText>
                                        {item.rating && (
                                            <View style={styles.docRatingRow}>
                                                <Ionicons name="star" size={14} color="#FACC15" />
                                                <CustomText variant="text-body-sm-r" style={styles.docRatingText}>
                                                    {item.rating.toFixed(1)}
                                                </CustomText>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            </ScrollView>
        </SafeAreaView >
    );
}

/* ---------------- styles ---------------- */

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.neutral100 },
    gradient: {
        paddingHorizontal: spacing[20],
        paddingTop: spacing[16],
        paddingBottom: spacing[24],
        height: 160,
        // borderBottomLeftRadius: radius.r16,
        // borderBottomRightRadius: radius.r16,
    },
    container: {
        // paddingHorizontal: spacing[20],
        // paddingTop: spacing[8],
        // backgroundColor: colors.white,
        flex: 1,
    },
    pageContent: {
        paddingBottom: spacing[24],   // space after last section
        gap: spacing[12],             // vertical spacing between sections (optional)
    },

    /* top row */
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing[16],
    },
    leftBlock: { 
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center',
        marginRight: spacing[12],
    },

    locationContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: radius.r12,
        padding: spacing[12],
        ...shadow(1),
    },

    addressContainer: {
        flex: 1,
        marginLeft: spacing[8],
    },

    locationLabel: {
        color: colors.neutral500,
        fontSize: fontSize[12],
        marginBottom: spacing[2],
    },

    addressText: {
        color: colors.primary,
        fontSize: fontSize[14],
        fontFamily: fontFamily.poppinsSemiBold,
        lineHeight: 18,
    },

    permissionRequiredText: {
        color: colors.neutral500,
    },

    avatar: {
        width: 48,
        height: 48,
        display: 'flex',
        borderRadius: radius.r16,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },

    greeting: { marginLeft: spacing[12] },
    hello: { color: colors.neutral600, marginBottom: -4 },
    name: { color: colors.black },

    ghostIconBtn: {
        width: 48,
        height: 48,
        borderRadius: radius.r16,
        borderWidth: 1,
        borderColor: colors.neutral100,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
        position: 'relative',
    },

    notificationBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: colors.error,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing[4],
    },

    badgeText: {
        color: colors.white,
        fontSize: fontSize[10],
        fontFamily: fontFamily.poppinsBold,
    },

    /* search */
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: radius.r12,
        paddingHorizontal: spacing[12],
        height: 56,
        ...shadow(0),
    },
    searchInput: {
        flex: 1,
        paddingVertical: spacing[10],
        fontFamily: fontFamily.poppinsRegular,
        fontSize: fontSize.s14,
        color: colors.black,
    },

    searchIconBtn: {
        width: 40,
        height: 40,
        borderRadius: 50,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.neutral300,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: spacing[8],
    },

    /* banners */
    bannersSection: {
        // marginTop: spacing[12],
        marginHorizontal: spacing[16],
    },
    bannerFrame: {
        width: FRAME_WIDTH,
        height: 172,
        borderRadius: radius.r16,
        backgroundColor: colors.white,   // frame stays fixed; slides swap inside
        overflow: 'hidden',
        ...shadow(1),
    },

    bannerSlide: { width: FRAME_WIDTH, height: FRAME_HEIGHT },
    bannerImage: { width: '100%', height: '100%', objectFit: 'cover' },
    bannerCard: {
        width: SCREEN_WIDTH - spacing[32],     // full width minus side padding
        height: 172,
        borderRadius: radius.r16,
        padding: spacing[16],
        marginRight: spacing[12],
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        ...shadow(1),
    },
    bannerLeft: { flex: 1 },
    bannerRight: {
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: colors.white,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: colors.neutral200,
    },
    bannerTitle: { color: colors.black },
    bannerSubtitle: { color: colors.neutral600, marginTop: spacing[4] },

    dotsOverlay: {
        position: 'absolute',
        bottom: spacing[8],
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing[6],
        paddingHorizontal: spacing[12],
    },
    dotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing[8],
        gap: spacing[6],
    },
    dot: {
        width: 6, height: 6, borderRadius: 3,
        backgroundColor: colors.neutral300,
    },
    dotActive: {
        width: 16, borderRadius: 8,
        backgroundColor: colors.primary ?? '#2563eb',
    },

    specialsSection: {
        marginTop: spacing[16],
    },
    specialsHeader: {
        paddingHorizontal: spacing[16],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing[8],
    },
    sectionTitle: {
        color: colors.black,
    },
    seeAll: {
        color: colors.primary ?? '#0ea5e9',
    },
    seeAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[4],
    },

    specCard: {
        width: 140,
        paddingVertical: spacing[12],
        paddingHorizontal: spacing[12],
        marginRight: spacing[12],
        borderRadius: radius.r16,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.neutral200,
    },
    specIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: colors.neutral100,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing[10],
    },
    specTitle: {
        color: colors.black,
        lineHeight: 18,
    },
    specCount: {
        color: colors.neutral600,
        marginTop: spacing[6],
    },

    /* Upcoming Appointment */
    upcomingSection: {
        marginTop: spacing[16],
    },
    sectionHeaderRow: {
        paddingHorizontal: spacing[16],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing[8],
    },

    upCard: {
        width: SCREEN_WIDTH - spacing[32],
        height: 160,
        borderRadius: radius.r16,
        padding: spacing[12],
        paddingRight: spacing[12],
        marginRight: spacing[12],
        flexDirection: 'row',
        alignItems: 'center',
        // subtle texture feel – optional light overlay via opacity handled by gradient colors
        // ...shadow(1),
    },

    upAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
        marginRight: spacing[12],
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
    },

    upContent: {
        flex: 1,
    },

    upName: {
        color: 'white',
    },
    upSpec: {
        color: 'rgba(255,255,255,0.9)',
        marginTop: 2,
    },
    upWorkplace: {
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
        fontSize: fontSize[10],
    },
    upRatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: spacing[4],
    },
    upRatingText: {
        color: 'rgba(255,255,255,0.95)',
    },

    upDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(255,255,255,0.6)',
        marginVertical: spacing[8],
        marginRight: spacing[8],
    },

    upTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    upTimeText: {
        color: 'white',
    },

    upRightCol: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: '100%',
        paddingVertical: spacing[4],
    },

    upGhostBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    upStatusPill: {
        alignSelf: 'flex-end',
        backgroundColor: 'white',
        paddingHorizontal: spacing[10],
        paddingVertical: spacing[4],
        borderRadius: 999,
        marginTop: spacing[8],
    },
    upStatusText: {
        color: colors.black,
    },


    /* generic section wrapper for new lists */
    sectionBlock: {
        marginTop: spacing[16],
    },

    /* rectangular doctor card */
    docCard: {
        width: 280,
        height: 88,
        borderRadius: radius.r16,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.neutral200,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[12],
        marginRight: spacing[12],
        // ...shadow(0),
    },
    docAvatar: {
        width: 64,
        height: 64,
        borderRadius: 12,
        marginRight: spacing[12],
        backgroundColor: colors.neutral100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    docAvatarImage: {
        width: 64,
        height: 64,
        borderRadius: 12,
    },
    defaultAvatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 12,
        backgroundColor: colors.neutral100,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.neutral300,
    },
    docInfo: { flex: 1 },
    docName: { color: colors.black, marginBottom: -2 },
    docSpec: { color: colors.neutral600, marginBottom: -2 },
    docRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    docRatingText: { color: colors.neutral700 },

    loadingContainer: {
        paddingVertical: spacing[24],
        alignItems: 'center',
    },
    loadingText: {
        color: colors.neutral600,
    },

});