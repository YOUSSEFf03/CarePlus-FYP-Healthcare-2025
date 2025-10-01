import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  Image,
  RefreshControl,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize, spacing, radius, shadow } from '../../src/styles/tokens';
import CustomText from '../../src/components/CustomText';
import CustomInput from '../../src/components/CustomInput';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import doctorService from '../../src/services/doctorService';
import { getSpecializationIcon } from '../../src/utils/specializationIcons';

type DoctorSearchNav = NativeStackNavigationProp<RootStackParamList>;

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

// Helper function to check if profile picture should be shown
const shouldShowProfilePicture = (profilePictureUrl: string | null | undefined): boolean => {
  if (!profilePictureUrl) return false;
  if (profilePictureUrl.trim() === '') return false;
  if (profilePictureUrl.includes('example.com')) return false;
  if (profilePictureUrl === 'null' || profilePictureUrl === 'undefined') return false;
  return true;
};

export default function DoctorSearch() {
  const navigation = useNavigation<DoctorSearchNav>();
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState<DoctorWithUser[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<DoctorWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Load doctors when component mounts
  useEffect(() => {
    loadDoctors();
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      filterDoctors();
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [searchQuery, doctors]);


  const loadDoctors = async () => {
    try {
      setIsLoading(true);
      // Load all doctors initially (empty search)
      const doctors = await doctorService.searchDoctors('');
      setDoctors(doctors);
    } catch (error) {
      console.error('Error loading doctors:', error);
      Alert.alert('Error', 'Failed to load doctors. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterDoctors = useCallback(async () => {
    if (!searchQuery.trim()) {
      setFilteredDoctors(doctors);
      setIsSearching(false);
      return;
    }

    // For very short queries, use local filtering for better performance
    if (searchQuery.trim().length < 2) {
      const filtered = doctors.filter(doctor => {
        const nameMatch = doctor.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const specializationMatch = doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase());
        return nameMatch || specializationMatch;
      });
      setFilteredDoctors(filtered);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const searchResults = await doctorService.searchDoctors(searchQuery);
      setFilteredDoctors(searchResults);
    } catch (error) {
      console.error('Error searching doctors:', error);
      // Fallback to local filtering if API fails
      const filtered = doctors.filter(doctor => {
        const nameMatch = doctor.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const specializationMatch = doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase());
        return nameMatch || specializationMatch;
      });
      setFilteredDoctors(filtered);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, doctors]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadDoctors();
    setIsRefreshing(false);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleDoctorPress = (doctor: DoctorWithUser) => {
    navigation.navigate('DoctorProfile', { doctorId: doctor.id });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons 
        name="doctor" 
        size={64} 
        color={colors.neutral300} 
      />
      <CustomText variant="text-body-lg-sb" style={styles.emptyTitle}>
        {searchQuery ? 'No doctors found' : 'No doctors available'}
      </CustomText>
      <CustomText variant="text-body-sm-r" style={styles.emptySubtitle}>
        {searchQuery 
          ? 'Try searching with different keywords' 
          : 'Check back later for available doctors'
        }
      </CustomText>
    </View>
  );

  const renderDoctorCard = ({ item }: { item: DoctorWithUser }) => (
    <TouchableOpacity 
      style={styles.doctorCard} 
      onPress={() => handleDoctorPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.doctorContent}>
        <View style={styles.doctorAvatar}>
          {shouldShowProfilePicture(item.user?.profile_picture_url) ? (
            <Image 
              source={{ uri: item.user.profile_picture_url }} 
              style={styles.doctorAvatarImage}
            />
          ) : (
            <MaterialCommunityIcons 
              name="account-circle" 
              size={24} 
              color={colors.primary} 
            />
          )}
        </View>

        <View style={styles.doctorInfo}>
          <CustomText variant="text-body-lg-sb" style={styles.doctorName}>
            {item.user?.name ? `Dr. ${item.user.name}` : `Dr. ${item.specialization || 'Unknown Doctor'}`}
          </CustomText>
          
          <CustomText variant="text-body-sm-r" style={styles.doctorSpecialization}>
            {item.specialization}
          </CustomText>

          {item.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FACC15" />
              <CustomText variant="text-body-sm-r" style={styles.ratingText}>
                {`${item.rating.toFixed(1)} (${item.total_reviews || 0} reviews)`}
              </CustomText>
            </View>
          )}

          {item.consultation_fee && (
            <CustomText variant="text-body-sm-sb" style={styles.consultationFee}>
              {`$${item.consultation_fee}/consultation`}
            </CustomText>
          )}
        </View>

        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={colors.neutral400} 
        />
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <CustomText variant="text-body-md-r" style={styles.loadingText}>
            Loading doctors...
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
          Find Doctor
        </CustomText>
        
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons 
            name="search" 
            size={20} 
            color={colors.neutral500} 
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by doctor name or specialization..."
            placeholderTextColor={colors.neutral500}
            value={searchQuery}
            onChangeText={handleSearchChange}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          {isSearching && (
            <ActivityIndicator 
              size="small" 
              color={colors.primary} 
              style={styles.searchLoader}
            />
          )}
        </View>
      </View>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <CustomText variant="text-body-md-sb" style={styles.resultsCount}>
          {`${filteredDoctors.length} doctor${filteredDoctors.length !== 1 ? 's' : ''} found`}
        </CustomText>
      </View>

      {/* Doctors List */}
      <FlatList
        data={filteredDoctors}
        keyExtractor={(item) => item.id}
        renderItem={renderDoctorCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary ?? '#1780df']}
          />
        }
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  searchContainer: {
    paddingHorizontal: spacing[20],
    paddingVertical: spacing[16],
    backgroundColor: colors.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral100,
    borderRadius: radius.r12,
    paddingHorizontal: spacing[16],
    height: 48,
  },
  searchIcon: {
    marginRight: spacing[12],
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize[16],
    fontFamily: fontFamily.poppinsRegular,
    color: colors.black,
  },
  searchLoader: {
    marginLeft: spacing[8],
  },
  resultsHeader: {
    paddingHorizontal: spacing[20],
    paddingVertical: spacing[8],
    backgroundColor: colors.white,
  },
  resultsCount: {
    color: colors.neutral600,
  },
  listContainer: {
    padding: spacing[20],
    paddingTop: spacing[8],
  },
  doctorCard: {
    backgroundColor: colors.white,
    borderRadius: radius.r16,
    padding: spacing[16],
    ...shadow(1),
  },
  doctorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.neutral100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[16],
  },
  doctorAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    color: colors.black,
    marginBottom: spacing[4],
  },
  doctorSpecialization: {
    color: colors.neutral600,
    marginBottom: spacing[4],
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  ratingText: {
    color: colors.neutral700,
    marginLeft: spacing[4],
  },
  consultationFee: {
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
  },
});
