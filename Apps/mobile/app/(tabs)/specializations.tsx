import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert, ActivityIndicator } from 'react-native';
import CustomText from '../../src/components/CustomText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize, spacing, radius, shadow } from '../../src/styles/tokens';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import doctorService, { Specialization } from '../../src/services/doctorService';
import { getSpecializationIcon } from '../../src/utils/specializationIcons';

type RootNav = NativeStackNavigationProp<RootStackParamList>;

export default function SpecializationsScreen() {
    const navigation = useNavigation<RootNav>();
    const [specializations, setSpecializations] = useState<Specialization[]>([]);
    const [filteredSpecializations, setFilteredSpecializations] = useState<Specialization[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);

    // Load all specializations on component mount
    useEffect(() => {
        loadSpecializations();
    }, []);

    // Filter specializations based on search query
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredSpecializations(specializations);
        } else {
            const filtered = specializations.filter(spec =>
                spec.specialization.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredSpecializations(filtered);
        }
    }, [searchQuery, specializations]);

    const loadSpecializations = async () => {
        try {
            setIsLoading(true);
            const data = await doctorService.getAllSpecializations();
            setSpecializations(data);
            setFilteredSpecializations(data);
        } catch (error) {
            console.error('Error loading specializations:', error);
            Alert.alert('Error', 'Failed to load specializations. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        
        if (query.trim() === '') {
            return;
        }

        try {
            setIsSearching(true);
            const data = await doctorService.searchSpecializations(query);
            setFilteredSpecializations(data);
        } catch (error) {
            console.error('Error searching specializations:', error);
            // Fallback to local filtering if search fails
            const filtered = specializations.filter(spec =>
                spec.specialization.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredSpecializations(filtered);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSpecializationPress = (specialization: Specialization) => {
        // Navigate to doctors list for this specialization
        navigation.navigate('DoctorsList' as any, { 
            specialization: specialization.specialization,
            doctorCount: specialization.count
        });
    };

    const renderSpecializationItem = ({ item }: { item: Specialization }) => (
        <TouchableOpacity 
            style={styles.specializationCard}
            onPress={() => handleSpecializationPress(item)}
            activeOpacity={0.8}
        >
            <View style={styles.specializationContent}>
                <View style={styles.specializationIcon}>
                    <MaterialCommunityIcons 
                        name={getSpecializationIcon(item.specialization) as any} 
                        size={24} 
                        color={colors.primary} 
                    />
                </View>
                <View style={styles.specializationInfo}>
                    <CustomText variant="text-body-lg-sb" style={styles.specializationName}>
                        {item.specialization}
                    </CustomText>
                    <CustomText variant="text-body-sm-r" style={styles.doctorCount}>
                        {item.count} Doctor{item.count !== 1 ? 's' : ''}
                    </CustomText>
                </View>
                <Ionicons 
                    name="chevron-forward" 
                    size={20} 
                    color={colors.neutral400} 
                />
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <MaterialCommunityIcons 
                name="stethoscope" 
                size={64} 
                color={colors.neutral300} 
            />
            <CustomText variant="text-body-lg-sb" style={styles.emptyTitle}>
                {searchQuery ? 'No specializations found' : 'No specializations available'}
            </CustomText>
            <CustomText variant="text-body-sm-r" style={styles.emptySubtitle}>
                {searchQuery 
                    ? 'Try searching with different keywords' 
                    : 'Check back later for available specializations'
                }
            </CustomText>
        </View>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safe}>
                <StatusBar style="dark" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <CustomText variant="text-body-md-r" style={styles.loadingText}>
                        Loading specializations...
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
                    Specializations
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
                        placeholder="Search specializations..."
                        placeholderTextColor={colors.neutral500}
                        value={searchQuery}
                        onChangeText={handleSearch}
                        returnKeyType="search"
                        autoCapitalize="none"
                        autoCorrect={false}
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

            {/* Specializations List */}
            <FlatList
                data={filteredSpecializations}
                keyExtractor={(item) => item.specialization}
                renderItem={renderSpecializationItem}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
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
    listContainer: {
        padding: spacing[20],
        paddingTop: spacing[8],
    },
    specializationCard: {
        backgroundColor: colors.white,
        borderRadius: radius.r16,
        padding: spacing[16],
        ...shadow(1),
    },
    specializationContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    specializationIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.neutral100,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing[16],
    },
    specializationInfo: {
        flex: 1,
    },
    specializationName: {
        color: colors.black,
        marginBottom: spacing[4],
    },
    doctorCount: {
        color: colors.neutral600,
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
