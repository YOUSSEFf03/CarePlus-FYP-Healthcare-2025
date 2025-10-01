import React from 'react';
import { View, StyleSheet } from 'react-native';
import CustomText from '../../src/components/CustomText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing } from '../../src/styles/tokens';
import type { RootStackParamList } from '../../App';

type DoctorsListRouteProp = RouteProp<RootStackParamList, 'DoctorsList'>;

export default function DoctorsListScreen() {
    const route = useRoute<DoctorsListRouteProp>();
    const { specialization, doctorCount } = route.params;

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar style="dark" />
            <View style={styles.container}>
                <CustomText variant="text-heading-H2" style={styles.title}>
                    {specialization}
                </CustomText>
                <CustomText variant="text-body-md-r" style={styles.subtitle}>
                    {doctorCount} Doctor{doctorCount !== 1 ? 's' : ''} available
                </CustomText>
                <CustomText variant="text-body-sm-r" style={styles.comingSoon}>
                    Doctors list coming soon...
                </CustomText>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.neutral100,
    },
    container: {
        flex: 1,
        padding: spacing[20],
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        color: colors.black,
        textAlign: 'center',
        marginBottom: spacing[8],
    },
    subtitle: {
        color: colors.neutral600,
        textAlign: 'center',
        marginBottom: spacing[32],
    },
    comingSoon: {
        color: colors.neutral500,
        textAlign: 'center',
    },
});
