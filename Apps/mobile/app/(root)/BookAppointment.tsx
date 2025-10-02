import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import doctorService from '../../src/services/doctorService';
import appointmentService from '../../src/services/appointmentService';
import { colors, fontFamily, fontSize, spacing, radius, shadow } from '../../src/styles/tokens';
import CustomText from '../../src/components/CustomText';
import CustomInput from '../../src/components/CustomInput';

type BookAppointmentRouteProp = RouteProp<RootStackParamList, 'BookAppointment'>;

interface Workplace {
  id: string;
  workplace_name: string;
  workplace_type: string;
  address: string;
  phone_number: string;
  consultation_fee: number;
  available_days: string[];
  working_hours: any;
}

interface Doctor {
  id: string;
  user: {
    name: string;
    profile_picture_url?: string;
  };
  specialization: string;
  rating: number;
  total_reviews: number;
}

interface AppointmentSlot {
  id: string;
  start_time: string;
  end_time: string;
  day_of_week: string;
  is_available: boolean;
  slot_duration: number;
}

const { width } = Dimensions.get('window');

const BookAppointment: React.FC = () => {
  const route = useRoute<BookAppointmentRouteProp>();
  const navigation = useNavigation();
  const { doctorId, workplaceId } = route.params;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [workplace, setWorkplace] = useState<Workplace | null>(null);
  const [appointmentSlots, setAppointmentSlots] = useState<Record<string, AppointmentSlot[]>>({});
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      // Load doctor and workplace data in parallel
      const [doctorData, workplaceData] = await Promise.all([
        doctorService.getDoctorById(doctorId),
        doctorService.getDoctorWorkplaces(doctorId)
      ]);

      if (doctorData.success && doctorData.data) {
        setDoctor(doctorData.data);
      }

      if (workplaceData.success && workplaceData.data) {
        const foundWorkplace = workplaceData.data.find((wp: Workplace) => wp.id === workplaceId);
        if (foundWorkplace) {
          setWorkplace(foundWorkplace);
          setSelectedDay(foundWorkplace.available_days?.[0] || '');
        }
      }

      // Load appointment slots for the next 7 days
      if (workplaceId) {
        const slotsData = await doctorService.getAppointmentSlotsByWorkplace(doctorId, workplaceId);
        if (slotsData.success && slotsData.data) {
          setAppointmentSlots(slotsData.data);
        }
      }

    } catch (err) {
      console.error('Error loading booking data:', err);
      setError('Failed to load booking information. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [doctorId, workplaceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const loadSlotsForDate = useCallback(async (date: string) => {
    try {
      console.log('Loading slots for date:', date);
      const slotsData = await doctorService.getAppointmentSlotsByWorkplace(doctorId, workplaceId, date);
      if (slotsData.success && slotsData.data) {
        setAppointmentSlots(slotsData.data);
      }
    } catch (error) {
      console.error('Error loading slots for date:', error);
    }
  }, [doctorId, workplaceId]);

  const shouldShowProfilePicture = (profilePictureUrl?: string) => {
    return profilePictureUrl && 
           profilePictureUrl !== '' && 
           profilePictureUrl !== 'null' && 
           !profilePictureUrl.includes('placeholder') &&
           !profilePictureUrl.includes('default');
  };

  const getWorkplaceTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'hospital':
        return 'hospital-building';
      case 'clinic':
        return 'medical-bag';
      case 'home_visit':
        return 'home';
      case 'online':
        return 'video';
      default:
        return 'medical-bag';
    }
  };

  const getWorkplaceTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'hospital':
        return colors.error;
      case 'clinic':
        return colors.primary;
      case 'home_visit':
        return colors.success;
      case 'online':
        return colors.secondary;
      default:
        return colors.primary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAvailableSlotsForDay = (day: string) => {
    return appointmentSlots[day] || [];
  };

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
  };

  const handleBookAppointment = async () => {
    if (!selectedTimeSlot || !selectedDate) {
      Alert.alert('Missing Information', 'Please select a date and time slot.');
      return;
    }

    try {
      setBooking(true);
      
      // Find the selected slot
      const slots = getAvailableSlotsForDay(selectedDay);
      const selectedSlot = slots.find(slot => 
        `${slot.start_time}-${slot.end_time}` === selectedTimeSlot
      );

      if (!selectedSlot) {
        Alert.alert('Error', 'Selected time slot is no longer available.');
        return;
      }

      // Create appointment using the same format as WhatsApp bot
      const appointmentData = {
        doctorId: doctorId,
        appointment_date: selectedDate,
        appointment_time: selectedSlot.start_time,
        symptoms: `Booked via mobile app for ${workplace?.workplace_name || 'clinic'}`
      };

      const result = await appointmentService.createAppointment(appointmentData);
      
      if (result.success) {
        Alert.alert(
          'Appointment Booked!',
          `Your appointment with Dr. ${doctor?.user?.name} has been successfully booked for ${formatDate(selectedDate)} at ${selectedTimeSlot}.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Booking Failed', result.message || 'Failed to book appointment. Please try again.');
      }

    } catch (err) {
      console.error('Error booking appointment:', err);
      Alert.alert('Booking Failed', 'Failed to book appointment. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  const renderWorkplaceDetails = () => (
    <View style={styles.workplaceCard}>
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.cardGradient}
      >
        <View style={styles.workplaceHeader}>
          <View style={styles.workplaceIcon}>
            <MaterialCommunityIcons
              name={getWorkplaceTypeIcon(workplace?.workplace_type || '') as any}
              size={24}
              color={getWorkplaceTypeColor(workplace?.workplace_type || '')}
            />
          </View>
          <View style={styles.workplaceInfo}>
            <CustomText style={styles.workplaceName}>
              {workplace?.workplace_name}
            </CustomText>
            <CustomText style={styles.workplaceType}>
              {workplace?.workplace_type?.replace(/_/g, ' ').toUpperCase()}
            </CustomText>
          </View>
          <View style={styles.feeContainer}>
            <CustomText style={styles.feeAmount}>
              ${workplace?.consultation_fee || 0}
            </CustomText>
            <CustomText style={styles.feeLabel}>Fee</CustomText>
          </View>
        </View>

        <View style={styles.workplaceDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="location" size={16} color={colors.neutral500} />
            <CustomText style={styles.detailText}>
              {workplace?.address || 'Address not available'}
            </CustomText>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="call" size={16} color={colors.neutral500} />
            <CustomText style={styles.detailText}>
              {workplace?.phone_number || 'Phone not available'}
            </CustomText>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={16} color={colors.neutral500} />
            <CustomText style={styles.detailText}>
              Available: {workplace?.available_days?.join(', ') || 'Not specified'}
            </CustomText>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderDoctorInfo = () => (
    <View style={styles.doctorCard}>
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.cardGradient}
      >
        <View style={styles.doctorInfo}>
          <View style={styles.avatarContainer}>
            {shouldShowProfilePicture(doctor?.user?.profile_picture_url) ? (
              <Image
                source={{ uri: doctor?.user?.profile_picture_url }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.defaultAvatar}>
                <MaterialCommunityIcons
                  name="account-circle"
                  size={40}
                  color={colors.primary}
                />
              </View>
            )}
          </View>
          
          <View style={styles.doctorDetails}>
            <CustomText style={styles.doctorName}>
              {doctor?.user?.name ? `Dr. ${doctor.user.name}` : 'Dr. Unknown'}
            </CustomText>
            <CustomText style={styles.specialization}>
              {doctor?.specialization}
            </CustomText>
            
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#fbbf24" />
              <CustomText style={styles.rating}>
                {doctor?.rating ? doctor.rating.toFixed(1) : '0.0'}
              </CustomText>
              <CustomText style={styles.reviews}>
                ({doctor?.total_reviews || 0} reviews)
              </CustomText>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderDaySelector = () => (
    <View style={styles.section}>
      <CustomText style={styles.sectionTitle}>Select Day</CustomText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysContainer}>
        {workplace?.available_days?.map((day) => {
          const isSelected = selectedDay === day;
          const slots = getAvailableSlotsForDay(day);
          return (
            <TouchableOpacity
              key={day}
              style={[styles.dayButton, isSelected && styles.selectedDayButton]}
              onPress={() => {
                setSelectedDay(day);
                setSelectedTimeSlot('');
              }}
            >
              <CustomText style={[styles.dayText, isSelected && styles.selectedDayText]}>
                {day}
              </CustomText>
              <CustomText style={[styles.slotCount, isSelected && styles.selectedSlotCount]}>
                {slots.length} slots
              </CustomText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderTimeSlots = () => {
    if (!selectedDate) return null;

    // Get the day of week for the selected date
    const selectedDateObj = new Date(selectedDate);
    const dayOfWeek = selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const slots = getAvailableSlotsForDay(dayOfWeek);
    
    return (
      <View style={styles.section}>
        <CustomText style={styles.sectionTitle}>Available Time Slots</CustomText>
        {slots.length === 0 ? (
          <View style={styles.noSlotsContainer}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={48}
              color={colors.neutral400}
            />
            <CustomText style={styles.noSlotsText}>
              No available slots for {dayOfWeek}
            </CustomText>
          </View>
        ) : (
          <View style={styles.slotsGrid}>
            {slots.map((slot) => {
              const timeSlot = `${slot.start_time}-${slot.end_time}`;
              const isSelected = selectedTimeSlot === timeSlot;
              const isAvailable = slot.is_available;
              
              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.slotButton,
                    isSelected && styles.selectedSlotButton,
                    !isAvailable && styles.disabledSlotButton
                  ]}
                  onPress={() => isAvailable && handleTimeSlotSelect(timeSlot)}
                  disabled={!isAvailable}
                >
                  <CustomText style={[
                    styles.slotText,
                    isSelected && styles.selectedSlotText,
                    !isAvailable && styles.disabledSlotText
                  ]}>
                    {slot.start_time}
                  </CustomText>
                  <CustomText style={[
                    styles.slotDuration,
                    isSelected && styles.selectedSlotText,
                    !isAvailable && styles.disabledSlotText
                  ]}>
                    {slot.slot_duration}min
                  </CustomText>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const renderDatePicker = () => {
    // Generate next 7 days for selection
    const getNext7Days = () => {
      const days = [];
      const today = new Date();
      for (let i = 1; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        days.push({
          date: date.toISOString().split('T')[0], // YYYY-MM-DD format
          display: date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
          })
        });
      }
      return days;
    };

    const availableDays = getNext7Days();

    return (
      <View style={styles.section}>
        <CustomText style={styles.sectionTitle}>Select Date</CustomText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysContainer}>
          {availableDays.map((day) => {
            const isSelected = selectedDate === day.date;
            return (
              <TouchableOpacity
                key={day.date}
                style={[styles.dayButton, isSelected && styles.selectedDayButton]}
                onPress={() => {
                  setSelectedDate(day.date);
                  setSelectedTimeSlot('');
                  // Load slots for the selected date
                  loadSlotsForDate(day.date);
                }}
              >
                <CustomText style={[styles.dayText, isSelected && styles.selectedDayText]}>
                  {day.display}
                </CustomText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderBookingButton = () => (
    <View style={styles.bookingSection}>
      <TouchableOpacity
        style={[
          styles.bookButton,
          (!selectedTimeSlot || !selectedDate || booking) && styles.disabledBookButton
        ]}
        onPress={handleBookAppointment}
        disabled={!selectedTimeSlot || !selectedDate || booking}
      >
        {booking ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <>
            <MaterialCommunityIcons name="calendar-check" size={20} color={colors.white} />
            <CustomText style={styles.bookButtonText}>
              Book Appointment - ${workplace?.consultation_fee || 0}
            </CustomText>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <CustomText style={styles.loadingText}>Loading booking information...</CustomText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <CustomText style={styles.headerTitle}>Book Appointment</CustomText>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={64}
            color={colors.error}
          />
          <CustomText style={styles.errorTitle}>Error Loading Data</CustomText>
          <CustomText style={styles.errorSubtitle}>{error}</CustomText>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <CustomText style={styles.retryButtonText}>Try Again</CustomText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <CustomText style={styles.headerTitle}>Book Appointment</CustomText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {renderDoctorInfo()}
        {renderWorkplaceDetails()}
        {renderDatePicker()}
        {renderTimeSlots()}
        {renderBookingButton()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.neutral600,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.error,
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: colors.neutral500,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  doctorCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  workplaceCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardGradient: {
    padding: 16,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  defaultAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.neutral100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  specialization: {
    fontSize: 14,
    color: colors.neutral600,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginLeft: 4,
  },
  reviews: {
    fontSize: 12,
    color: colors.neutral500,
    marginLeft: 4,
  },
  workplaceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  workplaceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workplaceInfo: {
    flex: 1,
  },
  workplaceName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  workplaceType: {
    fontSize: 12,
    color: colors.neutral500,
    fontWeight: '500',
  },
  feeContainer: {
    alignItems: 'flex-end',
  },
  feeAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.success,
  },
  feeLabel: {
    fontSize: 12,
    color: colors.neutral500,
  },
  workplaceDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.neutral600,
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 16,
  },
  dateInput: {
    marginBottom: 0,
  },
  daysContainer: {
    marginBottom: 16,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral300,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  selectedDayButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral700,
    marginBottom: 4,
  },
  selectedDayText: {
    color: colors.white,
  },
  slotCount: {
    fontSize: 12,
    color: colors.neutral500,
  },
  selectedSlotCount: {
    color: colors.white,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  slotButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral300,
    alignItems: 'center',
    minWidth: 80,
  },
  selectedSlotButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  disabledSlotButton: {
    backgroundColor: colors.neutral200,
    borderColor: colors.neutral300,
  },
  slotText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral700,
    marginBottom: 2,
  },
  selectedSlotText: {
    color: colors.white,
  },
  disabledSlotText: {
    color: colors.neutral400,
  },
  slotDuration: {
    fontSize: 12,
    color: colors.neutral500,
  },
  noSlotsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noSlotsText: {
    fontSize: 16,
    color: colors.neutral500,
    marginTop: 12,
    textAlign: 'center',
  },
  bookingSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  disabledBookButton: {
    backgroundColor: colors.neutral300,
  },
  bookButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BookAppointment;
