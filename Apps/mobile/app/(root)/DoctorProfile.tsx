import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize, spacing, radius, shadow } from '../../src/styles/tokens';
import CustomText from '../../src/components/CustomText';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import doctorService from '../../src/services/doctorService';
import { getSpecializationIcon } from '../../src/utils/specializationIcons';

type DoctorProfileNav = NativeStackNavigationProp<RootStackParamList>;

interface DoctorWithUser {
  id: string;
  userId: string;
  specialization: string;
  license_number: string;
  verification_status: string;
  is_active: boolean;
  biography?: string;
  consultation_fee?: number;
  rating?: number;
  total_reviews?: number;
  total_patients?: number;
  user?: {
    id: string;
    name: string;
    email: string;
    profile_picture_url?: string;
  };
}

interface Workplace {
  id: string;
  workplace_name: string;
  workplace_type: 'clinic' | 'hospital' | 'private_practice' | 'medical_center' | 'home_visits';
  phone_number?: string;
  email?: string;
  description?: string;
  website?: string;
  consultation_fee?: number;
  working_hours?: any;
  available_days?: string[];
  addresses?: Array<{
    id: string;
    city: string;
    country: string;
    street: string;
  }>;
}

// Helper function to check if profile picture should be shown
const shouldShowProfilePicture = (profilePictureUrl: string | null | undefined): boolean => {
  if (!profilePictureUrl) return false;
  if (profilePictureUrl.trim() === '') return false;
  if (profilePictureUrl.includes('example.com')) return false;
  if (profilePictureUrl === 'null' || profilePictureUrl === 'undefined') return false;
  return true;
};

// Helper function to get workplace type icon
const getWorkplaceTypeIcon = (type: string) => {
  switch (type) {
    case 'clinic':
      return 'medical-bag';
    case 'hospital':
      return 'hospital-building';
    case 'private_practice':
      return 'office-building';
    case 'medical_center':
      return 'hospital-box';
    case 'home_visits':
      return 'home';
    default:
      return 'map-marker';
  }
};

// Helper function to get workplace type color
const getWorkplaceTypeColor = (type: string) => {
  switch (type) {
    case 'clinic':
      return colors.primary;
    case 'hospital':
      return colors.secondary;
    case 'private_practice':
      return '#F59E0B';
    case 'medical_center':
      return '#10B981';
    case 'home_visits':
      return '#8B5CF6';
    default:
      return colors.neutral500;
  }
};

