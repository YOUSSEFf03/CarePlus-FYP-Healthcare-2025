import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import doctorService from '../../src/services/doctorService';
import { colors, fontFamily, fontSize, spacing, radius, shadow } from '../../src/styles/tokens';
import CustomText from '../../src/components/CustomText';
import CustomInput from '../../src/components/CustomInput';

type DoctorsBySpecializationRouteProp = RouteProp<RootStackParamList, 'DoctorsBySpecialization'>;

interface Doctor {
  id: string;
  user: {
    name: string;
    profile_picture_url?: string;
  };
  specialization: string;
  rating: number;
  total_reviews: number;
  consultation_fee: number;
}

const DoctorsBySpecialization: React.FC = () => {
  const route = useRoute<DoctorsBySpecializationRouteProp>();
  const navigation = useNavigation();
  const { specialization } = route.params;

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadDoctors = useCallback(async () => {
    try {
      setError(null);
      const response = await doctorService.getDoctorsBySpecialization(specialization);
      
      if (response.success && response.data) {
        // Handle both array and object responses
        const doctorsData = Array.isArray(response.data) ? response.data : [];
        console.log('DoctorsBySpecialization: Received doctors data:', doctorsData);
        setDoctors(doctorsData);
        setFilteredDoctors(doctorsData);
      } else {
        setError('Failed to load doctors');
      }
    } catch (err) {
      console.error('Error loading doctors:', err);
      setError('Failed to load doctors. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [specialization]);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDoctors(doctors);
    } else {
      const filtered = doctors.filter(doctor =>
        doctor.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDoctors(filtered);
    }
  }, [searchQuery, doctors]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDoctors();
  }, [loadDoctors]);

  const handleDoctorPress = (doctor: Doctor) => {
    navigation.navigate('DoctorProfile', { doctorId: doctor.id });
  };

  const shouldShowProfilePicture = (profilePictureUrl?: string) => {
    return profilePictureUrl && 
           profilePictureUrl !== '' && 
           profilePictureUrl !== 'null' && 
           !profilePictureUrl.includes('placeholder') &&
           !profilePictureUrl.includes('default');
  };

  const renderDoctorCard = ({ item }: { item: Doctor }) => (
    <TouchableOpacity
      style={styles.doctorCard}
      onPress={() => handleDoctorPress(item)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.cardGradient}
      >
        <View style={styles.doctorInfo}>
          <View style={styles.avatarContainer}>
            {shouldShowProfilePicture(item.user?.profile_picture_url) ? (
              <Image
                source={{ uri: item.user?.profile_picture_url }}
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
              {item.user?.name ? `Dr. ${item.user.name}` : 'Dr. Unknown'}
            </CustomText>
            <CustomText style={styles.specialization}>
              {item.specialization}
            </CustomText>
            
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#fbbf24" />
              <CustomText style={styles.rating}>
                {item.rating ? item.rating.toFixed(1) : '0.0'}
              </CustomText>
              <CustomText style={styles.reviews}>
                ({item.total_reviews || 0} reviews)
              </CustomText>
            </View>
            
            {/* <View style={styles.feeContainer}>
              <CustomText style={styles.feeLabel}>Consultation Fee:</CustomText>
              <CustomText style={styles.feeAmount}>
                ${item.consultation_fee || 0}
              </CustomText>
            </View> */}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="doctor"
        size={64}
        color={colors.neutral400}
      />
      <CustomText style={styles.emptyTitle}>No Doctors Found</CustomText>
      <CustomText style={styles.emptySubtitle}>
        {searchQuery ? 
          `No doctors found for "${searchQuery}"` : 
          `No doctors found for ${specialization}. Try checking back later or contact support if this persists.`
        }
      </CustomText>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <MaterialCommunityIcons
        name="alert-circle"
        size={64}
        color={colors.error}
      />
      <CustomText style={styles.errorTitle}>Error Loading Doctors</CustomText>
      <CustomText style={styles.errorSubtitle}>{error}</CustomText>
      <TouchableOpacity style={styles.retryButton} onPress={loadDoctors}>
        <CustomText style={styles.retryButtonText}>Try Again</CustomText>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <CustomText style={styles.loadingText}>Loading doctors...</CustomText>
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
          <CustomText style={styles.headerTitle}>
            {specialization} Doctors
          </CustomText>
          <View style={styles.placeholder} />
        </View>
        {renderErrorState()}
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
        <CustomText style={styles.headerTitle}>
          {specialization} Doctors
        </CustomText>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchContainer}>
        <CustomInput
          placeholder="Search doctors by name or specialization..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Ionicons name="search" size={20} color={colors.neutral500} />}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.resultsHeader}>
        <CustomText style={styles.resultsCount}>
          {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} found
        </CustomText>
      </View>

      <FlatList
        data={filteredDoctors}
        renderItem={renderDoctorCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
  },
  searchInput: {
    marginBottom: 0,
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.neutral50,
  },
  resultsCount: {
    fontSize: 14,
    color: colors.neutral600,
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  doctorCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    marginBottom: 8,
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
  feeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feeLabel: {
    fontSize: 12,
    color: colors.neutral500,
  },
  feeAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
    marginLeft: 4,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral600,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.neutral500,
    textAlign: 'center',
    lineHeight: 20,
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
});

export default DoctorsBySpecialization;