export default function DoctorProfile() {
  const navigation = useNavigation<DoctorProfileNav>();
  const route = useRoute();
  const { doctorId } = route.params as { doctorId: string };

  const [doctor, setDoctor] = useState<DoctorWithUser | null>(null);
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedWorkplace, setSelectedWorkplace] = useState<Workplace | null>(null);

  useEffect(() => {
    loadDoctorProfile();
  }, [doctorId]);

  const loadDoctorProfile = async () => {
    try {
      setIsLoading(true);
      
      // Fetch doctor details and workplaces in parallel
      const [doctorData, workplacesData] = await Promise.all([
        doctorService.getDoctorById(doctorId),
        doctorService.getDoctorWorkplaces(doctorId)
      ]);
      
      if (doctorData) {
        setDoctor(doctorData);
        setWorkplaces(workplacesData || []);
      } else {
        Alert.alert('Error', 'Doctor not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading doctor profile:', error);
      Alert.alert('Error', 'Failed to load doctor profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadDoctorProfile();
    setIsRefreshing(false);
  };

  const handleWorkplaceSelect = (workplace: Workplace) => {
    setSelectedWorkplace(workplace);
    // Navigate to booking screen with selected workplace
    // navigation.navigate('Booking', { doctorId, workplaceId: workplace.id });
  };

  const handleBookAppointment = () => {
    if (!selectedWorkplace) {
      Alert.alert('Select Workplace', 'Please select a workplace to book an appointment.');
      return;
    }
    // Navigate to booking screen
    // navigation.navigate('Booking', { doctorId, workplaceId: selectedWorkplace.id });
    Alert.alert('Booking', `Booking appointment at ${selectedWorkplace.workplace_name}`);
  };

  const renderRatingSection = () => {
    if (!doctor?.rating) {
      return (
        <View style={styles.ratingSection}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={20} color={colors.neutral400} />
            <CustomText variant="text-body-md-r" style={styles.noReviewsText}>
              No reviews yet
            </CustomText>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.ratingSection}>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={20} color="#FACC15" />
          <CustomText variant="text-body-lg-sb" style={styles.ratingText}>
            {doctor.rating.toFixed(1)}
          </CustomText>
          <CustomText variant="text-body-sm-r" style={styles.reviewsCount}>
            ({doctor.total_reviews || 0} reviews)
          </CustomText>
        </View>
      </View>
    );
  };

  const renderWorkplaceCard = (workplace: Workplace) => (
    <TouchableOpacity
      key={workplace.id}
      style={[
        styles.workplaceCard,
        selectedWorkplace?.id === workplace.id && styles.selectedWorkplaceCard
      ]}
      onPress={() => handleWorkplaceSelect(workplace)}
      activeOpacity={0.8}
    >
      <View style={styles.workplaceHeader}>
        <View style={styles.workplaceIconContainer}>
          <MaterialCommunityIcons
            name={getWorkplaceTypeIcon(workplace.workplace_type) as any}
            size={24}
            color={getWorkplaceTypeColor(workplace.workplace_type)}
          />
        </View>
        <View style={styles.workplaceInfo}>
          <CustomText variant="text-body-lg-sb" style={styles.workplaceName}>
            {workplace.workplace_name}
          </CustomText>
          <CustomText variant="text-body-sm-r" style={styles.workplaceType}>
            {workplace.workplace_type.replace(/_/g, ' ').toUpperCase()}
          </CustomText>
        </View>
        {selectedWorkplace?.id === workplace.id && (
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        )}
      </View>

      {workplace.description && (
        <CustomText variant="text-body-sm-r" style={styles.workplaceDescription}>
          {workplace.description}
        </CustomText>
      )}

      {workplace.addresses && workplace.addresses.length > 0 && (
        <View style={styles.workplaceAddress}>
          <Ionicons name="location-outline" size={16} color={colors.neutral600} />
          <CustomText variant="text-body-sm-r" style={styles.addressText}>
            {workplace.addresses[0].street}, {workplace.addresses[0].city}
          </CustomText>
        </View>
      )}

      {workplace.available_days && workplace.available_days.length > 0 && (
        <View style={styles.availableDaysContainer}>
          <CustomText variant="text-body-sm-sb" style={styles.availableDaysTitle}>
            Available Days:
          </CustomText>
          <View style={styles.availableDaysList}>
            {workplace.available_days.map((day, index) => (
              <View key={index} style={styles.dayChip}>
                <CustomText variant="text-body-xs-r" style={styles.dayText}>
                  {day}
                </CustomText>
              </View>
            ))}
          </View>
        </View>
      )}

      {workplace.consultation_fee && (
        <View style={styles.consultationFeeContainer}>
          <CustomText variant="text-body-md-sb" style={styles.consultationFee}>
            ${workplace.consultation_fee}/consultation
          </CustomText>
        </View>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <CustomText variant="text-body-md-r" style={styles.loadingText}>
            Loading doctor profile...
          </CustomText>
        </View>
      </SafeAreaView>
    );
  }

  if (!doctor) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="doctor" size={64} color={colors.neutral400} />
          <CustomText variant="text-body-lg-sb" style={styles.errorTitle}>
            Doctor not found
          </CustomText>
          <CustomText variant="text-body-sm-r" style={styles.errorSubtitle}>
            The doctor you're looking for doesn't exist or has been removed.
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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        
        <CustomText variant="text-heading-H2" style={styles.headerTitle}>
          Doctor Profile
        </CustomText>
        
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary ?? '#1780df']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Doctor Info Section */}
        <View style={styles.doctorInfoSection}>
          <View style={styles.doctorAvatarContainer}>
            {shouldShowProfilePicture(doctor.user?.profile_picture_url) ? (
              <Image 
                source={{ uri: doctor.user.profile_picture_url }} 
                style={styles.doctorAvatar}
              />
            ) : (
              <View style={styles.defaultAvatarContainer}>
                <MaterialCommunityIcons 
                  name="account-circle" 
                  size={60} 
                  color={colors.primary} 
                />
              </View>
            )}
          </View>

          <View style={styles.doctorDetails}>
            <CustomText variant="text-heading-H3" style={styles.doctorName}>
              {doctor.user?.name ? `Dr. ${doctor.user.name}` : `Dr. ${doctor.specialization}`}
            </CustomText>
            
            <CustomText variant="text-body-lg-r" style={styles.doctorSpecialization}>
              {doctor.specialization}
            </CustomText>

            {renderRatingSection()}

            {doctor.biography && (
              <View style={styles.biographyContainer}>
                <CustomText variant="text-body-md-sb" style={styles.biographyTitle}>
                  About
                </CustomText>
                <CustomText variant="text-body-sm-r" style={styles.biographyText}>
                  {doctor.biography}
                </CustomText>
              </View>
            )}
          </View>
        </View>

        {/* Workplace Selection Section */}
        <View style={styles.workplaceSection}>
          <CustomText variant="text-heading-H4" style={styles.sectionTitle}>
            Choose a Workplace
          </CustomText>
          <CustomText variant="text-body-sm-r" style={styles.sectionSubtitle}>
            Select where you'd like to book your appointment
          </CustomText>

          {workplaces.map(renderWorkplaceCard)}
        </View>

        {/* Book Appointment Button */}
        <View style={styles.bookButtonContainer}>
          <TouchableOpacity
            style={[
              styles.bookButton,
              !selectedWorkplace && styles.bookButtonDisabled
            ]}
            onPress={handleBookAppointment}
            disabled={!selectedWorkplace}
            activeOpacity={0.8}
          >
            <CustomText variant="text-body-lg-sb" style={styles.bookButtonText}>
              {selectedWorkplace ? 'Book Appointment' : 'Select a Workplace First'}
            </CustomText>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[32],
  },
  errorTitle: {
    color: colors.neutral700,
    marginTop: spacing[16],
    marginBottom: spacing[8],
  },
  errorSubtitle: {
    color: colors.neutral500,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[20],
    paddingVertical: spacing[16],
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.black,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  doctorInfoSection: {
    backgroundColor: colors.white,
    padding: spacing[24],
    marginBottom: spacing[16],
  },
  doctorAvatarContainer: {
    alignItems: 'center',
    marginBottom: spacing[20],
  },
  doctorAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  defaultAvatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.neutral100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  doctorDetails: {
    alignItems: 'center',
  },
  doctorName: {
    color: colors.black,
    marginBottom: spacing[8],
    textAlign: 'center',
  },
  doctorSpecialization: {
    color: colors.neutral600,
    marginBottom: spacing[16],
    textAlign: 'center',
  },
  ratingSection: {
    marginBottom: spacing[20],
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingText: {
    color: colors.black,
    marginLeft: spacing[8],
  },
  reviewsCount: {
    color: colors.neutral600,
    marginLeft: spacing[4],
  },
  noReviewsText: {
    color: colors.neutral500,
    marginLeft: spacing[8],
  },
  biographyContainer: {
    width: '100%',
  },
  biographyTitle: {
    color: colors.black,
    marginBottom: spacing[8],
  },
  biographyText: {
    color: colors.neutral600,
    lineHeight: 20,
  },
  workplaceSection: {
    backgroundColor: colors.white,
    padding: spacing[24],
    marginBottom: spacing[16],
  },
  sectionTitle: {
    color: colors.black,
    marginBottom: spacing[8],
  },
  sectionSubtitle: {
    color: colors.neutral600,
    marginBottom: spacing[20],
  },
  workplaceCard: {
    backgroundColor: colors.neutral100,
    borderRadius: radius.r16,
    padding: spacing[16],
    marginBottom: spacing[12],
    borderWidth: 1,
    borderColor: colors.neutral200,
  },
  selectedWorkplaceCard: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary,
  },
  workplaceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[12],
  },
  workplaceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[12],
  },
  workplaceInfo: {
    flex: 1,
  },
  workplaceName: {
    color: colors.black,
    marginBottom: spacing[4],
  },
  workplaceType: {
    color: colors.neutral600,
  },
  workplaceDescription: {
    color: colors.neutral600,
    marginBottom: spacing[12],
    lineHeight: 18,
  },
  workplaceAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[12],
  },
  addressText: {
    color: colors.neutral600,
    marginLeft: spacing[8],
    flex: 1,
  },
  availableDaysContainer: {
    marginBottom: spacing[12],
  },
  availableDaysTitle: {
    color: colors.black,
    marginBottom: spacing[8],
  },
  availableDaysList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[8],
  },
  dayChip: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[6],
    borderRadius: radius.r16,
  },
  dayText: {
    color: colors.white,
  },
  consultationFeeContainer: {
    alignItems: 'flex-end',
  },
  consultationFee: {
    color: colors.primary,
  },
  bookButtonContainer: {
    padding: spacing[24],
    paddingBottom: spacing[32],
  },
  bookButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing[16],
    borderRadius: radius.r12,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: colors.neutral300,
  },
  bookButtonText: {
    color: colors.white,
  },
});
